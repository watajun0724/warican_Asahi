"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function HomePage() {
  const router = useRouter();
  const supabase = createClient();

  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    setLoading(true);
    setError(null);

    const { data, error: dbError } = await supabase
      .from("rooms")
      .insert({ name: roomName.trim() })
      .select()
      .single();

    if (dbError || !data) {
      setError("ルームの作成に失敗しました。もう一度お試しください。");
      setLoading(false);
      return;
    }

    router.push(`/room/${data.id}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* ロゴ・タイトル */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-4" aria-hidden="true">🃏</div>
          <h1 className="text-3xl font-bold text-white">NAiS Planning Poker</h1>
          <p className="text-slate-400 mt-2 text-sm">
            アジャイルチームのためのリアルタイム見積もりツール
          </p>
        </div>

        {/* ルーム作成フォーム */}
        <form
          onSubmit={handleCreateRoom}
          className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-xl"
        >
          <h2 className="text-white font-semibold mb-4">新しいルームを作成</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="roomName" className="block text-slate-400 text-sm mb-1.5">
                ルーム名
              </label>
              <input
                id="roomName"
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="例: Sprint 42 見積もり"
                maxLength={50}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-700 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                aria-describedby={error ? "room-error" : undefined}
              />
            </div>

            {error && (
              <p id="room-error" role="alert" className="text-rose-400 text-sm">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !roomName.trim()}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold transition-colors disabled:cursor-not-allowed"
            >
              {loading ? "作成中..." : "ルームを作成する"}
            </button>
          </div>
        </form>

        <p className="text-center text-slate-600 text-xs mt-6">
          ルーム作成後、URL を参加者に共有してください
        </p>
      </div>
    </main>
  );
}
