# Integration hand-off

## Backend
- Project: Supabase schema and wallet RPC migrations are present; project
  credentials and database deployment remain pending.
- Run/build command, port, health endpoint: none yet.
- Implemented in SQL: member approval, role/RLS enforcement, point ledger,
  donation recording, approved-member search and product redemption.
- Remaining server work: QR/voucher issue/redeem and audit history.
- No HTTP/Edge Function routes exist yet. Define and inventory them during
  backend integration from the approved project plan.

## Frontend
- Project folder: workspace root (`.`).
- Run: `npm run dev`; build: `npm run build`.
- Live-data seam: `src/api/index.ts` calls Supabase RPCs and reads the wallet
  ledger and active product catalog.
- Demo client, demo data and role-switcher have been removed.
- Types: `src/types/index.ts`; no separate shared package yet.

## Data and services
- Database: Supabase PostgreSQL; migrations are in `supabase/migrations/`.
- Frontend env placeholders: `VITE_SUPABASE_URL`,
  `VITE_SUPABASE_ANON_KEY` in `.env.example`. Server-only secrets must remain
  in the Supabase Edge Function environment.
- Essential: React/Vite frontend and configured Supabase project.
- Enhancement: Realtime (not required for initial flows).
- Add products to `wallet_products` in Supabase; the migration intentionally
  contains **NO seed data**.
