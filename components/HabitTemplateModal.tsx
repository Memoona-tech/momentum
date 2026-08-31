"use client";

import React, { useMemo, useState } from "react";
import Modal from "@/components/Modal";
import { useData } from "@/lib/DataContext";
import { HabitTemplate, HabitTemplateItem, ScheduleType } from "@/lib/types";
import { WEEKDAY_LABELS } from "@/lib/schedule";

const MONTH_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

const BUILT_IN_TEMPLATE_PACKS: Array<{
  id: string;
  name: string;
  description: string;
  habits: HabitTemplateItem[];
}> = [
  {
    id: "starter-daily-essentials",
    name: "Daily essentials",
    description:
      "A healthy default pack built for focus, learning, and energy.",
    habits: [
      {
        name: "LeetCode",
        description: "Solve a few algorithm or problem-solving exercises.",
        categoryId: null,
        scheduleType: "daily",
        scheduleDays: [],
        targetTime: "19:30",
        targetValue: 1,
        targetUnit: "session",
      },
      {
        name: "Read book",
        description: "Read a chapter or focused pages before bed.",
        categoryId: null,
        scheduleType: "daily",
        scheduleDays: [],
        targetTime: "21:00",
        targetValue: 20,
        targetUnit: "pages",
      },
      {
        name: "Drink water",
        description: "Hit your hydration goal consistently.",
        categoryId: null,
        scheduleType: "daily",
        scheduleDays: [],
        targetTime: "09:00",
        targetValue: 8,
        targetUnit: "glasses",
      },
      {
        name: "Go to the gym",
        description: "Keep the training habit going without skipping.",
        categoryId: null,
        scheduleType: "weekly",
        scheduleDays: [1, 3, 5],
        targetTime: "18:00",
        targetValue: 1,
        targetUnit: "session",
      },
    ],
  },
];

export default function HabitTemplateModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const {
    categories,
    createTemplate,
    listTemplates,
    useTemplate,
    deleteTemplate,
  } = useData();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [scheduleType, setScheduleType] = useState<ScheduleType>("daily");
  const [scheduleDays, setScheduleDays] = useState<number[]>([]);
  const [targetTime, setTargetTime] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [targetUnit, setTargetUnit] = useState("");
  const [error, setError] = useState("");

  const templates = useMemo(() => listTemplates(), [listTemplates]);

  function toggleDay(day: number) {
    setScheduleDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  }

  function handleCreateTemplate() {
    if (!name.trim()) {
      setError("Give the template a name.");
      return;
    }
    if (scheduleType !== "daily" && scheduleDays.length === 0) {
      setError("Pick at least one day for this schedule.");
      return;
    }

    const habits: HabitTemplateItem[] = [
      {
        name: name.trim(),
        description: description.trim(),
        categoryId: categoryId || null,
        scheduleType,
        scheduleDays: scheduleType === "daily" ? [] : scheduleDays,
        targetTime: targetTime || null,
        targetValue: targetValue ? Number(targetValue) : null,
        targetUnit: targetUnit || null,
      },
    ];

    createTemplate({
      name: name.trim(),
      description: description.trim(),
      habits,
    });

    setName("");
    setDescription("");
    setTargetTime("");
    setTargetValue("");
    setTargetUnit("");
    setScheduleType("daily");
    setScheduleDays([]);
    setError("");
  }

  function handleUseTemplate(template: HabitTemplate) {
    useTemplate(template.id);
    onClose();
  }

  function handleDeleteTemplate(templateId: string) {
    deleteTemplate(templateId);
  }

  const inputCls =
    "w-full bg-void-800 border border-void-600 rounded-lg px-3 py-2 text-sm text-parchment focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500";

  return (
    <Modal title="Habit templates" onClose={onClose}>
      <div className="flex flex-col gap-5">
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-parchment mb-2">
              Starter packs
            </h3>
            <div className="space-y-2">
              {BUILT_IN_TEMPLATE_PACKS.map((pack) => (
                <div
                  key={pack.id}
                  className="rounded-lg border border-void-700 bg-void-800 px-3 py-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-parchment">
                        {pack.name}
                      </p>
                      <p className="text-[11px] text-void-400">
                        {pack.description}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-wide text-gold-300">
                        {pack.habits.length} habits
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleUseTemplate({
                          id: pack.id,
                          name: pack.name,
                          description: pack.description,
                          habits: pack.habits,
                          createdAt: new Date().toISOString(),
                        })
                      }
                      className="px-2 py-1 rounded-md bg-gold-500/15 text-gold-300 text-[10px] uppercase tracking-wide"
                    >
                      use pack
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-void-400 mb-1.5">
              Template name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Read 20 pages"
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-void-400 mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Optional details"
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-void-400 mb-1.5">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={inputCls}
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-void-400 mb-1.5">
              Schedule
            </label>
            <div className="flex gap-1 bg-void-800 rounded-lg p-1 mb-3">
              {(["daily", "weekly", "monthly"] as ScheduleType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setScheduleType(t)}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                    scheduleType === t
                      ? "bg-void-700 text-gold-300"
                      : "text-void-400"
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
              <label className="block text-xs font-medium text-void-400 mb-1.5">
                Target time
              </label>
              <input
                type="time"
                value={targetTime}
                onChange={(e) => setTargetTime(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-void-400 mb-1.5">
                Target value
              </label>
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
            type="button"
            onClick={handleCreateTemplate}
            className="bg-gold-500 hover:bg-gold-600 text-void-950 font-semibold rounded-lg py-2.5 text-sm transition-colors"
          >
            Save template
          </button>
        </div>

        <div className="border-t border-void-700 pt-4">
          <h3 className="text-sm font-semibold text-parchment mb-3">
            Saved templates
          </h3>
          {templates.length === 0 ? (
            <p className="text-sm text-void-400">No templates yet.</p>
          ) : (
            <div className="space-y-2">
              {templates.map((template: HabitTemplate) => {
                const summaryHabit = template.habits[0];
                const summaryTarget = summaryHabit?.targetTime
                  ? `${summaryHabit.targetTime} · `
                  : "";
                const summaryValue =
                  summaryHabit?.targetValue != null
                    ? `${summaryHabit.targetValue}${summaryHabit.targetUnit ? ` ${summaryHabit.targetUnit}` : ""}`
                    : "No target";

                return (
                  <div
                    key={template.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-void-700 bg-void-800 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-parchment truncate">
                        {template.name}
                      </p>
                      <p className="text-[11px] text-void-400 truncate">
                        {summaryTarget}
                        {summaryValue}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleUseTemplate(template)}
                        className="px-2 py-1 rounded-md bg-gold-500/15 text-gold-300 text-[10px] uppercase tracking-wide"
                      >
                        use
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="px-2 py-1 rounded-md text-void-400 hover:text-red-400 text-[10px] uppercase tracking-wide"
                      >
                        delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
