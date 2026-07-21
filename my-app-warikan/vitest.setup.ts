import "@testing-library/jest-dom";
import { vi } from "vitest";

// @supabase/supabase-js のモック
// テスト内で Supabase クライアントの実際の接続を発生させない
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({})),
}));
