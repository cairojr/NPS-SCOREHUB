# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with hot reloading on port 8080
- `npm run build` - Build production bundle using Vite
- `npm run build:dev` - Build development bundle
- `npm run lint` - Run ESLint code linting
- `npm run preview` - Preview built application locally

## Project Architecture

ScoreHUB is a React-based NPS (Net Promoter Score) evaluation system built specifically for Grupo Donadel Guimarães with 19 companies. The application uses modern web technologies with TypeScript.

### Technology Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with SWC plugin for fast compilation
- **UI Components**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom theme extensions
- **Animations**: Framer Motion for smooth interactions
- **Routing**: React Router DOM v6
- **Data Management**: TanStack Query for state management
- **Theming**: next-themes for light/dark mode support
- **Charts**: Recharts for data visualization

### Application Structure

**Main Routes:**
- `/` - Landing page with company information and features
- `/evaluation` - NPS evaluation flow for customers
- `/login` - Admin authentication
- `/admin` - Protected admin dashboard with analytics

**Key Components:**
- `src/components/nps/` - NPS-specific components including gauges and score buttons
- `src/components/ui/` - Reusable shadcn/ui components
- `src/pages/` - Main application pages
- `src/hooks/` - Custom React hooks
- `src/lib/utils.ts` - Utility functions

### NPS Evaluation Flow
1. Company selection (19 predefined companies from Grupo Donadel Guimarães)
2. Score selection (0-10 scale with animated gauge visualization)
3. Demographics collection (gender, age, optional comments)
4. Success confirmation with evaluation summary

### Data Storage
- Uses localStorage for offline capability
- Evaluations stored with company, score, demographics, and timestamp
- Admin authentication state persisted in localStorage
- Company selection remembered between sessions

### Theme Configuration
- Custom NPS color scheme (detractor: red, passive: yellow, promoter: green)
- Sidebar colors for admin interface
- Custom gradient backgrounds and card shadows
- Extended Tailwind configuration with Inter font family

### Development Notes
- Vite server configured to run on all interfaces (`::`) at port 8080
- TypeScript strict mode disabled for flexibility (`noImplicitAny: false`)
- ESLint configured with React hooks and TypeScript rules
- Uses `@/` path alias for src directory imports
- Lovable tagger component included for development mode only

### Company List
The system supports 19 companies in the Grupo Donadel Guimarães network including gas stations (Posto Point/Tigre), healthcare facilities (Hospital, Clínicas, Laboratórios), and medical imaging centers (CIG, CINP).