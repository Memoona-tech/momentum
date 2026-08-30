"use client";

import React, { useMemo } from "react";
import { Flame } from "lucide-react";
import { useData } from "@/lib/DataContext";
import {
  buildContributionGrid,
  currentStreak,
  longestStreak,
} from "@/lib/schedule";

function hexToRgba(hex: string, alpha: number) {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((char) => char + char)
          .join("")
      : clean;
  const num = Number.parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function StreaksPage() {
  const { habits, categories, logs } = useData();
  const activeHabits = habits.filter((h) => !h.archived);

  const contributionByHabit = useMemo(
    () =>
      activeHabits.map((habit) => {
        const cells = buildContributionGrid(habit, logs, 28);
        const weeks = Array.from(
          { length: Math.ceil(cells.length / 7) },
          (_, index) => cells.slice(index * 7, index * 7 + 7),
        );
        return {
          habit,
          weeks,
          totalCompleted: cells.filter((cell) => cell.completed).length,
        };
      }),
    [activeHabits, logs],
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl text-parchment mb-1">Streaks</h1>
        <p className="text-void-400 text-sm">
          Each habit keeps its own momentum calendar.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {contributionByHabit.map(({ habit, weeks, totalCompleted }) => (
          <div
            key={habit.id}
            className="rounded-2xl border border-void-700 bg-void-900/60 p-4"
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-parchment truncate">
                  {habit.name}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-void-400 tabular">
                  <span className="flex items-center gap-1 text-gold-400">
                    <Flame size={11} strokeWidth={1.75} />{" "}
                    {currentStreak(habit, logs)} current
                  </span>
                  <span>{totalCompleted} done</span>
                </div>
              </div>
              <span className="text-[11px] text-void-400">
                {longestStreak(habit, logs)} best
              </span>
            </div>

            <div className="overflow-x-auto pb-1">
              <div className="inline-flex gap-1">
                {weeks.map((week, weekIndex) => (
                  <div
                    key={`${habit.id}-${weekIndex}`}
                    className="flex flex-col gap-1"
                  >
                    {week.map((cell, dayIndex) => {
                      const categoryColor =
                        categories.find((c) => c.id === habit.categoryId)
                          ?.color ?? "#c9a44c";
                      const fill = !cell.scheduled
                        ? "transparent"
                        : cell.completed
                          ? categoryColor
                          : hexToRgba(categoryColor, 0.18);
                      const border = cell.scheduled
                        ? "border-void-600"
                        : "border-transparent";
                      return (
                        <div
                          key={`${habit.id}-${weekIndex}-${dayIndex}`}
                          title={`${cell.date}: ${cell.completed ? "completed" : cell.scheduled ? "missed" : "not scheduled"}`}
                          className={`h-3 w-3 rounded-[3px] border ${border}`}
                          style={{
                            backgroundColor: fill,
                            opacity: cell.scheduled ? 1 : 0.2,
                          }}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {activeHabits.length === 0 && (
          <div className="rounded-2xl border border-dashed border-void-600 bg-void-900/40 p-8 text-center text-void-400 text-sm">
            No active habits yet. Create one to start building streaks.
          </div>
        )}
      </div>
    </div>
  );
}
