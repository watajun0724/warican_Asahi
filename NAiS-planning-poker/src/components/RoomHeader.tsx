"use client";

import { useState } from "react";
import type { Room } from "@/types/database";

interface RoomHeaderProps {
  room: Room;
}

export function RoomHeader({ room }: RoomHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold text-white">{room.name}</h1>
        {room.topic && (
          <p className="text-slate-400 text-sm mt-1">
            <span aria-hidden="true">📋</span> {room.topic}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-slate-500 text-xs">ラウンド {room.round}</span>
        <button
          onClick={handleCopyUrl}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white text-sm transition-colors"
          aria-label="招待URLをクリップボードにコピー"
        >
          <span aria-hidden="true">{copied ? "✓" : "🔗"}</span>
          {copied ? "コピーしました" : "URL をコピー"}
        </button>
      </div>
    </div>
  );
}
