"use client";

import React, { useState } from "react";
import Modal from "./Modal";
import { Habit, HabitLog } from "@/lib/types";
import { useData } from "@/lib/DataContext";
import { Check, Feather } from "lucide-react";

export default function CompleteHabitModal({
  habit,
  date,
  log,
  onClose,
}: {
  habit: Habit;
  date: string;
  log?: HabitLog;
  onClose: () => void;
}) {
  const { setLog } = useData();
  const [completed, setCompleted] = useState<boolean>(log?.completed ?? false);
  const [value, setValue] = useState(log?.value != null ? String(log.value) : "");
  const [durationMinutes, setDurationMinutes] = useState(
    log?.durationMinutes != null ? String(log.durationMinutes) : "",
  );
  const [note, setNote] = useState(log?.note ?? "");

  function saveLog(isComplete: boolean) {
    setLog(
      habit.id,
      date,
      isComplete,
      value ? Number(value) : null,
      note.trim() ? note.trim() : null,
      durationMinutes ? Number(durationMinutes) : null,
    );
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    saveLog(completed);
  }

  const inputCls =
    "w-full bg-void-800 border border-void-600 rounded-lg px-3 py-2 text-sm text-parchment placeholder:text-void-500 focus:outline-none focus:ring-1 focus:ring-gold-400 focus:border-gold-400";

  return (
    <Modal
      title={
        log?.completed
          ? `Edit Log: ${habit.name}`
          : `Note & Check-in: ${habit.name}`
      }
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Note input - clearly at top since user specifically opened this for notes */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-void-300 flex items-center gap-1.5">
              <Feather size={12} className="text-gold-400" />
              Daily Note (Optional)
            </label>
            <span className="text-[11px] text-void-500">
              Check-in note for today
            </span>
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="e.g. Read 15 pages on system design, felt focused and took notes..."
            className={inputCls}
            autoFocus
          />
        </div>

        {/* Target value if habit has units */}
        {habit.targetUnit && (
          <div>
            <label className="block text-xs font-medium text-void-400 mb-1.5">
              {habit.targetUnit}
              {habit.targetValue ? ` (target: ${habit.targetValue})` : ""}
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={habit.targetValue ? String(habit.targetValue) : "0"}
              className={inputCls}
            />
          </div>
        )}

        {/* Time spent */}
        <div>
          <label className="block text-xs font-medium text-void-400 mb-1.5">
            Time spent (minutes)
          </label>
          <input
            type="number"
            min={0}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            placeholder="e.g. 45"
            className={inputCls}
          />
        </div>

        {/* Completion status toggle - clearly decoupled from note taking! */}
        <div className="pt-2 border-t border-void-800">
          <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg bg-void-950/60 border border-void-700/60 hover:border-void-600 transition-colors">
            <input
              type="checkbox"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-5 h-5 rounded flex items-center justify-center transition-colors border ${
                completed
                  ? "bg-emerald-500 border-emerald-500 text-void-950"
                  : "border-void-500 bg-void-800"
              }`}
            >
              {completed && <Check size={14} strokeWidth={3} />}
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-parchment">
                {completed ? "Marked as completed" : "Mark as completed"}
              </p>
              <p className="text-[11px] text-void-400">
                {completed
                  ? "Counts towards today's streaks and progress"
                  : "Leave unchecked if you are just saving notes or in progress"}
              </p>
            </div>
          </label>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-2">
          {!completed ? (
            <>
              <button
                type="button"
                onClick={() => saveLog(false)}
                className="flex-1 bg-void-800 hover:bg-void-700 text-parchment border border-void-600 font-medium rounded-lg py-2.5 text-xs transition-colors"
              >
                Save note only
              </button>
              <button
                type="button"
                onClick={() => saveLog(true)}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-void-950 font-semibold rounded-lg py-2.5 text-xs transition-colors"
              >
                Complete & save
              </button>
            </>
          ) : (
            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-void-950 font-semibold rounded-lg py-2.5 text-xs transition-colors"
            >
              Save changes
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
}
