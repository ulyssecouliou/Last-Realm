-- Script d'initialisation de la base de données
-- Ce script est exécuté automatiquement lors de la création du container PostgreSQL

-- Création des tables (Sequelize les créera automatiquement, ce fichier est optionnel)
-- Vous pouvez ajouter ici des données initiales si nécessaire

-- Exemple : Insertion de données de test
-- INSERT INTO users (username, email, password, created_at, updated_at) 
-- VALUES ('admin', 'admin@lastrealm.com', '$2a$10$...', NOW(), NOW());

-- Extensions PostgreSQL utiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
