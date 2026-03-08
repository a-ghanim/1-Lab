# One Breath Lab

AI-powered learning platform that turns any topic into a structured course with chat, quizzes, and progress tracking.

<!-- Add a screenshot or demo link here -->

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Wouter, TanStack Query
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL, Drizzle ORM
- **Auth:** OIDC via openid-client + Passport
- **AI:** Anthropic Claude API

## Features

- AI-generated curriculum and module content from any topic prompt
- Source-grounded notebook chat (add text or URLs as context)
- Module quizzes, resources, and detailed progress tracking
- Spaced-repetition flashcards with SM-2 algorithm
- Focus timer, streaks, achievements, and weekly learning goals
- Course sharing via public links and completion certificates
- Folders, bookmarks, and notes for organization
- Light/dark theme

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd 1-Lab
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in your `.env` values (see table below).

### 3. Set up the database

```bash
npm run db:push
```

### 4. Start development server

```bash
npm run dev
```

The app runs on [http://localhost:5000](http://localhost:5000).

### 5. Type-check and build

```bash
npm run check
npm run build
npm run start
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | No | `development` or `production` |
| `PORT` | No | Server port (default `5000`) |
| `APP_ORIGIN` | Recommended | Public origin for auth callbacks/redirects |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | Secret for signing session cookies |
| `OIDC_ISSUER_URL` | Yes | OIDC issuer discovery URL |
| `OIDC_CLIENT_ID` | Yes | OIDC client ID |
| `ANTHROPIC_API_KEY` | Optional | API key for AI features (app boots without it) |

## Project Structure

```
client/           # React frontend (Vite)
  src/
    components/   # UI and feature components
    pages/        # Route pages
    hooks/        # Custom React hooks
    lib/          # Utilities and API client
server/           # Express API server
  auth/           # OIDC authentication
shared/           # Database schema and shared types
script/           # Build scripts
```

## Docker

```bash
docker compose up --build
```

Starts the app and a local PostgreSQL instance.

## Deployment

Deployment instructions can be added in a separate guide.

## License

MIT (see [LICENSE](./LICENSE)).
