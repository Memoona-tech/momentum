import { AppData, Category, Habit } from "./types";

const STORAGE_KEY = "momentum_data_v1";

function uid(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const STARTER_CATEGORIES: Category[] = [
  { id: uid(), name: "Health", color: "#3f8a73", icon: "HeartPulse" },
  { id: uid(), name: "Learning", color: "#c9a44c", icon: "BookOpen" },
  { id: uid(), name: "Coding", color: "#8f8b84", icon: "Code2" },
];

function defaultData(): AppData {
  return {
    habits: [],
    categories: STARTER_CATEGORIES,
    logs: [],
    settings: {
      theme: "dark",
      notificationsEnabled: true,
      reminderLeadMinutes: 30,
      passcodeHash: null,
      profile: {
        name: "Momentum User",
        avatarUrl: null,
        dailyNote: "",
      },
    },
    templates: [],
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
    return {
      habits,
      categories: parsed.categories ?? STARTER_CATEGORIES,
      logs,
      settings: {
        theme: parsed.settings?.theme ?? "dark",
        notificationsEnabled: parsed.settings?.notificationsEnabled ?? true,
        reminderLeadMinutes: parsed.settings?.reminderLeadMinutes ?? 30,
        passcodeHash: parsed.settings?.passcodeHash ?? null,
        profile: {
          name: parsed.settings?.profile?.name ?? "Momentum User",
          avatarUrl: parsed.settings?.profile?.avatarUrl ?? null,
          dailyNote: parsed.settings?.profile?.dailyNote ?? "",
        },
      },
      templates: parsed.templates ?? [],
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
