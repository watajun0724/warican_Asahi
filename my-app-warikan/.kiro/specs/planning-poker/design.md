# Design — Planning Poker

## アーキテクチャ概要

```
┌─────────────────────────────────────────┐
│         AWS Amplify Hosting             │
│                                         │
│  Next.js 16 (App Router / Client Components)
│                                         │
│  ┌──────────┐  ┌──────────────────────┐ │
│  │ / (Home) │  │ /room/[id] (Room)    │ │
│  └──────────┘  └──────────────────────┘ │
└────────────────────┬────────────────────┘
                     │ @supabase/supabase-js
          ┌──────────▼──────────┐
          │      Supabase       │
          │                     │
          │  PostgreSQL (DB)    │
          │  Realtime (WS)      │
          └─────────────────────┘
```

---

## ディレクトリ構成

```
my-app-warikan/
├── app/
│   ├── layout.tsx              # ルートレイアウト（フォント・メタデータ）
│   ├── globals.css             # グローバルスタイル + カスタムアニメーション
│   ├── page.tsx                # ホームページ（ルーム作成・参加）
│   └── room/
│       └── [id]/
│           └── page.tsx        # ルームページ（メインロジック）
├── components/
│   ├── PokerCard.tsx           # カード選択UI
│   ├── ParticipantList.tsx     # 参加者一覧・投票状況・結果表示
│   └── Toast.tsx               # トースト通知
├── lib/
│   └── supabase.ts             # Supabaseクライアント・型定義・定数
├── supabase/
│   └── schema.sql              # テーブル定義・RLS・Realtimeセットアップ
└── .kiro/
    └── specs/planning-poker/
        ├── requirements.md
        ├── design.md           # このファイル
        └── tasks.md
```

---

## データベース設計

### rooms テーブル

| カラム | 型 | 説明 |
|---|---|---|
| id | TEXT (PK) | `gen_random_uuid()::text` で自動生成 |
| name | TEXT | ルーム名（最大50文字） |
| is_open | BOOLEAN | `false` = 伏せ / `true` = オープン |
| created_at | TIMESTAMPTZ | 作成日時 |

### participants テーブル

| カラム | 型 | 説明 |
|---|---|---|
| id | TEXT (PK) | `gen_random_uuid()::text` で自動生成 |
| room_id | TEXT (FK) | `rooms.id` への外部キー（CASCADE DELETE） |
| name | TEXT | 表示名（最大20文字） |
| vote | TEXT \| NULL | `null` = 未投票 / 文字列 = 投票済み |
| created_at | TIMESTAMPTZ | 参加日時（参加順ソートに使用） |

### RLS ポリシー

全テーブルで `FOR ALL USING (true)` — 認証不要の匿名アクセスを許可。

### Realtime 設定

```sql
ALTER TABLE rooms        REPLICA IDENTITY FULL;
ALTER TABLE participants REPLICA IDENTITY FULL;
```

Supabase ダッシュボード → Database → Replication で両テーブルの Realtime を ON にする。

---

## 状態管理

### sessionStorage キー

| キー | 値 | 用途 |
|---|---|---|
| `poker_participant_<roomId>` | participant.id | 自分の参加者IDを復元 |
| `poker_creator_<roomId>` | `"1"` | ファシリテーター権限の判定 |

ページをリロードしても参加状態・権限を維持するためにブラウザの sessionStorage を使用。
サーバーサイドに権限情報を持たないシンプルな設計。

### React State（RoomPage）

| state | 型 | 説明 |
|---|---|---|
| `room` | `Room \| null` | ルーム情報 |
| `participants` | `Participant[]` | 参加者一覧（Realtimeで随時更新） |
| `myId` | `string \| null` | 自分の participant.id |
| `isCreator` | `boolean` | ファシリテーター権限 |
| `loading` | `boolean` | 初回ロード中フラグ |
| `toast` | `{ show, message }` | トースト通知状態 |

---

## Realtime 購読設計

`/room/[id]` ページでは Supabase Realtime チャンネル `room:<roomId>` を購読する。

```
channel: "room:<id>"
├── rooms (event: *)       filter: id=eq.<id>
│    └── UPDATE → setRoom()
└── participants (event: *) filter: room_id=eq.<id>
     ├── INSERT → setParticipants(prev => [...prev, new])
     ├── UPDATE → setParticipants(prev => prev.map(...))
     └── DELETE → setParticipants(prev => prev.filter(...))
```

重複 INSERT を防ぐため、INSERT ハンドラで既存IDチェックを行う。

---

## コンポーネント設計

### PokerCard

```
Props:
  selectedValue: string | null  -- 選択中のカード値
  onSelect: (value: CardValue) => void
  disabled: boolean             -- オープン後は true

表示ロジック:
  - 選択中: -translate-y-3 scale-110 + ring（浮き上がり）
  - ホバー: hover:-translate-y-2 hover:scale-105
  - disabled: opacity-50 cursor-not-allowed
  - 同じカードを再選択 → onSelect で null を渡し取り消し
```

### ParticipantList

```
Props:
  participants: Participant[]
  isOpen: boolean
  myId: string | null

表示ロジック:
  - 参加順ソート（created_at ASC）
  - 投票進捗バー（votedCount / total）
  - 未投票者バッジ（amber + animate-pulse）: !isOpen && vote === null
  - カード表示:
      isOpen + voted    → indigo（投票値を公開）
      isOpen + not voted → gray（"—"）
      !isOpen + voted   → dark gray（"✓" 伏せ）
      !isOpen + not voted → dashed gray（"…"）
  - 結果パネル（isOpen のみ）:
      最頻値: 数値投票の最頻出値
      平均: 数値投票の算術平均（小数1桁）
      ? ☕ は集計除外
```

### Toast

```
Props:
  message: string
  show: boolean

動作:
  - show=true  → visible=true（即座に表示）
  - show=false → 300ms後に visible=false（フェードアウト後に DOM から除去）
  - 位置: fixed bottom-6 left-1/2（画面下中央）
  - role="status" aria-live="polite"
```

---

## 画面フロー

```
/ (ホーム)
 │
 ├─[ルーム作成]─────────────────────────────────────┐
 │  ルーム名入力 → Supabase INSERT → sessionStorage  │
 │  poker_creator_<id> = "1"                         │
 │                                                   ▼
 └─[ルームID入力・直接URL]──→ /room/[id]
                                │
                                ├─ 名前入力画面（myId が null の場合）
                                │   名前入力 → INSERT participant
                                │   sessionStorage: poker_participant_<id>
                                │
                                └─ メイン画面
                                    ├─ カード選択エリア（PokerCard）
                                    ├─ オープン/リセットボタン（作成者のみ）
                                    │   or ステータステキスト（参加者）
                                    └─ 参加者一覧（ParticipantList）
                                        └─ 結果パネル（isOpen のみ）
```

---

## 技術スタック

| 項目 | 選定 | 理由 |
|---|---|---|
| フレームワーク | Next.js 16 (App Router) | 既存構成 |
| スタイリング | Tailwind CSS v4 | 既存構成 |
| DB / Realtime | Supabase | WebSocket が容易、無料枠で十分 |
| ホスティング | AWS Amplify Hosting | 既存構成 |
| 認証 | なし（匿名） | チーム内ツールのため不要 |
| 状態管理 | React useState + Realtime | 外部ライブラリ不要なシンプルさ |
