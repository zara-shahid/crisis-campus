import api from "./api";
import type { DangerLevel } from "../types/emergency";

export interface AlertData {
  title: string;
  severity: DangerLevel;
  description: string;
}

export interface AlertsResponse {
  level: DangerLevel;
  alerts: AlertData[];
}

export async function fetchAlerts(lat: number, lng: number): Promise<AlertsResponse> {
  const { data } = await api.get<AlertsResponse>(`/api/alerts?lat=${lat}&lng=${lng}`);
  return data;
}
