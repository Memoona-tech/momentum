# Momentum — Habit Tracker

A single Next.js app — no separate backend, no database to configure, no
hosting bill. Everything is stored in your browser's `localStorage`; you
export/import a JSON backup to move between devices or browsers.

## Run it locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. That's it — no `.env` file, no second
terminal, no server to start.

## Deploy it (free, one project)

**Vercel** (recommended, since this is a Next.js app):
1. Push this folder to a GitHub repo.
2. [vercel.com](https://vercel.com) → **New Project** → import the repo.
3. Leave every setting as default (Vercel auto-detects Next.js) → **Deploy**.

That's the whole deployment. No root-directory setting, no environment
variables, no build command to fix — because there's only one app here.

**Netlify** works the same way: import the repo, leave defaults, deploy.

## How the data model works

- Everything lives under one `localStorage` key. Opening the app reads it;
  every change (checking off a habit, editing settings) writes it back
  immediately.
- **This means your data is per-browser, per-device.** Clearing your
  browser's site data deletes it. Use **Reports → Export JSON** regularly
  as a backup, and **Settings → Import JSON backup** to restore it (e.g.
  on a new device — export on the old one, import on the new one).
- There's no real user account system, because there's no server to hold
  one. The **Settings → Passcode lock** is a local PIN check — it hides
  the app from someone picking up your device, but it isn't the same
  guarantee as a server-side login. Don't rely on it for anything
  sensitive.

## Features

- **Habits** — CRUD, category (color + icon), daily/weekly/monthly
  schedule, a target time, and an optional numeric target.
- **Today** — a circular completion dial, checkbox to complete/uncheck,
  and overdue flags (plus an optional browser notification, if you grant
  permission — reminders only fire while the tab is open, since there's
  no background server to send them).
- **Analytics** — week/month/year completion trend, per-habit completion
  rate, best-period comparison, streak counters.
- **Reports** — auto-generated text insights, a downloadable PDF report,
  and JSON/CSV export.
- **Settings** — categories, notification lead time, passcode lock,
  restore from a JSON backup.

## Design

"Vault" theme: matte black surfaces, a brass-gold accent, deep emerald for
completion states, a serif display face (Fraunces) for headings against a
plain sans (Inter) for UI text, and a monospace face (JetBrains Mono) for
streaks and stats — like a data readout on a dark instrument panel.

## Tech stack

Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS, Recharts,
date-fns, jsPDF, lucide-react. No backend framework, no database, no auth
library — all state is client-side.
