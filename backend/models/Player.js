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
  }

  update(input, deltaTime = 16) {
    const oldX = this.x;
    const oldY = this.y;

    // Déplacement simple
    if (input.right) this.x += this.speed;
    if (input.left) this.x -= this.speed;
    if (input.up) this.y -= this.speed;
    if (input.down) this.y += this.speed;

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
      lastUpdate: this.lastUpdate
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
