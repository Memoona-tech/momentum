import { format, parseISO, subDays } from "date-fns";
import { Habit, HabitLog } from "./types";

export function isScheduledOn(habit: Habit, date: Date): boolean {
  if (habit.scheduleType === "daily") return true;
  if (habit.scheduleType === "weekly") return habit.scheduleDays.includes(date.getDay());
  if (habit.scheduleType === "monthly") return habit.scheduleDays.includes(date.getDate());
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
  const logsByDate = new Map(logs.filter((l) => l.habitId === habit.id).map((l) => [l.date, l]));
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
    logs.filter((l) => l.habitId === habit.id && l.completed).map((l) => [l.date, true])
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

export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
