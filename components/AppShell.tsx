"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, LineChart, FileText, Settings as SettingsIcon, Gem } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Today", icon: LayoutGrid },
  { href: "/habits", label: "Habits", icon: Gem },
  { href: "/analytics", label: "Analytics", icon: LineChart },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-void-700 bg-void-900/60 px-5 py-7">
        <div className="flex items-center gap-2.5 px-1 mb-10">
          <div className="w-8 h-8 rounded-full border border-gold-500/50 flex items-center justify-center">
            <Gem className="text-gold-400" size={15} />
          </div>
          <span className="font-display text-lg tracking-wide text-parchment">Momentum</span>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? "bg-gold-500/10 text-gold-300" : "text-void-400 hover:text-parchment hover:bg-void-800"
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

      <header className="md:hidden flex items-center gap-2.5 px-4 py-3.5 border-b border-void-700 bg-void-900/60 sticky top-0 z-10 backdrop-blur">
        <div className="w-7 h-7 rounded-full border border-gold-500/50 flex items-center justify-center">
          <Gem className="text-gold-400" size={13} />
        </div>
        <span className="font-display text-base tracking-wide">Momentum</span>
      </header>

      <main className="flex-1 px-4 py-6 md:px-10 md:py-10 pb-24 md:pb-10 max-w-5xl w-full mx-auto">
        {children}
      </main>

      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-void-900/90 backdrop-blur border-t border-void-700 flex justify-around py-2 z-10">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-2 py-1 text-[10.5px] font-medium ${
                active ? "text-gold-400" : "text-void-400"
              }`}
            >
              <item.icon size={19} strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
