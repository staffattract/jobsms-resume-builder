# Environment variables

Single reference for configuration. Values are read at runtime (build/runtime for `NEXT_PUBLIC_*`).

**Central helpers** (consistent error shapes):

| Helper | Location |
|--------|-----------|
| `requireEnv(name)` · `optionalEnvTrim(name)` | `src/lib/env/server.ts` |
| Stripe secret key, webhook secret, checkout price ids, `getAppBaseUrl()` | `src/lib/stripe/config.ts` |
| `getOpenAiApiKey()` · `resolveOpenAIModel()` | `src/lib/ai/config.ts` |

---

## Required for production — app runtime (`src/lib`)

| Variable | Validation | Used for |
|----------|-------------|----------|
| `DATABASE_URL` | **`requireEnv` on first Prisma access** (`src/lib/db.ts`) | PostgreSQL via Prisma adapter. |
| `STRIPE_SECRET_KEY` | `getStripeSecretKey()` (`requireEnv`) | Stripe SDK (`src/lib/stripe/client.ts`). |
| `STRIPE_WEBHOOK_SECRET` | **`getStripeWebhookSecret()` — webhook route returns 503 JSON if missing** | Webhook signature verification (`src/app/api/stripe/webhook/route.ts`). |
| `STRIPE_PRICE_ONE_TIME_PDF` | `getStripePriceOneTimePdf()` | One-time Checkout (`checkout` route, webhook entitlement). |
| `STRIPE_PRICE_MONTHLY_SUB` | `getStripePriceMonthlySubscription()` | Subscription Checkout + entitlement checks. |
| `STRIPE_PRICE_TRIAL_ONE_TIME` | **`getStripePriceTrialOneTime()` — subscription Checkout validates all Stripe price vars before Stripe API call; 503 `STRIPE_CONFIG_INCOMPLETE` if missing** | Subscription Checkout first line item. |
| `OPENAI_API_KEY` | **`getOpenAiApiKey()` (`requireEnv`)** | AI provider bootstrap (`src/lib/ai/openai-provider.ts`). |

## Employment Alert job search (RSS/XML feed — server-side)

Set these when **`GET /api/jobs/search`** and related tracking routes should reach the vendor feed:

| Variable | Validation | Used for |
|---------|-------------|----------|
| `JOB_API_BASE_URL` | **`requireEnv` in jobs config** (`src/lib/jobs/config.ts`) — full script URL **before** query (path usually ends with `.php`), no trailing slash. | Base endpoint for search requests. |
| `JOB_API_PID` | **`requireEnv`** | Partner **`pid`** query parameter. |
| `JOB_API_AFF_ID` | **`requireEnv`** | **`aff_id`** query parameter. |
| `JOB_API_SUB_ID` | **`requireEnv`** | **`sub_id`** query parameter. |
| `JOB_API_SITE_ID` | **`requireEnv`** | **`siteid`** query parameter. |

If these are unset, **`/api/jobs/search`** responds with **`503`** and code **`JOBS_API_NOT_CONFIGURED`**. Responses are parsed as XML with **`fast-xml-parser`** (`src/lib/jobs/employment-alert-client.ts`). Job identity for storage is **`JOB/id`**, never the **`id`** encoded inside **`JOB/url`**.

Authenticated users also use **`POST /api/jobs/click`** (visit tracking), **`POST /api/jobs/status`** (saved / applied / ignored), persisted in **`JobInteraction`** (see Prisma migrations).

## Prisma CLI / migrations (`prisma.config.ts`)

| Variable | Notes |
|----------|--------|
| `DATABASE_URL` | Read directly by **`prisma.config.ts`** for `migrate` / introspect — must be present when running Prisma CLI; Prisma will error if unset. |

## Strongly recommended for production

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_APP_URL` | Canonical public URL (no trailing slash). Checkout success/cancel, email reset/verify links primarily use this (`getAppBaseUrl` / email module). On Vercel with a **custom domain**, set explicitly. |

---

## Transactional email (Resend)

| Variable | Behavior |
|----------|----------|
| `RESEND_API_KEY` | If missing or **`EMAIL_FROM`** missing → outbound email **skipped** (`send*` returns `{ ok: false }`); **`console.warn` once** that Resend is disabled. |
| `EMAIL_FROM` | Resend-validated **from** address. |

Transactional link builders (`password reset`, `confirm email`) prefer **`NEXT_PUBLIC_APP_URL`**, then optional **`APP_URL`**, then **`VERCEL_URL`**. If none resolve, URLs are **`null`** and a **one-time `console.warn`** explains that links cannot be built.

---

## Admin analytics gate

| Variable | Behavior |
|----------|----------|
| `ADMIN_ANALYTICS_EMAIL` | **Optional.** If unset or empty → **`isAdminAnalyticsAuthorized` is always false** for privileged admin routes: nobody matches by accident. **`/admin`** access requires signing in **and** matching this exact email (case-insensitive equality only). Omit in production unless you intend to use the dashboard. Implemented in **`src/lib/auth/admin-access.ts`**. |

---

## Optional

| Variable | Used for |
|----------|-----------|
| `OPENAI_MODEL` | Overrides default model (`src/lib/ai/config.ts`). |
| `APP_URL` | Server-side URL fallback when building email links (`src/lib/email/resend-send.ts`). |
| `VERCEL_URL` | Fallback deploy host for `getAppBaseUrl()` and email bases on Vercel. |
| `PUPPETEER_EXECUTABLE_PATH` | Custom Chromium for PDF (`src/lib/resume/render-pdf.ts`). |
| `PDF_USE_PACKAGED_CHROMIUM` | Prefer packaged Chromium bundle in constrained hosts (`render-pdf.ts`). |
| `VERCEL`, `AWS_EXECUTION_ENV` | Runtime detection for Chromium strategy (`render-pdf.ts`). |

## Automatic / not set manually

| Variable | Notes |
|----------|--------|
| `NODE_ENV` | `production` or `development`; affects cookie **`secure`** (`src/lib/auth/session.ts`). |

---

## Operational API responses (Stripe)

- **Checkout** **`POST /api/stripe/checkout`**: if required Stripe price env vars cannot be resolved, response **`503`** with **`code`: `STRIPE_CONFIG_INCOMPLETE`** (before `checkout.sessions.create`).
- **Webhook** **`POST /api/stripe/webhook`**: if **`STRIPE_WEBHOOK_SECRET`** is missing → **`503`** with **`code`: `STRIPE_WEBHOOK_UNCONFIGURED`**.

---

## Local vs production

- **Local dev**: Use `.env.local` (gitignored). **`NEXT_PUBLIC_APP_URL`** can be `http://localhost:3000`.
- **Production**: Set all runtime-required vars on the host. Never commit secrets.
- **Stripe**: Test keys / test price IDs in development; live in production only.

---

## Prisma note

The client is generated into **`src/generated/prisma`** (gitignored). **`npm install`** runs **`prisma generate`** via `postinstall`; **`npm run build`** runs it again before `next build` so CI builds include the client.
