# Schema

SQLite stores timestamps as UTC text and money as integer cents, avoiding floating-point rounding. Primary keys are integer row IDs.

## Tables

### `users`

| Column | Type | Rules |
|---|---|---|
| `id` | INTEGER | Primary key |
| `name` | TEXT | Required |
| `email` | TEXT | Required, unique, case-insensitive |
| `password_hash` | TEXT | Required; bcrypt hash, never plaintext |
| `role` | TEXT | Required; `MANAGER` or `CONTRACTOR` |
| `created_at` | TEXT | Required, defaults to current UTC time |

### `units`

| Column | Type | Rules |
|---|---|---|
| `id` | INTEGER | Primary key |
| `unit_number` | TEXT | Required and unique |
| `address` | TEXT | Required |
| `monthly_rent_cents` | INTEGER | Required and non-negative |
| `tenant_name` | TEXT | Required |
| `archived_at` | TEXT | Nullable soft-delete timestamp |
| `created_at`, `updated_at` | TEXT | Required UTC timestamps |

### `rent_payments`

| Column | Type | Rules |
|---|---|---|
| `id` | INTEGER | Primary key |
| `unit_id` | INTEGER | Required FK → `units.id` |
| `amount_cents` | INTEGER | Required and positive |
| `rent_month` | TEXT | Required `YYYY-MM` value |
| `received_at` | TEXT | Required UTC timestamp |
| `recorded_by` | INTEGER | Required FK → `users.id` |

Multiple receipts per unit/month are intentional: a tenant may pay in parts. Match state is based on their sum.

### `maintenance_requests`

| Column | Type | Rules |
|---|---|---|
| `id` | INTEGER | Primary key |
| `unit_id` | INTEGER | Required FK → `units.id` |
| `description` | TEXT | Required, 3–2,000 characters |
| `priority` | TEXT | `LOW`, `MEDIUM`, `HIGH`, or `URGENT` |
| `status` | TEXT | One of the four lifecycle states |
| `created_by` | INTEGER | Required FK → `users.id` |
| `created_at`, `updated_at` | TEXT | Required UTC timestamps |
| `resolved_at` | TEXT | Nullable; supports dashboard reporting |

### `request_assignments`

| Column | Type | Rules |
|---|---|---|
| `request_id` | INTEGER | FK → request; composite primary key |
| `contractor_id` | INTEGER | FK → user; composite primary key |
| `assigned_at` | TEXT | Required UTC timestamp |
| `assigned_by` | INTEGER | Required FK → user |

This junction table implements the many-to-many relationship and prevents duplicate assignments.

### `request_events`

| Column | Type | Rules |
|---|---|---|
| `id` | INTEGER | Primary key |
| `request_id` | INTEGER | Required FK → request |
| `actor_id` | INTEGER | Required FK → user |
| `event_type` | TEXT | `CREATED`, `STATUS_CHANGED`, `ASSIGNED`, `UNASSIGNED`, or `NOTE` |
| `old_value`, `new_value`, `body` | TEXT | Nullable event payload fields |
| `created_at` | TEXT | Required UTC timestamp |

Database triggers reject every update or delete, including direct SQL outside the application.

### `alert_dismissals`

| Column | Type | Rules |
|---|---|---|
| `unit_id` | INTEGER | FK → unit; composite primary key |
| `rent_month` | TEXT | Composite primary key |
| `dismissed_by` | INTEGER | Required FK → user |
| `dismissed_at` | TEXT | Required UTC timestamp |

The unit/month key is why a dismissal suppresses only the current alert and naturally expires next month.

## Relationships and enforcement

Users author many payments and events. Units have many payments and requests. Requests have many events. Requests and contractors are many-to-many through assignments.

Database constraints own foreign-key integrity, uniqueness, non-negative money values, enumerated roles/statuses/priorities, and append-only history. Application services own actor-dependent permissions, lifecycle transitions, the “must have an assignee before Scheduled” rule, and calendar/grace-period calculations because those rules need user or time context.

No paid/overdue boolean is stored: monthly state is derived from payment facts. Current request status and `resolved_at` are deliberately denormalised alongside immutable transition events so list and dashboard queries do not replay every event. At 100× the intended data, dashboard aggregation and `%description%` search would degrade first; the next steps would be PostgreSQL, full-text indexing, composite reporting indexes, cached aggregates, and background CSV generation.
