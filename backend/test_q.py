import httpx
query = """
[out:json][timeout:20];
(
  node["amenity"="hospital"](around:8000,33.68,73.04);
  way["amenity"="hospital"](around:8000,33.68,73.04);
  node["amenity"="clinic"](around:8000,33.68,73.04);
  way["amenity"="clinic"](around:8000,33.68,73.04);
  node["amenity"="doctors"](around:8000,33.68,73.04);
  node["amenity"="social_facility"]["social_facility"="shelter"](around:8000,33.68,73.04);
  node["amenity"="community_centre"](around:8000,33.68,73.04);
);
out body center;
"""
r = httpx.post(
    "https://overpass-api.de/api/interpreter",
    data={"data": query},
    headers={"User-Agent": "CrisisCompass/1.0"}
)
print("Status:", r.status_code)
