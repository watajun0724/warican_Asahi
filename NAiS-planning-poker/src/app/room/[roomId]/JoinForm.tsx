"use client";

import { useState } from "react";

interface JoinFormProps {
  roomName: string;
  onJoin: (name: string) => Promise<void>;
}

export function JoinForm({ roomName, onJoin }: JoinFormProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await onJoin(name.trim());
    } catch {
      setError("参加に失敗しました。もう一度お試しください。");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3" aria-hidden="true">🃏</div>
          <h1 className="text-2xl font-bold text-white">
            「{roomName}」に参加
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            表示名を入力してルームに参加してください
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-xl"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="participantName" className="block text-slate-400 text-sm mb-1.5">
                あなたの名前
              </label>
              <input
                id="participantName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: Alice"
                maxLength={20}
                required
                autoFocus
                className="w-full px-4 py-2.5 rounded-xl bg-slate-700 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                aria-describedby={error ? "join-error" : undefined}
              />
            </div>

            {error && (
              <p id="join-error" role="alert" className="text-rose-400 text-sm">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold transition-colors disabled:cursor-not-allowed"
            >
              {loading ? "参加中..." : "参加する"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
