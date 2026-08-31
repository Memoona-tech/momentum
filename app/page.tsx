"use client";

import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Plus, Feather, GripVertical, Flame, Search } from "lucide-react";
import { useData } from "@/lib/DataContext";
import {
  currentStreak,
  isScheduledOn,
  longestStreak,
  todayStr,
} from "@/lib/schedule";
import HabitCard from "@/components/HabitCard";
import HabitFormModal from "@/components/HabitFormModal";
import HabitTemplateModal from "@/components/HabitTemplateModal";
import ProgressDial from "@/components/ProgressDial";

export default function DashboardPage() {
  const { habits, categories, logs, settings, reorderHabits } = useData();
  const [showForm, setShowForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [query, setQuery] = useState("");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const today = todayStr();

  const todaysHabits = useMemo(
    () =>
      habits
        .filter((h) => !h.archived && isScheduledOn(h, new Date()))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [habits],
  );

  const logsByHabit = useMemo(() => {
    const map = new Map<string, (typeof logs)[number]>();
    logs.forEach((l) => {
      if (l.date === today) map.set(l.habitId, l);
    });
    return map;
  }, [logs, today]);

  const completedCount = todaysHabits.filter(
    (h) => logsByHabit.get(h.id)?.completed,
  ).length;
  const percent = todaysHabits.length
    ? (completedCount / todaysHabits.length) * 100
    : 0;

  const filteredHabits = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return todaysHabits;
    return todaysHabits.filter((habit) => {
      const haystack = `${habit.name} ${habit.description}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [query, todaysHabits]);

  const activeHabits = habits.filter((h) => !h.archived);
  const topCurrentStreak = activeHabits.length
    ? Math.max(...activeHabits.map((h) => currentStreak(h, logs)))
    : 0;
  const topLongestStreak = activeHabits.length
    ? Math.max(...activeHabits.map((h) => longestStreak(h, logs)))
    : 0;
  const milestoneTargets = [7, 30, 100];
  const nextMilestone =
    milestoneTargets.find((target) => topCurrentStreak < target) ??
    milestoneTargets[milestoneTargets.length - 1];
  const milestonePercent = Math.min(
    100,
    Math.round((topCurrentStreak / nextMilestone) * 100),
  );

  const handleDragStart = (habitId: string) => {
    setDraggedId(habitId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetHabitId: string) => {
    if (!draggedId || draggedId === targetHabitId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const orderedAll = [...habits].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    );
    const draggedIdx = orderedAll.findIndex((h) => h.id === draggedId);
    const targetIdx = orderedAll.findIndex((h) => h.id === targetHabitId);

    if (draggedIdx === -1 || targetIdx === -1) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const [movedHabit] = orderedAll.splice(draggedIdx, 1);
    orderedAll.splice(targetIdx, 0, movedHabit);

    const updatedReordered = orderedAll.map((habit, idx) => ({
      ...habit,
      order: idx,
    }));

    reorderHabits(updatedReordered);
    setDraggedId(null);
    setDragOverId(null);
  };

  useEffect(() => {
    if (!settings.notificationsEnabled) return;
    if (typeof Notification === "undefined") return;
    if (Notification.permission === "default") Notification.requestPermission();
  }, [settings.notificationsEnabled]);

  useEffect(() => {
    if (!settings.notificationsEnabled) return;
    if (
      typeof Notification === "undefined" ||
      Notification.permission !== "granted"
    )
      return;

    const interval = setInterval(() => {
      const now = new Date();
      const reminderLead = Math.max(0, settings.reminderLeadMinutes || 0);

      todaysHabits.forEach((h) => {
        if (!h.targetTime || logsByHabit.get(h.id)?.completed) return;

        const [hh, mm] = h.targetTime.split(":").map(Number);
        const target = new Date();
        target.setHours(hh, mm, 0, 0);

        const minutesUntilTarget = (target.getTime() - now.getTime()) / 60000;
        const dueNow = minutesUntilTarget <= 0 && minutesUntilTarget >= -1;
        const remindWindow =
          minutesUntilTarget <= reminderLead && minutesUntilTarget >= -1;

        if (!dueNow && !remindWindow) return;

        const reminderKey = `momentum_reminder_${h.id}_${today}_${h.targetTime}`;
        if (sessionStorage.getItem(reminderKey)) return;

        sessionStorage.setItem(reminderKey, "sent");

        const message = dueNow
          ? `"${h.name}" is due now.`
          : `"${h.name}" is due in ${Math.max(
              0,
              Math.ceil(minutesUntilTarget),
            )} minutes.`;

        new Notification("Smart reminder", { body: message });
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [
    todaysHabits,
    logsByHabit,
    settings.notificationsEnabled,
    settings.reminderLeadMinutes,
    today,
  ]);

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-parchment mb-1">Today</h1>
          <p className="text-void-400 text-sm">
            {format(new Date(), "EEEE, MMMM d")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTemplates(true)}
            className="flex items-center gap-1.5 bg-void-800 border border-void-600 hover:border-void-400 text-parchment text-sm font-medium rounded-lg px-3 py-2.5 transition-colors"
          >
            Templates
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 bg-gold-500 hover:bg-gold-600 text-void-950 text-sm font-semibold rounded-lg px-3.5 py-2.5 transition-colors"
          >
            <Plus size={16} /> New habit
          </button>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-void-700 bg-void-900/60 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-void-400">
              Overall streak
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Flame className="text-gold-400" size={18} />
              <span className="font-display text-2xl text-parchment">
                {topCurrentStreak}d
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-[0.2em] text-void-500">
              Best
            </p>
            <p className="mt-2 text-lg font-semibold text-gold-300">
              {topLongestStreak}d
            </p>
          </div>
        </div>
        <div className="mt-4 h-2 rounded-full bg-void-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold-400 to-amber-300"
            style={{ width: `${Math.min(100, milestonePercent)}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-void-400">
          {topCurrentStreak >= nextMilestone
            ? `Milestone unlocked: ${nextMilestone} days`
            : `${topCurrentStreak}/${nextMilestone} days to next milestone`}
        </p>
      </div>

      <div className="flex items-center gap-6 bg-void-900/60 border border-void-700 rounded-2xl p-6 mb-8">
        <ProgressDial
          percent={percent}
          label="complete"
          sublabel={`${completedCount} of ${todaysHabits.length}`}
        />
        <div className="flex-1">
          <p className="font-display text-lg text-parchment mb-1">
            {percent === 100 && todaysHabits.length > 0
              ? "Every habit, done."
              : percent === 0
                ? "Nothing logged yet."
                : "Making progress."}
          </p>
          <p className="text-sm text-void-400">
            {todaysHabits.length === 0
              ? "Add a habit to start tracking today."
              : `${completedCount} of ${todaysHabits.length} habits completed so far.`}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <label className="relative block">
          <span className="sr-only">Search habits</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-void-500"
            size={15}
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search habits"
            className="w-full rounded-xl border border-void-600 bg-void-900/60 py-2.5 pl-9 pr-3 text-sm text-parchment placeholder:text-void-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
          />
        </label>
      </div>

      {filteredHabits.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-void-600 rounded-2xl">
          <Feather
            className="mx-auto text-void-600 mb-3"
            size={26}
            strokeWidth={1.5}
          />
          <p className="text-void-400 text-sm mb-4">
            Nothing scheduled for today yet.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="text-gold-400 text-sm font-medium hover:underline"
          >
            Add your first habit
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filteredHabits.map((h) => (
            <div
              key={h.id}
              draggable
              onDragStart={() => handleDragStart(h.id)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(h.id)}
              onDragEnter={() => setDragOverId(h.id)}
              onDragLeave={() => setDragOverId(null)}
              className={`group flex items-center gap-3 transition-all ${
                draggedId === h.id ? "opacity-50" : ""
              } ${dragOverId === h.id && draggedId !== h.id ? "scale-105 bg-void-800/50 rounded-xl" : ""}`}
            >
              <div className="flex-shrink-0 pt-3 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                <GripVertical
                  size={16}
                  className="text-void-500"
                  strokeWidth={1.75}
                />
              </div>
              <div className="flex-1">
                <HabitCard
                  habit={h}
                  category={categories.find((c) => c.id === h.categoryId)}
                  log={logsByHabit.get(h.id)}
                  logs={logs}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && <HabitFormModal onClose={() => setShowForm(false)} />}
      {showTemplates && (
        <HabitTemplateModal onClose={() => setShowTemplates(false)} />
      )}
    </div>
  );
}
