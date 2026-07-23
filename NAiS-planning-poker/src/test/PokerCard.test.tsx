import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PokerCard } from "@/components/PokerCard";

describe("PokerCard", () => {
  it("カード値が表示される", () => {
    render(<PokerCard value="5" />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("選択済み状態のaria-pressedがtrueになる", () => {
    render(<PokerCard value="8" selected={true} />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("未選択状態のaria-pressedがfalseになる", () => {
    render(<PokerCard value="8" selected={false} />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
  });

  it("クリックイベントが発火する", () => {
    const onClick = vi.fn();
    render(<PokerCard value="13" onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("disabled 時はクリックできない", () => {
    const onClick = vi.fn();
    render(<PokerCard value="13" disabled={true} onClick={onClick} />);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("アクセシビリティラベルが設定されている", () => {
    render(<PokerCard value="☕" />);
    expect(screen.getByLabelText("カード ☕ を選択")).toBeInTheDocument();
  });
});
