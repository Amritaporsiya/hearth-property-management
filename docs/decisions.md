# Decisions

This is a live decision log. Entries are updated as implementation evidence changes the trade-offs.

## Decision 1 — One deployable service

- **Chose:** A server-rendered TypeScript application with Express.
- **Rejected:** Separate React SPA and REST API deployments.
- **Why:** One service removes CORS, duplicated validation plumbing, and a second deployment from a 12-hour project while keeping all filtering and permissions server-side.

## Decision 2 — Relational persistence

- **Chose:** Node's built-in SQLite driver, with foreign keys and explicit transactions enabled.
- **Rejected:** In-memory objects and a document database.
- **Why:** Payments, assignment joins, monthly records, and append-only events benefit from relational constraints. SQLite makes the demo reproducible locally and the SQL remains portable enough for a later PostgreSQL migration.
- **Later reversed:** I first chose `better-sqlite3`, but its native extension could not install under the provided Node 24 environment without Python and a C++ toolchain. Node 24 already provides `node:sqlite`, so switching removed a fragile native build while preserving the same data model and transaction semantics.

## Decision 3 — Session authentication

- **Chose:** Server-side sessions with password hashes and secure cookie settings in production.
- **Rejected:** Browser-stored JWTs.
- **Why:** This browser application does not need cross-service tokens. HttpOnly sessions reduce credential exposure and make logout/revocation straightforward.

## Decision 4 — Append-only maintenance events

- **Chose:** A single event table for creation, transitions, assignments, and notes, writable only through domain services.
- **Rejected:** Reconstructing history from mutable request columns or separate history tables per event type.
- **Why:** A unified chronological timeline is easy to query and guarantees that editing a request never rewrites its past.

## Decision 5 — Explicit lifecycle map

- **Chose:** A server-side transition map plus an assignment precondition for Scheduled.
- **Rejected:** Comparing numeric status order or trusting options rendered by the browser.
- **Why:** The allowed graph includes a non-linear Resolved → Triaged reopen path. An explicit map is readable, testable, and rejects forged requests.

## Decision 6 — Payment rows remain factual

- **Chose:** Store each received payment, then derive whether the month is fully matched from the monthly sum.
- **Rejected:** A mutable paid/unpaid flag on each unit.
- **Why:** The source records remain auditable and partial payments work naturally. Dashboard, alerts, and CSV export all share one definition of “matched.”

- The first sketch assumed exactly one payment per unit/month. Bulk-entry examples exposed legitimate split payments, so the design now stores multiple immutable receipts and derives the status from their sum.

## Decision 7 — Contractor-created requests remain unassigned

- **Chose:** Let a contractor report an issue for a unit already represented in their assigned work, but leave the new request unassigned until a manager acts.
- **Rejected:** Automatically assigning the reporting contractor to the new request.
- **Why:** Automatic self-assignment feels smoother, but directly violates the explicit rule that only managers can add or remove assignments. The confirmation explains why the new item does not enter the contractor’s list immediately.
