# Last Realm

## Prérequis

- Node.js (LTS recommandé)
- npm
- (Optionnel) PostgreSQL si tu lances le backend en local sans Docker

## Installation

À la racine du projet :

```bash
npm install
```

Puis :

```bash
cd backend
npm install
```

```bash
cd frontend
npm install
```

## Configuration (.env)

### Option A — Lancement en local (npm)

Le backend lit ses variables d'environnement via `dotenv`.

Crée un fichier `backend/.env` (ou configure tes variables d'env système) avec par exemple :

```env
# Backend
PORT=5000

# JWT
JWT_SECRET=change-me-in-production

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=last_realm
DB_USER=postgres
DB_PASSWORD=password

# Optionnel
NODE_ENV=development
```

Le frontend peut aussi prendre une URL d'API (React) :

Crée un fichier `frontend/.env` :

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Option B — Lancement avec Docker

Docker Compose lit un fichier `.env` **à la racine** du repo.

Tu peux partir du modèle :

```bash
cp .env.example .env
```

## Lancer le projet (npm start)

### 1) Backend (API)

Dans `backend/` :

```bash
npm start
```

Le backend démarre par défaut sur :

- http://localhost:5000

### 2) Frontend (React)

Dans `frontend/` :

```bash
npm start
```

Le frontend démarre par défaut sur :

- http://localhost:3000

## Mode développement (hot reload)

### Backend (nodemon)

Dans `backend/` :

```bash
npm run dev
```

## Option Docker (Windows)

Tu as aussi des scripts de démarrage Docker (voir `SCRIPTS_README.md`) :

- `start-docker.bat`
- `start-docker.ps1`

Services attendus après démarrage Docker :

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- PostgreSQL: localhost:5432
