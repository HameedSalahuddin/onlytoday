# OnlyToday

A dark, Mac-inspired study planner that helps you focus on **today only**. Built with Next.js (App Router), TypeScript, Tailwind CSS, Prisma + SQLite, and built-in email/password auth.

## Features

- **Today-only rule (server-enforced)** — a task can only be created for today. The server assigns the date; client-supplied dates are ignored. No future dates can be written to the database.
- **Calendar** — past days open a read-only history view; today is highlighted; future days are locked and show a message when clicked.
- **Progress** — live completion counter for today's tasks.
- **Delete + undo** — removing a task shows an undo toast.
- **Day rollover** — the app automatically reloads at local midnight and on focus/visibility changes.
- **Timezone-aware** — "today" is computed on the server using the browser's timezone (via the `ot_tz` cookie), with a fallback to the server's system timezone.
- **Auth** — scrypt-hashed passwords and DB-backed sessions via an httpOnly cookie.

## Getting started

Requires Node.js 20+ and npm. `npm install` may prompt you to approve postinstall scripts (`prisma`, `@prisma/engines`, `unrs-resolver`, `better-sqlite3`) — approve them.

```bash
npm install
npx prisma migrate dev   # creates the SQLite DB at ./dev.db
npm run dev
```

Open http://localhost:3000. Guests are redirected to `/login`; sign up to create an account.

## Scripts

| Command              | Purpose                                        |
| -------------------- | ---------------------------------------------- |
| `npm run dev`        | Start the dev server                           |
| `npm run build`      | Production build                               |
| `npm run start`      | Serve the production build                     |
| `npm run lint`       | ESLint                                         |
| `npm run typecheck`  | TypeScript type checking                       |
| `npm test`           | Vitest unit tests (`tests/`)                   |

## Architecture notes

### Today-only enforcement

The client UI never sends a date when creating a task. `createTask` in `app/actions/tasks.ts` assigns `taskDate = server today` (computed in the user's timezone) and rejects any input that implies a non-today date. The pure helpers in `lib/tasks-core.ts` (`enforceTodayOnly`, `enforceViewableDate`, `validateTitle`) are unit-tested in `tests/tasks-core.test.ts`. An end-to-end check replays a forged `createTask` request with a future date field and verifies the task is stored for the server's today.

### Timezone behavior

- The browser reports its timezone on first visit; `TimezoneSync` persists it to the `ot_tz` cookie via a server action (encoded on the wire, decoded before use — see `decodeTimezoneCookie` in `lib/auth.ts`).
- The server computes "today" with `Intl.DateTimeFormat` for that timezone. If the cookie is missing/invalid, it falls back to `getDefaultTimezone()` (the server's system timezone).
- "Today" is a calendar date, not a 24-hour window: tasks are keyed by `YYYY-MM-DD`.

### Data model

- `User` (email, scrypt password hash)
- `Session` (token hash, user, expiry)
- `Task` (title, completed, `taskDate` keyed by `YYYY-MM-DD`, owner)

### Deployment

SQLite is file-based; deploy as a single instance (e.g. a VPS or Render) rather than serverless functions with multiple isolated runtime instances. Set `DATABASE_URL="file:./dev.db"` (or an absolute path) in your environment.