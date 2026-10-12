import { AppData, Category, Habit, HabitLog } from "./types";
import { getUnlockedMilestones } from "./schedule";

export interface DateScope {
  type: "all" | "single" | "range";
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}

export interface ExportPayload extends AppData {
  version: 1;
  exportedAt: string;
  exportScope?: DateScope;
}

export interface MergeOptions {
  startDate?: string;
  endDate?: string;
  mode?: "merge" | "overwrite-range" | "replace-all";
}

export interface MergeResult {
  addedLogs: number;
  updatedLogs: number;
  addedHabits: number;
  mergedDatesCount: number;
  mode: "merge" | "overwrite-range" | "replace-all";
}

export interface InspectionResult {
  isValid: boolean;
  error?: string;
  habitsCount: number;
  categoriesCount: number;
  logsCount: number;
  dates: string[];
  minDate?: string;
  maxDate?: string;
  payload?: AppData;
  exportScope?: DateScope;
}

function normalizeName(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Filter an AppData object by date or date range for exporting.
 */
export function filterExportData(
  data: AppData,
  scope: DateScope,
): ExportPayload {
  let filteredLogs = [...data.logs];

  if (scope.type === "single" && scope.startDate) {
    filteredLogs = filteredLogs.filter((l) => l.date === scope.startDate);
  } else if (scope.type === "range" && (scope.startDate || scope.endDate)) {
    filteredLogs = filteredLogs.filter((l) => {
      if (scope.startDate && l.date < scope.startDate) return false;
      if (scope.endDate && l.date > scope.endDate) return false;
      return true;
    });
  }

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    exportScope: scope,
    habits: data.habits,
    categories: data.categories,
    logs: filteredLogs,
    settings: data.settings,
  };
}

/**
 * Validate and inspect an imported string or object to see what it contains.
 */
export function inspectPayload(raw: unknown): InspectionResult {
  try {
    let obj = raw;
    if (typeof raw === "string") {
      obj = JSON.parse(raw);
    }

    if (!obj || typeof obj !== "object") {
      return { isValid: false, error: "Invalid JSON format", habitsCount: 0, categoriesCount: 0, logsCount: 0, dates: [] };
    }

    const casted = obj as Record<string, any>;
    if (!Array.isArray(casted.habits) || !Array.isArray(casted.logs)) {
      return {
        isValid: false,
        error: "Missing habits or logs in payload. Make sure this is a Momentum export.",
        habitsCount: 0,
        categoriesCount: 0,
        logsCount: 0,
        dates: [],
      };
    }

    const habits = casted.habits as Habit[];
    const categories = Array.isArray(casted.categories) ? (casted.categories as Category[]) : [];
    const logs = casted.logs as HabitLog[];
    const dateSet = new Set<string>();
    logs.forEach((l) => {
      if (l.date && typeof l.date === "string") {
        dateSet.add(l.date);
      }
    });

    const dates = Array.from(dateSet).sort();
    return {
      isValid: true,
      habitsCount: habits.length,
      categoriesCount: categories.length,
      logsCount: logs.length,
      dates,
      minDate: dates.length > 0 ? dates[0] : undefined,
      maxDate: dates.length > 0 ? dates[dates.length - 1] : undefined,
      payload: {
        habits,
        categories,
        logs,
        settings: casted.settings ?? {
          theme: "vault",
          unlockedThemes: ["vault"],
          notificationsEnabled: true,
          reminderLeadMinutes: 30,
          passcodeHash: null,
          profile: { name: "Momentum User", avatarUrl: null, dailyNote: "" },
        },
      },
      exportScope: casted.exportScope,
    };
  } catch (err: any) {
    return {
      isValid: false,
      error: err?.message || "Failed to parse JSON",
      habitsCount: 0,
      categoriesCount: 0,
      logsCount: 0,
      dates: [],
    };
  }
}

/**
 * Merges incoming AppData into current AppData.
 * Allows filtering by single date or date range, and guarantees non-destructive merging.
 */
export function mergeAppData(
  current: AppData,
  incoming: AppData,
  options: MergeOptions = {},
): { nextData: AppData; result: MergeResult } {
  const mode = options.mode ?? "merge";

  if (mode === "replace-all") {
    const habitsWithBadges = incoming.habits.map((h) => ({
      ...h,
      achievedMilestones: Array.from(
        new Set([...(h.achievedMilestones ?? []), ...getUnlockedMilestones(h, incoming.logs)]),
      ).sort((a, b) => a - b),
    }));

    return {
      nextData: {
        habits: habitsWithBadges,
        categories: incoming.categories,
        logs: incoming.logs,
        settings: incoming.settings ?? current.settings,
      },
      result: {
        addedLogs: incoming.logs.length,
        updatedLogs: 0,
        addedHabits: incoming.habits.length,
        mergedDatesCount: new Set(incoming.logs.map((l) => l.date)).size,
        mode: "replace-all",
      },
    };
  }

  // 1. Categories mapping and merging
  const categoryIdMap = new Map<string, string>();
  const mergedCategories = [...current.categories];

  for (const incCat of incoming.categories) {
    const existing = mergedCategories.find(
      (c) => c.id === incCat.id || normalizeName(c.name) === normalizeName(incCat.name),
    );
    if (existing) {
      categoryIdMap.set(incCat.id, existing.id);
    } else {
      mergedCategories.push(incCat);
      categoryIdMap.set(incCat.id, incCat.id);
    }
  }

  // 2. Habits mapping and merging
  const habitIdMap = new Map<string, string>();
  const mergedHabits = [...current.habits];
  let addedHabits = 0;

  for (const incHabit of incoming.habits) {
    const existing = mergedHabits.find(
      (h) => h.id === incHabit.id || normalizeName(h.name) === normalizeName(incHabit.name),
    );
    if (existing) {
      habitIdMap.set(incHabit.id, existing.id);
    } else {
      const newHabit: Habit = {
        ...incHabit,
        categoryId: incHabit.categoryId ? categoryIdMap.get(incHabit.categoryId) ?? null : null,
        order: mergedHabits.length,
      };
      mergedHabits.push(newHabit);
      habitIdMap.set(incHabit.id, newHabit.id);
      addedHabits++;
    }
  }

  // Helper date checker
  function isDateInRange(date: string): boolean {
    if (options.startDate && date < options.startDate) return false;
    if (options.endDate && date > options.endDate) return false;
    return true;
  }

  // 3. Filter incoming logs to chosen scope
  const targetIncomingLogs = incoming.logs.filter((l) => isDateInRange(l.date));

  let addedLogs = 0;
  let updatedLogs = 0;
  const touchedDates = new Set<string>();

  // Map of current logs: `${habitId}:${date}` -> HabitLog
  const logsMap = new Map<string, HabitLog>();
  for (const log of current.logs) {
    logsMap.set(`${log.habitId}:${log.date}`, { ...log });
  }

  if (mode === "overwrite-range") {
    // If overwrite-range: remove any current logs in range for incoming habits, then insert incoming
    for (const incLog of targetIncomingLogs) {
      const mappedHabitId = habitIdMap.get(incLog.habitId) ?? incLog.habitId;
      const key = `${mappedHabitId}:${incLog.date}`;
      const hadExisting = logsMap.has(key);
      logsMap.set(key, {
        ...incLog,
        habitId: mappedHabitId,
      });
      if (hadExisting) updatedLogs++;
      else addedLogs++;
      touchedDates.add(incLog.date);
    }
  } else {
    // Smart merge mode: preserve completion from both sides
    for (const incLog of targetIncomingLogs) {
      const mappedHabitId = habitIdMap.get(incLog.habitId) ?? incLog.habitId;
      const key = `${mappedHabitId}:${incLog.date}`;
      const existing = logsMap.get(key);
      touchedDates.add(incLog.date);

      if (!existing) {
        logsMap.set(key, {
          ...incLog,
          habitId: mappedHabitId,
        });
        addedLogs++;
      } else {
        // Merge conflict resolution
        const incomingIsCompleted = Boolean(incLog.completed);
        const existingIsCompleted = Boolean(existing.completed);

        // Rule 1: If either is completed, mark completed!
        const completed = existingIsCompleted || incomingIsCompleted;

        // Rule 2: Take values / durations if present
        const value = incLog.value ?? existing.value ?? null;
        const durationMinutes = incLog.durationMinutes ?? existing.durationMinutes ?? null;

        // Rule 3: Combine or preserve notes
        let note = existing.note;
        if (!note) {
          note = incLog.note;
        } else if (incLog.note && incLog.note !== note) {
          note = `${note} | ${incLog.note}`;
        }

        const loggedAt =
          incLog.loggedAt && existing.loggedAt
            ? incLog.loggedAt > existing.loggedAt
              ? incLog.loggedAt
              : existing.loggedAt
            : incLog.loggedAt || existing.loggedAt || new Date().toISOString();

        logsMap.set(key, {
          habitId: mappedHabitId,
          date: incLog.date,
          completed,
          value,
          durationMinutes,
          note,
          loggedAt,
        });
        updatedLogs++;
      }
    }
  }

  const finalLogs = Array.from(logsMap.values());

  // 4. Update milestones
  const habitsWithMilestones = mergedHabits.map((habit) => ({
    ...habit,
    achievedMilestones: Array.from(
      new Set([...(habit.achievedMilestones ?? []), ...getUnlockedMilestones(habit, finalLogs)]),
    ).sort((a, b) => a - b),
  }));

  // 5. Update settings theme unlocks
  const unlockedThemes = Array.from(
    new Set([...(current.settings.unlockedThemes ?? ["vault"]), ...(incoming.settings?.unlockedThemes ?? [])]),
  );

  const nextData: AppData = {
    habits: habitsWithMilestones,
    categories: mergedCategories,
    logs: finalLogs,
    settings: {
      ...current.settings,
      unlockedThemes,
    },
  };

  return {
    nextData,
    result: {
      addedLogs,
      updatedLogs,
      addedHabits,
      mergedDatesCount: touchedDates.size,
      mode,
    },
  };
}
