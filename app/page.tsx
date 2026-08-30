"use client";

import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Plus, Feather } from "lucide-react";
import { useData } from "@/lib/DataContext";
import { isScheduledOn, todayStr } from "@/lib/schedule";
import HabitCard from "@/components/HabitCard";
import HabitFormModal from "@/components/HabitFormModal";
import ProgressDial from "@/components/ProgressDial";

export default function DashboardPage() {
  const { habits, categories, logs, settings } = useData();
  const [showForm, setShowForm] = useState(false);
  const today = todayStr();

  const todaysHabits = useMemo(() => habits.filter((h) => !h.archived && isScheduledOn(h, new Date())), [habits]);

  const logsByHabit = useMemo(() => {
    const map = new Map<string, (typeof logs)[number]>();
    logs.forEach((l) => {
      if (l.date === today) map.set(l.habitId, l);
    });
    return map;
  }, [logs, today]);

  const completedCount = todaysHabits.filter((h) => logsByHabit.get(h.id)?.completed).length;
  const percent = todaysHabits.length ? (completedCount / todaysHabits.length) * 100 : 0;

  useEffect(() => {
    if (!settings.notificationsEnabled) return;
    if (typeof Notification === "undefined") return;
    if (Notification.permission === "default") Notification.requestPermission();
  }, [settings.notificationsEnabled]);

  useEffect(() => {
    if (!settings.notificationsEnabled) return;
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;

    const interval = setInterval(() => {
      const now = new Date();
      todaysHabits.forEach((h) => {
        if (!h.targetTime || logsByHabit.get(h.id)?.completed) return;
        const [hh, mm] = h.targetTime.split(":").map(Number);
        const target = new Date();
        target.setHours(hh, mm, 0, 0);
        const minutesPast = (now.getTime() - target.getTime()) / 60000;
        if (minutesPast >= 0 && minutesPast < 1) {
          new Notification("Habit due", { body: `"${h.name}" is due now.` });
        }
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [todaysHabits, logsByHabit, settings.notificationsEnabled]);

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-parchment mb-1">Today</h1>
          <p className="text-void-400 text-sm">{format(new Date(), "EEEE, MMMM d")}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 bg-gold-500 hover:bg-gold-600 text-void-950 text-sm font-semibold rounded-lg px-3.5 py-2.5 transition-colors"
        >
          <Plus size={16} /> New habit
        </button>
      </div>

      <div className="flex items-center gap-6 bg-void-900/60 border border-void-700 rounded-2xl p-6 mb-8">
        <ProgressDial percent={percent} label="complete" sublabel={`${completedCount} of ${todaysHabits.length}`} />
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

      {todaysHabits.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-void-600 rounded-2xl">
          <Feather className="mx-auto text-void-600 mb-3" size={26} strokeWidth={1.5} />
          <p className="text-void-400 text-sm mb-4">Nothing scheduled for today yet.</p>
          <button onClick={() => setShowForm(true)} className="text-gold-400 text-sm font-medium hover:underline">
            Add your first habit
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {todaysHabits.map((h) => (
            <HabitCard
              key={h.id}
              habit={h}
              category={categories.find((c) => c.id === h.categoryId)}
              log={logsByHabit.get(h.id)}
              logs={logs}
            />
          ))}
        </div>
      )}

      {showForm && <HabitFormModal onClose={() => setShowForm(false)} />}
    </div>
  );
}
