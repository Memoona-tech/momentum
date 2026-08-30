"use client";

import React, { useState } from "react";
import Modal from "./Modal";
import { Habit } from "@/lib/types";
import { useData } from "@/lib/DataContext";

export default function CompleteHabitModal({
  habit,
  date,
  onClose,
}: {
  habit: Habit;
  date: string;
  onClose: () => void;
}) {
  const { setLog } = useData();
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLog(habit.id, date, true, value ? Number(value) : null, note || null);
    onClose();
  }

  const inputCls =
    "w-full bg-void-800 border border-void-600 rounded-lg px-3 py-2 text-sm text-parchment focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400";

  return (
    <Modal title={`Log "${habit.name}"`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {habit.targetUnit && (
          <div>
            <label className="block text-xs font-medium text-void-400 mb-1.5">
              {habit.targetUnit}
              {habit.targetValue ? ` (target: ${habit.targetValue})` : ""}
            </label>
            <input
              type="number"
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={habit.targetValue ? String(habit.targetValue) : "0"}
              className={inputCls}
            />
          </div>
        )}
        <div>
          <label className="block text-xs font-medium text-void-400 mb-1.5">Note (optional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="e.g. solved 3 LeetCode problems, felt good"
            className={inputCls}
          />
        </div>
        <button
          type="submit"
          className="bg-emerald-500 hover:bg-emerald-400 text-void-950 font-semibold rounded-lg py-2.5 text-sm transition-colors"
        >
          Mark complete
        </button>
      </form>
    </Modal>
  );
}
