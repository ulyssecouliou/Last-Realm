import React, { useState } from 'react';
import './PowerupSelector.css';

const PowerupSelector = ({ onSelect, onCancel }) => {
  const [selectedPowerup, setSelectedPowerup] = useState(null);

  const powerups = [
    {
      id: 'speed_boost',
      name: 'Boost de Vitesse',
      description: '+50% Vitesse de déplacement',
      icon: '⚡',
      color: '#FFD700'
    },
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
              key={powerup.id}
              className={`powerup-card ${selectedPowerup === powerup.id ? 'selected' : ''}`}
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
