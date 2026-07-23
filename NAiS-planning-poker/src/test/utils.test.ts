import { describe, it, expect } from "vitest";
import { calculateStats, calculateConsensus } from "@/lib/utils";

describe("calculateStats", () => {
  it("数値のみの場合に正しい統計を返す", () => {
    const result = calculateStats(["1", "2", "3", "5", "8"]);
    expect(result.average).toBe(3.8);
    expect(result.min).toBe("1");
    expect(result.max).toBe("8");
  });

  it("最頻値を正しく計算する", () => {
    const result = calculateStats(["5", "5", "8", "3", "5"]);
    expect(result.mode).toEqual(["5"]);
  });

  it("複数の最頻値を正しく計算する", () => {
    const result = calculateStats(["5", "5", "8", "8", "3"]);
    expect(result.mode).toContain("5");
    expect(result.mode).toContain("8");
  });

  it("非数値（?、☕）が含まれても数値統計のみ計算する", () => {
    const result = calculateStats(["5", "8", "?", "☕"]);
    expect(result.average).toBe(6.5);
    expect(result.numericValues).toEqual([5, 8]);
  });

  it("全て非数値の場合は null を返す", () => {
    const result = calculateStats(["?", "☕"]);
    expect(result.average).toBeNull();
    expect(result.min).toBeNull();
    expect(result.max).toBeNull();
  });

  it("空配列の場合は null を返す", () => {
    const result = calculateStats([]);
    expect(result.average).toBeNull();
  });
});

describe("calculateConsensus", () => {
  it("全員同じ値なら high を返す", () => {
    expect(calculateConsensus([5, 5, 5, 5])).toBe("high");
  });

  it("わずかな差異なら high を返す", () => {
    expect(calculateConsensus([5, 5, 5, 6])).toBe("high");
  });

  it("中程度の差異なら medium を返す", () => {
    expect(calculateConsensus([1, 3, 5, 8])).toBe("medium");
  });

  it("大きな差異なら low を返す", () => {
    expect(calculateConsensus([1, 2, 13, 21])).toBe("low");
  });

  it("1人の場合は high を返す", () => {
    expect(calculateConsensus([8])).toBe("high");
  });
});
