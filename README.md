# Partner API Demo

Application de démonstration pour tester l'API partenaire MonHubImmo.

## Fonctionnalités

- **Configuration API** : Entrez votre clé API et testez la connexion
- **Création d'utilisateurs** : Formulaire complet pour créer des agents immobiliers
- **Liste des utilisateurs** : Visualisez les utilisateurs créés via l'application
- **Gestion des erreurs** : Affichage détaillé des erreurs de validation

## Installation

```bash
cd monhubimmo-partner-demo
npm install
```

## Démarrage

```bash
npm run dev
```

L'application sera disponible sur http://localhost:3101 (script `npm run dev-partner`).

## Utilisation

1. **Configurer l'API** : Allez sur `/config`, entrez votre clé API et l'URL du serveur (par défaut `http://localhost:4000`)
2. **Tester la connexion** : Cliquez sur "Tester la connexion" pour vérifier que votre clé est valide
3. **Créer un utilisateur** : Allez sur `/users/create` et remplissez le formulaire
4. **Voir les utilisateurs** : Consultez la liste des utilisateurs créés sur `/users`

## Structure des données

Les données sont stockées localement dans le navigateur (localStorage) :

- `partnerDemo_config` : Configuration API (clé et URL)
- `partnerDemo_users` : Liste des utilisateurs créés

## Webhooks

La route `/api/webhooks/receive` vérifie la signature des événements reçus :
HMAC-SHA256 du **corps brut**, préfixé de `sha256=`, comparé en temps constant.

Pour activer la vérification, placez le signing secret du webhook (affiché une
seule fois, à sa création dans MonHubImmo) dans `.env.local` :

```
MHI_WEBHOOK_SECRET=votre-signing-secret
```

Sans ce secret, les événements sont reçus et affichés, mais marqués « non
vérifiée ». La page `/webhooks` distingue trois états : signature vérifiée,
signature présente mais non vérifiée, et absence de signature.

## API Endpoints utilisés

- `GET /api/external/v1/health` : Test de connexion
- `POST|GET|PUT /api/external/v1/users` : Agents
- `POST|GET|PUT /api/external/v1/properties` : Biens
- `POST|GET|PUT /api/external/v1/search-ads` : Recherches acquéreurs

> La référence complète de l'API est `PARTNER_API.md`, téléchargeable depuis
> `/partner/docs` sur MonHubImmo.

## Clé API

Depuis novembre 2026, les clés sont **hachées en base** côté serveur : une clé
n'est lisible qu'à sa création, et toute clé émise avant ce changement ne
s'authentifie plus. Régénérez-la depuis `/partner/api`, puis saisissez-la dans
`/config`.

## Technologies

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Lucide React (icônes)
