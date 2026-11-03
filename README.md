# Tangai · Cartera

Starter web app for the Asociación Tangai member wallet. It uses React,
TypeScript and Vite, and is configured to package the same frontend for Android
with Capacitor.

> **Current state:** authentication, member approval, wallet balances, recent
> activity, staff donation entry and product redemptions use Supabase. Staff
> permissions and balance changes are enforced by database functions, not by
> the interface.

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

Set `VITE_SUPABASE_URL` and either `VITE_SUPABASE_ANON_KEY` or
`VITE_SUPABASE_PUBLISHABLE_KEY` in `.env`, then restart Vite. Authentication
and wallet features require these values. Never put a Supabase `service_role`
key in a frontend environment file.

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
run [`supabase/migrations/profiles.sql`](./supabase/migrations/profiles.sql).
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

## Wallet points

After applying `profiles.sql`, run
[`supabase/migrations/wallet_ledger.sql`](./supabase/migrations/wallet_ledger.sql)
in Supabase SQL Editor. The immutable `wallet_transactions` ledger stores
donations and redemptions; the balance is the sum of its signed point entries.
The migration also creates an initially empty `wallet_products` catalog. Add
products and their point costs in Supabase Table Editor; only approved members
can read active products, and only approved staff/admin can redeem them.

Donation awards are 100 points per euro, multiplied by the donation amount:

| Donation | Multiplier |
| --- | ---: |
| Under €5 | x1 |
| €5 to under €10 | x1.1 |
| €10 to under €20 | x1.2 |
| €20 through €50 inclusive | x1.3 |
| Over €50 | x1.5 |

Amounts must be positive and expressed in whole euro cents. Fractional point
results are rounded to the nearest whole point. Approved staff/admin accounts search approved members by name and record
donations with `record_donation`; product redemptions use `redeem_product`,
which reads the active product's point cost from the catalog. Both operations are server-side,
serialized per member to prevent concurrent redemptions from overspending, and
reject members who are not approved. Authenticated clients can read only their
own transactions; approved operators can read all transactions. The client
cannot directly insert, alter or delete ledger entries.

The proposed 25-point daily-login bonus is intentionally deferred. When added,
it should use a separate idempotent server-side operation with a per-user,
per-day uniqueness rule so repeated logins cannot award it more than once.

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
  app/                 App entry and authenticated session state
  api/                 Supabase wallet data operations
  components/          Shared shell and activity components
  features/
    auth/              Supabase email auth, password reset and CAPTCHA
    dashboard/         Member wallet and staff operations
  lib/                 Supabase client
  styles.css           Responsive visual foundation
  types/               Shared frontend types
capacitor.config.ts    Capacitor Android app configuration
```

## MVP flows

- Member sign-up with email confirmation.
- Member wallet, recent activity and the rule of 100 points per €1 donation.
- Staff/admin donation and product-redemption forms.
- Product costs are managed in Supabase; the client cannot set them.

QR issuance/scanning, five-minute expiry, one-use voucher redemption and audit
history still need to be implemented before real use. QR contents and balances
must not be trusted to the client. No online payments are included.

## Local configuration checklist

1. Copy `.env.example` to `.env` and add the Supabase project URL and public key.
2. Optionally configure Cloudflare Turnstile and its secret in Supabase to
   protect authentication requests from bots.
3. Run `supabase/migrations/profiles.sql` in Supabase SQL Editor and verify
   approval with test accounts before adding real users.
4. Run `supabase/migrations/wallet_ledger.sql`, add active products to
   `wallet_products`, and verify point rules and staff operations with test accounts.
5. Configure Android Studio/SDK, then run `npm run android:add` and
   `npm run android:sync`.
