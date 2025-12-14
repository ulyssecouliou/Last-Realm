const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserStats = sequelize.define('UserStats', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true
  },
  gamesPlayed: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  bestScore: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  totalKills: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  maxKills: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  totalEpicKills: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  maxLevel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  totalSurvivalSeconds: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  maxSurvivalSeconds: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'user_stats',
  timestamps: true
});

module.exports = UserStats;
