"use client";

import React, { useMemo, useState } from "react";
import { Sparkles, Quote, RefreshCw } from "lucide-react";
import { getDailyQuote, MOTIVATION_QUOTES, MotivationQuote } from "@/lib/quotes";
import { todayStr } from "@/lib/schedule";

export default function DailyMotivation() {
  const today = todayStr();
  const defaultQuote = useMemo(() => getDailyQuote(today), [today]);
  const [currentQuote, setCurrentQuote] = useState<MotivationQuote>(defaultQuote);
  const [isRotating, setIsRotating] = useState(false);

  function handleShuffle() {
    setIsRotating(true);
    setTimeout(() => {
      let nextIndex = Math.floor(Math.random() * MOTIVATION_QUOTES.length);
      while (
        MOTIVATION_QUOTES.length > 1 &&
        MOTIVATION_QUOTES[nextIndex].text === currentQuote.text
      ) {
        nextIndex = Math.floor(Math.random() * MOTIVATION_QUOTES.length);
      }
      setCurrentQuote(MOTIVATION_QUOTES[nextIndex]);
      setIsRotating(false);
    }, 200);
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-void-700/80 bg-gradient-to-r from-void-900/90 via-void-900/50 to-void-850/80 p-4 sm:p-5 mb-6 backdrop-blur">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-gold-400">
            <Sparkles size={13} />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-gold-400">
            Daily Motivation
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-void-700 bg-void-800 text-void-300">
            {currentQuote.theme}
          </span>
        </div>

        <button
          type="button"
          onClick={handleShuffle}
          title="Inspire me with another quote"
          className="text-void-400 hover:text-gold-300 p-1 rounded-md hover:bg-void-800 transition-colors"
          aria-label="Refresh quote"
        >
          <RefreshCw
            size={13}
            className={`transition-transform duration-300 ${isRotating ? "rotate-180 text-gold-400" : ""}`}
          />
        </button>
      </div>

      <div className="relative pl-3 border-l-2 border-gold-500/40 my-1">
        <p className="text-sm sm:text-base text-parchment leading-relaxed font-serif italic">
          &ldquo;{currentQuote.text}&rdquo;
        </p>
        <p className="text-xs text-void-400 mt-1.5 font-medium not-italic tracking-wide">
          — <span className="text-parchment/90">{currentQuote.author}</span>
        </p>
      </div>
    </div>
  );
}
