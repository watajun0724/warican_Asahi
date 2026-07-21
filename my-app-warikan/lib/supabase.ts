import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── 型定義 ───────────────────────────────────────────────
export type Room = {
  id: string;
  name: string;
  is_open: boolean;
  created_at: string;
};

export type Participant = {
  id: string;
  room_id: string;
  name: string;
  vote: string | null;
  created_at: string;
};

// フィボナッチ数列カード
export const CARD_VALUES = ["1", "2", "3", "5", "8", "13", "21", "?", "☕"] as const;
export type CardValue = (typeof CARD_VALUES)[number];
