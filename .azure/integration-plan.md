# Integration hand-off

## Backend
- Project: not scaffolded (Supabase backend setup remains pending).
- Run/build command, port, health endpoint: none yet.
- Required server work: auth and member approval; role/RLS enforcement; donation
  issuance/claim; point ledger; product pricing; voucher issue/redeem; audit.
- No HTTP/Edge Function routes exist yet. Define and inventory them during
  backend integration from the approved project plan.

## Frontend
- Project folder: workspace root (`.`).
- Run: `npm run dev`; build: `npm run build`.
- Live-data seam: replace `src/api/index.ts` export to use a Supabase-backed
  client while keeping component call sites stable.
- Remove after live data is wired: `src/api/mockClient.ts`,
  `src/data/demo.ts`, and demo role-switcher state/control in
  `src/app/App.tsx` + `src/components/AppShell.tsx`.
- Types: `src/types/index.ts`; no separate shared package yet.

## Data and services
- Database: Supabase PostgreSQL; migration tool: Supabase CLI; expected
  migration directory: `supabase/migrations/` (not created yet).
- Frontend env placeholders: `VITE_SUPABASE_URL`,
  `VITE_SUPABASE_ANON_KEY` in `.env.example`. Server-only secrets must remain
  in the Supabase Edge Function environment.
- Essential: React/Vite frontend and Supabase backend (backend not configured).
- Enhancement: Realtime (not required for initial flows).
- Create schema and RLS migrations with **NO seed data**.
