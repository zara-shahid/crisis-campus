"""
Backend router: GET /api/locations?lat=&lng=
Queries OpenStreetMap Overpass API for real hospitals, clinics, and shelters
within radius_m metres of the user. Returns data shaped for the EmergencyMap
component, with deterministically generated capacity/occupancy so the UI bars
stay functional without a live bed-availability feed.
"""
from fastapi import APIRouter
import asyncio
import json
import math
import httpx

router = APIRouter(prefix="/api/locations", tags=["locations"])

OVERPASS_URL = "https://overpass-api.de/api/interpreter"
HEADERS = {"User-Agent": "CrisisCompass/1.0"}

# Amenities to query and how we map them to our frontend types
AMENITY_TYPE_MAP = {
    "hospital": "hospital",
    "clinic": "medpoint",
    "doctors": "medpoint",
    "social_facility": "shelter",
    "community_centre": "shelter",
}


def _det_occupancy(osm_id: int, capacity: int) -> int:
    """
    Deterministically generate a plausible occupancy number from the OSM ID
    so that the progress bars are stable across reloads but vary per location.
    This is clearly simulated data – the UI disclaimer says so.
    """
    seed = osm_id % 1000
    ratio = 0.2 + (seed / 1000) * 0.75   # 20 % – 95 %
    return min(capacity, int(capacity * ratio))


def _det_status(osm_id: int, capacity: int, occupied: int) -> str:
    pct = (occupied / capacity) * 100 if capacity else 0
    if pct >= 95:
        return "FULL"
    if osm_id % 17 == 0:   # ~6 % marked closed for realism
        return "CLOSED"
    return "OPEN"


def _det_amenities(amenity_type: str) -> list[str]:
    base = {
        "hospital": ["ER", "ICU", "Surgery", "Blood Bank"],
        "medpoint": ["Medical Aid", "First Aid", "Pharmacy"],
        "shelter": ["Water", "Food", "Restrooms"],
        "evac": ["Water", "Food", "WiFi", "Power"],
    }
    return base.get(amenity_type, ["Aid"])


def _parse_element(el: dict, type_str: str) -> dict | None:
    """Convert a raw Overpass element into a MapLocation dict."""
    tags = el.get("tags", {})

    # Coordinates: nodes have lat/lon directly; ways have a "center"
    if el["type"] == "node":
        lat = el.get("lat")
        lng = el.get("lon")
    elif el["type"] == "way" and "center" in el:
        lat = el["center"].get("lat")
        lng = el["center"].get("lon")
    else:
        return None

    if lat is None or lng is None:
        return None

    osm_id = el["id"]
    name = (
        tags.get("name:en")
        or tags.get("int_name")
        or tags.get("name")
        or f"{type_str.replace('_', ' ').title()} #{osm_id % 10000}"
    )
    address_parts = [
        tags.get("addr:housenumber", ""),
        tags.get("addr:street", ""),
        tags.get("addr:city", ""),
    ]
    address = " ".join(p for p in address_parts if p).strip() or "Address not available"

    capacity = int(tags.get("capacity", 0)) or (50 + (osm_id % 451))  # 50-500
    occupied = _det_occupancy(osm_id, capacity)
    status = _det_status(osm_id, capacity, occupied)
    frontend_type = AMENITY_TYPE_MAP.get(type_str, "shelter")

    return {
        "id": f"osm-{osm_id}",
        "name": name,
        "type": frontend_type,
        "status": status,
        "lat": round(lat, 6),
        "lng": round(lng, 6),
        "capacity": capacity,
        "occupied": occupied,
        "address": address,
        "phone": tags.get("phone") or tags.get("contact:phone"),
        "amenities": _det_amenities(frontend_type),
    }


@router.get("")
async def get_locations(lat: float, lng: float, radius: int = 5000):
    """
    Return nearby emergency facilities from OpenStreetMap Overpass API.
    radius: search radius in metres (default 5 km).
    """
    # Overpass QL: fetch nodes + way-centres for each amenity type
    query = f"""
[out:json][timeout:20];
(
  node["amenity"="hospital"](around:{radius},{lat},{lng});
  way["amenity"="hospital"](around:{radius},{lat},{lng});
  node["amenity"="clinic"](around:{radius},{lat},{lng});
  way["amenity"="clinic"](around:{radius},{lat},{lng});
  node["amenity"="doctors"](around:{radius},{lat},{lng});
  node["amenity"="social_facility"]["social_facility"="shelter"](around:{radius},{lat},{lng});
  node["amenity"="community_centre"](around:{radius},{lat},{lng});
);
out body center;
"""
    async with httpx.AsyncClient(headers=HEADERS, timeout=35) as client:
        try:
            resp = await client.post(OVERPASS_URL, data={"data": query})
            resp.raise_for_status()
            data = resp.json()
        except Exception as exc:
            return {"locations": [], "error": str(exc)}

    elements = data.get("elements", [])
    locations = []
    seen_ids: set[int] = set()

    for el in elements:
        osm_id = el.get("id")
        if osm_id in seen_ids:
            continue
        seen_ids.add(osm_id)

        tags = el.get("tags", {})
        amenity = tags.get("amenity", "")
        social = tags.get("social_facility", "")
        type_str = social if social == "shelter" else amenity

        loc = _parse_element(el, type_str)
        if loc:
            locations.append(loc)

    # Sort: open first, then by distance from query point
    def sort_key(loc):
        status_order = {"OPEN": 0, "FULL": 1, "CLOSED": 2}
        dlat = loc["lat"] - lat
        dlng = loc["lng"] - lng
        dist = math.sqrt(dlat**2 + dlng**2)
        return (status_order.get(loc["status"], 9), dist)

    locations.sort(key=sort_key)

    return {"locations": locations[:30]}  # cap at 30 to keep UI manageable
