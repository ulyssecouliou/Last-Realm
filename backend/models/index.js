const { sequelize } = require('../config/database');
const User = require('./User');
const UserStats = require('./UserStats');

User.hasOne(UserStats, { foreignKey: 'userId', as: 'stats' });
UserStats.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Export all models
module.exports = {
  sequelize,
  User,
  UserStats
};
