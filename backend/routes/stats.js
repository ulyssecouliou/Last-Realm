const express = require('express');
const router = express.Router();
const { UserStats } = require('../models');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/me', async (req, res) => {
  try {
    const userId = req.user.id;

    const [stats] = await UserStats.findOrCreate({
      where: { userId },
      defaults: {
        userId,
        gamesPlayed: 0,
        bestScore: 0,
        totalKills: 0,
        maxKills: 0,
        totalEpicKills: 0,
        maxLevel: 1,
        heroModeWins: 0,
        normalModeWins: 0,
        totalSurvivalSeconds: 0,
        maxSurvivalSeconds: 0
      }
    });

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({ success: false, error: 'Failed to get stats' });
  }
});

router.post('/run', async (req, res) => {
  try {
    const userId = req.user.id;
    const { kills, epicKills = 0, timeSeconds, maxLevel = 1, heroModeWin = false, normalModeWin = false } = req.body;

    if (!Number.isFinite(kills) || kills < 0 || !Number.isFinite(timeSeconds) || timeSeconds < 0) {
      return res.status(400).json({ success: false, error: 'Invalid kills or timeSeconds' });
    }

    if (!Number.isFinite(epicKills) || epicKills < 0 || !Number.isFinite(maxLevel) || maxLevel < 1) {
      return res.status(400).json({ success: false, error: 'Invalid epicKills or maxLevel' });
    }

    const score = Math.floor(kills * timeSeconds);

    const [stats] = await UserStats.findOrCreate({
      where: { userId },
      defaults: {
        userId,
        gamesPlayed: 0,
        bestScore: 0,
        totalKills: 0,
        maxKills: 0,
        totalEpicKills: 0,
        maxLevel: 1,
        heroModeWins: 0,
        normalModeWins: 0,
        totalSurvivalSeconds: 0,
        maxSurvivalSeconds: 0
      }
    });

    const next = {
      gamesPlayed: (stats.gamesPlayed || 0) + 1,
      bestScore: Math.max(stats.bestScore || 0, score),
      totalKills: (stats.totalKills || 0) + kills,
      maxKills: Math.max(stats.maxKills || 0, kills),
      totalEpicKills: (stats.totalEpicKills || 0) + epicKills,
      maxLevel: Math.max(stats.maxLevel || 1, maxLevel),
      heroModeWins: (stats.heroModeWins || 0) + (heroModeWin ? 1 : 0),
      normalModeWins: (stats.normalModeWins || 0) + (normalModeWin ? 1 : 0),
      totalSurvivalSeconds: (stats.totalSurvivalSeconds || 0) + timeSeconds,
      maxSurvivalSeconds: Math.max(stats.maxSurvivalSeconds || 0, timeSeconds)
    };

    await stats.update(next);

    res.json({
      success: true,
      score,
      stats
    });
  } catch (error) {
    console.error('Error submitting run stats:', error);
    res.status(500).json({ success: false, error: 'Failed to submit stats' });
  }
});

module.exports = router;
