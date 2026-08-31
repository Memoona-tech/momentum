import { Habit, HabitTemplate, HabitTemplateItem } from "./types";

export function buildHabitFromTemplateItem(
  item: HabitTemplateItem,
  habitId: string,
  createdAt: string,
  order: number,
): Habit {
  return {
    id: habitId,
    name: item.name,
    description: item.description,
    categoryId: item.categoryId,
    scheduleType: item.scheduleType,
    scheduleDays: item.scheduleDays,
    targetTime: item.targetTime,
    targetValue: item.targetValue,
    targetUnit: item.targetUnit,
    archived: false,
    createdAt,
    order,
    milestones: [7, 30, 100],
    achievedMilestones: [],
  };
}

export function buildHabitsFromTemplate(
  template: HabitTemplate,
  createdAt: string,
  habitIds: string[] = template.habits.map((_, index) => `habit-${index + 1}`),
): Habit[] {
  return template.habits.map((item, index) =>
    buildHabitFromTemplateItem(
      item,
      habitIds[index] ?? `habit-${index + 1}`,
      createdAt,
      index,
    ),
  );
}

export function buildHabitFromTemplate(
  template: HabitTemplate,
  habitId: string,
  createdAt: string,
) {
  const [firstHabit = template.habits[0]] = template.habits;
  if (!firstHabit) {
    throw new Error("Template must include at least one habit.");
  }

  return buildHabitFromTemplateItem(firstHabit, habitId, createdAt, 0);
}
