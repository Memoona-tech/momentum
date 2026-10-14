"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Check,
  Clock,
  Flame,
  TrendingUp,
  TriangleAlert,
  Trophy,
  Feather,
  MoreVertical,
  Pencil,
  Archive,
  ArchiveRestore,
  Trash2,
} from "lucide-react";
import { Habit, HabitLog, Category } from "@/lib/types";
import { useData } from "@/lib/DataContext";
import CategoryTag from "./CategoryTag";
import CompleteHabitModal from "./CompleteHabitModal";
import HabitFormModal from "./HabitFormModal";
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
  compact = false,
}: {
  habit: Habit;
  category?: Category;
  log?: HabitLog;
  logs: HabitLog[];
  compact?: boolean;
}) {
  const { setLog, unsetLog, updateHabit, deleteHabit } = useData();
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const completed = !!log?.completed;
  const overdue = isOverdue(habit, completed);
  const streak = currentStreak(habit, logs);
  const unlockedMilestones = getUnlockedMilestones(habit, logs);
  const milestoneProgress = nextMilestoneProgress(habit, logs);

  // Feature 1: Timestamp when habit is completed
  const completionTimestamp = useMemo(() => {
    if (!completed || !log?.loggedAt) return null;
    try {
      const date = new Date(log.loggedAt);
      if (isNaN(date.getTime())) return null;
      return format(date, "h:mm a");
    } catch {
      return null;
    }
  }, [completed, log?.loggedAt]);

  // Close 3-dots menu on click outside
  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  function toggle() {
    if (completed) {
      unsetLog(habit.id, todayStr());
    } else if (habit.targetUnit) {
      setShowCheckInModal(true);
    } else {
      setLog(habit.id, todayStr(), true);
    }
  }

  function handleArchive() {
    setMenuOpen(false);
    updateHabit(habit.id, { archived: !habit.archived });
  }

  function handleDelete() {
    setMenuOpen(false);
    if (
      window.confirm(
        `Delete "${habit.name}"? This will permanently delete this habit and its history.`,
      )
    ) {
      deleteHabit(habit.id);
    }
  }

  return (
    <>
      <div
        className={`relative flex items-start gap-3 rounded-xl border transition-all ${
          compact ? "p-3" : "p-4"
        } ${
          overdue
            ? "border-red-500/30 bg-red-500/[0.04]"
            : completed
              ? "border-emerald-500/25 bg-emerald-500/[0.04]"
              : "border-void-600 bg-void-900/60 hover:border-void-500"
        }`}
      >
        {/* Toggle completion checkbox button */}
        <button
          onClick={toggle}
          aria-label={completed ? "Mark incomplete" : "Mark complete"}
          className={`shrink-0 mt-0.5 ${
            compact ? "w-6 h-6" : "w-7 h-7"
          } rounded-full border flex items-center justify-center transition-colors ${
            completed
              ? "bg-emerald-500 border-emerald-500 text-void-950"
              : "border-void-500 hover:border-gold-400"
          }`}
        >
          {completed && <Check size={compact ? 13 : 15} strokeWidth={2.5} />}
        </button>

        {/* Card Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap pr-7">
            <p
              className={`font-medium text-sm ${
                completed ? "line-through text-void-400" : "text-parchment"
              }`}
              title={habit.name}
            >
              {habit.name}
            </p>
            <CategoryTag category={category} />

            {/* Note badge / trigger */}
            <button
              type="button"
              onClick={() => setShowCheckInModal(true)}
              className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] px-1.5 py-0.5 rounded transition-colors ${
                log?.note
                  ? "bg-gold-500/10 text-gold-300 border border-gold-500/20 hover:bg-gold-500/20"
                  : "text-void-400 hover:text-gold-300"
              }`}
              title={log?.note ? `Note: ${log.note}` : "Add a check-in note or details"}
            >
              <Feather size={10} strokeWidth={1.75} />
              {log?.note ? "note" : "+ note"}
            </button>
          </div>

          {/* Feature 4: Habit description displayed right under the habit title, not hidden */}
          {habit.description && (
            <p className="text-xs text-void-400 mt-1 leading-relaxed break-words">
              {habit.description}
            </p>
          )}

          {/* Meta details (timestamp, target time, streak, etc.) */}
          <div
            className={`flex items-center gap-3 flex-wrap ${
              compact ? "mt-1.5" : "mt-2"
            } text-[11px] text-void-400`}
          >
            {/* Feature 1: Timestamp when habit is completed */}
            {completed && completionTimestamp && (
              <span
                className="flex items-center gap-1 text-emerald-400 font-mono tabular font-medium bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded"
                title={`Completed at ${completionTimestamp}`}
              >
                <Check size={11} strokeWidth={2.5} /> {completionTimestamp}
              </span>
            )}

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

            {!compact && unlockedMilestones.length > 0 && (
              <span className="flex items-center gap-1 text-amber-400 font-medium">
                <Trophy size={11} strokeWidth={1.75} />{" "}
                {unlockedMilestones[unlockedMilestones.length - 1]}
              </span>
            )}

            {formatLoggedValue(habit, log) && (
              <span className="tabular font-mono text-emerald-400">
                {formatLoggedValue(habit, log)}
              </span>
            )}

            {overdue && (
              <span className="flex items-center gap-1 text-red-400 font-medium">
                <TriangleAlert size={11} strokeWidth={1.75} /> overdue
              </span>
            )}
          </div>

          {/* Milestone progress bar in full mode */}
          {!compact &&
            milestoneProgress.nextMilestone > 0 &&
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

          {/* Show daily check-in note quote if one exists */}
          {log?.note && (
            <p className="text-xs text-gold-200/90 mt-2 italic bg-void-950/40 border border-void-700/40 rounded-lg px-2.5 py-1.5">
              &ldquo;{log.note}&rdquo;
            </p>
          )}
        </div>

        {/* Feature 2: Three-dots Menu on each habit card */}
        <div ref={menuRef} className="absolute top-2.5 right-2.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((prev) => !prev);
            }}
            className="p-1.5 rounded-lg text-void-400 hover:text-parchment hover:bg-void-800 transition-colors"
            aria-label="Habit options"
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-void-700 bg-void-900 shadow-xl py-1.5 z-30">
              {/* Edit Habit */}
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setShowEditModal(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-parchment hover:bg-void-800 transition-colors text-left"
              >
                <Pencil size={14} className="text-gold-400" />
                Edit habit
              </button>

              {/* View Analytics */}
              <Link
                href={`/analytics/${habit.id}`}
                onClick={() => setMenuOpen(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-parchment hover:bg-void-800 transition-colors text-left"
              >
                <TrendingUp size={14} className="text-cyan-400" />
                Analytics & trends
              </Link>

              {/* Archive / Unarchive */}
              <button
                type="button"
                onClick={handleArchive}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-parchment hover:bg-void-800 transition-colors text-left"
              >
                {habit.archived ? (
                  <>
                    <ArchiveRestore size={14} className="text-amber-400" />
                    Restore habit
                  </>
                ) : (
                  <>
                    <Archive size={14} className="text-void-400" />
                    Archive habit
                  </>
                )}
              </button>

              <div className="my-1 border-t border-void-800" />

              {/* Delete Habit */}
              <button
                type="button"
                onClick={handleDelete}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors text-left"
              >
                <Trash2 size={14} />
                Delete habit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Note / Check-in Modal */}
      {showCheckInModal && (
        <CompleteHabitModal
          habit={habit}
          date={todayStr()}
          log={log}
          onClose={() => setShowCheckInModal(false)}
        />
      )}

      {/* Edit Habit Modal */}
      {showEditModal && (
        <HabitFormModal habit={habit} onClose={() => setShowEditModal(false)} />
      )}
    </>
  );
}
