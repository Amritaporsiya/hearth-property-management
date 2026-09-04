# Architecture

This document will be completed as the implementation takes shape.

The planned system is one Node.js/TypeScript service. Express handles HTTP routing, session authentication, role authorization, input validation, domain services, and server-rendered EJS views. A relational SQLite database stores users, units, payments, maintenance requests, assignments, and append-only events. Browser JavaScript is progressive enhancement only; permissions and business rules never depend on it.

A representative status-change request travels from an HTML form to an authenticated Express route. Middleware loads the session user; the request service verifies visibility and the allowed transition, checks that Scheduled has an assignee, updates the request and inserts its history event in one transaction, then redirects to the detail page. The page reads the request and its event stream and renders the updated timeline.

The application and database run together for the initial demo deployment. A production-scale version would move persistence to managed PostgreSQL and sessions to a shared store. I deliberately did not split this into microservices, build a tenant portal, or add background jobs because none improves the ten required workflows within the time budget.
