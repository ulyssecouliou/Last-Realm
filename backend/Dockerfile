# Backend Dockerfile
FROM node:20-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install --only=production

# Copier le reste des fichiers de l'application
COPY . .

# Exposer le port du backend
EXPOSE 5000

# Commande de démarrage
CMD ["npm", "start"]
