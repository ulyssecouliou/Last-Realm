const Weapon = require('../models/Weapon');

async function initializeWeapons() {
  try {
    // Créer ou mettre à jour l'épée de base
    const [weapon, created] = await Weapon.findOrCreate({
      where: { name: 'Épée de Base' },
      defaults: {
        name: 'Épée de Base',
        damage: 1,
        hitboxWidth: 50,
        hitboxHeight: 160, // Valeur mise à jour
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
      console.log('⚔️  Épée de base mise à jour avec hitboxHeight: 1000');
    } else {
      console.log('✅ Épée de base créée avec hitboxHeight: 1000');
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de l\'épée:', error);
  }
}

module.exports = initializeWeapons;
