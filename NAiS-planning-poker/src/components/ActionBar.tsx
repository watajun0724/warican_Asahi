"use client";

interface ActionBarProps {
  isFacilitator: boolean;
  isRevealed: boolean;
  voteCount: number;
  participantCount: number;
  onReveal: () => void;
  onReset: () => void;
  loading?: boolean;
}

export function ActionBar({
  isFacilitator,
  isRevealed,
  voteCount,
  participantCount,
  onReveal,
  onReset,
  loading = false,
}: ActionBarProps) {
  if (!isFacilitator) {
    return (
      <div className="text-center text-slate-500 text-sm">
        {isRevealed
          ? "ファシリテーターが次のラウンドを開始するまでお待ちください"
          : `${voteCount} / ${participantCount} 人が投票済み`}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-slate-400 text-sm">
        {voteCount} / {participantCount} 人が投票済み
      </p>

      {!isRevealed ? (
        <button
          onClick={onReveal}
          disabled={loading || voteCount === 0}
          className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold transition-colors disabled:cursor-not-allowed"
          aria-label="全員のカードを公開する"
        >
          🔒 カードを公開する
        </button>
      ) : (
        <button
          onClick={onReset}
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold transition-colors disabled:cursor-not-allowed"
          aria-label="次のラウンドを開始する"
        >
          🔄 次のラウンドへ
        </button>
      )}
    </div>
  );
}
