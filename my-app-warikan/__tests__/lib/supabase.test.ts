import { describe, it, expect } from "vitest";
import { CARD_VALUES } from "@/lib/supabase";

// ─────────────────────────────────────────────────────────────
// lib/supabase.ts — 定数・型の検証
// ─────────────────────────────────────────────────────────────

describe("CARD_VALUES", () => {
  it("フィボナッチ数列の値を正しい順序で含む", () => {
    expect(CARD_VALUES).toEqual(["1", "2", "3", "5", "8", "13", "21", "?", "☕"]);
  });

  it("9枚のカードを持つ", () => {
    expect(CARD_VALUES).toHaveLength(9);
  });

  it("すべての値が文字列型である", () => {
    CARD_VALUES.forEach((v) => expect(typeof v).toBe("string"));
  });

  it("数値カードがフィボナッチ数列になっている", () => {
    const numeric = CARD_VALUES.filter((v) => !isNaN(Number(v))).map(Number);
    expect(numeric).toEqual([1, 2, 3, 5, 8, 13, 21]);
  });

  it("特殊カード（? と ☕）を含む", () => {
    expect(CARD_VALUES).toContain("?");
    expect(CARD_VALUES).toContain("☕");
  });

  it("重複する値がない", () => {
    const unique = new Set(CARD_VALUES);
    expect(unique.size).toBe(CARD_VALUES.length);
  });
});
