import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PokerCard from "@/components/PokerCard";
import { CARD_VALUES } from "@/lib/supabase";

// ─────────────────────────────────────────────────────────────
// PokerCard — カード表示・選択・取り消しのテスト
// ─────────────────────────────────────────────────────────────

describe("PokerCard — カード表示", () => {
  it("9枚のカードをすべて表示する", () => {
    render(<PokerCard selectedValue={null} onSelect={vi.fn()} disabled={false} />);
    CARD_VALUES.forEach((val) => {
      expect(screen.getByText(val)).toBeInTheDocument();
    });
  });

  it("未選択状態では「カードを選んでください」と表示する", () => {
    render(<PokerCard selectedValue={null} onSelect={vi.fn()} disabled={false} />);
    expect(screen.getByText("カードを選んでください")).toBeInTheDocument();
  });

  it("disabled=true のとき「投票はすでにオープンされています」と表示する", () => {
    render(<PokerCard selectedValue={null} onSelect={vi.fn()} disabled={true} />);
    expect(screen.getByText("投票はすでにオープンされています")).toBeInTheDocument();
  });

  it("選択中のカード値を「〜を選択中」テキストで表示する", () => {
    render(<PokerCard selectedValue="5" onSelect={vi.fn()} disabled={false} />);
    expect(screen.getByText(/「5」を選択中/)).toBeInTheDocument();
  });

  it("disabled=true のとき選択中テキストを表示しない", () => {
    render(<PokerCard selectedValue="5" onSelect={vi.fn()} disabled={true} />);
    expect(screen.queryByText(/を選択中/)).not.toBeInTheDocument();
  });
});

describe("PokerCard — aria-pressed 状態", () => {
  it("選択されたカードの aria-pressed が true になる", () => {
    render(<PokerCard selectedValue="8" onSelect={vi.fn()} disabled={false} />);
    const btn = screen.getByRole("button", { name: "8" });
    expect(btn).toHaveAttribute("aria-pressed", "true");
  });

  it("選択されていないカードの aria-pressed が false になる", () => {
    render(<PokerCard selectedValue="8" onSelect={vi.fn()} disabled={false} />);
    const btn = screen.getByRole("button", { name: "5" });
    expect(btn).toHaveAttribute("aria-pressed", "false");
  });

  it("selectedValue=null のとき全カードの aria-pressed が false になる", () => {
    render(<PokerCard selectedValue={null} onSelect={vi.fn()} disabled={false} />);
    CARD_VALUES.forEach((val) => {
      const btn = screen.getByRole("button", { name: val });
      expect(btn).toHaveAttribute("aria-pressed", "false");
    });
  });
});

describe("PokerCard — クリックインタラクション", () => {
  it("カードをクリックすると onSelect が呼ばれる", async () => {
    const onSelect = vi.fn();
    render(<PokerCard selectedValue={null} onSelect={onSelect} disabled={false} />);
    await userEvent.click(screen.getByRole("button", { name: "5" }));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith("5");
  });

  it("disabled=true のときクリックしても onSelect が呼ばれない", async () => {
    const onSelect = vi.fn();
    render(<PokerCard selectedValue={null} onSelect={onSelect} disabled={true} />);
    // disabled なボタンはクリックイベントが発生しない
    const btn = screen.getByRole("button", { name: "5" });
    await userEvent.click(btn);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("全カード値でクリックが正しく onSelect を呼び出す", async () => {
    for (const val of CARD_VALUES) {
      const onSelect = vi.fn();
      const { unmount } = render(
        <PokerCard selectedValue={null} onSelect={onSelect} disabled={false} />
      );
      await userEvent.click(screen.getByRole("button", { name: val }));
      expect(onSelect).toHaveBeenCalledWith(val);
      unmount();
    }
  });

  it("選択済みカードを再クリックすると onSelect が同じ値で呼ばれる（取り消しは親が制御）", async () => {
    const onSelect = vi.fn();
    render(<PokerCard selectedValue="5" onSelect={onSelect} disabled={false} />);
    await userEvent.click(screen.getByRole("button", { name: "5" }));
    expect(onSelect).toHaveBeenCalledWith("5");
  });
});

describe("PokerCard — disabled 状態のボタン属性", () => {
  it("disabled=true のとき全ボタンが disabled 属性を持つ", () => {
    render(<PokerCard selectedValue={null} onSelect={vi.fn()} disabled={true} />);
    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => expect(btn).toBeDisabled());
  });

  it("disabled=false のとき全ボタンが disabled 属性を持たない", () => {
    render(<PokerCard selectedValue={null} onSelect={vi.fn()} disabled={false} />);
    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => expect(btn).not.toBeDisabled());
  });
});
