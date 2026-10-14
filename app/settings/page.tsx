"use client";

import React, { useRef, useState } from "react";
import {
  Plus,
  Trash2,
  Lock,
  LockOpen,
  Upload,
  Download,
  ArrowLeftRight,
  Image as ImageIcon,
  Sparkles,
  Github,
  Globe,
  Mail,
} from "lucide-react";
import { useData } from "@/lib/DataContext";
import { ICONS, IconName, getIcon } from "@/lib/icons";
import { hashPasscode } from "@/lib/storage";
import {
  getThemeUnlocks,
  getUnlockedMilestoneAchievements,
  todayStr,
} from "@/lib/schedule";
import { generateDemoData } from "@/lib/demoData";
import { AppData } from "@/lib/types";
import SyncModal from "@/components/SyncModal";
import { filterExportData } from "@/lib/sync";

const COLOR_SWATCHES = [
  "#c9a44c",
  "#3f8a73",
  "#8f8b84",
  "#d8d3c8",
  "#a3906b",
  "#6b8f7e",
  "#9a7830",
  "#e7d5a4",
];

export default function SettingsPage() {
  const {
    categories,
    createCategory,
    deleteCategory,
    restoreDefaultCategories,
    habits,
    logs,
    settings,
    updateSettings,
    replaceAll,
  } = useData();
  const achievementBadges = getUnlockedMilestoneAchievements(habits, logs);
  const themeUnlocks = getThemeUnlocks(
    habits,
    logs,
    settings.unlockedThemes ?? [],
  );
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(COLOR_SWATCHES[0]);
  const [newIcon, setNewIcon] = useState<IconName>("Star");
  const [passcodeInput, setPasscodeInput] = useState("");
  const [passcodeError, setPasscodeError] = useState("");
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [quickCopied, setQuickCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const syncImportRef = useRef<HTMLInputElement>(null);
  const profile = settings.profile ?? {
    name: "Momentum User",
    avatarUrl: null,
    dailyNote: "",
  };
  const initials =
    profile.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "M";

  function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    createCategory({ name: newName.trim(), color: newColor, icon: newIcon });
    setNewName("");
  }

  function handleDeleteCategory(id: string) {
    const inUse = habits.some((h) => h.categoryId === id);
    if (inUse && !confirm("Habits are using this category. Delete it anyway?"))
      return;
    deleteCategory(id);
  }

  async function handleSetPasscode(e: React.FormEvent) {
    e.preventDefault();
    if (passcodeInput.length < 4) {
      setPasscodeError("Use at least 4 digits.");
      return;
    }
    const hash = await hashPasscode(passcodeInput);
    updateSettings({ passcodeHash: hash });
    setPasscodeInput("");
    setPasscodeError("");
  }

  function handleRemovePasscode() {
    if (confirm("Remove the passcode lock?")) {
      updateSettings({ passcodeHash: null });
      sessionStorage.removeItem("momentum_unlocked");
    }
  }

  function handleThemeSelect(themeId: string) {
    const unlockedTheme = themeUnlocks.find((theme) => theme.id === themeId);
    if (!unlockedTheme?.unlocked) return;
    updateSettings({
      theme: themeId,
      unlockedThemes: Array.from(
        new Set([...(settings.unlockedThemes ?? []), themeId]),
      ),
    });
  }

  function handleProfileImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateSettings({
        profile: { ...profile, avatarUrl: String(reader.result) },
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  async function handleCopySyncPayload() {
    const payload = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        habits,
        categories,
        logs,
        settings,
      },
      null,
      2,
    );
    try {
      await navigator.clipboard.writeText(payload);
      alert(
        "Sync payload copied to clipboard. Paste it into the other device’s import field.",
      );
    } catch {
      const blob = new Blob([payload], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `momentum-sync-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      alert(
        "Clipboard access is blocked, so the sync file was downloaded instead.",
      );
    }
  }

  function handleSyncImportClick() {
    syncImportRef.current?.click();
  }

  function handleSyncImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (!parsed.habits || !parsed.categories || !parsed.logs)
          throw new Error("bad shape");
        if (
          !confirm(
            "This replaces all current data with the synced payload. Continue?",
          )
        )
          return;
        replaceAll({
          habits: parsed.habits,
          categories: parsed.categories,
          logs: parsed.logs,
          settings: parsed.settings ?? settings,
        });
      } catch {
        alert(
          "Couldn't read that sync payload — make sure it's a valid Momentum export.",
        );
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (!parsed.habits || !parsed.categories || !parsed.logs)
          throw new Error("bad shape");
        if (
          !confirm(
            "This replaces all current data with the imported backup. Continue?",
          )
        )
          return;
        const next: AppData = {
          habits: parsed.habits,
          categories: parsed.categories,
          logs: parsed.logs,
          settings: settings,
        };
        replaceAll(next);
      } catch {
        alert(
          "Couldn't read that file — make sure it's a Momentum JSON export.",
        );
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const inputCls =
    "w-full bg-void-800 border border-void-600 rounded-lg px-3 py-2 text-sm text-parchment focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500";

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl text-parchment">Settings</h1>

      <section className="bg-void-900/60 border border-void-700 rounded-2xl p-5">
        <h2 className="text-sm font-semibold mb-4 text-parchment">Profile</h2>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-16 h-16 rounded-full object-cover border border-void-600"
                />
              ) : (
                <div className="w-16 h-16 rounded-full border border-void-600 bg-void-800 flex items-center justify-center text-lg font-semibold text-gold-300">
                  {initials}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => profileImageInputRef.current?.click()}
              className="flex items-center gap-2 bg-void-800 border border-void-600 hover:border-void-400 text-sm font-medium rounded-lg px-3 py-2 text-parchment"
            >
              <ImageIcon size={15} strokeWidth={1.75} /> Upload photo
            </button>
            <input
              ref={profileImageInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfileImageUpload}
              className="hidden"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
            <label className="block">
              <span className="block text-xs font-medium text-void-400 mb-1.5">
                Display name
              </span>
              <input
                value={profile.name}
                onChange={(e) =>
                  updateSettings({
                    profile: {
                      ...profile,
                      name: e.target.value || "Momentum User",
                    },
                  })
                }
                className={inputCls}
              />
            </label>

            <label className="block">
              <span className="block text-xs font-medium text-void-400 mb-1.5">
                Profile image URL
              </span>
              <input
                value={profile.avatarUrl ?? ""}
                onChange={(e) =>
                  updateSettings({
                    profile: { ...profile, avatarUrl: e.target.value || null },
                  })
                }
                placeholder="https://..."
                className={inputCls}
              />
            </label>
          </div>

          <label className="block">
            <span className="block text-xs font-medium text-void-400 mb-1.5">
              Daily note
            </span>
            <textarea
              value={profile.dailyNote}
              onChange={(e) =>
                updateSettings({
                  profile: { ...profile, dailyNote: e.target.value },
                })
              }
              rows={3}
              placeholder="What matters today?"
              className={`${inputCls} resize-none`}
            />
          </label>
        </div>
      </section>

      <section className="bg-void-900/60 border border-void-700 rounded-2xl p-5">
        <h2 className="text-sm font-semibold mb-4 text-parchment">
          Milestone achievements
        </h2>
        {achievementBadges.length === 0 ? (
          <p className="text-sm text-void-400">
            No badges yet. Keep a streak alive to unlock your first milestone.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {achievementBadges.map((achievement) => (
              <div
                key={achievement.id}
                className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-parchment">
                    {achievement.title}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-300">
                    badge
                  </span>
                </div>
                <p className="mt-2 text-xs text-void-300">
                  {achievement.habitName} reached a {achievement.milestone}-day
                  streak.
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-void-900/60 border border-void-700 rounded-2xl p-5">
        <h2 className="text-sm font-semibold mb-4 text-parchment">
          Theme unlocks
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {themeUnlocks.map((theme) => (
            <button
              type="button"
              key={theme.id}
              disabled={!theme.unlocked}
              onClick={() => handleThemeSelect(theme.id)}
              className={`rounded-2xl border p-3 text-left transition-colors ${
                settings.theme === theme.id
                  ? "border-gold-500 bg-gold-500/10"
                  : "border-void-600 bg-void-800/80"
              } ${theme.unlocked ? "cursor-pointer" : "opacity-50 grayscale"}`}
              style={{
                backgroundImage: theme.unlocked
                  ? `linear-gradient(135deg, ${theme.accentColor}22, rgba(17, 17, 19, 0.85))`
                  : undefined,
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-parchment flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: theme.accentColor }}
                  />
                  {theme.name}
                </span>
                {theme.unlocked ? (
                  <span className="text-[10px] uppercase tracking-[0.14em] text-gold-300 font-semibold">
                    unlocked
                  </span>
                ) : (
                  <span className="text-[10px] uppercase tracking-[0.14em] text-void-400 font-mono">
                    {theme.streakThreshold
                      ? `${theme.streakThreshold}d streak`
                      : `${theme.threshold} badges`}
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-void-300">{theme.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="bg-void-900/60 border border-void-700 rounded-2xl p-5">
        <h2 className="text-sm font-semibold mb-4 text-parchment">
          Smart reminders
        </h2>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-parchment">Reminders</p>
            <p className="text-xs text-void-400">
              Browser notifications for habits due soon or at their target time.
            </p>
          </div>
          <button
            onClick={() =>
              updateSettings({
                notificationsEnabled: !settings.notificationsEnabled,
              })
            }
            className={`w-11 h-6 rounded-full transition-colors relative ${settings.notificationsEnabled ? "bg-gold-500" : "bg-void-600"}`}
            aria-label="Toggle notifications"
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-void-950 transition-transform ${
                settings.notificationsEnabled
                  ? "translate-x-5"
                  : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
        <div>
          <label className="block text-xs font-medium text-void-400 mb-1.5">
            Reminder lead time (minutes before target)
          </label>
          <input
            type="number"
            min={0}
            value={settings.reminderLeadMinutes}
            onChange={(e) =>
              updateSettings({ reminderLeadMinutes: Number(e.target.value) })
            }
            className={`${inputCls} w-32`}
          />
          <p className="text-[11px] text-void-400 mt-2">
            Example: if a habit is due at 7:00 PM and you set 15 minutes,
            Momentum sends a smart reminder at 6:45 PM.
          </p>
        </div>
      </section>

      <section className="bg-void-900/60 border border-void-700 rounded-2xl p-5">
        <h2 className="text-sm font-semibold mb-4 text-parchment">
          Passcode lock
        </h2>
        {settings.passcodeHash ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-parchment">
              <Lock size={15} className="text-gold-400" strokeWidth={1.75} /> A
              passcode is protecting this app.
            </div>
            <button
              onClick={handleRemovePasscode}
              className="text-xs font-medium text-red-400 hover:underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <form onSubmit={handleSetPasscode} className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-void-400 mb-1">
              <LockOpen size={15} strokeWidth={1.75} /> No passcode set — anyone
              with this device can open the app.
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                inputMode="numeric"
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder="Set a 4+ digit passcode"
                className={inputCls}
              />
              <button
                type="submit"
                className="bg-gold-500 hover:bg-gold-600 text-void-950 font-semibold rounded-lg px-4 text-sm whitespace-nowrap"
              >
                Set
              </button>
            </div>
            {passcodeError && (
              <p className="text-xs text-red-400">{passcodeError}</p>
            )}
            <p className="text-[11px] text-void-400">
              This is a local lock stored on this device only — there&apos;s no
              account or server behind it.
            </p>
          </form>
        )}
      </section>

      <section className="bg-void-900/60 border border-void-700 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-parchment">
            Categories
          </h2>
          <button
            type="button"
            onClick={() => {
              if (
                confirm(
                  "Restore default categories (Health, Gym, Books Reading, Eat Healthy, Water, Job, Early Riser, Screen Time, Zikr, etc.)?",
                )
              ) {
                restoreDefaultCategories();
              }
            }}
            className="text-xs text-gold-400 hover:text-gold-300 font-medium transition-colors"
          >
            Restore Defaults
          </button>
        </div>
        <div className="flex flex-col gap-2 mb-4">
          {categories.map((c) => {
            const Icon = getIcon(c.icon);
            return (
              <div
                key={c.id}
                className="flex items-center gap-3 bg-void-800 rounded-lg px-3 py-2"
              >
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${c.color}1a`, color: c.color }}
                >
                  <Icon size={13} strokeWidth={1.75} />
                </span>
                <span className="text-sm flex-1 truncate text-parchment">
                  {c.name}
                </span>
                <button
                  onClick={() => handleDeleteCategory(c.id)}
                  className="text-void-400 hover:text-red-400"
                  aria-label="Delete category"
                >
                  <Trash2 size={15} strokeWidth={1.75} />
                </button>
              </div>
            );
          })}
          {categories.length === 0 && (
            <p className="text-void-400 text-sm">No categories yet.</p>
          )}
        </div>

        <form
          onSubmit={handleAddCategory}
          className="flex flex-col gap-3 border-t border-void-700 pt-4"
        >
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New category name"
            className={inputCls}
          />
          <div className="flex items-center gap-1.5 flex-wrap">
            {COLOR_SWATCHES.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setNewColor(c)}
                className={`w-7 h-7 rounded-full ${newColor === c ? "ring-2 ring-offset-2 ring-offset-void-900 ring-gold-400" : ""}`}
                style={{ backgroundColor: c }}
                aria-label={`Choose color ${c}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {(Object.keys(ICONS) as IconName[]).map((name) => {
              const Icon = ICONS[name];
              return (
                <button
                  type="button"
                  key={name}
                  onClick={() => setNewIcon(name)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${
                    newIcon === name
                      ? "border-gold-500 text-gold-400"
                      : "border-void-600 text-void-400"
                  }`}
                  aria-label={name}
                >
                  <Icon size={15} strokeWidth={1.75} />
                </button>
              );
            })}
          </div>
          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 bg-gold-500 hover:bg-gold-600 text-void-950 text-sm font-semibold rounded-lg py-2.5 transition-colors"
          >
            <Plus size={16} /> Add category
          </button>
        </form>
      </section>

      <section className="bg-void-900/60 border border-void-700 rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h2 className="text-sm font-semibold text-parchment flex items-center gap-2">
              <ArrowLeftRight size={17} className="text-gold-400" />
              Sync & Multi-Device Transfer (PC ⇋ Phone)
            </h2>
            <p className="text-xs text-void-400 mt-1 leading-relaxed">
              Export and import a single day (e.g. today or yesterday), a date
              range, or all habits. <strong>Smart Merge</strong> preserves
              completed tasks from both devices so you never lose half your data
              when switching between PC and phone.
            </p>
          </div>
        </div>

        <div className="bg-void-950/50 border border-void-700/80 rounded-xl p-3.5 mb-4">
          <p className="text-[11px] text-void-300 leading-relaxed font-mono">
            ✓ Import/Export specific days (e.g. today only)
            <br />
            ✓ Smart Merge prevents overwriting existing completions
            <br />
            ✓ Maps habits between devices even if IDs differ
            <br />✓ No accounts or server required — direct clipboard or JSON
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={() => setShowSyncModal(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-600 text-void-950 text-sm font-semibold rounded-xl px-4 py-3 transition-colors shadow-sm"
          >
            <ArrowLeftRight size={16} /> Open Sync & Merge Hub
          </button>

          <button
            type="button"
            onClick={async () => {
              const today = todayStr();
              const payload = filterExportData(
                { habits, categories, logs, settings },
                { type: "single", startDate: today, endDate: today },
              );
              try {
                await navigator.clipboard.writeText(
                  JSON.stringify(payload, null, 2),
                );
                setQuickCopied(true);
                setTimeout(() => setQuickCopied(false), 2500);
              } catch {
                setShowSyncModal(true);
              }
            }}
            className="flex items-center justify-center gap-2 bg-void-800 border border-void-600 hover:border-void-400 text-sm font-medium rounded-xl px-4 py-3 transition-colors text-parchment"
          >
            {quickCopied ? "✓ Copied Today's Habits!" : "Copy Today's Data"}
          </button>
        </div>
      </section>

      <section className="bg-void-900/60 border border-void-700 rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h2 className="text-sm font-semibold text-parchment flex items-center gap-2">
              <Sparkles size={17} className="text-gold-400" />
              Demo Data & Reset
            </h2>
            <p className="text-xs text-void-400 mt-1 leading-relaxed">
              Quickly preview Momentum with pre-configured routines (coding, cardio, reading, mindfulness), 30-day streak heatmaps, and milestone unlocks, or reset everything to zero.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => {
              if (
                habits.length > 0 &&
                !confirm(
                  "Replace current habits with demo habits? You can export your current data first.",
                )
              ) {
                return;
              }
              replaceAll(generateDemoData());
            }}
            className="flex items-center gap-2 bg-void-800 border border-void-600 hover:border-gold-500/50 text-parchment text-sm font-medium rounded-xl px-4 py-2.5 transition-colors"
          >
            <Sparkles size={15} className="text-gold-400" /> Load Demo Data
          </button>

          <button
            type="button"
            onClick={() => {
              if (
                !confirm(
                  "Are you sure you want to clear all data? This will reset all habits and logs.",
                )
              ) {
                return;
              }
              replaceAll({
                habits: [],
                categories,
                logs: [],
                settings: {
                  ...settings,
                  theme: "vault",
                  unlockedThemes: ["vault"],
                },
              });
            }}
            className="flex items-center gap-2 bg-void-900 border border-void-700 hover:border-red-500/50 text-void-400 hover:text-red-400 text-sm font-medium rounded-xl px-4 py-2.5 transition-colors"
          >
            <Trash2 size={15} /> Clear All Data
          </button>
        </div>
      </section>

      <section className="bg-void-900/60 border border-void-700 rounded-2xl p-5">
        <h2 className="text-sm font-semibold mb-2 text-parchment">About & Developer</h2>
        <p className="text-xs text-void-400 mb-4 leading-relaxed">
          Momentum is crafted by Memoona as a private, local-first habit operating system. Connect or view more projects:
        </p>
        <div className="flex flex-wrap gap-2.5">
          <a
            href="https://github.com/Memoona-tech"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-void-800 border border-void-600 hover:border-gold-500/50 text-parchment text-xs font-medium rounded-xl px-3.5 py-2.5 transition-colors"
          >
            <Github size={14} className="text-gold-400" />
            GitHub (@Memoona-tech)
          </a>
          <a
            href="https://memoonasaleem.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-void-800 border border-void-600 hover:border-gold-500/50 text-parchment text-xs font-medium rounded-xl px-3.5 py-2.5 transition-colors"
          >
            <Globe size={14} className="text-gold-400" />
            Portfolio (memoonasaleem.vercel.app)
          </a>
          <a
            href="mailto:memoona.se@gmail.com"
            className="flex items-center gap-2 bg-void-800 border border-void-600 hover:border-gold-500/50 text-parchment text-xs font-medium rounded-xl px-3.5 py-2.5 transition-colors"
          >
            <Mail size={14} className="text-gold-400" />
            Email (memoona.se@gmail.com)
          </a>
        </div>
      </section>

      {showSyncModal && (
        <SyncModal onClose={() => setShowSyncModal(false)} />
      )}
    </div>
  );
}
