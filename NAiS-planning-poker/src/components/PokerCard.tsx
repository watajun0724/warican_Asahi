"use client";

import { cn } from "@/lib/utils";
import type { CardValue } from "@/types/database";

interface PokerCardProps {
  value: CardValue;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
}

export function PokerCard({
  value,
  selected = false,
  disabled = false,
  onClick,
  size = "md",
}: PokerCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`カード ${value} を選択`}
      className={cn(
        "relative flex items-center justify-center rounded-xl border-2 font-bold transition-all duration-150 select-none",
        // サイズ
        size === "sm" && "h-10 w-8 text-sm",
        size === "md" && "h-16 w-12 text-lg",
        size === "lg" && "h-24 w-16 text-2xl",
        // 状態
        !selected && !disabled &&
          "border-slate-500 bg-slate-700 text-slate-200 hover:border-indigo-400 hover:bg-slate-600 hover:scale-105 cursor-pointer",
        selected &&
          "border-indigo-400 bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-500/40 cursor-pointer",
        disabled && !selected &&
          "border-slate-600 bg-slate-800 text-slate-500 opacity-50 cursor-not-allowed",
        disabled && selected &&
          "border-indigo-500 bg-indigo-700 text-white opacity-70 cursor-not-allowed"
      )}
    >
      {value}
    </button>
  );
}
