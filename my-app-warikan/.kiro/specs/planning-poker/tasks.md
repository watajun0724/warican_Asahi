# Tasks — Planning Poker

## ステータス凡例
- `[x]` 完了
- `[ ]` 未着手
- `[~]` 進行中

---

## Phase 1: 基盤セットアップ

- [x] **T-01** Supabase プロジェクト作成
  - [x] `supabase/schema.sql` を SQL Editor で実行
  - [x] rooms / participants テーブルの Realtime を ON に設定
  - [x] RLS ポリシー（全員読み書き可）を適用

- [x] **T-02** Next.js プロジェクトに依存パッケージを追加
  - [x] `@supabase/supabase-js` をインストール
  - [x] `.env.local` に `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` を設定

- [x] **T-03** Supabase クライアントと型定義を作成
  - [x] `lib/supabase.ts` — `createClient` / `Room` / `Participant` / `CARD_VALUES`

---

## Phase 2: コア機能実装

- [x] **T-04** ホームページ（ルーム作成・参加）
  - [x] ルーム名入力フォーム → `rooms` INSERT → `/room/[id]` へリダイレクト
  - [x] 作成時に `sessionStorage.setItem('poker_creator_<id>', '1')` を保存
  - [x] ルームID入力フォーム → 存在確認 → `/room/[id]` へリダイレクト
  - [x] 存在しないIDの場合エラーメッセージを表示

- [x] **T-05** ルームページ — 初期ロードと参加フロー
  - [x] ルーム情報・参加者一覧を Supabase から取得
  - [x] sessionStorage からの参加状態・権限復元
  - [x] 未参加の場合、名前入力モーダルを表示
  - [x] 名前入力 → `participants` INSERT → `sessionStorage` に参加者ID保存

- [x] **T-06** ルームページ — Realtime サブスクリプション
  - [x] `room:<id>` チャンネルを購読
  - [x] `rooms` UPDATE → `setRoom()`
  - [x] `participants` INSERT/UPDATE/DELETE → `setParticipants()`
  - [x] コンポーネントアンマウント時にチャンネルを解除

- [x] **T-07** カード投票コンポーネント（PokerCard）
  - [x] フィボナッチカード（`1,2,3,5,8,13,21,?,☕`）を表示
  - [x] 選択・取り消し（同じカード再押し）ロジック
  - [x] `participants` UPDATE で投票値を保存
  - [x] オープン後は選択不可（`disabled` prop）
  - [x] 選択時の浮き上がりアニメーション

- [x] **T-08** 参加者一覧コンポーネント（ParticipantList）
  - [x] 参加順（`created_at` ASC）でソート
  - [x] 投票進捗バー
  - [x] 未投票者バッジ（amber + pulse）
  - [x] カード表示（伏せ/公開の切り替え）
  - [x] 結果パネル（最頻値・平均）

- [x] **T-09** オープン・リセットボタン
  - [x] ファシリテーターにのみ表示
  - [x] 全員投票済みでなければオープンボタンを disabled
  - [x] オープン: `rooms.is_open = true`
  - [x] リセット: 全参加者の `vote = null` + `rooms.is_open = false`

---

## Phase 3: UX改善

- [x] **T-10** 招待共有機能
  - [x] 「招待URL」ボタンで URL をクリップボードコピー
  - [x] ルームID横📋ボタンで ID をクリップボードコピー
  - [x] トーストコンポーネント（Toast.tsx）でコピー成功を通知

- [x] **T-11** ファシリテーター以外へのステータス表示
  - [x] 全員投票済み → "✅ 全員投票済み — ファシリテーターがオープンします"
  - [x] 投票中 → "⏳ 投票を待っています（N / M）"

---

## Phase 4: テスト・品質

- [x] **T-12** 不要ファイルの削除
  - [x] `public/*.svg`（デフォルトSVG）
  - [x] `AGENTS.md` / `CLAUDE.md` / `README.md`（自動生成ファイル）

- [ ] **T-13** Spec 文書の整備
  - [x] `requirements.md` — ユーザーストーリー・受け入れ条件
  - [x] `design.md` — アーキテクチャ・DB設計・コンポーネント設計
  - [x] `tasks.md` — このファイル

- [ ] **T-14** テスト環境構築
  - [ ] Vitest + @testing-library/react のセットアップ
  - [ ] `vitest.config.ts` の作成
  - [ ] テスト用セットアップファイルの作成

- [ ] **T-15** ユニットテスト実装
  - [ ] `lib/supabase.ts` — 定数・型の検証
  - [ ] `ParticipantList` — 最頻値/平均計算・ソートロジック
  - [ ] `PokerCard` — 選択・取り消しインタラクション
  - [ ] `Toast` — 表示/非表示の切り替え

---

## Phase 5: デプロイ

- [ ] **T-16** AWS Amplify Hosting の環境変数設定
  - [ ] `NEXT_PUBLIC_SUPABASE_URL` を Amplify コンソールに追加
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` を Amplify コンソールに追加

- [ ] **T-17** 本番デプロイ・動作確認
  - [ ] `npm run build` でビルドエラーがないことを確認
  - [ ] 複数ブラウザで同一ルームに入り Realtime 同期を確認
  - [ ] スマートフォンブラウザでのレイアウト確認
