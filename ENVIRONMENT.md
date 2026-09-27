# Environment handoff

Configure these values in the deployment platform's secret manager. Do not commit credentials.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | MySQL / TiDB connection string |
| `JWT_SECRET` | Session signing secret |
| `VITE_APP_ID` | Manus OAuth app id |
| `OAUTH_SERVER_URL` | Manus OAuth backend URL |
| `VITE_OAUTH_PORTAL_URL` | Manus sign-in portal URL |
| `SMTP_HOST` / `SMTP_PORT` | Transactional email relay |
| `SMTP_USER` / `SMTP_PASSWORD` | Transactional email credentials |
| `STORAGE_BUCKET` | S3-compatible object storage bucket |
| `ADMIN_EMAIL` | Initial operations account: `icxps.sale@outlook.com` |
| `NEXT_PUBLIC_SITE_URL` | Public canonical site URL |
