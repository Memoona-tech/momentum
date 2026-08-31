"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  Archive,
  ArchiveRestore,
  TrendingUp,
  Search,
} from "lucide-react";
import { useData } from "@/lib/DataContext";
import { Habit } from "@/lib/types";
import CategoryTag from "@/components/CategoryTag";
import HabitFormModal from "@/components/HabitFormModal";
import HabitTemplateModal from "@/components/HabitTemplateModal";
import { WEEKDAY_LABELS } from "@/lib/schedule";

function nth(n: number) {
  if (n % 10 === 1 && n !== 11) return "st";
  if (n % 10 === 2 && n !== 12) return "nd";
  if (n % 10 === 3 && n !== 13) return "rd";
  return "th";
}

function scheduleLabel(habit: Habit): string {
  if (habit.scheduleType === "daily") return "Every day";
  if (habit.scheduleType === "weekly") {
    return (
      habit.scheduleDays.map((d) => WEEKDAY_LABELS[d]).join(", ") ||
      "No days set"
    );
  }
  return (
    habit.scheduleDays.map((d) => `${d}${nth(d)}`).join(", ") || "No days set"
  );
}

export default function HabitsPage() {
  const { habits, categories, updateHabit, deleteHabit } = useData();
  const [showForm, setShowForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [query, setQuery] = useState("");

  const visible = habits.filter((h) =>
    showArchived ? h.archived : !h.archived,
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return visible;
    return visible.filter((habit) => {
      const haystack = `${habit.name} ${habit.description}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [query, visible]);

  function handleDelete(h: Habit) {
    if (confirm(`Delete "${h.name}"? This also removes its logged history.`)) {
      deleteHabit(h.id);
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-1">
        <h1 className="font-display text-3xl text-parchment">Habits</h1>
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

      <div className="flex gap-1 bg-void-800 rounded-lg p-1 w-fit mb-6 mt-5">
        <button
          onClick={() => setShowArchived(false)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            !showArchived ? "bg-void-700 text-gold-300" : "text-void-400"
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setShowArchived(true)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            showArchived ? "bg-void-700 text-gold-300" : "text-void-400"
          }`}
        >
          Archived
        </button>
      </div>

      <div className="mb-5">
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

      <div className="flex flex-col gap-2.5">
        {filtered.length === 0 && (
          <p className="text-void-400 text-sm">
            {query
              ? "No habits match that search."
              : showArchived
                ? "No archived habits."
                : "No habits yet — create your first one."}
          </p>
        )}
        {filtered.map((h) => (
          <div
            key={h.id}
            className="flex items-center gap-3 rounded-xl border border-void-600 bg-void-900/60 p-4"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-sm text-parchment">{h.name}</p>
                <CategoryTag
                  category={categories.find((c) => c.id === h.categoryId)}
                />
              </div>
              {h.description && (
                <p className="text-xs text-void-400 mt-0.5">{h.description}</p>
              )}
              <p className="text-[11px] text-void-400 mt-1 font-mono">
                {scheduleLabel(h)}
                {h.targetTime ? ` · ${h.targetTime}` : ""}
                {h.targetValue
                  ? ` · ${h.targetValue} ${h.targetUnit ?? ""}`
                  : ""}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Link
                href={`/analytics/${h.id}`}
                className="p-2 text-void-400 hover:text-gold-400 transition-colors"
                aria-label={`View analytics for ${h.name}`}
              >
                <TrendingUp size={16} strokeWidth={1.75} />
              </Link>
              <button
                onClick={() => setEditing(h)}
                className="p-2 text-void-400 hover:text-gold-400 transition-colors"
                aria-label="Edit"
              >
                <Pencil size={16} strokeWidth={1.75} />
              </button>
              <button
                onClick={() => updateHabit(h.id, { archived: !h.archived })}
                className="p-2 text-void-400 hover:text-gold-400 transition-colors"
                aria-label={h.archived ? "Restore" : "Archive"}
              >
                {h.archived ? (
                  <ArchiveRestore size={16} strokeWidth={1.75} />
                ) : (
                  <Archive size={16} strokeWidth={1.75} />
                )}
              </button>
              <button
                onClick={() => handleDelete(h)}
                className="p-2 text-void-400 hover:text-red-400 transition-colors"
                aria-label="Delete"
              >
                <Trash2 size={16} strokeWidth={1.75} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && <HabitFormModal onClose={() => setShowForm(false)} />}
      {showTemplates && (
        <HabitTemplateModal onClose={() => setShowTemplates(false)} />
      )}
      {editing && (
        <HabitFormModal habit={editing} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}
