"use client";

import { CARD_VALUES, CardValue } from "@/lib/supabase";

type Props = {
  selectedValue: string | null;
  onSelect: (value: CardValue) => void;
  disabled: boolean;
};

export default function PokerCard({ selectedValue, onSelect, disabled }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-500 text-center">
        {disabled ? "投票はすでにオープンされています" : "カードを選んでください"}
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        {CARD_VALUES.map((val) => {
          const isSelected = selectedValue === val;
          return (
            <button
              key={val}
              onClick={() => !disabled && onSelect(val)}
              disabled={disabled}
              aria-pressed={isSelected}
              className={[
                // ベース
                "relative w-14 h-20 rounded-xl border-2 text-xl font-bold",
                "shadow-sm select-none outline-none",
                "transition-all duration-200 ease-out",
                // 選択済み
                isSelected
                  ? [
                      "bg-indigo-600 border-indigo-600 text-white",
                      "-translate-y-3 scale-110",
                      "shadow-lg shadow-indigo-200",
                      "ring-2 ring-indigo-300 ring-offset-2",
                    ].join(" ")
                  : disabled
                  ? "bg-white border-gray-200 text-gray-400 opacity-50 cursor-not-allowed"
                  : [
                      "bg-white border-gray-200 text-gray-700 cursor-pointer",
                      "hover:-translate-y-2 hover:scale-105",
                      "hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-100",
                      "active:scale-95 active:translate-y-0",
                    ].join(" "),
              ].join(" ")}
            >
              {val}

              {/* 選択中のキラッとしたグレア */}
              {isSelected && (
                <span className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                  <span className="absolute top-1 left-2 w-6 h-1 bg-white/30 rounded-full rotate-12" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="h-5 text-center">
        {selectedValue && !disabled && (
          <p className="text-xs text-indigo-600 font-medium animate-fade-in">
            「{selectedValue}」を選択中 — もう一度押すと取り消し
          </p>
        )}
      </div>
    </div>
  );
}
