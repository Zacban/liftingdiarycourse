# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## IMPORTANT: Documentation First

**Before generating any code**, always check the `/docs` directory for relevant documentation files and follow their guidance. The `/docs` directory contains specifications, conventions, and patterns that ALL generated code must adhere to. Never skip this step — docs take precedence over default assumptions.

## Commands

```bash
npm run dev      # Start dev server (Next.js with Turbopack)
npm run build    # Production build
npm run lint     # ESLint
```

## Stack

- **Next.js 16** with App Router (`src/app/`)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4** (via `@tailwindcss/postcss`)
- Fonts: Geist Sans and Geist Mono via `next/font/google`

## Architecture

This is a fresh Next.js App Router project. All routes live under `src/app/`. The root layout (`src/app/layout.tsx`) sets up fonts and a full-height flex column body. Global styles are in `src/app/globals.css`.

No database, auth, or API routes exist yet — this is the starting scaffold for a lifting diary application.
