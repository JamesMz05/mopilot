export interface Role {
  id: number;
  name: string;
  slug: string;
  category: "kundennah" | "betrieb" | "strategie";
  description: string | null;
  email_alias: string | null;
  tagline: string | null;
  idea_count: number;
}

export interface Idea {
  id: number;
  title: string;
  description: string;
  author_id: number;
  role_id: number;
  status: "neu" | "in_diskussion" | "geplant" | "umgesetzt" | "abgelehnt";
  created_at: string;
  updated_at: string | null;
  author_name: string | null;
  avg_rating: number | null;
  comment_count: number;
}

export interface Comment {
  id: number;
  idea_id: number;
  user_id: number;
  user_name: string | null;
  text: string;
  created_at: string;
}

export interface Rating {
  id: number;
  idea_id: number;
  user_id: number;
  score: number;
  created_at: string;
}

export interface RatingOverview {
  idea_id: number;
  average: number | null;
  count: number;
  ratings: Rating[];
}

export const CATEGORY_LABELS: Record<string, string> = {
  kundennah: "Kundennah",
  betrieb: "Betrieb",
  strategie: "Strategie",
};

export const STATUS_LABELS: Record<string, string> = {
  neu: "Neu",
  in_diskussion: "In Diskussion",
  geplant: "Geplant",
  umgesetzt: "Umgesetzt",
  abgelehnt: "Abgelehnt",
};

export const STATUS_COLORS: Record<string, string> = {
  neu: "bg-blue-100 text-blue-800",
  in_diskussion: "bg-yellow-100 text-yellow-800",
  geplant: "bg-purple-100 text-purple-800",
  umgesetzt: "bg-green-100 text-green-800",
  abgelehnt: "bg-red-100 text-red-800",
};
