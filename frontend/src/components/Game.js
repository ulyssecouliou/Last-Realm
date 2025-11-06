import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as PIXI from 'pixi.js';

// Classe Player avec système de vie
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 0.5; // Divisé par 10 (5 / 10 = 0.5)
    this.sprite = null;
    this.health = 100; // 100 points de vie
    this.maxHealth = 100;
  }

  update(keys) {
    // Déplacement simple et direct
    if (keys.left) this.x -= this.speed;
    if (keys.right) this.x += this.speed;
    if (keys.up) this.y -= this.speed;
    if (keys.down) this.y += this.speed;

    // Mettre à jour le sprite immédiatement
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

  takeDamage(damage) {
    this.health = Math.max(0, this.health - damage);
    return this.health <= 0; // Retourne true si mort
  }
}

// Classe Monster
class Monster {
  constructor(x, y, targetPlayer) {
    this.x = x;
    this.y = y;
    this.speed = 0.3; // Plus lent que le joueur
    this.sprite = null;
    this.targetPlayer = targetPlayer;
    this.isAlive = true;
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

  destroy() {
    this.isAlive = false;
    if (this.sprite && this.sprite.parent) {
      this.sprite.parent.removeChild(this.sprite);
    }
  }
}

const Game = () => {
  const gameRef = useRef(null);
  const appRef = useRef(null);
  const playerRef = useRef(null);
  const keysRef = useRef({ left: false, right: false, up: false, down: false });
  const monstersRef = useRef([]);
  const healthDisplayRef = useRef(null);
  const navigate = useNavigate();

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

        // Charger l'arrière-plan
        try {
          const backgroundTexture = await PIXI.Assets.load('/plaine.png');
          const background = new PIXI.Sprite(backgroundTexture);
          const scale = Math.max(app.screen.width / backgroundTexture.width, app.screen.height / backgroundTexture.height);
          background.scale.set(scale);
          background.x = (app.screen.width - background.width) / 2;
          background.y = (app.screen.height - background.height) / 2;
          app.stage.addChild(background);
        } catch (error) {
          console.log('Pas d\'arrière-plan trouvé');
        }

        // Créer le joueur au centre de l'écran
        const player = new Player(app.screen.width / 2, app.screen.height / 2);
        playerRef.current = player;

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
            app.stage.addChild(healthContainer);
            
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
            app.stage.addChild(healthText);
            healthDisplayRef.current = { text: healthText };
          }
        };

        await createHealthDisplay();

        // Charger le sprite du joueur
        try {
          const texture = await PIXI.Assets.load('/—Pngtree—knight avatar soldier with shield_23256476.png');
          const sprite = new PIXI.Sprite(texture);
          sprite.anchor.set(0.5);
          sprite.scale.set(0.0125); // Divisé par 4 (0.05 / 4 = 0.0125)
          player.setSprite(sprite);
          app.stage.addChild(sprite);
          console.log('Sprite du joueur chargé');
        } catch (error) {
          // Sprite de remplacement (plus petit aussi)
          const fallbackSprite = new PIXI.Graphics();
          fallbackSprite.beginFill(0x66CCFF);
          fallbackSprite.drawRect(-5, -5, 10, 10); // Divisé par 4 aussi
          fallbackSprite.endFill();
          player.setSprite(fallbackSprite);
          app.stage.addChild(fallbackSprite);
          console.log('Sprite de remplacement créé');
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
            // Position aléatoire sur les bords de l'écran
            const side = Math.floor(Math.random() * 4);
            let x, y;
            
            switch(side) {
              case 0: // Haut
                x = Math.random() * app.screen.width;
                y = -50;
                break;
              case 1: // Droite
                x = app.screen.width + 50;
                y = Math.random() * app.screen.height;
                break;
              case 2: // Bas
                x = Math.random() * app.screen.width;
                y = app.screen.height + 50;
                break;
              case 3: // Gauche
                x = -50;
                y = Math.random() * app.screen.height;
                break;
            }

            const monster = new Monster(x, y, playerRef.current);
            
            // Charger le sprite du monstre avec fallback
            try {
              const monsterTexture = await PIXI.Assets.load('/monster.png.png');
              const monsterSprite = new PIXI.Sprite(monsterTexture);
              monsterSprite.anchor.set(0.5);
              monsterSprite.scale.set(0.15); // Taille agrandie x3 (0.05 * 3 = 0.15)
              monster.setSprite(monsterSprite);
              app.stage.addChild(monsterSprite);
            } catch (error) {
              console.log('Image monstre non trouvée, création sprite de remplacement');
              // Sprite de remplacement pour le monstre (plus joli)
              const fallbackMonster = new PIXI.Graphics();
              // Corps rouge (agrandi x3)
              fallbackMonster.beginFill(0xff0000);
              fallbackMonster.drawCircle(0, 0, 24); // 8 * 3 = 24
              fallbackMonster.endFill();
              // Yeux blancs (agrandis x3)
              fallbackMonster.beginFill(0xffffff);
              fallbackMonster.drawCircle(-9, -6, 6); // -3*3, -2*3, 2*3
              fallbackMonster.drawCircle(9, -6, 6);
              fallbackMonster.endFill();
              // Pupilles noires (agrandies x3)
              fallbackMonster.beginFill(0x000000);
              fallbackMonster.drawCircle(-9, -6, 3); // -3*3, -2*3, 1*3
              fallbackMonster.drawCircle(9, -6, 3);
              fallbackMonster.endFill();
              monster.setSprite(fallbackMonster);
              app.stage.addChild(fallbackMonster);
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

        // Boucle de jeu avec monstres et collisions
        const gameLoop = () => {
          if (playerRef.current && playerRef.current.health > 0) {
            // Mettre à jour le joueur avec les touches pressées
            playerRef.current.update(keysRef.current);
            
            // Limites d'écran pour le joueur
            if (playerRef.current.x < 0) playerRef.current.x = 0;
            if (playerRef.current.x > app.screen.width) playerRef.current.x = app.screen.width;
            if (playerRef.current.y < 0) playerRef.current.y = 0;
            if (playerRef.current.y > app.screen.height) playerRef.current.y = app.screen.height;

            // Mettre à jour tous les monstres (avec évitement de superposition)
            monstersRef.current.forEach((monster, index) => {
              if (monster.isAlive) {
                // Passer la liste de tous les monstres pour éviter les superpositions
                monster.update(monstersRef.current);
                
                // Vérifier collision avec le joueur
                if (monster.checkCollision(playerRef.current)) {
                  // Le joueur prend des dégâts
                  const isDead = playerRef.current.takeDamage(1);
                  updateHealthDisplay();
                  
                  // Détruire le monstre après collision
                  monster.destroy();
                  monstersRef.current.splice(index, 1);
                  
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
          Last Realm - Plaine d'Eldara
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
