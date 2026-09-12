# AI Developer Companion — Backend

A TypeScript/Express REST API powering **AI Developer Companion**, a mobile app that helps developers prepare for technical interviews with AI-generated practice questions, AI-scored feedback, and a conversational AI mentor.

## Features

- 🔐 **JWT Authentication** — secure registration/login with bcrypt password hashing and protected routes
- 🤖 **AI Question Generation** — generates realistic technical interview questions via Google Gemini, with a growing, reusable question bank to reduce redundant AI calls
- 📝 **AI Answer Evaluation** — scores user answers (0–100) with structured, constructive feedback
- 📊 **Progress Analytics** — aggregated stats (average score, performance by category) for the user's practice history
- 💬 **AI Chat Mentor** — multi-turn conversational assistant with persisted chat history for open-ended interview prep questions
- 🛡️ Graceful handling of AI provider rate limits (429s surfaced clearly rather than failing silently)

## Tech Stack

- **Runtime/Language:** Node.js, TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL (hosted on [Neon](https://neon.tech)), via **Prisma ORM**
- **Auth:** JWT (jsonwebtoken), bcrypt
- **AI:** Google Gemini API (`gemini-3.5-flash`)
- **Validation:** Zod

## Architecture

The codebase follows a layered architecture — controllers handle HTTP concerns only, services hold business logic and are framework-agnostic, keeping the code testable and easy to navigate:

```
src/
├── controllers/   # HTTP request/response handling
├── services/      # Business logic, AI calls, DB queries
├── routes/        # Express route definitions
├── middleware/     # JWT auth middleware
├── types/         # Zod schemas + TypeScript types
prisma/
└── schema.prisma  # Database schema (User, Question, Attempt, Conversation, Message)
```

## API Overview

| Method | Endpoint                | Description                          | Auth |
|--------|--------------------------|---------------------------------------|------|
| POST   | `/api/auth/register`     | Create a new account                  | No   |
| POST   | `/api/auth/login`        | Log in, receive a JWT                 | No   |
| GET    | `/api/auth/profile`      | Get current user's profile            | Yes  |
| POST   | `/api/questions/generate`| Get an AI-generated or reused question| Yes  |
| POST   | `/api/attempts`          | Submit an answer for AI evaluation    | Yes  |
| GET    | `/api/attempts`          | Get the user's attempt history        | Yes  |
| GET    | `/api/attempts/stats`    | Get aggregated performance stats      | Yes  |
| POST   | `/api/chat/message`      | Send a message to the AI mentor       | Yes  |

## Getting Started

### Prerequisites
- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database (or any Postgres instance)
- A free [Google Gemini API key](https://aistudio.google.com)

### Setup

```bash
git clone <this-repo-url>
cd ai-dev-companion-backend
npm install
```

Create a `.env` file in the root:
```env
DATABASE_URL="your-postgres-connection-string"
JWT_SECRET="your-random-secret-string"
GEMINI_API_KEY="your-gemini-api-key"
```

Run database migrations:
```bash
npx prisma migrate dev
```

Start the dev server:
```bash
npm run dev
```

The API will be running at `http://localhost:3000`.

## Design Decisions Worth Noting

- **Question bank with reuse strategy** — rather than calling the AI for every single question request, the app checks for existing questions matching the requested category/difficulty first, generating a new one ~30% of the time once a healthy bank exists. This reduces AI costs/latency while keeping the question pool fresh over time.
- **No pre-stored "correct answers"** — answers are evaluated contextually by the AI at submission time rather than matched against a canonical answer, since many interview questions have multiple valid correct answers.
- **Provider-agnostic message roles** — chat messages are stored as `user`/`assistant` in the database (not `user`/`model`, which is Gemini-specific), translated only at the point of calling the AI — keeping the data model decoupled from a specific AI vendor.

## Related Repo

The React Native (Expo) frontend for this project lives at: `<link to frontend repo>`
