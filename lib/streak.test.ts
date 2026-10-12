import { describe, expect, it } from "vitest";
import { format, subDays } from "date-fns";
import { currentStreak, longestStreak } from "./schedule";
import { Habit, HabitLog } from "./types";

function createHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: "habit-test",
    name: "Streak Test Habit",
    description: "",
    categoryId: null,
    scheduleType: "daily",
    scheduleDays: [],
    targetTime: null,
    targetValue: null,
    targetUnit: null,
    archived: false,
    createdAt: new Date().toISOString(),
    order: 0,
    milestones: [7, 30, 100],
    achievedMilestones: [],
    ...overrides,
  };
}

function makeLog(
  habitId: string,
  daysAgo: number,
  completed = true,
  overrides: Partial<HabitLog> = {},
): HabitLog {
  const date = subDays(new Date(), daysAgo);
  return {
    habitId,
    date: format(date, "yyyy-MM-dd"),
    completed,
    value: null,
    durationMinutes: null,
    note: null,
    loggedAt: date.toISOString(),
    ...overrides,
  };
}

describe("currentStreak logic", () => {
  it("returns 0 when there are no logs for the habit", () => {
    const habit = createHabit();
    expect(currentStreak(habit, [])).toBe(0);
  });

  it("counts consecutive completed days including today", () => {
    const habit = createHabit();
    const logs = [
      makeLog(habit.id, 0, true), // today
      makeLog(habit.id, 1, true), // yesterday
      makeLog(habit.id, 2, true), // 2 days ago
      makeLog(habit.id, 3, true), // 3 days ago
    ];
    expect(currentStreak(habit, logs)).toBe(4);
  });

  it("does not break streak if today is not yet completed but yesterday was", () => {
    const habit = createHabit();
    const logs = [
      makeLog(habit.id, 1, true), // yesterday
      makeLog(habit.id, 2, true), // 2 days ago
      makeLog(habit.id, 3, true), // 3 days ago
    ];
    // Today is not in logs, but streak from yesterday is preserved
    expect(currentStreak(habit, logs)).toBe(3);
  });

  it("resets to 1 if today is completed but yesterday was missed", () => {
    const habit = createHabit();
    const logs = [
      makeLog(habit.id, 0, true), // today completed
      // yesterday (daysAgo=1) missing
      makeLog(habit.id, 2, true), // 2 days ago
      makeLog(habit.id, 3, true), // 3 days ago
    ];
    expect(currentStreak(habit, logs)).toBe(1);
  });

  it("breaks streak if yesterday was explicitly marked incomplete (completed: false)", () => {
    const habit = createHabit();
    const logs = [
      makeLog(habit.id, 1, false), // yesterday failed
      makeLog(habit.id, 2, true),
      makeLog(habit.id, 3, true),
    ];
    expect(currentStreak(habit, logs)).toBe(0);
  });

  it("handles weekly scheduled habits skipping off-days", () => {
    const today = new Date();
    const todayDay = today.getDay(); // 0 to 6
    // Suppose habit is scheduled only on today's day of week
    const habit = createHabit({
      scheduleType: "weekly",
      scheduleDays: [todayDay],
    });

    const logs = [
      makeLog(habit.id, 0, true), // today (scheduled and done)
      makeLog(habit.id, 7, true), // 1 week ago (scheduled and done)
      makeLog(habit.id, 14, true), // 2 weeks ago (scheduled and done)
    ];

    expect(currentStreak(habit, logs)).toBe(3);
  });

  it("breaks weekly streak when a scheduled day was missed", () => {
    const today = new Date();
    const todayDay = today.getDay();
    const habit = createHabit({
      scheduleType: "weekly",
      scheduleDays: [todayDay],
    });

    // Completed today, but missed 7 days ago (even though 14 days ago was completed)
    const logs = [
      makeLog(habit.id, 0, true),
      makeLog(habit.id, 14, true),
    ];

    expect(currentStreak(habit, logs)).toBe(1);
  });

  it("ignores logs from other habits", () => {
    const habitA = createHabit({ id: "habit-A" });
    const habitB = createHabit({ id: "habit-B" });

    const logs = [
      makeLog("habit-A", 0, true),
      makeLog("habit-B", 0, true),
      makeLog("habit-B", 1, true),
      makeLog("habit-B", 2, true),
    ];

    expect(currentStreak(habitA, logs)).toBe(1);
    expect(currentStreak(habitB, logs)).toBe(3);
  });
});

describe("longestStreak logic", () => {
  it("returns 0 for empty logs", () => {
    const habit = createHabit();
    expect(longestStreak(habit, [])).toBe(0);
  });

  it("returns 1 for a single completed day", () => {
    const habit = createHabit();
    const logs = [makeLog(habit.id, 10, true)];
    expect(longestStreak(habit, logs)).toBe(1);
  });

  it("computes the longest historical streak across multiple disjoint runs", () => {
    const habit = createHabit();
    // Run 1: 5 consecutive days (daysAgo 20 to 16)
    // Run 2: 3 consecutive days (daysAgo 10 to 8)
    // Current: 2 consecutive days (daysAgo 1 to 0)
    const logs = [
      makeLog(habit.id, 20, true),
      makeLog(habit.id, 19, true),
      makeLog(habit.id, 18, true),
      makeLog(habit.id, 17, true),
      makeLog(habit.id, 16, true),

      makeLog(habit.id, 10, true),
      makeLog(habit.id, 9, true),
      makeLog(habit.id, 8, true),

      makeLog(habit.id, 1, true),
      makeLog(habit.id, 0, true),
    ];

    expect(longestStreak(habit, logs)).toBe(5);
  });

  it("handles unsorted logs and logs marked completed: false", () => {
    const habit = createHabit();
    const logs = [
      makeLog(habit.id, 4, true),
      makeLog(habit.id, 2, false), // failed, should not count
      makeLog(habit.id, 5, true),
      makeLog(habit.id, 6, true),
      makeLog(habit.id, 3, true),
    ];
    // Dates completed: daysAgo 6, 5, 4, 3 (4 consecutive days)
    expect(longestStreak(habit, logs)).toBe(4);
  });
});
