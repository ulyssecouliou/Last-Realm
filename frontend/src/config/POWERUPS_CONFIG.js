/**
 * POWERUPS_CONFIG.js
 * Configuration centralisée du système de powerups
 * 
 * USAGE:
 * import POWERUPS_CONFIG from './POWERUPS_CONFIG'
 * puis utiliser les constantes dans votre code
 */

// ============================================
// CONFIGURATION DES POWERUPS
// ============================================

export const POWERUPS_CONFIG = {
  // Génération
  SPAWN_INTERVAL: 15000, // en millisecondes (15 secondes)
  
  // Collision
  COLLISION_DISTANCE: 40, // pixels
  
  // Vitesses
  BASE_SPEED: 0.4, // vitesse du joueur
  ROTATION_SPEED: 0.005, // vitesse de rotation de l'épée
  
  // Types et Effects
  TYPES: {
    SPEED_BOOST: {
      id: 'speed_boost',
      name: 'Boost de Vitesse',
      description: '+50% Vitesse de déplacement',
      icon: '⚡',
      color: 0xFFD700, // Or
      htmlColor: '#FFD700',
      multiplier: 1.5,
      affectsProperty: 'speedMultiplier'
    },
    ROTATION_SPEED: {
      id: 'rotation_speed',
      name: 'Épée Rapide',
      description: '+100% Vitesse de rotation',
      icon: '🌀',
      color: 0xFF6B6B, // Rouge
      htmlColor: '#FF6B6B',
      multiplier: 2,
      affectsProperty: 'rotationSpeedMultiplier'
    },
    SIZE_BOOST: {
      id: 'size_boost',
      name: 'Géant',
      description: '+50% Taille du personnage',
      icon: '📏',
      color: 0x4ECDC4, // Turquoise
      htmlColor: '#4ECDC4',
      multiplier: 1.5,
      affectsProperty: 'sizeMultiplier'
    }
  },
  
  // Sprites
  SPRITE: {
    SIZE: 50, // Taille du carré powerup (50x50)
    HALF_SIZE: 25, // Moitié de la taille
    BORDER_WIDTH: 3,
    BORDER_COLOR: 0xFFFFFF,
    BORDER_ALPHA: 0.8,
    ROTATION_SPEED: 0.05 // Animation de rotation
  },
  
  // Interface
  UI: {
    MODAL_PADDING: 40,
    CARD_PADDING: 25,
    ICON_SIZE: 48,
    TITLE_SIZE: 32,
    NAME_SIZE: 18,
    DESCRIPTION_SIZE: 13,
    ANIMATION_DURATION: 0.3,
    HOVER_LIFT: 5 // pixels
  },
  
  // Couleurs
  COLORS: {
    PRIMARY: '#d4af37',
    PRIMARY_DARK: '#1a1a1a',
    BORDER: '#ddd',
    TEXT: '#666',
    WHITE: '#fff',
    BLACK: '#000'
  }
};

/**
 * Helpers pour accéder aux configurations
 */
export const getPowerupConfig = (type) => {
  const typeUpperCase = type.toUpperCase().replace(/-/g, '_');
  return POWERUPS_CONFIG.TYPES[typeUpperCase];
};

export const getAllPowerupTypes = () => {
  return Object.values(POWERUPS_CONFIG.TYPES).map(t => t.id);
};

export const getPowerupsByProperty = (property) => {
  return Object.values(POWERUPS_CONFIG.TYPES).filter(
    t => t.affectsProperty === property
  );
};

/**
 * Validation
 */
export const isValidPowerupType = (type) => {
  return getAllPowerupTypes().includes(type);
};

/**
 * Exemple d'utilisation:
 * 
 * import POWERUPS_CONFIG, { getPowerupConfig, getAllPowerupTypes } from './POWERUPS_CONFIG'
 * 
 * // Obtenir la config d'un type spécifique
 * const speedBoostConfig = getPowerupConfig('speed_boost');
 * console.log(speedBoostConfig.name); // "Boost de Vitesse"
 * console.log(speedBoostConfig.multiplier); // 1.5
 * 
 * // Obtenir tous les types
 * getAllPowerupTypes().forEach(type => {
 *   console.log(type); // speed_boost, rotation_speed, size_boost
 * });
 * 
 * // Valider un type
 * isValidPowerupType('speed_boost'); // true
 * isValidPowerupType('invalid'); // false
 * 
 * // Accéder aux paramètres globaux
 * POWERUPS_CONFIG.SPAWN_INTERVAL // 15000
 * POWERUPS_CONFIG.COLLISION_DISTANCE // 40
 * POWERUPS_CONFIG.SPRITE.SIZE // 50
 * POWERUPS_CONFIG.UI.MODAL_PADDING // 40
 */

export default POWERUPS_CONFIG;
