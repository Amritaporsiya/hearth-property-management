# Plan

I split the work into six focused sessions so that each one left a working, reviewable increment.

| Session | Estimate | Purpose |
|---|---:|---|
| 1. Foundation | 1.5h | Model the domain, initialize Git, scaffold the server-rendered TypeScript app, authentication, and seed data. |
| 2. Maintenance core | 2.5h | Units, requests, many-to-many assignment, lifecycle rules, and immutable history. |
| 3. Rent workflows | 2h | Payments, monthly matching, bulk entry, CSV rent roll, and renewable alerts. |
| 4. Find and understand | 2h | Server-side request query, filters, sorting, pagination, dashboard aggregations, and charts. |
| 5. Quality | 2h | Authorization and domain-rule integration tests, validation, accessibility, responsive polish, and empty/error states. |
| 6. Delivery | 2h | Deployment, reviewer seed data, final documentation, and submission audit. |

I am building risky server-side rules before visual polish. Authentication and the data model come first because every later feature relies on their boundaries. Maintenance and rent are separate vertical slices; the dashboard then consumes already-proven queries rather than inventing a second interpretation of the data.

The initial total estimate was 12 hours, and the work finished at approximately 12 hours including deployment and live QA. Foundation and maintenance took slightly longer than expected because the original SQLite package required unavailable native build tools. Rent and dashboard work finished faster because they reused the established schema and server-rendering patterns. Deployment also needed an additional secure-cookie fix for Render's reverse proxy.

I cut all stretch goals: tenant self-service, file attachments, lease reminders, ratings, recurring maintenance, multiple owners, late-fee automation, utilities, and inspections. I also kept the chart CSS-based instead of adding a charting dependency. I did not cut authorization, lifecycle enforcement, immutable history, validation, required reporting, or production verification.
