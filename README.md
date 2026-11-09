# AI Developer Companion API

Express 5 + TypeScript API for interview practice, scored feedback, progress tracking, and a persistent Gemini mentor. PostgreSQL is the source of truth; Prisma manages the schema.

## Run locally

Use Node 24 (also used by CI).

1. Run `npm ci`.
2. Copy `.env.example` to `.env` and set `DATABASE_URL`, `JWT_SECRET`, and `GEMINI_API_KEY`. Never commit real secrets.
3. Run `npm run db:generate` then `npm run db:migrate` to apply committed migrations to your development database.
4. Run `npm run dev`. The API listens on port 3000 by default.

For production: `npm run build`, then `npm start`. Set environment variables in the hosting service. Deploy migrations explicitly before starting the new version; application startup does not change the schema.

## Project map

```text
src/
  server.ts                 Environment loading, listener, shutdown
  app.ts                    Express middleware and route composition
  modules/
    auth/                   Login, registration, profile and photo endpoints
    practice/               Question generation and question-bank reuse
    attempts/               Answer evaluation, history and statistics
    chat/                   Conversation restoration and message handling
  integrations/gemini/      Provider calls and prompts
  shared/
    database/prisma.ts      The shared Prisma client
    middleware/             Authentication
prisma/                     Schema and versioned migrations
tests/                      Node regression tests with mocked dependencies
docs/DEVELOPMENT.md          Extension guide and manual checks
```

Each module colocates its routes, controller, service, and validation schema where needed. Routes declare HTTP paths; controllers translate requests and responses; services own domain operations. Auth currently queries Prisma in its controller as well as using a credential service. Keep this small structure rather than adding empty abstraction layers.

## API

All protected requests use `Authorization: Bearer <token>`.

- `POST /api/auth/register`: name, email, password, optional photo; returns token and profile.
- `POST /api/auth/login`: email and password; returns token and profile.
- `GET /api/auth/profile`: current user.
- `PATCH /api/auth/profile/photo`: bounded JPEG data URL, or `null` to remove.
- `POST /api/questions/generate`: category and difficulty.
- `POST /api/attempts`: question ID and answer; evaluates and persists feedback.
- `GET /api/attempts`: authenticated user's history.
- `GET /api/attempts/stats`: authenticated user's aggregates.
- `GET /api/chat/conversation`: latest nonempty conversation.
- `POST /api/chat/message`: message and optional conversation ID.

Read each module's routes and schemas for exact request fields. Categories are React, Node, JavaScript, HR and SQL; difficulty is Easy, Medium or Hard.

## Checks

- `npm run check`: formatting, TypeScript, and regression tests.
- `npm run format`: format maintained source and tests.
- `npm run build`: compile to `dist/`.

GitHub Actions runs checks and the build on pushes and pull requests. Tests mock Prisma and Gemini; they do not need live credentials or consume AI quota. They cover chat ownership/order/failure and profile-photo validation/ownership. They are not a substitute for a live API smoke test.

[Mobile repository](https://github.com/zeyadkhaled2/ai-companion-dev-frontend)
