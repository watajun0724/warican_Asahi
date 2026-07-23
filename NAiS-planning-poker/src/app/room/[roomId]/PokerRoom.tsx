"use client";

import { useState, useCallback } from "react";
import { useRoom } from "@/hooks/useRoom";
import { useVote } from "@/hooks/useVote";
import { RoomHeader } from "@/components/RoomHeader";
import { ParticipantList } from "@/components/ParticipantList";
import { CardDeck } from "@/components/CardDeck";
import { ResultPanel } from "@/components/ResultPanel";
import { ActionBar } from "@/components/ActionBar";
import type { CardValue, Participant } from "@/types/database";

interface PokerRoomProps {
  roomId: string;
  currentParticipant: Participant;
  isFacilitator: boolean;
}

export function PokerRoom({ roomId, currentParticipant, isFacilitator }: PokerRoomProps) {
  const { room, participants, votes, loading, error } = useRoom(roomId);
  const [selectedCard, setSelectedCard] = useState<CardValue | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const round = room?.round ?? 1;
  const { castVote, revealCards, resetRound } = useVote(
    roomId,
    currentParticipant.id,
    round
  );

  const handleCardSelect = useCallback(
    async (value: CardValue) => {
      setSelectedCard(value);
      await castVote(value);
    },
    [castVote]
  );

  const handleReveal = async () => {
    setActionLoading(true);
    await revealCards();
    setActionLoading(false);
  };

  const handleReset = async () => {
    setActionLoading(true);
    setSelectedCard(null);
    await resetRound(round);
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400">読み込み中...</div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-rose-400">
          {error ?? "ルームが見つかりませんでした"}
        </div>
      </div>
    );
  }

  const isRevealed = room.status === "revealed";
  const onlineParticipants = participants.filter((p) => p.is_online);

  return (
    <main className="min-h-screen px-4 py-6 max-w-3xl mx-auto space-y-6">
      {/* ルームヘッダー */}
      <RoomHeader room={room} />

      <hr className="border-slate-700" />

      {/* 参加者一覧 */}
      <ParticipantList
        participants={participants}
        votes={votes}
        isRevealed={isRevealed}
        currentParticipantId={currentParticipant.id}
      />

      <hr className="border-slate-700" />

      {/* 結果パネル（公開後のみ） */}
      {isRevealed && <ResultPanel votes={votes} />}

      {/* カード選択 */}
      <CardDeck
        selectedValue={selectedCard}
        disabled={isRevealed}
        onSelect={handleCardSelect}
      />

      <hr className="border-slate-700" />

      {/* アクションバー */}
      <ActionBar
        isFacilitator={isFacilitator}
        isRevealed={isRevealed}
        voteCount={votes.length}
        participantCount={onlineParticipants.length}
        onReveal={handleReveal}
        onReset={handleReset}
        loading={actionLoading}
      />
    </main>
  );
}
