import { useEffect, useState } from "react";

export interface WeatherData {
  location: string;
  temp_c: number;
  feels_like_c: number;
  humidity: number;
  wind_kph: number;
  wind_dir: string;
  description: string;
  icon_code: string; // wttr condition code for icon mapping
  uv_index: number;
  visibility_km: number;
  is_day: boolean;
}

interface WttrResponse {
  nearest_area: { areaName: { value: string }[]; country: { value: string }[] }[];
  current_condition: {
    temp_C: string;
    FeelsLikeC: string;
    humidity: string;
    windspeedKmph: string;
    winddir16Point: string;
    weatherDesc: { value: string }[];
    weatherCode: string;
    uvIndex: string;
    visibility: string;
  }[];
}

function codeToIcon(code: string, isDay: boolean): string {
  const c = parseInt(code, 10);
  if ([113].includes(c)) return isDay ? "☀️" : "🌙";
  if ([116].includes(c)) return isDay ? "⛅" : "🌤";
  if ([119, 122].includes(c)) return "☁️";
  if ([143, 248, 260].includes(c)) return "🌫️";
  if ([176, 263, 266, 293, 296, 299, 302, 305, 308, 353, 356, 359].includes(c)) return "🌧️";
  if ([179, 182, 185, 227, 230, 281, 284, 311, 314, 317, 320, 323, 326, 329, 332, 335, 338, 350, 362, 365, 368, 371, 374, 377].includes(c)) return "❄️";
  if ([200, 386, 389, 392, 395].includes(c)) return "⛈️";
  return "🌡️";
}

export function useWeather(locationHint?: string) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchWeather(query: string) {
      try {
        const res = await fetch(
          `https://wttr.in/${encodeURIComponent(query)}?format=j1`
        );
        if (!res.ok) throw new Error("wttr.in request failed");
        const json: WttrResponse = await res.json();

        const cur = json.current_condition[0];
        const area = json.nearest_area[0];
        const hour = new Date().getHours();
        const isDay = hour >= 6 && hour < 20;

        if (!cancelled) {
          setData({
            location: `${area.areaName[0].value}, ${area.country[0].value}`,
            temp_c: parseInt(cur.temp_C, 10),
            feels_like_c: parseInt(cur.FeelsLikeC, 10),
            humidity: parseInt(cur.humidity, 10),
            wind_kph: parseInt(cur.windspeedKmph, 10),
            wind_dir: cur.winddir16Point,
            description: cur.weatherDesc[0].value,
            icon_code: cur.weatherCode,
            uv_index: parseInt(cur.uvIndex, 10),
            visibility_km: parseInt(cur.visibility, 10),
            is_day: isDay,
          });
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load weather");
          setLoading(false);
        }
      }
    }

    if (locationHint) {
      fetchWeather(locationHint);
      return () => { cancelled = true; };
    }

    const fallbackToIP = () => {
      fetch("https://ipapi.co/json/")
        .then((res) => res.json())
        .then((ipData) => {
          if (ipData.city) {
            fetchWeather(ipData.city); // e.g. "Islamabad" -> cleaner name
          } else {
            fetchWeather("auto");
          }
        })
        .catch(() => {
          fetchWeather("auto");
        });
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // Even with GPS, wttr.in gives weird tiny village names. 
          // Reverse geocode via OSM to get a clean city name.
          fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&accept-language=en`
          )
            .then((res) => res.json())
            .then((osmData) => {
              const city =
                osmData.address?.city ||
                osmData.address?.town ||
                osmData.address?.state ||
                `${pos.coords.latitude},${pos.coords.longitude}`;
              fetchWeather(city);
            })
            .catch(() => {
              fetchWeather(`${pos.coords.latitude},${pos.coords.longitude}`);
            });
        },
        () => {
          fallbackToIP();
        },
        { timeout: 15000, maximumAge: 60000 }
      );
    } else {
      fallbackToIP();
    }

    return () => { cancelled = true; };
  }, [locationHint]);

  return { data, loading, error };
}

export { codeToIcon };
