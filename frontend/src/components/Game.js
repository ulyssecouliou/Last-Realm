import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as PIXI from 'pixi.js';
import PowerupSelector from './PowerupSelector';
import CharacterSelector from './CharacterSelector';
import {
  Warrior,
  Wizard,
  Rogue,
  FallenKnight,
  Monster,
  EpicMonster,
  Fireball,
  Sword,
  Spear,
  Arrow,
  Projectile,
  Powerup,
  MAP_WIDTH,
  MAP_HEIGHT
} from './gameClasses';

const Game = () => {
  const gameRef = useRef(null);
  const appRef = useRef(null);
  const playerRef = useRef(null);
  const keysRef = useRef({ left: false, right: false, up: false, down: false });
  const monstersRef = useRef([]);
  const epicMonstersRef = useRef([]);
  const fireballsRef = useRef([]);
  const swordRef = useRef(null);
  const spearRef = useRef(null);
  const healthDisplayRef = useRef(null);
  const levelDisplayRef = useRef(null);
  const cameraRef = useRef({ x: 0, y: 0 });
  const backgroundRef = useRef(null);
  const powerupsRef = useRef([]);
  const projectilesRef = useRef([]);
  const arrowsRef = useRef([]);
  const [showPowerupSelector, setShowPowerupSelector] = useState(false);
  const [currentPowerup, setCurrentPowerup] = useState(null);
  const [showCharacterSelector, setShowCharacterSelector] = useState(true);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const powerupSelectorTimeoutRef = useRef(null);
  const powerupCollisionDetectedRef = useRef(false);
  const gameWorldRef = useRef(null);
  const navigate = useNavigate();

  // Handler pour la sélection du personnage
  const handleCharacterSelect = (character) => {
    console.log('Personnage sélectionné:', character.id);
    setSelectedCharacter(character);
    setShowCharacterSelector(false);
  };

  useEffect(() => {
    if (!selectedCharacter) return; // Ne pas initialiser le jeu sans personnage sélectionné

    console.log('🎮 Game component mounted - Initializing game');
    const initializeGame = async () => {
      try {
        // Pré-charger tous les assets
        try {
          await PIXI.Assets.load([
            '/—Pngtree—knight avatar soldier with shield_23256476.png',
            '/magicien.png',
            '/rodeur.png',
            '/templier_dechu.png',
            '/projectile.png',
            '/fleche.png',
            '/epee.png',
            '/lance.png',
            '/monster.png.png',
            '/monstreEpique.png',
            '/—Pngtree—pixel art red heart vector_21298284.png'
          ]);
          console.log('✅ Tous les assets chargés');
        } catch (error) {
          console.log('⚠️ Certains assets n\'ont pas pu être chargés:', error);
        }

        // Créer l'application PixiJS
        const app = new PIXI.Application();
        await app.init({
          width: window.innerWidth,
          height: window.innerHeight,
          backgroundColor: 0x2c1810,
          antialias: true
        });

        appRef.current = app;
        if (gameRef.current && app.canvas) {
          gameRef.current.appendChild(app.canvas);
        }

        // Créer un conteneur pour le monde du jeu (séparé de l'UI)
        const gameWorld = new PIXI.Container();
        gameWorldRef.current = gameWorld;
        app.stage.addChild(gameWorld);

        // Créer un conteneur UI séparé qui ne bouge pas avec la caméra
        const uiContainer = new PIXI.Container();

        // Charger l'arrière-plan map2.jpeg (zoom x4)
        try {
          const backgroundTexture = await PIXI.Assets.load('/map2.jpeg');
          const background = new PIXI.Sprite(backgroundTexture);
          // Agrandir la map 4x pour effet de zoom
          background.width = MAP_WIDTH;
          background.height = MAP_HEIGHT;
          background.x = 0;
          background.y = 0;
          gameWorld.addChild(background);
          backgroundRef.current = background;
          console.log('Map2.jpeg chargée et agrandie (2400x2400)');
        } catch (error) {
          console.log('Erreur chargement map2.jpeg:', error);
          // Créer un arrière-plan de remplacement
          const fallbackBg = new PIXI.Graphics();
          fallbackBg.beginFill(0x4a90e2);
          fallbackBg.drawRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
          fallbackBg.endFill();
          gameWorld.addChild(fallbackBg);
          backgroundRef.current = fallbackBg;
        }

        // Créer le joueur au centre de la map en fonction du personnage sélectionné
        let player;
        switch(selectedCharacter.id) {
          case 'wizard':
            player = new Wizard(MAP_WIDTH / 2, MAP_HEIGHT / 2);
            break;
          case 'rogue':
            player = new Rogue(MAP_WIDTH / 2, MAP_HEIGHT / 2);
            break;
          case 'fallen_knight':
            player = new FallenKnight(MAP_WIDTH / 2, MAP_HEIGHT / 2);
            break;
          case 'warrior':
          default:
            player = new Warrior(MAP_WIDTH / 2, MAP_HEIGHT / 2);
            break;
        }
        playerRef.current = player;
        
        // Initialiser la caméra centrée sur le joueur
        cameraRef.current.x = player.x - app.screen.width / 2;
        cameraRef.current.y = player.y - app.screen.height / 2;

        // Créer l'affichage de la vie
        const createHealthDisplay = async () => {
          try {
            const heartTexture = await PIXI.Assets.load('/—Pngtree—pixel art red heart vector_21298284.png');
            const healthContainer = new PIXI.Container();
            
            // Créer le coeur (en haut à droite)
            const heartSprite = new PIXI.Sprite(heartTexture);
            heartSprite.scale.set(0.05);
            heartSprite.x = app.screen.width - 120;
            heartSprite.y = 20;
            
            // Créer le texte de vie (en haut à droite)
            const healthText = new PIXI.Text(`${player.health}/${player.maxHealth}`, {
              fontFamily: 'Arial',
              fontSize: 24,
              fill: 0xffffff,
              stroke: 0x000000,
              strokeThickness: 2
            });
            healthText.x = app.screen.width - 80;
            healthText.y = 25;
            
            healthContainer.addChild(heartSprite);
            healthContainer.addChild(healthText);
            uiContainer.addChild(healthContainer);
            
            healthDisplayRef.current = { container: healthContainer, text: healthText };
            console.log('Affichage de vie créé');
          } catch (error) {
            console.error('Erreur chargement coeur:', error);
            // Fallback sans image (en haut à droite)
            const healthText = new PIXI.Text(`❤️ ${player.health}/${player.maxHealth}`, {
              fontFamily: 'Arial',
              fontSize: 24,
              fill: 0xff0000
            });
            healthText.x = app.screen.width - 120;
            healthText.y = 20;
            uiContainer.addChild(healthText);
            healthDisplayRef.current = { text: healthText };
          }
        };

        await createHealthDisplay();
        
        // Créer l'affichage du niveau et de l'expérience
        const createLevelDisplay = () => {
          // Créer le texte de niveau (en haut à gauche)
          const levelText = new PIXI.Text(`Niveau: ${player.level}`, {
            fontFamily: 'Arial',
            fontSize: 20,
            fill: 0xd4af37,
            stroke: 0x000000,
            strokeThickness: 2
          });
          levelText.x = 20;
          levelText.y = 20;
          
          // Créer le texte d'expérience (en haut à gauche, sous le niveau)
          const expText = new PIXI.Text(`EXP: ${player.experience}/${player.experienceToNextLevel}`, {
            fontFamily: 'Arial',
            fontSize: 16,
            fill: 0x88dd88,
            stroke: 0x000000,
            strokeThickness: 2
          });
          expText.x = 20;
          expText.y = 45;
          
          uiContainer.addChild(levelText);
          uiContainer.addChild(expText);
          
          levelDisplayRef.current = { levelText, expText };
          console.log('Affichage niveau et expérience créé');
        };
        
        createLevelDisplay();
        
        // Ajouter le conteneur UI au stage (après le monde du jeu pour qu'il soit au-dessus)
        app.stage.addChild(uiContainer);

        // Charger le sprite du joueur en fonction du personnage sélectionné
        try {
          const characterImages = {
            'warrior': '/—Pngtree—knight avatar soldier with shield_23256476.png',
            'wizard': '/magicien.png',
            'rogue': '/rodeur.png',
            'fallen_knight': '/templier_dechu.png'
          };
          
          const imageUrl = characterImages[selectedCharacter.id] || characterImages['warrior'];
          const texture = await PIXI.Assets.load(imageUrl);
          const sprite = new PIXI.Sprite(texture);
          sprite.anchor.set(0.5);
          
          // Adapter la taille en fonction du personnage
          let scale = 0.03;
          if (selectedCharacter.id === 'wizard') scale = 0.15;
          else if (selectedCharacter.id === 'rogue') scale = 0.12;
          else if (selectedCharacter.id === 'fallen_knight') scale = 0.12;
          
          sprite.scale.set(scale);
          player.setSprite(sprite);
          gameWorld.addChild(sprite);
          console.log('Sprite du joueur chargé:', selectedCharacter.id, 'scale:', scale);
        } catch (error) {
          // Sprite de remplacement (taille normale)
          const fallbackSprite = new PIXI.Graphics();
          fallbackSprite.beginFill(0x66CCFF);
          fallbackSprite.drawCircle(0, 0, 12); // Taille réduite pour correspondre aux monstres
          fallbackSprite.endFill();
          player.setSprite(fallbackSprite);
          gameWorld.addChild(fallbackSprite);
          console.log('Sprite de remplacement créé');
        }

        // Créer l'épée SEULEMENT pour le guerrier (Warrior)
        if (player instanceof Warrior) {
          const sword = new Sword(player);
          swordRef.current = sword;

          // Charger le sprite de l'épée
          try {
            const swordTexture = await PIXI.Assets.load('/epee.png');
            const swordSprite = new PIXI.Sprite(swordTexture);
            swordSprite.anchor.set(0.5);
            swordSprite.scale.set(0.5); // Taille de l'épée agrandie x10 (0.05 * 10 = 0.5)
            sword.setSprite(swordSprite);
            gameWorld.addChild(swordSprite);
            console.log('Épée chargée pour le guerrier');
          } catch (error) {
            console.log('Erreur chargement épée, création sprite de remplacement');
            // Sprite de remplacement pour l'épée
            const fallbackSword = new PIXI.Graphics();
            fallbackSword.beginFill(0xC0C0C0); // Couleur argent
            fallbackSword.drawRect(-20, -150, 40, 300); // Forme d'épée agrandie x10
            fallbackSword.endFill();
            sword.setSprite(fallbackSword);
            gameWorld.addChild(fallbackSword);
            console.log('Sprite de remplacement épée créé');
          }
        }

        // Créer la lance SEULEMENT pour le Templier Déchu (FallenKnight)
        if (player instanceof FallenKnight) {
          const spear = new Spear(player);
          spearRef.current = spear;

          // Charger le sprite de la lance
          try {
            const spearTexture = await PIXI.Assets.load('/lance.png');
            const spearSprite = new PIXI.Sprite(spearTexture);
            spearSprite.anchor.set(0, 0.5);
            spearSprite.scale.set(0.4);
            spear.setSprite(spearSprite);
            gameWorld.addChild(spearSprite);
            console.log('Lance chargée pour le templier déchu');
          } catch (error) {
            console.log('Erreur chargement lance, création sprite de remplacement');
            // Sprite de remplacement pour la lance
            const fallbackSpear = new PIXI.Graphics();
            fallbackSpear.beginFill(0x8B4513); // Couleur marron pour le manche
            fallbackSpear.drawRect(0, -5, 100, 10);
            fallbackSpear.endFill();
            fallbackSpear.beginFill(0xC0C0C0); // Couleur argent pour la pointe
            fallbackSpear.moveTo(100, -10);
            fallbackSpear.lineTo(130, 0);
            fallbackSpear.lineTo(100, 10);
            fallbackSpear.closePath();
            fallbackSpear.endFill();
            spear.setSprite(fallbackSpear);
            gameWorld.addChild(fallbackSpear);
            console.log('Sprite de remplacement lance créé');
          }

          // Créer la hitbox visible de la lance (cercle rouge semi-transparent)
          const spearHitbox = new PIXI.Graphics();
          spearHitbox.beginFill(0xFF0000, 0.3); // Rouge semi-transparent
          spearHitbox.drawCircle(0, 0, 65); // Augmenté pour correspondre au sprite entier
          spearHitbox.endFill();
          spear.setHitbox(spearHitbox);
          gameWorld.addChild(spearHitbox);
          console.log('Hitbox de la lance créée');
        }

        // Gestion des entrées
        const handleKeyDown = (event) => {
          switch(event.code) {
            case 'ArrowLeft': keysRef.current.left = true; break;
            case 'ArrowRight': keysRef.current.right = true; break;
            case 'ArrowUp': keysRef.current.up = true; break;
            case 'ArrowDown': keysRef.current.down = true; break;
          }
        };

        const handleKeyUp = (event) => {
          switch(event.code) {
            case 'ArrowLeft': keysRef.current.left = false; break;
            case 'ArrowRight': keysRef.current.right = false; break;
            case 'ArrowUp': keysRef.current.up = false; break;
            case 'ArrowDown': keysRef.current.down = false; break;
          }
        };

        // Ajouter les écouteurs
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        // Fonction pour créer un monstre
        const createMonster = async () => {
          try {
            // Position aléatoire sur les bords de la map
            const side = Math.floor(Math.random() * 4);
            let x, y;
            
            switch(side) {
              case 0: // Haut
                x = Math.random() * MAP_WIDTH;
                y = -50;
                break;
              case 1: // Droite
                x = MAP_WIDTH + 50;
                y = Math.random() * MAP_HEIGHT;
                break;
              case 2: // Bas
                x = Math.random() * MAP_WIDTH;
                y = MAP_HEIGHT + 50;
                break;
              case 3: // Gauche
                x = -50;
                y = Math.random() * MAP_HEIGHT;
                break;
            }

            const monster = new Monster(x, y, playerRef.current);
            
            // Charger le sprite du monstre avec fallback
            try {
              const monsterTexture = await PIXI.Assets.load('/monster.png.png');
              const monsterSprite = new PIXI.Sprite(monsterTexture);
              monsterSprite.anchor.set(0.5);
              monsterSprite.scale.set(0.225); // Taille augmentée de 25% supplémentaire (0.18 * 1.25 = 0.225)
              monster.setSprite(monsterSprite);
              gameWorld.addChild(monsterSprite);
            } catch (error) {
              console.log('Image monstre non trouvée, création sprite de remplacement');
              // Sprite de remplacement pour le monstre (taille x4)
              const fallbackMonster = new PIXI.Graphics();
              // Corps rouge (taille x4)
              fallbackMonster.beginFill(0xff0000);
              fallbackMonster.drawCircle(0, 0, 90); // Taille augmentée de 25% supplémentaire (72 * 1.25 = 90)
              fallbackMonster.endFill();
              // Yeux blancs (taille x4)
              fallbackMonster.beginFill(0xffffff);
              fallbackMonster.drawCircle(-30, -22.5, 22.5); // Augmenté de 25% supplémentaire
              fallbackMonster.drawCircle(30, -22.5, 22.5); // Augmenté de 25% supplémentaire
              fallbackMonster.endFill();
              // Pupilles noires (taille x4)
              fallbackMonster.beginFill(0x000000);
              fallbackMonster.drawCircle(-30, -22.5, 11.25); // Augmenté de 25% supplémentaire
              fallbackMonster.drawCircle(30, -22.5, 11.25); // Augmenté de 25% supplémentaire
              fallbackMonster.endFill();
              monster.setSprite(fallbackMonster);
              gameWorld.addChild(fallbackMonster);
            }
            
            monstersRef.current.push(monster);
            console.log('Monstre créé à la position:', x, y);
          } catch (error) {
            console.error('Erreur création monstre:', error);
          }
        };

        // Créer le premier monstre immédiatement pour tester
        await createMonster();
        
        // Spawn des monstres toutes les 5 secondes
        const monsterSpawnInterval = setInterval(createMonster, 5000);

        // Fonction pour créer un monstre épique
        const createEpicMonster = async () => {
          try {
            // Position aléatoire sur la map (loin du joueur)
            let x, y;
            do {
              x = Math.random() * MAP_WIDTH;
              y = Math.random() * MAP_HEIGHT;
              const dx = x - playerRef.current.x;
              const dy = y - playerRef.current.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              // Spawn à au moins 400px du joueur
              if (distance > 400) break;
            } while (true);

            const epicMonster = new EpicMonster(x, y);

            // Charger le sprite du monstre épique
            try {
              const epicTexture = await PIXI.Assets.load('/monstreEpique.png');
              const epicSprite = new PIXI.Sprite(epicTexture);
              epicSprite.anchor.set(0.5);
              epicSprite.scale.set(0.2); // Plus grand que les monstres normaux
              epicMonster.setSprite(epicSprite);
              gameWorldRef.current.addChild(epicSprite);
              console.log('👹 Monstre épique créé!');
            } catch (error) {
              console.log('Erreur chargement monstre épique, création sprite de remplacement');
              const fallbackSprite = new PIXI.Graphics();
              fallbackSprite.beginFill(0xFF0000); // Rouge vif
              fallbackSprite.drawCircle(0, 0, 30);
              fallbackSprite.endFill();
              fallbackSprite.beginFill(0xFF4500);
              fallbackSprite.drawCircle(0, 0, 20);
              fallbackSprite.endFill();
              epicMonster.setSprite(fallbackSprite);
              gameWorldRef.current.addChild(fallbackSprite);
            }

            // Créer la barre de vie du monstre épique
            const healthBarBackground = new PIXI.Graphics();
            healthBarBackground.beginFill(0x333333);
            healthBarBackground.drawRect(0, 0, 80, 8);
            healthBarBackground.endFill();
            healthBarBackground.x = x - 40;
            healthBarBackground.y = y - 50;
            gameWorldRef.current.addChild(healthBarBackground);

            const healthBar = new PIXI.Graphics();
            healthBar.beginFill(0x00FF00);
            healthBar.drawRect(0, 0, 80, 8);
            healthBar.endFill();
            healthBar.x = x - 40;
            healthBar.y = y - 50;
            gameWorldRef.current.addChild(healthBar);

            epicMonster.setHealthBar(healthBarBackground, healthBar);

            epicMonstersRef.current.push(epicMonster);
          } catch (error) {
            console.error('Erreur création monstre épique:', error);
          }
        };

        // Créer le premier monstre épique après 10 secondes
        setTimeout(createEpicMonster, 10000);
        
        // Spawn d'un monstre épique toutes les 30 secondes
        const epicMonsterSpawnInterval = setInterval(createEpicMonster, 30000);

        // Fonction pour créer un powerup
        const createPowerup = async (x, y, type) => {
          try {
            const powerup = new Powerup(x, y, type);
            
            // Configuration des couleurs
            const powerupColors = {
              speed_boost: 0xFFD700,
              rotation_speed: 0xFF6B6B,
              size_boost: 0x4ECDC4
            };
            
            // Créer le sprite du powerup
            const powerupSprite = new PIXI.Graphics();
            const color = powerupColors[type] || 0xFFFFFF;
            
            // Dessiner un carré/boîte pour le powerup
            powerupSprite.beginFill(color);
            powerupSprite.drawRect(-25, -25, 50, 50);
            powerupSprite.endFill();
            
            // Ajouter une bordure brillante
            powerupSprite.lineStyle(3, 0xFFFFFF, 0.8);
            powerupSprite.drawRect(-25, -25, 50, 50);
            
            powerupSprite.anchor?.set(0.5);
            powerup.setSprite(powerupSprite);
            gameWorld.addChild(powerupSprite);
            powerupsRef.current.push(powerup);
            
            console.log('✨ Powerup créé:', type, 'à', x, y, 'Total powerups:', powerupsRef.current.length);
          } catch (error) {
            console.error('Erreur création powerup:', error);
          }
        };

        // Créer le premier powerup IMMÉDIATEMENT près du joueur pour tester
        createPowerup(MAP_WIDTH / 2 + 100, MAP_HEIGHT / 2, 'speed_boost');
        
        // Spawn des powerups toutes les 15 secondes
        const powerupSpawnInterval = setInterval(() => {
          // Position aléatoire sur la map
          const x = Math.random() * MAP_WIDTH;
          const y = Math.random() * MAP_HEIGHT;
          
          // Type de powerup aléatoire
          const types = ['speed_boost', 'rotation_speed', 'size_boost'];
          const randomType = types[Math.floor(Math.random() * types.length)];
          
          createPowerup(x, y, randomType);
        }, 15000);

        // Fonction pour mettre à jour l'affichage de la vie
        const updateHealthDisplay = () => {
          if (healthDisplayRef.current && healthDisplayRef.current.text) {
            const healthText = healthDisplayRef.current.container ? 
              `${playerRef.current.health}/${playerRef.current.maxHealth}` :
              `❤️ ${playerRef.current.health}/${playerRef.current.maxHealth}`;
            healthDisplayRef.current.text.text = healthText;
          }
        };

        // Fonction pour mettre à jour l'affichage du niveau et de l'expérience
        const updateLevelDisplay = () => {
          if (levelDisplayRef.current && levelDisplayRef.current.levelText) {
            levelDisplayRef.current.levelText.text = `Niveau: ${playerRef.current.level}`;
            levelDisplayRef.current.expText.text = `EXP: ${playerRef.current.experience}/${playerRef.current.experienceToNextLevel}`;
          }
        };

        // Fonction pour mettre à jour la caméra
        const updateCamera = () => {
          if (playerRef.current) {
            // Centrer la caméra sur le joueur
            const targetCameraX = playerRef.current.x - app.screen.width / 2;
            const targetCameraY = playerRef.current.y - app.screen.height / 2;
            
            // Limiter la caméra aux bords de la map
            cameraRef.current.x = Math.max(0, Math.min(MAP_WIDTH - app.screen.width, targetCameraX));
            cameraRef.current.y = Math.max(0, Math.min(MAP_HEIGHT - app.screen.height, targetCameraY));
            
            // Appliquer la transformation de caméra SEULEMENT au monde du jeu
            gameWorld.x = -cameraRef.current.x;
            gameWorld.y = -cameraRef.current.y;
            
            // L'UI reste fixe automatiquement car elle n'est pas dans gameWorld
          }
        };

        // Boucle de jeu avec monstres, collisions, caméra et épée
        const gameLoop = () => {
          if (playerRef.current && playerRef.current.health > 0) {
            // Mettre à jour le joueur avec les limites de la map
            playerRef.current.update(keysRef.current, MAP_WIDTH, MAP_HEIGHT);
            
            // Mettre à jour l'effet de brûlure
            playerRef.current.updateBurn();
            
            // Appliquer le clignotement rouge si brûlé
            if (playerRef.current.sprite) {
              if (playerRef.current.isBurning) {
                // Clignoter rouge : alterner entre rouge et normal tous les 10 frames
                const blink = Math.floor((playerRef.current.burnDamageCounter / 5) % 2) === 0;
                playerRef.current.sprite.tint = blink ? 0xFF0000 : 0xFFFFFF; // Rouge ou blanc
              } else {
                playerRef.current.sprite.tint = 0xFFFFFF; // Couleur normale
              }
            }
            
            // Mettre à jour l'épée
            if (swordRef.current) {
              swordRef.current.update();
            }

            // Mettre à jour la lance
            if (spearRef.current) {
              spearRef.current.update();
            }

            // Tirer automatiquement les projectiles pour le magicien (continu, sans besoin de Tab)
            if (playerRef.current && (playerRef.current instanceof Wizard || playerRef.current.characterType === 'wizard')) {
              const currentTime = Date.now();
              if (playerRef.current.canShoot(currentTime)) {
                const projectile = playerRef.current.shoot(currentTime);
                
                // Créer le sprite du projectile avec l'image
                let projectileSprite;
                try {
                  const projectileTexture = PIXI.Assets.get('/projectile.png');
                  projectileSprite = new PIXI.Sprite(projectileTexture);
                  projectileSprite.scale.set(0.08);
                } catch (error) {
                  // Fallback: créer un cercle magenta si l'image ne charge pas
                  projectileSprite = new PIXI.Graphics();
                  projectileSprite.beginFill(0xFF00FF);
                  projectileSprite.drawCircle(0, 0, 10);
                  projectileSprite.endFill();
                }
                
                projectile.setSprite(projectileSprite);
                gameWorldRef.current.addChild(projectileSprite);
                projectilesRef.current.push(projectile);
                console.log('🔥 Projectile lancé! Direction:', projectile.velocityX.toFixed(2), projectile.velocityY.toFixed(2));
              }
            }

            // Tirer automatiquement les flèches pour le rodeur (continu)
            if (playerRef.current && (playerRef.current instanceof Rogue || playerRef.current.characterType === 'rogue')) {
              const currentTime = Date.now();
              if (playerRef.current.canShoot(currentTime)) {
                const arrow = playerRef.current.shoot(currentTime);
                
                // Créer le sprite de la flèche avec l'image
                let arrowSprite;
                try {
                  const arrowTexture = PIXI.Assets.get('/fleche.png');
                  arrowSprite = new PIXI.Sprite(arrowTexture);
                  arrowSprite.scale.set(0.1);
                } catch (error) {
                  // Fallback: créer un rectangle jaune si l'image ne charge pas
                  arrowSprite = new PIXI.Graphics();
                  arrowSprite.beginFill(0xFFFF00);
                  arrowSprite.drawRect(-15, -5, 30, 10);
                  arrowSprite.endFill();
                }
                
                arrow.setSprite(arrowSprite);
                arrowSprite.x = arrow.x;
                arrowSprite.y = arrow.y;
                gameWorldRef.current.addChild(arrowSprite);

                // Créer la hitbox visible de la flèche (cercle rouge semi-transparent)
                const arrowHitbox = new PIXI.Graphics();
                arrowHitbox.beginFill(0xFF0000, 0.3); // Rouge semi-transparent
                arrowHitbox.drawCircle(0, 0, 45); // Augmenté pour correspondre au sprite entier
                arrowHitbox.endFill();
                arrowHitbox.x = arrow.x;
                arrowHitbox.y = arrow.y;
                arrow.setHitbox(arrowHitbox);
                gameWorldRef.current.addChild(arrowHitbox);

                arrowsRef.current.push(arrow);
                console.log('🏹 Flèche lancée! Position:', arrow.x.toFixed(0), arrow.y.toFixed(0), 'Vélocité:', arrow.velocityX.toFixed(2), arrow.velocityY.toFixed(2));
              }
            }

            // Mettre à jour tous les projectiles
            projectilesRef.current.forEach((projectile) => {
              if (projectile.isAlive) {
                projectile.update(MAP_WIDTH, MAP_HEIGHT);
              }
            });

            // Mettre à jour tous les flèches du rodeur
            arrowsRef.current.forEach((arrow) => {
              if (arrow.isAlive) {
                arrow.update(MAP_WIDTH, MAP_HEIGHT);
              }
            });
            
            // Mettre à jour tous les powerups
            powerupsRef.current.forEach((powerup) => {
              if (powerup.isAlive) {
                powerup.update();
                
                // Vérifier collision avec le joueur (une seule fois)
                if (powerup.checkCollision(playerRef.current) && !powerupCollisionDetectedRef.current) {
                  console.log('Collision détectée avec powerup:', powerup.type);
                  // Afficher le sélecteur de powerup avec le powerup actuel
                  setCurrentPowerup(powerup);
                  setShowPowerupSelector(true);
                  powerupCollisionDetectedRef.current = true;
                }
              }
            });

            // Mettre à jour la caméra pour suivre le joueur
            updateCamera();

            // Mettre à jour tous les monstres (avec évitement de superposition)
            monstersRef.current.forEach((monster) => {
              if (monster.isAlive) {
                // Passer la liste de tous les monstres pour éviter les superpositions
                monster.update(monstersRef.current);
                
                // Vérifier collision avec l'épée
                if (swordRef.current && swordRef.current.checkCollision(monster)) {
                  const isDead = monster.takeDamage(swordRef.current.damage);
                  if (isDead) {
                    console.log('Monstre tué par l\'épée!');
                    // Gagner de l'expérience
                    const levelUp = playerRef.current.gainExperience(25);
                    updateLevelDisplay();
                    if (levelUp) {
                      console.log('🎉 LEVEL UP! Niveau:', playerRef.current.level);
                    }
                  }
                }

                // Vérifier collision avec la lance
                if (spearRef.current && spearRef.current.checkCollision(monster)) {
                  console.log('💥 Collision lance détectée! Monster HP:', monster.health, 'Attaque en cours:', spearRef.current.isAttacking);
                  const isDead = monster.takeDamage(spearRef.current.damage);
                  if (isDead) {
                    console.log('⚔️ Monstre tué par la lance!');
                    // Gagner de l'expérience
                    const levelUp = playerRef.current.gainExperience(25);
                    updateLevelDisplay();
                    if (levelUp) {
                      console.log('🎉 LEVEL UP! Niveau:', playerRef.current.level);
                    }
                  } else {
                    console.log('💔 Monstre blessé par la lance! HP restant:', monster.health);
                  }
                }

                // Vérifier collision avec les projectiles (pour le magicien)
                projectilesRef.current.forEach((projectile) => {
                  if (projectile.isAlive && projectile.checkCollision(monster)) {
                    const isDead = monster.takeDamage(projectile.damage);
                    projectile.destroy();
                    if (isDead) {
                      console.log('Monstre tué par projectile!');
                      // Gagner de l'expérience
                      const levelUp = playerRef.current.gainExperience(25);
                      updateLevelDisplay();
                      if (levelUp) {
                        console.log('🎉 LEVEL UP! Niveau:', playerRef.current.level);
                      }
                    }
                  }
                });

                // Vérifier collision avec les flèches (pour le rodeur)
                arrowsRef.current.forEach((arrow) => {
                  if (arrow.isAlive && arrow.checkCollision(monster)) {
                    console.log('💥 Collision flèche détectée! Monster HP:', monster.health);
                    const isDead = monster.takeDamage(1);
                    arrow.destroy();
                    if (isDead) {
                      console.log('🏹 Monstre tué par flèche!');
                      // Gagner de l'expérience
                      const levelUp = playerRef.current.gainExperience(25);
                      updateLevelDisplay();
                      if (levelUp) {
                        console.log('🎉 LEVEL UP! Niveau:', playerRef.current.level);
                      }
                    } else {
                      console.log('💔 Monstre blessé par flèche! HP restant:', monster.health);
                    }
                  }
                });
                
                // Vérifier collision avec le joueur
                if (monster.checkCollision(playerRef.current)) {
                  const isDead = playerRef.current.takeDamage(1, monster.x, monster.y);
                  updateHealthDisplay();
                  
                  if (isDead) {
                    console.log('Game Over!');
                  }
                }
              }
            });

            // Nettoyer les powerups morts
            powerupsRef.current = powerupsRef.current.filter(powerup => powerup.isAlive);

            // Mettre à jour tous les monstres épiques
            epicMonstersRef.current.forEach((epicMonster) => {
              if (epicMonster.isAlive && playerRef.current) {
                // Mettre à jour position (avec comportement de maintien de distance)
                epicMonster.update(playerRef.current, [...monstersRef.current, ...epicMonstersRef.current]);

                // Tirer des boules de feu
                const currentTime = Date.now();
                if (epicMonster.canShoot(currentTime)) {
                  const fireball = epicMonster.shoot(currentTime, playerRef.current.x, playerRef.current.y);
                  
                  // Créer le sprite de la boule de feu
                  const fireballSprite = new PIXI.Graphics();
                  fireballSprite.beginFill(0xFF4500, 1); // Orange-rouge
                  fireballSprite.drawCircle(0, 0, 15);
                  fireballSprite.endFill();
                  fireballSprite.beginFill(0xFFFF00, 0.8); // Jaune au centre
                  fireballSprite.drawCircle(0, 0, 8);
                  fireballSprite.endFill();
                  fireball.setSprite(fireballSprite);
                  gameWorldRef.current.addChild(fireballSprite);

                  // Créer la hitbox visible de la boule de feu
                  const fireballHitbox = new PIXI.Graphics();
                  fireballHitbox.beginFill(0xFF0000, 0.3);
                  fireballHitbox.drawCircle(0, 0, 30);
                  fireballHitbox.endFill();
                  fireball.setHitbox(fireballHitbox);
                  gameWorldRef.current.addChild(fireballHitbox);

                  fireballsRef.current.push(fireball);
                  console.log('🔥 Boule de feu lancée par le monstre épique!');
                }

                // Vérifier collisions des armes avec le monstre épique
                if (swordRef.current && swordRef.current.checkCollision(epicMonster)) {
                  const isDead = epicMonster.takeDamage(swordRef.current.damage);
                  if (isDead) {
                    console.log('👹 Monstre épique tué par l\'épée!');
                    playerRef.current.gainExperience(100);
                    updateLevelDisplay();
                  }
                }

                if (spearRef.current && spearRef.current.checkCollision(epicMonster)) {
                  const isDead = epicMonster.takeDamage(spearRef.current.damage);
                  if (isDead) {
                    console.log('👹 Monstre épique tué par la lance!');
                    playerRef.current.gainExperience(100);
                    updateLevelDisplay();
                  }
                }

                // Vérifier collision avec les projectiles
                projectilesRef.current.forEach((projectile) => {
                  if (projectile.isAlive && projectile.checkCollision(epicMonster)) {
                    const isDead = epicMonster.takeDamage(projectile.damage);
                    projectile.destroy();
                    if (isDead) {
                      console.log('👹 Monstre épique tué par projectile!');
                      playerRef.current.gainExperience(100);
                      updateLevelDisplay();
                    }
                  }
                });

                // Vérifier collision avec les flèches
                arrowsRef.current.forEach((arrow) => {
                  if (arrow.isAlive && arrow.checkCollision(epicMonster)) {
                    const isDead = epicMonster.takeDamage(1);
                    arrow.destroy();
                    if (isDead) {
                      console.log('👹 Monstre épique tué par flèche!');
                      playerRef.current.gainExperience(100);
                      updateLevelDisplay();
                    }
                  }
                });

                // Vérifier collision corps à corps avec le joueur
                if (epicMonster.checkCollision(playerRef.current)) {
                  const isDead = playerRef.current.takeDamage(2, epicMonster.x, epicMonster.y);
                  updateHealthDisplay();
                  if (isDead) {
                    console.log('💀 Game Over!');
                  }
                }
              }
            });

            // Mettre à jour toutes les boules de feu
            fireballsRef.current.forEach((fireball) => {
              if (fireball.isAlive) {
                fireball.update(MAP_WIDTH, MAP_HEIGHT);

                // Vérifier collision avec le joueur
                if (fireball.checkCollision(playerRef.current)) {
                  const isDead = playerRef.current.takeDamage(fireball.damage, fireball.x, fireball.y);
                  fireball.destroy();
                  updateHealthDisplay();
                  console.log('🔥 Touché par une boule de feu! HP:', playerRef.current.health);
                  if (isDead) {
                    console.log('💀 Game Over!');
                  }
                }
              }
            });

            // Nettoyer les monstres morts
            monstersRef.current = monstersRef.current.filter(monster => monster.isAlive);
            epicMonstersRef.current = epicMonstersRef.current.filter(monster => monster.isAlive);
            fireballsRef.current = fireballsRef.current.filter(fireball => fireball.isAlive);

            // Nettoyer les projectiles morts
            projectilesRef.current = projectilesRef.current.filter(projectile => projectile.isAlive);

            // Nettoyer les flèches mortes
            arrowsRef.current = arrowsRef.current.filter(arrow => arrow.isAlive);
          }
        };

        app.ticker.add(gameLoop);

        // Fonction de nettoyage
        const cleanup = () => {
          window.removeEventListener('keydown', handleKeyDown);
          window.removeEventListener('keyup', handleKeyUp);
          clearInterval(monsterSpawnInterval);
          clearInterval(epicMonsterSpawnInterval);
          clearInterval(powerupSpawnInterval);
          if (powerupSelectorTimeoutRef.current) {
            clearTimeout(powerupSelectorTimeoutRef.current);
          }
          if (appRef.current) {
            appRef.current.destroy(true);
          }
        };

        return cleanup;

      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    let cleanupFunction;
    initializeGame().then((cleanup) => {
      cleanupFunction = cleanup;
    });

    return () => {
      if (cleanupFunction) {
        cleanupFunction();
      }
    };
  }, [selectedCharacter]);

  // Handler pour la sélection de powerup
  const handlePowerupSelect = (powerupType) => {
    console.log('Powerup sélectionné:', powerupType);
    
    if (!playerRef.current || !currentPowerup) return;
    
    const isWizard = playerRef.current instanceof Wizard || playerRef.current.characterType === 'wizard';
    const isRogue = playerRef.current instanceof Rogue || playerRef.current.characterType === 'rogue';
    
    switch(powerupType) {
      case 'speed_boost':
        playerRef.current.speedMultiplier *= 1.5;
        console.log('⚡ Speed boost! Multiplicateur:', playerRef.current.speedMultiplier);
        break;
      case 'rotation_speed':
        if (!isWizard && !isRogue) {
          playerRef.current.rotationSpeedMultiplier *= 2;
          console.log('🌀 Épée rapide! Multiplicateur:', playerRef.current.rotationSpeedMultiplier);
        } else if (isWizard) {
          playerRef.current.maxProjectiles = (playerRef.current.maxProjectiles || 1) + 1;
          console.log('💥 Multi-projectiles! Max projectiles:', playerRef.current.maxProjectiles);
        }
        break;
      case 'size_boost':
        playerRef.current.sizeMultiplier *= 1.5;
        if (playerRef.current.sprite) {
          playerRef.current.sprite.scale.set(
            playerRef.current.sprite.scale.x * 1.5,
            playerRef.current.sprite.scale.y * 1.5
          );
        }
        console.log('📏 Géant! Taille multiplicatrice:', playerRef.current.sizeMultiplier);
        break;
      case 'multi_projectiles':
        if (isWizard) {
          playerRef.current.maxProjectiles = (playerRef.current.maxProjectiles || 1) + 1;
          console.log('💥 Multi-projectiles! Max projectiles:', playerRef.current.maxProjectiles);
        }
        break;
      case 'fire_rate':
        if (isWizard) {
          playerRef.current.projectileCooldown = Math.max(100, playerRef.current.projectileCooldown * 0.7);
          console.log('🔥 Tir rapide! Cooldown:', playerRef.current.projectileCooldown);
        }
        break;
      case 'arrow_speed':
        if (isRogue) {
          playerRef.current.arrowCooldown = Math.max(100, playerRef.current.arrowCooldown * 0.75);
          console.log('💨 Flèches rapides! Cooldown:', playerRef.current.arrowCooldown);
        }
        break;
      case 'multi_arrows':
        if (isRogue) {
          playerRef.current.maxArrows = (playerRef.current.maxArrows || 1) + 1;
          console.log('🎯 Multi-flèches! Max flèches:', playerRef.current.maxArrows);
        }
        break;
      case 'spear_speed':
        if (spearRef.current) {
          spearRef.current.attackCooldown = Math.max(200, spearRef.current.attackCooldown * 0.7);
          console.log('⚔️ Lance rapide! Cooldown:', spearRef.current.attackCooldown);
        }
        break;
      case 'spear_range':
        if (spearRef.current) {
          spearRef.current.baseDistance *= 1.5;
          spearRef.current.attackDistance *= 1.5;
          console.log('📏 Portée augmentée! Distance:', spearRef.current.attackDistance);
        }
        break;
      default:
        console.warn('Type de powerup inconnu:', powerupType);
    }
    
    if (currentPowerup && currentPowerup.sprite && currentPowerup.sprite.parent) {
      currentPowerup.sprite.parent.removeChild(currentPowerup.sprite);
    }
    currentPowerup.isAlive = false;
    
    setShowPowerupSelector(false);
    setCurrentPowerup(null);
    powerupCollisionDetectedRef.current = false;
  };

  const handlePowerupCancel = () => {
    if (currentPowerup && currentPowerup.sprite && currentPowerup.sprite.parent) {
      currentPowerup.sprite.parent.removeChild(currentPowerup.sprite);
    }
    currentPowerup.isAlive = false;
    setShowPowerupSelector(false);
    setCurrentPowerup(null);
    powerupCollisionDetectedRef.current = false;
  };

  useEffect(() => {
    console.log('showPowerupSelector changed:', showPowerupSelector);
  }, [showPowerupSelector]);

  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#1a1a1a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      {showCharacterSelector && (
        <CharacterSelector onSelect={handleCharacterSelect} />
      )}
      {showPowerupSelector && (
        <PowerupSelector 
          onSelect={handlePowerupSelect}
          onCancel={handlePowerupCancel}
          characterType={selectedCharacter?.id}
        />
      )}
      <div 
        ref={gameRef} 
        style={{ 
          width: '100vw',
          height: '100vh',
          position: 'relative'
        }}
      />
      <div style={{ 
        position: 'absolute',
        top: '20px',
        left: '20px',
        color: '#cccccc',
        fontFamily: 'monospace',
        zIndex: 1001,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '10px',
        borderRadius: '5px'
      }}>
        <h3 style={{ color: '#d4af37', margin: '0 0 10px 0', fontFamily: 'serif' }}>
          Last Realm - Nouvelle Carte
        </h3>
        <p style={{ margin: '5px 0', fontSize: '12px' }}>
          <strong>Utilisez les flèches ↑↓←→ pour vous déplacer</strong>
        </p>
        {selectedCharacter?.id === 'wizard' && (
          <p style={{ margin: '5px 0', fontSize: '10px', opacity: 0.8 }}>
            Le magicien lance automatiquement des projectiles! 🔥
          </p>
        )}
        {selectedCharacter?.id === 'rogue' && (
          <p style={{ margin: '5px 0', fontSize: '10px', opacity: 0.8 }}>
            Le rodeur lance automatiquement des flèches! 🏹
          </p>
        )}
        {selectedCharacter?.id === 'fallen_knight' && (
          <p style={{ margin: '5px 0', fontSize: '10px', opacity: 0.8 }}>
            Le templier frappe automatiquement avec sa lance! ⚔️
          </p>
        )}
        <p style={{ margin: '5px 0', fontSize: '10px', opacity: 0.8 }}>
          Collectez les powerups (carrés colorés) pour obtenir des bonus!
        </p>
        <button 
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '5px 10px',
            backgroundColor: '#d4af37',
            color: '#1a1a1a',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '12px'
          }}
        >
          ← Dashboard
        </button>
      </div>
    </div>
  );
};

export default Game;
