import { AppData, Category, Habit } from "./types";

const STORAGE_KEY = "momentum_data_v1";

function uid(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-health", name: "Health", color: "#3f8a73", icon: "HeartPulse" },
  { id: "cat-learning", name: "Learning", color: "#c9a44c", icon: "BookOpen" },
  { id: "cat-coding", name: "Coding", color: "#38bdf8", icon: "Code2" },
  { id: "cat-gym", name: "Gym", color: "#2dd4bf", icon: "Dumbbell" },
  { id: "cat-books", name: "Books Reading", color: "#eab308", icon: "Star" },
  { id: "cat-eat-healthy", name: "Eat Healthy", color: "#10b981", icon: "Utensils" },
  { id: "cat-water", name: "Water", color: "#0ea5e9", icon: "Droplet" },
  { id: "cat-job", name: "Job", color: "#6366f1", icon: "Briefcase" },
  { id: "cat-early-riser", name: "Early Riser", color: "#f59e0b", icon: "Sun" },
  { id: "cat-screen-time", name: "Screen Time", color: "#84cc16", icon: "Bike" },
  { id: "cat-zikr", name: "Zikr", color: "#a855f7", icon: "Moon" },
  { id: "cat-mindfulness", name: "Mindfulness", color: "#ec4899", icon: "Brain" },
  { id: "cat-finance", name: "Finance", color: "#14b8a6", icon: "Wallet" },
  { id: "cat-journaling", name: "Journaling", color: "#d97706", icon: "PenTool" },
];

function defaultData(): AppData {
  return {
    habits: [],
    categories: DEFAULT_CATEGORIES,
    logs: [],
    settings: {
      theme: "vault",
      unlockedThemes: ["vault"],
      notificationsEnabled: true,
      reminderLeadMinutes: 30,
      passcodeHash: null,
      profile: {
        name: "Momentum User",
        avatarUrl: null,
        dailyNote: "",
      },
    },
  };
}

export function loadData(): AppData {
  if (typeof window === "undefined") return defaultData();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const fresh = defaultData();
      saveData(fresh);
      return fresh;
    }
    const parsed = JSON.parse(raw) as AppData;
    // Backfill in case fields were added after a user's data was created.
    const habits = (parsed.habits ?? []).map((h, idx) => ({
      ...h,
      order: h.order ?? idx,
      milestones: h.milestones ?? [7, 30, 100],
      achievedMilestones: h.achievedMilestones ?? [],
    }));
    const logs = (parsed.logs ?? []).map((log) => ({
      ...log,
      value: log.value ?? null,
      durationMinutes: log.durationMinutes ?? null,
      note: log.note ?? null,
    }));
    const existingCats = parsed.categories ?? [];
    const isLegacyMinimal =
      existingCats.length <= 3 &&
      existingCats.every((c) =>
        ["health", "learning", "coding"].includes(c.name.trim().toLowerCase()),
      );
    const resolvedCategories =
      existingCats.length === 0 || isLegacyMinimal
        ? DEFAULT_CATEGORIES
        : existingCats;
    return {
      habits,
      categories: resolvedCategories,
      logs,
      settings: {
        theme: parsed.settings?.theme ?? "vault",
        unlockedThemes: Array.from(
          new Set(parsed.settings?.unlockedThemes ?? ["vault"]),
        ),
        notificationsEnabled: parsed.settings?.notificationsEnabled ?? true,
        reminderLeadMinutes: parsed.settings?.reminderLeadMinutes ?? 30,
        passcodeHash: parsed.settings?.passcodeHash ?? null,
        profile: {
          name: parsed.settings?.profile?.name ?? "Momentum User",
          avatarUrl: parsed.settings?.profile?.avatarUrl ?? null,
          dailyNote: parsed.settings?.profile?.dailyNote ?? "",
        },
      },
    };
  } catch {
    return defaultData();
  }
}

export function saveData(data: AppData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function newId() {
  return uid();
}

// Lightweight client-side passcode hash (SHA-256 via SubtleCrypto). This is a
// local lock, not server auth — there's no backend, so it only deters casual
// access on a shared device, not a determined attacker with devtools open.
export async function hashPasscode(code: string): Promise<string> {
  const enc = new TextEncoder().encode(code);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
