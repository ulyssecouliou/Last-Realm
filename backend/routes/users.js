const express = require('express');
const router = express.Router();
const { User } = require('../models');

// GET /api/users - Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] } // Don't return passwords
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/users/:id - Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST /api/users - Create new user
router.post('/', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;
    
    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: 'Username, email, and password are required' 
      });
    }
    
    const user = await User.create({
      username,
      email,
      password, // In production, hash this password first
      firstName,
      lastName
    });
    
    // Don't return the password
    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Handle unique constraint violations
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        error: 'Username or email already exists' 
      });
    }
    
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT /api/users/:id - Update user
router.put('/:id', async (req, res) => {
  try {
    const { username, email, firstName, lastName } = req.body;
    
    const [updatedRowsCount] = await User.update(
      { username, email, firstName, lastName },
      { where: { id: req.params.id } }
    );
    
    if (updatedRowsCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const updatedUser = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        error: 'Username or email already exists' 
      });
    }
    
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', async (req, res) => {
  try {
    const deletedRowsCount = await User.destroy({
      where: { id: req.params.id }
    });
    
    if (deletedRowsCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
