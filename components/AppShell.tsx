"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  LineChart,
  FileText,
  Settings as SettingsIcon,
  Gem,
  Flame,
  SquareStack,
  Feather,
  Menu,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Today", icon: LayoutGrid },
  { href: "/habits", label: "Habits", icon: Gem },
  { href: "/streaks", label: "Streaks", icon: Flame },
  { href: "/analytics", label: "Analytics", icon: LineChart },
  { href: "/notes", label: "Notes", icon: Feather },
  { href: "/widgets", label: "Widgets", icon: SquareStack },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-void-700 bg-void-900/60 px-5 py-7">
        <div className="flex items-center gap-2.5 px-1 mb-10">
          <div className="w-8 h-8 rounded-full border border-gold-500/50 flex items-center justify-center">
            <Gem className="text-gold-400" size={15} />
          </div>
          <span className="font-display text-lg tracking-wide text-parchment">
            Momentum
          </span>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-gold-500/10 text-gold-300"
                    : "text-void-400 hover:text-parchment hover:bg-void-800"
                }`}
              >
                <item.icon size={17} strokeWidth={1.75} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto pt-5 border-t border-void-700">
          <p className="text-[11px] text-void-400 px-1 leading-relaxed">
            Stored on this device only. Export a backup from Reports any time.
          </p>
        </div>
      </aside>

      <header className="md:hidden flex items-center justify-between px-4 py-3.5 border-b border-void-700 bg-void-900/60 sticky top-0 z-20 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full border border-gold-500/50 flex items-center justify-center">
            <Gem className="text-gold-400" size={13} />
          </div>
          <span className="font-display text-base tracking-wide">Momentum</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="p-2 rounded-lg bg-void-800 border border-void-600 text-parchment"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-void-950/70"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 max-w-[82vw] border-r border-void-700 bg-void-900 px-4 py-5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full border border-gold-500/50 flex items-center justify-center">
                  <Gem className="text-gold-400" size={13} />
                </div>
                <span className="font-display text-lg tracking-wide text-parchment">
                  Momentum
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-void-300"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-gold-500/10 text-gold-300"
                        : "text-void-400 hover:text-parchment hover:bg-void-800"
                    }`}
                  >
                    <item.icon size={17} strokeWidth={1.75} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      <main className="flex-1 px-4 py-6 md:px-10 md:py-10 pb-24 md:pb-10 max-w-5xl w-full mx-auto">
        {children}
      </main>
    </div>
  );
}
