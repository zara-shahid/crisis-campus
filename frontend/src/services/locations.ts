import api from "./api";

// MapLocation is the canonical shape for a map marker — shared with EmergencyMap
export interface MapLocation {
  id: string;
  name: string;
  type: "shelter" | "hospital" | "medpoint" | "evac";
  status: "OPEN" | "FULL" | "CLOSED";
  lat: number;
  lng: number;
  capacity?: number;
  occupied?: number;
  address: string;
  phone?: string | null;
  amenities?: string[];
}

export interface LocationsResponse {
  locations: MapLocation[];
  error?: string;
}

export async function fetchLocations(
  lat: number,
  lng: number
): Promise<LocationsResponse> {
  const { data } = await api.get<LocationsResponse>(
    `/api/locations?lat=${lat}&lng=${lng}`
  );
  return data;
}
