"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Check,
  Clock,
  Flame,
  TrendingUp,
  TriangleAlert,
  Trophy,
} from "lucide-react";
import { Habit, HabitLog, Category } from "@/lib/types";
import { useData } from "@/lib/DataContext";
import CategoryTag from "./CategoryTag";
import CompleteHabitModal from "./CompleteHabitModal";
import {
  currentStreak,
  todayStr,
  getUnlockedMilestones,
  nextMilestoneProgress,
  formatLoggedValue,
} from "@/lib/schedule";

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
  const unlockedMilestones = getUnlockedMilestones(habit, logs);
  const milestoneProgress = nextMilestoneProgress(habit, logs);

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
            <p
              className={`font-medium text-sm ${completed ? "line-through text-void-400" : "text-parchment"}`}
            >
              {habit.name}
            </p>
            <CategoryTag category={category} />
            <Link
              href={`/analytics/${habit.id}`}
              className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-gold-300 hover:text-gold-200"
            >
              <TrendingUp size={11} strokeWidth={1.75} />
              analytics
            </Link>
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
            {unlockedMilestones.length > 0 && (
              <span className="flex items-center gap-1 text-amber-400 font-medium">
                <Trophy size={11} strokeWidth={1.75} />{" "}
                {unlockedMilestones[unlockedMilestones.length - 1]}
              </span>
            )}
            {formatLoggedValue(habit, log) && (
              <span className="tabular font-mono">
                {formatLoggedValue(habit, log)}
              </span>
            )}
            {overdue && (
              <span className="flex items-center gap-1 text-red-400 font-medium">
                <TriangleAlert size={11} strokeWidth={1.75} /> overdue
              </span>
            )}
          </div>
          {milestoneProgress.nextMilestone > 0 &&
            !milestoneProgress.reached && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-[10px] text-void-400">
                  <span className="text-amber-300">
                    {milestoneProgress.current}/
                    {milestoneProgress.nextMilestone} to next milestone
                  </span>
                  <span>{milestoneProgress.remaining} days left</span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-void-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-gold-500"
                    style={{
                      width: `${Math.min(100, milestoneProgress.percent)}%`,
                    }}
                  />
                </div>
              </div>
            )}
          {log?.note && (
            <p className="text-xs text-void-400 mt-1 italic truncate">
              &ldquo;{log.note}&rdquo;
            </p>
          )}
        </div>
      </div>

      {showComplete && (
        <CompleteHabitModal
          habit={habit}
          date={todayStr()}
          onClose={() => setShowComplete(false)}
        />
      )}
    </>
  );
}
