import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NAiS Planning Poker",
  description: "アジャイル開発チームのためのリアルタイムプランニングポーカー",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-slate-900 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
