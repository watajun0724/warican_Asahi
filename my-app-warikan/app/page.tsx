"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();
  const [roomName, setRoomName] = useState("");
  const [joinId, setJoinId] = useState("");
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  // ── ルーム作成 ──────────────────────────────
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!roomName.trim()) return;
    setCreating(true);
    setError("");

    const { data, error: err } = await supabase
      .from("rooms")
      .insert({ name: roomName.trim() })
      .select()
      .single();

    setCreating(false);
    if (err || !data) {
      setError("ルームの作成に失敗しました。");
      return;
    }
    // このブラウザがルーム作成者であることを記録
    sessionStorage.setItem(`poker_creator_${data.id}`, "1");
    router.push(`/room/${data.id}`);
  }

  // ── ルーム参加 ──────────────────────────────
  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = joinId.trim();
    if (!trimmed) return;
    setJoining(true);
    setError("");

    const { data, error: err } = await supabase
      .from("rooms")
      .select("id")
      .eq("id", trimmed)
      .single();

    setJoining(false);
    if (err || !data) {
      setError("ルームが見つかりませんでした。IDを確認してください。");
      return;
    }
    router.push(`/room/${data.id}`);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* ヘッダー */}
        <div className="text-center space-y-2">
          <div className="text-5xl">🃏</div>
          <h1 className="text-3xl font-bold text-gray-800">Planning Poker</h1>
          <p className="text-gray-500 text-sm">チームで一緒にストーリーポイントを見積もろう</p>
        </div>

        {/* エラー */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm text-center">
            {error}
          </div>
        )}

        {/* ルーム作成 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-700 text-lg">新しいルームを作成</h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="ルーム名（例: Sprint 42）"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
              maxLength={50}
            />
            <button
              type="submit"
              disabled={creating || !roomName.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium rounded-xl py-3 text-sm transition"
            >
              {creating ? "作成中..." : "ルームを作成"}
            </button>
          </form>
        </div>

        {/* 区切り */}
        <div className="flex items-center gap-3 text-gray-400 text-sm">
          <div className="flex-1 border-t border-gray-200" />
          <span>または</span>
          <div className="flex-1 border-t border-gray-200" />
        </div>

        {/* ルーム参加 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-700 text-lg">ルームに参加</h2>
          <form onSubmit={handleJoin} className="space-y-3">
            <input
              type="text"
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
              placeholder="ルームIDを入力"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
            />
            <button
              type="submit"
              disabled={joining || !joinId.trim()}
              className="w-full bg-gray-800 hover:bg-gray-900 disabled:bg-gray-300 text-white font-medium rounded-xl py-3 text-sm transition"
            >
              {joining ? "参加中..." : "ルームに参加"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
