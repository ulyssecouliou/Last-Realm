import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as PIXI from 'pixi.js';

// Classe Player avec système de vie
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 0.4; // Vitesse réduite de 50% (0.8/2 = 0.4)
    this.sprite = null;
    this.health = 100; // 100 points de vie
    this.maxHealth = 100;
    // Système de recul
    this.knockbackX = 0;
    this.knockbackY = 0;
    this.knockbackDecay = 0.9; // Facteur de réduction du recul
  }

  update(keys, mapWidth, mapHeight) {
    // Sauvegarder l'ancienne position pour détecter le mouvement
    const oldX = this.x;
    const oldY = this.y;
    
    // Déplacement avec limites de la map zoom x4
    if (keys.left && this.x > 50) this.x -= this.speed;
    if (keys.right && this.x < mapWidth - 50) this.x += this.speed;
    if (keys.up && this.y > 50) this.y -= this.speed;
    if (keys.down && this.y < mapHeight - 50) this.y += this.speed;

    // Appliquer le recul (knockback)
    this.x += this.knockbackX;
    this.y += this.knockbackY;
    
    // Réduire progressivement le recul (effet smooth)
    this.knockbackX *= this.knockbackDecay;
    this.knockbackY *= this.knockbackDecay;
    
    // Arrêter le recul quand il devient très petit
    if (Math.abs(this.knockbackX) < 0.01) this.knockbackX = 0;
    if (Math.abs(this.knockbackY) < 0.01) this.knockbackY = 0;

    // Vérifier les limites de la map après le recul
    this.x = Math.max(50, Math.min(mapWidth - 50, this.x));
    this.y = Math.max(50, Math.min(mapHeight - 50, this.y));

    // Mettre à jour le sprite immédiatement (position absolue)
    if (this.sprite) {
      this.sprite.x = this.x;
      this.sprite.y = this.y;
    }
  }

  setSprite(sprite) {
    this.sprite = sprite;
    sprite.x = this.x;
    sprite.y = this.y;
  }

  takeDamage(damage, attackerX = null, attackerY = null) {
    this.health = Math.max(0, this.health - damage);
    
    // Appliquer un recul si on connaît la position de l'attaquant
    if (attackerX !== null && attackerY !== null) {
      this.applyKnockback(attackerX, attackerY);
    }
    
    return this.health <= 0; // Retourne true si mort
  }

  applyKnockback(attackerX, attackerY, force = 8) {
    // Calculer la direction du recul (opposée à l'attaquant)
    const dx = this.x - attackerX;
    const dy = this.y - attackerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Normaliser et appliquer la force
    if (distance > 0) {
      this.knockbackX = (dx / distance) * force;
      this.knockbackY = (dy / distance) * force;
    }
  }
}

// Classe Monster
class Monster {
  constructor(x, y, targetPlayer) {
    this.x = x;
    this.y = y;
    this.speed = 0.3; // Vitesse divisée par 2 (0.6/2 = 0.3)
    this.sprite = null;
    this.targetPlayer = targetPlayer;
    this.isAlive = true;
    this.health = 3; // Points de vie des monstres
    this.maxHealth = 3;
  }

  update(otherMonsters = []) {
    if (!this.isAlive || !this.targetPlayer) return;

    // Calculer la direction vers le joueur
    const dx = this.targetPlayer.x - this.x;
    const dy = this.targetPlayer.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      // Calculer la nouvelle position
      let newX = this.x + (dx / distance) * this.speed;
      let newY = this.y + (dy / distance) * this.speed;

      // Vérifier les collisions avec les autres monstres
      let collision = false;
      for (let other of otherMonsters) {
        if (other !== this && other.isAlive) {
          const otherDx = newX - other.x;
          const otherDy = newY - other.y;
          const otherDistance = Math.sqrt(otherDx * otherDx + otherDy * otherDy);
          
          // Distance minimale entre monstres (rayon de collision)
          if (otherDistance < 25) {
            collision = true;
            break;
          }
        }
      }

      // Appliquer le mouvement seulement s'il n'y a pas de collision
      if (!collision) {
        this.x = newX;
        this.y = newY;
      }
    }

    // Mettre à jour le sprite
    if (this.sprite) {
      this.sprite.x = this.x;
      this.sprite.y = this.y;
    }
  }

  setSprite(sprite) {
    this.sprite = sprite;
    sprite.x = this.x;
    sprite.y = this.y;
  }

  // Vérifier collision avec le joueur
  checkCollision(player) {
    const distance = Math.sqrt((this.x - player.x) ** 2 + (this.y - player.y) ** 2);
    return distance < 20; // Distance de collision
  }

  takeDamage(damage) {
    this.health = Math.max(0, this.health - damage);
    if (this.health <= 0) {
      this.destroy();
      return true; // Monstre mort
    }
    return false; // Monstre encore vivant
  }

  destroy() {
    this.isAlive = false;
    if (this.sprite && this.sprite.parent) {
      this.sprite.parent.removeChild(this.sprite);
    }
  }
}

// Classe Sword (épée qui tourne autour du joueur)
class Sword {
  constructor(player, radius = 120) {
    this.player = player;
    this.radius = radius; // Distance du joueur (éloignée de 80 à 120)
    this.angle = 0; // Angle de rotation
    this.rotationSpeed = 0.005; // Vitesse de rotation réduite par 10 (0.05/10 = 0.005)
    this.sprite = null;
    this.damage = 1; // Dégâts infligés
  }

  update() {
    if (!this.player) return;
    
    // Faire tourner l'épée
    this.angle += this.rotationSpeed;
    
    // Calculer la position autour du joueur
    this.x = this.player.x + Math.cos(this.angle) * this.radius;
    this.y = this.player.y + Math.sin(this.angle) * this.radius;
    
    // Mettre à jour le sprite
    if (this.sprite) {
      this.sprite.x = this.x;
      this.sprite.y = this.y;
      this.sprite.rotation = this.angle + Math.PI / 2; // Orienter l'épée
    }
  }

  setSprite(sprite) {
    this.sprite = sprite;
    sprite.x = this.x;
    sprite.y = this.y;
  }

  // Vérifier collision avec un monstre
  checkCollision(monster) {
    const distance = Math.sqrt((this.x - monster.x) ** 2 + (this.y - monster.y) ** 2);
    return distance < 30; // Distance de collision de l'épée
  }
}

const Game = () => {
  const gameRef = useRef(null);
  const appRef = useRef(null);
  const playerRef = useRef(null);
  const keysRef = useRef({ left: false, right: false, up: false, down: false });
  const monstersRef = useRef([]);
  const swordRef = useRef(null);
  const healthDisplayRef = useRef(null);
  const cameraRef = useRef({ x: 0, y: 0 });
  const backgroundRef = useRef(null);
  const navigate = useNavigate();

  // Constantes de la map (zoom x4 de la taille de base)
  const MAP_WIDTH = 2400; // 4x plus grande que 600x600
  const MAP_HEIGHT = 2400; // 4x plus grande que 600x600

  useEffect(() => {
    const initializeGame = async () => {
      try {
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

        // Créer le joueur au centre de la map
        const player = new Player(MAP_WIDTH / 2, MAP_HEIGHT / 2);
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
        
        // Ajouter le conteneur UI au stage (après le monde du jeu pour qu'il soit au-dessus)
        app.stage.addChild(uiContainer);

        // Charger le sprite du joueur
        try {
          const texture = await PIXI.Assets.load('/—Pngtree—knight avatar soldier with shield_23256476.png');
          const sprite = new PIXI.Sprite(texture);
          sprite.anchor.set(0.5);
          sprite.scale.set(0.03); // Taille réduite pour correspondre aux monstres
          player.setSprite(sprite);
          gameWorld.addChild(sprite);
          console.log('Sprite du joueur chargé');
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

        // Créer l'épée qui tourne autour du joueur
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
          console.log('Épée chargée');
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

        // Gestion des entrées
        const handleKeyDown = (event) => {
          switch(event.code) {
            case 'ArrowLeft': keysRef.current.left = true; break;
            case 'ArrowRight': keysRef.current.right = true; break;
            case 'ArrowUp': keysRef.current.up = true; break;
            case 'ArrowDown': keysRef.current.down = true; break;
          }
          event.preventDefault();
        };

        const handleKeyUp = (event) => {
          switch(event.code) {
            case 'ArrowLeft': keysRef.current.left = false; break;
            case 'ArrowRight': keysRef.current.right = false; break;
            case 'ArrowUp': keysRef.current.up = false; break;
            case 'ArrowDown': keysRef.current.down = false; break;
          }
          event.preventDefault();
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

        // Fonction pour mettre à jour l'affichage de la vie
        const updateHealthDisplay = () => {
          if (healthDisplayRef.current && healthDisplayRef.current.text) {
            const healthText = healthDisplayRef.current.container ? 
              `${playerRef.current.health}/${playerRef.current.maxHealth}` :
              `❤️ ${playerRef.current.health}/${playerRef.current.maxHealth}`;
            healthDisplayRef.current.text.text = healthText;
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
            
            // Mettre à jour l'épée
            if (swordRef.current) {
              swordRef.current.update();
            }
            
            // Mettre à jour la caméra pour suivre le joueur
            updateCamera();

            // Mettre à jour tous les monstres (avec évitement de superposition)
            monstersRef.current.forEach((monster, index) => {
              if (monster.isAlive) {
                // Passer la liste de tous les monstres pour éviter les superpositions
                monster.update(monstersRef.current);
                
                // Vérifier collision avec l'épée
                if (swordRef.current && swordRef.current.checkCollision(monster)) {
                  const isDead = monster.takeDamage(swordRef.current.damage);
                  if (isDead) {
                    console.log('Monstre tué par l\'épée!');
                  }
                }
                
                // Vérifier collision avec le joueur (mais ne plus détruire le monstre)
                if (monster.checkCollision(playerRef.current)) {
                  // Le joueur prend des dégâts avec recul
                  const isDead = playerRef.current.takeDamage(1, monster.x, monster.y);
                  updateHealthDisplay();
                  
                  // Ne plus détruire le monstre au contact du joueur
                  
                  if (isDead) {
                    console.log('Game Over!');
                    // TODO: Ajouter écran de game over
                  }
                }
              }
            });

            // Nettoyer les monstres morts
            monstersRef.current = monstersRef.current.filter(monster => monster.isAlive);
          }
        };

        app.ticker.add(gameLoop);

        // Fonction de nettoyage
        const cleanup = () => {
          window.removeEventListener('keydown', handleKeyDown);
          window.removeEventListener('keyup', handleKeyUp);
          clearInterval(monsterSpawnInterval);
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
  }, []);

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
        <p style={{ margin: '5px 0', fontSize: '10px', opacity: 0.8 }}>
          Code simple et direct - ça devrait marcher !
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
