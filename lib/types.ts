export type ScheduleType = "daily" | "weekly" | "monthly";

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Habit {
  id: string;
  name: string;
  description: string;
  categoryId: string | null;
  scheduleType: ScheduleType;
  scheduleDays: number[]; // weekdays 0-6 (Sun-Sat) for weekly, days 1-31 for monthly
  targetTime: string | null; // 'HH:MM'
  targetValue: number | null;
  targetUnit: string | null;
  archived: boolean;
  createdAt: string;
  order: number; // for drag-and-drop reordering
}

export interface HabitLog {
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  value: number | null;
  note: string | null;
  loggedAt: string;
}

export interface ProfileData {
  name: string;
  avatarUrl: string | null;
  dailyNote: string;
}

export interface Settings {
  theme: "dark" | "light";
  notificationsEnabled: boolean;
  reminderLeadMinutes: number;
  passcodeHash: string | null;
  profile: ProfileData;
}

export interface AppData {
  habits: Habit[];
  categories: Category[];
  logs: HabitLog[];
  settings: Settings;
}
