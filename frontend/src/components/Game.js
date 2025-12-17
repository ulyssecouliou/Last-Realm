import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as PIXI from 'pixi.js';
import axios from 'axios';
import PowerupSelector from './PowerupSelector';
import { useMusic } from '../utils/MusicProvider';

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
    // Hitbox pour debug visuel
    this.hitboxSprite = null;
    this.hitboxRadius = 20; // Rayon de collision du joueur
    // Multiplicateurs pour les powerups
    this.speedMultiplier = 1;
    this.rotationSpeedMultiplier = 1;
    this.sizeMultiplier = 1;
    this.fireballSizeMultiplier = 1;
    this.damageMultiplier = 1;
    this.projectilesPerShot = 1;
    this.damageTakenMultiplier = 1;
    this.rangedDamageMultiplier = 1;
    this.projectileSpeedMultiplier = 1;
    this.projectileRangeMultiplier = 1;
    // Système d'expérience
    this.level = 1;
    this.experience = 0;
    this.experienceToNextLevel = 100; // XP nécessaire pour le niveau suivant
    this.experienceBar = null;
  }

  update(keys, mapWidth, mapHeight) {
    // Sauvegarder l'ancienne position pour détecter le mouvement
    const oldX = this.x;
    const oldY = this.y;
    
    // Déplacement avec limites de la map zoom x4 (avec multiplicateur de vitesse)
    if (keys.left && this.x > 50) this.x -= this.speed * this.speedMultiplier;
    if (keys.right && this.x < mapWidth - 50) this.x += this.speed * this.speedMultiplier;
    if (keys.up && this.y > 50) this.y -= this.speed * this.speedMultiplier;
    if (keys.down && this.y < mapHeight - 50) this.y += this.speed * this.speedMultiplier;    // Appliquer le recul (knockback)
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
    
    // Mettre à jour la hitbox
    if (this.hitboxSprite) {
      this.hitboxSprite.x = this.x;
      this.hitboxSprite.y = this.y;
    }
  }

  setSprite(sprite) {
    this.sprite = sprite;
    sprite.x = this.x;
    sprite.y = this.y;
  }

  setHitboxSprite(hitboxSprite) {
    this.hitboxSprite = hitboxSprite;
    hitboxSprite.x = this.x;
    hitboxSprite.y = this.y;
  }

  takeDamage(damage, attackerX = null, attackerY = null) {
    const dmg = (Number(damage) || 0) * Math.max(0.1, Number(this.damageTakenMultiplier) || 1);
    this.health = Math.max(0, this.health - dmg);
    
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

  setExperienceBar(experienceBar) {
    this.experienceBar = experienceBar;
  }

  gainExperience(amount) {
    this.experience += amount;
    console.log(`💫 +${amount} XP! Total: ${this.experience}/${this.experienceToNextLevel}`);
    
    // Vérifier si on monte de niveau
    if (this.experience >= this.experienceToNextLevel) {
      this.levelUp();
      return true; // Indique qu'on a monté de niveau
    }
    return false;
  }

  levelUp() {
    this.level++;
    this.experience -= this.experienceToNextLevel;
    this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * 1.5); // +50% XP requis par niveau
    console.log(`🎉 NIVEAU ${this.level}! Prochain niveau: ${this.experienceToNextLevel} XP`);
  }

  getExperiencePercent() {
    return (this.experience / this.experienceToNextLevel) * 100;
  }
}

class Spear {
  constructor(player, angleOffset = 0) {
    this.player = player;
    this.angleOffset = angleOffset;
    this.sprite = null;
    this.hitboxSprite = null;

    this.damage = 3;
    this.baseDistance = 70;
    this.thrustDistance = 75;
    this.tipRadius = 22;

    this.angle = 0;
    this.phase = 0;
    this.thrustSpeed = 0.04;

    this.x = player?.x || 0;
    this.y = player?.y || 0;
    this.tipX = this.x;
    this.tipY = this.y;
  }

  setSprite(sprite) {
    this.sprite = sprite;
    if (sprite) {
      sprite.x = this.x;
      sprite.y = this.y;
    }
  }

  setHitboxSprite(hitboxSprite) {
    this.hitboxSprite = hitboxSprite;
    if (hitboxSprite) {
      hitboxSprite.x = this.tipX;
      hitboxSprite.y = this.tipY;
    }
  }

  update(monsters = []) {
    if (!this.player) return;

    let best = null;
    let bestDist = Infinity;
    for (const m of monsters) {
      if (!m || !m.isAlive) continue;
      const dx = m.x - this.player.x;
      const dy = m.y - this.player.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < bestDist) {
        bestDist = d;
        best = m;
      }
    }

    if (best && bestDist > 0) {
      this.angle = Math.atan2(best.y - this.player.y, best.x - this.player.x);
    }

    const finalAngle = this.angle + (Number(this.angleOffset) || 0);

    const rotationMultiplier = Math.max(0.25, Number(this.player?.rotationSpeedMultiplier) || 1);
    this.phase += this.thrustSpeed * rotationMultiplier;
    if (this.phase > Math.PI * 2) this.phase -= Math.PI * 2;

    const thrust = (Math.sin(this.phase) * 0.5 + 0.5) * this.thrustDistance;
    const dist = this.baseDistance + thrust;
    const ux = Math.cos(finalAngle);
    const uy = Math.sin(finalAngle);

    this.x = this.player.x + ux * dist;
    this.y = this.player.y + uy * dist;

    const tipDist = dist + 55;
    this.tipX = this.player.x + ux * tipDist;
    this.tipY = this.player.y + uy * tipDist;

    if (this.sprite) {
      this.sprite.x = this.x;
      this.sprite.y = this.y;
      this.sprite.rotation = finalAngle + Math.PI / 2;
    }

    if (this.hitboxSprite) {
      this.hitboxSprite.x = this.tipX;
      this.hitboxSprite.y = this.tipY;
    }
  }

  checkCollision(monster) {
    if (!monster || !monster.isAlive) return false;
    const dx = monster.x - this.tipX;
    const dy = monster.y - this.tipY;
    const d = Math.sqrt(dx * dx + dy * dy);
    return d < (this.tipRadius + (monster.hitboxRadius || 20));
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
    this.health = 10; // Points de vie des monstres
    this.maxHealth = 10;
    // Hitbox pour debug visuel
    this.hitboxSprite = null;
    this.hitboxRadius = 20; // Rayon de collision du monstre

    this.lastDamageAt = 0;
    this.damageCooldownMs = 250;

    this.healthBar = null;
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
    
    // Mettre à jour la hitbox
    if (this.hitboxSprite) {
      this.hitboxSprite.x = this.x;
      this.hitboxSprite.y = this.y;
    }
  }

  setSprite(sprite) {
    this.sprite = sprite;
    sprite.x = this.x;
    sprite.y = this.y;
  }

  setHitboxSprite(hitboxSprite) {
    this.hitboxSprite = hitboxSprite;
    hitboxSprite.x = this.x;
    hitboxSprite.y = this.y;
  }

  // Vérifier collision avec le joueur
  checkCollision(player) {
    const distance = Math.sqrt((this.x - player.x) ** 2 + (this.y - player.y) ** 2);
    return distance < 20; // Distance de collision
  }

  takeDamage(damage, nowMs = Date.now(), ignoreCooldown = false) {
    if (!ignoreCooldown && (nowMs - this.lastDamageAt < this.damageCooldownMs)) {
      return false;
    }

    this.lastDamageAt = nowMs;
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
    if (this.hitboxSprite && this.hitboxSprite.parent) {
      this.hitboxSprite.parent.removeChild(this.hitboxSprite);
    }
    if (this.healthBar && this.healthBar.parent) {
      this.healthBar.parent.removeChild(this.healthBar);
    }
  }
}

class Projectile {
  constructor(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.sprite = null;
    this.isAlive = true;
    this.radius = 1;
    this.damage = 5;
  }

  update(mapWidth, mapHeight) {
    if (!this.isAlive) return;
    this.x += this.vx;
    this.y += this.vy;

    if (this.sprite) {
      this.sprite.x = this.x;
      this.sprite.y = this.y;
    }

    if (this.x < -100 || this.y < -100 || this.x > mapWidth + 100 || this.y > mapHeight + 100) {
      this.destroy();
    }
  }

  setSprite(sprite) {
    this.sprite = sprite;
    sprite.x = this.x;
    sprite.y = this.y;
  }

  checkCollision(player) {
    const distance = Math.sqrt((this.x - player.x) ** 2 + (this.y - player.y) ** 2);
    return distance < (this.radius + player.hitboxRadius);
  }

  destroy() {
    this.isAlive = false;
    if (this.sprite && this.sprite.parent) {
      this.sprite.parent.removeChild(this.sprite);
    }
  }
}

class PlayerProjectile extends Projectile {
  constructor(x, y, vx, vy, sizeMultiplier = 1, damageMultiplier = 1) {
    super(x, y, vx, vy);
    this.radius = 12 * Math.max(0.5, Number(sizeMultiplier) || 1);
    this.damage = 5 * Math.max(0.25, Number(damageMultiplier) || 1);
  }

  checkCollisionMonster(monster) {
    const distance = Math.sqrt((this.x - monster.x) ** 2 + (this.y - monster.y) ** 2);
    return distance < (this.radius + (monster.hitboxRadius || 20));
  }
}

class RangerArrow extends PlayerProjectile {
  constructor(x, y, vx, vy, sizeMultiplier = 1, damageMultiplier = 1, maxDistance = 720) {
    super(x, y, vx, vy, sizeMultiplier, damageMultiplier);
    this.startX = x;
    this.startY = y;
    this.maxDistance = maxDistance;
    this.hitMonsterIds = new Set();
  }

  update(mapWidth, mapHeight) {
    super.update(mapWidth, mapHeight);
    if (!this.isAlive) return;

    const dx = this.x - this.startX;
    const dy = this.y - this.startY;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d >= this.maxDistance) {
      this.destroy();
      return;
    }

    if (this.sprite) {
      this.sprite.rotation = Math.atan2(this.vy, this.vx);
    }
  }
}

class EpicMonster extends Monster {
  constructor(x, y, targetPlayer) {
    super(x, y, targetPlayer);
    this.health = 50;
    this.maxHealth = 50;
    this.hitboxRadius = 30;
    this.speed = 0.22;
    this.shootCooldownMs = 3600;
    this.lastShotAt = 0;

    this.damageCooldownMs = 300;
  }

  tryShoot(projectilesRef, gameWorld, createProjectileSprite, nowMs) {
    if (!this.isAlive || !this.targetPlayer) return;
    if (nowMs - this.lastShotAt < this.shootCooldownMs) return;

    const dx = this.targetPlayer.x - this.x;
    const dy = this.targetPlayer.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance <= 0) return;

    const speed = 1.1;
    const vx = (dx / distance) * speed;
    const vy = (dy / distance) * speed;

    const projectile = new Projectile(this.x, this.y, vx, vy);
    const projectileSprite = createProjectileSprite();
    projectile.setSprite(projectileSprite);
    gameWorld.addChild(projectileSprite);
    projectilesRef.current.push(projectile);

    this.lastShotAt = nowMs;
  }
}

class BossMonster extends Monster {
  constructor(x, y, targetPlayer) {
    super(x, y, targetPlayer);
    this.health = 300;
    this.maxHealth = 300;
    this.hitboxRadius = 72;
    this.speed = 0.16;
    this.lastLaserAt = 0;
    this.laserCooldownMs = 750;
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
    this.damage = 10; // Dégâts infligés
    // Hitbox pour debug visuel
    this.hitboxSprite = null;
    this.hitboxWidth = 25; // Largeur de la hitbox (épée étroite)
    this.hitboxHeight = 700; // Hauteur de la hitbox (156 + 60% = 250px)
    this.hitboxRadius = 30; // Garde l'ancien rayon pour la détection de collision
    // Variables pour détecter les changements de taille
    this.lastHitboxWidth = this.hitboxWidth;
    this.lastHitboxHeight = this.hitboxHeight;
  }

  update(gameWorld = null, createSwordHitboxSprite = null) {
    if (!this.player) return;
    
    // Vérifier si les dimensions de la hitbox ont changé
    if (gameWorld && createSwordHitboxSprite && 
        (this.hitboxWidth !== this.lastHitboxWidth || this.hitboxHeight !== this.lastHitboxHeight)) {
      console.log(`Mise à jour hitbox épée: ${this.lastHitboxWidth}x${this.lastHitboxHeight} -> ${this.hitboxWidth}x${this.hitboxHeight}`);
      this.updateHitboxSize(gameWorld, createSwordHitboxSprite);
      this.lastHitboxWidth = this.hitboxWidth;
      this.lastHitboxHeight = this.hitboxHeight;
    }
    
    // Faire tourner l'épée (utiliser le rotationSpeedMultiplier du joueur s'il existe)
    const speedMultiplier = this.player.rotationSpeedMultiplier || 1;
    this.angle += this.rotationSpeed * speedMultiplier;
    
    // Calculer la position autour du joueur
    this.x = this.player.x + Math.cos(this.angle) * this.radius;
    this.y = this.player.y + Math.sin(this.angle) * this.radius;
    
    // Mettre à jour le sprite
    if (this.sprite) {
      this.sprite.x = this.x;
      this.sprite.y = this.y;
      this.sprite.rotation = this.angle + Math.PI / 2; // Orienter l'épée
    }
    
    // Mettre à jour la hitbox avec rotation
    if (this.hitboxSprite) {
      this.hitboxSprite.x = this.x;
      this.hitboxSprite.y = this.y;
      this.hitboxSprite.rotation = this.angle + Math.PI / 2; // Même rotation que l'épée
    }
  }

  setSprite(sprite) {
    this.sprite = sprite;
    sprite.x = this.x;
    sprite.y = this.y;
  }

  setHitboxSprite(hitboxSprite) {
    this.hitboxSprite = hitboxSprite;
    hitboxSprite.x = this.x;
    hitboxSprite.y = this.y;
  }

  // Méthode pour recréer la hitbox avec de nouvelles dimensions
  updateHitboxSize(gameWorld, createSwordHitboxSprite) {
    // Supprimer l'ancienne hitbox
    if (this.hitboxSprite && this.hitboxSprite.parent) {
      this.hitboxSprite.parent.removeChild(this.hitboxSprite);
    }
    
    // Créer une nouvelle hitbox avec les dimensions actuelles
    const newHitbox = createSwordHitboxSprite(this.hitboxWidth, this.hitboxHeight, 0x0000ff, 0.2);
    this.setHitboxSprite(newHitbox);
    gameWorld.addChild(newHitbox);
    
    // Mettre à jour la position et rotation
    if (this.hitboxSprite) {
      this.hitboxSprite.x = this.x;
      this.hitboxSprite.y = this.y;
      this.hitboxSprite.rotation = this.angle + Math.PI / 2;
    }
  }

  // Vérifier collision avec un monstre (détection rectangulaire précise)
  checkCollision(monster) {
    // Détection rectangulaire orientée - plus précise
    const dx = monster.x - this.x;
    const dy = monster.y - this.y;
    
    // Rotation inverse pour ramener dans le repère de l'épée
    const cos = Math.cos(-this.angle - Math.PI / 2);
    const sin = Math.sin(-this.angle - Math.PI / 2);
    
    // Coordonnées du monstre dans le repère de l'épée
    const localX = dx * cos - dy * sin;
    const localY = dx * sin + dy * cos;
    
    // Vérifier si le monstre est dans le rectangle de la hitbox
    const halfWidth = this.hitboxWidth / 2;
    const halfHeight = this.hitboxHeight / 2;
    
    return Math.abs(localX) <= halfWidth && Math.abs(localY) <= halfHeight;
  }
}

// Classe Powerup
// Classe Powerup
class Powerup {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.sprite = null;
    this.isAlive = true;
    this.rotation = 0;
    this.rotationSpeed = 0.05;
  }

  update() {
    if (!this.sprite) return;
    this.rotation += this.rotationSpeed;
    this.sprite.rotation = this.rotation;
  }

  setSprite(sprite) {
    this.sprite = sprite;
    sprite.x = this.x;
    sprite.y = this.y;
  }

  checkCollision(player) {
    const distance = Math.sqrt((this.x - player.x) ** 2 + (this.y - player.y) ** 2);
    return distance < 50;
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
  const gameModeRef = useRef('normal');
  const [isBossMode, setIsBossMode] = useState(false);
  const [bossModePicksDone, setBossModePicksDone] = useState(0);
  const bossModePicksLeftRef = useRef(0);
  const keysRef = useRef({ left: false, right: false, up: false, down: false });
  const monstersRef = useRef([]);
  const projectilesRef = useRef([]);
  const playerProjectilesRef = useRef([]);
  const projectileTextureRef = useRef(null);
  const playerProjectileTextureRef = useRef(null);
  const rangerProjectileTextureRef = useRef(null);
  const spearTextureRef = useRef(null);
  const gameStartAtRef = useRef(0);
  const pausedAtRef = useRef(null);
  const pausedTotalMsRef = useRef(0);
  const killsRef = useRef(0);
  const epicKillsRef = useRef(0);
  const gameOverShownRef = useRef(false);
  const swordRef = useRef(null);
  const spearsRef = useRef([]);
  const playerClassRef = useRef('knight');
  const mageLastShotAtRef = useRef(0);
  const modalOpenRef = useRef(false);
  const healthDisplayRef = useRef(null);
  const timerTextRef = useRef(null);
  const killsTextRef = useRef(null);
  const quitButtonRef = useRef(null);
  const cameraRef = useRef({ x: 0, y: 0 });
  const backgroundRef = useRef(null);
  const powerupsRef = useRef([]);
  const enemyDamageMultiplierRef = useRef(1);
  const enemySpeedMultiplierRef = useRef(1);
  const enemySpawnMultiplierRef = useRef(1);
  const waveAppliedRef = useRef({ damageSteps: 0, spawnSteps: 0, speedSteps: 0, epicCyclesDone: new Set(), bossDone: false });
  const bossRef = useRef(null);
  const bossesRef = useRef([]);
  const createBossRef = useRef(null);
  const lasersRef = useRef([]);
  const bossLaserSideIndexRef = useRef(0);
  const bossTextureRef = useRef(null);
  const laserTextureRef = useRef(null);
  const bossHudRef = useRef(null);
  const waveNotificationTextRef = useRef(null);
  const waveNotificationUntilRef = useRef(0);
  const [showPowerupSelector, setShowPowerupSelector] = useState(false);
  const [currentPowerup, setCurrentPowerup] = useState(null);
  const [showGameOver, setShowGameOver] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [finalKills, setFinalKills] = useState(0);
  const [finalTimeSeconds, setFinalTimeSeconds] = useState(0);
  const victoryShownRef = useRef(false);
  const powerupSelectorTimeoutRef = useRef(null);
  const powerupCollisionDetectedRef = useRef(false);
  const gameWorldRef = useRef(null);
  const navigate = useNavigate();
  const { setMusicMode } = useMusic();

  // Constantes de la map (zoom x4 de la taille de base)
  const MAP_WIDTH = 2400; // 4x plus grande que 600x600
  const MAP_HEIGHT = 2400; // 4x plus grande que 600x600

  // Fonction pour créer une hitbox visuelle
  const createHitboxSprite = (radius, color = 0xff0000, alpha = 0.3) => {
    const hitbox = new PIXI.Graphics();
    hitbox.beginFill(color, alpha);
    hitbox.drawCircle(0, 0, radius);
    hitbox.endFill();
    // Ajouter un contour pour mieux voir
    hitbox.lineStyle(2, color, 0.8);
    hitbox.drawCircle(0, 0, radius);
    return hitbox;
  };

  const createSpearSprite = () => {
    const texture = spearTextureRef.current;
    if (texture) {
      const sprite = new PIXI.Sprite(texture);
      sprite.anchor.set(0.5);
      sprite.scale.set(0.2);
      sprite.alpha = 1;
      return sprite;
    }

    const fallback = new PIXI.Graphics();
    fallback.beginFill(0xD8C8A8);
    fallback.drawRect(-8, -120, 16, 240);
    fallback.endFill();
    return fallback;
  };

  const createRangerProjectileSprite = () => {
    const texture = rangerProjectileTextureRef.current;
    if (texture) {
      const sprite = new PIXI.Sprite(texture);
      sprite.anchor.set(0.5);
      sprite.scale.set(0.65 / 5);
      sprite.alpha = 1;
      return sprite;
    }

    const fallback = new PIXI.Graphics();
    fallback.beginFill(0xffffff, 1);
    fallback.drawRect(-30 / 5, -6 / 5, 60 / 5, 12 / 5);
    fallback.endFill();
    return fallback;
  };

  const createProjectileSprite = () => {
    const texture = projectileTextureRef.current;
    if (texture) {
      const sprite = new PIXI.Sprite(texture);
      sprite.anchor.set(0.5);
      sprite.scale.set(0.35 / 5);
      sprite.alpha = 1;
      return sprite;
    }

    const fallback = new PIXI.Graphics();
    fallback.beginFill(0xff6600, 1);
    fallback.drawCircle(0, 0, 20 / 5);
    fallback.endFill();
    fallback.lineStyle(3, 0xffd700, 1);
    fallback.drawCircle(0, 0, 20 / 5);
    return fallback;
  };

  const createPlayerProjectileSprite = () => {
    const texture = playerProjectileTextureRef.current;
    if (texture) {
      const sprite = new PIXI.Sprite(texture);
      sprite.anchor.set(0.5);
      sprite.scale.set(0.9 / 5);
      sprite.alpha = 1;
      return sprite;
    }

    const fallback = new PIXI.Graphics();
    fallback.beginFill(0x66ccff, 1);
    fallback.drawCircle(0, 0, 44 / 5);
    fallback.endFill();
    fallback.lineStyle(3, 0xffffff, 1);
    fallback.drawCircle(0, 0, 44 / 5);
    return fallback;
  };

  const createMonsterHealthBar = (monster) => {
    const container = new PIXI.Container();

    const background = new PIXI.Graphics();
    background.beginFill(0x111111, 0.8);
    background.drawRect(-22, -3, 44, 6);
    background.endFill();

    const bar = new PIXI.Graphics();
    bar.beginFill(0x00ff00, 1);
    bar.drawRect(-22, -3, 44, 6);
    bar.endFill();

    container.addChild(background);
    container.addChild(bar);

    container.bar = bar;
    container.background = background;

    container.x = monster.x;
    container.y = monster.y - 40;

    return container;
  };

  const updateMonsterHealthBar = (monster) => {
    if (!monster.healthBar || !monster.healthBar.bar) return;

    const ratio = monster.maxHealth > 0 ? (monster.health / monster.maxHealth) : 0;
    const width = Math.max(0, Math.min(44, 44 * ratio));

    let color = 0x00ff00;
    if (ratio < 0.3) color = 0xff3b30;
    else if (ratio < 0.6) color = 0xffcc00;

    monster.healthBar.bar.clear();
    monster.healthBar.bar.beginFill(color, 1);
    monster.healthBar.bar.drawRect(-22, -3, width, 6);
    monster.healthBar.bar.endFill();

    monster.healthBar.x = monster.x;
    monster.healthBar.y = monster.y - 40;
  };

  // Fonction pour créer une hitbox rectangulaire (pour l'épée)
  const createSwordHitboxSprite = (width, height, color = 0x0000ff, alpha = 0.3) => {
    const hitbox = new PIXI.Graphics();
    hitbox.beginFill(color, alpha);
    // Centrer la hitbox pour qu'elle s'étende équitablement vers l'avant et vers l'arrière
    hitbox.drawRect(-width/2, -height/2, width, height);
    hitbox.endFill();
    // Ajouter un contour pour mieux voir
    hitbox.lineStyle(2, color, 0.8);
    hitbox.drawRect(-width/2, -height/2, width, height);
    return hitbox;
  };

  // Fonction pour créer la barre d'expérience
  const createExperienceBar = (player) => {
    const expBarContainer = new PIXI.Container();
    
    // Barre de fond (grise)
    const background = new PIXI.Graphics();
    background.beginFill(0x333333, 0.8);
    background.drawRoundedRect(0, 0, 220, 14, 6);
    background.endFill();
    
    // Barre d'expérience (bleue)
    const expBar = new PIXI.Graphics();
    expBar.beginFill(0x0099ff, 1);
    expBar.drawRoundedRect(0, 0, 220, 14, 6);
    expBar.endFill();
    
    // Texte du niveau
    const levelText = new PIXI.Text(`Niv. ${player.level}`, {
      fontFamily: 'Arial',
      fontSize: 18,
      fill: 0xffffff,
      stroke: 0x000000,
      strokeThickness: 1
    });
    levelText.anchor.set(0, 0.5);
    levelText.x = -80;
    levelText.y = 7;
    
    expBarContainer.addChild(background);
    expBarContainer.addChild(expBar);
    expBarContainer.addChild(levelText);
    
    // Stocker les références pour les mises à jour
    expBarContainer.expBar = expBar;
    expBarContainer.levelText = levelText;

    expBarContainer.isUi = false;
    
    return expBarContainer;
  };

  // Fonction pour mettre à jour la barre d'expérience
  const updateExperienceBar = (player) => {
    if (player.experienceBar) {
      const percent = player.getExperiencePercent();
      const width = (percent / 100) * 220; // Largeur proportionnelle
      
      // Redessiner la barre d'expérience
      player.experienceBar.expBar.clear();
      player.experienceBar.expBar.beginFill(0x0099ff, 1);
      player.experienceBar.expBar.drawRoundedRect(0, 0, width, 14, 6);
      player.experienceBar.expBar.endFill();
      
      // Mettre à jour le texte du niveau
      player.experienceBar.levelText.text = `Niv. ${player.level}`;

      if (!player.experienceBar.isUi) {
        // Positionner au-dessus du joueur
        player.experienceBar.x = player.x;
        player.experienceBar.y = player.y - 40;
      } else {
        const app = appRef.current;
        if (app && app.screen) {
          player.experienceBar.x = 220;
          player.experienceBar.y = 14;
        }
      }
    }
  };

  useEffect(() => {
    console.log('🎮 Game component mounted - Initializing game');

    try {
      const params = new URLSearchParams(window.location.search);
      const fromQuery = params.get('class');
      const modeQuery = params.get('mode');
      gameModeRef.current = modeQuery === 'boss' ? 'boss' : modeQuery === 'normal' ? 'normal' : 'infinite';
      setIsBossMode(gameModeRef.current === 'boss');
      const fromStorage = localStorage.getItem('lastrealm_player_class');
      const raw = (fromQuery || fromStorage || 'knight');
      playerClassRef.current = raw === 'mage' ? 'mage' : raw === 'ranger' ? 'ranger' : raw === 'templar' ? 'templar' : 'knight';
    } catch (e) {
      playerClassRef.current = 'knight';
      gameModeRef.current = 'infinite';
      setIsBossMode(false);
    }
    
    // Éviter la double initialisation
    if (appRef.current) {
      console.log('⚠️ Jeu déjà initialisé, ignoré');
      return;
    }
    
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

        try {
          projectileTextureRef.current = await PIXI.Assets.load('/projectile.png');
          console.log('projectile.png chargée');
        } catch (error) {
          console.log('Erreur chargement projectile.png:', error);
          projectileTextureRef.current = null;
        }

        try {
          playerProjectileTextureRef.current = await PIXI.Assets.load('/projectile.png');
        } catch (error) {
          playerProjectileTextureRef.current = null;
        }

        try {
          rangerProjectileTextureRef.current = await PIXI.Assets.load('/fleche.png');
        } catch (error) {
          rangerProjectileTextureRef.current = null;
        }

        try {
          bossTextureRef.current = await PIXI.Assets.load('/BOSS.png');
        } catch (error) {
          bossTextureRef.current = null;
        }

        try {
          laserTextureRef.current = await PIXI.Assets.load('/lazer-beam.png');
        } catch (error) {
          laserTextureRef.current = null;
        }

        try {
          spearTextureRef.current = await PIXI.Assets.load('/lance.png');
        } catch (error) {
          spearTextureRef.current = null;
        }

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

        // Créer le joueur au centre de la map
        const player = new Player(MAP_WIDTH / 2, MAP_HEIGHT / 2);
        playerRef.current = player;

        gameStartAtRef.current = Date.now();
        killsRef.current = 0;
        epicKillsRef.current = 0;
        gameOverShownRef.current = false;
        victoryShownRef.current = false;
        setShowGameOver(false);
        setShowVictory(false);

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

        const createTopUi = () => {
          const quitButton = new PIXI.Container();
          const quitBg = new PIXI.Graphics();
          quitBg.beginFill(0x111111, 0.8);
          quitBg.lineStyle(2, 0xd4af37, 0.8);
          quitBg.drawRoundedRect(0, 0, 110, 34, 8);
          quitBg.endFill();

          const quitText = new PIXI.Text('Quitter', {
            fontFamily: 'Arial',
            fontSize: 18,
            fill: 0xffffff,
            stroke: 0x000000,
            strokeThickness: 2
          });
          quitText.anchor.set(0.5);
          quitText.x = 55;
          quitText.y = 17;
          quitButton.addChild(quitBg);
          quitButton.addChild(quitText);
          quitButton.x = 10;
          quitButton.y = 10;
          quitButton.eventMode = 'static';
          quitButton.cursor = 'pointer';
          quitButton.on('pointerdown', () => {
            navigate('/dashboard');
          });
          uiContainer.addChild(quitButton);
          quitButtonRef.current = quitButton;

          const timerText = new PIXI.Text('00:00', {
            fontFamily: 'Arial',
            fontSize: 30,
            fill: 0xffffff,
            stroke: 0x000000,
            strokeThickness: 3
          });
          timerText.anchor.set(0.5, 0);
          timerText.x = app.screen.width / 2;
          timerText.y = 10;
          uiContainer.addChild(timerText);
          timerTextRef.current = timerText;

          const bossHud = new PIXI.Container();
          bossHud.x = app.screen.width / 2;
          bossHud.y = 46;

          const bossName = new PIXI.Text('Créateur de la brume', {
            fontFamily: 'Arial',
            fontSize: 18,
            fill: 0xffd700,
            stroke: 0x000000,
            strokeThickness: 2
          });
          bossName.anchor.set(0.5, 0);
          bossName.x = 0;
          bossName.y = 0;

          const barWidth = 320;
          const barHeight = 14;
          const barY = 24;

          const bossBarBg = new PIXI.Graphics();
          bossBarBg.beginFill(0x111111, 0.8);
          bossBarBg.drawRoundedRect(-barWidth / 2, barY, barWidth, barHeight, 8);
          bossBarBg.endFill();
          bossBarBg.lineStyle(2, 0xffd700, 0.55);
          bossBarBg.drawRoundedRect(-barWidth / 2, barY, barWidth, barHeight, 8);

          const bossBarFill = new PIXI.Graphics();
          bossBarFill.beginFill(0xff2d2d, 0.95);
          bossBarFill.drawRoundedRect(-barWidth / 2, barY, barWidth, barHeight, 8);
          bossBarFill.endFill();

          bossHud.addChild(bossBarBg);
          bossHud.addChild(bossBarFill);
          bossHud.addChild(bossName);
          bossHud.visible = false;

          uiContainer.addChild(bossHud);
          bossHudRef.current = { container: bossHud, fill: bossBarFill, width: barWidth, height: barHeight, barY };

          const waveText = new PIXI.Text('', {
            fontFamily: 'Arial',
            fontSize: 20,
            fill: 0xff4444,
            stroke: 0x000000,
            strokeThickness: 3
          });
          waveText.anchor.set(0.5, 0);
          waveText.x = app.screen.width / 2;
          waveText.y = 74;
          uiContainer.addChild(waveText);
          waveNotificationTextRef.current = waveText;

          const killsText = new PIXI.Text('Kills: 0', {
            fontFamily: 'Arial',
            fontSize: 22,
            fill: 0xffffff,
            stroke: 0x000000,
            strokeThickness: 2
          });
          killsText.anchor.set(0, 0);
          killsText.x = app.screen.width / 2 + 90;
          killsText.y = 16;
          uiContainer.addChild(killsText);
          killsTextRef.current = killsText;
        };

        createTopUi();
        
        // Ajouter le conteneur UI au stage (après le monde du jeu pour qu'il soit au-dessus)
        app.stage.addChild(uiContainer);

        // Charger le sprite du joueur
        try {
          const playerTexturePath = playerClassRef.current === 'mage'
            ? '/magicien.png'
            : playerClassRef.current === 'ranger'
              ? '/rodeur.png'
              : playerClassRef.current === 'templar'
                ? '/templier_dechu.png'
              : '/—Pngtree—knight avatar soldier with shield_23256476.png';
          const texture = await PIXI.Assets.load(playerTexturePath);
          const sprite = new PIXI.Sprite(texture);
          sprite.anchor.set(0.5);
          sprite.scale.set(
            playerClassRef.current === 'mage'
              ? 0.09
              : playerClassRef.current === 'ranger'
                ? 0.1125
                : playerClassRef.current === 'templar'
                  ? 0.275
                  : 0.03
          );
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

        // Créer la hitbox du joueur (cercle vert semi-transparent)
        const playerHitbox = createHitboxSprite(player.hitboxRadius, 0x00ff00, 0.2);
        player.setHitboxSprite(playerHitbox);
        gameWorld.addChild(playerHitbox);
        console.log('Hitbox du joueur créée');

        // Créer la barre d'expérience dans l'UI (fixe en haut)
        const experienceBar = createExperienceBar(player);
        experienceBar.isUi = true;
        player.setExperienceBar(experienceBar);
        experienceBar.x = 220;
        experienceBar.y = 14;
        uiContainer.addChild(experienceBar);
        console.log('Barre d\'expérience créée');

        console.log('🎯 Initialisation de l\'arme pour la bataille...');
        // Initialiser l'arme dans le backend ET récupérer les stats
        let weaponStats = {
          damage: 10,
          hitboxWidth: 50,
          hitboxHeight: 160, // Même valeur que dans initializeWeapons
          rotationSpeed: 0.005,
          radius: 120
        };

        try {
          console.log('🔄 Initialisation de l\'arme dans le backend...');
          const response = await fetch('http://localhost:5000/api/weapons/initialize', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          console.log('📡 Réponse reçue:', response.status, response.statusText);
          
          if (response.ok) {
            const backendStats = await response.json();
            weaponStats = backendStats;
            console.log('✅ Arme initialisée et stats chargées depuis le backend:', weaponStats);
          } else {
            console.warn('⚠️  Backend répond mais erreur:', response.status);
          }
        } catch (error) {
          console.warn('⚠️  Backend indisponible, utilisation du fallback:', error.message);
          console.log('🛡️  Stats de fallback utilisées:', weaponStats);
        }

        const addSpearInstance = (angleOffset = 0) => {
          const gameWorldLocal = gameWorldRef.current;
          if (!playerRef.current || !gameWorldLocal) return null;

          const spear = new Spear(playerRef.current, angleOffset);
          const baseDamage = spearsRef.current?.[0]?.damage;
          spear.damage = typeof baseDamage === 'number' && baseDamage > 0 ? baseDamage : 3;

          const spearSprite = createSpearSprite();
          spear.setSprite(spearSprite);
          gameWorldLocal.addChild(spearSprite);

          const spearTipHitbox = createHitboxSprite(spear.tipRadius, 0x00ffff, 0.18);
          spear.setHitboxSprite(spearTipHitbox);
          gameWorldLocal.addChild(spearTipHitbox);

          spearsRef.current.push(spear);
          return spear;
        };

        if (playerClassRef.current === 'knight') {
          // Créer l'épée qui tourne autour du joueur avec les stats du backend
          const sword = new Sword(player, weaponStats.radius);
          sword.damage = weaponStats.damage;
          sword.hitboxWidth = weaponStats.hitboxWidth;
          sword.hitboxHeight = weaponStats.hitboxHeight;
          sword.rotationSpeed = weaponStats.rotationSpeed;
          swordRef.current = sword;
          spearsRef.current = [];

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

          // Créer la hitbox de l'épée (rectangle bleu semi-transparent, plus réaliste)
          const swordHitbox = createSwordHitboxSprite(sword.hitboxWidth, sword.hitboxHeight, 0x0000ff, 0.2);
          sword.setHitboxSprite(swordHitbox);
          gameWorld.addChild(swordHitbox);
          console.log('Hitbox rectangulaire de l\'épée créée avec dimensions:', sword.hitboxWidth, 'x', sword.hitboxHeight);
        } else if (playerClassRef.current === 'templar') {
          swordRef.current = null;
          spearsRef.current = [];
          addSpearInstance(0);
        } else {
          swordRef.current = null;
          spearsRef.current = [];
        }

        // Gestion des entrées
        const handleKeyDown = (event) => {
          switch(event.code) {
            case 'ArrowLeft': keysRef.current.left = true; break;
            case 'ArrowRight': keysRef.current.right = true; break;
            case 'ArrowUp': keysRef.current.up = true; break;
            case 'ArrowDown': keysRef.current.down = true; break;
            case 'KeyQ': keysRef.current.left = true; break;
            case 'KeyD': keysRef.current.right = true; break;
            case 'KeyZ': keysRef.current.up = true; break;
            case 'KeyS': keysRef.current.down = true; break;
            case 'KeyA': keysRef.current.left = true; break;
            case 'KeyW': keysRef.current.up = true; break;
          }
          event.preventDefault();
        };

        const handleKeyUp = (event) => {
          switch(event.code) {
            case 'ArrowLeft': keysRef.current.left = false; break;
            case 'ArrowRight': keysRef.current.right = false; break;
            case 'ArrowUp': keysRef.current.up = false; break;
            case 'ArrowDown': keysRef.current.down = false; break;
            case 'KeyQ': keysRef.current.left = false; break;
            case 'KeyD': keysRef.current.right = false; break;
            case 'KeyZ': keysRef.current.up = false; break;
            case 'KeyS': keysRef.current.down = false; break;
            case 'KeyA': keysRef.current.left = false; break;
            case 'KeyW': keysRef.current.up = false; break;
          }
          event.preventDefault();
        };

        // Ajouter les écouteurs
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        // Fonction pour créer un monstre
        const createMonster = async (options = {}) => {
          try {
            const { forceEpic = false, forceNormal = false } = options;
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

            const isEpic = forceNormal ? false : (forceEpic ? true : (Math.random() < (1 / 11)));
            const monster = isEpic ? new EpicMonster(x, y, playerRef.current) : new Monster(x, y, playerRef.current);
            monster.speed *= Math.max(0.1, Number(enemySpeedMultiplierRef.current) || 1);
            
            // Charger le sprite du monstre avec fallback
            try {
              const monsterTexture = await PIXI.Assets.load(isEpic ? '/monstreEpique.png' : '/monster.png.png');
              const monsterSprite = new PIXI.Sprite(monsterTexture);
              monsterSprite.anchor.set(0.5);
              monsterSprite.scale.set(isEpic ? 0.28 : 0.225);
              monster.setSprite(monsterSprite);
              gameWorld.addChild(monsterSprite);
              console.log('� Monstre sprite chargé depuis image à', x, y);
            } catch (error) {
              console.log('� Image monstre non trouvée, création sprite de remplacement à', x, y);
              // Sprite de remplacement pour le monstre (comme avant)
              const fallbackMonster = new PIXI.Graphics();
              // Corps rouge
              fallbackMonster.beginFill(isEpic ? 0x9b59b6 : 0xff0000);
              fallbackMonster.drawCircle(0, 0, 90);
              fallbackMonster.endFill();
              // Yeux blancs
              fallbackMonster.beginFill(0xffffff);
              fallbackMonster.drawCircle(-30, -22.5, 22.5);
              fallbackMonster.drawCircle(30, -22.5, 22.5);
              fallbackMonster.endFill();
              // Pupilles noires
              fallbackMonster.beginFill(0x000000);
              fallbackMonster.drawCircle(-30, -22.5, 11.25);
              fallbackMonster.drawCircle(30, -22.5, 11.25);
              fallbackMonster.endFill();
              monster.setSprite(fallbackMonster);
              gameWorld.addChild(fallbackMonster);
            }

            // Créer la hitbox du monstre (cercle rouge semi-transparent)
            const monsterHitbox = createHitboxSprite(monster.hitboxRadius, 0xff0000, 0.2);
            monster.setHitboxSprite(monsterHitbox);
            gameWorld.addChild(monsterHitbox);

            const monsterHealthBar = createMonsterHealthBar(monster);
            monster.healthBar = monsterHealthBar;
            gameWorld.addChild(monsterHealthBar);
            updateMonsterHealthBar(monster);
            
            monstersRef.current.push(monster);
            console.log('� Monstre créé à la position:', x, y);

          } catch (error) {
            console.error('Erreur création monstre:', error);
          }
        };

        const createBoss = async (count = 1) => {
          try {
            if (bossRef.current && bossRef.current.isAlive && (Number(count) || 1) <= 1) return;

            const aliveBosses = (bossesRef.current || []).filter((b) => b && b.isAlive);
            if (aliveBosses.length > 0) {
              return;
            }

            setMusicMode('boss');

            bossesRef.current = [];

            const howMany = Math.max(1, Math.min(6, Number(count) || 1));
            const spawnNow = Date.now();
            const initialLaserSpacingMs = howMany > 1 ? Math.max(80, Math.floor(750 / howMany)) : 0;

            for (let i = 0; i < howMany; i += 1) {
              let x = MAP_WIDTH / 2;
              let y = MAP_HEIGHT / 2;
              switch (Math.floor(Math.random() * 4)) {
                case 0:
                  x = Math.random() * MAP_WIDTH;
                  y = -60;
                  break;
                case 1:
                  x = MAP_WIDTH + 60;
                  y = Math.random() * MAP_HEIGHT;
                  break;
                case 2:
                  x = Math.random() * MAP_WIDTH;
                  y = MAP_HEIGHT + 60;
                  break;
                default:
                  x = -60;
                  y = Math.random() * MAP_HEIGHT;
                  break;
              }

              const boss = new BossMonster(x, y, playerRef.current);
              boss.speed *= Math.max(0.1, Number(enemySpeedMultiplierRef.current) || 1);
              if (howMany > 1) {
                boss.lastLaserAt = spawnNow - i * initialLaserSpacingMs;
              }

              if (bossTextureRef.current) {
                const sprite = new PIXI.Sprite(bossTextureRef.current);
                sprite.anchor.set(0.5);
                sprite.scale.set(0.33);
                boss.setSprite(sprite);
                gameWorld.addChild(sprite);
              } else {
                const fallback = new PIXI.Graphics();
                fallback.beginFill(0x4b5563, 1);
                fallback.drawCircle(0, 0, 110);
                fallback.endFill();
                fallback.lineStyle(6, 0xffd700, 1);
                fallback.drawCircle(0, 0, 110);
                boss.setSprite(fallback);
                gameWorld.addChild(fallback);
              }

              const bossHitbox = createHitboxSprite(boss.hitboxRadius, 0xffd700, 0.18);
              boss.setHitboxSprite(bossHitbox);
              gameWorld.addChild(bossHitbox);

              const bossHealthBar = createMonsterHealthBar(boss);
              boss.healthBar = bossHealthBar;
              gameWorld.addChild(bossHealthBar);
              updateMonsterHealthBar(boss);

              bossesRef.current.push(boss);
              monstersRef.current.push(boss);
            }

            bossRef.current = bossesRef.current[0] || null;
          } catch (e) {
            console.error('Erreur création boss:', e);
          }
        };

        createBossRef.current = createBoss;

        const createLaserAttack = (forcedSide = null) => {
          const player = playerRef.current;
          if (!player) return;

          const side = typeof forcedSide === 'number' ? forcedSide : Math.floor(Math.random() * 4);
          let sx = 0;
          let sy = 0;
          if (side === 0) {
            sx = Math.random() * MAP_WIDTH;
            sy = -120;
          } else if (side === 1) {
            sx = MAP_WIDTH + 120;
            sy = Math.random() * MAP_HEIGHT;
          } else if (side === 2) {
            sx = Math.random() * MAP_WIDTH;
            sy = MAP_HEIGHT + 120;
          } else {
            sx = -120;
            sy = Math.random() * MAP_HEIGHT;
          }

          const dx = player.x - sx;
          const dy = player.y - sy;
          const angle = Math.atan2(dy, dx);
          const length = Math.sqrt(MAP_WIDTH * MAP_WIDTH + MAP_HEIGHT * MAP_HEIGHT) + 400;

          const warning = new PIXI.Graphics();
          warning.beginFill(0xff0000, 0.25);
          warning.drawRect(0, -40, length, 80);
          warning.endFill();
          warning.lineStyle(3, 0xff0000, 0.7);
          warning.drawRect(0, -40, length, 80);
          warning.x = sx;
          warning.y = sy;
          warning.rotation = angle;
          gameWorld.addChild(warning);

          lasersRef.current.push({
            phase: 'warning',
            createdAt: Date.now(),
            warning,
            beam: null,
            sx,
            sy,
            angle,
            length,
            lastHitAt: 0
          });
        };

        // Fonction pour créer un powerup
        const createPowerup = async (x, y, type) => {
          try {
            const powerup = new Powerup(x, y, type);
            
            // Configuration des couleurs
            const powerupColors = {
              player_speed: 0xFFD700,
              fireball_size: 0xFF6B6B,
              damage_bonus: 0x4ECDC4,
              multi_shot: 0xA78BFA
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

        // Pas de monstre ni powerup au démarrage - ils apparaîtront avec les timers
        
        // Spawn des monstres / powerups (désactivé en mode boss)
        let monsterSpawnInterval = null;
        let powerupSpawnInterval = null;
        if (gameModeRef.current !== 'boss') {
          monsterSpawnInterval = setInterval(() => {
            if (modalOpenRef.current) return;
            createMonster();
            const mult = Math.max(1, Number(enemySpawnMultiplierRef.current) || 1);
            if (mult > 1) {
              const extraInt = Math.max(0, Math.floor(mult) - 1);
              for (let i = 0; i < extraInt; i += 1) {
                createMonster();
              }
              const frac = mult - Math.floor(mult);
              if (frac > 0 && Math.random() < frac) {
                createMonster();
              }
            }
          }, 3000);

          powerupSpawnInterval = setInterval(() => {
            if (modalOpenRef.current) return;
            // Limiter à 3 powerups max sur la map
            if (powerupsRef.current.length < 3) {
              // Position aléatoire sur la map
              const x = Math.random() * MAP_WIDTH;
              const y = Math.random() * MAP_HEIGHT;

              // Type de powerup aléatoire
              const types = playerClassRef.current === 'templar'
                ? ['player_speed', 'damage_bonus', 'spear_count', 'attack_speed']
                : ['player_speed', 'fireball_size', 'damage_bonus', 'multi_shot'];
              const randomType = types[Math.floor(Math.random() * types.length)];

              createPowerup(x, y, randomType);
            }
          }, 30000);
        }

        if (gameModeRef.current === 'boss') {
          bossModePicksLeftRef.current = 10;
          setBossModePicksDone(0);
          setCurrentPowerup({ type: 'boss_mode_pick', isLevelUp: true });
          setShowPowerupSelector(true);
          powerupCollisionDetectedRef.current = true;
        }

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
          if (modalOpenRef.current) {
            return;
          }
          if (playerRef.current && playerRef.current.health > 0) {
            // Mettre à jour le joueur avec les limites de la map
            playerRef.current.update(keysRef.current, MAP_WIDTH, MAP_HEIGHT);
            
            // Mettre à jour l'épée avec les paramètres pour la mise à jour dynamique
            if (swordRef.current) {
              swordRef.current.update(gameWorld, createSwordHitboxSprite);
            }

            if (spearsRef.current && spearsRef.current.length > 0) {
              spearsRef.current.forEach((s) => {
                if (s) s.update(monstersRef.current);
              });
            }

            // Magicien / Rodeur: tirer sur le monstre le plus proche
            if (playerClassRef.current === 'mage' || playerClassRef.current === 'ranger') {
              const nowMsMage = Date.now();
              const baseMageCooldownMs = 1950;
              const rotationMultiplier = Math.max(0.25, Number(playerRef.current?.rotationSpeedMultiplier) || 1);
              const mageCooldownMs = Math.max(120, Math.round(baseMageCooldownMs / rotationMultiplier));
              if (nowMsMage - mageLastShotAtRef.current >= mageCooldownMs) {
                let best = null;
                let bestDist = Infinity;
                for (const m of monstersRef.current) {
                  if (!m || !m.isAlive) continue;
                  const dx = m.x - playerRef.current.x;
                  const dy = m.y - playerRef.current.y;
                  const d = Math.sqrt(dx * dx + dy * dy);
                  if (d < bestDist) {
                    bestDist = d;
                    best = m;
                  }
                }

                const rangeMult = Math.max(0.25, Number(playerRef.current?.projectileRangeMultiplier) || 1);
                const speedMult = Math.max(0.25, Number(playerRef.current?.projectileSpeedMultiplier) || 1);
                const attackRange = (playerClassRef.current === 'ranger' ? 700 : 520) * rangeMult;
                if (best && bestDist > 0 && bestDist <= attackRange) {
                  const dx = best.x - playerRef.current.x;
                  const dy = best.y - playerRef.current.y;
                  const dist = Math.sqrt(dx * dx + dy * dy);
                  const speed = (playerClassRef.current === 'ranger' ? 6.2 : 4.2) * speedMult;
                  const sizeMultiplier = playerRef.current?.fireballSizeMultiplier || 1;
                  const damageMultiplier = (playerRef.current?.damageMultiplier || 1) * (playerRef.current?.rangedDamageMultiplier || 1);

                  const count = Math.max(1, Math.min(9, Number(playerRef.current?.projectilesPerShot) || 1));

                  if (playerClassRef.current === 'mage') {
                    // Récupérer les monstres à portée et les trier par distance croissante
                    const monstersInRange = monstersRef.current
                      .filter(m => m && m.isAlive)
                      .map(m => {
                        const dxm = m.x - playerRef.current.x;
                        const dym = m.y - playerRef.current.y;
                        const distm = Math.sqrt(dxm * dxm + dym * dym);
                        return { m, distm };
                      })
                      .filter(o => o.distm <= attackRange)
                      .sort((a, b) => a.distm - b.distm)
                      .map(o => o.m);

                    if (monstersInRange.length === 0) {
                      // aucun ennemi à portée
                      mageLastShotAtRef.current = nowMsMage;
                    } else {
                      // Fonction utilitaire pour créer et pousser un projectile
                      const spawnProjectile = (targetX, targetY) => {
                        const dxT = targetX - playerRef.current.x;
                        const dyT = targetY - playerRef.current.y;
                        const distT = Math.sqrt(dxT * dxT + dyT * dyT) || 1;
                        const vx = (dxT / distT) * speed;
                        const vy = (dyT / distT) * speed;

                        const fireball = new PlayerProjectile(playerRef.current.x, playerRef.current.y, vx, vy, sizeMultiplier, damageMultiplier);
                        const fireballSprite = createPlayerProjectileSprite();
                        try { fireballSprite.scale.set(fireballSprite.scale.x * sizeMultiplier, fireballSprite.scale.y * sizeMultiplier); } catch (e) {}
                        fireball.setSprite(fireballSprite);
                        gameWorld.addChild(fireballSprite);
                        playerProjectilesRef.current.push(fireball);
                      };

                      // Attribution des projectiles aux ennemis
                      const enemiesCount = monstersInRange.length;
                      if (enemiesCount >= count) {
                        // Un projectile par ennemi jusqu'à épuisement
                        for (let i = 0; i < count; i += 1) {
                          spawnProjectile(monstersInRange[i].x, monstersInRange[i].y);
                        }
                      } else {
                        // Donner 1 boule par ennemi puis répartir le reste sur le plus proche
                        for (let i = 0; i < enemiesCount; i += 1) {
                          spawnProjectile(monstersInRange[i].x, monstersInRange[i].y);
                        }
                        const remaining = count - enemiesCount;
                        const focus = monstersInRange[0];
                        // Tirer les projectiles restants vers le plus proche, légèrement espacés dans le temps
                        const delayStep = 80; // ms entre chaque boule consécutive
                        for (let r = 0; r < remaining; r += 1) {
                          const delay = (r + 1) * delayStep;
                          setTimeout(() => {
                            spawnProjectile(focus.x, focus.y);
                          }, delay);
                        }
                      }

                      // Empêcher le tir immédiat suivant
                      mageLastShotAtRef.current = nowMsMage;
                    }
                  } else {
                    // Ranger: comportement original en cône
                    const baseAngle = Math.atan2(dy, dx);
                    const spread = count === 1 ? 0 : 0.18;
                    for (let i = 0; i < count; i += 1) {
                      const offset = (i - (count - 1) / 2) * spread;
                      const angle = baseAngle + offset;
                      const vx = Math.cos(angle) * speed;
                      const vy = Math.sin(angle) * speed;

                      const maxDist = 720 * rangeMult;
                      const arrow = new RangerArrow(playerRef.current.x, playerRef.current.y, vx, vy, sizeMultiplier, damageMultiplier, maxDist);
                      const arrowSprite = createRangerProjectileSprite();
                      try { arrowSprite.scale.set(arrowSprite.scale.x * sizeMultiplier, arrowSprite.scale.y * sizeMultiplier); } catch (e) {}
                      arrow.setSprite(arrowSprite);
                      gameWorld.addChild(arrowSprite);
                      playerProjectilesRef.current.push(arrow);
                    }
                    mageLastShotAtRef.current = nowMsMage;
                  }
                }
              }
            }
            
            // Mettre à jour tous les powerups (sans spam de logs)
            powerupsRef.current.forEach((powerup, idx) => {
              if (powerup.isAlive) {
                powerup.update();
                
                // Vérifier collision avec le joueur (une seule fois)
                if (powerup.checkCollision(playerRef.current) && !powerupCollisionDetectedRef.current) {
                  console.log('✨ Powerup ramassé:', powerup.type);
                  // Afficher le sélecteur de powerup avec le powerup actuel
                  setCurrentPowerup(powerup);
                  setShowPowerupSelector(true);
                  powerupCollisionDetectedRef.current = true;
                }
              }
            });

            // Projectiles du joueur (Magicien / Rodeur)
            playerProjectilesRef.current.forEach((p) => {
              if (!p.isAlive) return;

              p.update(MAP_WIDTH, MAP_HEIGHT);
              if (!p.isAlive) return;

              for (const m of monstersRef.current) {
                if (!m || !m.isAlive) continue;
                if (p.checkCollisionMonster(m)) {
                  if (p instanceof RangerArrow) {
                    if (p.hitMonsterIds && p.hitMonsterIds.has(m)) {
                      continue;
                    }
                    if (p.hitMonsterIds) {
                      p.hitMonsterIds.add(m);
                    }
                  }

                  // Pour les flèches (RangerArrow) on garde le comportement existant,
                  // pour les boules du magicien on force l'application des dégâts
                  // même si le monstre a été touché récemment.
                  const isDead = (p instanceof RangerArrow)
                    ? m.takeDamage(p.damage, Date.now())
                    : m.takeDamage(p.damage, Date.now(), true);
                  if (!(p instanceof RangerArrow)) {
                    p.destroy();
                  }
                  if (isDead) {
                    killsRef.current += 1;
                    if (m instanceof EpicMonster) {
                      epicKillsRef.current += 1;
                    }

                    if (m instanceof BossMonster && gameModeRef.current === 'normal' && !victoryShownRef.current) {
                      victoryShownRef.current = true;
                      const endNowMs = Date.now();
                      const endPausedExtra = pausedAtRef.current ? (endNowMs - pausedAtRef.current) : 0;
                      const timeSeconds = Math.max(1, Math.floor(Math.max(0, endNowMs - gameStartAtRef.current - (pausedTotalMsRef.current || 0) - endPausedExtra) / 1000));
                      const kills = killsRef.current;
                      setFinalTimeSeconds(timeSeconds);
                      setFinalKills(kills);
                      setFinalScore(kills * timeSeconds);
                      setShowVictory(true);

                      const runMaxLevel = playerRef.current?.level || 1;
                      try {
                        axios.post('/stats/run', { kills, epicKills: epicKillsRef.current, timeSeconds, maxLevel: runMaxLevel, heroModeWin: false, normalModeWin: true }).catch((e) => {
                          console.log('Erreur envoi stats:', e?.response?.data?.error || e.message);
                        });
                      } catch (e) {
                        console.log('Erreur envoi stats:', e?.response?.data?.error || e.message);
                      }
                    }

                    const leveledUp = playerRef.current.gainExperience(25);
                    if (leveledUp) {
                      setCurrentPowerup({ type: 'level_up', isLevelUp: true });
                      setShowPowerupSelector(true);
                      powerupCollisionDetectedRef.current = true;
                    }
                  }
                  break;
                }
              }
            });

            // Mettre à jour la caméra pour suivre le joueur
            updateCamera();

            // Mettre à jour la barre d'expérience
            updateExperienceBar(playerRef.current);

            const nowMs = Date.now();
            const pausedExtra = pausedAtRef.current ? (nowMs - pausedAtRef.current) : 0;
            const elapsedMs = Math.max(0, nowMs - gameStartAtRef.current - (pausedTotalMsRef.current || 0) - pausedExtra);
            const elapsedSeconds = Math.max(0, Math.floor(elapsedMs / 1000));

            if (gameModeRef.current !== 'boss') {
              // Système de vagues (timelines)
              const cycleLength = 180;
              const cycleIndex = Math.floor(elapsedSeconds / cycleLength);
              const timeInCycle = elapsedSeconds % cycleLength;
              const applied = waveAppliedRef.current;

              const desiredDamageSteps = Math.max(0, cycleIndex + (timeInCycle >= 60 ? 1 : 0));
              const desiredSpawnSteps = Math.max(0, cycleIndex + (timeInCycle >= 90 ? 1 : 0));
              const desiredSpeedSteps = Math.max(0, cycleIndex + (timeInCycle >= 150 ? 1 : 0));

              if (desiredDamageSteps > applied.damageSteps) {
                applied.damageSteps = desiredDamageSteps;
                enemyDamageMultiplierRef.current = Math.pow(1.2, applied.damageSteps);
                if (waveNotificationTextRef.current) {
                  waveNotificationTextRef.current.text = `Vague: Dégâts ennemis +20% (x${enemyDamageMultiplierRef.current.toFixed(2)})`;
                  waveNotificationUntilRef.current = nowMs + 3200;
                }
              }

              if (desiredSpawnSteps > applied.spawnSteps) {
                applied.spawnSteps = desiredSpawnSteps;
                enemySpawnMultiplierRef.current = 1 + applied.spawnSteps;
                if (waveNotificationTextRef.current) {
                  waveNotificationTextRef.current.text = `Vague: Ennemis +100% (x${enemySpawnMultiplierRef.current.toFixed(0)})`;
                  waveNotificationUntilRef.current = nowMs + 3200;
                }
              }

              if (desiredSpeedSteps > applied.speedSteps) {
                const prev = applied.speedSteps;
                applied.speedSteps = desiredSpeedSteps;
                enemySpeedMultiplierRef.current = Math.pow(1.2, applied.speedSteps);
                const ratio = Math.pow(1.2, applied.speedSteps - prev);
                monstersRef.current.forEach((m) => {
                  if (m && m.isAlive) {
                    m.speed *= ratio;
                  }
                });
                if (waveNotificationTextRef.current) {
                  waveNotificationTextRef.current.text = `Vague: Vitesse ennemis +20% (x${enemySpeedMultiplierRef.current.toFixed(2)})`;
                  waveNotificationUntilRef.current = nowMs + 3200;
                }
              }

              if (timeInCycle >= 120 && !applied.epicCyclesDone.has(cycleIndex)) {
                for (let i = 0; i < 10; i += 1) {
                  createMonster({ forceEpic: true });
                }
                applied.epicCyclesDone.add(cycleIndex);
                if (waveNotificationTextRef.current) {
                  waveNotificationTextRef.current.text = 'Vague: 10 monstres épiques apparaissent !';
                  waveNotificationUntilRef.current = nowMs + 3200;
                }
              }

              if (gameModeRef.current !== 'boss' && elapsedSeconds >= 180 && !applied.bossDone) {
                createBoss();
                applied.bossDone = true;
                if (waveNotificationTextRef.current) {
                  waveNotificationTextRef.current.text = 'Boss: Le Créateur de la brume arrive !';
                  waveNotificationUntilRef.current = nowMs + 4200;
                }
              }
            }

            if (waveNotificationTextRef.current) {
              waveNotificationTextRef.current.x = app.screen.width / 2;
              if (nowMs > (waveNotificationUntilRef.current || 0)) {
                waveNotificationTextRef.current.text = '';
              }
            }
            if (timerTextRef.current) {
              const m = Math.floor(elapsedSeconds / 60);
              const s = elapsedSeconds % 60;
              const mm = String(m).padStart(2, '0');
              const ss = String(s).padStart(2, '0');
              timerTextRef.current.text = `${mm}:${ss}`;
              timerTextRef.current.x = app.screen.width / 2;
            }
            if (bossHudRef.current && bossHudRef.current.container) {
              const aliveBosses = (bossesRef.current || []).filter((b) => b && b.isAlive);
              const boss = bossRef.current;
              const show = aliveBosses.length > 0 || (boss && boss.isAlive);
              if (show) {
                bossHudRef.current.container.visible = true;
                bossHudRef.current.container.x = app.screen.width / 2;

                const totalMax = aliveBosses.length > 0
                  ? aliveBosses.reduce((acc, b) => acc + (Number(b.maxHealth) || 0), 0)
                  : (Number(boss?.maxHealth) || 0);
                const totalHp = aliveBosses.length > 0
                  ? aliveBosses.reduce((acc, b) => acc + Math.max(0, Number(b.health) || 0), 0)
                  : Math.max(0, Number(boss?.health) || 0);

                const ratio = totalMax > 0 ? (totalHp / totalMax) : 0;
                const clamped = Math.max(0, Math.min(1, ratio));
                const w = bossHudRef.current.width;
                const h = bossHudRef.current.height;
                const y = bossHudRef.current.barY;

                bossHudRef.current.fill.clear();
                bossHudRef.current.fill.beginFill(0xff2d2d, 0.95);
                bossHudRef.current.fill.drawRoundedRect(-w / 2, y, w * clamped, h, 8);
                bossHudRef.current.fill.endFill();
              } else {
                bossHudRef.current.container.visible = false;
              }
            }
            if (killsTextRef.current) {
              killsTextRef.current.text = `Kills: ${killsRef.current}`;
              killsTextRef.current.x = app.screen.width / 2 + 90;
            }

            // Mettre à jour tous les monstres (avec évitement de superposition)
            monstersRef.current.forEach((monster, index) => {
              if (monster.isAlive) {
                // Passer la liste de tous les monstres pour éviter les superpositions
                monster.update(monstersRef.current);

                updateMonsterHealthBar(monster);

                if (monster instanceof EpicMonster) {
                  monster.tryShoot(projectilesRef, gameWorld, createProjectileSprite, Date.now());
                }

                if (monster instanceof BossMonster) {
                  if (nowMs - monster.lastLaserAt >= monster.laserCooldownMs) {
                    monster.lastLaserAt = nowMs;
                    const side = bossLaserSideIndexRef.current % 4;
                    bossLaserSideIndexRef.current = (bossLaserSideIndexRef.current + 1) % 4;
                    createLaserAttack(side);
                  }
                }
                
                // Vérifier collision avec l'épée
                if (swordRef.current && swordRef.current.checkCollision(monster)) {
                  const damageMultiplier = playerRef.current?.damageMultiplier || 1;
                  const damage = swordRef.current.damage * Math.max(0.25, Number(damageMultiplier) || 1);
                  const isDead = monster.takeDamage(damage, Date.now());
                  if (isDead) {
                    console.log('Monstre tué par l\'épée!');
                    killsRef.current += 1;
                    if (monster instanceof EpicMonster) {
                      epicKillsRef.current += 1;
                    }
                    if (monster instanceof BossMonster && gameModeRef.current === 'normal' && !victoryShownRef.current) {
                      victoryShownRef.current = true;
                      const endNowMs = Date.now();
                      const endPausedExtra = pausedAtRef.current ? (endNowMs - pausedAtRef.current) : 0;
                      const timeSeconds = Math.max(1, Math.floor(Math.max(0, endNowMs - gameStartAtRef.current - (pausedTotalMsRef.current || 0) - endPausedExtra) / 1000));
                      const kills = killsRef.current;
                      setFinalTimeSeconds(timeSeconds);
                      setFinalKills(kills);
                      setFinalScore(kills * timeSeconds);
                      setShowVictory(true);

                      const runMaxLevel = playerRef.current?.level || 1;
                      try {
                        axios.post('/stats/run', { kills, epicKills: epicKillsRef.current, timeSeconds, maxLevel: runMaxLevel, heroModeWin: false, normalModeWin: true }).catch((e) => {
                          console.log('Erreur envoi stats:', e?.response?.data?.error || e.message);
                        });
                      } catch (e) {
                        console.log('Erreur envoi stats:', e?.response?.data?.error || e.message);
                      }
                    }
                    // Donner de l'expérience au joueur
                    const leveledUp = playerRef.current.gainExperience(25);
                    if (leveledUp) {
                      // Déclencher un powerup automatiquement
                      console.log('🎉 Niveau supérieur! Powerup automatique!');
                      setCurrentPowerup({ type: 'level_up', isLevelUp: true }); // Powerup spécial de niveau
                      setShowPowerupSelector(true);
                      powerupCollisionDetectedRef.current = true;
                    }
                  }
                }

                if (spearsRef.current && spearsRef.current.length > 0) {
                  for (const spear of spearsRef.current) {
                    if (!spear) continue;
                    if (spear.checkCollision(monster)) {
                      const damageMultiplier = playerRef.current?.damageMultiplier || 1;
                      const damage = spear.damage * Math.max(0.25, Number(damageMultiplier) || 1);
                      const isDead = monster.takeDamage(damage, Date.now());
                      if (isDead) {
                        killsRef.current += 1;
                        if (monster instanceof EpicMonster) {
                          epicKillsRef.current += 1;
                        }
                        if (monster instanceof BossMonster && gameModeRef.current === 'normal' && !victoryShownRef.current) {
                          victoryShownRef.current = true;
                          const endNowMs = Date.now();
                          const endPausedExtra = pausedAtRef.current ? (endNowMs - pausedAtRef.current) : 0;
                          const timeSeconds = Math.max(1, Math.floor(Math.max(0, endNowMs - gameStartAtRef.current - (pausedTotalMsRef.current || 0) - endPausedExtra) / 1000));
                          const kills = killsRef.current;
                          setFinalTimeSeconds(timeSeconds);
                          setFinalKills(kills);
                          setFinalScore(kills * timeSeconds);
                          setShowVictory(true);

                          const runMaxLevel = playerRef.current?.level || 1;
                          try {
                            axios.post('/stats/run', { kills, epicKills: epicKillsRef.current, timeSeconds, maxLevel: runMaxLevel, heroModeWin: false, normalModeWin: true }).catch((e) => {
                              console.log('Erreur envoi stats:', e?.response?.data?.error || e.message);
                            });
                          } catch (e) {
                            console.log('Erreur envoi stats:', e?.response?.data?.error || e.message);
                          }
                        }
                        const leveledUp = playerRef.current.gainExperience(25);
                        if (leveledUp) {
                          setCurrentPowerup({ type: 'level_up', isLevelUp: true });
                          setShowPowerupSelector(true);
                          powerupCollisionDetectedRef.current = true;
                        }
                      }
                      break;
                    }
                  }
                }
                
                // Vérifier collision avec le joueur (mais ne plus détruire le monstre)
                if (monster.checkCollision(playerRef.current)) {
                  // Le joueur prend des dégâts avec recul
                  const contactBase = 5;
                  const contactDamage = contactBase * Math.max(0.1, Number(enemyDamageMultiplierRef.current) || 1);
                  const isDead = playerRef.current.takeDamage(contactDamage, monster.x, monster.y);
                  updateHealthDisplay();
                  
                  // Ne plus détruire le monstre au contact du joueur
                  
                  if (isDead) {
                    console.log('Game Over!');
                    if (!gameOverShownRef.current) {
                      gameOverShownRef.current = true;
                      const endNowMs = Date.now();
                      const endPausedExtra = pausedAtRef.current ? (endNowMs - pausedAtRef.current) : 0;
                      const timeSeconds = Math.max(1, Math.floor(Math.max(0, endNowMs - gameStartAtRef.current - (pausedTotalMsRef.current || 0) - endPausedExtra) / 1000));
                      const kills = killsRef.current;
                      setFinalTimeSeconds(timeSeconds);
                      setFinalKills(kills);
                      setFinalScore(kills * timeSeconds);
                      setShowGameOver(true);

                      const runMaxLevel = playerRef.current?.level || 1;
                      try {
                        axios.post('/stats/run', { kills, epicKills: epicKillsRef.current, timeSeconds, maxLevel: runMaxLevel }).catch((e) => {
                          console.log('Erreur envoi stats:', e?.response?.data?.error || e.message);
                        });
                      } catch (e) {
                        console.log('Erreur envoi stats:', e?.response?.data?.error || e.message);
                      }
                    }
                  }
                }
              }
            });

            projectilesRef.current.forEach((projectile) => {
              if (!projectile.isAlive) return;

              projectile.update(MAP_WIDTH, MAP_HEIGHT);

              if (projectile.isAlive && projectile.checkCollision(playerRef.current)) {
                const dmg = (projectile.damage || 0) * Math.max(0.1, Number(enemyDamageMultiplierRef.current) || 1);
                const isDead = playerRef.current.takeDamage(dmg, projectile.x, projectile.y);
                updateHealthDisplay();
                projectile.destroy();
                if (isDead) {
                  console.log('Game Over!');
                  if (!gameOverShownRef.current) {
                    gameOverShownRef.current = true;
                    const endNowMs = Date.now();
                    const endPausedExtra = pausedAtRef.current ? (endNowMs - pausedAtRef.current) : 0;
                    const timeSeconds = Math.max(1, Math.floor(Math.max(0, endNowMs - gameStartAtRef.current - (pausedTotalMsRef.current || 0) - endPausedExtra) / 1000));
                    const kills = killsRef.current;
                    setFinalTimeSeconds(timeSeconds);
                    setFinalKills(kills);
                    setFinalScore(kills * timeSeconds);
                    setShowGameOver(true);

                    const runMaxLevel = playerRef.current?.level || 1;
                    try {
                      axios.post('/stats/run', { kills, epicKills: epicKillsRef.current, timeSeconds, maxLevel: runMaxLevel }).catch((e) => {
                        console.log('Erreur envoi stats:', e?.response?.data?.error || e.message);
                      });
                    } catch (e) {
                      console.log('Erreur envoi stats:', e?.response?.data?.error || e.message);
                    }
                  }
                }
              }
            });

            // Nettoyer les powerups morts
            powerupsRef.current = powerupsRef.current.filter(powerup => powerup.isAlive);

            // Nettoyer les monstres morts
            monstersRef.current = monstersRef.current.filter(monster => monster.isAlive);

            if (gameModeRef.current === 'boss') {
              const aliveBosses = (bossesRef.current || []).filter((b) => b && b.isAlive);
              if (!victoryShownRef.current && aliveBosses.length === 0 && (bossesRef.current || []).length > 0) {
                victoryShownRef.current = true;
                const endNowMs = Date.now();
                const endPausedExtra = pausedAtRef.current ? (endNowMs - pausedAtRef.current) : 0;
                const timeSeconds = Math.max(1, Math.floor(Math.max(0, endNowMs - gameStartAtRef.current - (pausedTotalMsRef.current || 0) - endPausedExtra) / 1000));
                const kills = killsRef.current;
                setFinalTimeSeconds(timeSeconds);
                setFinalKills(kills);
                setFinalScore(kills * timeSeconds);
                setShowVictory(true);

                const runMaxLevel = playerRef.current?.level || 1;
                try {
                  axios.post('/stats/run', { kills, epicKills: epicKillsRef.current, timeSeconds, maxLevel: runMaxLevel, heroModeWin: true }).catch((e) => {
                    console.log('Erreur envoi stats:', e?.response?.data?.error || e.message);
                  });
                } catch (e) {
                  console.log('Erreur envoi stats:', e?.response?.data?.error || e.message);
                }
              }
            }

            projectilesRef.current = projectilesRef.current.filter(projectile => projectile.isAlive);

            playerProjectilesRef.current = playerProjectilesRef.current.filter((p) => p.isAlive);

            // Mise à jour des lasers du boss
            lasersRef.current.forEach((lz) => {
              if (!lz) return;
              const age = nowMs - lz.createdAt;
              if (lz.phase === 'warning' && age >= 700) {
                lz.phase = 'beam';
                if (lz.warning && lz.warning.parent) {
                  lz.warning.parent.removeChild(lz.warning);
                }
                lz.warning = null;

                if (laserTextureRef.current) {
                  const beam = new PIXI.Sprite(laserTextureRef.current);
                  beam.anchor.set(0, 0.5);
                  beam.x = lz.sx;
                  beam.y = lz.sy;
                  beam.rotation = lz.angle;
                  beam.width = lz.length;
                  beam.height = 120;
                  beam.alpha = 0.95;
                  gameWorld.addChild(beam);
                  lz.beam = beam;
                } else {
                  const beam = new PIXI.Graphics();
                  beam.beginFill(0xffffff, 0.95);
                  beam.drawRect(0, -40, lz.length, 80);
                  beam.endFill();
                  beam.lineStyle(4, 0xff0000, 0.9);
                  beam.drawRect(0, -40, lz.length, 80);
                  beam.x = lz.sx;
                  beam.y = lz.sy;
                  beam.rotation = lz.angle;
                  gameWorld.addChild(beam);
                  lz.beam = beam;
                }
              }

              if (lz.phase === 'beam') {
                const beamDurationMs = 200;
                if (age >= 700 + beamDurationMs) {
                  if (lz.beam && lz.beam.parent) {
                    lz.beam.parent.removeChild(lz.beam);
                  }
                  lz.beam = null;
                  lz.phase = 'done';
                  return;
                }

                const player = playerRef.current;
                if (!player) return;

                // Collision joueur vs ligne (distance au segment)
                const px = player.x;
                const py = player.y;
                const x1 = lz.sx;
                const y1 = lz.sy;
                const x2 = lz.sx + Math.cos(lz.angle) * lz.length;
                const y2 = lz.sy + Math.sin(lz.angle) * lz.length;

                const vx = x2 - x1;
                const vy = y2 - y1;
                const wx = px - x1;
                const wy = py - y1;
                const c1 = wx * vx + wy * vy;
                const c2 = vx * vx + vy * vy;
                let t = 0;
                if (c2 > 0) {
                  t = c1 / c2;
                }
                t = Math.max(0, Math.min(1, t));
                const projx = x1 + t * vx;
                const projy = y1 + t * vy;
                const ddx = px - projx;
                const ddy = py - projy;
                const dist = Math.sqrt(ddx * ddx + ddy * ddy);

                const beamHalfWidth = 60;
                const hitRadius = (player.hitboxRadius || 20) + beamHalfWidth;
                if (dist <= hitRadius) {
                  const hitCooldownMs = 350;
                  if (nowMs - (lz.lastHitAt || 0) >= hitCooldownMs) {
                    lz.lastHitAt = nowMs;
                    const isDead = playerRef.current.takeDamage(20, px - Math.cos(lz.angle) * 10, py - Math.sin(lz.angle) * 10);
                    updateHealthDisplay();
                    if (isDead) {
                      console.log('Game Over!');
                      if (!gameOverShownRef.current) {
                        gameOverShownRef.current = true;
                        const endNowMs = Date.now();
                        const endPausedExtra = pausedAtRef.current ? (endNowMs - pausedAtRef.current) : 0;
                        const timeSeconds = Math.max(1, Math.floor(Math.max(0, endNowMs - gameStartAtRef.current - (pausedTotalMsRef.current || 0) - endPausedExtra) / 1000));
                        const kills = killsRef.current;
                        setFinalTimeSeconds(timeSeconds);
                        setFinalKills(kills);
                        setFinalScore(kills * timeSeconds);
                        setShowGameOver(true);

                        const runMaxLevel = playerRef.current?.level || 1;
                        try {
                          axios.post('/stats/run', { kills, epicKills: epicKillsRef.current, timeSeconds, maxLevel: runMaxLevel }).catch((e) => {
                            console.log('Erreur envoi stats:', e?.response?.data?.error || e.message);
                          });
                        } catch (e) {
                          console.log('Erreur envoi stats:', e?.response?.data?.error || e.message);
                        }
                      }
                    }
                  }
                }
              }
            });
            lasersRef.current = lasersRef.current.filter((lz) => lz && lz.phase !== 'done');
          }
        };

        app.ticker.add(gameLoop);

        // Fonction de nettoyage
        const cleanup = () => {
          window.removeEventListener('keydown', handleKeyDown);
          window.removeEventListener('keyup', handleKeyUp);
          if (monsterSpawnInterval) {
            clearInterval(monsterSpawnInterval);
          }
          if (powerupSpawnInterval) {
            clearInterval(powerupSpawnInterval);
          }
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
  }, []);

  // Handler pour la sélection de powerup
  const handlePowerupSelect = (powerupType) => {
    console.log('Powerup sélectionné:', powerupType);
    
    if (!playerRef.current || !currentPowerup) return;

    const currentClass = playerClassRef.current;
    const isMeleeClass = currentClass === 'knight' || currentClass === 'templar';
    const isTemplar = currentClass === 'templar';

    const addSpearInstanceFromPowerup = (angleOffset = 0) => {
      const gameWorld = gameWorldRef.current;
      if (!gameWorld || !playerRef.current) return;
      const spear = new Spear(playerRef.current, angleOffset);
      const baseDamage = spearsRef.current?.[0]?.damage;
      spear.damage = typeof baseDamage === 'number' && baseDamage > 0 ? baseDamage : 3;

      const spearSprite = createSpearSprite();
      spear.setSprite(spearSprite);
      gameWorld.addChild(spearSprite);

      const spearTipHitbox = createHitboxSprite(spear.tipRadius, 0x00ffff, 0.18);
      spear.setHitboxSprite(spearTipHitbox);
      gameWorld.addChild(spearTipHitbox);

      spearsRef.current.push(spear);
    };
    
    // Appliquer l'effet du powerup
    switch(powerupType) {
      case 'player_speed':
        playerRef.current.speedMultiplier *= 1.2;
        console.log('Speed multiplier:', playerRef.current.speedMultiplier);
        break;
      case 'hp_up':
        playerRef.current.maxHealth = (Number(playerRef.current.maxHealth) || 100) + 20;
        playerRef.current.health = Math.min(playerRef.current.maxHealth, (Number(playerRef.current.health) || 0) + 20);
        if (healthDisplayRef.current && healthDisplayRef.current.text) {
          const healthText = healthDisplayRef.current.container ?
            `${playerRef.current.health}/${playerRef.current.maxHealth}` :
            `❤️ ${playerRef.current.health}/${playerRef.current.maxHealth}`;
          healthDisplayRef.current.text.text = healthText;
        }
        break;
      case 'damage_reduction':
        playerRef.current.damageTakenMultiplier *= 0.85;
        break;
      case 'size_bonus':
        if (isMeleeClass) {
          if (swordRef.current) {
            const scaleFactor = 1.2;
            swordRef.current.hitboxWidth = Math.round((Number(swordRef.current.hitboxWidth) || 0) * scaleFactor);
            swordRef.current.hitboxHeight = Math.round((Number(swordRef.current.hitboxHeight) || 0) * scaleFactor);
            if (swordRef.current.sprite && swordRef.current.sprite.scale) {
              swordRef.current.sprite.scale.set(
                swordRef.current.sprite.scale.x * scaleFactor,
                swordRef.current.sprite.scale.y * scaleFactor
              );
            }
          }
          if (spearsRef.current && spearsRef.current.length > 0) {
            const gameWorld = gameWorldRef.current;
            spearsRef.current.forEach((s) => {
              if (!s) return;
              s.tipRadius = (Number(s.tipRadius) || 22) * 1.2;
              if (gameWorld) {
                if (s.hitboxSprite && s.hitboxSprite.parent) {
                  s.hitboxSprite.parent.removeChild(s.hitboxSprite);
                }
                const newTip = createHitboxSprite(s.tipRadius, 0x00ffff, 0.18);
                s.setHitboxSprite(newTip);
                gameWorld.addChild(newTip);
              }
            });
          }
        } else {
          playerRef.current.fireballSizeMultiplier *= 1.2;
          console.log('Fireball size multiplier:', playerRef.current.fireballSizeMultiplier);
        }
        break;
      case 'projectile_speed':
        playerRef.current.projectileSpeedMultiplier *= 1.25;
        break;
      case 'projectile_range':
        playerRef.current.projectileRangeMultiplier *= 1.25;
        break;
      case 'fireball_size':
        if (isMeleeClass) {
          if (swordRef.current) {
            const scaleFactor = 1.5;
            swordRef.current.hitboxWidth = Math.round((Number(swordRef.current.hitboxWidth) || 0) * scaleFactor);
            swordRef.current.hitboxHeight = Math.round((Number(swordRef.current.hitboxHeight) || 0) * scaleFactor);
            if (swordRef.current.sprite && swordRef.current.sprite.scale) {
              swordRef.current.sprite.scale.set(
                swordRef.current.sprite.scale.x * scaleFactor,
                swordRef.current.sprite.scale.y * scaleFactor
              );
            }
          }
          if (spearsRef.current && spearsRef.current.length > 0) {
            const gameWorld = gameWorldRef.current;
            spearsRef.current.forEach((s) => {
              if (!s) return;
              s.tipRadius = (Number(s.tipRadius) || 22) * 1.5;
              s.thrustDistance = (Number(s.thrustDistance) || 75) * 1.2;
              if (gameWorld) {
                if (s.hitboxSprite && s.hitboxSprite.parent) {
                  s.hitboxSprite.parent.removeChild(s.hitboxSprite);
                }
                const newTip = createHitboxSprite(s.tipRadius, 0x00ffff, 0.18);
                s.setHitboxSprite(newTip);
                gameWorld.addChild(newTip);
              }
            });
          }
        } else {
          playerRef.current.fireballSizeMultiplier *= 1.5;
          console.log('Fireball size multiplier:', playerRef.current.fireballSizeMultiplier);
        }
        break;
      case 'damage_bonus':
        playerRef.current.damageMultiplier *= 1.2;
        console.log('Damage multiplier:', playerRef.current.damageMultiplier);
        break;
      case 'sword_damage':
        if (swordRef.current) {
          swordRef.current.damage *= 1.2;
        }
        break;
      case 'sword_size':
        if (swordRef.current) {
          const scaleFactor = 1.25;
          swordRef.current.hitboxWidth = Math.round((Number(swordRef.current.hitboxWidth) || 0) * scaleFactor);
          swordRef.current.hitboxHeight = Math.round((Number(swordRef.current.hitboxHeight) || 0) * scaleFactor);
          if (swordRef.current.sprite && swordRef.current.sprite.scale) {
            swordRef.current.sprite.scale.set(
              swordRef.current.sprite.scale.x * scaleFactor,
              swordRef.current.sprite.scale.y * scaleFactor
            );
          }
        }
        break;
      case 'sword_radius':
        if (swordRef.current) {
          swordRef.current.radius *= 1.2;
        }
        break;
      case 'sword_spin':
        playerRef.current.rotationSpeedMultiplier *= 1.15;
        break;
      case 'knight_guard':
        playerRef.current.damageTakenMultiplier *= 0.9;
        break;
      case 'knight_speed':
        playerRef.current.speedMultiplier *= 1.2;
        break;
      case 'multi_shot':
        if (isMeleeClass) {
          playerRef.current.rotationSpeedMultiplier *= 1.15;
          console.log('Attack speed multiplier:', playerRef.current.rotationSpeedMultiplier);
        } else {
          playerRef.current.projectilesPerShot = Math.max(1, Math.min(9, (Number(playerRef.current.projectilesPerShot) || 1) + 1));
          console.log('Projectiles per shot:', playerRef.current.projectilesPerShot);
        }
        break;
      case 'mage_power':
        playerRef.current.rangedDamageMultiplier *= 1.2;
        break;
      case 'mage_haste':
        playerRef.current.rotationSpeedMultiplier *= 1.15;
        break;
      case 'mage_focus':
        playerRef.current.projectileSpeedMultiplier *= 1.15;
        break;
      case 'mage_barrier':
        playerRef.current.damageTakenMultiplier *= 0.9;
        break;
      case 'ranger_damage':
        playerRef.current.rangedDamageMultiplier *= 1.2;
        break;
      case 'ranger_speed':
        playerRef.current.projectileSpeedMultiplier *= 1.2;
        break;
      case 'ranger_range':
        playerRef.current.projectileRangeMultiplier *= 1.25;
        break;
      case 'ranger_evasion':
        playerRef.current.speedMultiplier *= 1.2;
        break;
      case 'ranger_armor':
        playerRef.current.damageTakenMultiplier *= 0.9;
        break;
      case 'spear_count':
        if (isTemplar) {
          const currentCount = Array.isArray(spearsRef.current) ? spearsRef.current.length : 0;
          const next = Math.min(6, currentCount + 1);
          if (next > currentCount) {
            const spread = next === 1 ? 0 : 0.22;
            const angleOffset = (currentCount - (next - 1) / 2) * spread;
            addSpearInstanceFromPowerup(angleOffset);
          }
        }
        break;
      case 'spear_damage':
        if (spearsRef.current && spearsRef.current.length > 0) {
          spearsRef.current.forEach((s) => {
            if (s) s.damage *= 1.25;
          });
        }
        break;
      case 'spear_size':
        if (spearsRef.current && spearsRef.current.length > 0) {
          const gameWorld = gameWorldRef.current;
          spearsRef.current.forEach((s) => {
            if (!s) return;
            s.tipRadius = (Number(s.tipRadius) || 22) * 1.25;
            if (gameWorld) {
              if (s.hitboxSprite && s.hitboxSprite.parent) {
                s.hitboxSprite.parent.removeChild(s.hitboxSprite);
              }
              const newTip = createHitboxSprite(s.tipRadius, 0x00ffff, 0.18);
              s.setHitboxSprite(newTip);
              gameWorld.addChild(newTip);
            }
          });
        }
        break;
      case 'spear_reach':
        if (spearsRef.current && spearsRef.current.length > 0) {
          spearsRef.current.forEach((s) => {
            if (!s) return;
            s.baseDistance = (Number(s.baseDistance) || 70) * 1.2;
            s.thrustDistance = (Number(s.thrustDistance) || 75) * 1.2;
          });
        }
        break;
      case 'templar_guard':
        playerRef.current.damageTakenMultiplier *= 0.9;
        break;
      case 'templar_haste':
        playerRef.current.rotationSpeedMultiplier *= 1.15;
        break;
      case 'attack_speed':
        playerRef.current.rotationSpeedMultiplier *= 1.15;
        break;
      default:
        console.warn('Type de powerup inconnu:', powerupType);
    }

    if (gameModeRef.current === 'boss' && bossModePicksLeftRef.current > 0) {
      bossModePicksLeftRef.current -= 1;
      setBossModePicksDone((v) => v + 1);

      if (bossModePicksLeftRef.current > 0) {
        setCurrentPowerup({ type: 'boss_mode_pick', isLevelUp: true, _k: Date.now() });
        setShowPowerupSelector(true);
        powerupCollisionDetectedRef.current = true;
        return;
      }

      setShowPowerupSelector(false);
      setCurrentPowerup(null);
      powerupCollisionDetectedRef.current = false;

      pausedAtRef.current = null;
      pausedTotalMsRef.current = 0;
      gameStartAtRef.current = Date.now();

      if (createBossRef.current) {
        const count = gameModeRef.current === 'boss' ? 3 : 1;
        createBossRef.current(count);
      }
      return;
    }
    
    // Détruire le powerup (seulement si c'est un vrai powerup, pas un level up)
    if (currentPowerup && !currentPowerup.isLevelUp && currentPowerup.sprite && currentPowerup.sprite.parent) {
      currentPowerup.sprite.parent.removeChild(currentPowerup.sprite);
      currentPowerup.isAlive = false;
    }
    
    // Fermer le modal et réinitialiser le flag
    setShowPowerupSelector(false);
    setCurrentPowerup(null);
    powerupCollisionDetectedRef.current = false;
  };

  const handlePowerupCancel = () => {
    if (gameModeRef.current === 'boss' && bossModePicksLeftRef.current > 0) {
      return;
    }
    if (currentPowerup && !currentPowerup.isLevelUp && currentPowerup.sprite && currentPowerup.sprite.parent) {
      currentPowerup.sprite.parent.removeChild(currentPowerup.sprite);
      currentPowerup.isAlive = false;
    }
    setShowPowerupSelector(false);
    setCurrentPowerup(null);
    powerupCollisionDetectedRef.current = false;
  };

  // Debug effect
  useEffect(() => {
    console.log('showPowerupSelector changed:', showPowerupSelector);
  }, [showPowerupSelector]);

  useEffect(() => {
    modalOpenRef.current = !!showPowerupSelector || !!showGameOver || !!showVictory;
  }, [showPowerupSelector, showGameOver, showVictory]);

  useEffect(() => {
    const isPaused = !!showPowerupSelector || !!showGameOver || !!showVictory;
    if (isPaused) {
      if (pausedAtRef.current === null) {
        pausedAtRef.current = Date.now();
      }
      return;
    }

    if (pausedAtRef.current !== null) {
      const nowMs = Date.now();
      pausedTotalMsRef.current = (pausedTotalMsRef.current || 0) + (nowMs - pausedAtRef.current);
      pausedAtRef.current = null;
    }
  }, [showPowerupSelector, showGameOver]);

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
      {showPowerupSelector && (
        <PowerupSelector 
          onSelect={handlePowerupSelect}
          onCancel={handlePowerupCancel}
          playerClass={playerClassRef.current}
          key={isBossMode ? `boss-${bossModePicksDone}` : 'normal'}
        />
      )}
      {showVictory && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            width: 'min(520px, 92vw)',
            backgroundColor: '#0f0f0f',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            borderRadius: '10px',
            padding: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.6)'
          }}>
            <h2 style={{
              margin: '0 0 10px 0',
              color: '#d4af37',
              fontFamily: 'serif'
            }}>
              Victoire
            </h2>
            <div style={{
              color: '#e6e6e6',
              fontFamily: 'monospace',
              lineHeight: 1.5
            }}>
              <div>Temps: {finalTimeSeconds}s</div>
              <div>Ennemis tués: {finalKills}</div>
              <div style={{ marginTop: '10px', fontSize: '18px' }}>
                Score: {finalScore}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  padding: '10px 14px',
                  backgroundColor: '#d4af37',
                  color: '#1a1a1a',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Retour au dashboard
              </button>
            </div>
          </div>
        </div>
      )}
      {showGameOver && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            width: 'min(520px, 92vw)',
            backgroundColor: '#0f0f0f',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            borderRadius: '10px',
            padding: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.6)'
          }}>
            <h2 style={{
              margin: '0 0 10px 0',
              color: '#d4af37',
              fontFamily: 'serif'
            }}>
              Game Over
            </h2>
            <div style={{
              color: '#e6e6e6',
              fontFamily: 'monospace',
              lineHeight: 1.5
            }}>
              <div>Temps: {finalTimeSeconds}s</div>
              <div>Ennemis tués: {finalKills}</div>
              <div style={{ marginTop: '10px', fontSize: '18px' }}>
                Score: {finalScore}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                onClick={() => navigate('/')}
                style={{
                  padding: '10px 14px',
                  backgroundColor: '#d4af37',
                  color: '#1a1a1a',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        </div>
      )}
      <div 
        ref={gameRef} 
        style={{ 
          width: '100vw',
          height: '100vh',
          position: 'relative'
        }}
      />
    </div>
  );
};

export default Game;
