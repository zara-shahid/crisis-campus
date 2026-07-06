import { useState, useEffect, useCallback } from "react";
import { fetchLocations, type MapLocation } from "../services/locations";

export type LocationStatus = "idle" | "geolocating" | "loading" | "ready" | "error";

export function useLocations() {
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [center, setCenter] = useState<[number, number] | null>(null);
  const [status, setStatus] = useState<LocationStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (lat: number, lng: number) => {
    setCenter([lat, lng]);
    setStatus("loading");
    try {
      const res = await fetchLocations(lat, lng);
      setLocations(res.locations);
      setStatus("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch locations");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    setStatus("geolocating");

    const fallbackToIP = () => {
      fetch("https://ipapi.co/json/")
        .then((r) => r.json())
        .then((d) => {
          if (d.latitude && d.longitude) {
            load(d.latitude, d.longitude);
          } else {
            setError("Could not determine location via IP.");
            setStatus("error");
          }
        })
        .catch(() => {
          setError("IP geolocation failed.");
          setStatus("error");
        });
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => load(pos.coords.latitude, pos.coords.longitude),
        () => fallbackToIP(),
        { timeout: 15000, maximumAge: 60000 }
      );
    } else {
      fallbackToIP();
    }
  }, [load]);

  return { locations, center, status, error };
}
