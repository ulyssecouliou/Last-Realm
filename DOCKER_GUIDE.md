# Guide Docker - Last Realm

Ce guide explique comment utiliser Docker pour déployer l'application Last Realm.

## 📋 Prérequis

- Docker Desktop installé sur votre machine
- Docker Compose (inclus avec Docker Desktop)

## 🚀 Démarrage rapide

### 1. Configuration des variables d'environnement

Copiez le fichier `.env.example` et créez un fichier `.env` :

```bash
cp .env.example .env
```

Modifiez les valeurs dans `.env` selon vos besoins (notamment le mot de passe PostgreSQL et le JWT_SECRET).

### 2. Lancer l'application

```bash
# Construire et démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter les services
docker-compose down

# Arrêter et supprimer les volumes (⚠️ supprime les données)
docker-compose down -v
```

### 3. Accéder à l'application

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:5000
- **PostgreSQL** : localhost:5432

## 🏗️ Structure Docker

### Services

1. **postgres** : Base de données PostgreSQL 15
   - Port : 5432
   - Volume persistant : `postgres_data`
   - Healthcheck intégré

2. **backend** : API Node.js/Express
   - Port : 5000
   - Dépend de PostgreSQL
   - Restart automatique

3. **frontend** : Application React avec Nginx
   - Port : 3000 (mappé sur 80 dans le container)
   - Build optimisé pour la production

### Fichiers Docker

- `docker-compose.yml` : Configuration multi-services
- `backend/Dockerfile` : Image du backend
- `frontend/Dockerfile` : Image du frontend (build multi-stage)
- `frontend/nginx.conf` : Configuration Nginx
- `.dockerignore` : Fichiers exclus des images
- `init-db.sql` : Script d'initialisation de la base de données

## 🔧 Commandes utiles

### Gestion des containers

```bash
# Voir l'état des services
docker-compose ps

# Redémarrer un service spécifique
docker-compose restart backend

# Voir les logs d'un service
docker-compose logs -f postgres

# Exécuter une commande dans un container
docker-compose exec backend sh
docker-compose exec postgres psql -U postgres -d last_realm
```

### Build et images

```bash
# Reconstruire les images
docker-compose build

# Reconstruire sans cache
docker-compose build --no-cache

# Construire une image spécifique
docker-compose build backend
```

### Base de données

```bash
# Accéder au shell PostgreSQL
docker-compose exec postgres psql -U postgres -d last_realm

# Sauvegarder la base de données
docker-compose exec postgres pg_dump -U postgres last_realm > backup.sql

# Restaurer la base de données
docker-compose exec -T postgres psql -U postgres last_realm < backup.sql
```

## 🎯 Création d'une image PostgreSQL personnalisée

Si vous souhaitez créer votre propre image PostgreSQL avec des données pré-configurées :

### Option 1 : Dockerfile PostgreSQL personnalisé

Créez `postgres/Dockerfile` :

```dockerfile
FROM postgres:15-alpine

# Copier les scripts d'initialisation
COPY init-db.sql /docker-entrypoint-initdb.d/
COPY seed-data.sql /docker-entrypoint-initdb.d/

# Variables d'environnement par défaut
ENV POSTGRES_DB=last_realm
ENV POSTGRES_USER=postgres
```

Puis modifiez `docker-compose.yml` :

```yaml
postgres:
  build:
    context: ./postgres
    dockerfile: Dockerfile
  # ... reste de la configuration
```

### Option 2 : Sauvegarder un container existant

```bash
# 1. Démarrer PostgreSQL et insérer vos données
docker-compose up -d postgres

# 2. Créer une image depuis le container
docker commit last-realm-postgres my-postgres-image:1.0

# 3. Sauvegarder l'image
docker save my-postgres-image:1.0 -o my-postgres-image.tar

# 4. Charger l'image ailleurs
docker load -i my-postgres-image.tar
```

## 🔐 Sécurité

⚠️ **Important pour la production** :

1. Changez tous les mots de passe par défaut
2. Utilisez un `JWT_SECRET` fort et unique
3. Ne commitez jamais le fichier `.env`
4. Utilisez des secrets Docker ou des gestionnaires de secrets
5. Limitez l'exposition des ports (retirez les mappings de ports si non nécessaires)

## 🐛 Dépannage

### Les migrations Sequelize ne s'exécutent pas

Le backend utilise Sequelize qui crée automatiquement les tables. Si vous avez besoin de migrations manuelles, ajoutez un script dans `backend/package.json` et exécutez-le après le démarrage.

### Le frontend ne se connecte pas au backend

Vérifiez que la variable d'environnement `REACT_APP_API_URL` dans le frontend pointe vers `http://localhost:5000` (ou l'URL appropriée).

### PostgreSQL ne démarre pas

```bash
# Vérifier les logs
docker-compose logs postgres

# Supprimer le volume et recommencer
docker-compose down -v
docker-compose up -d
```

## 🚀 Démarrage ultra-rapide

Pour démarrer l'application en une seule commande :

### Windows
Double-cliquez sur `start-docker.bat` ou exécutez :
```powershell
.\start-docker.ps1
```

Le script automatique va :
- ✅ Vérifier et démarrer Docker
- ✅ Créer les images
- ✅ Démarrer tous les services
- ✅ Ouvrir l'application dans votre navigateur

### Scripts disponibles
- `start-docker.ps1` / `start-docker.bat` : Démarrage complet automatique
- `stop-docker.ps1` : Arrêt des containers

Consultez `SCRIPTS_README.md` pour plus de détails.

## 📦 Déploiement

Pour déployer en production :

1. Utilisez des images tagguées plutôt que `latest`
2. Configurez des volumes externes pour la persistance
3. Utilisez un reverse proxy (Traefik, Nginx) devant les services
4. Activez HTTPS avec Let's Encrypt
5. Mettez en place une stratégie de backup

Exemple avec tags :

```bash
# Build avec tags
docker-compose build
docker tag last-realm-backend:latest myregistry.com/last-realm-backend:1.0
docker tag last-realm-frontend:latest myregistry.com/last-realm-frontend:1.0

# Push vers un registry
docker push myregistry.com/last-realm-backend:1.0
docker push myregistry.com/last-realm-frontend:1.0
```

## 📚 Ressources

- [Documentation Docker](https://docs.docker.com/)
- [Documentation Docker Compose](https://docs.docker.com/compose/)
- [Images PostgreSQL officielles](https://hub.docker.com/_/postgres)
- [Best practices Dockerfile](https://docs.docker.com/develop/dev-best-practices/)
