import { Fireball } from './Fireball.js';

// Classe EpicMonster
export class EpicMonster {
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

    // Appliquer la brûlure si le joueur est à proximité
    if (distance < this.attackRange && distance > 0) {
      player.applyBurn(this);
    } else {
      // Retirer la brûlure si le joueur s'éloigne
      if (player.isBurning && player.burnSource === this) {
        player.removeBurn();
      }
    }
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
