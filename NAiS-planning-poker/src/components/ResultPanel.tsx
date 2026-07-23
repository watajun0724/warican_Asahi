"use client";

import { calculateStats, calculateConsensus } from "@/lib/utils";
import type { Vote } from "@/types/database";

interface ResultPanelProps {
  votes: Vote[];
}

export function ResultPanel({ votes }: ResultPanelProps) {
  const values = votes.map((v) => v.value);
  const { average, mode, min, max, numericValues } = calculateStats(values);
  const consensus = calculateConsensus(numericValues);

  const consensusLabel = {
    high: { label: "合意度: 高", color: "text-emerald-400" },
    medium: { label: "合意度: 中", color: "text-amber-400" },
    low: { label: "合意度: 低", color: "text-rose-400" },
  };

  return (
    <div className="rounded-xl bg-slate-800 border border-slate-700 p-5">
      <h2 className="text-slate-300 font-semibold mb-4">投票結果</h2>

      {votes.length === 0 ? (
        <p className="text-slate-500 text-sm">投票なし</p>
      ) : (
        <div className="space-y-4">
          {/* 統計 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="平均" value={average !== null ? String(average) : "—"} />
            <StatCard label="最頻値" value={mode.length > 0 ? mode.join(", ") : "—"} />
            <StatCard label="最小" value={min ?? "—"} />
            <StatCard label="最大" value={max ?? "—"} />
          </div>

          {/* 合意度 */}
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${consensusLabel[consensus].color}`}>
              {consensusLabel[consensus].label}
            </span>
            <span className="text-slate-500 text-xs">
              ({votes.length}票)
            </span>
          </div>

          {/* 投票分布 */}
          <div>
            <p className="text-slate-400 text-xs mb-2">投票分布</p>
            <div className="flex flex-wrap gap-2">
              {votes.map((vote) => (
                <span
                  key={vote.id}
                  className="inline-flex items-center px-2 py-1 rounded-lg bg-violet-900 border border-violet-600 text-violet-200 text-sm font-bold"
                >
                  {vote.value}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-700 p-3 text-center">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p className="text-white font-bold text-lg">{value}</p>
    </div>
  );
}
