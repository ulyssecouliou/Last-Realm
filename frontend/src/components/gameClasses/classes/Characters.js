import { Player } from './Player.js';
import { Projectile, Arrow } from './Projectiles.js';

// Classe Warrior (Guerrier) - pour cohérence
export class Warrior extends Player {
  constructor(x, y) {
    super(x, y);
    this.characterType = 'warrior';
  }
}

// Classe Wizard (Magicien)
export class Wizard extends Player {
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
export class Rogue extends Player {
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
export class FallenKnight extends Player {
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
