import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ParticipantList from "@/components/ParticipantList";
import type { Participant } from "@/lib/supabase";

// ─────────────────────────────────────────────────────────────
// テストデータファクトリ
// ─────────────────────────────────────────────────────────────

function makeParticipant(
  overrides: Partial<Participant> & { id: string; name: string }
): Participant {
  return {
    room_id: "room-1",
    vote: null,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

// created_at を少しずつずらして参加順を確定
function makeParticipants(names: string[], votes: (string | null)[]): Participant[] {
  return names.map((name, i) =>
    makeParticipant({
      id: `p-${i + 1}`,
      name,
      vote: votes[i],
      created_at: new Date(Date.now() + i * 1000).toISOString(),
    })
  );
}

// ─────────────────────────────────────────────────────────────
// 空状態
// ─────────────────────────────────────────────────────────────

describe("ParticipantList — 空状態", () => {
  it("参加者がいない場合、招待メッセージを表示する", () => {
    render(<ParticipantList participants={[]} isOpen={false} myId={null} />);
    expect(screen.getByText(/まだ参加者がいません/)).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────
// 投票状況
// ─────────────────────────────────────────────────────────────

describe("ParticipantList — 投票状況", () => {
  it("投票人数を「N / M 人」形式で表示する", () => {
    const participants = makeParticipants(
      ["Alice", "Bob", "Carol"],
      ["5", null, "8"]
    );
    render(<ParticipantList participants={participants} isOpen={false} myId={null} />);
    expect(screen.getByText("2 / 3 人")).toBeInTheDocument();
  });

  it("全員投票済みの場合、「3 / 3 人」と表示する", () => {
    const participants = makeParticipants(["Alice", "Bob", "Carol"], ["5", "8", "13"]);
    render(<ParticipantList participants={participants} isOpen={false} myId={null} />);
    expect(screen.getByText("3 / 3 人")).toBeInTheDocument();
  });

  it("未投票者のバッジを表示する（isOpen=false のとき）", () => {
    const participants = makeParticipants(["Alice", "Bob"], ["5", null]);
    render(<ParticipantList participants={participants} isOpen={false} myId={null} />);
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("待機中:")).toBeInTheDocument();
  });

  it("全員投票済みなら未投票者バッジを表示しない", () => {
    const participants = makeParticipants(["Alice", "Bob"], ["5", "8"]);
    render(<ParticipantList participants={participants} isOpen={false} myId={null} />);
    expect(screen.queryByText("待機中:")).not.toBeInTheDocument();
  });

  it("isOpen=true のとき未投票者バッジを表示しない", () => {
    const participants = makeParticipants(["Alice", "Bob"], ["5", null]);
    render(<ParticipantList participants={participants} isOpen={true} myId={null} />);
    expect(screen.queryByText("待機中:")).not.toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────
// 参加順ソート
// ─────────────────────────────────────────────────────────────

describe("ParticipantList — 参加順ソート", () => {
  it("created_at の昇順（参加順）で表示する", () => {
    // 逆順で渡してもUIでは参加順に並ぶことを確認
    const participants = [
      makeParticipant({ id: "p-3", name: "Carol", created_at: new Date(3000).toISOString() }),
      makeParticipant({ id: "p-1", name: "Alice", created_at: new Date(1000).toISOString() }),
      makeParticipant({ id: "p-2", name: "Bob",   created_at: new Date(2000).toISOString() }),
    ];
    render(<ParticipantList participants={participants} isOpen={false} myId={null} />);

    const names = screen.getAllByText(/Alice|Bob|Carol/).map((el) => el.textContent);
    const firstAlice = names.findIndex((n) => n?.includes("Alice"));
    const firstBob   = names.findIndex((n) => n?.includes("Bob"));
    const firstCarol = names.findIndex((n) => n?.includes("Carol"));
    expect(firstAlice).toBeLessThan(firstBob);
    expect(firstBob).toBeLessThan(firstCarol);
  });
});

// ─────────────────────────────────────────────────────────────
// 結果パネル（isOpen=true）
// ─────────────────────────────────────────────────────────────

describe("ParticipantList — 結果パネル", () => {
  it("isOpen=false のとき結果パネルを表示しない", () => {
    const participants = makeParticipants(["Alice", "Bob"], ["5", "8"]);
    render(<ParticipantList participants={participants} isOpen={false} myId={null} />);
    expect(screen.queryByText("結果")).not.toBeInTheDocument();
  });

  it("isOpen=true のとき結果パネルを表示する", () => {
    const participants = makeParticipants(["Alice", "Bob"], ["5", "8"]);
    render(<ParticipantList participants={participants} isOpen={true} myId={null} />);
    expect(screen.getByText("結果")).toBeInTheDocument();
    expect(screen.getByText("最頻値")).toBeInTheDocument();
    expect(screen.getByText("平均")).toBeInTheDocument();
  });

  it("平均を正しく計算する: (5+8+13)/3 = 8.7", () => {
    const participants = makeParticipants(["A", "B", "C"], ["5", "8", "13"]);
    render(<ParticipantList participants={participants} isOpen={true} myId={null} />);
    expect(screen.getByText("8.7")).toBeInTheDocument();
  });

  it("平均を正しく計算する: (5+5+5)/3 = 5.0", () => {
    const participants = makeParticipants(["A", "B", "C"], ["5", "5", "5"]);
    render(<ParticipantList participants={participants} isOpen={true} myId={null} />);
    // 5.0 と表示される
    expect(screen.getByText("5.0")).toBeInTheDocument();
  });

  it("最頻値を正しく計算する: [5, 5, 8] → 5", () => {
    const participants = makeParticipants(["A", "B", "C"], ["5", "5", "8"]);
    render(<ParticipantList participants={participants} isOpen={true} myId={null} />);
    // 最頻値「5」が表示される（複数の5があるため）
    // 平均は (5+5+8)/3 = 6.0
    expect(screen.getByText("6.0")).toBeInTheDocument();
    // 最頻値エリアで 5 が表示される
    const modeSection = screen.getByText("最頻値").closest("div")!;
    expect(modeSection).toHaveTextContent("5");
  });

  it("? と ☕ は集計から除外される", () => {
    const participants = makeParticipants(["A", "B", "C"], ["5", "?", "☕"]);
    render(<ParticipantList participants={participants} isOpen={true} myId={null} />);
    // 数値投票は 5 のみ → 平均 5.0
    expect(screen.getByText("5.0")).toBeInTheDocument();
  });

  it("全員が ? か ☕ の場合、平均・最頻値は「-」を表示する", () => {
    const participants = makeParticipants(["A", "B"], ["?", "☕"]);
    render(<ParticipantList participants={participants} isOpen={true} myId={null} />);
    const dashes = screen.getAllByText("-");
    expect(dashes.length).toBeGreaterThanOrEqual(2);
  });
});

// ─────────────────────────────────────────────────────────────
// 自分のカードのハイライト
// ─────────────────────────────────────────────────────────────

describe("ParticipantList — 自分のカード表示", () => {
  it("自分のカードに「（あなた）」を表示する", () => {
    const participants = makeParticipants(["Alice", "Bob"], [null, null]);
    render(
      <ParticipantList participants={participants} isOpen={false} myId="p-1" />
    );
    expect(screen.getByText(/あなた/)).toBeInTheDocument();
  });

  it("myId が null のとき「（あなた）」を表示しない", () => {
    const participants = makeParticipants(["Alice", "Bob"], [null, null]);
    render(
      <ParticipantList participants={participants} isOpen={false} myId={null} />
    );
    expect(screen.queryByText(/あなた/)).not.toBeInTheDocument();
  });
});
