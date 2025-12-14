import React, { useState } from 'react';
import './PowerupSelector.css';

const PowerupSelector = ({ onSelect, onCancel, playerClass }) => {
  const [selectedPowerup, setSelectedPowerup] = useState(null);

  const isTemplar = playerClass === 'templar';
  const isMeleeClass = playerClass === 'knight' || playerClass === 'templar';

  const powerups = isTemplar
    ? [
        {
          id: 'player_speed',
          name: 'Vitesse',
          description: '+50% vitesse de déplacement',
          icon: '⚡',
          color: '#FFD700'
        },
        {
          id: 'damage_bonus',
          name: 'Dégâts',
          description: '+50% dégâts',
          icon: '💥',
          color: '#4ECDC4'
        },
        {
          id: 'spear_count',
          name: 'Nombre de lances',
          description: '+1 lance',
          icon: '🗡️',
          color: '#EAB308'
        },
        {
          id: 'attack_speed',
          name: "Vitesse d'attaque",
          description: '+25% vitesse d\'attaque',
          icon: '✨',
          color: '#A78BFA'
        }
      ]
    : [
        {
          id: 'player_speed',
          name: 'Vitesse du joueur',
          description: '+50% vitesse de déplacement',
          icon: '⚡',
          color: '#FFD700'
        },
        {
          id: 'fireball_size',
          name: isMeleeClass ? 'Arme: taille + hitbox' : 'Boule de feu: taille + hitbox',
          description: isMeleeClass ? "+50% taille + hitbox de l'arme" : '+50% taille + hitbox des boules de feu',
          icon: '🔥',
          color: '#FF6B6B'
        },
        {
          id: 'damage_bonus',
          name: 'Bonus de dégâts',
          description: '+50% dégâts',
          icon: '💥',
          color: '#4ECDC4'
        },
        {
          id: 'multi_shot',
          name: isMeleeClass ? "Vitesse d'attaque" : 'Multi-tir',
          description: isMeleeClass ? "+25% vitesse d'attaque" : '+1 projectile par attaque',
          icon: '✨',
          color: '#A78BFA'
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
