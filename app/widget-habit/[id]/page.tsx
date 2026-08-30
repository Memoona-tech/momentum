"use client";

import React from "react";
import { useData } from "@/lib/DataContext";
import {
  buildContributionGrid,
  currentStreak,
  longestStreak,
} from "@/lib/schedule";
import { getIcon } from "@/lib/icons";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";

export default function WidgetHabitPage() {
  const params = useParams();
  const habitId = params.id as string;
  const { habits, categories, logs, settings } = useData();

  const habit = habits.find((h) => h.id === habitId);
  if (!habit) {
    return (
      <div className="min-h-screen bg-void-950 text-parchment p-4">
        <p>Habit not found.</p>
      </div>
    );
  }

  const category = categories.find((c) => c.id === habit.categoryId);
  const Icon = getIcon(category?.icon || "Star");
  const grid = buildContributionGrid(habit, logs, 28);
  const current = currentStreak(habit, logs);
  const best = longestStreak(habit, logs);

  const dailyNote = settings.profile?.dailyNote;

  return (
    <div className="min-h-screen bg-void-950 text-parchment p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/widgets" className="hover:text-gold-400">
          <ArrowLeft size={18} strokeWidth={1.75} />
        </Link>
        <span
          className="w-6 h-6 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: `${category?.color}1a`,
            color: category?.color,
          }}
        >
          <Icon size={13} strokeWidth={1.75} />
        </span>
        <h1 className="font-display text-2xl truncate">{habit.name}</h1>
      </div>

      {dailyNote && (
        <div className="bg-void-900/60 border border-void-700 rounded-lg p-3.5 mb-4">
          <p className="text-sm italic text-parchment">{dailyNote}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-void-900/60 border border-void-700 rounded-lg p-3">
          <p className="text-xs text-void-400 mb-1">Current streak</p>
          <p className="text-2xl font-bold text-gold-400">{current}</p>
        </div>
        <div className="bg-void-900/60 border border-void-700 rounded-lg p-3">
          <p className="text-xs text-void-400 mb-1">Best streak</p>
          <p className="text-2xl font-bold text-gold-400">{best}</p>
        </div>
      </div>

      <div className="bg-void-900/60 border border-void-700 rounded-lg p-3">
        <p className="text-xs text-void-400 mb-2">Last 28 days</p>
        <div
          className="grid gap-0.5"
          style={{ gridTemplateColumns: "repeat(7, 1fr)" }}
        >
          {grid.map((entry, idx) => (
            <div
              key={idx}
              className="aspect-square rounded-sm border border-void-700 flex items-center justify-center text-[9px]"
              style={{
                backgroundColor:
                  entry.status === "completed"
                    ? category?.color
                    : entry.status === "scheduled"
                      ? `${category?.color}33`
                      : "transparent",
              }}
              title={entry.date}
            />
          ))}
        </div>
      </div>

      <div className="mt-auto pt-4 text-center">
        <Link
          href="/streaks"
          className="text-xs text-void-400 hover:text-parchment underline"
        >
          View full streak grid
        </Link>
      </div>
    </div>
  );
}
