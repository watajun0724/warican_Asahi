"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CardValue } from "@/types/database";

export function useVote(roomId: string, participantId: string | null, round: number) {
  const supabase = createClient();
  const [submitting, setSubmitting] = useState(false);

  const castVote = async (value: CardValue): Promise<boolean> => {
    if (!participantId) return false;
    setSubmitting(true);

    try {
      const { error } = await supabase.from("votes").upsert(
        {
          room_id: roomId,
          participant_id: participantId,
          round,
          value,
          voted_at: new Date().toISOString(),
        },
        { onConflict: "room_id,participant_id,round" }
      );

      return !error;
    } finally {
      setSubmitting(false);
    }
  };

  const revealCards = async (): Promise<boolean> => {
    const { error } = await supabase
      .from("rooms")
      .update({ status: "revealed" })
      .eq("id", roomId);
    return !error;
  };

  const resetRound = async (currentRound: number): Promise<boolean> => {
    const { error } = await supabase
      .from("rooms")
      .update({ status: "voting", round: currentRound + 1 })
      .eq("id", roomId);
    return !error;
  };

  return { castVote, revealCards, resetRound, submitting };
}
