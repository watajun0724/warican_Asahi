"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useParticipant } from "@/hooks/useParticipant";
import { JoinForm } from "./JoinForm";
import { PokerRoom } from "./PokerRoom";
import type { Room } from "@/types/database";

interface RoomPageProps {
  params: { roomId: string };
}

export default function RoomPage({ params }: RoomPageProps) {
  const { roomId } = params;
  const supabase = createClient();

  const [room, setRoom] = useState<Room | null>(null);
  const [roomLoading, setRoomLoading] = useState(true);
  const [roomNotFound, setRoomNotFound] = useState(false);

  const { participant, loading: participantLoading, joinRoom, isFacilitator } =
    useParticipant(roomId);

  // ルーム情報を取得
  useEffect(() => {
    supabase
      .from("rooms")
      .select("*")
      .eq("id", roomId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setRoomNotFound(true);
        } else {
          setRoom(data);
        }
        setRoomLoading(false);
      });
  }, [roomId, supabase]);

  const handleJoin = async (name: string) => {
    const newParticipant = await joinRoom(name);
    if (!newParticipant || !room) return;

    // 最初の参加者をファシリテーターに設定
    const { data: existingParticipants } = await supabase
      .from("participants")
      .select("id")
      .eq("room_id", roomId);

    if (existingParticipants && existingParticipants.length === 1) {
      await supabase
        .from("rooms")
        .update({ facilitator_id: newParticipant.id })
        .eq("id", roomId);
    }
  };

  if (roomLoading || participantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400">読み込み中...</div>
      </div>
    );
  }

  if (roomNotFound) {
    notFound();
  }

  if (!room) return null;

  // 未参加の場合は名前入力フォームを表示
  if (!participant) {
    return <JoinForm roomName={room.name} onJoin={handleJoin} />;
  }

  return (
    <PokerRoom
      roomId={roomId}
      currentParticipant={participant}
      isFacilitator={isFacilitator(room)}
    />
  );
}
