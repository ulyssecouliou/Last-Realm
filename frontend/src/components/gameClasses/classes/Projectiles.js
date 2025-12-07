// Classe Arrow (flèches du rodeur)
export class Arrow {
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

// Classe Projectile (projectiles du magicien)
export class Projectile {
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
