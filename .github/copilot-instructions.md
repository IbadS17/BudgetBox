# BudgetBox Copilot Instructions

## Architecture

- Offline-first PWA with two packages: frontend/Next.js 16 App Router and Backend/Express API; keep data contract in sync.
- PostgreSQL table budgets(user_email,payload JSONB,updated_at) is the only server state; payload mirrors frontend Budget type.
- Conflict resolution is timestamp-based (Budget.updatedAt vs DB updated_at); never drop those fields when editing payload.

## Frontend

- App Router is client-heavy; any file touching browser APIs (`useBudgetStore`, `navigator`, Chart.js) must start with `"use client"`.
- State lives in `frontend/src/app/lib/store/budgetStore.ts` via Zustand + localforage -> IndexedDB; persist key is "budget-storage".
- Budget shape is fixed (income,bills,food,transport,subs,misc,updatedAt,syncStatus); add new fields only after updating Dashboard cards, budget form fields, and backend payload handling.
- Dashboard (`src/app/page.tsx`) drives charts through the `categories` array; keep label/key/bar colors aligned when adding categories.
- Budget planner (`src/app/budget/page.tsx`) relies on `fields` config to render inputs; re-use that array instead of hardcoding new inputs.
- Sync CTA + status chips live inside `src/app/layout.tsx`; call `setSyncPending` before any manual sync to keep the UI consistent.
- Service worker (`frontend/public/service-worker.js`) caches every fetch response; if you add uncacheable endpoints (e.g., auth), guard them there to avoid stale POST responses.
- Manifest (`public/manifest.json`) is minimal; when adding icons drop files into `frontend/public` and reference them here.
- Tailwind 4 is imported via `globals.css`; prefer utility classes and avoid legacy @tailwind directives.

## Sync & Offline Logic

- `syncBudget` (`src/app/lib/sync.ts`) fetches `/budget/latest` then decides push vs pull solely on timestamps; keep server responses shaped as `{budget,timestamp}`.
- Email is hardcoded to `hire-me@anshumat.org` for the demo; expose it via config/env before multi-user work.
- Marking fields runs through `updateField` which stamps `updatedAt = Date.now()` and sets `syncStatus` to "sync-pending" only if `navigator.onLine`; respect that or statuses drift.
- `useBudgetStore.setState` is used to apply server payloads directly; ensure any incoming object still contains `updatedAt` + `syncStatus` so persistence stays valid.
- Online indicator comes from `useOnlineStatus`; when adding network-dependent UI, reuse that hook instead of new listeners.

## Backend

- REST surface is tiny: `POST /budget/sync` writes raw JSON payload, `GET /budget/latest` returns last row for `?email=...`; keep the route signatures stable.
- Routes live in `Backend/src/routes.ts`; wrap new queries with try/catch and return `{success:false,error}` because frontend logs expect that shape.
- DB access goes through Pool in `Backend/src/db.ts`; SSL is forced only when `NODE_ENV=production`, so don't override without re-testing cloud deploys.
- Use migrations (psql snippet in README) to create the `budgets` table locally; no ORM is present.

## Dev Workflow

- Use pnpm everywhere (packageManager fields pin `pnpm@10.23.0`); do not mix npm/yarn.
- Frontend: `cd frontend && pnpm install && pnpm dev`. Backend: `cd Backend && pnpm install && pnpm dev`.
- Backend dev script uses ts-node-dev (transpile-only); restart is automatic on file save.
- Remember to set `PORT` (defaults 4000) and `DATABASE_URL` in `Backend/.env`; `syncBudget` is hardcoded to `http://localhost:4000` so update that constant for deployments.
- Offline QA flow: run frontend, open DevTools → Network → Offline, edit budgets (auto-saves), then go Online and hit "Sync Now" (`layout.tsx`) to flush changes.

## Gotchas

- Because service worker caches every request, clearing browser caches is mandatory after protocol/host changes or you'll see stale UI.
- Chart.js registration happens in `page.tsx`; if you lazily load new chart types, register them before render or Next will throw during hydration.
- Do not import server-only modules into client components; Next 16 + React 19 strict mode will surface hydration errors immediately.
- Keep logs noise-free: current backend logs request bodies in `/budget/sync` for debugging—strip or guard them before production commits.
