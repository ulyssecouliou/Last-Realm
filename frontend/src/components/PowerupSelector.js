import React, { useMemo } from 'react';
import './PowerupSelector.css';

const PowerupSelector = ({ onSelect, onCancel, playerClass }) => {

  const isMeleeClass = playerClass === 'knight' || playerClass === 'templar';

  const classPowerups = useMemo(() => {
    if (playerClass === 'knight') {
      return [
        { id: 'sword_size', name: 'Épée plus grande', description: '+20% taille de l\'épée', icon: '📏', color: '#FF6B6B' },
        { id: 'sword_spin', name: 'Épée plus rapide', description: '+30% vitesse de rotation', icon: '🌀', color: '#A78BFA' },
        { id: 'sword_count', name: 'Double épée', description: '+1 épée', icon: '⚔️', color: '#EAB308' }
      ];
    }
    if (playerClass === 'templar') {
      return [
        { id: 'spear_count', name: 'Nombre de lances', description: '+1 lance', icon: '🗡️', color: '#EAB308' },
        { id: 'spear_size', name: 'Lance plus grande', description: '+20% taille de la lance', icon: '📏', color: '#FF6B6B' },
        { id: 'spear_speed', name: 'Lance plus rapide', description: '+30% vitesse d\'attaque', icon: '⏱️', color: '#A78BFA' }
      ];
    }
    if (playerClass === 'ranger') {
      return [
        { id: 'multi_shot', name: 'Multi-tir', description: '+1 flèche par attaque', icon: '🏹', color: '#EAB308' },
        { id: 'attack_speed', name: "Vitesse d'attaque", description: '+30% tirs par seconde', icon: '⏱️', color: '#A78BFA' },
        { id: 'size_bonus', name: 'Projectiles plus grands', description: '+20% taille', icon: '📏', color: '#FF6B6B' }
      ];
    }
    // mage / arcanist
    return [
      { id: 'multi_shot', name: 'Multi-tir', description: '+1 boule par attaque', icon: '✨', color: '#EAB308' },
      { id: 'attack_speed', name: "Vitesse d'attaque", description: '+30% tirs par seconde', icon: '⏱️', color: '#A78BFA' },
      { id: 'explosion_size', name: 'Explosion', description: '+80% taille explosion', icon: '💥', color: '#FF6B6B' }
    ];
  }, [playerClass]);

  const universalPowerups = useMemo(() => ([
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
      description: '+30% dégâts',
      icon: '💥',
      color: '#4ECDC4'
    },
    {
      id: 'damage_reduction',
      name: 'Armure',
      description: '-20% dégâts subis',
      icon: '🛡️',
      color: '#60A5FA'
    },
    {
      id: 'hp_up',
      name: 'Soin',
      description: '+50 PV max et +30 PV',
      icon: '❤️',
      color: '#F43F5E'
    }
  ]), []);

  const pool = useMemo(() => {
    return [...universalPowerups, ...classPowerups];
  }, [universalPowerups, classPowerups]);

  const choices = useMemo(() => {
    const poolLocal = pool;
    const used = new Set();
    const picked = [];
    const max = Math.min(3, poolLocal.length);

    for (let guard = 0; guard < 50 && picked.length < max; guard += 1) {
      const idx = Math.floor(Math.random() * poolLocal.length);
      const p = poolLocal[idx];
      if (!p || used.has(p.id)) continue;
      used.add(p.id);
      picked.push(p);
    }

    if (picked.length < max) {
      for (const p of poolLocal) {
        if (!p || used.has(p.id)) continue;
        used.add(p.id);
        picked.push(p);
        if (picked.length >= max) break;
      }
    }

    return picked;
  }, [pool, isMeleeClass]);

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
