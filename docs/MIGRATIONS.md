# Prisma migrations — ordering note and forward path

## Current ordering issue

Migration folders are applied in **lexicographic order** by name:

1. `20260416120000_pdf_entitlements` — `ALTER TABLE "User"` (entitlement columns)
2. `20260416140000_stripe_billing` — `ALTER TABLE "User"` (Stripe columns) + `ProcessedStripeEvent`
3. `20260417003326_init` — **creates** `User`, `Session`, `Resume` from scratch

On a **completely empty** database, step 1 fails because `"User"` does not exist yet. The **baseline schema** is in the migration that runs **last**, which is the opposite of the usual “init first, then alters” story.

**Existing production databases** that already have tables and columns are unaffected as long as migrations were applied in an order that matched reality (e.g. schema pushed first, or manual steps). **Do not rewrite applied migration history** on production without a coordinated plan.

## Going forward (predictable migrations)

1. **New changes**: Add a **new** migration folder with a timestamp **after** the latest existing one (e.g. after `20260417003326_*`). Keep migrations **additive** when possible (`ALTER TABLE ... ADD`, new tables, new enums).
2. **Deploy**: Run `npx prisma migrate deploy` in CI/CD against the target database.
3. **Greenfield databases**: Until history is consolidated (optional future work), prefer **`npx prisma db push`** for local throwaway DBs, or create the database from a known-good backup/snapshot rather than relying on `migrate deploy` from zero without intervention.

## Optional future cleanup (high coordination)

- Squash or reorder migrations in a **maintenance window** with backups, using `prisma migrate resolve` and documented steps — only if the team needs a single linear baseline for new environments. This document does **not** prescribe that operation; it risks data if done wrong.

## Lockfile

`prisma/migrations/migration_lock.toml` pins provider `postgresql` — keep it in version control.
