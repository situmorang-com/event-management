# Event Management

Conference event management — guest lists, free tickets, QR check-in, sponsors/vendors. SvelteKit 2 + Svelte 5 + SQLite.

## Stack

- **SvelteKit 2** with Svelte 5 (runes), TypeScript, Tailwind CSS
- **SQLite** via Drizzle ORM + better-sqlite3
- **Auth**: passwordless magic links (oslojs primitives, cookie sessions)
- **Email**: nodemailer; Mailpit in dev
- **QR**: `qrcode` (generate) + `html5-qrcode` (scan)
- **Adapter**: `@sveltejs/adapter-node`

## Prerequisites

- Node.js 20+ (tested on 22)
- Docker (for Mailpit in dev)

## Getting started

```bash
# 1. Install
npm install

# 2. Copy env
cp .env.example .env

# 3. Start Mailpit (SMTP on :1025, web UI at http://localhost:8025)
npm run mail:up

# 4. Generate & apply DB migrations
npm run db:generate
npm run db:migrate

# 5. Run dev server
npm run dev
```

Open <http://localhost:5173>. Sign in with any email — the magic link will appear in Mailpit's web UI at <http://localhost:8025>.

## Project structure

```
src/
├── app.html · app.css · app.d.ts · hooks.server.ts
├── lib/
│   ├── server/
│   │   ├── db/             SQLite + Drizzle schema
│   │   ├── auth.ts         magic-link + sessions
│   │   ├── email.ts        nodemailer
│   │   └── permissions.ts  role-based access
│   └── utils/ids.ts        nanoid helpers
└── routes/
    ├── login/  auth/verify/  logout/  teams/new/  invite/[token]/
    ├── dashboard/                team picker (multi-team users)
    ├── t/[team]/                 team scope
    │   ├── dashboard/  members/  settings/
    │   └── conferences/
    │       └── [id]/             overview · guests · checkin · sponsors · settings
    ├── e/[slug]/                 public registration
    ├── ticket/[code]/            attendee QR ticket
    └── api/checkin/              POST endpoint for QR scanner
```

## Roles

| Action | owner | admin | staff |
|---|---|---|---|
| Manage team & members | ✓ |  |  |
| Create/edit conferences & sponsors | ✓ | ✓ |  |
| View guest list, check-in attendees, CSV | ✓ | ✓ | ✓ |
| See sponsor `amount` / `contract_url` | ✓ | ✓ |  |

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` / `preview` | Production build |
| `npm run check` | Svelte/TS type check |
| `npm run test` / `test:e2e` | Vitest / Playwright |
| `npm run db:generate` | Generate Drizzle migration from schema |
| `npm run db:migrate` | Apply migrations |
| `npm run db:studio` | Drizzle Studio (DB UI) |
| `npm run mail:up` / `mail:down` | Start/stop Mailpit |

## Roadmap

See conversation plan. Current status: scaffold + auth + teams + schema. Next slices:

1. Public registration & ticket email (functional)
2. Guest list table (search/filter/CSV)
3. QR check-in scanner & `/api/checkin`
4. Sponsor tiers + sponsor CRUD + asset uploads + public sponsor wall
5. Reminders cron, dashboard stats, deploy

## Deployment notes

- Single Node instance with persistent volume (Fly.io, Railway, VPS).
- Use Litestream for continuous SQLite backup to S3-compatible storage.
- SMTP: Postmark/Resend in prod with proper SPF/DKIM.
- HTTPS required for camera access on iOS Safari (check-in scanner).
