"use client";

import React, { useRef, useState } from "react";
import { Plus, Trash2, Lock, LockOpen, Upload } from "lucide-react";
import { useData } from "@/lib/DataContext";
import { ICONS, IconName, getIcon } from "@/lib/icons";
import { hashPasscode } from "@/lib/storage";
import { AppData } from "@/lib/types";

const COLOR_SWATCHES = ["#c9a44c", "#3f8a73", "#8f8b84", "#d8d3c8", "#a3906b", "#6b8f7e", "#9a7830", "#e7d5a4"];

export default function SettingsPage() {
  const { categories, createCategory, deleteCategory, habits, settings, updateSettings, replaceAll } = useData();
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(COLOR_SWATCHES[0]);
  const [newIcon, setNewIcon] = useState<IconName>("Star");
  const [passcodeInput, setPasscodeInput] = useState("");
  const [passcodeError, setPasscodeError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    createCategory({ name: newName.trim(), color: newColor, icon: newIcon });
    setNewName("");
  }

  function handleDeleteCategory(id: string) {
    const inUse = habits.some((h) => h.categoryId === id);
    if (inUse && !confirm("Habits are using this category. Delete it anyway?")) return;
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
        if (!parsed.habits || !parsed.categories || !parsed.logs) throw new Error("bad shape");
        if (!confirm("This replaces all current data with the imported backup. Continue?")) return;
        const next: AppData = {
          habits: parsed.habits,
          categories: parsed.categories,
          logs: parsed.logs,
          settings: settings,
        };
        replaceAll(next);
      } catch {
        alert("Couldn't read that file — make sure it's a Momentum JSON export.");
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
        <h2 className="text-sm font-semibold mb-4 text-parchment">Notifications</h2>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-parchment">Reminders</p>
            <p className="text-xs text-void-400">Browser notification when a habit&apos;s target time hits.</p>
          </div>
          <button
            onClick={() => updateSettings({ notificationsEnabled: !settings.notificationsEnabled })}
            className={`w-11 h-6 rounded-full transition-colors relative ${settings.notificationsEnabled ? "bg-gold-500" : "bg-void-600"}`}
            aria-label="Toggle notifications"
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-void-950 transition-transform ${
                settings.notificationsEnabled ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
        <div>
          <label className="block text-xs font-medium text-void-400 mb-1.5">Reminder lead time (minutes)</label>
          <input
            type="number"
            min={0}
            value={settings.reminderLeadMinutes}
            onChange={(e) => updateSettings({ reminderLeadMinutes: Number(e.target.value) })}
            className={`${inputCls} w-32`}
          />
        </div>
      </section>

      <section className="bg-void-900/60 border border-void-700 rounded-2xl p-5">
        <h2 className="text-sm font-semibold mb-4 text-parchment">Passcode lock</h2>
        {settings.passcodeHash ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-parchment">
              <Lock size={15} className="text-gold-400" strokeWidth={1.75} /> A passcode is protecting this app.
            </div>
            <button onClick={handleRemovePasscode} className="text-xs font-medium text-red-400 hover:underline">
              Remove
            </button>
          </div>
        ) : (
          <form onSubmit={handleSetPasscode} className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-void-400 mb-1">
              <LockOpen size={15} strokeWidth={1.75} /> No passcode set — anyone with this device can open the app.
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
              <button type="submit" className="bg-gold-500 hover:bg-gold-600 text-void-950 font-semibold rounded-lg px-4 text-sm whitespace-nowrap">
                Set
              </button>
            </div>
            {passcodeError && <p className="text-xs text-red-400">{passcodeError}</p>}
            <p className="text-[11px] text-void-400">
              This is a local lock stored on this device only — there&apos;s no account or server behind it.
            </p>
          </form>
        )}
      </section>

      <section className="bg-void-900/60 border border-void-700 rounded-2xl p-5">
        <h2 className="text-sm font-semibold mb-4 text-parchment">Categories</h2>
        <div className="flex flex-col gap-2 mb-4">
          {categories.map((c) => {
            const Icon = getIcon(c.icon);
            return (
              <div key={c.id} className="flex items-center gap-3 bg-void-800 rounded-lg px-3 py-2">
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${c.color}1a`, color: c.color }}
                >
                  <Icon size={13} strokeWidth={1.75} />
                </span>
                <span className="text-sm flex-1 truncate text-parchment">{c.name}</span>
                <button onClick={() => handleDeleteCategory(c.id)} className="text-void-400 hover:text-red-400" aria-label="Delete category">
                  <Trash2 size={15} strokeWidth={1.75} />
                </button>
              </div>
            );
          })}
          {categories.length === 0 && <p className="text-void-400 text-sm">No categories yet.</p>}
        </div>

        <form onSubmit={handleAddCategory} className="flex flex-col gap-3 border-t border-void-700 pt-4">
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New category name" className={inputCls} />
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
                    newIcon === name ? "border-gold-500 text-gold-400" : "border-void-600 text-void-400"
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
        <h2 className="text-sm font-semibold mb-2 text-parchment">Restore from backup</h2>
        <p className="text-xs text-void-400 mb-3">
          Import a JSON file exported from Reports to restore your data on this device — for example after switching browsers.
        </p>
        <input ref={fileInputRef} type="file" accept="application/json" onChange={handleImportFile} className="hidden" />
        <button
          onClick={handleImportClick}
          className="flex items-center gap-2 bg-void-800 border border-void-600 hover:border-void-400 text-sm font-medium rounded-lg px-4 py-2.5 transition-colors text-parchment"
        >
          <Upload size={16} strokeWidth={1.75} /> Import JSON backup
        </button>
      </section>
    </div>
  );
}
