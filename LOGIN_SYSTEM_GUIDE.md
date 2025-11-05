# 🕯️ Last Realm - Système de Login

## Vue d'ensemble

Le système de login de Last Realm permet aux utilisateurs de créer un compte et d'accéder à la page d'accueil du jeu. Il utilise une authentification JWT sécurisée avec un thème dark fantasy immersif.

## Fonctionnalités

### ✅ Authentification complète
- **Inscription** : Création de compte avec validation
- **Connexion** : Authentification sécurisée
- **Déconnexion** : Nettoyage des sessions
- **Protection des routes** : Accès sécurisé aux pages

### 🔐 Sécurité
- **Hachage des mots de passe** avec bcryptjs
- **Tokens JWT** avec expiration (7 jours)
- **Validation côté client et serveur**
- **Protection CORS** configurée

### 🎨 Interface utilisateur
- **Thème dark fantasy** adapté au jeu
- **Design responsive** pour tous les appareils
- **Animations fluides** et effets visuels
- **Messages d'erreur** informatifs

## Architecture

### Backend (Node.js + Express + PostgreSQL)
```
backend/
├── config/
│   └── database.js          # Configuration PostgreSQL
├── middleware/
│   └── auth.js              # Middleware JWT
├── models/
│   ├── User.js              # Modèle utilisateur Sequelize
│   └── index.js             # Export des modèles
├── routes/
│   ├── auth.js              # Routes d'authentification
│   └── users.js             # Routes utilisateurs
└── server.js                # Serveur principal
```

### Frontend (React + Zustand)
```
frontend/src/
├── components/
│   ├── auth/
│   │   ├── Login.js         # Composant de connexion
│   │   ├── Register.js      # Composant d'inscription
│   │   └── Auth.css         # Styles d'authentification
│   ├── Dashboard.js         # Page d'accueil protégée
│   ├── Dashboard.css        # Styles du dashboard
│   └── ProtectedRoute.js    # Composant de route protégée
├── store/
│   └── authStore.js         # Store Zustand pour l'auth
└── App.js                   # Routeur principal
```

## API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur
- `POST /api/auth/logout` - Déconnexion
- `PUT /api/auth/profile` - Mise à jour du profil

### Utilisateurs
- `GET /api/users` - Liste des utilisateurs
- `GET /api/users/:id` - Utilisateur par ID
- `POST /api/users` - Créer un utilisateur
- `PUT /api/users/:id` - Modifier un utilisateur
- `DELETE /api/users/:id` - Supprimer un utilisateur

## Utilisation

### 1. Démarrer les serveurs

**Backend :**
```bash
cd backend
npm run dev
```
Le serveur démarre sur http://localhost:5000

**Frontend :**
```bash
cd frontend
npm start
```
L'application démarre sur http://localhost:3000

### 2. Créer un compte
1. Accédez à http://localhost:3000
2. Cliquez sur "Créer un compte"
3. Remplissez le formulaire :
   - Nom d'utilisateur (min. 3 caractères)
   - Email valide
   - Mot de passe (min. 6 caractères)
   - Prénom et nom (optionnels)
4. Cliquez sur "Créer le compte"

### 3. Se connecter
1. Utilisez votre email et mot de passe
2. Cliquez sur "Se connecter"
3. Vous êtes redirigé vers le dashboard

### 4. Dashboard
- **Bienvenue personnalisée** avec le nom d'utilisateur
- **Bouton de démarrage du jeu** (à implémenter)
- **Statistiques du joueur** (placeholder)
- **Informations sur le jeu** et ses fonctionnalités
- **Bouton de déconnexion**

## Configuration

### Variables d'environnement Backend (.env)
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=last-realm
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

### Variables d'environnement Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
GENERATE_SOURCEMAP=false
```

## Modèle de données

### Utilisateur (User)
```javascript
{
  id: UUID (Primary Key),
  username: String (Unique, 3-50 chars),
  email: String (Unique, Email format),
  password: String (Hashed, 6+ chars),
  firstName: String (Optional, 1-50 chars),
  lastName: String (Optional, 1-50 chars),
  isActive: Boolean (Default: true),
  lastLogin: Date (Optional),
  createdAt: Date,
  updatedAt: Date
}
```

## Sécurité

### Côté Backend
- **Mots de passe hachés** avec bcryptjs (salt rounds: 10)
- **Tokens JWT** signés avec clé secrète
- **Validation Sequelize** sur tous les champs
- **Gestion des erreurs** appropriée
- **Headers CORS** configurés

### Côté Frontend
- **Stockage sécurisé** des tokens (localStorage avec Zustand persist)
- **Validation des formulaires** en temps réel
- **Nettoyage automatique** des tokens expirés
- **Routes protégées** avec redirection

## Prochaines étapes

1. **Intégration du jeu** : Connecter le bouton "Commencer la bataille"
2. **Statistiques réelles** : Implémenter le tracking des scores
3. **Profil utilisateur** : Page de gestion du profil
4. **Classements** : Système de leaderboard
5. **Récupération de mot de passe** : Système de reset
6. **Vérification email** : Confirmation d'inscription

## Dépannage

### Erreurs communes

**"Connection refused" :**
- Vérifiez que PostgreSQL est démarré
- Vérifiez les credentials dans .env

**"Token expired" :**
- Reconnectez-vous pour obtenir un nouveau token

**"CORS error" :**
- Vérifiez que CORS_ORIGIN correspond à l'URL du frontend

**"Module not found" :**
- Exécutez `npm install` dans le dossier concerné

## Support

Pour toute question ou problème, consultez :
- Les logs du serveur backend
- La console du navigateur pour les erreurs frontend
- Les fichiers de configuration .env

---

🎮 **Bon jeu dans Last Realm !** ⚔️
