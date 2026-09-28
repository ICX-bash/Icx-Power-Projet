# Environment handoff

Configure these values in the deployment platform's secret manager. Do not commit credentials.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | MySQL / TiDB connection string |
| `JWT_SECRET` | Session signing secret |
| `VITE_APP_ID` | Manus OAuth app id |
| `OAUTH_SERVER_URL` | Manus OAuth backend URL |
| `VITE_OAUTH_PORTAL_URL` | Manus sign-in portal URL |
| `OWNER_OPEN_ID` | Optional immutable owner identity supplied by the identity provider |
| `SMTP_HOST` / `SMTP_PORT` | Transactional email relay |
| `SMTP_USER` / `SMTP_PASSWORD` | Transactional email credentials |
| `STORAGE_BUCKET` | S3-compatible object storage bucket |
| `SUPER_ADMIN_EMAIL` | Initial super-admin identity: `icxps.sale@outlook.com` (legacy `ADMIN_EMAIL` is accepted) |
| `NEXT_PUBLIC_SITE_URL` | Public canonical site URL |

Apply the Drizzle migrations from an environment with `DATABASE_URL` configured (`pnpm db:push`). `drizzle/0000_sleepy_mercury.sql` restores the missing initial users-table migration; `drizzle/0005_create_users_table.sql` also repairs a deployed database whose earlier migrations are already recorded. Both use `CREATE TABLE IF NOT EXISTS`. Configure the OAuth portal URL and app ID in the deployment environment before building the client.
