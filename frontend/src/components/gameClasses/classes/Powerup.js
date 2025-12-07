// Classe Powerup
export class Powerup {
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
