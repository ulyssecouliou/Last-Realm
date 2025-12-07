// Classe Sword (épée du guerrier)
export class Sword {
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

// Classe Spear (lance du templier déchu)
export class Spear {
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
