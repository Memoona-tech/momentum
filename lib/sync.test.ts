import { describe, expect, it } from "vitest";
import { filterExportData, inspectPayload, mergeAppData } from "./sync";
import { AppData, Habit, HabitLog } from "./types";

const defaultSettings = {
  theme: "vault",
  unlockedThemes: ["vault"],
  notificationsEnabled: true,
  reminderLeadMinutes: 30,
  passcodeHash: null,
  profile: { name: "Test User", avatarUrl: null, dailyNote: "" },
};

const habitA: Habit = {
  id: "h1",
  name: "Morning Run",
  description: "Run in the park",
  categoryId: null,
  scheduleType: "daily",
  scheduleDays: [],
  targetTime: "07:00",
  targetValue: 5,
  targetUnit: "km",
  archived: false,
  createdAt: "2026-10-01T00:00:00Z",
  order: 0,
  milestones: [7, 30],
  achievedMilestones: [],
};

const habitB: Habit = {
  id: "h2",
  name: "Read Book",
  description: "Read 20 pages",
  categoryId: null,
  scheduleType: "daily",
  scheduleDays: [],
  targetTime: null,
  targetValue: 20,
  targetUnit: "pages",
  archived: false,
  createdAt: "2026-10-01T00:00:00Z",
  order: 1,
  milestones: [7, 30],
  achievedMilestones: [],
};

describe("sync - filterExportData", () => {
  const sampleData: AppData = {
    habits: [habitA, habitB],
    categories: [],
    logs: [
      { habitId: "h1", date: "2026-10-10", completed: true, value: 5, durationMinutes: 30, note: null, loggedAt: "2026-10-10T08:00:00Z" },
      { habitId: "h1", date: "2026-10-11", completed: true, value: 5, durationMinutes: 30, note: null, loggedAt: "2026-10-11T08:00:00Z" },
      { habitId: "h2", date: "2026-10-11", completed: true, value: 20, durationMinutes: null, note: "Chapter 1", loggedAt: "2026-10-11T20:00:00Z" },
    ],
    settings: defaultSettings,
  };

  it("exports all logs when scope is all", () => {
    const exported = filterExportData(sampleData, { type: "all" });
    expect(exported.logs).toHaveLength(3);
  });

  it("exports only logs for a single day when requested", () => {
    const exported = filterExportData(sampleData, { type: "single", startDate: "2026-10-10" });
    expect(exported.logs).toHaveLength(1);
    expect(exported.logs[0].date).toBe("2026-10-10");
  });

  it("exports only logs within a date range", () => {
    const exported = filterExportData(sampleData, { type: "range", startDate: "2026-10-11", endDate: "2026-10-11" });
    expect(exported.logs).toHaveLength(2);
    expect(exported.logs.every((l) => l.date === "2026-10-11")).toBe(true);
  });
});

describe("sync - inspectPayload", () => {
  it("rejects invalid json string", () => {
    const res = inspectPayload("not json");
    expect(res.isValid).toBe(false);
  });

  it("extracts summary information from valid payload", () => {
    const payload = {
      habits: [habitA],
      categories: [],
      logs: [
        { habitId: "h1", date: "2026-10-09", completed: true },
        { habitId: "h1", date: "2026-10-11", completed: true },
      ],
    };
    const res = inspectPayload(JSON.stringify(payload));
    expect(res.isValid).toBe(true);
    expect(res.habitsCount).toBe(1);
    expect(res.logsCount).toBe(2);
    expect(res.minDate).toBe("2026-10-09");
    expect(res.maxDate).toBe("2026-10-11");
  });
});

describe("sync - mergeAppData", () => {
  it("merges logs non-destructively for a single day between PC and Phone", () => {
    // Current (e.g. Phone): has habitA completed on 2026-10-10 and habitB completed on 2026-10-11
    const currentData: AppData = {
      habits: [habitA, habitB],
      categories: [],
      logs: [
        { habitId: "h1", date: "2026-10-10", completed: true, value: null, durationMinutes: null, note: null, loggedAt: "2026-10-10T10:00:00Z" },
        { habitId: "h2", date: "2026-10-11", completed: true, value: 20, durationMinutes: null, note: "Phone note", loggedAt: "2026-10-11T12:00:00Z" },
      ],
      settings: defaultSettings,
    };

    // Incoming (e.g. PC): user updated habitA on 2026-10-11 on PC
    const incomingData: AppData = {
      habits: [habitA, habitB],
      categories: [],
      logs: [
        { habitId: "h1", date: "2026-10-11", completed: true, value: 5, durationMinutes: 25, note: "PC note", loggedAt: "2026-10-11T18:00:00Z" },
      ],
      settings: defaultSettings,
    };

    // Merge only 2026-10-11
    const { nextData, result } = mergeAppData(currentData, incomingData, {
      startDate: "2026-10-11",
      endDate: "2026-10-11",
      mode: "merge",
    });

    expect(result.addedLogs).toBe(1);
    expect(nextData.logs).toHaveLength(3);

    // 2026-10-10 log on phone is untouched!
    const oct10 = nextData.logs.find((l) => l.date === "2026-10-10");
    expect(oct10?.completed).toBe(true);

    // 2026-10-11 now has BOTH habitA (from PC) and habitB (from Phone)!
    const oct11Logs = nextData.logs.filter((l) => l.date === "2026-10-11");
    expect(oct11Logs).toHaveLength(2);
    expect(oct11Logs.some((l) => l.habitId === "h1" && l.completed)).toBe(true);
    expect(oct11Logs.some((l) => l.habitId === "h2" && l.completed)).toBe(true);
  });

  it("resolves conflicts by preserving completion status if either device marked it completed", () => {
    const currentData: AppData = {
      habits: [habitA],
      categories: [],
      logs: [
        { habitId: "h1", date: "2026-10-11", completed: true, value: null, durationMinutes: 30, note: "Completed on phone", loggedAt: "2026-10-11T10:00:00Z" },
      ],
      settings: defaultSettings,
    };

    const incomingData: AppData = {
      habits: [habitA],
      categories: [],
      logs: [
        // PC has incomplete log or didn't check it off
        { habitId: "h1", date: "2026-10-11", completed: false, value: null, durationMinutes: null, note: null, loggedAt: "2026-10-11T09:00:00Z" },
      ],
      settings: defaultSettings,
    };

    const { nextData } = mergeAppData(currentData, incomingData, {
      startDate: "2026-10-11",
      endDate: "2026-10-11",
      mode: "merge",
    });

    const log = nextData.logs.find((l) => l.habitId === "h1" && l.date === "2026-10-11");
    expect(log?.completed).toBe(true);
    expect(log?.note).toBe("Completed on phone");
  });

  it("maps habits by name when IDs differ between PC and Phone", () => {
    const currentData: AppData = {
      habits: [
        { ...habitA, id: "phone-habit-1", name: "Morning Run" },
      ],
      categories: [],
      logs: [],
      settings: defaultSettings,
    };

    const incomingData: AppData = {
      habits: [
        { ...habitA, id: "pc-habit-999", name: "morning run" }, // same name, different ID and casing
      ],
      categories: [],
      logs: [
        { habitId: "pc-habit-999", date: "2026-10-11", completed: true, value: 5, durationMinutes: null, note: null, loggedAt: "2026-10-11T12:00:00Z" },
      ],
      settings: defaultSettings,
    };

    const { nextData } = mergeAppData(currentData, incomingData, { mode: "merge" });
    // Should NOT create a duplicate habit
    expect(nextData.habits).toHaveLength(1);
    expect(nextData.habits[0].id).toBe("phone-habit-1");

    // The log should be mapped to the phone habit ID!
    expect(nextData.logs).toHaveLength(1);
    expect(nextData.logs[0].habitId).toBe("phone-habit-1");
  });

  it("adds newly introduced habits from the incoming payload", () => {
    const currentData: AppData = {
      habits: [habitA],
      categories: [],
      logs: [],
      settings: defaultSettings,
    };

    const incomingData: AppData = {
      habits: [habitA, habitB],
      categories: [],
      logs: [
        { habitId: "h2", date: "2026-10-11", completed: true, value: null, durationMinutes: null, note: null, loggedAt: "2026-10-11T12:00:00Z" },
      ],
      settings: defaultSettings,
    };

    const { nextData, result } = mergeAppData(currentData, incomingData, { mode: "merge" });
    expect(result.addedHabits).toBe(1);
    expect(nextData.habits).toHaveLength(2);
    expect(nextData.logs).toHaveLength(1);
    expect(nextData.logs[0].habitId).toBe("h2");
  });
});
