# Architecture

Hearth is one Node.js/TypeScript service. Express handles HTTP routing, session authentication, role authorization, input validation, domain services, and server-rendered HTML. A relational SQLite database stores users, units, payments, maintenance requests, assignments, and append-only events. The browser submits ordinary forms and renders server responses; permissions and business rules never depend on client-side behavior.

A representative status-change request travels from an HTML form to an authenticated Express route. Middleware loads the session user; the request service verifies visibility and the allowed transition, checks that Scheduled has an assignee, updates the request and inserts its history event in one transaction, then redirects to the detail page. The page reads the request and its event stream and renders the updated timeline.

Locally, the Express process and SQLite database run on the developer's computer. In the deployed version, the same Docker container runs on Render and stores SQLite under the container filesystem. Render terminates HTTPS before forwarding requests to Express, so production explicitly trusts one proxy hop for secure session cookies. The free filesystem is ephemeral and can return to seeded data when the service is replaced.

I deliberately did not split the application into microservices, create a separate SPA/API deployment, build a tenant portal, or add background jobs. Those additions would increase operational and testing cost without improving the ten required workflows in the timebox. At production scale, I would move persistence to managed PostgreSQL and sessions to Redis or another shared store.
