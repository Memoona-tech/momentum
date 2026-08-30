import React from "react";
import { Category } from "@/lib/types";
import { getIcon } from "@/lib/icons";

export default function CategoryTag({ category }: { category?: Category | null }) {
  if (!category) return null;
  const Icon = getIcon(category.icon);
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border"
      style={{
        backgroundColor: `${category.color}14`,
        borderColor: `${category.color}33`,
        color: category.color,
      }}
    >
      <Icon size={11} strokeWidth={1.75} />
      {category.name}
    </span>
  );
}
