-- NAiS Planning Poker - Initial Schema

-- 既存テーブルをクリーンアップ（再実行時の安全のため）
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS participants CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;

-- rooms テーブル
CREATE TABLE rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  topic text,
  status text NOT NULL DEFAULT 'voting' CHECK (status IN ('voting', 'revealed')),
  facilitator_id uuid,
  round integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours')
);

-- participants テーブル
CREATE TABLE participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  name text NOT NULL,
  is_online boolean NOT NULL DEFAULT true,
  joined_at timestamptz NOT NULL DEFAULT now()
);

-- votes テーブル
CREATE TABLE votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  round integer NOT NULL DEFAULT 1,
  value text NOT NULL,
  voted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (room_id, participant_id, round)
);

-- rooms の facilitator_id FK を後から追加（循環参照を避けるため）
ALTER TABLE rooms DROP CONSTRAINT IF EXISTS fk_facilitator;
ALTER TABLE rooms ADD CONSTRAINT fk_facilitator
  FOREIGN KEY (facilitator_id) REFERENCES participants(id) ON DELETE SET NULL;

-- インデックス
CREATE INDEX IF NOT EXISTS idx_participants_room_id ON participants(room_id);
CREATE INDEX IF NOT EXISTS idx_votes_room_id ON votes(room_id);
CREATE INDEX IF NOT EXISTS idx_votes_room_round ON votes(room_id, round);

-- RLS 有効化
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- rooms ポリシー
DROP POLICY IF EXISTS "rooms_public_read" ON rooms;
DROP POLICY IF EXISTS "rooms_public_insert" ON rooms;
DROP POLICY IF EXISTS "rooms_public_update" ON rooms;
CREATE POLICY "rooms_public_read" ON rooms FOR SELECT USING (true);
CREATE POLICY "rooms_public_insert" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "rooms_public_update" ON rooms FOR UPDATE USING (true);

-- participants ポリシー
DROP POLICY IF EXISTS "participants_public_read" ON participants;
DROP POLICY IF EXISTS "participants_public_insert" ON participants;
DROP POLICY IF EXISTS "participants_public_update" ON participants;
CREATE POLICY "participants_public_read" ON participants FOR SELECT USING (true);
CREATE POLICY "participants_public_insert" ON participants FOR INSERT WITH CHECK (true);
CREATE POLICY "participants_public_update" ON participants FOR UPDATE USING (true);

-- votes ポリシー
DROP POLICY IF EXISTS "votes_public_read" ON votes;
DROP POLICY IF EXISTS "votes_public_insert" ON votes;
DROP POLICY IF EXISTS "votes_public_update" ON votes;
DROP POLICY IF EXISTS "votes_public_delete" ON votes;
CREATE POLICY "votes_public_read" ON votes FOR SELECT USING (true);
CREATE POLICY "votes_public_insert" ON votes FOR INSERT WITH CHECK (true);
CREATE POLICY "votes_public_update" ON votes FOR UPDATE USING (true);
CREATE POLICY "votes_public_delete" ON votes FOR DELETE USING (true);

-- Realtime 有効化
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE participants;
ALTER PUBLICATION supabase_realtime ADD TABLE votes;
