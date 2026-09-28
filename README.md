# ICX Power Solutions

Institutional web platform for **ICX POWER SOLUTIONS SRL** (Romania), built on the Manus WebDev full-stack template.

## Included in this release

- Responsive public site with ICX visual system, six service routes, internal service tabs, and a protected-contact entry point.
- Admissions workbench at `/etudes` with combined country / level / text filters, program detail modal, required-document checklist, and auth-gated application CTA.
- Built-in Manus OAuth session flow with `/connexion`, `/inscription`, `/mon-espace`, and a visually separate `/admin` console. Login and account creation happen at the identity provider; the public site does not simulate passwords or account creation.
- Light / dark theme toggle, six-language selector (French, English, Chinese, Romanian, Polish, Arabic), and RTL direction for Arabic.
- Domain tables in `drizzle/schema.ts` for universities, programs, service requests, application cases, and audit logs.
- Render and Netlify deployment templates, including a fast `/healthz` readiness endpoint and direct `PORT` binding.
- Clearly flagged placeholders for CUI, Nr. Reg. Com., company address, and partner legal data that must be confirmed before production publication.

## Render deployment notes

The production server binds directly to Render's `PORT` on `0.0.0.0` and exposes `/healthz` before optional integrations. This removes the previous port scan and lets Render mark the service ready as soon as the HTTP process is listening. Render still needs valid environment variables and a non-sleeping plan for consistently fast first response times.

## Local development

```bash
pnpm install
pnpm dev
```

Useful checks:

```bash
pnpm check
pnpm test
pnpm build
```

## Environment variables

The WebDev runtime injects the Manus auth, database, storage, and built-in API variables listed in `server/_core/env.ts`. For a standalone Render / Netlify deployment, use `ENVIRONMENT.md` as the secret-manager checklist and fill every sensitive value there. Do not commit credentials.

## Data model

The initial migration `drizzle/0000_sleepy_mercury.sql` restores the missing users-table migration; `drizzle/0005_create_users_table.sql` safely ensures that table exists even when older migrations are already recorded. Apply migrations with `DATABASE_URL` configured using `pnpm db:push`.

## Production follow-up before publication

1. Replace the visual initials with the supplied high-resolution logo and team photos once those files are provided to the project workspace.
2. Replace partner placeholders with official Lorondo Services SRL and AAFT Association assets and verified legal information. See `client/src/lib/partners.json`.
3. Confirm CUI, Nr. Reg. Com., registered address, privacy policy, cookie policy, and terms with the client.
4. Connect the application and service-request forms to the protected tRPC procedures, email provider, and S3 storage credentials.
5. Configure transactional email, signed expiring document URLs, MIME verification / antivirus scanning, rate limiting, CSRF, and mandatory admin 2FA for production.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Public homepage |
| `/services/:slug` | Service detail with internal tabs |
| `/etudes` | University and programme finder |
| `/partenaires` | Partner directory placeholder |
| `/connexion` / `/inscription` | Auth entry surfaces |
| `/mon-espace` | Protected client workspace surface |
| `/admin` | Operations dashboard surface |
| `/confidentialite` / `/mentions-legales` | Legal placeholders |
## Administration and langues

- Le compte `icxps.sale@outlook.com` est le **super-administrateur** par défaut.
- Pour remplacer cette adresse en production, définir `SUPER_ADMIN_EMAIL` (l’ancien `ADMIN_EMAIL` reste accepté).
- Ouvrir `/admin` puis se connecter via le fournisseur OAuth avec l’adresse super-admin. La redirection revient automatiquement dans la console après connexion.
- La console lit les demandes enregistrées et permet de changer leur statut ; le super-administrateur peut consulter les comptes, promouvoir ou révoquer un rôle admin. Les permissions sont contrôlées côté serveur.
- Le catalogue et le journal d’audit détaillé ne sont pas des outils actifs dans cette version ; la console l’indique au lieu d’afficher des chiffres ou actions simulés.
- Le registre global des langues est centralisé dans `client/src/lib/i18n.ts` et couvre `fr`, `en`, `ro`, `pl`, `ar` et `zh`. Le choix est mémorisé et l’arabe active automatiquement le mode RTL.
