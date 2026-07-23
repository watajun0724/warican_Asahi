"use client";

import { cn } from "@/lib/utils";
import type { Participant, Vote } from "@/types/database";

interface ParticipantListProps {
  participants: Participant[];
  votes: Vote[];
  isRevealed: boolean;
  currentParticipantId: string | null;
}

export function ParticipantList({
  participants,
  votes,
  isRevealed,
  currentParticipantId,
}: ParticipantListProps) {
  const onlineParticipants = participants.filter((p) => p.is_online);

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-slate-400 text-sm font-medium">
        参加者 ({onlineParticipants.length}人)
      </h2>
      <div className="flex flex-wrap gap-3">
        {participants.map((participant) => {
          const vote = votes.find((v) => v.participant_id === participant.id);
          const hasVoted = !!vote;
          const isMe = participant.id === currentParticipantId;

          return (
            <div
              key={participant.id}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl p-3 border-2 min-w-[80px] transition-all",
                !participant.is_online && "opacity-40",
                isMe && "ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900"
              )}
              aria-label={`${participant.name}${isMe ? "（あなた）" : ""}${hasVoted ? "、投票済み" : "、未投票"}`}
            >
              {/* カード表示エリア */}
              <div
                className={cn(
                  "w-10 h-14 rounded-lg border-2 flex items-center justify-center text-sm font-bold",
                  isRevealed && hasVoted
                    ? "border-violet-400 bg-violet-600 text-white"
                    : hasVoted
                    ? "border-emerald-400 bg-emerald-700 text-white"
                    : "border-slate-600 bg-slate-800 text-slate-500 border-dashed"
                )}
              >
                {isRevealed && vote ? (
                  vote.value
                ) : hasVoted ? (
                  <span aria-hidden="true">✓</span>
                ) : (
                  <span className="text-xs" aria-hidden="true">…</span>
                )}
              </div>

              {/* 名前 */}
              <span
                className={cn(
                  "text-xs font-medium max-w-[72px] truncate",
                  isMe ? "text-indigo-300" : "text-slate-300"
                )}
              >
                {participant.name}
                {isMe && <span className="text-indigo-400"> (あなた)</span>}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
