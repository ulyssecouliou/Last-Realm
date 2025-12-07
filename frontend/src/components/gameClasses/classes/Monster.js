// Classe Monster
export class Monster {
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
