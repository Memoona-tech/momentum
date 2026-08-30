import React from "react";

export default function ProgressBar({
  percent,
  color = "#c9a44c",
  height = 6,
}: {
  percent: number;
  color?: string;
  height?: number;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="w-full bg-void-700 rounded-full overflow-hidden" style={{ height }}>
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${clamped}%`, backgroundColor: color }}
      />
    </div>
  );
}
