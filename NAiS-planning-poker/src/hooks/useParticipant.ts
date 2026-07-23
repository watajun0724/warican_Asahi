"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Participant } from "@/types/database";

const STORAGE_KEY_PREFIX = "nais_poker_participant_";

export function useParticipant(roomId: string) {
  const supabase = createClient();
  const storageKey = `${STORAGE_KEY_PREFIX}${roomId}`;

  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);

  // localStorage から参加者情報を復元
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Participant;
        setParticipant(parsed);
        // オンライン状態を更新
        supabase
          .from("participants")
          .update({ is_online: true })
          .eq("id", parsed.id)
          .then(() => {});
      } catch {
        localStorage.removeItem(storageKey);
      }
    }
    setLoading(false);
  }, [roomId, storageKey, supabase]);

  // ページを離れる際にオフライン状態に更新
  useEffect(() => {
    if (!participant) return;

    const handleUnload = () => {
      navigator.sendBeacon(
        `/api/participant-offline?id=${participant.id}`,
        ""
      );
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [participant]);

  const joinRoom = async (name: string): Promise<Participant | null> => {
    const { data, error } = await supabase
      .from("participants")
      .insert({ room_id: roomId, name, is_online: true })
      .select()
      .single();

    if (error || !data) return null;

    localStorage.setItem(storageKey, JSON.stringify(data));
    setParticipant(data);
    return data;
  };

  const isFacilitator = (room: { facilitator_id: string | null }) => {
    return participant?.id === room.facilitator_id;
  };

  return { participant, loading, joinRoom, isFacilitator };
}
