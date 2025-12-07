import React, { useState } from 'react';
import './PowerupSelector.css';

const PowerupSelector = ({ onSelect, onCancel, characterType = 'warrior' }) => {
  const [selectedPowerup, setSelectedPowerup] = useState(null);

  // Powerups différents selon le personnage
  const getPowerups = () => {
    const baseSpeedBoost = {
      id: 'speed_boost',
      name: 'Boost de Vitesse',
      description: '+50% Vitesse de déplacement',
      icon: '⚡',
      color: '#FFD700'
    };

    if (characterType === 'wizard') {
      return [
        baseSpeedBoost,
        {
          id: 'fire_rate',
          name: 'Tir Rapide',
          description: '-30% Cooldown entre les projectiles',
          icon: '🔥',
          color: '#FF6B6B'
        },
        {
          id: 'multi_projectiles',
          name: 'Multi-Projectiles',
          description: '+1 Projectile lancé simultanément',
          icon: '💥',
          color: '#4ECDC4'
        }
      ];
    } else if (characterType === 'rogue') {
      return [
        baseSpeedBoost,
        {
          id: 'arrow_speed',
          name: 'Flèches Rapides',
          description: '-25% Cooldown entre les flèches',
          icon: '💨',
          color: '#FF6B6B'
        },
        {
          id: 'multi_arrows',
          name: 'Multi-Flèches',
          description: '+1 Flèche lancée simultanément',
          icon: '🎯',
          color: '#4ECDC4'
        }
      ];
    } else if (characterType === 'fallen_knight') {
      return [
        baseSpeedBoost,
        {
          id: 'spear_speed',
          name: 'Lance Rapide',
          description: '-30% Cooldown entre les attaques',
          icon: '⚔️',
          color: '#FF6B6B'
        },
        {
          id: 'spear_range',
          name: 'Portée Augmentée',
          description: '+50% Portée de la lance',
          icon: '📏',
          color: '#4ECDC4'
        }
      ];
    } else {
      // Powerups pour les autres classes (guerrier, templier déchu)
      return [
        baseSpeedBoost,
        {
          id: 'rotation_speed',
          name: 'Épée Rapide',
          description: '+100% Vitesse de rotation',
          icon: '🌀',
          color: '#FF6B6B'
        },
        {
          id: 'size_boost',
          name: 'Géant',
          description: '+50% Taille du personnage',
          icon: '📏',
          color: '#4ECDC4'
        }
      ];
    }
  };

  const powerups = getPowerups();

  const handleSelect = (powerupId) => {
    setSelectedPowerup(powerupId);
  };

  const handleConfirm = () => {
    if (selectedPowerup) {
      onSelect(selectedPowerup);
    }
  };

  return (
    <div className="powerup-modal-overlay">
      <div className="powerup-modal">
        <h2 className="powerup-title">Choisir un Powerup</h2>
        <p className="powerup-subtitle">Sélectionnez un seul powerup pour continuer</p>
        
        <div className="powerup-grid">
          {powerups.map((powerup) => (
            <div
              key={powerup.id}              className={`powerup-card ${selectedPowerup === powerup.id ? 'selected' : ''}`}
              onClick={() => handleSelect(powerup.id)}
              style={{
                borderColor: selectedPowerup === powerup.id ? powerup.color : '#ddd',
                backgroundColor: selectedPowerup === powerup.id ? `${powerup.color}15` : '#fff'
              }}
            >
              <div className="powerup-icon" style={{ color: powerup.color }}>
                {powerup.icon}
              </div>
              <h3 className="powerup-name">{powerup.name}</h3>
              <p className="powerup-description">{powerup.description}</p>
              {selectedPowerup === powerup.id && (
                <div className="powerup-checkmark">✓</div>
              )}
            </div>
          ))}
        </div>

        <div className="powerup-buttons">
          <button 
            className="powerup-btn powerup-btn-cancel"
            onClick={onCancel}
          >
            Annuler
          </button>
          <button 
            className="powerup-btn powerup-btn-confirm"
            onClick={handleConfirm}
            disabled={!selectedPowerup}
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
};

export default PowerupSelector;
