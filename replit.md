# One Breath Lab

## Overview
One Breath Lab is an Awwwards-worthy interactive educational platform that transforms scientific concepts into beautiful p5.js simulations. Users can type any scientific or philosophical concept and instantly get an interactive visualization plus challenge questions.

## Design System

### Art Direction
- **Style**: Digital Observatory / Space Lab aesthetic
- **Mood**: Futuristic, contemplative, scientific wonder

### Typography
- **Display**: Space Grotesk - Bold, modern, geometric
- **Body**: Inter - Clean, highly readable

### Color Palette
- **Background**: Deep space black (`hsl(225, 25%, 3%)`)
- **Primary**: Vibrant teal (`hsl(175, 100%, 50%)`) - main actions, glows
- **Accent**: Electric purple (`hsl(280, 100%, 70%)`) - secondary emphasis
- **Muted**: Cool gray (`hsl(225, 10%, 55%)`)

### Visual Effects
- Glass morphism containers with backdrop blur
- Particle field background with mouse interaction
- Cursor glow effect (desktop only)
- Floating gradient orbs
- Animated scanlines on simulation canvas
- Micro-interactions on all interactive elements

## Architecture

### Frontend (client/src/)
- `pages/Home.tsx` - Main application page
- `components/ParticleField.tsx` - Interactive particle background
- `components/SimulationRunner.tsx` - p5.js canvas runner
- `components/CursorGlow.tsx` - Custom cursor effect
- `lib/generator.ts` - AI simulation generator logic
- `lib/p5-examples.ts` - Hardcoded demo simulations

### Core Features
1. **Concept Input** - Large search-style input with glass morphism
2. **Instant Generation** - Demo mode for Black Holes, Photosynthesis, Pendulum
3. **AI Mode** - OpenAI integration for unlimited concepts (user provides key)
4. **Interactive Simulation** - p5.js canvas with live graphics
5. **Challenge Questions** - 3 questions with instant feedback
6. **Code Transparency** - Collapsible source code view
7. **Shareable Links** - URL query params for sharing

### Tech Stack
- React 19 + TypeScript
- Tailwind CSS v4
- Framer Motion for animations
- p5.js via CDN for simulations
- OpenAI SDK for AI generation

## User Preferences
- Dark mode by default
- Awwwards-worthy aesthetics prioritized
- Interactive and educational focus

## Recent Changes
- 2026-01-18: Initial build with Awwwards-level design
- Added particle field background with mouse interaction
- Implemented cursor glow effect for desktop
- Glass morphism design system
- Smooth Framer Motion animations throughout
