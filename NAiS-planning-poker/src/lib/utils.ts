import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 数値に変換可能なカード値の統計を計算する
 */
export function calculateStats(values: string[]): {
  average: number | null;
  mode: string[];
  min: string | null;
  max: string | null;
  numericValues: number[];
} {
  const numericValues = values
    .map((v) => parseFloat(v))
    .filter((v) => !isNaN(v));

  if (numericValues.length === 0) {
    return { average: null, mode: [], min: null, max: null, numericValues: [] };
  }

  const average =
    numericValues.reduce((sum, v) => sum + v, 0) / numericValues.length;

  // 最頻値
  const frequency: Record<string, number> = {};
  values.forEach((v) => {
    frequency[v] = (frequency[v] || 0) + 1;
  });
  const maxFreq = Math.max(...Object.values(frequency));
  const mode = Object.entries(frequency)
    .filter(([, count]) => count === maxFreq)
    .map(([v]) => v);

  const sortedNumeric = [...numericValues].sort((a, b) => a - b);

  return {
    average: Math.round(average * 100) / 100,
    mode,
    min: String(sortedNumeric[0]),
    max: String(sortedNumeric[sortedNumeric.length - 1]),
    numericValues,
  };
}

/**
 * 合意度を計算する（標準偏差ベース）
 */
export function calculateConsensus(
  numericValues: number[]
): "high" | "medium" | "low" {
  if (numericValues.length <= 1) return "high";

  const avg = numericValues.reduce((sum, v) => sum + v, 0) / numericValues.length;
  const variance =
    numericValues.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) /
    numericValues.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev <= 1) return "high";
  if (stdDev <= 3) return "medium";
  return "low";
}
