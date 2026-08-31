"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowLeft,
  CalendarDays,
  Flame,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { format, eachDayOfInterval, subDays } from "date-fns";
import { useData } from "@/lib/DataContext";
import CategoryTag from "@/components/CategoryTag";
import {
  currentStreak,
  dateStr,
  isScheduledOn,
  longestStreak,
} from "@/lib/schedule";

export default function HabitAnalyticsPage() {
  const params = useParams();
  const { habits, logs, categories } = useData();

  const habitId = typeof params?.id === "string" ? params.id : "";
  const habit = habits.find((h) => h.id === habitId);
  const category = categories.find((c) => c.id === habit?.categoryId ?? null);

  const dailyData = useMemo(() => {
    if (!habit) return [];

    const end = new Date();
    const start = subDays(end, 27);
    const days = eachDayOfInterval({ start, end });

    return days.map((day) => {
      const ds = dateStr(day);
      const scheduled = isScheduledOn(habit, day) ? 1 : 0;
      const completed = logs.some(
        (l) => l.habitId === habit.id && l.date === ds && l.completed,
      )
        ? 1
        : 0;

      return {
        label: format(day, "MMM d"),
        scheduled,
        completed,
        rate: scheduled ? Math.round((completed / scheduled) * 100) : 0,
      };
    });
  }, [habit, logs]);

  const totalScheduled = dailyData.reduce(
    (sum, item) => sum + item.scheduled,
    0,
  );
  const totalCompleted = dailyData.reduce(
    (sum, item) => sum + item.completed,
    0,
  );
  const completionRate = totalScheduled
    ? Math.round((totalCompleted / totalScheduled) * 100)
    : 0;

  const recentLogs = useMemo(
    () =>
      logs
        .filter((l) => l.habitId === habitId)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 6),
    [habitId, logs],
  );

  if (!habit) {
    return (
      <div className="space-y-4">
        <Link
          href="/habits"
          className="inline-flex items-center gap-2 text-sm text-void-300 hover:text-parchment"
        >
          <ArrowLeft size={14} /> Back to habits
        </Link>
        <div className="bg-void-900/60 border border-void-700 rounded-2xl p-8 text-center">
          <p className="text-parchment font-medium">Habit not found.</p>
        </div>
      </div>
    );
  }

  const streak = currentStreak(habit, logs);
  const bestStreak = longestStreak(habit, logs);
  const noteCount = recentLogs.filter((l) => l.note).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Link
            href="/habits"
            className="inline-flex items-center gap-2 text-sm text-void-300 hover:text-parchment"
          >
            <ArrowLeft size={14} /> Back to habits
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display text-3xl text-parchment">
              {habit.name}
            </h1>
            <CategoryTag category={category} />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-void-900/60 border border-void-700 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-void-400 text-xs uppercase tracking-wide mb-2">
            <Flame size={14} className="text-gold-400" /> Current streak
          </div>
          <div className="text-2xl font-semibold text-parchment">{streak}d</div>
        </div>

        <div className="bg-void-900/60 border border-void-700 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-void-400 text-xs uppercase tracking-wide mb-2">
            <Trophy size={14} className="text-amber-400" /> Best streak
          </div>
          <div className="text-2xl font-semibold text-parchment">
            {bestStreak}d
          </div>
        </div>

        <div className="bg-void-900/60 border border-void-700 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-void-400 text-xs uppercase tracking-wide mb-2">
            <TrendingUp size={14} className="text-emerald-400" /> Completion
          </div>
          <div className="text-2xl font-semibold text-parchment">
            {completionRate}%
          </div>
        </div>

        <div className="bg-void-900/60 border border-void-700 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-void-400 text-xs uppercase tracking-wide mb-2">
            <CalendarDays size={14} className="text-void-300" /> Sessions
          </div>
          <div className="text-2xl font-semibold text-parchment">
            {totalCompleted}
          </div>
        </div>
      </div>

      <div className="bg-void-900/60 border border-void-700 rounded-2xl p-5 h-72">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-parchment">Last 28 days</h2>
          <span className="text-xs text-void-400">
            {totalCompleted} / {totalScheduled} scheduled
          </span>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dailyData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#2a2a2e"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              stroke="#8f8b84"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              interval={6}
            />
            <YAxis
              stroke="#8f8b84"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={[0, 1]}
            />
            <Tooltip
              formatter={(value: number, name: string) => {
                const label = name === "completed" ? "Done" : "Scheduled";
                return [value, label];
              }}
              contentStyle={{
                background: "#17171a",
                border: "1px solid #2a2a2e",
                borderRadius: 10,
                fontSize: 12,
              }}
            />
            <Bar dataKey="scheduled" fill="#3a3a3d" radius={[4, 4, 0, 0]} />
            <Bar
              dataKey="completed"
              fill={category?.color ?? "#c9a44c"}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-4">
        <div className="bg-void-900/60 border border-void-700 rounded-2xl p-5">
          <h2 className="text-sm font-semibold mb-3 text-parchment">
            Recent activity
          </h2>
          <div className="space-y-2">
            {recentLogs.length === 0 ? (
              <p className="text-sm text-void-400">
                No history yet for this habit.
              </p>
            ) : (
              recentLogs.map((log) => (
                <div
                  key={`${log.habitId}-${log.date}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-void-700 bg-void-950/40 px-3 py-2"
                >
                  <div>
                    <p className="text-sm text-parchment">
                      {format(new Date(log.date), "MMM d, yyyy")}
                    </p>
                    <p className="text-xs text-void-400">
                      {log.completed ? "Completed" : "Missed"}
                      {log.value != null
                        ? ` · ${log.value} ${habit.targetUnit ?? ""}`
                        : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    {log.completed ? (
                      <span className="inline-flex rounded-full bg-emerald-500/15 text-emerald-300 px-2 py-1 text-[10px] font-medium">
                        done
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-red-500/10 text-red-300 px-2 py-1 text-[10px] font-medium">
                        missed
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-void-900/60 border border-void-700 rounded-2xl p-5">
          <h2 className="text-sm font-semibold mb-3 text-parchment">
            Quick read
          </h2>
          <div className="space-y-3 text-sm text-void-300">
            <div className="flex justify-between gap-4">
              <span>Target</span>
              <span className="font-medium text-parchment">
                {habit.targetValue
                  ? `${habit.targetValue} ${habit.targetUnit ?? ""}`
                  : "No target"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Schedule</span>
              <span className="font-medium text-parchment">
                {habit.scheduleType === "daily"
                  ? "Every day"
                  : habit.scheduleType === "weekly"
                    ? "Weekly"
                    : "Monthly"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Notes</span>
              <span className="font-medium text-parchment">{noteCount}</span>
            </div>
            {habit.description && (
              <div className="pt-2 border-t border-void-700 mt-2">
                <p className="text-xs uppercase tracking-wide text-void-400 mb-1.5">
                  Description
                </p>
                <p className="text-sm text-void-300">{habit.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
