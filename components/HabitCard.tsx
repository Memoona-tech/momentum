"use client";

import React, { useState } from "react";
import { Check, Clock, Flame, TriangleAlert } from "lucide-react";
import { Habit, HabitLog, Category } from "@/lib/types";
import { useData } from "@/lib/DataContext";
import CategoryTag from "./CategoryTag";
import CompleteHabitModal from "./CompleteHabitModal";
import { currentStreak, todayStr } from "@/lib/schedule";

function isOverdue(habit: Habit, completed: boolean): boolean {
  if (completed || !habit.targetTime) return false;
  const [h, m] = habit.targetTime.split(":").map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(h, m, 0, 0);
  return now > target;
}

export default function HabitCard({
  habit,
  category,
  log,
  logs,
}: {
  habit: Habit;
  category?: Category;
  log?: HabitLog;
  logs: HabitLog[];
}) {
  const { setLog, unsetLog } = useData();
  const [showComplete, setShowComplete] = useState(false);
  const completed = !!log?.completed;
  const overdue = isOverdue(habit, completed);
  const streak = currentStreak(habit, logs);

  function toggle() {
    if (completed) {
      unsetLog(habit.id, todayStr());
    } else if (habit.targetUnit) {
      setShowComplete(true);
    } else {
      setLog(habit.id, todayStr(), true);
    }
  }

  return (
    <>
      <div
        className={`flex items-center gap-3 rounded-xl border p-4 transition-colors ${
          overdue
            ? "border-red-500/30 bg-red-500/[0.04]"
            : completed
            ? "border-emerald-500/25 bg-emerald-500/[0.04]"
            : "border-void-600 bg-void-900/60"
        }`}
      >
        <button
          onClick={toggle}
          aria-label={completed ? "Mark incomplete" : "Mark complete"}
          className={`shrink-0 w-7 h-7 rounded-full border flex items-center justify-center transition-colors ${
            completed
              ? "bg-emerald-500 border-emerald-500 text-void-950"
              : "border-void-500 hover:border-gold-400"
          }`}
        >
          {completed && <Check size={15} strokeWidth={2.5} />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`font-medium text-sm ${completed ? "line-through text-void-400" : "text-parchment"}`}>
              {habit.name}
            </p>
            <CategoryTag category={category} />
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-void-400">
            {habit.targetTime && (
              <span className="flex items-center gap-1 tabular font-mono">
                <Clock size={11} strokeWidth={1.75} /> {habit.targetTime}
              </span>
            )}
            {streak > 0 && (
              <span className="flex items-center gap-1 text-gold-400 tabular font-mono font-medium">
                <Flame size={11} strokeWidth={1.75} /> {streak}
              </span>
            )}
            {log?.value != null && (
              <span className="tabular font-mono">
                {log.value} {habit.targetUnit}
              </span>
            )}
            {overdue && (
              <span className="flex items-center gap-1 text-red-400 font-medium">
                <TriangleAlert size={11} strokeWidth={1.75} /> overdue
              </span>
            )}
          </div>
          {log?.note && <p className="text-xs text-void-400 mt-1 italic truncate">&ldquo;{log.note}&rdquo;</p>}
        </div>
      </div>

      {showComplete && <CompleteHabitModal habit={habit} date={todayStr()} onClose={() => setShowComplete(false)} />}
    </>
  );
}
