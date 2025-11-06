const express = require('express');
const router = express.Router();
const gameManager = require('../services/GameManager');
// const { authenticateToken } = require('../middleware/auth');

// TODO: Réactiver l'auth plus tard
// router.use(authenticateToken);

// Initialiser ou récupérer l'état du joueur
router.get('/player', async (req, res) => {
  try {
    // Utiliser un ID temporaire pour les tests
    const userId = 'test-user-123';
    const playerState = gameManager.getPlayerState(userId);
    
    res.json({
      success: true,
      player: playerState
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du joueur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Mettre à jour la position du joueur
router.post('/player/move', async (req, res) => {
  try {
    // Utiliser un ID temporaire pour les tests
    const userId = 'test-user-123';
    const { input } = req.body;

    // Valider l'input
    if (!input || typeof input !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Input invalide'
      });
    }

    const result = gameManager.updatePlayer(userId, input);
    
    res.json({
      success: true,
      moved: result.moved,
      player: result.playerState
    });
  } catch (error) {
    console.error('Erreur lors du déplacement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Obtenir les statistiques du jeu (pour debug/admin)
router.get('/stats', async (req, res) => {
  try {
    const stats = gameManager.getGameStats();
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Action de dégâts (pour plus tard)
router.post('/player/damage', async (req, res) => {
  try {
    const userId = req.user.id;
    const { damage } = req.body;

    if (!damage || damage <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Dégâts invalides'
      });
    }

    const player = gameManager.getOrCreatePlayer(userId);
    const isDead = player.takeDamage(damage);
    
    res.json({
      success: true,
      player: player.getState(),
      isDead
    });
  } catch (error) {
    console.error('Erreur lors des dégâts:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Gain d'XP (pour plus tard)
router.post('/player/xp', async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Montant XP invalide'
      });
    }

    const player = gameManager.getOrCreatePlayer(userId);
    player.gainXp(amount);
    
    res.json({
      success: true,
      player: player.getState()
    });
  } catch (error) {
    console.error('Erreur lors du gain XP:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;
