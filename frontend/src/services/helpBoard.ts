import api from "./api";
import type { HelpCategory, HelpPost, HelpPostCreate, HelpPostStatus } from "../types/helpBoard";

export async function fetchHelpPosts(params?: {
  category?: HelpCategory;
  status?: HelpPostStatus;
}): Promise<HelpPost[]> {
  const { data } = await api.get<HelpPost[]>("/api/help-posts", { params });
  return data;
}

export async function createHelpPost(payload: HelpPostCreate): Promise<HelpPost> {
  const { data } = await api.post<HelpPost>("/api/help-posts", payload);
  return data;
}

export async function fulfillHelpPost(postId: number): Promise<HelpPost> {
  const { data } = await api.patch<HelpPost>(`/api/help-posts/${postId}/fulfill`);
  return data;
}

export async function deleteHelpPost(postId: number): Promise<void> {
  await api.delete(`/api/help-posts/${postId}`);
}
