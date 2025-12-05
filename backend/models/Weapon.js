const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Weapon = sequelize.define('Weapon', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  damage: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  hitboxWidth: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 50  // x2 de la taille originale (25 * 2)
  },
  hitboxHeight: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 160  // x2 de la taille originale (80 * 2)
  },
  rotationSpeed: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.005
  },
  radius: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 120
  }
}, {
  tableName: 'weapons',
  timestamps: true
});

module.exports = Weapon;
