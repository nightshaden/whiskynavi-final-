# WhiskyNavi Codex Instructions

## Project Context

- This repository is a WhiskyNavi web app using Next.js 16 App Router and React 19.
- Treat `CLAUDE.md` as the project runbook for build/test commands, architecture, and local conventions.
- Use Server Components by default for pages/layouts, and use `"use client"` only when client state, effects, browser APIs, or event handlers require it.
- Prefer Server Actions and App Router patterns for mutations and form workflows when they fit the existing code.

## Default Vercel Skill Lens

For any Codex request in this repository, including spec discussion, work planning, implementation, review, refactoring, debugging, and ordinary questions, proactively consider the following skills even when the user does not explicitly request them:

- `$vercel-react-best-practices`: apply when touching React components, Next.js pages/layouts, Server Components, data fetching, Server Actions, caching, bundle boundaries, Suspense, or performance-sensitive code. Pay special attention to avoiding request waterfalls, keeping client bundles small, minimizing RSC serialization, and using `startTransition` / `useDeferredValue` where appropriate.
- `$vercel-composition-patterns`: apply when designing or changing component APIs, reusable UI, providers, context boundaries, compound components, or components that risk boolean prop proliferation. Prefer composition and explicit variants over broad boolean-mode props. Account for React 19 APIs and conventions.
- `$vercel-react-view-transitions`: apply when discussing or implementing navigation animation, route transitions, shared element transitions, list reorder animation, enter/exit animation, or animated UI state changes. Use View Transitions only when they communicate continuity or spatial relationship; do not add animation without a clear purpose.

## How To Apply These Skills

- During spec discussion, surface relevant constraints from these skills as requirements or tradeoffs.
- During plan creation, include checks for applicable Vercel rules before proposing implementation steps.
- During execution, read the relevant rule/reference files before editing when the request touches the skill's domain.
- During review, use these skills as a default checklist for React/Next.js correctness, performance, component architecture, and transition behavior.
- Do not force all three skills into unrelated non-React tasks, but always evaluate whether a request in this repository has React/Next.js, component API, or transition implications.
