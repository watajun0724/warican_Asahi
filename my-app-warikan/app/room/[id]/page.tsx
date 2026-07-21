"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase, Room, Participant, CardValue } from "@/lib/supabase";
import PokerCard from "@/components/PokerCard";
import ParticipantList from "@/components/ParticipantList";
import Toast from "@/components/Toast";

export default function RoomPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  // ── 状態 ────────────────────────────────────────
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [myId, setMyId] = useState<string | null>(null);
  const [isCreator, setIsCreator] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [joining, setJoining] = useState(false);
  const [loading, setLoading] = useState(true);

  // トースト
  const [toast, setToast] = useState({ show: false, message: "" });

  function showToast(message: string) {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message }), 2200);
  }

  // ── 自分の投票値 ─────────────────────────────────
  const myVote = participants.find((p) => p.id === myId)?.vote ?? null;

  // ── 初回: ルーム取得 + 参加者取得 ───────────────────
  useEffect(() => {
    async function init() {
      const { data: roomData, error: roomErr } = await supabase
        .from("rooms")
        .select("*")
        .eq("id", id)
        .single();

      if (roomErr || !roomData) {
        router.replace("/");
        return;
      }
      setRoom(roomData as Room);

      const { data: pData } = await supabase
        .from("participants")
        .select("*")
        .eq("room_id", id)
        .order("created_at");

      setParticipants((pData as Participant[]) ?? []);

      // 自分のIDを sessionStorage から復元
      const savedId = sessionStorage.getItem(`poker_participant_${id}`);
      if (savedId) {
        const found = (pData as Participant[])?.find((p) => p.id === savedId);
        if (found) setMyId(savedId);
      }

      // ルーム作成者かどうかを判定（ホームで作成したとき保存済み）
      const creatorId = sessionStorage.getItem(`poker_creator_${id}`);
      if (creatorId) setIsCreator(true);

      setLoading(false);
    }
    init();
  }, [id, router]);

  // ── Realtime サブスクリプション ────────────────────
  useEffect(() => {
    if (loading) return;

    const channel = supabase
      .channel(`room:${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rooms", filter: `id=eq.${id}` },
        (payload) => {
          if (payload.eventType === "UPDATE") setRoom(payload.new as Room);
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "participants", filter: `room_id=eq.${id}` },
        (payload) => {
          setParticipants((prev) => {
            if (prev.find((p) => p.id === (payload.new as Participant).id)) return prev;
            return [...prev, payload.new as Participant];
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "participants", filter: `room_id=eq.${id}` },
        (payload) => {
          setParticipants((prev) =>
            prev.map((p) =>
              p.id === (payload.new as Participant).id ? (payload.new as Participant) : p
            )
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "participants", filter: `room_id=eq.${id}` },
        (payload) => {
          setParticipants((prev) =>
            prev.filter((p) => p.id !== (payload.old as Participant).id)
          );
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id, loading]);

  // ── 参加 ────────────────────────────────────────
  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!nameInput.trim()) return;
    setJoining(true);

    const { data, error } = await supabase
      .from("participants")
      .insert({ room_id: id, name: nameInput.trim() })
      .select()
      .single();

    setJoining(false);
    if (error || !data) return;

    sessionStorage.setItem(`poker_participant_${id}`, data.id);
    setMyId(data.id);
  }

  // ── カード選択 / 取り消し ────────────────────────
  const handleCardSelect = useCallback(
    async (value: CardValue) => {
      if (!myId || room?.is_open) return;
      const newVote = myVote === value ? null : value;
      await supabase.from("participants").update({ vote: newVote }).eq("id", myId);
    },
    [myId, myVote, room?.is_open]
  );

  // ── オープン（作成者のみ） ────────────────────────
  async function handleOpen() {
    await supabase.from("rooms").update({ is_open: true }).eq("id", id);
  }

  // ── リセット（作成者のみ） ────────────────────────
  async function handleReset() {
    await supabase.from("participants").update({ vote: null }).eq("room_id", id);
    await supabase.from("rooms").update({ is_open: false }).eq("id", id);
  }

  // ── URLコピー ────────────────────────────────────
  async function handleCopyUrl() {
    await navigator.clipboard.writeText(window.location.href);
    showToast("招待URLをコピーしました");
  }

  // ── IDコピー ─────────────────────────────────────
  async function handleCopyId() {
    await navigator.clipboard.writeText(id);
    showToast("ルームIDをコピーしました");
  }

  // ── 全員投票済みか ───────────────────────────────
  const allVoted =
    participants.length > 0 && participants.every((p) => p.vote !== null);
  const votedCount = participants.filter((p) => p.vote !== null).length;

  // ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
        <div className="text-gray-400 text-sm animate-pulse">読み込み中...</div>
      </div>
    );
  }

  if (!room) return null;

  // ── 名前入力画面 ─────────────────────────────────
  if (!myId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm space-y-5">
          <div className="text-center space-y-1">
            <div className="text-3xl">🃏</div>
            <h2 className="text-xl font-bold text-gray-800">{room.name}</h2>
            <p className="text-gray-400 text-sm">参加するあなたの名前を入力してください</p>
          </div>
          <form onSubmit={handleJoin} className="space-y-3">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="例: 田中"
              autoFocus
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
              maxLength={20}
            />
            <button
              type="submit"
              disabled={joining || !nameInput.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium rounded-xl py-3 text-sm transition"
            >
              {joining ? "参加中..." : "参加する"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── メイン画面 ───────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-4 pb-8">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* ヘッダー */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <h1 className="font-bold text-gray-800 text-lg truncate">{room.name}</h1>
              {/* ② ID + コピーボタン */}
              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
                <span className="truncate max-w-[200px] sm:max-w-none">ID: {id}</span>
                <button
                  onClick={handleCopyId}
                  className="shrink-0 hover:text-indigo-500 transition"
                  title="IDをコピー"
                  aria-label="ルームIDをコピー"
                >
                  📋
                </button>
              </div>
            </div>
            {/* ③ 招待URL ボタン */}
            <button
              onClick={handleCopyUrl}
              className="shrink-0 flex items-center gap-1.5 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 rounded-lg px-3 py-2 transition font-medium"
            >
              🔗 招待URL
            </button>
          </div>
        </div>

        {/* カード選択エリア */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <PokerCard
            selectedValue={myVote}
            onSelect={handleCardSelect}
            disabled={room.is_open}
          />
        </div>

        {/* ⑤ コントロールボタン（作成者のみ表示） */}
        {isCreator && (
          <div className="flex gap-3 justify-center">
            {!room.is_open ? (
              <button
                onClick={handleOpen}
                disabled={!allVoted}
                title={!allVoted ? "全員が投票するまで待ってください" : ""}
                className={[
                  "flex-1 max-w-xs py-3 rounded-xl font-bold text-sm transition shadow-sm",
                  allVoted
                    ? "bg-green-500 hover:bg-green-600 text-white shadow-green-100"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed",
                ].join(" ")}
              >
                {allVoted
                  ? "🚀 カードをオープン！"
                  : `⏳ 投票待ち（${votedCount}/${participants.length}）`}
              </button>
            ) : (
              <button
                onClick={handleReset}
                className="flex-1 max-w-xs py-3 rounded-xl font-bold text-sm bg-orange-500 hover:bg-orange-600 text-white transition shadow-sm shadow-orange-100"
              >
                🔄 次のラウンド
              </button>
            )}
          </div>
        )}

        {/* 作成者以外へのステータス表示 */}
        {!isCreator && !room.is_open && (
          <div className="text-center text-sm text-gray-400 py-1">
            {allVoted
              ? "✅ 全員投票済み — ファシリテーターがオープンします"
              : `⏳ 投票を待っています（${votedCount} / ${participants.length}）`}
          </div>
        )}

        {/* 参加者一覧 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-700 text-sm mb-4">参加者</h2>
          <ParticipantList
            participants={participants}
            isOpen={room.is_open}
            myId={myId}
          />
        </div>

      </div>

      {/* トースト通知 */}
      <Toast message={toast.message} show={toast.show} />
    </div>
  );
}
