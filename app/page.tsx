"use client";

import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Plus,
  Feather,
  GripVertical,
  Flame,
  Search,
  ArrowLeftRight,
  Sparkles,
  LayoutGrid,
  List,
  Layers,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  X,
} from "lucide-react";
import { getIcon } from "@/lib/icons";
import { useData } from "@/lib/DataContext";
import {
  currentStreak,
  isScheduledOn,
  longestStreak,
  todayStr,
} from "@/lib/schedule";
import { generateDemoData } from "@/lib/demoData";
import HabitCard from "@/components/HabitCard";
import HabitFormModal from "@/components/HabitFormModal";
import ProgressDial from "@/components/ProgressDial";
import SyncModal from "@/components/SyncModal";
import DailyMotivation from "@/components/DailyMotivation";

export default function DashboardPage() {
  const { habits, categories, logs, settings, reorderHabits, replaceAll } =
    useData();
  const [showForm, setShowForm] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "grouped" | "list">("grid");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed" | "archived">("all");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const today = todayStr();

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("momentum_today_view");
      if (saved === "grid" || saved === "grouped" || saved === "list") {
        setViewMode(saved);
      }
    } catch {
      // Ignore
    }
  }, []);

  function handleViewModeChange(mode: "grid" | "grouped" | "list") {
    setViewMode(mode);
    try {
      window.localStorage.setItem("momentum_today_view", mode);
    } catch {
      // Ignore
    }
  }

  function handleLoadDemoData() {
    if (
      habits.length > 0 &&
      !window.confirm(
        "Load demo habits and streaks? This will populate sample data to explore the app.",
      )
    ) {
      return;
    }
    replaceAll(generateDemoData());
  }

  const todaysHabits = useMemo(
    () =>
      habits
        .filter((h) => !h.archived && isScheduledOn(h, new Date()))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [habits],
  );

  const archivedHabits = useMemo(
    () => habits.filter((h) => h.archived),
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

  const currentDisplayHabits = statusFilter === "archived" ? archivedHabits : todaysHabits;

  const filteredHabits = useMemo(() => {
    return currentDisplayHabits.filter((habit) => {
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        const haystack = `${habit.name} ${habit.description ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (statusFilter === "archived") {
        if (selectedCategory && habit.categoryId !== selectedCategory) return false;
        return true;
      }
      const isDone = !!logsByHabit.get(habit.id)?.completed;
      if (statusFilter === "pending" && isDone) return false;
      if (statusFilter === "completed" && !isDone) return false;
      if (selectedCategory && habit.categoryId !== selectedCategory) return false;
      return true;
    });
  }, [query, currentDisplayHabits, statusFilter, selectedCategory, logsByHabit]);

  const categoriesWithHabits = useMemo(() => {
    return categories
      .map((c) => {
        const catHabits = todaysHabits.filter((h) => h.categoryId === c.id);
        const done = catHabits.filter((h) => logsByHabit.get(h.id)?.completed).length;
        return {
          category: c,
          count: catHabits.length,
          completedCount: done,
        };
      })
      .filter((item) => item.count > 0);
  }, [categories, todaysHabits, logsByHabit]);

  const habitsByCategory = useMemo(() => {
    const list: {
      category: (typeof categories)[number] | null;
      habits: typeof filteredHabits;
      total: number;
      completed: number;
    }[] = [];

    categories.forEach((cat) => {
      const catHabits = filteredHabits.filter((h) => h.categoryId === cat.id);
      if (catHabits.length > 0) {
        const done = catHabits.filter((h) => logsByHabit.get(h.id)?.completed).length;
        list.push({
          category: cat,
          habits: catHabits,
          total: catHabits.length,
          completed: done,
        });
      }
    });

    const uncat = filteredHabits.filter((h) => !h.categoryId);
    if (uncat.length > 0) {
      const done = uncat.filter((h) => logsByHabit.get(h.id)?.completed).length;
      list.push({
        category: null,
        habits: uncat,
        total: uncat.length,
        completed: done,
      });
    }

    return list;
  }, [categories, filteredHabits, logsByHabit]);

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
          {habits.length === 0 && (
            <button
              type="button"
              onClick={handleLoadDemoData}
              className="flex items-center gap-1.5 bg-void-800 hover:bg-void-700 text-gold-400 border border-gold-500/40 text-sm font-medium rounded-lg px-3 py-2.5 transition-colors"
              title="Load sample habits and 30-day streak history"
            >
              <Sparkles size={15} />
              <span className="hidden sm:inline">Load Demo Data</span>
              <span className="sm:hidden">Demo</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowSyncModal(true)}
            className="flex items-center gap-1.5 bg-void-800 hover:bg-void-700 text-parchment border border-void-600 text-sm font-medium rounded-lg px-3 py-2.5 transition-colors"
            title="Sync habit completions with PC or Phone"
          >
            <ArrowLeftRight size={15} className="text-gold-400" />
            <span className="hidden sm:inline">Sync PC / Phone</span>
            <span className="sm:hidden">Sync</span>
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 bg-gold-500 hover:bg-gold-600 text-void-950 text-sm font-semibold rounded-lg px-3.5 py-2.5 transition-colors"
          >
            <Plus size={16} /> New habit
          </button>
        </div>
      </div>

      <DailyMotivation />

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

      {/* Search, Status Tabs, & Layout Switcher Toolbar */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-void-500"
              size={15}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter habits by name..."
              className="w-full rounded-xl border border-void-600 bg-void-900/60 py-2.5 pl-9 pr-8 text-sm text-parchment placeholder:text-void-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-void-400 hover:text-parchment p-1"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status Filter Tabs (All / Pending / Done) */}
          <div className="flex items-center gap-1 bg-void-900/80 border border-void-700 rounded-xl p-1 shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === "all"
                  ? "bg-gold-500/20 text-gold-300 font-semibold"
                  : "text-void-400 hover:text-parchment"
              }`}
            >
              All ({todaysHabits.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("pending")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === "pending"
                  ? "bg-gold-500/20 text-gold-300 font-semibold"
                  : "text-void-400 hover:text-parchment"
              }`}
            >
              Pending ({todaysHabits.length - completedCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("completed")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === "completed"
                  ? "bg-emerald-500/20 text-emerald-300 font-semibold"
                  : "text-void-400 hover:text-parchment"
              }`}
            >
              Done ({completedCount})
            </button>
            {archivedHabits.length > 0 && (
              <button
                type="button"
                onClick={() => setStatusFilter("archived")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === "archived"
                    ? "bg-amber-500/20 text-amber-300 font-semibold"
                    : "text-void-400 hover:text-parchment"
                }`}
              >
                Archived ({archivedHabits.length})
              </button>
            )}
          </div>

          {/* View Mode Toggle (Grid / Grouped / List) */}
          <div className="flex items-center gap-1 bg-void-900/80 border border-void-700 rounded-xl p-1 shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => handleViewModeChange("grid")}
              title="Compact Grid View (fits 30+ habits in one screen)"
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-gold-500 text-void-950 font-bold shadow-sm"
                  : "text-void-400 hover:text-parchment"
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              onClick={() => handleViewModeChange("grouped")}
              title="Grouped by Category View"
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "grouped"
                  ? "bg-gold-500 text-void-950 font-bold shadow-sm"
                  : "text-void-400 hover:text-parchment"
              }`}
              aria-label="Grouped category view"
            >
              <Layers size={15} />
            </button>
            <button
              type="button"
              onClick={() => handleViewModeChange("list")}
              title="Classic Detailed List View"
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "list"
                  ? "bg-gold-500 text-void-950 font-bold shadow-sm"
                  : "text-void-400 hover:text-parchment"
              }`}
              aria-label="List view"
            >
              <List size={15} />
            </button>
          </div>
        </div>

        {/* Category Filter Pills (Scrollable horizontally) */}
        {categoriesWithHabits.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                selectedCategory === null
                  ? "bg-gold-500/15 border-gold-500/40 text-gold-300"
                  : "bg-void-900/60 border-void-700 text-void-400 hover:border-void-600 hover:text-parchment"
              }`}
            >
              All Categories
            </button>
            {categoriesWithHabits.map(({ category, count, completedCount: catDone }) => {
              const Icon = getIcon(category.icon);
              const isSelected = selectedCategory === category.id;
              const isCatDone = count > 0 && catDone === count;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() =>
                    setSelectedCategory(isSelected ? null : category.id)
                  }
                  className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border ${
                    isSelected
                      ? "ring-1 ring-gold-400"
                      : "hover:border-void-500"
                  }`}
                  style={{
                    backgroundColor: isSelected
                      ? `${category.color}25`
                      : `${category.color}10`,
                    borderColor: `${category.color}40`,
                    color: category.color,
                  }}
                >
                  <Icon size={12} strokeWidth={2} />
                  <span>{category.name}</span>
                  <span
                    className={`text-[10px] px-1 rounded-full ${
                      isCatDone
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-void-950/40 text-void-400"
                    }`}
                  >
                    {catDone}/{count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {filteredHabits.length === 0 ? (
        <div className="text-center py-16 px-4 border border-dashed border-void-600 rounded-2xl">
          <Feather
            className="mx-auto text-void-600 mb-3"
            size={28}
            strokeWidth={1.5}
          />
          <p className="text-parchment font-medium text-base mb-1">
            {query || statusFilter !== "all" || selectedCategory !== null
              ? "No habits match current filters"
              : "No habits scheduled yet"}
          </p>
          <p className="text-void-400 text-sm mb-6 max-w-sm mx-auto">
            {query || statusFilter !== "all" || selectedCategory !== null
              ? "Try resetting your search, status, or category filters."
              : "Create your first routine or load sample data to explore streaks, heatmaps, and milestone unlocks."}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {query || statusFilter !== "all" || selectedCategory !== null ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setStatusFilter("all");
                  setSelectedCategory(null);
                }}
                className="flex items-center gap-1.5 bg-void-800 hover:bg-void-700 text-gold-400 border border-void-600 text-sm font-medium rounded-lg px-4 py-2.5 transition-colors"
              >
                Reset filters
              </button>
            ) : (
              <>
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-1.5 bg-gold-500 hover:bg-gold-600 text-void-950 text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors"
                >
                  <Plus size={16} /> Add your first habit
                </button>
                <button
                  type="button"
                  onClick={handleLoadDemoData}
                  className="flex items-center gap-1.5 bg-void-800 hover:bg-void-700 text-parchment border border-void-600 text-sm font-medium rounded-lg px-4 py-2.5 transition-colors"
                >
                  <Sparkles size={15} className="text-gold-400" />
                  Load demo data
                </button>
              </>
            )}
          </div>
        </div>
      ) : viewMode === "grid" ? (
        /* Compact Grid View — fits 30+ habits in a single glanceable view */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {filteredHabits.map((h) => (
            <HabitCard
              key={h.id}
              habit={h}
              category={categories.find((c) => c.id === h.categoryId)}
              log={logsByHabit.get(h.id)}
              logs={logs}
              compact={true}
            />
          ))}
        </div>
      ) : viewMode === "grouped" ? (
        /* Grouped by Category View — organized boards with category completion bars */
        <div className="flex flex-col gap-5">
          {habitsByCategory.map(({ category, habits: catHabits, total, completed }) => {
            const catId = category?.id ?? "uncategorized";
            const isCollapsed = !!collapsedCategories[catId];
            const Icon = category ? getIcon(category.icon) : Sparkles;
            const isCatComplete = total > 0 && completed === total;

            return (
              <div
                key={catId}
                className="rounded-2xl border border-void-700/80 bg-void-900/40 p-4 transition-all"
              >
                <div
                  onClick={() =>
                    setCollapsedCategories((prev) => ({
                      ...prev,
                      [catId]: !prev[catId],
                    }))
                  }
                  className="flex items-center justify-between cursor-pointer select-none mb-3 group"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: category
                          ? `${category.color}20`
                          : "#8f8b8420",
                        color: category ? category.color : "#8f8b84",
                      }}
                    >
                      <Icon size={14} strokeWidth={2} />
                    </div>
                    <h3 className="text-sm font-semibold text-parchment group-hover:text-gold-300 transition-colors">
                      {category ? category.name : "General / Uncategorized"}
                    </h3>
                    <span className="text-xs text-void-400 font-mono">
                      ({completed}/{total})
                    </span>
                    {isCatComplete && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={12} /> All Done
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-20 sm:w-28 h-1.5 rounded-full bg-void-800 overflow-hidden hidden sm:block">
                      <div
                        className="h-full bg-gold-500 transition-all"
                        style={{ width: `${(completed / total) * 100}%` }}
                      />
                    </div>
                    <button
                      type="button"
                      className="text-void-400 group-hover:text-parchment transition-colors p-1"
                      aria-label="Toggle category"
                    >
                      {isCollapsed ? (
                        <ChevronRight size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </button>
                  </div>
                </div>

                {!isCollapsed && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {catHabits.map((h) => (
                      <HabitCard
                        key={h.id}
                        habit={h}
                        category={category ?? undefined}
                        log={logsByHabit.get(h.id)}
                        logs={logs}
                        compact={true}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Classic Linear List View with Drag & Drop */
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
              } ${
                dragOverId === h.id && draggedId !== h.id
                  ? "scale-105 bg-void-800/50 rounded-xl"
                  : ""
              }`}
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
      {showSyncModal && <SyncModal onClose={() => setShowSyncModal(false)} />}
    </div>
  );
}
