# DevReps API

This is the backend for the [DevReps mobile app](https://github.com/zeyadkhaled2/devreps-mobile). It handles accounts, technical interview questions and feedback, practice history, streaks, and the Mentor chat.

The API uses **Express and TypeScript**, with **PostgreSQL and Prisma** for storage. Gemini generates questions when needed, evaluates answers, and replies in Mentor. The API also reuses questions from its saved question bank.

## Run it locally

You’ll need **Node 24**, a PostgreSQL database, and a Gemini API key.

1. Run `npm ci`.
2. Copy `.env.example` to `.env`.
3. Set the values below, then run the startup commands.

- `DATABASE_URL` is the connection string for your PostgreSQL database.
- `JWT_SECRET` is a long, randomly generated secret used to sign login tokens.
- `GEMINI_API_KEY` is the key used by the API to call Gemini.
- `PORT` is optional and defaults to `3000`.

```sh
npm run db:generate
npm run db:migrate
npm run dev
```

The default API base URL is `http://localhost:3000/api`. Use the address your device can reach when configuring the mobile app. Keep real credentials in `.env` or your hosting provider’s secret settings.

## API routes

Paths below are relative to `/api`. Register and login return a token. Send it as `Authorization: Bearer <token>` for the other routes.

- **Account** — `POST /auth/register`, `POST /auth/login`, `GET /auth/profile`, `PATCH /auth/profile/photo`
- **Interview practice** — `POST /questions/generate` and `POST /attempts`
- **History and progress** — `GET /attempts`, `GET /attempts/stats`, and `POST /streak/check-in`
- **Mentor** — `GET /chat/conversation` and `POST /chat/message`

The route and schema files in `src/modules/` describe the exact request fields. The JavaScript output puzzles and Data Structures Lab run in the mobile app.

## Where the code lives

- `src/modules/` groups routes and logic by feature.
- `src/integrations/gemini/` contains the prompts and Gemini client calls.
- `src/shared/` holds the Prisma client and authentication middleware.
- `prisma/` holds the database schema and migrations.

## Checks and production

Run `npm run check` for formatting, TypeScript, and regression tests. The tests mock Prisma and Gemini, so you can run them without live credentials. GitHub Actions also verifies that the API builds.

For production, run `npm run db:generate` and `npm run build`. Apply committed migrations with `npm run db:migrate` before running `npm start`. See the [development guide](docs/DEVELOPMENT.md) for module conventions and smoke tests.
