import { useCallback, useEffect, useState } from "react";
import {
  createHelpPost,
  deleteHelpPost,
  fetchHelpPosts,
  fulfillHelpPost,
} from "../services/helpBoard";
import type { HelpCategory, HelpPost, HelpPostCreate } from "../types/helpBoard";

export function useHelpBoard(initialCategory?: HelpCategory) {
  const [posts, setPosts] = useState<HelpPost[]>([]);
  const [category, setCategory] = useState<HelpCategory | "all">(initialCategory ?? "all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHelpPosts({
        category: category === "all" ? undefined : category,
        status: "open",
      });
      setPosts(data);
    } catch {
      setError("Could not load community posts. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  async function submitPost(payload: HelpPostCreate) {
    setSubmitting(true);
    setError(null);
    try {
      const created = await createHelpPost(payload);
      setPosts((prev) => [created, ...prev]);
      return created;
    } catch {
      setError("Failed to post your request. Please try again.");
      throw new Error("submit failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function markFulfilled(postId: number) {
    const updated = await fulfillHelpPost(postId);
    setPosts((prev) => prev.filter((p) => p.id !== updated.id));
  }

  async function removePost(postId: number) {
    await deleteHelpPost(postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }

  return {
    posts,
    category,
    setCategory,
    loading,
    error,
    submitting,
    submitPost,
    markFulfilled,
    removePost,
    refresh: loadPosts,
  };
}
