# One Breath Lab

A notebook-style AI learning assistant that turns any topic into a structured course with source-grounded chat, progress tracking, and study tools.

> Screenshot / demo: _Add screenshot or deployed demo link here._

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Wouter, TanStack Query
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL + Drizzle ORM
- **Auth:** OIDC via `openid-client` + Passport
- **AI:** Anthropic API

## Features

- OIDC authentication and persistent sessions
- AI-generated curriculum and module content
- Source management (text/URL) + source-grounded notebook chat
- Module quizzes, resources, and progress tracking
- Learning productivity features: streaks, goals, bookmarks, notes, flashcards
- Organization and sharing: folders, shared courses, certificates, custom quizzes

## Getting Started

### 1) Clone and install

```bash
git clone <your-repo-url>
cd 1-Lab
npm install
```

### 2) Configure environment

```bash
cp .env.example .env
```

Update `.env` with your own values.

### 3) Start development server

```bash
npm run dev
```

App runs on `http://localhost:5000` by default.

### 4) Type-check and build

```bash
npm run check
npm run build
npm run start
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | No | Runtime mode (`development` or `production`). |
| `PORT` | No | HTTP port for API + frontend server (default `5000`). |
| `APP_ORIGIN` | Recommended | Public origin used for auth callbacks/logout redirects. |
| `DATABASE_URL` | Yes | PostgreSQL connection string. |
| `SESSION_SECRET` | Yes | Secret for signing session cookies. |
| `OIDC_ISSUER_URL` | Yes | OIDC issuer discovery URL. |
| `OIDC_CLIENT_ID` | Yes | OIDC client ID for this application. |
| `ANTHROPIC_API_KEY` | Optional* | API key for AI-powered generation/chat features. |

\* Without `ANTHROPIC_API_KEY`, AI endpoints are unavailable but the app can still boot.

## Project Structure

```text
client/                 # React frontend
  src/
server/                 # Express API + auth + app server
  auth/                 # OIDC auth/session integration
shared/                 # Shared DB schema and types
script/                 # Build scripts
```

## Docker (Optional)

For local containerized setup:

```bash
docker compose up --build
```

This starts the app and a local PostgreSQL instance.

## Deployment

Deployment instructions are intentionally kept separate and can be added in a dedicated deployment guide.

## TODO / Known Follow-ups

- Add automated test coverage (unit + API integration tests).
- Add production-ready OIDC provider setup documentation (provider-specific examples).
- Consider deleting or archiving large design artifacts under `attached_assets/` if not needed in git history.

## License

MIT (see [LICENSE](./LICENSE)).
