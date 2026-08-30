"use client";

import React, { useState } from "react";
import Modal from "./Modal";
import { Habit, ScheduleType } from "@/lib/types";
import { useData } from "@/lib/DataContext";
import { WEEKDAY_LABELS } from "@/lib/schedule";

const MONTH_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

export default function HabitFormModal({ habit, onClose }: { habit?: Habit | null; onClose: () => void }) {
  const { categories, createHabit, updateHabit } = useData();
  const [name, setName] = useState(habit?.name ?? "");
  const [description, setDescription] = useState(habit?.description ?? "");
  const [categoryId, setCategoryId] = useState(habit?.categoryId ?? categories[0]?.id ?? "");
  const [scheduleType, setScheduleType] = useState<ScheduleType>(habit?.scheduleType ?? "daily");
  const [scheduleDays, setScheduleDays] = useState<number[]>(habit?.scheduleDays ?? []);
  const [targetTime, setTargetTime] = useState(habit?.targetTime ?? "");
  const [targetValue, setTargetValue] = useState(habit?.targetValue?.toString() ?? "");
  const [targetUnit, setTargetUnit] = useState(habit?.targetUnit ?? "");
  const [error, setError] = useState("");

  function toggleDay(day: number) {
    setScheduleDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Give the habit a name.");
      return;
    }
    if (scheduleType !== "daily" && scheduleDays.length === 0) {
      setError("Pick at least one day for this schedule.");
      return;
    }
    const payload = {
      name: name.trim(),
      description: description.trim(),
      categoryId: categoryId || null,
      scheduleType,
      scheduleDays: scheduleType === "daily" ? [] : scheduleDays,
      targetTime: targetTime || null,
      targetValue: targetValue ? Number(targetValue) : null,
      targetUnit: targetUnit || null,
    };
    if (habit) updateHabit(habit.id, payload);
    else createHabit(payload);
    onClose();
  }

  const inputCls =
    "w-full bg-void-800 border border-void-600 rounded-lg px-3 py-2 text-sm text-parchment focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500";

  return (
    <Modal title={habit ? "Edit habit" : "New habit"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-medium text-void-400 mb-1.5">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Solve LeetCode problems"
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-void-400 mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Optional details"
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-void-400 mb-1.5">Category</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputCls}>
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-void-400 mb-1.5">Schedule</label>
          <div className="flex gap-1 bg-void-800 rounded-lg p-1 mb-3">
            {(["daily", "weekly", "monthly"] as ScheduleType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setScheduleType(t)}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                  scheduleType === t ? "bg-void-700 text-gold-300" : "text-void-400"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {scheduleType === "weekly" && (
            <div className="flex gap-1.5 flex-wrap">
              {WEEKDAY_LABELS.map((label, idx) => (
                <button
                  type="button"
                  key={label}
                  onClick={() => toggleDay(idx)}
                  className={`w-10 h-10 rounded-lg text-xs font-semibold transition-colors ${
                    scheduleDays.includes(idx)
                      ? "bg-gold-500 text-void-950"
                      : "bg-void-800 text-void-400 border border-void-600"
                  }`}
                >
                  {label[0]}
                </button>
              ))}
            </div>
          )}

          {scheduleType === "monthly" && (
            <div className="grid grid-cols-7 gap-1.5">
              {MONTH_DAYS.map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => toggleDay(d)}
                  className={`h-9 rounded-lg text-xs font-semibold transition-colors ${
                    scheduleDays.includes(d)
                      ? "bg-gold-500 text-void-950"
                      : "bg-void-800 text-void-400 border border-void-600"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-void-400 mb-1.5">Target time</label>
            <input type="time" value={targetTime} onChange={(e) => setTargetTime(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-void-400 mb-1.5">Target value</label>
            <div className="flex gap-1.5">
              <input
                type="number"
                min={0}
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="20"
                className={inputCls}
              />
              <input
                value={targetUnit}
                onChange={(e) => setTargetUnit(e.target.value)}
                placeholder="pages"
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          className="mt-1 bg-gold-500 hover:bg-gold-600 text-void-950 font-semibold rounded-lg py-2.5 text-sm transition-colors"
        >
          {habit ? "Save changes" : "Create habit"}
        </button>
      </form>
    </Modal>
  );
}
