"use client";

import React, { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { Edit, Trash2, ChevronDown, ChevronUp, Feather } from "lucide-react";
import { useData } from "@/lib/DataContext";
import Modal from "@/components/Modal";

export default function NotesPage() {
  const { habits, logs, categories, setLog, unsetLog } = useData();
  const [expandedHabitId, setExpandedHabitId] = useState<string | null>(null);
  const [editingLogDate, setEditingLogDate] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState("");
  const [editingValue, setEditingValue] = useState<string>("");

  const habitNotes = useMemo(() => {
    return habits
      .filter((h) => !h.archived)
      .map((h) => {
        const habitLogs = logs
          .filter((l) => l.habitId === h.id && l.note)
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          );
        return { habit: h, logs: habitLogs };
      })
      .filter((item) => item.logs.length > 0);
  }, [habits, logs]);

  function handleEditNote(
    logDate: string,
    currentNote: string,
    value?: number,
  ) {
    setEditingLogDate(logDate);
    setEditingNote(currentNote);
    setEditingValue(value?.toString() ?? "");
  }

  function handleSaveNote() {
    if (!editingLogDate) return;
    const habitId = expandedHabitId;
    if (!habitId) return;

    setLog(
      habitId,
      editingLogDate,
      true,
      editingValue ? Number(editingValue) : null,
      editingNote || null,
    );
    setEditingLogDate(null);
  }

  function handleDeleteNote(habitId: string, logDate: string) {
    if (confirm("Remove this note?")) {
      unsetLog(habitId, logDate);
    }
  }

  const inputCls =
    "w-full bg-void-800 border border-void-600 rounded-lg px-3 py-2 text-sm text-parchment focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-parchment mb-1">
          Habit Notes
        </h1>
        <p className="text-void-400 text-sm">
          Track your daily reflections and insights
        </p>
      </div>

      {habitNotes.length === 0 ? (
        <div className="bg-void-900/60 border border-void-700 rounded-2xl p-12 text-center">
          <Feather
            size={32}
            className="text-void-600 mx-auto mb-3"
            strokeWidth={1.5}
          />
          <p className="text-parchment font-medium mb-1">No notes yet</p>
          <p className="text-sm text-void-400">
            Add a note when you log a habit to start tracking your journey
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {habitNotes.map(({ habit, logs: habitLogs }) => {
            const category = categories.find((c) => c.id === habit.categoryId);
            const isExpanded = expandedHabitId === habit.id;

            return (
              <div
                key={habit.id}
                className="bg-void-900/60 border border-void-700 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedHabitId(isExpanded ? null : habit.id)
                  }
                  className="w-full flex items-center justify-between p-4 hover:bg-void-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0 text-left">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: category?.color ?? "#c9a44c",
                      }}
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-parchment text-sm">
                        {habit.name}
                      </p>
                      <p className="text-xs text-void-400">
                        {habitLogs.length}{" "}
                        {habitLogs.length === 1 ? "note" : "notes"}
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp
                      size={18}
                      className="text-void-400 flex-shrink-0"
                    />
                  ) : (
                    <ChevronDown
                      size={18}
                      className="text-void-400 flex-shrink-0"
                    />
                  )}
                </button>

                {isExpanded && (
                  <div className="border-t border-void-700 px-4 py-3 bg-void-950/30 flex flex-col gap-3">
                    {habitLogs.map((log) => (
                      <div
                        key={log.date}
                        className="bg-void-800 rounded-lg p-3 flex flex-col gap-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-xs font-medium text-void-400 mb-0.5">
                              {format(parseISO(log.date), "MMM d, yyyy")}
                            </p>
                            <p className="text-sm text-parchment">{log.note}</p>
                            {log.value != null && habit.targetUnit && (
                              <p className="text-xs text-gold-400 mt-1 font-mono">
                                {log.value} {habit.targetUnit}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() =>
                                handleEditNote(
                                  log.date,
                                  log.note ?? "",
                                  log.value ?? undefined,
                                )
                              }
                              className="p-1.5 text-void-400 hover:text-gold-400 transition-colors"
                              aria-label="Edit note"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteNote(habit.id, log.date)
                              }
                              className="p-1.5 text-void-400 hover:text-red-400 transition-colors"
                              aria-label="Delete note"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {editingLogDate && (
        <Modal title="Edit note" onClose={() => setEditingLogDate(null)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveNote();
              setEditingLogDate(null);
            }}
            className="flex flex-col gap-4"
          >
            <div>
              <label className="block text-xs font-medium text-void-400 mb-1.5">
                Note
              </label>
              <textarea
                autoFocus
                value={editingNote}
                onChange={(e) => setEditingNote(e.target.value)}
                rows={4}
                className={inputCls}
              />
            </div>
            {editingValue !== "" && (
              <div>
                <label className="block text-xs font-medium text-void-400 mb-1.5">
                  Value
                </label>
                <input
                  type="number"
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  className={inputCls}
                />
              </div>
            )}
            <button
              type="submit"
              className="bg-gold-500 hover:bg-gold-600 text-void-950 font-semibold rounded-lg py-2.5 text-sm transition-colors"
            >
              Save note
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
