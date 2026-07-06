import { useState, useEffect } from "react";
import { fetchAlerts, type AlertsResponse } from "../services/alerts";

export function useAlerts() {
  const [data, setData] = useState<AlertsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAlerts(lat: number, lng: number) {
      try {
        const res = await fetchAlerts(lat, lng);
        if (!cancelled) {
          setData(res);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load alerts");
          setLoading(false);
        }
      }
    }

    const fallbackToIP = () => {
      fetch("https://ipapi.co/json/")
        .then((res) => res.json())
        .then((ipData) => {
          if (ipData.latitude && ipData.longitude) {
            loadAlerts(ipData.latitude, ipData.longitude);
          } else {
            setError("Could not determine location automatically.");
            setLoading(false);
          }
        })
        .catch(() => {
          setError("Geolocation denied and IP fallback failed.");
          setLoading(false);
        });
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          loadAlerts(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          fallbackToIP();
        },
        { timeout: 15000, maximumAge: 60000 }
      );
    } else {
      fallbackToIP();
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
