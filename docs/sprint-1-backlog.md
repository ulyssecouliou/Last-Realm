# Sprint 1 - Backlog détaillé (proposition)

## Sprint Goal
"Permettre à un nouveau joueur de créer un compte, choisir un personnage et terminer un run PVE court avec power-ups afin de mesurer la rétention jour 1."

## User stories clés
1) En tant que nouveau joueur, je peux créer un compte et me connecter pour accéder au jeu.  
   - AC : register/login via UI, messages d'erreur clairs, token stocké, routes protégées testées.
2) En tant que joueur connecté, je sélectionne un personnage et je vois ses stats de base.  
   - AC : 3 classes dispo, stats affichées, sélection persistée pour le run.
3) En tant que joueur, je peux lancer un run PVE de 3 vagues et voir un récap de fin de run.  
   - AC : vagues progressives, mini-boss, fin de run affiche score/XP/or, aucun crash critique.
4) En tant que joueur, je choisis des power-ups pendant le run pour varier mon build.  
   - AC : min 6 power-ups alignés avec `POWERUPS_CONFIG`, tirage aléatoire cohérent, effet appliqué en jeu.
5) En tant que PM, je mesure l'usage du run (start/end) pour suivre le taux de complétion.  
   - AC : événements loggés (start, end, abandon si dispo), export simple en console/log serveur.

## Tâches front (exemples)
- Auth UI : pages Login/Register (`auth/Login.js`, `auth/Register.js`), gestion erreurs et loaders.
- Store auth : sécuriser le token, rafraîchir la session, protéger les routes (`ProtectedRoute.js`).
- Sélection personnage : réutiliser/ajuster `CharacterSelector.js` + affichage stats.
- Power-ups : connecter la config `POWERUPS_CONFIG.js` et affichage des choix en run.
- Boucle run : s'assurer du flux dans `components/Game.js` (vagues, mini-boss, fin de run), écran récap.
- UX : onboarding rapide (<3 clics), retours visuels sur power-ups pris, états vides/erreurs.

## Tâches back (exemples)
- Auth routes : register/login, JWT, middleware `auth.js`, validation basique.
- Ressources : endpoints game/run (start/end), persistance run (score, XP, or, power-ups utilisés).
- Modèles : `User`, `Player`, `Powerup` (ou équivalent) pour sauvegarder le profil et les runs.
- Power-ups : exposer la liste côté API ou servir la config front si plus rapide.
- Logs/analytics : journaliser événements start/end run dans les logs applicatifs.

## Définition de terminé (DoD)
- Tests manuels : parcours complet register -> sélectionner personnage -> lancer run -> finir run -> voir récap, sans blocant.
- Pas d'erreur console critique (front/back) sur le parcours principal.
- Données persistées : utilisateur, sélection personnage, résultat de run.
- Documentation courte : comment lancer le front/back en local et créer un run test.
- Démo prête : scénario de démo de 3 minutes documenté.

## Mesures de succès du sprint
- Taux de complétion du run sur les comptes créés pendant le sprint > 60 % (sur échantillon interne/tests).
- Temps moyen pour atteindre l'écran de jeu (du login à la première vague) < 90 s en environnement dev.
