// Classe Fireball (projectile du monstre épique)
export class Fireball {
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
