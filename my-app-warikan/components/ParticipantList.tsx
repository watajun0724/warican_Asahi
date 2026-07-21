"use client";

import { Participant } from "@/lib/supabase";

type Props = {
  participants: Participant[];
  isOpen: boolean;
  myId: string | null;
};

export default function ParticipantList({ participants, isOpen, myId }: Props) {
  if (participants.length === 0) {
    return (
      <p className="text-center text-gray-400 text-sm py-8">
        まだ参加者がいません。URLを共有してメンバーを招待しましょう。
      </p>
    );
  }

  // 参加順は挿入順（created_at でソート済み）を維持
  const sorted = [...participants].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const votedCount = sorted.filter((p) => p.vote !== null).length;
  const notVoted = sorted.filter((p) => p.vote === null);

  // 数値投票のみ集計（? ☕ を除外）
  const numericVotes = sorted
    .filter((p) => p.vote !== null && !isNaN(Number(p.vote)))
    .map((p) => Number(p.vote));

  const average =
    numericVotes.length > 0
      ? (numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length).toFixed(1)
      : null;

  // 最頻値
  const mode = (() => {
    if (numericVotes.length === 0) return null;
    const counts = new Map<number, number>();
    numericVotes.forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1));
    let maxCount = 0;
    let modeValue: number | null = null;
    counts.forEach((count, value) => {
      if (count > maxCount) {
        maxCount = count;
        modeValue = value;
      }
    });
    return modeValue;
  })();

  return (
    <div className="space-y-4">
      {/* 進捗バー */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-500">
          <span>投票状況</span>
          <span>
            {votedCount} / {sorted.length} 人
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${(votedCount / sorted.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 未投票者バッジ（投票中かつ未投票者がいる場合） */}
      {!isOpen && notVoted.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-gray-400">待機中:</span>
          {notVoted.map((p) => (
            <span
              key={p.id}
              className="text-xs bg-amber-50 border border-amber-200 text-amber-600 rounded-full px-2.5 py-0.5 animate-pulse"
            >
              {p.name}
            </span>
          ))}
        </div>
      )}

      {/* 参加者カード一覧（参加順） */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {sorted.map((p) => (
          <div
            key={p.id}
            className={[
              "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
              p.id === myId
                ? "border-indigo-300 bg-indigo-50"
                : "border-gray-100 bg-white",
            ].join(" ")}
          >
            {/* 投票カード */}
            <div
              className={[
                "w-12 h-16 rounded-lg flex items-center justify-center text-lg font-bold shadow-sm border transition-all duration-300",
                isOpen
                  ? p.vote !== null
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "bg-gray-100 border-gray-200 text-gray-400"
                  : p.vote !== null
                  ? "bg-gray-700 border-gray-700 text-gray-700" // 伏せ
                  : "bg-gray-50 border-dashed border-gray-300 text-gray-300",
              ].join(" ")}
            >
              {isOpen ? p.vote ?? "—" : p.vote !== null ? "✓" : "…"}
            </div>

            {/* 名前 */}
            <span className="text-xs font-medium text-gray-700 truncate w-full text-center">
              {p.name}
              {p.id === myId && (
                <span className="ml-1 text-indigo-500">（あなた）</span>
              )}
            </span>
          </div>
        ))}
      </div>

      {/* 結果パネル（オープン時のみ） */}
      {isOpen && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
          <h3 className="text-center text-sm font-semibold text-indigo-600 mb-4">
            結果
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <p className="text-xs text-gray-500 mb-1">最頻値</p>
              <p className="text-3xl font-bold text-indigo-700">
                {mode ?? "-"}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <p className="text-xs text-gray-500 mb-1">平均</p>
              <p className="text-3xl font-bold text-indigo-700">
                {average ?? "-"}
              </p>
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-gray-400">
            ※ ?・☕ は集計対象外
          </p>
        </div>
      )}
    </div>
  );
}
