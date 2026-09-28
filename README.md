# ICX Power Solutions

Plateforme web d’**ICX POWER SOLUTIONS SRL** (Roumanie), construite avec React, Express/tRPC, Drizzle et MySQL/TiDB.

## Portail client

- Site responsive et catalogue des services ICX.
- Parcours études/admissions, espace client, demandes de service et téléversement de pièces.
- Authentification client Manus OAuth conservée (`/connexion`, `/inscription`, `/mon-espace`).
- Interface multilingue (FR, EN, ZH, RO, PL, AR) avec direction RTL pour l’arabe.

## Console admin

- `/admin` sert `client/admin.html` et son bundle React dédié, indépendamment du point d’entrée public `client/index.html`.
- La connexion admin est distincte de Manus : OAuth Microsoft/Entra pour le seul compte autorisé `SUPER_ADMIN_EMAIL` (par défaut `icxps.sale@outlook.com`), cookie HttpOnly séparé et autorisation contrôlée sur le serveur.
- Fonctions : demandes, statuts, priorités, attribution, notes internes, notifications client, journal d’activité, comptes/rôles (super-admin), tableau des fichiers clients avec téléchargements signés, journal d’e-mails Resend et boîte Outlook Graph (dossiers, lecture du message, pièces jointes, marquer lu/non lu, déplacer, répondre).
- La connexion client Manus reste inchangée; la console ne redirige pas vers `/app-auth`.

## Déploiement Render / TiDB

1. Configurez les variables depuis `.env.render.template` dans **Render → votre Web Service → Environment**. Pour Microsoft, le callback doit correspondre exactement à `https://VOTRE-DOMAINE/api/admin/auth/callback` dans Render et Microsoft Entra.
2. `DATABASE_URL` doit utiliser le schéma MySQL/TiDB dédié au site; ne pas utiliser `sys`. Le pool du serveur active TLS 1.2 pour les hôtes TiDB Cloud; `DATABASE_SSL=true` est inscrit dans le blueprint.
3. Appliquez les migrations avec `pnpm db:push` depuis un shell ayant les variables Render/TiDB appropriées. La commande versionnée respecte TLS et applique `0005_create_users_table.sql` puis `0006_admin_console.sql` selon le journal de migration.
4. Poussez ces fichiers vers la branche reliée à Render, puis lancez **Manual Deploy → Deploy latest commit**. Ouvrez `/admin`, connectez-vous avec le compte Outlook autorisé, puis contrôlez **Système & intégrations**.
5. Resend nécessite une clé serveur et un expéditeur dont le domaine est vérifié chez Resend. Les fichiers du site utilisent le stockage Forge déjà présent dans ce projet.

Le Blueprint ne provisionne pas de PostgreSQL Render : ce projet utilise `drizzle-orm/mysql2`, donc TiDB/MySQL. Voir le guide détaillé [ADMIN_SETUP_FR.md](ADMIN_SETUP_FR.md).

## Variables d’environnement principales

- **Site client** : `DATABASE_URL`, `DATABASE_SSL`, `JWT_SECRET`, `VITE_APP_ID`, `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL`, `OWNER_OPEN_ID`.
- **Admin Microsoft** : `SUPER_ADMIN_EMAIL`, `MICROSOFT_TENANT_ID`, `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_REDIRECT_URI`, `INTEGRATION_ENCRYPTION_KEY`.
- **E-mails** : `RESEND_API_KEY`, `RESEND_FROM_NAME`, `RESEND_FROM_EMAIL`, `RESEND_REPLY_TO`.
- **Fichiers** : `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY`.

Ne commitez jamais de secrets. Les variables `VITE_*` sont intégrées au bundle client; n’y mettez jamais de secret.

## Vérifications

```bash
pnpm install
pnpm check
pnpm test
pnpm build
```

Le serveur de production expose `/healthz` et se lie sur `0.0.0.0:$PORT`.

## À terminer avant une ouverture publique

- Confirmer les mentions légales, les données de société, les coordonnées et la politique de confidentialité.
- Activer et imposer l’authentification multifacteur sur le compte Microsoft administrateur.
- Ajouter une politique de types de fichier stricte, antivirus, limitation de débit et rétention/sauvegarde adaptée aux dossiers clients.
- Valider les autorisations, le domaine expéditeur Resend, la liste IP réseau TiDB et un scénario de demande de bout en bout avec un compte de test.
