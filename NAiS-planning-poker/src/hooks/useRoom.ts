"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Room, Participant, Vote } from "@/types/database";

export function useRoom(roomId: string) {
  const supabase = createClient();

  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 初期データ取得
  const fetchData = useCallback(async () => {
    try {
      const [roomRes, participantsRes, votesRes] = await Promise.all([
        supabase.from("rooms").select("*").eq("id", roomId).single(),
        supabase
          .from("participants")
          .select("*")
          .eq("room_id", roomId)
          .order("joined_at"),
        supabase.from("votes").select("*").eq("room_id", roomId),
      ]);

      if (roomRes.error) throw new Error(roomRes.error.message);
      if (participantsRes.error) throw new Error(participantsRes.error.message);
      if (votesRes.error) throw new Error(votesRes.error.message);

      setRoom(roomRes.data);
      setParticipants(participantsRes.data ?? []);
      setVotes(votesRes.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [roomId, supabase]);

  // Realtime サブスクリプション
  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rooms", filter: `id=eq.${roomId}` },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            setRoom(payload.new as Room);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "participants", filter: `room_id=eq.${roomId}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setParticipants((prev) => [...prev, payload.new as Participant]);
          } else if (payload.eventType === "UPDATE") {
            setParticipants((prev) =>
              prev.map((p) =>
                p.id === (payload.new as Participant).id
                  ? (payload.new as Participant)
                  : p
              )
            );
          } else if (payload.eventType === "DELETE") {
            setParticipants((prev) =>
              prev.filter((p) => p.id !== (payload.old as Participant).id)
            );
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "votes", filter: `room_id=eq.${roomId}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setVotes((prev) => [...prev, payload.new as Vote]);
          } else if (payload.eventType === "UPDATE") {
            setVotes((prev) =>
              prev.map((v) =>
                v.id === (payload.new as Vote).id ? (payload.new as Vote) : v
              )
            );
          } else if (payload.eventType === "DELETE") {
            setVotes((prev) =>
              prev.filter((v) => v.id !== (payload.old as Vote).id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, fetchData, supabase]);

  // 現在ラウンドの投票のみ
  const currentVotes = room
    ? votes.filter((v) => v.round === room.round)
    : [];

  return { room, participants, votes: currentVotes, loading, error, refetch: fetchData };
}
