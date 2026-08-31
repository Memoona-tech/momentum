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

## Data model and privacy

Momentum is intentionally local-first:

- All habit data, logs, settings, profiles, categories, and milestone progress live in the browser
- App state is written to `localStorage` immediately after updates
- There is no server-side user account or cloud sync backend
- Passcodes are local-only protection on the device, not a remote authentication system

This means:

- Your data is saved per browser and per device
- Clearing browser storage removes the data
- You should keep backups using the export flow in Settings or Reports
- You can restore a full backup by importing the JSON file later

## Backup and restore workflow

Use the export/import flow for safe portability:

1. Open Reports or Settings
2. Export JSON or copy the sync payload
3. Import that file on another device or browser
4. Restore the full app state including habits, logs, categories, notifications, and passcode hash

## Project structure

```text
app/
  analytics/
  habits/
  notes/
  reports/
  settings/
  streaks/
  widgets/
components/
lib/
public/
```

## Tech stack

- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- date-fns
- jsPDF
- lucide-react

## License

Copyright (c) 2026 Memoona
GitHub: https://github.com/Memoona-tech
Email: memoona.se@gmail.com

This project is open source and licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

You are free to use, modify, and distribute this project as long as the copyright notice and permission notice are included in copies or substantial portions of the software.

## Notes

Momentum is built as a self-contained front-end app. It intentionally avoids a backend so it stays simple, fast, and easy to run without infrastructure.

If you want a more opinionated setup, you can still add backend sync or cloud storage later, but the current version is designed to stay local, private, and fully browser-driven.
