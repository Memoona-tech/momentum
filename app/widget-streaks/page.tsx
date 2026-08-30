"use client";

import React from "react";
import { useData } from "@/lib/DataContext";
import { currentStreak, longestStreak } from "@/lib/schedule";
import { getIcon } from "@/lib/icons";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function WidgetStreaksPage() {
  const { habits, categories, logs, settings } = useData();

  const habitStreaks = habits.map((habit) => ({
    habit,
    current: currentStreak(habit, logs),
    best: longestStreak(habit, logs),
  }));

  const dailyNote = settings.profile?.dailyNote;

  return (
    <div className="min-h-screen bg-void-950 text-parchment p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/widgets" className="hover:text-gold-400">
          <ArrowLeft size={18} strokeWidth={1.75} />
        </Link>
        <h1 className="font-display text-2xl">Streaks</h1>
      </div>

      {dailyNote && (
        <div className="bg-void-900/60 border border-void-700 rounded-lg p-3.5 mb-4">
          <p className="text-sm italic text-parchment">{dailyNote}</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {habitStreaks.map(({ habit, current, best }) => {
          const category = categories.find((c) => c.id === habit.categoryId);
          const Icon = getIcon(category?.icon || "Star");
          return (
            <div
              key={habit.id}
              className="bg-void-900/60 border border-void-700 rounded-lg p-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-5 h-5 rounded flex items-center justify-center"
                  style={{
                    backgroundColor: `${category?.color}1a`,
                    color: category?.color,
                  }}
                >
                  <Icon size={12} strokeWidth={1.75} />
                </span>
                <p className="text-sm font-medium truncate">{habit.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-void-400">Current</p>
                  <p className="text-lg font-bold text-gold-400">{current}</p>
                </div>
                <div>
                  <p className="text-void-400">Best</p>
                  <p className="text-lg font-bold text-gold-400">{best}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-auto pt-4 text-center">
        <Link
          href="/streaks"
          className="text-xs text-void-400 hover:text-parchment underline"
        >
          View all streaks
        </Link>
      </div>
    </div>
  );
}
