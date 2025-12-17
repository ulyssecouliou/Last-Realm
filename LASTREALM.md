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

À chaque montée de niveau (ou en ramassant certains bonus sur la carte), le joueur choisit entre **3 améliorations** aléatoires.

Les améliorations sont séparées en 2 pools :

- **Pool commun (toutes classes)**
- **Pool de classe** (spécifique au héros choisi)

### Pool commun (toutes classes)

| ID | Effet |
|---|---|
| `player_speed` | +50% vitesse de déplacement |
| `damage_bonus` | +30% dégâts |
| `damage_reduction` | -20% dégâts subis |
| `hp_up` | +50 PV max et +30 PV |

### Pool Chevalier (Knight)

| ID | Effet |
|---|---|
| `sword_size` | +20% taille/hitbox de l’épée |
| `sword_spin` | +30% vitesse de rotation de l’épée |
| `sword_count` | +1 épée |

### Pool Rôdeur (Ranger)

| ID | Effet |
|---|---|
| `multi_shot` | +1 flèche par attaque |
| `attack_speed` | +30% tirs par seconde |
| `size_bonus` | +20% taille des projectiles |

### Pool Arcaniste (Mage)

| ID | Effet |
|---|---|
| `multi_shot` | +1 boule par attaque |
| `attack_speed` | +30% tirs par seconde |
| `explosion_size` | +80% taille/rayon d’explosion |

### Pool Templier (Templar)

| ID | Effet |
|---|---|
| `spear_count` | +1 lance (sans limite) |
| `spear_size` | +20% taille de la lance |
| `spear_speed` | +30% vitesse d’attaque de la lance |

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
