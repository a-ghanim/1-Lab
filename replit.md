# One Breath Lab

## Overview
One Breath Lab is an AI-powered learning management system that "spawns a school from a prompt." Users authenticate via Google, complete a learner questionnaire, then generate custom curricula from any topic. The platform provides interactive p5.js simulations, AI-generated quizzes, curated resources, and progress tracking with streaks.

## Design System

### Art Direction
- **Style**: Paper.design minimalism + Micro.so dreamy aesthetic
- **Mood**: Clean, contemplative, elevated

### Typography
- **Font**: Inter with stylistic sets
- **Weights**: Regular (400), Medium (500), Semibold (600)
- **Tracking**: Tight (-0.01em)

### Color Palette
- **Background**: Deep charcoal (`hsl(0 0% 8%)` / #151515)
- **Foreground**: Cream white (`hsl(48 30% 94%)` / #F0EFE4)
- **Primary**: Cream (`hsl(48 30% 90%)`) - main actions
- **Accent**: Soft purple (`hsl(280 60% 65%)`) - highlights
- **Muted**: Dark gray (`hsl(0 0% 16%)`) - secondary surfaces

### Visual Effects
- Subtle glass morphism with blur
- Gradient backgrounds for hero sections
- Smooth hover transitions (0.2-0.3s)
- Card hover lift effects

## Architecture

### Frontend (client/src/)

#### Pages
- `pages/Landing.tsx` - Public landing page with login CTA
- `pages/Onboarding.tsx` - Learner questionnaire flow
- `pages/Dashboard.tsx` - Main user dashboard with course generation
- `pages/CourseView.tsx` - Course viewer with modules, simulations, quizzes
- `pages/Home.tsx` - Original lab page (standalone simulation generator)

#### Components
- `components/Layout.tsx` - Main layout with navigation
- `components/ParticleField.tsx` - Interactive particle background
- `components/SimulationRunner.tsx` - p5.js canvas runner
- `components/CursorGlow.tsx` - Custom cursor effect

### Backend (server/)

#### Auth
- `replit_integrations/auth/` - Replit Auth with Google OIDC
- Session-based authentication with PostgreSQL session store

#### API Routes (server/routes.ts)
- `GET /api/profile` - Get learner profile
- `POST /api/profile` - Create/update learner profile
- `GET /api/courses` - List user's courses
- `GET /api/courses/:id` - Get course details
- `GET /api/courses/:id/modules` - Get course modules
- `POST /api/courses/generate` - Generate new course from prompt
- `GET /api/modules/:id/quizzes` - Get module quizzes
- `GET /api/modules/:id/resources` - Get module resources
- `GET /api/streak` - Get user streak data
- `POST /api/streak/update` - Update streak
- `POST /api/generate` - Generate p5.js simulation
- `POST /api/generate-stream` - SSE streaming generation

### Database Schema (shared/schema.ts)

#### Tables
- `users` - Auth users (managed by Replit Auth)
- `learner_profiles` - Level, learning style, goals, weekly hours
- `courses` - Generated courses with title, description, curriculum JSON
- `modules` - Course modules with content, simulation code
- `progress` - User progress per course/module
- `quizzes` - Module quizzes with options and answers
- `resources` - Curated papers, lectures, books
- `uploads` - User document uploads
- `streaks` - Daily learning streaks

### AI Integration
- **Provider**: Google Gemini
- **Models**: 
  - `gemini-2.5-flash` - Fast generation (simulations)
  - `gemini-2.5-pro` - Complex reasoning (curriculum)
- **API Key**: Server-side via GEMINI_API_KEY secret

## Core Features

1. **Authentication** - Google OAuth via Replit Auth
2. **Onboarding** - 4-step questionnaire (level, style, goals, time)
3. **Course Generation** - AI creates full curriculum from prompt
4. **Interactive Simulations** - p5.js visualizations in each module
5. **Knowledge Checks** - AI-generated quizzes with explanations
6. **Resource Curation** - Papers, lectures, books per module
7. **Progress Tracking** - Module completion, time spent
8. **Gamification** - Daily streaks with streak counters

## User Flow

1. Land on `/` → See landing page
2. Click "Sign in" → Google OAuth
3. (First time) → Redirect to `/onboarding`
4. Complete questionnaire → Save profile
5. Arrive at `/dashboard` → See courses, stats
6. Enter topic prompt → Generate course
7. Click course → View modules, simulations, quizzes
8. Complete modules → Track progress, maintain streaks

## Tech Stack
- React 19 + TypeScript
- Tailwind CSS v4 with custom theme
- Framer Motion for animations
- Wouter for routing
- TanStack Query for data fetching
- Express.js backend
- PostgreSQL with Drizzle ORM
- Google Gemini API
- p5.js via CDN for simulations

## Recent Changes
- 2026-01-18: Full LMS rebuild with auth, courses, curriculum generation
- New design system: Paper.design + Micro.so aesthetic
- Database schema: 8 tables for full LMS
- Protected routes with session-based auth
- AI curriculum generator with modules, quizzes, resources
