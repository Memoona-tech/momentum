import { describe, expect, it } from "vitest";
import { addDays, format } from "date-fns";
import { buildContributionGrid } from "./schedule";
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
