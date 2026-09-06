# Ledger

A money manager PWA styled with the **Bold Typography** design system — dark,
sharp-edged, type-first. Built with Next.js 15 (App Router), deployed to
Cloudflare Workers via the OpenNext adapter, with Cloudflare D1 for data and
R2 for account icons.

Every route in this app has been build-tested and exercised end-to-end
locally (register → create account → upload icon → record a transaction →
verify balance) against the real Cloudflare Workers runtime via `wrangler dev`.

## Stack

- **Next.js 15** (App Router), **React 19**, **TypeScript**, **Tailwind CSS**
- **Cloudflare Workers** — via [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare),
  the actively maintained adapter (the older `@cloudflare/next-on-pages` is
  deprecated and, as of this writing, incompatible with current Next.js patch
  releases — this project uses the supported path)
- **Cloudflare D1** (SQLite) for accounts, transactions, categories, users, sessions
- **Cloudflare R2** for uploaded account icons
- Auth: email + password, PBKDF2-SHA256 hashing (Web Crypto — no native
  bindings, so it runs on Workers), session cookies

## Project structure

```
app/
  (auth)/login, (auth)/register        Public auth pages
  (app)/accounts, transactions, stats  Authenticated pages (bottom-nav shell)
  api/                                 Route handlers (auth, accounts, transactions, categories, icons)
components/                            UI primitives + feature components, all styled to the design tokens
lib/                                   Cloudflare bindings, auth, balance math, formatting utils
db/schema.sql                          D1 schema
public/manifest.json, sw.js, icons/    PWA assets
wrangler.toml                          Cloudflare bindings (D1, R2, assets)
open-next.config.ts                    OpenNext Cloudflare config
.github/workflows/deploy.yml           Auto-deploy on push to main
```

## Local setup

**1. Install dependencies**

```bash
npm install
```

**2. Create your Cloudflare resources** (one-time, requires a free Cloudflare
account and `wrangler login`)

```bash
npx wrangler login
npx wrangler d1 create money-manager
npx wrangler r2 bucket create money-manager-icons
```

The `d1 create` command prints a `database_id` — paste it into `wrangler.toml`
in place of `REPLACE_WITH_YOUR_D1_DATABASE_ID`.

**3. Apply the database schema**

```bash
npm run db:schema          # local dev database
npm run db:schema:remote   # your real Cloudflare D1 (run once, before first deploy)
```

**4. Run it locally**

```bash
npm run dev
```

Visit `http://localhost:3000` — this uses `next dev` with local simulated D1/R2
bindings (via `initOpenNextCloudflareForDev`), so no deploy is needed to test.

## Deploying

**Option A — GitHub Actions (recommended, matches your original ask)**

1. Push this repo to GitHub.
2. In your GitHub repo settings → Secrets, add:
   - `CLOUDFLARE_API_TOKEN` — create one at Cloudflare dashboard → My Profile →
     API Tokens → use the "Edit Cloudflare Workers" template
   - `CLOUDFLARE_ACCOUNT_ID` — found on the right sidebar of any page in the
     Cloudflare dashboard
3. Push to `main`. The included workflow (`.github/workflows/deploy.yml`)
   builds and deploys automatically via `npm run deploy`.

**Option B — Deploy from your machine**

```bash
npm run deploy
```

Both run `opennextjs-cloudflare build` then `wrangler deploy` under the hood.

## How data and money are modeled

- All amounts are stored as **integers in minor units** (centavos) — e.g. ₱10.50
  is stored as `1050` — to avoid floating-point rounding bugs, standard
  practice for financial data.
- Every transaction (income, expense, or transfer) updates the relevant
  account balance(s) **atomically** via `D1.batch()`, so a balance and its
  transaction history can never drift apart, and editing or deleting a
  transaction correctly reverses its old effect before applying the new one.
- Account icons: uploaded images are resized/cropped to a 256×256 WebP in the
  browser before upload (via canvas), then stored in R2 at
  `icons/{user_id}/{account_id}.webp` and served through an authenticated
  route handler — not a public bucket URL.

## Known trade-offs / things to revisit

- **No offline transaction entry yet.** The service worker caches the app
  shell so it loads instantly and works while offline, but reads/writes still
  go straight to D1 — there's no local queue for offline-created transactions.
  Worth adding if you'll often be recording expenses with no signal.
- **Single currency display per account**, no cross-currency conversion.
  Fine for PHP-only use; would need an FX rate source to mix currencies.
- **`npm audit`** currently flags a moderate/high advisory in a version of
  `postcss` bundled *inside* Next.js's own dependency tree (used for its
  internal CSS tooling at build time, not for processing any user-supplied
  CSS at runtime) — practical risk to this app is low, but worth checking
  `npm audit` again after your next `npm install` as Next.js patches it
  upstream.
- **Editing an account's type** doesn't retroactively change its fallback icon
  color scheme — cosmetic only, no data issue.

## Extending it

- **Budgets**: add a `budgets` table (category_id, month, limit_minor) and a
  progress view on the Stats page — the category aggregation query is already
  there to build on.
- **Multi-currency**: accounts already carry a `currency` column; you'd need
  to either restrict stats/totals to same-currency accounts or add an FX rate
  table.
- **CSV export/import**: transactions are flat rows, so a CSV export is a
  straightforward addition to `/api/transactions`.
