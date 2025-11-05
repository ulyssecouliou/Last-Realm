Je te présente à la fois le lore, le gameplay, les mécaniques, et l’expérience joueur, comme si tu préparais un vrai game design document (GDD) pour ton projet.

🕯️ Last Realm
🎭 Pitch narratif

“Le dernier royaume se meurt. Les ombres déferlent, les dieux se sont tus,
et toi, survivant oublié, es le dernier rempart entre la lumière et le néant.”

Dans Last Realm, tu incarnes un héros solitaire — un ancien chevalier, mage, ou rôdeur — errant dans un monde en ruines.
Ton objectif : survivre aux vagues infinies de créatures corrompues, repousser les ténèbres, et restaurer l’équilibre du royaume déchu.

⚔️ Genre

Survivor / Action Arena / Roguelite

Mélange entre Vampire Survivors, Hades et Dark Souls (ambiance et progression).

🌍 Univers

Le jeu se déroule dans le Royaume d’Eldara, autrefois prospère, désormais consumé par la Brume d’Obsidienne, une corruption magique issue d’un ancien rituel interdit.

Chaque vague représente une faille d’où émergent des entités cauchemardesques :
gobelins maudits, spectres, nécromanciens, dragons de cendres...

🧙‍♂️ Personnages jouables

Chaque personnage a des stats et un gameplay différent :

Classe	Description	Spécialité
Chevalier déchu	Survivant d’une ancienne armée, manie l’épée et le bouclier.	Défense & mêlée
Arcaniste	Mage manipulant la brume pour en faire une arme.	Dégâts de zone & magie
Rôdeur des forêts	Tireur agile, se déplace rapidement.	Attaque à distance
Templier corrompu	Guerrier utilisant la magie noire pour se renforcer.	Vampirisme & rage
🧩 Gameplay principal

Le jeu se joue en vue de dessus (top-down) sur une carte semi-ouverte :

Déplacements clavier (ZQSD).

Attaque automatique selon l’arme.

Système de vagues : les ennemis apparaissent en groupes croissants.

Système d’expérience : chaque monstre tué donne des fragments d’âme.

À chaque niveau, tu choisis une amélioration (upgrade).

⚙️ Mécaniques principales
🩸 1. Vagues ennemies

Les vagues durent 60–90 secondes chacune.

Plus la vague est élevée, plus les ennemis :

sont rapides,

infligent de gros dégâts,

arrivent en plus grand nombre.

⚔️ 2. Upgrades (améliorations)

À chaque montée de niveau, le joueur choisit entre 3 upgrades aléatoires (provenant du backend via /api/upgrades).

Exemples :

+15 % vitesse d’attaque

+20 % de santé max

Nouvelle compétence : Lame spectrale

Aura magique qui brûle les ennemis proches

Invocation d’un esprit allié

Les upgrades peuvent être communes, rares, épiques ou légendaires (selon leur puissance).

💰 3. Récompenses & progression

Entre deux parties, le joueur conserve :

Son or, pour acheter des upgrades permanentes.

Les artefacts trouvés, qui changent le gameplay.

Son score, affiché dans un classement global via l’API /api/leaderboard.

🧠 Système de backend REST (Node.js)

/api/player → gère le profil, les stats, les upgrades débloquées.

/api/upgrades → fournit des upgrades disponibles selon le niveau.

/api/score → enregistre les scores des parties.

/api/leaderboard → affiche le classement des meilleurs survivants.

🧱 Technologie

Frontend : React + Canvas (ou PixiJS pour le rendu 2D fluide)

Backend : Node.js + Express + MongoDB

Communication : API REST (JSON)

Sprites : 16-bit style “dark fantasy” (itch.io / OpenGameArt)

Audio : ambiances médiévales et sons d’épées/magie

🌌 Ambiance visuelle & sonore

Style graphique : sombre, légèrement pixel-art, tons or, pourpre et gris.

Ambiance sonore :

musique lente, dramatique, avec chœurs et tambours,

sons percutants pour les attaques,

murmures et échos en fond (pour la brume).

🏁 Objectif du joueur

Survivre le plus longtemps possible.
Chaque minute gagnée augmente le score et débloque :

de nouvelles cartes,

de nouvelles armes,

et des secrets du lore du royaume.

Le joueur finit par découvrir la vérité : il est le dernier fragment d’âme du roi, condamné à combattre éternellement dans un royaume figé hors du temps.
