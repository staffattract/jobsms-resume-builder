# Environment variables

Single reference for configuration. Values are read at runtime (build/runtime for `NEXT_PUBLIC_*`).

## Required for production

| Variable | Used for |
|----------|----------|
| `DATABASE_URL` | PostgreSQL connection string (`src/lib/db.ts`, `prisma.config.ts`). |
| `STRIPE_SECRET_KEY` | Stripe API (`src/lib/stripe/config.ts`). |
| `STRIPE_WEBHOOK_SECRET` | Verifying Stripe webhooks (`src/lib/stripe/config.ts`). |
| `STRIPE_PRICE_ONE_TIME_PDF` | One-time Checkout price id. |
| `STRIPE_PRICE_MONTHLY_SUB` | Subscription Checkout price id (recurring). |
| `STRIPE_PRICE_TRIAL_ONE_TIME` | One-time Stripe price id ($1) charged with subscription checkout before the trial. |
| `OPENAI_API_KEY` | AI features (`src/lib/ai/openai-provider.ts`). |

## Strongly recommended for production

| Variable | Used for |
|----------|----------|
| `NEXT_PUBLIC_APP_URL` | Canonical public URL (no trailing slash). Checkout success/cancel redirects (`src/lib/stripe/config.ts`). On Vercel, set explicitly; do not rely only on `VERCEL_URL` for custom domains. |

## Optional

| Variable | Used for |
|----------|----------|
| `OPENAI_MODEL` | Overrides default model (`src/lib/ai/config.ts`). |
| `PUPPETEER_EXECUTABLE_PATH` | Custom Chromium for PDF generation in constrained hosts (Docker, etc.) (`src/lib/resume/render-pdf.ts`). |
| `VERCEL_URL` | Fallback base URL when `NEXT_PUBLIC_APP_URL` is unset (Vercel deployments only). |

## Automatic / not set manually

| Variable | Notes |
|----------|--------|
| `NODE_ENV` | `production` or `development`; set by the runtime. Affects cookie `secure`, logging verbosity, dev-only routes. |

## Local vs production

- **Local dev**: Use `.env.local` (gitignored). `NEXT_PUBLIC_APP_URL` can be `http://localhost:3000` for correct Stripe redirects.
- **Production**: Set all required vars in the host (Vercel, etc.). Never commit secrets.
- **Stripe**: Use test keys and test price ids in development; live keys and live price ids only in production.

## Prisma

`prisma.config.ts` reads `DATABASE_URL` for migrations and CLI. The schema does not duplicate the URL (Prisma 7 style).

The client is generated into **`src/generated/prisma`** (gitignored). Imports use **`@/generated/prisma/client`**, matching the generated `client.ts`. **`npm install`** runs **`prisma generate`** via `postinstall`; **`npm run build`** runs it again before `next build` so CI (e.g. Vercel) never compiles without a client.
