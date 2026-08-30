"use client";

import React from "react";
import Link from "next/link";
import { useData } from "@/lib/DataContext";
import { Plus, Zap, Flame, BarChart3 } from "lucide-react";
import { getIcon } from "@/lib/icons";

export default function WidgetsPage() {
  const { habits, categories, settings } = useData();

  const dailyNotePreview = (settings.profile?.dailyNote || "").slice(0, 50);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl text-parchment">Widgets</h1>

      <div className="bg-void-900/60 border border-void-700 rounded-2xl p-5">
        <h2 className="text-sm font-semibold mb-2 text-parchment">
          How to add widgets
        </h2>
        <p className="text-xs text-void-400 mb-3 leading-relaxed">
          <strong>iPhone/iPad:</strong> Long-press your home screen → tap "Add
          widget" → search for Momentum → choose a widget.
          <br />
          <strong>Android:</strong> Long-press your home screen → tap "Widgets"
          → find Momentum → add to screen.
          <br />
          <strong>Laptop:</strong> Bookmark widget pages for quick access.
        </p>
      </div>

      <section className="bg-void-900/60 border border-void-700 rounded-2xl p-5">
        <h2 className="text-sm font-semibold mb-4 text-parchment">
          Available widgets
        </h2>
        <div className="flex flex-col gap-3">
          <Link
            href="/widget-today"
            className="flex items-center justify-between p-3.5 bg-void-800 hover:bg-void-700 rounded-lg border border-void-600 hover:border-gold-500/50 transition-all"
          >
            <div className="flex items-center gap-3">
              <Zap size={18} className="text-gold-400" strokeWidth={1.75} />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-parchment">
                  Today
                </span>
                <span className="text-xs text-void-400">
                  Today's habits + daily note
                </span>
              </div>
            </div>
            <Plus size={16} className="text-void-400" strokeWidth={1.75} />
          </Link>

          <Link
            href="/widget-streaks"
            className="flex items-center justify-between p-3.5 bg-void-800 hover:bg-void-700 rounded-lg border border-void-600 hover:border-gold-500/50 transition-all"
          >
            <div className="flex items-center gap-3">
              <Flame size={18} className="text-gold-400" strokeWidth={1.75} />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-parchment">
                  Streaks
                </span>
                <span className="text-xs text-void-400">
                  Your current streaks + daily note
                </span>
              </div>
            </div>
            <Plus size={16} className="text-void-400" strokeWidth={1.75} />
          </Link>

          {habits.length > 0 && (
            <>
              <div className="border-t border-void-700 pt-4 mt-2">
                <p className="text-xs font-medium text-void-400 mb-3">
                  Individual habit widgets
                </p>
              </div>
              {habits.map((habit) => {
                const category = categories.find(
                  (c) => c.id === habit.categoryId,
                );
                const Icon = getIcon(category?.icon || "Star");
                return (
                  <Link
                    key={habit.id}
                    href={`/widget-habit/${habit.id}`}
                    className="flex items-center justify-between p-3.5 bg-void-800 hover:bg-void-700 rounded-lg border border-void-600 hover:border-gold-500/50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: `${category?.color}1a`,
                          color: category?.color,
                        }}
                      >
                        <Icon size={13} strokeWidth={1.75} />
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-parchment">
                          {habit.name}
                        </span>
                        <span className="text-xs text-void-400">
                          Streak widget + daily note
                        </span>
                      </div>
                    </div>
                    <Plus
                      size={16}
                      className="text-void-400"
                      strokeWidth={1.75}
                    />
                  </Link>
                );
              })}
            </>
          )}
        </div>
      </section>

      {dailyNotePreview && (
        <div className="bg-void-900/60 border border-void-700 rounded-2xl p-5">
          <h2 className="text-sm font-semibold mb-2 text-parchment">
            Your daily note preview
          </h2>
          <p className="text-sm text-parchment italic">
            "{dailyNotePreview}
            {(settings.profile?.dailyNote || "").length > 50 ? "..." : ""}"
          </p>
          <p className="text-xs text-void-400 mt-2">
            This appears at the top of every widget.
          </p>
        </div>
      )}
    </div>
  );
}
