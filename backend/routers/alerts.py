from fastapi import APIRouter
import httpx
import math
import xml.etree.ElementTree as ET

router = APIRouter(prefix="/api/alerts", tags=["alerts"])

def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = math.sin(dLat/2) * math.sin(dLat/2) + math.cos(math.radians(lat1)) \
        * math.cos(math.radians(lat2)) * math.sin(dLon/2) * math.sin(dLon/2)
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

@router.get("")
async def get_alerts(lat: float, lng: float):
    alerts = []
    
    # 1. Try NWS (US only)
    async with httpx.AsyncClient() as c:
        try:
            r = await c.get(
                f"https://api.weather.gov/alerts/active",
                params={"point": f"{lat},{lng}"},
                headers={"User-Agent": "CrisisCompass/1.0"}
            )
            r.raise_for_status()
            data = r.json()
            alerts = data.get("features", [])
        except Exception:
            alerts = []

    formatted_alerts = []
    level = "low"
    
    # Map NWS severity -> DangerLevel
    severity_map = {
        "Extreme": "critical",
        "Severe": "high",
        "Moderate": "moderate",
        "Minor": "low",
        "Unknown": "low"
    }

    if alerts:
        def severity_index(severity):
            try:
                return ["Unknown", "Minor", "Moderate", "Severe", "Extreme"].index(severity)
            except ValueError:
                return 0

        worst = max(alerts, key=lambda a: severity_index(a.get("properties", {}).get("severity", "Minor")))
        level = severity_map.get(worst.get("properties", {}).get("severity"), "low")
        
        for a in alerts[:5]:
            props = a.get("properties", {})
            formatted_alerts.append({
                "title": props.get("headline", props.get("event", "Alert")),
                "severity": severity_map.get(props.get("severity"), "low"),
                "description": props.get("description", "")
            })
    else:
        # 2. Fallback to GDACS (Global)
        try:
            async with httpx.AsyncClient() as c:
                r = await c.get("https://www.gdacs.org/xml/rss.xml")
                root = ET.fromstring(r.text)
                
                gdacs_level_map = {"Red": "critical", "Orange": "high", "Green": "moderate"}
                gdacs_alerts = []
                
                for item in root.findall('./channel/item'):
                    point = item.find('{http://www.georss.org/georss}point')
                    if point is not None and point.text:
                        p_lat, p_lng = map(float, point.text.strip().split())
                        # If within 1000km, consider it relevant
                        if haversine(lat, lng, p_lat, p_lng) < 1000:
                            gdacs_alerts.append(item)
                
                if gdacs_alerts:
                    def gdacs_sev_index(item):
                        lvl = item.find('{http://www.gdacs.org}alertlevel')
                        lvl = lvl.text if lvl is not None else "Green"
                        return ["Green", "Orange", "Red"].index(lvl) if lvl in ["Green", "Orange", "Red"] else 0

                    worst_gdacs = max(gdacs_alerts, key=gdacs_sev_index)
                    worst_lvl = worst_gdacs.find('{http://www.gdacs.org}alertlevel')
                    worst_lvl = worst_lvl.text if worst_lvl is not None else "Green"
                    level = gdacs_level_map.get(worst_lvl, "moderate")
                    
                    for item in gdacs_alerts[:5]:
                        title = item.find('title')
                        desc = item.find('description')
                        alvl = item.find('{http://www.gdacs.org}alertlevel')
                        
                        title_text = title.text if title is not None else "GDACS Alert"
                        desc_text = desc.text if desc is not None else ""
                        alvl_text = alvl.text if alvl is not None else "Green"
                        
                        formatted_alerts.append({
                            "title": title_text,
                            "severity": gdacs_level_map.get(alvl_text, "moderate"),
                            "description": desc_text
                        })
        except Exception:
            pass

    return {
        "level": level,
        "alerts": formatted_alerts
    }
