const { sequelize } = require('../config/database');
const User = require('./User');

// Define model associations here
// Example:
// User.hasMany(Post);
// Post.belongsTo(User);

// Export all models
module.exports = {
  sequelize,
  User
};
