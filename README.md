# Tangai · Cartera

Starter web app for the Asociación Tangai member wallet. It uses React,
TypeScript and Vite, and is configured to package the same frontend for Android
with Capacitor.

> **Current state:** this is a frontend scaffold with illustrative demo data.
> Supabase credentials, database schema, Row Level Security policies, server
> functions and production authentication are not configured. The demo role
> selector is for preview only; it is not an authorization mechanism.

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- For Android: Android Studio and the Android SDK

## Run locally

```sh
npm install
cp .env.example .env
npm run dev
```

Open the local URL printed by Vite. On Windows PowerShell, copy the example
environment file with:

```powershell
Copy-Item .env.example .env
```

The app runs without environment values in demo mode. To prepare the Supabase
client placeholder, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in
`.env`, then restart Vite. Never put a Supabase `service_role` key in a frontend
environment file.

## Build and Android

```sh
npm run build
npm run android:add       # first time only; creates the native android/ project
npm run android:sync      # build web assets and sync them to the Android project
npm run android:open      # open the native project in Android Studio
```

The generated `android/` directory is ignored by Git. Keep `capacitor.config.ts`
as the source of the app ID, app name and web asset directory.

## Starter structure

```text
src/
  app/                 App entry and demo session state
  api/                 One-file seam and temporary mock client
  components/          Shared shell, navigation and activity components
  data/                Clearly labelled, non-persistent demo data
  features/
    auth/              Sign-in, sign-up and pending-approval UI
    dashboard/         Member/staff/admin dashboard foundation
  lib/                 Supabase client placeholder
  styles.css           Responsive visual foundation
  types/               Shared frontend types
capacitor.config.ts    Capacitor Android app configuration
```

## MVP flows represented in the UI

- Member sign-up with a pending staff-approval confirmation.
- Member wallet, recent activity and the rule of 100 points per €1 donation.
- Staff/admin dashboard entry points and demo role selector.
- Product/refresher and voucher guidance.

These are UI foundations only. Authentication, approval enforcement, donation
recording, QR issuance/scanning, five-minute expiry, one-use redemption,
configurable product prices, audit history and transactional point balances
must be implemented and enforced in Supabase before real use. QR contents and
balances must not be trusted to the client. No online payments are included.

## Local configuration checklist

1. Copy `.env.example` to `.env` and add the Supabase project URL and anon key.
2. Create and review the PostgreSQL schema, RLS policies and server-side
   operations for member approval, roles, donations, points and voucher
   redemption.
3. Connect the auth and data seams in `src/lib/supabase.ts`; replace demo data
   in `src/data/demo.ts` only after the backend is ready.
4. Configure Android Studio/SDK, then run `npm run android:add` and
   `npm run android:sync`.
