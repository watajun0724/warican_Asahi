"use client";

import { PokerCard } from "./PokerCard";
import { CARD_VALUES, type CardValue } from "@/types/database";

interface CardDeckProps {
  selectedValue: CardValue | null;
  disabled?: boolean;
  onSelect: (value: CardValue) => void;
}

export function CardDeck({ selectedValue, disabled = false, onSelect }: CardDeckProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-slate-400 text-sm">
        {disabled
          ? "投票が公開されました"
          : selectedValue
          ? `「${selectedValue}」を選択中`
          : "カードを選択してください"}
      </p>
      <div
        className="flex flex-wrap justify-center gap-3"
        role="group"
        aria-label="プランニングポーカー カード選択"
      >
        {CARD_VALUES.map((value) => (
          <PokerCard
            key={value}
            value={value}
            selected={selectedValue === value}
            disabled={disabled}
            onClick={() => !disabled && onSelect(value)}
            size="lg"
          />
        ))}
      </div>
    </div>
  );
}
