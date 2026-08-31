import { describe, expect, it } from "vitest";
import { buildHabitFromTemplate, buildHabitsFromTemplate } from "./templates";
import { HabitTemplate } from "./types";

describe("buildHabitFromTemplate", () => {
  it("converts a reusable template bundle into multiple habit payloads", () => {
    const template: HabitTemplate = {
      id: "template-1",
      name: "Daily essentials",
      description: "A ready-to-use starter pack for healthy routines.",
      habits: [
        {
          name: "LeetCode",
          description: "Practice coding drills",
          categoryId: "cat-coding",
          scheduleType: "daily",
          scheduleDays: [],
          targetTime: "19:30",
          targetValue: 1,
          targetUnit: "session",
        },
        {
          name: "Read book",
          description: "Read for focus and learning",
          categoryId: "cat-learning",
          scheduleType: "daily",
          scheduleDays: [],
          targetTime: "21:00",
          targetValue: 20,
          targetUnit: "pages",
        },
        {
          name: "Drink water",
          description: "Stay hydrated",
          categoryId: "cat-health",
          scheduleType: "daily",
          scheduleDays: [],
          targetTime: "09:00",
          targetValue: 8,
          targetUnit: "glasses",
        },
      ],
      createdAt: "2024-01-01T00:00:00.000Z",
    };

    const habits = buildHabitsFromTemplate(
      template,
      "2024-02-02T00:00:00.000Z",
      ["habit-1", "habit-2", "habit-3"],
    );

    expect(habits).toHaveLength(3);
    expect(habits[0].name).toBe("LeetCode");
    expect(habits[1].name).toBe("Read book");
    expect(habits[2].name).toBe("Drink water");
    expect(habits[0].milestones).toEqual([7, 30, 100]);

    const singleHabit = buildHabitFromTemplate(
      template,
      "habit-42",
      "2024-02-02T00:00:00.000Z",
    );

    expect(singleHabit.id).toBe("habit-42");
    expect(singleHabit.name).toBe("LeetCode");
  });
});
