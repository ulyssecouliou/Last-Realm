const Player = require('../models/Player');

class GameManager {
  constructor() {
    this.players = new Map(); // Map<userId, Player>
    this.gameSessions = new Map(); // Map<userId, gameSession>
  }

  // Créer ou récupérer un joueur
  getOrCreatePlayer(userId) {
    if (!this.players.has(userId)) {
      const player = new Player(userId);
      this.players.set(userId, player);
      
      // Créer une session de jeu
      this.gameSessions.set(userId, {
        playerId: userId,
        startTime: Date.now(),
        lastActivity: Date.now(),
        isActive: true
      });
    }
    return this.players.get(userId);
  }

  // Mettre à jour la position du joueur
  updatePlayer(userId, input) {
    const player = this.getOrCreatePlayer(userId);
    const moved = player.update(input);
    
    // Mettre à jour l'activité de la session
    if (this.gameSessions.has(userId)) {
      this.gameSessions.get(userId).lastActivity = Date.now();
    }

    return {
      moved,
      playerState: player.getState()
    };
  }

  // Obtenir l'état du joueur
  getPlayerState(userId) {
    const player = this.getOrCreatePlayer(userId);
    return player.getState();
  }

  // Nettoyer les sessions inactives (plus de 5 minutes)
  cleanupInactiveSessions() {
    const now = Date.now();
    const timeout = 5 * 60 * 1000; // 5 minutes

    for (const [userId, session] of this.gameSessions.entries()) {
      if (now - session.lastActivity > timeout) {
        this.players.delete(userId);
        this.gameSessions.delete(userId);
        console.log(`Session nettoyée pour l'utilisateur ${userId}`);
      }
    }
  }

  // Obtenir les statistiques du jeu
  getGameStats() {
    return {
      activePlayers: this.players.size,
      activeSessions: this.gameSessions.size,
      players: Array.from(this.players.values()).map(p => p.getState())
    };
  }
}

// Instance singleton
const gameManager = new GameManager();

// Nettoyage automatique toutes les minutes
setInterval(() => {
  gameManager.cleanupInactiveSessions();
}, 60000);

module.exports = gameManager;
