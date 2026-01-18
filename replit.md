# One Breath Lab

## Overview
One Breath Lab is a NotebookLM-style AI research and learning assistant. Users can upload documents (text, URLs), have AI conversations grounded in their sources, and generate comprehensive courses from any topic. The platform features Google OAuth authentication, progress tracking with streaks, and AI-powered curriculum generation.

## Design System

### Art Direction
- **Style**: Paper.design minimalism - clean, editorial, grid-based
- **Mood**: Light, contemplative, understated elegance

### Typography
- **Font**: Inter with stylistic sets
- **Weights**: Regular (400), Medium (500)
- **Tracking**: Tight (-0.01em)
- **Icon style**: strokeWidth={1.5} for all lucide icons

### Color Palette
- **Background**: Light cream (`hsl(48 30% 94%)` / #F0EFE4)
- **Foreground**: Near black (`hsl(0 0% 12%)` / #1F1F1F)
- **Primary**: Black (`hsl(0 0% 12%)`) - buttons, actions
- **Card**: Pure white (`hsl(0 0% 100%)`)
- **Muted**: Light gray (`hsl(0 0% 96%)`)
- **Border**: Soft gray (`hsl(0 0% 88%)`)

### Visual Effects
- Dot grid pattern background (1px dots, 24px spacing, 8% opacity)
- Zero border-radius (sharp corners everywhere)
- Minimal shadows, prefer borders
- Subtle hover transitions (0.2s)

## Architecture

### Frontend (client/src/)

#### Pages
- `pages/Landing.tsx` - Public landing page with document-focused CTA
- `pages/Onboarding.tsx` - Learner questionnaire flow
- `pages/Dashboard.tsx` - Main user dashboard with course generation
- `pages/CourseView.tsx` - NotebookLM-style viewer with sources panel and AI chat

#### Components
- `components/Layout.tsx` - Main layout with navigation
- `components/ParticleField.tsx` - Interactive particle background
- `components/NotebookChat.tsx` - AI chat interface for document Q&A
- `components/SourcesPanel.tsx` - Document sources management panel
- `components/FocusTimer.tsx` - Study session timer
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
- `GET /api/sources/:notebookId` - Get sources for a notebook/course
- `POST /api/sources` - Add a source (text or URL)
- `DELETE /api/sources/:id` - Delete a source
- `GET /api/chat/:notebookId` - Get chat history
- `POST /api/chat` - Send message and get AI response
- `DELETE /api/chat/:notebookId` - Clear chat history

### Database Schema (shared/schema.ts)

#### Tables
- `users` - Auth users (managed by Replit Auth)
- `learner_profiles` - Level, learning style, goals, weekly hours
- `courses` - Generated courses with title, description, curriculum JSON
- `modules` - Course modules with content (no simulation code)
- `progress` - User progress per course/module
- `quizzes` - Module quizzes with options and answers
- `resources` - Curated papers, lectures, books
- `sources` - Uploaded documents/URLs for AI context
- `chat_messages` - AI conversation history
- `streaks` - Daily learning streaks

### AI Integration
- **Provider**: Anthropic Claude
- **Model**: `claude-sonnet-4-20250514` (latest)
- **API Key**: Server-side via ANTHROPIC_API_KEY secret
- **Features**: Source-grounded conversations, curriculum generation

## Core Features

1. **Authentication** - Google OAuth via Replit Auth
2. **Onboarding** - 4-step questionnaire (level, style, goals, time)
3. **Course Generation** - AI creates full curriculum from prompt
4. **Source Management** - Upload text content and URLs as research sources
5. **AI Chat** - Have conversations grounded in your uploaded sources
6. **Knowledge Checks** - AI-generated quizzes with explanations
7. **Resource Curation** - Papers, lectures, books per module
8. **Progress Tracking** - Module completion, time spent
9. **Focus Timer** - Study session timer for productivity
10. **Gamification** - Daily streaks with streak counters

## User Flow

1. Land on `/` → See landing page
2. Click "Sign in" → Google OAuth
3. (First time) → Redirect to `/onboarding`
4. Complete questionnaire → Save profile
5. Arrive at `/dashboard` → See courses, stats
6. Enter topic prompt → Generate course
7. Click course → View modules with sources panel and AI chat
8. Add sources → Upload documents or URLs for context
9. Chat with AI → Ask questions about your sources
10. Complete modules → Track progress, maintain streaks

## Tech Stack
- React 19 + TypeScript
- Tailwind CSS v4 with custom theme
- Framer Motion for animations
- Wouter for routing
- TanStack Query for data fetching
- Express.js backend
- PostgreSQL with Drizzle ORM
- Google Gemini API

## Recent Changes
- 2026-01-18: Transform to NotebookLM-style research assistant
- Removed all simulation features (p5.js, Matter.js, Three.js, D3.js)
- Added sources and chat_messages tables
- New NotebookChat and SourcesPanel components
- AI chat grounded in uploaded sources
- CourseView redesigned with split-panel layout
