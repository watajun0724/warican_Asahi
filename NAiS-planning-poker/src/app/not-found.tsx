import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="text-6xl mb-4" aria-hidden="true">🔍</div>
      <h1 className="text-2xl font-bold text-white mb-2">ルームが見つかりません</h1>
      <p className="text-slate-400 text-sm mb-6">
        URLが間違っているか、ルームが期限切れになっています。
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors"
      >
        ホームに戻る
      </Link>
    </main>
  );
}
