import httpx

query = """
[out:json][timeout:20];
(
  node["amenity"="hospital"](around:15000,33.68,73.04);
  way["amenity"="hospital"](around:15000,33.68,73.04);
  node["amenity"="clinic"](around:15000,33.68,73.04);
  way["amenity"="clinic"](around:15000,33.68,73.04);
);
out body center;
"""

r = httpx.post(
    "https://overpass-api.de/api/interpreter",
    data={"data": query},
    headers={"User-Agent": "CrisisCompass/1.0"},
    timeout=30
)
print("Status:", r.status_code)
data = r.json()
elements = data.get("elements", [])
print("Elements:", len(elements))
for el in elements[:5]:
    tags = el.get("tags", {})
    print(" -", tags.get("name", "No name"), "|", el.get("type"), el.get("id"))
