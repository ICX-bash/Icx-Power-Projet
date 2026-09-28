# Variables d’environnement — déploiement Render

Configurez ces variables dans le gestionnaire de secrets Render. Ne stockez jamais les vraies valeurs dans Git. Voir [ADMIN_SETUP_FR.md](ADMIN_SETUP_FR.md) pour le guide détaillé.

| Variable | Usage |
| --- | --- |
| `DATABASE_URL` | Connexion TiDB/MySQL au schéma du site (pas `sys`). |
| `DATABASE_SSL` | `true` pour TLS TiDB Cloud public. Le serveur active aussi TLS automatiquement pour les hôtes `*.tidbcloud.com`. |
| `JWT_SECRET` | Signature des sessions du portail client Manus. |
| `VITE_APP_ID` | Identifiant non secret de l’application Manus client. |
| `OAUTH_SERVER_URL` | `https://api.manus.im` pour OAuth du portail client. |
| `VITE_OAUTH_PORTAL_URL` | Portail de connexion Manus du portail client. |
| `OWNER_OPEN_ID` | Identité propriétaire fournie par l’intégration Manus, si configurée. |
| `SUPER_ADMIN_EMAIL` | Compte super-admin autorisé, par défaut `icxps.sale@outlook.com`. |
| `MICROSOFT_TENANT_ID` | `consumers` pour le compte Outlook personnel. |
| `MICROSOFT_CLIENT_ID` / `MICROSOFT_CLIENT_SECRET` | Application Microsoft Entra; secret serveur uniquement dans Render. |
| `MICROSOFT_REDIRECT_URI` | URL exacte `https://VOTRE-DOMAINE/api/admin/auth/callback`, aussi déclarée dans Microsoft Entra. |
| `INTEGRATION_ENCRYPTION_KEY` | Clé base64 aléatoire de 32 octets pour chiffrer le refresh token Microsoft. Ne pas la changer sans migrer le jeton. |
| `RESEND_API_KEY` | Clé serveur Resend. |
| `RESEND_FROM_NAME` / `RESEND_FROM_EMAIL` | Identité expéditeur; le domaine doit être vérifié dans Resend. |
| `RESEND_REPLY_TO` | Adresse de réponse, par défaut `icxps.sale@outlook.com`. |
| `BUILT_IN_FORGE_API_URL` / `BUILT_IN_FORGE_API_KEY` | Stockage Forge utilisé actuellement par les fichiers du portail. |
| `NEXT_PUBLIC_SITE_URL` | URL publique canonique; utilisée notamment dans les e-mails admin. |

Microsoft Graph demande les permissions déléguées `User.Read`, `Mail.ReadWrite`, `Mail.Send` et les scopes OIDC `openid profile email offline_access`. L’adresse authentifiée doit correspondre exactement à `SUPER_ADMIN_EMAIL`.

Pour appliquer les migrations versionnées via le pool TiDB/TLS, exécutez `pnpm db:push`. `0005_create_users_table.sql` répare la table utilisateurs historique; `0006_admin_console.sql` crée les tables d’intégration/email et les champs de traitement admin.

N’ajoutez aucun secret sous un nom `VITE_*`: les variables Vite sont exposées dans le navigateur. Pour Render, utilisez `render.yaml` et `.env.render.template` comme checklists, pas comme lieux de stockage de vrais secrets.
