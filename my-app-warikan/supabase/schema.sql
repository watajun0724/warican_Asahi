-- ============================================================
-- Planning Poker Schema
-- Supabase の SQL Editor にそのまま貼り付けて実行してください
-- ============================================================

-- ルーム
CREATE TABLE IF NOT EXISTS rooms (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name       TEXT NOT NULL,
  is_open    BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 参加者
CREATE TABLE IF NOT EXISTS participants (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  room_id    TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  vote       TEXT,          -- null = 未投票, それ以外 = 投票済み
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_participants_room_id ON participants(room_id);

-- ============================================================
-- Realtime を有効化（テーブルの変更をブロードキャスト）
-- ============================================================
ALTER TABLE rooms        REPLICA IDENTITY FULL;
ALTER TABLE participants REPLICA IDENTITY FULL;

-- Supabase ダッシュボード → Database → Replication で
-- rooms と participants の Realtime を ON にしてください

-- ============================================================
-- Row Level Security (RLS) — 全員読み書き可（シンプル運用）
-- ============================================================
ALTER TABLE rooms        ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rooms_all"        ON rooms        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "participants_all" ON participants  FOR ALL USING (true) WITH CHECK (true);
