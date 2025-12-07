import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as PIXI from 'pixi.js';
import PowerupSelector from './PowerupSelector';
import CharacterSelector from './CharacterSelector';

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
    // Système de powerups
    this.speedMultiplier = 1; // Multiplicateur de vitesse
    this.rotationSpeedMultiplier = 1; // Multiplicateur de vitesse de rotation
    this.sizeMultiplier = 1; // Multiplicateur de taille
    // Système de progression
    this.level = 1;
    this.experience = 0;
    this.experienceToNextLevel = 100;
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

  gainExperience(amount) {
    this.experience += amount;
    if (this.experience >= this.experienceToNextLevel) {
      this.level += 1;
      this.experience -= this.experienceToNextLevel;
      this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * 1.2); // Augmente de 20% chaque niveau
      return true; // Retourne true si level up
    }
    return false;
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

// Classe Fireball (boule de feu du monstre épique)
class Fireball {
  constructor(x, y, targetX, targetY) {
    this.x = x;
    this.y = y;
    this.speed = 0.6;
    
    // Calculer la direction vers la cible
    const dx = targetX - x;
    const dy = targetY - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    this.velocityX = (dx / distance) * this.speed;
    this.velocityY = (dy / distance) * this.speed;
    
    this.sprite = null;
    this.hitbox = null;
    this.isAlive = true;
    this.lifespan = 400; // Durée de vie en frames
    this.age = 0;
    this.damage = 3; // Dégâts élevés
  }

  update(mapWidth = 2400, mapHeight = 2400) {
    this.x += this.velocityX;
    this.y += this.velocityY;
    this.age++;

    // Détruire la boule de feu après sa durée de vie
    if (this.age > this.lifespan) {
      this.destroy();
    }

    // Détruire si sort de la map
    if (this.x < -50 || this.x > mapWidth + 50 || this.y < -50 || this.y > mapHeight + 50) {
      this.destroy();
    }

    if (this.sprite) {
      this.sprite.x = this.x;
      this.sprite.y = this.y;
      // Rotation pour effet visuel
      this.sprite.rotation += 0.1;
    }

    // Mettre à jour la hitbox
    if (this.hitbox) {
      this.hitbox.x = this.x;
      this.hitbox.y = this.y;
    }
  }

  setSprite(sprite) {
    this.sprite = sprite;
    sprite.x = this.x;
    sprite.y = this.y;
  }

  setHitbox(hitbox) {
    this.hitbox = hitbox;
    hitbox.x = this.x;
    hitbox.y = this.y;
  }

  checkCollision(player) {
    const distance = Math.sqrt((this.x - player.x) ** 2 + (this.y - player.y) ** 2);
    return distance < 30;
  }

  destroy() {
    this.isAlive = false;
    if (this.sprite && this.sprite.parent) {
      this.sprite.parent.removeChild(this.sprite);
    }
    if (this.hitbox && this.hitbox.parent) {
      this.hitbox.parent.removeChild(this.hitbox);
    }
  }
}

// Classe EpicMonster (monstre épique avec attaques à distance)
class EpicMonster {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 0.25; // Plus lent que les monstres normaux
    this.sprite = null;
    this.healthBar = null;
    this.healthBarBackground = null;
    this.health = 10; // Plus résistant
    this.maxHealth = 10;
    this.isAlive = true;
    this.lastFireballTime = 0;
    this.fireballCooldown = 2000; // Tire toutes les 2 secondes
    this.attackRange = 300; // Distance d'attaque
    this.minDistance = 150; // Distance minimale à maintenir
  }

  update(player, otherMonsters = []) {
    if (!player) return;

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Comportement : maintenir une distance et tirer
    if (distance > this.attackRange) {
      // Trop loin, se rapprocher
      const newX = this.x + (dx / distance) * this.speed;
      const newY = this.y + (dy / distance) * this.speed;

      // Vérifier les collisions avec les autres monstres
      let collision = false;
      for (let other of otherMonsters) {
        if (other !== this && other.isAlive) {
          const otherDx = newX - other.x;
          const otherDy = newY - other.y;
          const otherDistance = Math.sqrt(otherDx * otherDx + otherDy * otherDy);
          
          if (otherDistance < 40) {
            collision = true;
            break;
          }
        }
      }

      if (!collision) {
        this.x = newX;
        this.y = newY;
      }
    } else if (distance < this.minDistance) {
      // Trop proche, reculer
      const newX = this.x - (dx / distance) * this.speed;
      const newY = this.y - (dy / distance) * this.speed;

      let collision = false;
      for (let other of otherMonsters) {
        if (other !== this && other.isAlive) {
          const otherDx = newX - other.x;
          const otherDy = newY - other.y;
          const otherDistance = Math.sqrt(otherDx * otherDx + otherDy * otherDy);
          
          if (otherDistance < 40) {
            collision = true;
            break;
          }
        }
      }

      if (!collision) {
        this.x = newX;
        this.y = newY;
      }
    }
    // Sinon reste à distance optimale

    // Mettre à jour le sprite
    if (this.sprite) {
      this.sprite.x = this.x;
      this.sprite.y = this.y;
    }

    // Mettre à jour la barre de vie
    this.updateHealthBar();
  }

  updateHealthBar() {
    if (this.healthBarBackground && this.healthBar) {
      // Positionner au-dessus du monstre
      this.healthBarBackground.x = this.x - 40;
      this.healthBarBackground.y = this.y - 50;
      this.healthBar.x = this.x - 40;
      this.healthBar.y = this.y - 50;

      // Mettre à jour la largeur de la barre
      const healthPercent = Math.max(0, this.health / this.maxHealth);
      this.healthBar.clear();
      this.healthBar.beginFill(0x00FF00);
      this.healthBar.drawRect(0, 0, 80 * healthPercent, 8);
      this.healthBar.endFill();
    }
  }

  canShoot(currentTime) {
    return currentTime - this.lastFireballTime > this.fireballCooldown;
  }

  shoot(currentTime, targetX, targetY) {
    this.lastFireballTime = currentTime;
    return new Fireball(this.x, this.y, targetX, targetY);
  }

  setSprite(sprite) {
    this.sprite = sprite;
    sprite.x = this.x;
    sprite.y = this.y;
  }

  setHealthBar(background, bar) {
    this.healthBarBackground = background;
    this.healthBar = bar;
  }

  checkCollision(player) {
    const distance = Math.sqrt((this.x - player.x) ** 2 + (this.y - player.y) ** 2);
    return distance < 30;
  }

  takeDamage(damage) {
    this.health = Math.max(0, this.health - damage);
    console.log(`💔 Monstre épique blessé! HP: ${this.health}/${this.maxHealth}`);
    if (this.health <= 0) {
      this.destroy();
      return true;
    }
    return false;
  }

  destroy() {
    this.isAlive = false;
    if (this.sprite && this.sprite.parent) {
      this.sprite.parent.removeChild(this.sprite);
    }
    if (this.healthBarBackground && this.healthBarBackground.parent) {
      this.healthBarBackground.parent.removeChild(this.healthBarBackground);
    }
    if (this.healthBar && this.healthBar.parent) {
      this.healthBar.parent.removeChild(this.healthBar);
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

// Classe Spear (lance qui fait des coups devant le joueur)
class Spear {
  constructor(player) {
    this.player = player;
    this.sprite = null;
    this.hitbox = null;
    this.damage = 1;
    this.attackCooldown = 500; // Millisecondes entre les attaques
    this.lastAttackTime = 0;
    this.isAttacking = false;
    this.attackDuration = 200; // Durée de l'animation d'attaque en ms
    this.attackStartTime = 0;
    this.baseDistance = 80; // Distance de base devant le joueur
    this.attackDistance = 140; // Distance pendant l'attaque
    this.currentDistance = this.baseDistance;
    this.hasHit = false; // Pour éviter de frapper plusieurs fois pendant une attaque
  }

  update() {
    if (!this.player) return;

    const currentTime = Date.now();

    // Gérer l'animation d'attaque
    if (this.isAttacking) {
      const attackProgress = (currentTime - this.attackStartTime) / this.attackDuration;
      if (attackProgress >= 1) {
        // Fin de l'attaque
        this.isAttacking = false;
        this.currentDistance = this.baseDistance;
      } else {
        // Animation d'extension de la lance (ease-out)
        const easeOut = 1 - Math.pow(1 - attackProgress, 3);
        this.currentDistance = this.baseDistance + (this.attackDistance - this.baseDistance) * easeOut;
      }
    }

    // Attaque automatique si cooldown est écoulé
    if (!this.isAttacking && currentTime - this.lastAttackTime > this.attackCooldown) {
      this.attack(currentTime);
    }

    // Calculer la position devant le joueur dans la direction du mouvement
    const direction = this.player.direction || { x: 0, y: -1 };
    this.x = this.player.x + direction.x * this.currentDistance;
    this.y = this.player.y + direction.y * this.currentDistance;

    // Mettre à jour le sprite
    if (this.sprite) {
      this.sprite.x = this.x;
      this.sprite.y = this.y;
      // Orienter la lance dans la direction du joueur
      // Ajouter π/2 car l'image pointe à droite par défaut (anchor 0, 0.5)
      this.sprite.rotation = Math.atan2(direction.y, direction.x) + Math.PI / 2;
    }

    // Mettre à jour la hitbox
    if (this.hitbox) {
      this.hitbox.x = this.x;
      this.hitbox.y = this.y;
    }
  }

  attack(currentTime) {
    this.isAttacking = true;
    this.lastAttackTime = currentTime;
    this.attackStartTime = currentTime;
    this.hasHit = false; // Réinitialiser le flag à chaque nouvelle attaque
  }

  setSprite(sprite) {
    this.sprite = sprite;
    sprite.x = this.x;
    sprite.y = this.y;
  }

  setHitbox(hitbox) {
    this.hitbox = hitbox;
    hitbox.x = this.x;
    hitbox.y = this.y;
  }

  // Vérifier collision avec un monstre (seulement pendant l'attaque)
  checkCollision(monster) {
    if (!this.isAttacking || this.hasHit) return false;
    const distance = Math.sqrt((this.x - monster.x) ** 2 + (this.y - monster.y) ** 2);
    if (distance < 60) { // Augmenté pour correspondre au sprite entier
      this.hasHit = true;
      return true;
    }
    return false;
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

// Classe Arrow (pour le rodeur)
class Arrow {
  constructor(x, y, dirX, dirY) {
    this.x = x;
    this.y = y;
    this.speed = 0.8;
    this.velocityX = dirX * this.speed;
    this.velocityY = dirY * this.speed;
    this.sprite = null;
    this.hitbox = null;
    this.isAlive = true;
    this.lifespan = 300; // Durée de vie en frames
    this.age = 0;
    this.direction = { x: dirX, y: dirY };
  }

  update(mapWidth = 2400, mapHeight = 2400) {
    this.x += this.velocityX;
    this.y += this.velocityY;
    this.age++;

    // Détruire la flèche après sa durée de vie
    if (this.age > this.lifespan) {
      this.destroy();
    }

    // Détruire la flèche s'elle sort de la map
    if (this.x < -50 || this.x > mapWidth + 50 || this.y < -50 || this.y > mapHeight + 50) {
      this.destroy();
    }

    if (this.sprite) {
      this.sprite.x = this.x;
      this.sprite.y = this.y;
      // Orienter la flèche dans la direction de tir
      this.sprite.rotation = Math.atan2(this.velocityY, this.velocityX);
    }

    // Mettre à jour la hitbox
    if (this.hitbox) {
      this.hitbox.x = this.x;
      this.hitbox.y = this.y;
    }
  }

  setSprite(sprite) {
    this.sprite = sprite;
    sprite.x = this.x;
    sprite.y = this.y;
  }

  setHitbox(hitbox) {
    this.hitbox = hitbox;
    hitbox.x = this.x;
    hitbox.y = this.y;
  }

  checkCollision(monster) {
    const distance = Math.sqrt((this.x - monster.x) ** 2 + (this.y - monster.y) ** 2);
    return distance < 45; // Augmenté pour correspondre au sprite entier
  }

  destroy() {
    this.isAlive = false;
    if (this.sprite && this.sprite.parent) {
      this.sprite.parent.removeChild(this.sprite);
    }
    if (this.hitbox && this.hitbox.parent) {
      this.hitbox.parent.removeChild(this.hitbox);
    }
  }
}

// Classe Projectile (pour le magicien)
class Projectile {
  constructor(x, y, velocityX, velocityY) {
    this.x = x;
    this.y = y;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.sprite = null;
    this.isAlive = true;
    this.damage = 1;
    this.speed = 0.8; // Vitesse des projectiles
    this.lifespan = 300; // Frames avant disparition (5 secondes à 60fps)
    this.age = 0;
  }

  update(mapWidth = 2400, mapHeight = 2400) {
    this.x += this.velocityX * this.speed;
    this.y += this.velocityY * this.speed;
    this.age++;

    if (this.sprite) {
      this.sprite.x = this.x;
      this.sprite.y = this.y;
    }

    // Détruire le projectile après sa durée de vie
    if (this.age > this.lifespan) {
      this.destroy();
    }

    // Détruire le projectile s'il sort de la map
    if (this.x < -50 || this.x > mapWidth + 50 || this.y < -50 || this.y > mapHeight + 50) {
      this.destroy();
    }
  }

  setSprite(sprite) {
    this.sprite = sprite;
    sprite.x = this.x;
    sprite.y = this.y;
  }

  checkCollision(monster) {
    const distance = Math.sqrt((this.x - monster.x) ** 2 + (this.y - monster.y) ** 2);
    return distance < 30; // Distance de collision
  }

  destroy() {
    this.isAlive = false;
    if (this.sprite && this.sprite.parent) {
      this.sprite.parent.removeChild(this.sprite);
    }
  }
}

// Classe Wizard (Magicien)
class Wizard extends Player {
  constructor(x, y) {
    super(x, y);
    this.characterType = 'wizard';
    this.speed = 0.5; // Légèrement plus rapide que le guerrier
    this.lastProjectileTime = 0;
    this.projectileCooldown = 250; // Millisecondes entre les projectiles
    this.direction = { x: 0, y: -1 }; // Direction actuelle
    this.maxProjectiles = 1; // Nombre max de projectiles lancés en même temps
    this.projectilesInFlight = 0; // Nombre de projectiles actuellement en vol
  }

  canShoot(currentTime) {
    return currentTime - this.lastProjectileTime > this.projectileCooldown;
  }

  shoot(currentTime) {
    this.lastProjectileTime = currentTime;
    
    // Créer un projectile dans la direction du mouvement
    const projectile = new Projectile(
      this.x,
      this.y,
      this.direction.x,
      this.direction.y
    );
    
    return projectile;
  }

  updateDirection(keys) {
    // Mettre à jour la direction en fonction des touches actives
    let dirX = 0;
    let dirY = 0;

    if (keys.left) dirX = -1;
    if (keys.right) dirX = 1;
    if (keys.up) dirY = -1;
    if (keys.down) dirY = 1;

    // Normaliser la direction
    if (dirX !== 0 || dirY !== 0) {
      const length = Math.sqrt(dirX * dirX + dirY * dirY);
      this.direction.x = dirX / length;
      this.direction.y = dirY / length;
    }
  }

  update(keys, mapWidth, mapHeight) {
    // Mettre à jour la direction
    this.updateDirection(keys);
    
    // Appeler la méthode update du parent
    super.update(keys, mapWidth, mapHeight);
  }
}

// Classe Rogue (Rodeur)
class Rogue extends Player {
  constructor(x, y) {
    super(x, y);
    this.characterType = 'rogue';
    this.speed = 0.6; // Plus rapide
    this.lastArrowTime = 0;
    this.arrowCooldown = 300; // Légèrement plus lent que le wizard
    this.direction = { x: 0, y: -1 }; // Direction actuelle
    this.maxArrows = 2; // Nombre max de flèches lancées en même temps
    this.arrowsInFlight = 0; // Nombre de flèches actuellement en vol
  }

  canShoot(currentTime) {
    return currentTime - this.lastArrowTime > this.arrowCooldown;
  }

  shoot(currentTime) {
    this.lastArrowTime = currentTime;
    
    // Créer une flèche dans la direction du mouvement
    const arrow = new Arrow(
      this.x,
      this.y,
      this.direction.x,
      this.direction.y
    );
    
    return arrow;
  }

  updateDirection(keys) {
    // Mettre à jour la direction en fonction des touches actives
    let dirX = 0;
    let dirY = 0;

    if (keys.left) dirX = -1;
    if (keys.right) dirX = 1;
    if (keys.up) dirY = -1;
    if (keys.down) dirY = 1;

    // Normaliser la direction
    if (dirX !== 0 || dirY !== 0) {
      const length = Math.sqrt(dirX * dirX + dirY * dirY);
      this.direction.x = dirX / length;
      this.direction.y = dirY / length;
    }
  }

  update(keys, mapWidth, mapHeight) {
    // Mettre à jour la direction
    this.updateDirection(keys);
    
    // Appeler la méthode update du parent
    super.update(keys, mapWidth, mapHeight);
  }
}

// Classe FallenKnight (Templier Déchu)
class FallenKnight extends Player {
  constructor(x, y) {
    super(x, y);
    this.characterType = 'fallen_knight';
    this.speed = 0.4; // Même vitesse que le guerrier
    this.direction = { x: 0, y: -1 }; // Direction actuelle pour la lance
  }

  updateDirection(keys) {
    // Mettre à jour la direction en fonction des touches actives
    let dirX = 0;
    let dirY = 0;

    if (keys.left) dirX = -1;
    if (keys.right) dirX = 1;
    if (keys.up) dirY = -1;
    if (keys.down) dirY = 1;

    // Normaliser la direction
    if (dirX !== 0 || dirY !== 0) {
      const length = Math.sqrt(dirX * dirX + dirY * dirY);
      this.direction.x = dirX / length;
      this.direction.y = dirY / length;
    }
  }

  update(keys, mapWidth, mapHeight) {
    // Mettre à jour la direction
    this.updateDirection(keys);
    
    // Appeler la méthode update du parent
    super.update(keys, mapWidth, mapHeight);
  }
}

// Classe Warrior (Guerrier) - pour cohérence
class Warrior extends Player {
  constructor(x, y) {
    super(x, y);
    this.characterType = 'warrior';
  }
}

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

  // Constantes de la map (zoom x4 de la taille de base)
  const MAP_WIDTH = 2400; // 4x plus grande que 600x600
  const MAP_HEIGHT = 2400; // 4x plus grande que 600x600

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
            if (powerupsRef.current.length > 0) {
              console.log('Vérification collision avec', powerupsRef.current.length, 'powerups');
            }
            powerupsRef.current.forEach((powerup, idx) => {
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
            monstersRef.current.forEach((monster, index) => {
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
                    playerRef.current.gainExperience(100); // Plus d'XP
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
                  const isDead = playerRef.current.takeDamage(2, epicMonster.x, epicMonster.y); // Plus de dégâts
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
    
    // Appliquer l'effet du powerup en fonction du type de personnage
    const isWizard = playerRef.current instanceof Wizard || playerRef.current.characterType === 'wizard';
    const isRogue = playerRef.current instanceof Rogue || playerRef.current.characterType === 'rogue';
    
    // Powerups universels
    switch(powerupType) {
      case 'speed_boost':
      case 'speed_boost':
        playerRef.current.speedMultiplier *= 1.5; // +50% vitesse
        console.log('⚡ Speed boost! Multiplicateur:', playerRef.current.speedMultiplier);
        break;
      case 'rotation_speed':
        // Pour le guerrier/autres classes avec épée = épée plus rapide
        if (!isWizard && !isRogue) {
          playerRef.current.rotationSpeedMultiplier *= 2; // +100% vitesse rotation épée
          console.log('🌀 Épée rapide! Multiplicateur:', playerRef.current.rotationSpeedMultiplier);
        } else if (isWizard) {
          // Pour le magicien = plus de projectiles en même temps
          playerRef.current.maxProjectiles = (playerRef.current.maxProjectiles || 1) + 1;
          console.log('💥 Multi-projectiles! Max projectiles:', playerRef.current.maxProjectiles);
        }
        break;
      case 'size_boost':
        playerRef.current.sizeMultiplier *= 1.5; // +50% taille
        if (playerRef.current.sprite) {
          playerRef.current.sprite.scale.set(
            playerRef.current.sprite.scale.x * 1.5,
            playerRef.current.sprite.scale.y * 1.5
          );
        }
        console.log('📏 Géant! Taille multiplicatrice:', playerRef.current.sizeMultiplier);
        break;
      case 'multi_projectiles':
        // Powerup pour le magicien = plus de projectiles
        if (isWizard) {
          playerRef.current.maxProjectiles = (playerRef.current.maxProjectiles || 1) + 1;
          console.log('💥 Multi-projectiles! Max projectiles:', playerRef.current.maxProjectiles);
        }
        break;
      case 'fire_rate':
        // Powerup spécifique au magicien = tirer plus vite
        if (isWizard) {
          playerRef.current.projectileCooldown = Math.max(100, playerRef.current.projectileCooldown * 0.7); // -30% cooldown
          console.log('🔥 Tir rapide! Cooldown:', playerRef.current.projectileCooldown);
        }
        break;
      case 'arrow_speed':
        // Powerup spécifique au rodeur = flèches plus rapides
        if (isRogue) {
          playerRef.current.arrowCooldown = Math.max(100, playerRef.current.arrowCooldown * 0.75); // -25% cooldown
          console.log('💨 Flèches rapides! Cooldown:', playerRef.current.arrowCooldown);
        }
        break;
      case 'multi_arrows':
        // Powerup spécifique au rodeur = plus de flèches
        if (isRogue) {
          playerRef.current.maxArrows = (playerRef.current.maxArrows || 1) + 1;
          console.log('🎯 Multi-flèches! Max flèches:', playerRef.current.maxArrows);
        }
        break;
      case 'spear_speed':
        // Powerup spécifique au templier déchu = lance plus rapide
        if (spearRef.current) {
          spearRef.current.attackCooldown = Math.max(200, spearRef.current.attackCooldown * 0.7); // -30% cooldown
          console.log('⚔️ Lance rapide! Cooldown:', spearRef.current.attackCooldown);
        }
        break;
      case 'spear_range':
        // Powerup spécifique au templier déchu = portée augmentée
        if (spearRef.current) {
          spearRef.current.baseDistance *= 1.5; // +50% distance de base
          spearRef.current.attackDistance *= 1.5; // +50% distance d'attaque
          console.log('📏 Portée augmentée! Distance:', spearRef.current.attackDistance);
        }
        break;
      default:
        console.warn('Type de powerup inconnu:', powerupType);
    }
    
    // Détruire le powerup
    if (currentPowerup && currentPowerup.sprite && currentPowerup.sprite.parent) {
      currentPowerup.sprite.parent.removeChild(currentPowerup.sprite);
    }
    currentPowerup.isAlive = false;
    
    // Fermer le modal et réinitialiser le flag
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

  // Debug effect
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
