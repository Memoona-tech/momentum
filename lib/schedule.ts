import { format, parseISO, subDays } from "date-fns";
import { Habit, HabitLog } from "./types";

export interface ContributionCell {
  date: string;
  scheduled: boolean;
  completed: boolean;
}

export interface MilestoneAchievement {
  id: string;
  habitId: string;
  habitName: string;
  milestone: number;
  title: string;
  description: string;
}

export interface ThemeUnlockOption {
  id: string;
  name: string;
  description: string;
  accentColor: string;
  threshold: number;
  unlocked: boolean;
}

export const MILESTONE_THEME_UNLOCKS: Omit<ThemeUnlockOption, "unlocked">[] = [
  {
    id: "vault",
    name: "Vault",
    description: "The original brass-and-void look.",
    accentColor: "#c9a44c",
    threshold: 0,
  },
  {
    id: "ember",
    name: "Ember",
    description: "Warm copper glow for your first streak badge.",
    accentColor: "#f97316",
    threshold: 1,
  },
  {
    id: "forest",
    name: "Forest",
    description: "A calmer green arc for deeper streaks.",
    accentColor: "#3f8a73",
    threshold: 3,
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "A cooler slate finish after bigger wins.",
    accentColor: "#8b5cf6",
    threshold: 6,
  },
];

export function isScheduledOn(habit: Habit, date: Date): boolean {
  if (habit.scheduleType === "daily") return true;
  if (habit.scheduleType === "weekly")
    return habit.scheduleDays.includes(date.getDay());
  if (habit.scheduleType === "monthly")
    return habit.scheduleDays.includes(date.getDate());
  return false;
}

export function todayStr(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function dateStr(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

// Current streak: consecutive scheduled days, walking backwards from today,
// with a completed log. Today not being done yet doesn't break it.
export function currentStreak(habit: Habit, logs: HabitLog[]): number {
  const logsByDate = new Map(
    logs.filter((l) => l.habitId === habit.id).map((l) => [l.date, l]),
  );
  let streak = 0;
  let cursor = new Date();

  for (let i = 0; i < 730; i++) {
    const ds = dateStr(cursor);
    if (isScheduledOn(habit, cursor)) {
      const log = logsByDate.get(ds);
      const isToday = ds === todayStr();
      if (log?.completed) {
        streak++;
      } else if (isToday) {
        // not yet done today — doesn't break the streak
      } else {
        break;
      }
    }
    cursor = subDays(cursor, 1);
  }
  return streak;
}

export function longestStreak(habit: Habit, logs: HabitLog[]): number {
  const logsByDate = new Map(
    logs
      .filter((l) => l.habitId === habit.id && l.completed)
      .map((l) => [l.date, true]),
  );
  if (logsByDate.size === 0) return 0;

  const dates = Array.from(logsByDate.keys()).sort();
  let longest = 1;
  let run = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = parseISO(dates[i - 1]);
    const cur = parseISO(dates[i]);
    const diffDays = Math.round((cur.getTime() - prev.getTime()) / 86400000);
    run = diffDays === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }
  return longest;
}

export function buildContributionGrid(
  habit: Habit,
  logs: HabitLog[],
  days = 28,
): ContributionCell[] {
  const entries = new Map(
    logs.filter((l) => l.habitId === habit.id).map((l) => [l.date, l]),
  );
  const cells: ContributionCell[] = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = subDays(today, days - 1 - i);
    const dateKey = dateStr(date);
    const scheduled = isScheduledOn(habit, date);
    const completed = scheduled && Boolean(entries.get(dateKey)?.completed);
    cells.push({
      date: dateKey,
      scheduled,
      completed,
    });
  }

  return cells;
}

export function formatLoggedValue(habit: Habit, log?: HabitLog): string | null {
  if (!log) return null;

  if (log.durationMinutes != null) {
    const totalMinutes = Math.max(0, Math.round(log.durationMinutes));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours && minutes) return `${hours}h ${minutes}m`;
    if (hours) return `${hours}h`;
    if (minutes) return `${minutes}m`;
    return "0m";
  }

  if (log.value != null) {
    const suffix = habit.targetUnit ? ` ${habit.targetUnit}` : "";
    return `${log.value}${suffix}`;
  }

  return null;
}

export function getUnlockedMilestones(
  habit: Habit,
  logs: HabitLog[],
): number[] {
  const currentStrk = currentStreak(habit, logs);
  const unlocked = new Set(habit.achievedMilestones ?? []);
  (habit.milestones ?? [7, 30, 100]).forEach((m) => {
    if (currentStrk >= m) unlocked.add(m);
  });
  return [...unlocked].sort((a, b) => a - b);
}

export function getUnlockedMilestoneAchievements(
  habits: Habit[],
  logs: HabitLog[],
): MilestoneAchievement[] {
  return habits.flatMap((habit) => {
    const milestoneIds = getUnlockedMilestones(habit, logs);
    return milestoneIds.map((milestone) => ({
      id: `${habit.id}:${milestone}`,
      habitId: habit.id,
      habitName: habit.name,
      milestone,
      title: `${milestone}-day streak`,
      description: `${habit.name} reached a ${milestone}-day streak.`,
    }));
  });
}

export function getThemeUnlocks(
  habits: Habit[],
  logs: HabitLog[],
  unlockedThemeIds: string[] = [],
): ThemeUnlockOption[] {
  const totalAchievements = getUnlockedMilestoneAchievements(
    habits,
    logs,
  ).length;
  return MILESTONE_THEME_UNLOCKS.map((theme) => ({
    ...theme,
    unlocked:
      theme.id === "vault" ||
      unlockedThemeIds.includes(theme.id) ||
      totalAchievements >= theme.threshold,
  }));
}

export function nextMilestoneProgress(
  habit: Habit,
  logs: HabitLog[],
): {
  current: number;
  nextMilestone: number;
  target: number;
  remaining: number;
  percent: number;
  reached: boolean;
} {
  const current = currentStreak(habit, logs);
  const milestones = [...(habit.milestones ?? [7, 30, 100])].sort(
    (a, b) => a - b,
  );

  if (milestones.length === 0) {
    return {
      current,
      nextMilestone: 0,
      target: 0,
      remaining: 0,
      percent: 100,
      reached: true,
    };
  }

  const nextMilestone =
    milestones.find((m) => current < m) ?? milestones[milestones.length - 1];
  const target = nextMilestone;
  const remaining = Math.max(0, target - current);
  const reached = current >= target;
  const percent = reached
    ? 100
    : Math.min(100, Math.round((current / target) * 100));

  return {
    current,
    nextMilestone: target,
    target,
    remaining,
    percent,
    reached,
  };
}

export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
