"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { AppData, Category, Habit, HabitLog, Settings } from "./types";
import { loadData, saveData, newId } from "./storage";
import { getUnlockedMilestones } from "./schedule";

interface DataContextValue {
  ready: boolean;
  habits: Habit[];
  categories: Category[];
  logs: HabitLog[];
  settings: Settings;
  createHabit: (h: Partial<Habit>) => boolean;
  updateHabit: (id: string, h: Partial<Habit>) => boolean;
  deleteHabit: (id: string) => void;
  reorderHabits: (reorderedHabits: Habit[]) => void;
  createCategory: (c: Partial<Category>) => void;
  updateCategory: (id: string, c: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  setLog: (
    habitId: string,
    date: string,
    completed: boolean,
    value?: number | null,
    note?: string | null,
    durationMinutes?: number | null,
  ) => void;
  unsetLog: (habitId: string, date: string) => void;
  updateSettings: (s: Partial<Settings>) => void;
  replaceAll: (data: AppData) => void;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    setData(loadData());
  }, []);

  const persist = useCallback((next: AppData) => {
    setData(next);
    saveData(next);
  }, []);

  function normalizeHabitName(value: string) {
    return value.trim().toLowerCase();
  }

  function isHabitNameTaken(name: string, ignoreId?: string) {
    const normalized = normalizeHabitName(name);
    return data!.habits.some(
      (habit) =>
        habit.id !== ignoreId &&
        normalizeHabitName(habit.name) === normalized &&
        normalized.length > 0,
    );
  }

  if (!data) {
    // Nothing renders until localStorage is read on the client, avoiding
    // a server/client mismatch flash of empty state.
    return null;
  }

  function createHabit(h: Partial<Habit>) {
    const name = (h.name ?? "Untitled habit").trim();
    if (!name || isHabitNameTaken(name)) return false;

    const habit: Habit = {
      id: newId(),
      name,
      description: h.description ?? "",
      categoryId: h.categoryId ?? null,
      scheduleType: h.scheduleType ?? "daily",
      scheduleDays: h.scheduleDays ?? [],
      targetTime: h.targetTime ?? null,
      targetValue: h.targetValue ?? null,
      targetUnit: h.targetUnit ?? null,
      archived: false,
      createdAt: new Date().toISOString(),
      order: data!.habits.length,
      milestones: h.milestones ?? [7, 30, 100],
      achievedMilestones: h.achievedMilestones ?? [],
    };
    persist({ ...data!, habits: [habit, ...data!.habits] });
    return true;
  }

  function updateHabit(id: string, h: Partial<Habit>) {
    const existing = data!.habits.find((habit) => habit.id === id);
    const nextName = (h.name ?? existing?.name ?? "").trim();
    if (nextName && isHabitNameTaken(nextName, id)) return false;

    persist({
      ...data!,
      habits: data!.habits.map((x) =>
        x.id === id ? { ...x, ...h, name: nextName || x.name } : x,
      ),
    });
    return true;
  }

  function deleteHabit(id: string) {
    persist({
      ...data!,
      habits: data!.habits.filter((x) => x.id !== id),
      logs: data!.logs.filter((l) => l.habitId !== id),
    });
  }

  function reorderHabits(reorderedHabits: Habit[]) {
    persist({
      ...data!,
      habits: reorderedHabits,
    });
  }

  function createCategory(c: Partial<Category>) {
    const category: Category = {
      id: newId(),
      name: c.name ?? "Untitled",
      color: c.color ?? "#c9a44c",
      icon: c.icon ?? "Star",
    };
    persist({ ...data!, categories: [...data!.categories, category] });
  }

  function updateCategory(id: string, c: Partial<Category>) {
    persist({
      ...data!,
      categories: data!.categories.map((x) =>
        x.id === id ? { ...x, ...c } : x,
      ),
    });
  }

  function deleteCategory(id: string) {
    persist({
      ...data!,
      categories: data!.categories.filter((x) => x.id !== id),
      habits: data!.habits.map((h) =>
        h.categoryId === id ? { ...h, categoryId: null } : h,
      ),
    });
  }

  function setLog(
    habitId: string,
    date: string,
    completed: boolean,
    value?: number | null,
    note?: string | null,
    durationMinutes?: number | null,
  ) {
    const existing = data!.logs.find(
      (l) => l.habitId === habitId && l.date === date,
    );
    const entry: HabitLog = {
      habitId,
      date,
      completed,
      value: value ?? null,
      durationMinutes: durationMinutes ?? null,
      note: note ?? null,
      loggedAt: new Date().toISOString(),
    };
    const logs = existing
      ? data!.logs.map((l) =>
          l.habitId === habitId && l.date === date ? entry : l,
        )
      : [...data!.logs, entry];
    const habitsWithBadges = data!.habits.map((habit) => {
      if (habit.id !== habitId) {
        return {
          ...habit,
          achievedMilestones: Array.from(
            new Set([
              ...(habit.achievedMilestones ?? []),
              ...getUnlockedMilestones(habit, logs),
            ]),
          ).sort((a, b) => a - b),
        };
      }
      return {
        ...habit,
        achievedMilestones: Array.from(
          new Set([
            ...(habit.achievedMilestones ?? []),
            ...getUnlockedMilestones(habit, logs),
          ]),
        ).sort((a, b) => a - b),
      };
    });
    persist({ ...data!, logs, habits: habitsWithBadges });
  }

  function unsetLog(habitId: string, date: string) {
    const logs = data!.logs.filter(
      (l) => !(l.habitId === habitId && l.date === date),
    );
    const habitsWithBadges = data!.habits.map((habit) => ({
      ...habit,
      achievedMilestones: Array.from(
        new Set([
          ...(habit.achievedMilestones ?? []),
          ...getUnlockedMilestones(habit, logs),
        ]),
      ).sort((a, b) => a - b),
    }));
    persist({
      ...data!,
      logs,
      habits: habitsWithBadges,
    });
  }

  function updateSettings(s: Partial<Settings>) {
    persist({ ...data!, settings: { ...data!.settings, ...s } });
  }

  function replaceAll(next: AppData) {
    persist(next);
  }

  return (
    <DataContext.Provider
      value={{
        ready: true,
        reorderHabits,
        habits: data.habits,
        categories: data.categories,
        logs: data.logs,
        settings: data.settings,
        createHabit,
        updateHabit,
        deleteHabit,
        createCategory,
        updateCategory,
        deleteCategory,
        setLog,
        unsetLog,
        updateSettings,
        replaceAll,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
