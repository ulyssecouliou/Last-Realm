// Classe Player avec système de vie
export class Player {
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
    if (keys.down && this.y < mapHeight - 50) this.y += this.speed * this.speedMultiplier;
    
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
