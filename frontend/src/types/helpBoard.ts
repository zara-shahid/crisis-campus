export type HelpCategory = "water" | "food" | "shelter" | "rides";
export type HelpPostStatus = "open" | "fulfilled";

export interface HelpPost {
  id: number;
  category: HelpCategory;
  title: string;
  description: string;
  location: string | null;
  contact_phone: string | null;
  status: HelpPostStatus;
  author_name: string;
  author_id: number;
  created_at: string;
  is_mine: boolean;
}

export interface HelpPostCreate {
  category: HelpCategory;
  title: string;
  description: string;
  location?: string;
  contact_phone?: string;
}

export const HELP_CATEGORIES: {
  id: HelpCategory;
  label: string;
  icon: string;
  color: string;
}[] = [
  { id: "water", label: "Water", icon: "💧", color: "cyan" },
  { id: "food", label: "Food", icon: "🍞", color: "amber" },
  { id: "shelter", label: "Shelter", icon: "🏠", color: "sky" },
  { id: "rides", label: "Rides", icon: "🚗", color: "violet" },
];

export function categoryMeta(category: HelpCategory) {
  return HELP_CATEGORIES.find((c) => c.id === category) ?? HELP_CATEGORIES[0];
}
