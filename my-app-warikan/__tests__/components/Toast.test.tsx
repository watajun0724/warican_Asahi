import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import Toast from "@/components/Toast";

// ─────────────────────────────────────────────────────────────
// Toast — 表示・非表示・アクセシビリティ
// ─────────────────────────────────────────────────────────────

describe("Toast — 表示制御", () => {
  it("show=true のときメッセージを表示する", () => {
    render(<Toast message="コピーしました" show={true} />);
    expect(screen.getByText("コピーしました")).toBeInTheDocument();
  });

  it("show=false のとき（初期状態）何も表示しない", () => {
    render(<Toast message="コピーしました" show={false} />);
    expect(screen.queryByText("コピーしました")).not.toBeInTheDocument();
  });

  it("show=true → false になって 300ms 後に DOM から消える", async () => {
    vi.useFakeTimers();
    const { rerender } = render(<Toast message="コピーしました" show={true} />);
    expect(screen.getByText("コピーしました")).toBeInTheDocument();

    rerender(<Toast message="コピーしました" show={false} />);
    // 300ms 経過前はまだ表示中
    act(() => { vi.advanceTimersByTime(299); });
    expect(screen.getByText("コピーしました")).toBeInTheDocument();

    // 300ms 経過後は非表示
    act(() => { vi.advanceTimersByTime(1); });
    expect(screen.queryByText("コピーしました")).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  it("show=false → true に変わるとすぐ表示される", () => {
    const { rerender } = render(<Toast message="招待URLをコピーしました" show={false} />);
    expect(screen.queryByText("招待URLをコピーしました")).not.toBeInTheDocument();
    rerender(<Toast message="招待URLをコピーしました" show={true} />);
    expect(screen.getByText("招待URLをコピーしました")).toBeInTheDocument();
  });
});

describe("Toast — アクセシビリティ", () => {
  it('role="status" を持つ', () => {
    render(<Toast message="コピーしました" show={true} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it('aria-live="polite" を持つ', () => {
    render(<Toast message="コピーしました" show={true} />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
  });
});

describe("Toast — メッセージ内容", () => {
  it("渡したメッセージをそのまま表示する", () => {
    const msg = "ルームIDをコピーしました";
    render(<Toast message={msg} show={true} />);
    expect(screen.getByText(msg)).toBeInTheDocument();
  });

  it("メッセージが変わっても正しく表示される", () => {
    const { rerender } = render(<Toast message="最初のメッセージ" show={true} />);
    expect(screen.getByText("最初のメッセージ")).toBeInTheDocument();
    rerender(<Toast message="次のメッセージ" show={true} />);
    expect(screen.getByText("次のメッセージ")).toBeInTheDocument();
  });
});
