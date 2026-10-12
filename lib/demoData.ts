import { format, subDays } from "date-fns";
import { AppData, Category, Habit, HabitLog } from "./types";

export function generateDemoData(): AppData {
  const now = new Date();
  const dateStr = (d: Date) => format(d, "yyyy-MM-dd");

  const categories: Category[] = [
    { id: "cat-code", name: "Craft & Code", color: "#c9a44c", icon: "Code2" },
    { id: "cat-health", name: "Health & Vitality", color: "#3f8a73", icon: "HeartPulse" },
    { id: "cat-learn", name: "Learning", color: "#8b5cf6", icon: "BookOpen" },
    { id: "cat-mind", name: "Mindfulness", color: "#e7d5a4", icon: "Sparkles" },
  ];

  const habits: Habit[] = [
    {
      id: "demo-habit-1",
      name: "Deep Work (Focused Flow)",
      description: "Uninterrupted coding or technical writing block.",
      categoryId: "cat-code",
      scheduleType: "daily",
      scheduleDays: [],
      targetTime: "09:00",
      targetValue: 90,
      targetUnit: "minutes",
      archived: false,
      createdAt: subDays(now, 25).toISOString(),
      order: 0,
      milestones: [7, 14, 30],
      achievedMilestones: [7, 14],
    },
    {
      id: "demo-habit-2",
      name: "Morning Run & Cardio",
      description: "Outdoor run or sprint intervals.",
      categoryId: "cat-health",
      scheduleType: "weekly",
      scheduleDays: [1, 3, 5, 6], // Mon, Wed, Fri, Sat
      targetTime: "07:00",
      targetValue: 5,
      targetUnit: "km",
      archived: false,
      createdAt: subDays(now, 30).toISOString(),
      order: 1,
      milestones: [7, 21, 50],
      achievedMilestones: [7],
    },
    {
      id: "demo-habit-3",
      name: "Read Architecture & Books",
      description: "Read system design, papers, or nonfiction books.",
      categoryId: "cat-learn",
      scheduleType: "daily",
      scheduleDays: [],
      targetTime: "21:30",
      targetValue: 20,
      targetUnit: "pages",
      archived: false,
      createdAt: subDays(now, 20).toISOString(),
      order: 2,
      milestones: [7, 30, 100],
      achievedMilestones: [7],
    },
    {
      id: "demo-habit-4",
      name: "Meditation & Breathwork",
      description: "Box breathing and morning stillness.",
      categoryId: "cat-mind",
      scheduleType: "daily",
      scheduleDays: [],
      targetTime: "06:30",
      targetValue: 10,
      targetUnit: "minutes",
      archived: false,
      createdAt: subDays(now, 15).toISOString(),
      order: 3,
      milestones: [7, 30],
      achievedMilestones: [],
    },
  ];

  const logs: HabitLog[] = [];

  // Generate logs for the past 28 days
  for (let i = 0; i < 28; i++) {
    const day = subDays(now, i);
    const ds = dateStr(day);
    const dayOfWeek = day.getDay();

    // Habit 1: Completed consistently for the last 16 days (streak = 16!)
    if (i < 16) {
      logs.push({
        habitId: "demo-habit-1",
        date: ds,
        completed: true,
        value: 90,
        durationMinutes: 90,
        note: i === 0 ? "Shipped core sync engine and streak math" : i === 3 ? "Deep dive on reactive state patterns" : null,
        loggedAt: day.toISOString(),
      });
    } else if (i < 24 && i % 2 === 0) {
      logs.push({
        habitId: "demo-habit-1",
        date: ds,
        completed: true,
        value: 75,
        durationMinutes: 75,
        note: null,
        loggedAt: day.toISOString(),
      });
    }

    // Habit 2: Mon, Wed, Fri, Sat
    if ([1, 3, 5, 6].includes(dayOfWeek)) {
      if (i < 21) {
        logs.push({
          habitId: "demo-habit-2",
          date: ds,
          completed: true,
          value: 5,
          durationMinutes: 28,
          note: i === 0 ? "Crisp morning run, 5:15/km pace" : null,
          loggedAt: day.toISOString(),
        });
      }
    }

    // Habit 3: Reading (streak = 9 days)
    if (i < 9) {
      logs.push({
        habitId: "demo-habit-3",
        date: ds,
        completed: true,
        value: 25,
        durationMinutes: 35,
        note: i === 1 ? "Designing Data-Intensive Applications, Chapter 7" : null,
        loggedAt: day.toISOString(),
      });
    } else if (i < 20 && i % 3 !== 0) {
      logs.push({
        habitId: "demo-habit-3",
        date: ds,
        completed: true,
        value: 20,
        durationMinutes: 30,
        note: null,
        loggedAt: day.toISOString(),
      });
    }

    // Habit 4: Meditation (last 6 days)
    if (i <= 5) {
      logs.push({
        habitId: "demo-habit-4",
        date: ds,
        completed: true,
        value: 10,
        durationMinutes: 10,
        note: i === 0 ? "Grounding breathwork before morning standup" : null,
        loggedAt: day.toISOString(),
      });
    }
  }

  return {
    habits,
    categories,
    logs,
    settings: {
      theme: "ember",
      unlockedThemes: ["vault", "ember"],
      notificationsEnabled: true,
      reminderLeadMinutes: 30,
      passcodeHash: null,
      profile: {
        name: "Demo Explorer",
        avatarUrl: null,
        dailyNote: "Focus on velocity, simplicity, and continuous momentum.",
      },
    },
  };
}
