# NAiS Planning Poker - DB設計書

## ER図

```
rooms
  └─< participants
  └─< votes
```

---

## テーブル定義

### rooms（ルーム）

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | uuid | PK, default gen_random_uuid() | ルームID |
| name | text | NOT NULL | ルーム名（表示用） |
| topic | text | | 現在のストーリー名 |
| status | text | NOT NULL, default 'voting' | 'voting' \| 'revealed' |
| facilitator_id | uuid | | ファシリテーターの participant.id |
| created_at | timestamptz | NOT NULL, default now() | 作成日時 |
| expires_at | timestamptz | NOT NULL | 有効期限（24時間後） |

### participants（参加者）

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | uuid | PK, default gen_random_uuid() | 参加者ID |
| room_id | uuid | FK → rooms.id, NOT NULL | 所属ルーム |
| name | text | NOT NULL | 表示名 |
| is_online | boolean | NOT NULL, default true | オンライン状態 |
| joined_at | timestamptz | NOT NULL, default now() | 参加日時 |

### votes（投票）

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | uuid | PK, default gen_random_uuid() | 投票ID |
| room_id | uuid | FK → rooms.id, NOT NULL | 所属ルーム |
| participant_id | uuid | FK → participants.id, NOT NULL | 投票者 |
| round | integer | NOT NULL, default 1 | ラウンド番号 |
| value | text | NOT NULL | 投票値（'1','2','3','5','8','13','21','?','☕'） |
| voted_at | timestamptz | NOT NULL, default now() | 投票日時 |

**ユニーク制約**: (room_id, participant_id, round)

---

## インデックス

```sql
CREATE INDEX idx_participants_room_id ON participants(room_id);
CREATE INDEX idx_votes_room_id ON votes(room_id);
CREATE INDEX idx_votes_room_round ON votes(room_id, round);
```

---

## RLS（Row Level Security）ポリシー

全テーブルで RLS を有効化し、匿名ユーザーも読み書き可能にする（ルームIDを知っている人のみアクセス可能）。

```sql
-- rooms: 誰でも作成・読み取り可能
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rooms_public_read" ON rooms FOR SELECT USING (true);
CREATE POLICY "rooms_public_insert" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "rooms_public_update" ON rooms FOR UPDATE USING (true);

-- participants: 誰でも作成・読み取り可能
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "participants_public_read" ON participants FOR SELECT USING (true);
CREATE POLICY "participants_public_insert" ON participants FOR INSERT WITH CHECK (true);
CREATE POLICY "participants_public_update" ON participants FOR UPDATE USING (true);

-- votes: 誰でも作成・読み取り可能
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "votes_public_read" ON votes FOR SELECT USING (true);
CREATE POLICY "votes_public_insert" ON votes FOR INSERT WITH CHECK (true);
CREATE POLICY "votes_public_upsert" ON votes FOR UPDATE USING (true);
```

---

## Realtime 設定

Supabase Realtime を以下のテーブルで有効化：

- `rooms` → ステータス変更（公開・リセット）を全員に通知
- `participants` → 入退室をリアルタイム反映
- `votes` → 投票状況をリアルタイム反映

---

## マイグレーションファイル

`supabase/migrations/20240101000000_initial_schema.sql` に定義。
