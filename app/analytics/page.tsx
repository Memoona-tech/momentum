"use client";

import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  format,
  eachDayOfInterval,
  subDays,
  subWeeks,
  startOfWeek,
  endOfWeek,
  subMonths,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { Flame, Trophy } from "lucide-react";
import { useData } from "@/lib/DataContext";
import {
  isScheduledOn,
  dateStr,
  currentStreak,
  longestStreak,
} from "@/lib/schedule";

type Range = "week" | "month" | "year";

// Fixed palette so each habit's bar/line is distinguishable, independent of its category color.
const PALETTE = [
  "#c9a44c",
  "#3f8a73",
  "#8f8b84",
  "#d8d3c8",
  "#e7d5a4",
  "#6b8f7e",
  "#a3906b",
  "#9a7830",
];

export default function AnalyticsPage() {
  const { habits, logs } = useData();
  const [range, setRange] = useState<Range>("week");
  const activeHabits = habits.filter((h) => !h.archived);

  const days = useMemo(() => {
    const end = new Date();
    const start =
      range === "week"
        ? subDays(end, 6)
        : range === "month"
          ? subDays(end, 29)
          : subDays(end, 364);
    return eachDayOfInterval({ start, end });
  }, [range]);

  const dailyData = useMemo(() => {
    return days.map((d) => {
      const ds = dateStr(d);
      const scheduled = activeHabits.filter((h) => isScheduledOn(h, d));
      const completed = scheduled.filter((h) =>
        logs.some((l) => l.habitId === h.id && l.date === ds && l.completed),
      );
      return {
        date: format(d, range === "year" ? "MMM" : "MMM d"),
        overall: scheduled.length
          ? Math.round((completed.length / scheduled.length) * 100)
          : 0,
      };
    });
  }, [days, activeHabits, logs, range]);

  const habitRates = useMemo(() => {
    return activeHabits
      .map((h, idx) => {
        const scheduledDays = days.filter((d) => isScheduledOn(h, d));
        const completedDays = scheduledDays.filter((d) =>
          logs.some(
            (l) => l.habitId === h.id && l.date === dateStr(d) && l.completed,
          ),
        );
        return {
          habitId: h.id,
          color: PALETTE[idx % PALETTE.length],
          rate: scheduledDays.length
            ? Math.round((completedDays.length / scheduledDays.length) * 100)
            : 0,
          name: h.name.length > 16 ? h.name.slice(0, 15) + "…" : h.name,
        };
      })
      .sort((a, b) => b.rate - a.rate);
  }, [activeHabits, days, logs]);

  const periodComparison = useMemo(() => {
    const isWeek = range !== "year";
    const count = 6;
    const results: { label: string; rate: number }[] = [];
    for (let i = count - 1; i >= 0; i--) {
      const refDate = isWeek
        ? subWeeks(new Date(), i)
        : subMonths(new Date(), i);
      const start = isWeek ? startOfWeek(refDate) : startOfMonth(refDate);
      const end = isWeek ? endOfWeek(refDate) : endOfMonth(refDate);
      const periodDays = eachDayOfInterval({
        start,
        end: end > new Date() ? new Date() : end,
      });
      let scheduled = 0;
      let completed = 0;
      periodDays.forEach((d) => {
        activeHabits.forEach((h) => {
          if (isScheduledOn(h, d)) {
            scheduled++;
            if (
              logs.some(
                (l) =>
                  l.habitId === h.id && l.date === dateStr(d) && l.completed,
              )
            )
              completed++;
          }
        });
      });
      results.push({
        label: isWeek
          ? `Week of ${format(start, "MMM d")}`
          : format(start, "MMMM"),
        rate: scheduled ? Math.round((completed / scheduled) * 100) : 0,
      });
    }
    return results;
  }, [range, activeHabits, logs]);

  const bestPeriod = periodComparison.reduce(
    (best, p) => (p.rate > best.rate ? p : best),
    periodComparison[0] ?? { label: "-", rate: 0 },
  );

  return (
    <div>
      <div className="flex items-start justify-between mb-1">
        <div>
          <h1 className="font-display text-3xl text-parchment mb-1">
            Analytics
          </h1>
          <p className="text-void-400 text-sm">
            Overall completion rate over time
          </p>
        </div>
        <div className="flex gap-1 bg-void-800 rounded-lg p-1">
          {(["week", "month", "year"] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                range === r ? "bg-void-700 text-gold-300" : "text-void-400"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-void-900/60 border border-void-700 rounded-2xl p-5 mb-6 h-64 mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" />
            <XAxis
              dataKey="date"
              stroke="#8f8b84"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#8f8b84"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                background: "#17171a",
                border: "1px solid #2a2a2e",
                borderRadius: 10,
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="overall"
              name="Completion %"
              stroke="#c9a44c"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-void-900/60 border border-void-700 rounded-2xl p-5">
          <h2 className="text-sm font-semibold mb-3 text-parchment">
            Completion rate per habit
          </h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={habitRates}
                layout="vertical"
                margin={{ left: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1f1f23"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  stroke="#8f8b84"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#8f8b84"
                  fontSize={11}
                  width={90}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#17171a",
                    border: "1px solid #2a2a2e",
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
                  {habitRates.map((h) => (
                    <Cell key={h.habitId} fill={h.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-void-900/60 border border-void-700 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={15} className="text-gold-400" strokeWidth={1.75} />
            <h2 className="text-sm font-semibold text-parchment">
              Best {range === "year" ? "month" : "week"}: {bestPeriod.label} (
              {bestPeriod.rate}%)
            </h2>
          </div>
          <div className="flex flex-col gap-2">
            {periodComparison.map((p) => (
              <div key={p.label} className="flex items-center gap-3">
                <span className="text-xs text-void-400 w-28 shrink-0 truncate">
                  {p.label}
                </span>
                <div className="flex-1 bg-void-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${p.rate}%`,
                      backgroundColor:
                        p.label === bestPeriod.label ? "#c9a44c" : "#3f8a73",
                    }}
                  />
                </div>
                <span className="text-xs tabular font-mono text-void-400 w-8 text-right">
                  {p.rate}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-void-900/60 border border-void-700 rounded-2xl p-5 mb-6">
        <h2 className="text-sm font-semibold mb-3 text-parchment">Streaks</h2>
        <div className="flex flex-col gap-2">
          {activeHabits.map((h) => (
            <div
              key={h.id}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-parchment">{h.name}</span>
              <div className="flex items-center gap-4 tabular font-mono text-xs">
                <span className="flex items-center gap-1 text-gold-400">
                  <Flame size={12} strokeWidth={1.75} />{" "}
                  {currentStreak(h, logs)} current
                </span>
                <span className="text-void-400">
                  {longestStreak(h, logs)} longest
                </span>
              </div>
            </div>
          ))}
          {activeHabits.length === 0 && (
            <p className="text-void-400 text-sm">No habits yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
