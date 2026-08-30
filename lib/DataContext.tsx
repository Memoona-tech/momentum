"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { AppData, Category, Habit, HabitLog, Settings } from "./types";
import { loadData, saveData, newId } from "./storage";

interface DataContextValue {
  ready: boolean;
  habits: Habit[];
  categories: Category[];
  logs: HabitLog[];
  settings: Settings;
  createHabit: (h: Partial<Habit>) => void;
  updateHabit: (id: string, h: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  createCategory: (c: Partial<Category>) => void;
  updateCategory: (id: string, c: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  setLog: (habitId: string, date: string, completed: boolean, value?: number | null, note?: string | null) => void;
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

  if (!data) {
    // Nothing renders until localStorage is read on the client, avoiding
    // a server/client mismatch flash of empty state.
    return null;
  }

  function createHabit(h: Partial<Habit>) {
    const habit: Habit = {
      id: newId(),
      name: h.name ?? "Untitled habit",
      description: h.description ?? "",
      categoryId: h.categoryId ?? null,
      scheduleType: h.scheduleType ?? "daily",
      scheduleDays: h.scheduleDays ?? [],
      targetTime: h.targetTime ?? null,
      targetValue: h.targetValue ?? null,
      targetUnit: h.targetUnit ?? null,
      archived: false,
      createdAt: new Date().toISOString(),
    };
    persist({ ...data!, habits: [habit, ...data!.habits] });
  }

  function updateHabit(id: string, h: Partial<Habit>) {
    persist({
      ...data!,
      habits: data!.habits.map((x) => (x.id === id ? { ...x, ...h } : x)),
    });
  }

  function deleteHabit(id: string) {
    persist({
      ...data!,
      habits: data!.habits.filter((x) => x.id !== id),
      logs: data!.logs.filter((l) => l.habitId !== id),
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
      categories: data!.categories.map((x) => (x.id === id ? { ...x, ...c } : x)),
    });
  }

  function deleteCategory(id: string) {
    persist({
      ...data!,
      categories: data!.categories.filter((x) => x.id !== id),
      habits: data!.habits.map((h) => (h.categoryId === id ? { ...h, categoryId: null } : h)),
    });
  }

  function setLog(habitId: string, date: string, completed: boolean, value?: number | null, note?: string | null) {
    const existing = data!.logs.find((l) => l.habitId === habitId && l.date === date);
    const entry: HabitLog = {
      habitId,
      date,
      completed,
      value: value ?? null,
      note: note ?? null,
      loggedAt: new Date().toISOString(),
    };
    const logs = existing
      ? data!.logs.map((l) => (l.habitId === habitId && l.date === date ? entry : l))
      : [...data!.logs, entry];
    persist({ ...data!, logs });
  }

  function unsetLog(habitId: string, date: string) {
    persist({ ...data!, logs: data!.logs.filter((l) => !(l.habitId === habitId && l.date === date)) });
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
