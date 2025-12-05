class Player {
  constructor(id, x = 400, y = 300) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.speed = 5;
    this.health = 100;
    this.maxHealth = 100;
    this.level = 1;
    this.xp = 0;
    this.nextLevelXp = 100;
    this.lastUpdate = Date.now();
    // Système de powerups
    this.speedMultiplier = 1;
    this.rotationSpeedMultiplier = 1;
    this.sizeMultiplier = 1;
    this.activePowerups = []; // Liste des powerups actifs
  }

  update(input, deltaTime = 16) {
    const oldX = this.x;
    const oldY = this.y;

    // Déplacement avec multiplicateur de vitesse
    if (input.right) this.x += this.speed * this.speedMultiplier;
    if (input.left) this.x -= this.speed * this.speedMultiplier;
    if (input.up) this.y -= this.speed * this.speedMultiplier;
    if (input.down) this.y += this.speed * this.speedMultiplier;

    // Limites d'écran (supposons 1920x1080 par défaut)
    const maxWidth = input.screenWidth || 1920;
    const maxHeight = input.screenHeight || 1080;
    
    if (this.x < 0) this.x = 0;
    if (this.x > maxWidth) this.x = maxWidth;
    if (this.y < 0) this.y = 0;
    if (this.y > maxHeight) this.y = maxHeight;

    this.lastUpdate = Date.now();

    // Retourner true si la position a changé
    return oldX !== this.x || oldY !== this.y;
  }

  // Appliquer un powerup
  applyPowerup(type) {
    switch(type) {
      case 'speed_boost':
        this.speedMultiplier *= 1.5;
        this.activePowerups.push({ type, appliedAt: Date.now(), multiplier: 1.5 });
        console.log('Powerup vitesse appliqué:', this.speedMultiplier);
        break;
      case 'rotation_speed':
        this.rotationSpeedMultiplier *= 2;
        this.activePowerups.push({ type, appliedAt: Date.now(), multiplier: 2 });
        console.log('Powerup rotation appliqué:', this.rotationSpeedMultiplier);
        break;
      case 'size_boost':
        this.sizeMultiplier *= 1.5;
        this.activePowerups.push({ type, appliedAt: Date.now(), multiplier: 1.5 });
        console.log('Powerup taille appliqué:', this.sizeMultiplier);
        break;
      default:
        console.log('Type de powerup inconnu:', type);
    }
  }

  getState() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      health: this.health,
      maxHealth: this.maxHealth,
      level: this.level,
      xp: this.xp,
      nextLevelXp: this.nextLevelXp,
      lastUpdate: this.lastUpdate,
      speedMultiplier: this.speedMultiplier,
      rotationSpeedMultiplier: this.rotationSpeedMultiplier,
      sizeMultiplier: this.sizeMultiplier,
      activePowerups: this.activePowerups
    };
  }

  takeDamage(damage) {
    this.health = Math.max(0, this.health - damage);
    return this.health <= 0; // Retourne true si le joueur est mort
  }

  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  gainXp(amount) {
    this.xp += amount;
    if (this.xp >= this.nextLevelXp) {
      this.levelUp();
    }
  }

  levelUp() {
    this.level++;
    this.xp -= this.nextLevelXp;
    this.nextLevelXp = Math.floor(this.nextLevelXp * 1.5);
    this.maxHealth += 10;
    this.health = this.maxHealth; // Heal complet au level up
    this.speed += 0.5;
  }
}

module.exports = Player;
