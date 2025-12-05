const express = require('express');
const router = express.Router();
const Weapon = require('../models/Weapon');

// Initialiser et récupérer l'arme de base (appelé au début de bataille)
router.post('/initialize', async (req, res) => {
  try {
    console.log('🎮 Initialisation de l\'arme pour une nouvelle bataille...');
    
    // Créer ou mettre à jour l'épée de base avec les valeurs du script
    const [weapon, created] = await Weapon.findOrCreate({
      where: { name: 'Épée de Base' },
      defaults: {
        name: 'Épée de Base',
        damage: 1,
        hitboxWidth: 50,
        hitboxHeight: 160, // Valeur du script
        rotationSpeed: 0.005,
        radius: 120
      }
    });

    if (!created) {
      // Mettre à jour l'épée existante avec les nouvelles valeurs
      await weapon.update({
        hitboxWidth: 50,
        hitboxHeight: 160, // Force la mise à jour
        damage: 1,
        rotationSpeed: 0.005,
        radius: 120
      });
      console.log('⚔️  Épée de base mise à jour pour la bataille avec hitboxHeight: 160');
    } else {
      console.log('✅ Épée de base créée pour la bataille avec hitboxHeight: 160');
    }

    res.json(weapon);
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de l\'arme:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Obtenir l'arme de base (pour consultation)
router.get('/base', async (req, res) => {
  try {
    const baseWeapon = await Weapon.findOne({ where: { name: 'Épée de Base' } });
    
    if (!baseWeapon) {
      return res.status(404).json({ message: 'Arme de base non trouvée' });
    }

    res.json(baseWeapon);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'arme de base:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
