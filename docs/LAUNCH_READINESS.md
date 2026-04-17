# Launch readiness (concise)

Review before pointing a production domain at the app. Not exhaustive — verify in your environment.

## Billing (Stripe)

- [ ] Live `STRIPE_SECRET_KEY`, live webhook signing secret, live **recurring** price id for subscription and correct **one-time** price id.
- [ ] Stripe Dashboard: webhook endpoint URL correct; events subscribed (e.g. `checkout.session.completed`, subscription lifecycle as implemented in `src/lib/stripe/`).
- [ ] `NEXT_PUBLIC_APP_URL` matches the public site (Checkout return URLs).

## Entitlements

- [ ] Webhook processing updates `User` pdf tier / credits / subscription end as expected (test mode → live mode dry run).
- [ ] `GET /api/me/entitlements` reflects purchases after webhook (latency acceptable).

## PDF

- [ ] Puppeteer/Chromium runs in the deployment environment (memory, `PUPPETEER_EXECUTABLE_PATH` if using custom Chrome).
- [ ] Letter PDF output acceptable; load tested for timeouts.

## Auth

- [ ] Session cookie `secure` in production (`NODE_ENV=production`).
- [ ] Login and protected routes behave behind HTTPS.
- [ ] Password/session policies acceptable for launch.

## UI / product

- [ ] Paywall and checkout flows tested end-to-end in **live** Stripe (small real charge or Stripe test clock as appropriate).
- [ ] No reliance on dev-only routes in production (`/api/dev/*` is disabled when `NODE_ENV === "production"`).

## Data / migrations

- [ ] Production DB backups scheduled.
- [ ] Understand `docs/MIGRATIONS.md` — greenfield `migrate deploy` order may need a documented workaround; existing DBs already migrated are fine.

## Remaining blockers (fill in per deploy)

- Confirm **OpenAI** quota and error handling under load.
- Confirm **database** connection limits and Prisma adapter behavior under serverless concurrency (if applicable).
