import { describe, expect, it } from "vitest";
import { addDays, format } from "date-fns";
import {
  buildContributionGrid,
  nextMilestoneProgress,
  formatLoggedValue,
  getUnlockedMilestoneAchievements,
  getThemeUnlocks,
} from "./schedule";
import { Habit, HabitLog } from "./types";

const baseHabit: Habit = {
  id: "habit-1",
  name: "Read",
  description: "",
  categoryId: null,
  scheduleType: "daily",
  scheduleDays: [],
  targetTime: null,
  targetValue: null,
  targetUnit: null,
  archived: false,
  createdAt: new Date().toISOString(),
};

describe("buildContributionGrid", () => {
  it("creates a calendar-like grid for completed scheduled days", () => {
    const today = new Date();
    const logs: HabitLog[] = [
      {
        habitId: "habit-1",
        date: format(addDays(today, -1), "yyyy-MM-dd"),
        completed: true,
        value: null,
        note: null,
        loggedAt: new Date().toISOString(),
      },
      {
        habitId: "habit-1",
        date: format(addDays(today, -3), "yyyy-MM-dd"),
        completed: true,
        value: null,
        note: null,
        loggedAt: new Date().toISOString(),
      },
    ];

    const grid = buildContributionGrid(baseHabit, logs, 14);

    expect(grid).toHaveLength(14);
    expect(grid.every((cell) => cell.scheduled)).toBe(true);
    expect(grid.filter((cell) => cell.completed)).toHaveLength(2);
    expect(grid[0].date).toBe(format(addDays(today, -13), "yyyy-MM-dd"));
  });
});

describe("nextMilestoneProgress", () => {
  it("calculates the next milestone target and percentage for a habit", () => {
    const habit: Habit = {
      ...baseHabit,
      milestones: [7, 30, 100],
      achievedMilestones: [],
    };

    const logs: HabitLog[] = Array.from({ length: 5 }, (_, index) => ({
      habitId: "habit-1",
      date: format(addDays(new Date(), -(index + 1)), "yyyy-MM-dd"),
      completed: true,
      value: null,
      durationMinutes: null,
      note: null,
      loggedAt: new Date().toISOString(),
    }));

    const result = nextMilestoneProgress(habit, logs);

    expect(result.nextMilestone).toBe(7);
    expect(result.current).toBe(5);
    expect(result.target).toBe(7);
    expect(result.percent).toBe(71);
  });
});

describe("formatLoggedValue", () => {
  it("formats time-based logs as readable minutes and hours", () => {
    const habit: Habit = {
      ...baseHabit,
      targetUnit: "minutes",
    };

    const log: HabitLog = {
      habitId: "habit-1",
      date: "2026-08-31",
      completed: true,
      value: null,
      durationMinutes: 135,
      note: null,
      loggedAt: new Date().toISOString(),
    };

    expect(formatLoggedValue(habit, log)).toBe("2h 15m");
  });
});

describe("getUnlockedMilestoneAchievements", () => {
  it("unlocks a badge when a habit hits a streak milestone", () => {
    const habit: Habit = {
      ...baseHabit,
      milestones: [7, 30, 100],
      achievedMilestones: [],
    };

    const logs: HabitLog[] = Array.from({ length: 7 }, (_, index) => ({
      habitId: "habit-1",
      date: format(addDays(new Date(), -(index + 1)), "yyyy-MM-dd"),
      completed: true,
      value: null,
      durationMinutes: null,
      note: null,
      loggedAt: new Date().toISOString(),
    }));

    const result = getUnlockedMilestoneAchievements([habit], logs);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      habitId: "habit-1",
      milestone: 7,
      title: "7-day streak",
    });
  });
});

describe("getThemeUnlocks", () => {
  it("unlocks theme tiers after enough milestone badges are earned", () => {
    const habit: Habit = {
      ...baseHabit,
      milestones: [7, 30, 100],
      achievedMilestones: [],
    };

    const logs: HabitLog[] = Array.from({ length: 7 }, (_, index) => ({
      habitId: "habit-1",
      date: format(addDays(new Date(), -(index + 1)), "yyyy-MM-dd"),
      completed: true,
      value: null,
      durationMinutes: null,
      note: null,
      loggedAt: new Date().toISOString(),
    }));

    const result = getThemeUnlocks([habit], logs, ["vault"]);

    expect(result.find((theme) => theme.id === "ember")?.unlocked).toBe(true);
    expect(result.find((theme) => theme.id === "vault")?.unlocked).toBe(true);
  });
});
