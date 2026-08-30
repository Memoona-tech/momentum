"use client";

import React, { useMemo, useState } from "react";
import { format, eachDayOfInterval, subWeeks, startOfWeek, endOfWeek, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { Download, FileDown, TrendingUp, TrendingDown } from "lucide-react";
import { useData } from "@/lib/DataContext";
import { isScheduledOn, dateStr, currentStreak } from "@/lib/schedule";
import { Habit, HabitLog } from "@/lib/types";

type Period = "week" | "month";

function rateForRange(habits: Habit[], logs: HabitLog[], start: Date, end: Date) {
  const activeHabits = habits.filter((h) => !h.archived);
  const days = eachDayOfInterval({ start, end: end > new Date() ? new Date() : end });
  let scheduled = 0;
  let completed = 0;
  days.forEach((d) => {
    activeHabits.forEach((h) => {
      if (isScheduledOn(h, d)) {
        scheduled++;
        if (logs.some((l) => l.habitId === h.id && l.date === dateStr(d) && l.completed)) completed++;
      }
    });
  });
  return scheduled ? Math.round((completed / scheduled) * 100) : 0;
}

export default function ReportsPage() {
  const { habits, categories, logs } = useData();
  const [period, setPeriod] = useState<Period>("week");

  const { currentRange, currentRate, previousRate, perHabit } = useMemo(() => {
    const now = new Date();
    const currentStart = period === "week" ? startOfWeek(now) : startOfMonth(now);
    const currentEnd = period === "week" ? endOfWeek(now) : endOfMonth(now);
    const prevRef = period === "week" ? subWeeks(now, 1) : subMonths(now, 1);
    const previousStart = period === "week" ? startOfWeek(prevRef) : startOfMonth(prevRef);
    const previousEnd = period === "week" ? endOfWeek(prevRef) : endOfMonth(prevRef);

    const currentRate = rateForRange(habits, logs, currentStart, currentEnd);
    const previousRate = rateForRange(habits, logs, previousStart, previousEnd);

    const activeHabits = habits.filter((h) => !h.archived);
    const days = eachDayOfInterval({ start: currentStart, end: currentEnd > now ? now : currentEnd });
    const perHabit = activeHabits.map((h) => {
      const scheduledDays = days.filter((d) => isScheduledOn(h, d));
      const completedDays = scheduledDays.filter((d) => logs.some((l) => l.habitId === h.id && l.date === dateStr(d) && l.completed));
      return {
        name: h.name,
        rate: scheduledDays.length ? Math.round((completedDays.length / scheduledDays.length) * 100) : 0,
        streak: currentStreak(h, logs),
      };
    });

    return {
      currentRange: `${format(currentStart, "MMM d")} – ${format(currentEnd, "MMM d")}`,
      currentRate,
      previousRate,
      perHabit,
    };
  }, [habits, logs, period]);

  const delta = currentRate - previousRate;
  const best = [...perHabit].sort((a, b) => b.rate - a.rate)[0];
  const worst = [...perHabit].sort((a, b) => a.rate - b.rate)[0];

  const insightLines = [
    `You completed ${currentRate}% of your habits this ${period}, ${
      delta === 0 ? "the same as" : delta > 0 ? `up from ${previousRate}%` : `down from ${previousRate}%`
    } last ${period}.`,
    best ? `Your strongest habit was "${best.name}" at ${best.rate}%.` : null,
    worst && worst.name !== best?.name ? `"${worst.name}" had the lowest completion rate at ${worst.rate}%.` : null,
  ].filter(Boolean) as string[];

  async function downloadPdf() {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(18);
    doc.text("Momentum — Habit Report", 14, y);
    y += 10;
    doc.setFontSize(11);
    doc.text(`Period: ${currentRange} (${period})`, 14, y);
    y += 10;

    doc.setFontSize(13);
    doc.text("Summary", 14, y);
    y += 7;
    doc.setFontSize(10);
    insightLines.forEach((line) => {
      const wrapped = doc.splitTextToSize(line, 180);
      doc.text(wrapped, 14, y);
      y += wrapped.length * 5 + 2;
    });

    y += 5;
    doc.setFontSize(13);
    doc.text("Per-habit completion", 14, y);
    y += 8;
    doc.setFontSize(10);
    perHabit.forEach((h) => {
      doc.text(`${h.name}`, 14, y);
      doc.text(`${h.rate}%`, 160, y);
      doc.text(`streak ${h.streak}`, 175, y);
      y += 6;
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save(`habit-report-${period}-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  }

  function downloadJson() {
    const payload = { exportedAt: new Date().toISOString(), habits, categories, logs };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    triggerDownload(blob, "habit-tracker-export.json");
  }

  function downloadCsv() {
    const rows = logs
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((l) => {
        const habit = habits.find((h) => h.id === l.habitId);
        const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
        return `${l.date},${escape(habit?.name ?? "")},${l.completed ? 1 : 0},${l.value ?? ""},${escape(l.note ?? "")}`;
      });
    const csv = ["date,habit,completed,value,note", ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    triggerDownload(blob, "habit-tracker-export.csv");
  }

  function triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-1">
        <div>
          <h1 className="font-display text-3xl text-parchment mb-1">Reports</h1>
          <p className="text-void-400 text-sm">{currentRange}</p>
        </div>
        <div className="flex gap-1 bg-void-800 rounded-lg p-1">
          {(["week", "month"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                period === p ? "bg-void-700 text-gold-300" : "text-void-400"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-void-900/60 border border-void-700 rounded-2xl p-6 mb-6 mt-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="font-mono text-3xl font-semibold tabular text-parchment">{currentRate}%</span>
          {delta !== 0 && (
            <span className={`flex items-center gap-1 text-sm font-medium ${delta > 0 ? "text-emerald-400" : "text-red-400"}`}>
              {delta > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {Math.abs(delta)}% vs last {period}
            </span>
          )}
        </div>
        <ul className="flex flex-col gap-2">
          {insightLines.map((line, i) => (
            <li key={i} className="text-sm text-parchment flex gap-2">
              <span className="text-gold-400">•</span>
              {line}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-void-900/60 border border-void-700 rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-semibold mb-3 text-parchment">Per-habit breakdown</h2>
        <div className="flex flex-col gap-2">
          {perHabit.map((h) => (
            <div key={h.name} className="flex items-center justify-between text-sm">
              <span className="text-parchment truncate">{h.name}</span>
              <span className="tabular font-mono text-void-400">{h.rate}%</span>
            </div>
          ))}
          {perHabit.length === 0 && <p className="text-void-400 text-sm">No habits yet.</p>}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={downloadPdf}
          className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-void-950 text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors"
        >
          <FileDown size={16} /> Download PDF report
        </button>
        <button
          onClick={downloadJson}
          className="flex items-center gap-2 bg-void-800 border border-void-600 hover:border-void-400 text-sm font-medium rounded-lg px-4 py-2.5 transition-colors text-parchment"
        >
          <Download size={16} /> Export JSON
        </button>
        <button
          onClick={downloadCsv}
          className="flex items-center gap-2 bg-void-800 border border-void-600 hover:border-void-400 text-sm font-medium rounded-lg px-4 py-2.5 transition-colors text-parchment"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>
      <p className="text-[11px] text-void-400 mt-3">
        Exports are a full backup of your data — use them to move to a new browser or device.
      </p>
    </div>
  );
}
