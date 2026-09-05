# Submission

Fill this in and commit it. This is the first file we open.

## Links

- **GitHub repository:** https://github.com/Amritaporsiya/hearth-property-management
- **Live application:** https://hearth-property-management.onrender.com

## Notes for the reviewer

The repository includes seeded data and can be run locally with `pnpm install && pnpm dev`. The live application uses Render's free service, which sleeps when idle; allow up to a minute for its first response. Its SQLite filesystem is ephemeral, so service replacement may restore the original seeded demo data.

## Demo credentials

| Role | Email | Password |
|------|-------|----------|
| Property manager | manager@hearth.test | DemoPass123! |
| Maintenance contractor | alex@hearth.test | DemoPass123! |
| Maintenance contractor | sam@hearth.test | DemoPass123! |

## Stack

| Layer | What you used | Why |
|-------|---------------|-----|
| Frontend | Server-rendered semantic HTML and custom responsive CSS | Fast, accessible workflows without SPA state duplication |
| Backend | Node.js 24, TypeScript, Express, Zod | One deployable service with server-side authorization and validation |
| Database | SQLite through Node's built-in driver | Relational constraints with zero external setup for the demo |
| Hosting | Docker on Render's free web-service tier | Reproducible build with secrets supplied as environment variables |

## Goal checklist

Mark each honestly. Partial is fine — say what is partial.

| # | Goal | Status | Notes |
|---|------|--------|-------|
| 1 | Accounts and roles | Done | Session login; manager and contractor boundaries enforced by middleware and query scopes |
| 2 | Units | Done | Create, edit, archive/restore, history-preserving unit details, and payments |
| 3 | Maintenance requests | Done | Unit ownership, description/priority editing, dual-role creation |
| 4 | Lifecycle rules | Done | Explicit transition graph and Scheduled assignment precondition, tested server-side |
| 5 | Assignment | Done | Many-to-many assignment controlled only by managers; contractor work list is scoped |
| 6 | Finding requests | Done | Server search, five filter/sort controls, pagination, and total count |
| 7 | Bulk rent and CSV | Done | Transactional batch entry with per-row classification and current rent-roll export |
| 8 | Dashboard | Done | Four headlines, two breakdowns, and an eight-week resolved chart |
| 9 | Immutable history | Done | Unified timeline plus database triggers preventing update/delete |
| 10 | Rent alerts | Done | Grace-period query, nav badge, monthly dismissal key, and later-month recurrence |

## How much time did you actually spend?

Approximately 12 hours, including planning, implementation, automated testing, documentation, deployment, and production verification.

## What would you do next, with another 12 hours?

Move persistence and sessions to managed PostgreSQL/Redis, add CSRF tokens, introduce browser-level accessibility tests, add payment correction/refund records, and create a manager workflow for contractor-created unassigned requests.

## What are you least happy with in this codebase, and why?

The server-rendering layer is intentionally compact for the timebox, but several route handlers combine query orchestration and HTML composition. I would extract typed repositories and view components next. SQLite also makes local review excellent but is less suitable than managed PostgreSQL for horizontally scaled hosting.
