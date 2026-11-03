# Tangai · Cartera

Starter web app for the Asociación Tangai member wallet. It uses React,
TypeScript and Vite, and is configured to package the same frontend for Android
with Capacitor.

> **Current state:** email/password authentication is connected to Supabase Auth.
> A profiles migration is ready to add pending-by-default accounts and profile
> read restrictions. The wallet and activity still use illustrative demo data;
> the demo role selector is not an authorization mechanism.

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

The app runs without environment values in demo mode. Set `VITE_SUPABASE_URL`
and either `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_KEY` in
`.env`, then restart Vite. Never put a Supabase `service_role` key in a frontend
environment file.

To enable bot protection, create a Cloudflare Turnstile widget, set its site key
as `VITE_TURNSTILE_SITE_KEY`, and configure the matching secret in Supabase
under **Authentication → Bot and Abuse Protection → CAPTCHA**. Until both sides
are configured, the app displays a warning and auth requests are not protected
by CAPTCHA.

In the Supabase project's **Authentication → URL Configuration**, set the local
site URL to `http://localhost:5173` and allow that URL as a redirect. Enable the
Email provider. The app uses email/password sign-up, sign-in, email confirmation,
password reset and sign-out. OAuth is not enabled.

## User approval and profiles

Before testing new accounts, open **SQL Editor** in the Supabase dashboard and
run [`supabase/migrations/20261103131500_profiles_and_approval.sql`](./supabase/migrations/20261103131500_profiles_and_approval.sql).
It creates a profile for existing Auth users and automatically creates future
profiles with `status = 'pending'` and `role = 'member'`.

The migration enables RLS, allows authenticated users to read only their own
profile, and grants them no insert/update/delete permissions. The app checks
that profile after login and only opens the wallet for `approved` accounts.
Users cannot approve themselves or change their role through the client. A
trusted project administrator can manually review and change a profile in
**Table Editor → profiles**. To approve someone, set `status` to `approved`;
leave their role as `member` unless a trusted administrator explicitly needs
to assign `staff` or `admin`. Ask the user to sign out and back in after
approval. The `is_approved_member()` database function is available for RLS
policies on future private application tables; each such table still needs its
own RLS policies.

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
    auth/              Supabase email auth, password reset and CAPTCHA
    dashboard/         Member/staff/admin dashboard foundation
  lib/                 Supabase client
  styles.css           Responsive visual foundation
  types/               Shared frontend types
capacitor.config.ts    Capacitor Android app configuration
```

## MVP flows represented in the UI

- Member sign-up with email confirmation.
- Member wallet, recent activity and the rule of 100 points per €1 donation.
- Staff/admin dashboard entry points and demo role selector.
- Product/refresher and voucher guidance.

The wallet, donation recording, QR issuance/scanning,
five-minute expiry, one-use redemption, configurable product prices, audit
history and transactional point balances are UI foundations only. They must be
implemented and enforced in Supabase before real use. QR contents and balances
must not be trusted to the client. No online payments are included.

## Local configuration checklist

1. Copy `.env.example` to `.env` and add the Supabase project URL and public key.
2. Optionally configure Cloudflare Turnstile and its secret in Supabase to
   protect authentication requests from bots.
3. Run the profiles migration in Supabase SQL Editor and verify approval with
   test accounts before adding real users.
4. Create RLS-protected tables and server-side operations for donations, points
   and voucher redemption before connecting the real wallet.
5. Replace demo data in `src/data/demo.ts` only after the backend is ready.
6. Configure Android Studio/SDK, then run `npm run android:add` and
   `npm run android:sync`.
