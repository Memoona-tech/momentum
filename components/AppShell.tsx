"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useData } from "@/lib/DataContext";
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
  Github,
  Globe,
  Mail,
} from "lucide-react";

const SOCIAL_LINKS = [
  {
    href: "https://github.com/Memoona-tech",
    label: "GitHub",
    icon: Github,
  },
  {
    href: "https://memoonasaleem.vercel.app",
    label: "Portfolio",
    icon: Globe,
  },
  {
    href: "mailto:memoona.se@gmail.com",
    label: "Email",
    icon: Mail,
  },
];

const NAV_ITEMS = [
  { href: "/", label: "Today", icon: LayoutGrid, matchPrefixes: ["/"] },
  { href: "/habits", label: "Habits", icon: Gem, matchPrefixes: ["/habits"] },
  { href: "/streaks", label: "Streaks", icon: Flame, matchPrefixes: ["/streaks"] },
  {
    href: "/analytics",
    label: "Analytics & Reports",
    icon: LineChart,
    matchPrefixes: ["/analytics", "/reports"],
  },
  { href: "/notes", label: "Notes", icon: Feather, matchPrefixes: ["/notes"] },
  { href: "/widgets", label: "Widgets", icon: SquareStack, matchPrefixes: ["/widgets"] },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { settings } = useData();

  const profile = settings.profile ?? {
    name: "Momentum User",
    avatarUrl: null,
    dailyNote: "",
  };

  const initials =
    (profile.name || "Momentum User")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "M";

  const themeStyles: Record<string, { backgroundImage: string }> = {
    vault: {
      backgroundImage:
        "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)",
    },
    ember: {
      backgroundImage:
        "radial-gradient(circle at top left, rgba(249,115,22,0.18), transparent 35%), radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)",
    },
    forest: {
      backgroundImage:
        "radial-gradient(circle at top left, rgba(63,138,115,0.16), transparent 30%), radial-gradient(circle at 1px 1px, rgba(255,255,255,0.025) 1px, transparent 0)",
    },
    midnight: {
      backgroundImage:
        "radial-gradient(circle at top left, rgba(139,92,246,0.14), transparent 30%), radial-gradient(circle at 1px 1px, rgba(255,255,255,0.025) 1px, transparent 0)",
    },
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const renderProfileCorner = (isMobile = false) => {
    const isSettingsActive = pathname === "/settings";
    return (
      <Link
        href="/settings"
        onClick={() => isMobile && setMobileOpen(false)}
        className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all group ${
          isSettingsActive
            ? "bg-gold-500/10 border-gold-500/40 text-gold-300"
            : "border-void-700/60 bg-void-800/40 hover:bg-void-800 hover:border-void-600 text-parchment"
        }`}
        title="View profile & settings"
      >
        <div className="relative shrink-0">
          {profile.avatarUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-9 h-9 rounded-full object-cover border border-void-600 group-hover:border-gold-400/60 transition-colors"
            />
          ) : (
            <div className="w-9 h-9 rounded-full border border-void-600 group-hover:border-gold-400/60 bg-void-800 flex items-center justify-center text-xs font-semibold text-gold-300 transition-colors">
              {initials}
            </div>
          )}
          <span
            className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-void-900"
            title="Local Vault Active"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate group-hover:text-gold-300 transition-colors">
            {profile.name || "Momentum User"}
          </p>
          <p className="text-[11px] text-void-400 truncate">
            {profile.dailyNote ? `"${profile.dailyNote}"` : "Settings & Profile"}
          </p>
        </div>
        <SettingsIcon
          size={16}
          className={`shrink-0 transition-transform group-hover:rotate-45 ${
            isSettingsActive
              ? "text-gold-400"
              : "text-void-400 group-hover:text-parchment"
          }`}
        />
      </Link>
    );
  };

  const renderSocialLinks = () => (
    <div className="flex items-center justify-between px-1.5 pt-1.5 text-void-400">
      <span className="text-[10px] font-mono tracking-widest text-void-500 uppercase">
        Connect
      </span>
      <div className="flex items-center gap-1">
        {SOCIAL_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            title={link.label}
            className="p-1.5 rounded-lg text-void-400 hover:text-gold-300 hover:bg-void-800 transition-colors"
          >
            <link.icon size={14} strokeWidth={1.75} />
            <span className="sr-only">{link.label}</span>
          </a>
        ))}
      </div>
    </div>
  );

  return (
    <div
      data-theme={settings.theme}
      className="min-h-screen flex flex-col md:flex-row"
      style={themeStyles[settings.theme] ?? themeStyles.vault}
    >
      <aside className="hidden md:flex md:w-64 md:flex-col md:sticky md:top-0 md:h-screen md:shrink-0 border-r border-void-700 bg-void-900/60 px-5 py-7 overflow-y-auto">
        <div className="flex items-center gap-2.5 px-1 mb-8">
          <div className="w-8 h-8 rounded-full border border-gold-500/50 flex items-center justify-center">
            <Gem className="text-gold-400" size={15} />
          </div>
          <span className="font-display text-lg tracking-wide text-parchment">
            Momentum
          </span>
        </div>
        <nav className="flex flex-col gap-1 mb-6">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : item.matchPrefixes?.some(
                    (p) => pathname === p || pathname.startsWith(p + "/"),
                  ) ?? pathname === item.href;
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
        <div className="mt-auto pt-4 border-t border-void-700 flex flex-col gap-1.5">
          {renderProfileCorner()}
          {renderSocialLinks()}
        </div>
      </aside>

      <header className="md:hidden flex items-center justify-between px-4 py-3.5 border-b border-void-700 bg-void-900/60 sticky top-0 z-20 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full border border-gold-500/50 flex items-center justify-center">
            <Gem className="text-gold-400" size={13} />
          </div>
          <span className="font-display text-base tracking-wide">Momentum</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/settings"
            className="flex items-center p-0.5 rounded-full border border-void-700 hover:border-gold-500/50 transition-colors"
            title="Profile & Settings"
          >
            {profile.avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-void-800 flex items-center justify-center text-[10px] font-semibold text-gold-300">
                {initials}
              </div>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="p-2 rounded-lg bg-void-800 border border-void-600 text-parchment"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-void-950/70"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 max-w-[82vw] border-r border-void-700 bg-void-900 px-4 py-5 flex flex-col">
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
            <nav className="flex flex-col gap-1 mb-6">
              {NAV_ITEMS.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : item.matchPrefixes?.some(
                        (p) => pathname === p || pathname.startsWith(p + "/"),
                      ) ?? pathname === item.href;
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
            <div className="mt-auto pt-4 border-t border-void-700 flex flex-col gap-1.5">
              {renderProfileCorner(true)}
              {renderSocialLinks()}
            </div>
          </aside>
        </div>
      )}

      <main className="flex-1 min-w-0 px-4 py-6 md:px-10 md:py-10 pb-24 md:pb-10 max-w-5xl w-full mx-auto">
        {children}
      </main>
    </div>
  );
}
