# API development guide

## Request flow

`server.ts` loads environment configuration before importing the application. `app.ts` mounts modules under `/api`. Authentication middleware assigns `req.userId`. A controller validates input and selects a response; a service performs database/provider work. Gemini code is isolated under `integrations/gemini`.

Import the shared `prisma` client. Do not instantiate clients in individual features. Scope user-owned queries by the authenticated user ID; never trust a body-supplied user ID. Persist related writes transactionally when they must succeed together.

The profile controller is intentionally small and still owns its profile queries. Extract them into its service when adding more account operations, rather than introducing a generic repository layer now.

## Schema changes

1. Edit `prisma/schema.prisma`.
2. On a development database, run `npx prisma migrate dev --name <change>`.
3. Commit the generated SQL and schema together. Never rewrite an already deployed migration.
4. Generate the client and run `npm run check` plus `npm run build`.
5. Deploy committed migrations with `npm run db:migrate` in the target environment.

Use a separate development database. Tests mock Prisma and do not validate migration execution or real database constraints.

## Extending the API

Keep routes, controllers, services, and Zod schemas within the owning module. Register a new module in `app.ts`. Preserve response shapes consumed by the mobile feature API. When changing a contract, update both repositories and document the rollout order.

Keep prompts and provider response parsing in the Gemini integration. Review prompt changes separately from mechanical formatting. Failed chat turns must not be written as delivered messages; conversation ownership must be checked before contacting the provider.

## Verification

`npm run check` runs formatting, strict TypeScript, and the Node regression suite. `npm run build` checks production output. Test adapters isolate database/provider effects; update import mock paths when relocating source files.

For a live smoke test: start with a dedicated development database, register/login, fetch profile/history/stats, test photo add/remove, and restore a conversation. Generating questions, evaluating answers, and sending mentor messages can consume Gemini quota.

## Operational boundaries

PostgreSQL is required. No background job queue or automatic migration on startup. Photos are bounded data URLs stored on the user record. This app does not yet provide a production rate-limiting or abuse-prevention layer; deployment hardening should be a separate reviewed change. Keep secrets outside Git and use the hosting service's environment settings.
