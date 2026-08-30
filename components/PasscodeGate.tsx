"use client";

import React, { useState, useEffect } from "react";
import { Lock } from "lucide-react";
import { useData } from "@/lib/DataContext";
import { hashPasscode } from "@/lib/storage";

const SESSION_KEY = "momentum_unlocked";

export default function PasscodeGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { settings } = useData();
  const [unlocked, setUnlocked] = useState(false);
  const [checked, setChecked] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const profile = settings.profile ?? {
    name: "Momentum User",
    avatarUrl: null,
    dailyNote: "",
  };
  const initials =
    profile.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "M";

  useEffect(() => {
    if (!settings.passcodeHash) {
      setUnlocked(true);
    } else {
      setUnlocked(sessionStorage.getItem(SESSION_KEY) === "1");
    }
    setChecked(true);
  }, [settings.passcodeHash]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const hash = await hashPasscode(code);
    if (hash === settings.passcodeHash) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setUnlocked(true);
      setError("");
    } else {
      setError("Incorrect passcode.");
      setCode("");
    }
  }

  if (!checked) return null;
  if (unlocked) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-xs text-center">
        <div className="mb-5 flex justify-center">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-16 h-16 rounded-full object-cover border border-gold-600/40"
            />
          ) : (
            <div className="w-16 h-16 rounded-full border border-gold-600/40 bg-void-900 flex items-center justify-center text-lg font-semibold text-gold-300">
              {initials}
            </div>
          )}
        </div>
        <h1 className="font-display text-2xl text-parchment mb-1">
          {profile.name}
        </h1>
        {profile.dailyNote && (
          <p className="text-void-400 text-xs mb-5 italic">
            “{profile.dailyNote}”
          </p>
        )}
        <div className="w-14 h-14 rounded-full border border-gold-600/40 flex items-center justify-center mx-auto mb-5">
          <Lock className="text-gold-400" size={22} />
        </div>
        <p className="text-void-400 text-sm mb-8">
          Enter your passcode to continue.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            autoFocus
            type="password"
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full text-center tracking-[0.5em] bg-void-900 border border-void-600 rounded-xl px-3 py-3 text-lg focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            className="mt-2 bg-gold-500 hover:bg-gold-600 text-void-950 font-semibold rounded-xl py-2.5 text-sm transition-colors"
          >
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
}
