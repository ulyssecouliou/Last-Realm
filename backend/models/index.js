const { sequelize } = require('../config/database');
const User = require('./User');
const Weapon = require('./Weapon');

// Export all models
module.exports = {
  sequelize,
  User,
  Weapon
};
