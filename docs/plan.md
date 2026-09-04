# Plan

I split the work into six focused sessions so that each one leaves a working, reviewable increment.

| Session | Estimate | Purpose |
|---|---:|---|
| 1. Foundation | 1.5h | Model the domain, initialize Git, scaffold the server-rendered TypeScript app, authentication, and seed data. |
| 2. Maintenance core | 2.5h | Units, requests, many-to-many assignment, lifecycle rules, and immutable history. |
| 3. Rent workflows | 2h | Payments, monthly matching, bulk entry, CSV rent roll, and renewable alerts. |
| 4. Find and understand | 2h | Server-side request query, filters, sorting, pagination, dashboard aggregations, and charts. |
| 5. Quality | 2h | Authorization and domain-rule integration tests, validation, accessibility, responsive polish, and empty/error states. |
| 6. Delivery | 2h | Deployment, reviewer seed data, final documentation, and submission audit. |

I am building risky server-side rules before visual polish. Authentication and the data model come first because every later feature relies on their boundaries. Maintenance and rent are separate vertical slices; the dashboard then consumes already-proven queries rather than inventing a second interpretation of the data.

The initial total estimate is 12 hours. Actual time and any scope changes will be recorded here after each session. Stretch goals are deliberately excluded until all ten required goals are solid. If time runs short, I will reduce decorative UI work and dashboard animation—not authorization, auditability, validation, or required reporting.
