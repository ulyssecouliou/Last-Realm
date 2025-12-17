import React, { useMemo } from 'react';
import './PowerupSelector.css';

const PowerupSelector = ({ onSelect, onCancel, playerClass }) => {

  const isMeleeClass = playerClass === 'knight' || playerClass === 'templar';

  const weaponCountPowerup = useMemo(() => {
    if (playerClass === 'templar') {
      return { id: 'spear_count', name: 'Nombre de lances', description: '+1 lance', icon: '🗡️', color: '#EAB308' };
    }
    if (playerClass === 'mage' || playerClass === 'ranger') {
      return { id: 'multi_shot', name: 'Multi-tir', description: '+1 projectile par attaque', icon: '✨', color: '#A78BFA' };
    }
    return { id: 'sword_radius', name: 'Portée de l\'épée', description: '+20% rayon de rotation', icon: '🌀', color: '#A78BFA' };
  }, [playerClass]);

  const universalPowerups = useMemo(() => ([
    {
      id: 'player_speed',
      name: 'Vitesse',
      description: '+20% vitesse de déplacement',
      icon: '⚡',
      color: '#FFD700'
    },
    {
      id: 'damage_bonus',
      name: 'Dégâts',
      description: '+20% dégâts',
      icon: '💥',
      color: '#4ECDC4'
    },
    {
      id: 'damage_reduction',
      name: 'Armure',
      description: '-15% dégâts subis',
      icon: '🛡️',
      color: '#60A5FA'
    },
    {
      id: 'size_bonus',
      name: 'Grosseur',
      description: '+20% taille (arme ou projectiles)',
      icon: '📏',
      color: '#FF6B6B'
    },
    {
      id: 'attack_speed',
      name: "Vitesse d'attaque",
      description: '+15% vitesse d\'attaque',
      icon: '⏱️',
      color: '#A78BFA'
    },
    weaponCountPowerup,
    {
      id: 'hp_up',
      name: 'Vitalité',
      description: '+20 PV max et +20 PV',
      icon: '❤️',
      color: '#F43F5E'
    }
  ]), [weaponCountPowerup]);

  const choices = useMemo(() => {
    const pool = universalPowerups;
    const used = new Set();
    const picked = [];
    const max = Math.min(3, pool.length);

    for (let guard = 0; guard < 50 && picked.length < max; guard += 1) {
      const idx = Math.floor(Math.random() * pool.length);
      const p = pool[idx];
      if (!p || used.has(p.id)) continue;
      used.add(p.id);
      picked.push(p);
    }

    if (picked.length < max) {
      for (const p of pool) {
        if (!p || used.has(p.id)) continue;
        used.add(p.id);
        picked.push(p);
        if (picked.length >= max) break;
      }
    }

    return picked;
  }, [universalPowerups, isMeleeClass]);

  const handleSelect = (powerupId) => {
    onSelect(powerupId);
  };

  return (
    <div className="powerup-modal-overlay">
      <div className="powerup-modal">
        <h2 className="powerup-title">Choisir un Powerup</h2>
        <p className="powerup-subtitle">Cliquez sur un powerup pour continuer</p>
        
        <div className="powerup-grid">
          {choices.map((powerup) => (
            <div
              key={powerup.id}
              className="powerup-card"
              onClick={() => handleSelect(powerup.id)}
              style={{
                borderColor: powerup.color,
                backgroundColor: `${powerup.color}10`
              }}
            >
              <div className="powerup-icon" style={{ color: powerup.color }}>
                {powerup.icon}
              </div>
              <h3 className="powerup-name">{powerup.name}</h3>
              <p className="powerup-description">{powerup.description}</p>
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
        </div>
      </div>
    </div>
  );
};

export default PowerupSelector;
