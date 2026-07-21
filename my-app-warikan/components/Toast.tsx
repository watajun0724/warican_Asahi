"use client";

import { useEffect, useState } from "react";

type Props = {
  message: string;
  show: boolean;
};

export default function Toast({ message, show }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
    } else {
      // フェードアウト用に少し遅らせて非表示
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!visible) return null;

  return (
    <div
      className={[
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
        "bg-gray-800 text-white text-sm font-medium",
        "px-5 py-3 rounded-full shadow-lg",
        "flex items-center gap-2",
        "transition-all duration-300",
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
      ].join(" ")}
      role="status"
      aria-live="polite"
    >
      <span className="text-green-400">✓</span>
      {message}
    </div>
  );
}
