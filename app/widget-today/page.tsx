"use client";

import React from "react";
import { useData } from "@/lib/DataContext";
import { isScheduledOn } from "@/lib/schedule";
import { getIcon } from "@/lib/icons";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function WidgetTodayPage() {
  const { habits, categories, logs, settings } = useData();
  const today = new Date();

  const habitStatus = habits.map((habit) => {
    const isScheduled = isScheduledOn(habit, today.getDay());
    const logKey = `${habit.id}:${format(today, "yyyy-MM-dd")}`;
    const isCompleted = logs.some((log) => log.id === logKey && log.completed);
    return { habit, isScheduled, isCompleted };
  });

  const scheduledHabits = habitStatus.filter((h) => h.isScheduled);
  const completedCount = scheduledHabits.filter((h) => h.isCompleted).length;

  const dailyNote = settings.profile?.dailyNote;

  return (
    <div className="min-h-screen bg-void-950 text-parchment p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/widgets" className="hover:text-gold-400">
          <ArrowLeft size={18} strokeWidth={1.75} />
        </Link>
        <h1 className="font-display text-2xl">Today</h1>
      </div>

      {dailyNote && (
        <div className="bg-void-900/60 border border-void-700 rounded-lg p-3.5 mb-4">
          <p className="text-sm italic text-parchment">{dailyNote}</p>
        </div>
      )}

      <div className="mb-4">
        <div className="text-3xl font-bold text-gold-400">
          {completedCount}/{scheduledHabits.length}
        </div>
        <p className="text-xs text-void-400">habits completed today</p>
      </div>

      <div className="flex flex-col gap-2">
        {scheduledHabits.map(({ habit, isCompleted }) => {
          const category = categories.find((c) => c.id === habit.categoryId);
          const Icon = getIcon(category?.icon || "Star");
          return (
            <div
              key={habit.id}
              className={`flex items-center gap-2 p-2.5 rounded-lg border ${
                isCompleted
                  ? "bg-void-800 border-void-600"
                  : "bg-void-900/60 border-void-700"
              }`}
            >
              <span
                className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                  isCompleted ? "ring-1 ring-offset-1" : ""
                }`}
                style={{
                  backgroundColor: isCompleted
                    ? category?.color
                    : "transparent",
                  boxShadow: isCompleted
                    ? `0 0 0 1px ${category?.color}`
                    : "none",
                  borderColor: category?.color,
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{habit.name}</p>
              </div>
              {isCompleted && (
                <span className="text-xs font-medium text-gold-400">✓</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-auto pt-4 text-center">
        <Link
          href="/"
          className="text-xs text-void-400 hover:text-parchment underline"
        >
          Open app
        </Link>
      </div>
    </div>
  );
}
