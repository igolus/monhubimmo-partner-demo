# Partner API Demo

Application de démonstration pour tester l'API partenaire MonHubImmo.

## Fonctionnalités

- **Configuration API** : Entrez votre clé API et testez la connexion
- **Création d'utilisateurs** : Formulaire complet pour créer des agents immobiliers
- **Liste des utilisateurs** : Visualisez les utilisateurs créés via l'application
- **Gestion des erreurs** : Affichage détaillé des erreurs de validation

## Installation

```bash
cd partnerDemo
npm install
```

## Démarrage

```bash
npm run dev
```

L'application sera disponible sur http://localhost:3001

## Utilisation

1. **Configurer l'API** : Allez sur `/config`, entrez votre clé API et l'URL du serveur (par défaut `http://localhost:4000`)
2. **Tester la connexion** : Cliquez sur "Tester la connexion" pour vérifier que votre clé est valide
3. **Créer un utilisateur** : Allez sur `/users/create` et remplissez le formulaire
4. **Voir les utilisateurs** : Consultez la liste des utilisateurs créés sur `/users`

## Structure des données

Les données sont stockées localement dans le navigateur (localStorage) :

- `partnerDemo_config` : Configuration API (clé et URL)
- `partnerDemo_users` : Liste des utilisateurs créés

## API Endpoints utilisés

- `GET /api/external/v1/health` : Test de connexion
- `POST /api/external/v1/users` : Création d'utilisateur

## Technologies

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Lucide React (icônes)
