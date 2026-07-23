export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string;
          name: string;
          topic: string | null;
          status: "voting" | "revealed";
          facilitator_id: string | null;
          round: number;
          created_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          topic?: string | null;
          status?: "voting" | "revealed";
          facilitator_id?: string | null;
          round?: number;
          created_at?: string;
          expires_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          topic?: string | null;
          status?: "voting" | "revealed";
          facilitator_id?: string | null;
          round?: number;
          created_at?: string;
          expires_at?: string;
        };
      };
      participants: {
        Row: {
          id: string;
          room_id: string;
          name: string;
          is_online: boolean;
          joined_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          name: string;
          is_online?: boolean;
          joined_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          name?: string;
          is_online?: boolean;
          joined_at?: string;
        };
      };
      votes: {
        Row: {
          id: string;
          room_id: string;
          participant_id: string;
          round: number;
          value: string;
          voted_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          participant_id: string;
          round: number;
          value: string;
          voted_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          participant_id?: string;
          round?: number;
          value?: string;
          voted_at?: string;
        };
      };
    };
  };
};

export type Room = Database["public"]["Tables"]["rooms"]["Row"];
export type Participant = Database["public"]["Tables"]["participants"]["Row"];
export type Vote = Database["public"]["Tables"]["votes"]["Row"];

export type CardValue = "1" | "2" | "3" | "5" | "8" | "13" | "21" | "?" | "☕";

export const CARD_VALUES: CardValue[] = [
  "1",
  "2",
  "3",
  "5",
  "8",
  "13",
  "21",
  "?",
  "☕",
];
