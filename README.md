# Momentum — Habit Tracker

Momentum is a local-first habit tracker built with Next.js for building better routines without friction.

Track daily habits, streaks, milestones, notes, analytics, and personal progress in a single browser-based app. It keeps your data private and local by default, while still supporting JSON backup and restore flows for moving between devices.

## About

Momentum is designed to feel like a calm, focused command dashboard: daily check-ins, productivity tracking, progress insights, and personal reflection in one place.

Everything is stored in the browser using `localStorage`, so there is no backend, login flow, or database to configure. Export your data as JSON whenever you want a backup or a migration path to another device.

## Why Momentum

- Track daily, weekly, and monthly habits
- See important streak and milestone progress at a glance
- Keep notes tied to specific habit logs
- Review completion trends with analytics and weekly/monthly reports
- Install the app as a PWA and use the widget-style views for quick glance access
- Keep local-only privacy with passcode protection and browser-side storage

## Run locally

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

No `.env` file is required. There is no backend, auth service, or database to configure.

## Core features

### Habit planning and tracking

- Create, edit, archive, and reorder habits
- Assign categories with color + icon metadata
- Choose daily, weekly, or monthly schedules
- Add target times and optional numeric tracking values
- Support optional units such as minutes, reps, pages, or other measurable progress
- Use milestone targets like 7, 30, and 100-day streak thresholds

### Today dashboard

- Quickly review the habits scheduled for today
- Mark habits complete or incomplete from the main dashboard
- See overall streak and best streak summaries
- Filter today’s habits by search
- Drag-and-drop habit ordering
- Receive browser notification reminders when a habit is due or near target time

### Streaks and achievements

- Track current streak and longest streak per habit
- View unlockable milestone achievements
- Earn theme unlocks as streak milestones are reached
- Visual progress bars for next milestone targets

### Notes and personal context

- Add daily notes to habit logs
- Edit or delete notes later from the Notes screen
- Keep reflections tied to the same date-based habit records as the rest of the data
- Add a personal daily note shown in widget-style previews

### Analytics and reporting

- Review completion trends across recent periods
- Compare current-period completion rate against the previous period
- See per-habit completion breakdowns
- Export summary reports as PDF
- Export raw data as JSON or CSV
- Use reports to compare performance and identify weak spots

### Widgets and installable app

- Access widget-style pages for Today, Streaks, and per-habit summaries
- Install Momentum as a PWA on supported devices
- Use the app from the home screen like a lightweight installed tool

### Settings and personalization

- Update profile name and profile image
- Add a daily note to show in widget views
- Toggle smart reminder notifications and adjust lead time
- Set a local passcode lock for device-level protection
- Create custom categories
- Unlock alternate visual themes as milestones are earned
- Import/export full app data as JSON backups

## Privacy-First Architecture & Multi-Device Sync

Momentum is strictly **privacy-first and local-only by design**. Your habit data belongs exclusively to you and never touches a third-party server or cloud database.

### Why Privacy-First?
- **Zero Cloud Accounts**: No logins, email tracking, or third-party databases.
- **Immediate Local Persistence**: Everything is saved instantly to your browser's `localStorage`.
- **Passcode Gate**: Local cryptographic PIN protection keeps curious eyes away on shared computers.
- **Total Data Ownership**: Export your complete database at any time as JSON or CSV.

### Seamless PC ⇋ Phone Sync (Without Cloud Accounts)
Habit tracking works best when you can log routines on your computer during work and on your mobile device on the go. Momentum provides an account-free **Sync & Smart Merge Hub**:

- **Targeted Date Range Sync**: Export just today's logs, yesterday's, a date range, or your full history.
- **Smart Merge Engine**: Non-destructively merges logs from both devices. If you check off a morning run on your phone and a deep-work block on your PC, merging them preserves completions from both devices.
- **Frictionless Transfer**: Copy the sync payload to your clipboard or transfer a tiny JSON file between devices via AirDrop, LocalSend, or messaging.

## Instant Demo Data

Want to test-drive Momentum without manually typing in habits?
- Click the **"Load Demo Data"** button on the dashboard or in **Settings → Demo Data & Reset**.
- Preloads 4 realistic daily/weekly routines (Deep Work, Morning Run, Architecture Reading, Mindfulness), 30 days of authentic streak heatmaps, and unlockable achievement progress.

## Backup and restore workflow

1. Open **Settings** or the **Sync & Merge Hub** (`Sync PC / Phone`).
2. Export a single date, date range, or complete JSON archive.
3. Import the payload on your other device or browser.
4. Smart Merge immediately reconciles changes without overwriting your logs.

## Quality & Continuous Integration

Momentum maintains a comprehensive quality suite:
- **Type Safety**: Strict TypeScript checks (`npm run typecheck`).
- **Linting**: ESLint checks (`npm run lint`).
- **Unit Testing**: Vitest suite with full coverage of complex streak-calculation edge cases and smart sync merge logic (`npm test`).
- **Automated CI**: GitHub Actions workflow running all checks on push and pull requests.

## Project structure

```text
app/
  analytics/       # Visual completion analytics and trends
  habits/          # Habit creation, editing, and scheduling
  notes/           # Date-linked habit journals
  reports/         # PDF and tabular progress reports
  settings/        # Profiles, themes, passcode, demo data, and sync hub
  streaks/         # Milestone unlocks and achievement badges
  widgets/         # Glanceable widget-style views
components/        # UI components & SyncModal
lib/               # Streak logic, smart merge engine, and local storage context
public/            # PWA icons and web manifest
```

## Tech stack

- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- date-fns
- jsPDF
- Vitest
- Lucide React

## License

Copyright (c) 2026 Memoona  
GitHub: https://github.com/Memoona-tech  
Email: memoona.se@gmail.com  

This project is open source and licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
