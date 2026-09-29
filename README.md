# ICX Power Solutions

Plateforme web d’**ICX POWER SOLUTIONS SRL** (Roumanie), construite avec React, Express/tRPC, Drizzle et MySQL/TiDB.

## Portail client

- Site responsive, catalogue des services, espace client, demandes et téléversement de pièces.
- Connexion indépendante de Manus : inscription e-mail/mot de passe, confirmation obligatoire par e-mail, limitation des tentatives, session HttpOnly et réinitialisation du mot de passe.
- Les liens de confirmation et de récupération sont envoyés via l’API HTTPS Brevo; l’adresse expéditrice doit être un expéditeur vérifié.
- Interface multilingue (FR, EN, ZH, RO, PL, AR) avec direction RTL pour l’arabe.

## Console admin

- `/admin` sert `client/admin.html` et son bundle React dédié, indépendamment du point d’entrée public `client/index.html`.
- La connexion admin reste distincte : Microsoft/Entra pour le seul compte configuré dans `SUPER_ADMIN_EMAIL` (par défaut `icxps.sale@outlook.com`), avec cookie HttpOnly séparé.
- Les routes et téléchargements d’administration exigent cette session Microsoft; un compte client, même s’il porte le rôle `admin` en base, ne peut pas ouvrir la console.
- Fonctions : demandes, statuts, priorités, notifications, gestion des rôles (super-admin), téléchargements signés, journal d’e-mails et boîte Outlook Graph.

## Déploiement Render / TiDB

1. Configurez les variables dans Render à partir de `.env.render.template`. `NEXT_PUBLIC_SITE_URL` doit être l’origine HTTPS exacte du service public Render, sans chemin ni barre finale. Aucun `VITE_APP_ID` ou portail Manus n’est requis pour l’inscription client.
2. `DATABASE_URL` doit pointer vers un schéma MySQL/TiDB dédié au site; ne pas utiliser le schéma système `sys`. `DATABASE_SSL=true` active le TLS TiDB Cloud.
3. Déployez le commit sur Render, ouvrez le Shell du service, puis exécutez `pnpm db:push` une seule fois après sauvegarde/contrôle de la base. Cette commande versionnée applique notamment `0005_create_users_table.sql`, `0006_admin_console.sql` et `0007_client_auth.sql`.
4. Testez le parcours client avec une adresse de test : inscription → réception de l’e-mail → confirmation → connexion → demande de réinitialisation. Vérifiez l’arrivée des messages et les journaux Brevo.
5. Testez `/admin` séparément avec le compte Microsoft autorisé et vérifiez **Système & intégrations**. Le callback Microsoft doit correspondre exactement à l’URI Web configurée dans Entra et à `MICROSOFT_REDIRECT_URI` sur Render.

La connexion client n’a besoin ni de `VITE_APP_ID`, ni de `VITE_OAUTH_PORTAL_URL`; ces valeurs Manus manquantes ne bloquent donc plus le site. Le Blueprint ne provisionne pas PostgreSQL Render : le code utilise `drizzle-orm/mysql2` et TiDB/MySQL.

## Variables principales

- **Base et sessions** : `DATABASE_URL`, `DATABASE_SSL`, `JWT_SECRET`, `NEXT_PUBLIC_SITE_URL`.
- **Assistant IA** : GPT-5 est essayé en premier avec les identifiants serveur Manus Forge (`BUILT_IN_FORGE_API_KEY`, avec l’URL Forge si elle est personnalisée) ou OpenAI-compatible (`OPENAI_API_KEY` et éventuellement `OPENAI_API_BASE`). Si cette requête échoue, l’application peut basculer vers Gemini via `GEMINI_API_KEY`; Gemini seul suffit aussi si aucune clé primaire n’est configurée. Vérifiez `/healthz` : `assistantReady` doit être `true`.
- **Console Microsoft admin** : `SUPER_ADMIN_EMAIL`, `MICROSOFT_TENANT_ID`, `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_REDIRECT_URI`, `INTEGRATION_ENCRYPTION_KEY`.
- **Courriels** : `BREVO_API_KEY`, `BREVO_FROM_NAME`, `BREVO_FROM_EMAIL`, `BREVO_REPLY_TO`.
- **Fichiers** : `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY`.

Ne commitez jamais de secrets. Les variables `VITE_*` sont intégrées au bundle client; n’y mettez jamais de secret.

Le free tier de l’API Gemini est limité et Google précise que son contenu peut être utilisé pour améliorer ses produits. Ne l’activez pas pour traiter des renseignements personnels ou des dossiers confidentiels sans avoir vérifié les conditions de confidentialité et obtenu les accords nécessaires; une offre payante peut appliquer des conditions différentes.

### Activer le repli gratuit Gemini dans Render

1. Créez une clé depuis [Google AI Studio](https://aistudio.google.com/apikey), en vérifiant les conditions de l’offre gratuite et son traitement des données.
2. Dans **Render → service ICX → Environment**, ajoutez `GEMINI_API_KEY` avec la clé obtenue et `GEMINI_MODEL` avec `gemini-3.8-flash`. Ne publiez jamais la clé sur GitHub, dans un message ou dans une variable `VITE_*`.
3. Enregistrez les variables et laissez Render redémarrer/redéployer le service.
4. Ouvrez `https://VOTRE-DOMAINE/healthz` : `assistantReady` doit afficher `true`. Cela confirme qu’une clé a été configurée, pas que Google ou le fournisseur primaire est joignable à cet instant.
5. Testez une question non sensible dans l’assistant. Si les deux fournisseurs échouent, consultez les logs Render pour le statut amont, sans copier de secret dans une conversation.

## Vérifications locales

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
```

Le serveur de production expose `/healthz` et se lie sur `0.0.0.0:$PORT`.

## À valider avant une ouverture publique

- Confirmer les mentions légales, les données de société, les coordonnées et le contenu des cases d’acceptation.
- Activer et imposer l’authentification multifacteur sur le compte Microsoft administrateur.
- Vérifier le expéditeur Brevo, la liste IP réseau TiDB, les sauvegardes et la rétention des dossiers clients.
- Tester les protections anti-brute-force avec un compte de test; ne pas utiliser de véritables dossiers clients pour les essais.
