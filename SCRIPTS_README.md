# Scripts de Déploiement Docker - Last Realm

Ce dossier contient des scripts pour faciliter le déploiement de l'application avec Docker.

## 🚀 Démarrage rapide

### Windows (Méthode 1 - Double-clic)
Double-cliquez simplement sur `start-docker.bat`

### Windows (Méthode 2 - PowerShell)
```powershell
.\start-docker.ps1
```

### Windows (Méthode 3 - CMD)
```cmd
start-docker.bat
```

## 📋 Scripts disponibles

### `start-docker.ps1` / `start-docker.bat`
Script principal qui :
- ✅ Vérifie l'installation de Docker
- ✅ Démarre Docker Desktop si nécessaire
- ✅ Crée le fichier .env depuis .env.example
- ✅ Nettoie les containers existants
- ✅ Construit les images Docker
- ✅ Démarre tous les services
- ✅ Vérifie que tout fonctionne
- ✅ Propose d'ouvrir le navigateur

### `stop-docker.ps1`
Script d'arrêt qui :
- ⏹️ Arrête tous les containers
- 🗑️ Option pour supprimer les volumes (données)

## 🔧 Prérequis

- Docker Desktop installé
- Windows PowerShell 5.1+ (inclus dans Windows 10/11)

## 📝 Utilisation

### Premier démarrage
```powershell
# Depuis PowerShell
.\start-docker.ps1

# OU depuis CMD
start-docker.bat

# OU double-clic sur start-docker.bat
```

Le script va :
1. Vérifier Docker (et le démarrer si nécessaire)
2. Créer votre fichier .env
3. Construire les images (peut prendre 2-5 minutes la première fois)
4. Démarrer tous les services
5. Afficher les URLs d'accès

### Arrêter l'application
```powershell
.\stop-docker.ps1
```

### Redémarrage complet
```powershell
.\stop-docker.ps1
.\start-docker.ps1
```

## 🌐 Accès aux services

Après le démarrage :
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **PostgreSQL**: localhost:5432

## ⚠️ Résolution de problèmes

### "Docker n'est pas démarré"
Le script essaie de démarrer Docker automatiquement. Attendez 30-60 secondes.

### "Erreur lors de la construction"
```powershell
# Nettoyage complet et reconstruction
docker-compose down -v
docker system prune -f
.\start-docker.ps1
```

### "Le port est déjà utilisé"
```powershell
# Vérifier les processus utilisant les ports
netstat -ano | findstr "3000"
netstat -ano | findstr "5000"
netstat -ano | findstr "5432"
```

## 📚 Commandes manuelles

Si vous préférez les commandes manuelles :

```powershell
# Construction
docker-compose build

# Démarrage
docker-compose up -d

# Logs
docker-compose logs -f

# Arrêt
docker-compose down

# Arrêt avec suppression des données
docker-compose down -v
```

## 🔐 Configuration

Modifiez le fichier `.env` pour personnaliser :
- Mots de passe PostgreSQL
- JWT Secret
- Ports des services

## 💾 Sauvegarde de la base de données

```powershell
# Sauvegarder
docker-compose exec postgres pg_dump -U postgres last_realm > backup.sql

# Restaurer
Get-Content backup.sql | docker-compose exec -T postgres psql -U postgres last_realm
```
