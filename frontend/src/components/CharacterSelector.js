import React, { useState } from 'react';
import './CharacterSelector.css';

const CharacterSelector = ({ onSelect }) => {
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  const characters = [
    {
      id: 'warrior',
      name: 'Guerrier',
      image: '/—Pngtree—knight avatar soldier with shield_23256476.png',
      weapon: '/epee.png',
      description: 'Fort et résistant. Utilise une épée qui tourne autour de lui.',
      stats: 'Santé: ⭐⭐⭐ | Dégâts: ⭐⭐⭐'
    },
    {
      id: 'wizard',
      name: 'Magicien',
      image: '/magicien.png',
      weapon: '/projectile.png',
      description: 'Lance des projectiles magiques. Rapide et puissant à distance.',
      stats: 'Santé: ⭐⭐ | Dégâts: ⭐⭐⭐⭐'
    },
    {
      id: 'rogue',
      name: 'Rodeur',
      image: '/rodeur.png',
      weapon: '/epee.png',
      description: 'Très rapide et agile. Léger mais mortel.',
      stats: 'Santé: ⭐ | Dégâts: ⭐⭐⭐'
    },
    {
      id: 'fallen_knight',
      name: 'Templier Déchu',
      image: '/templier_dechu.png',
      weapon: '/epee.png',
      description: 'Équilibré. Ancien chevalier devenu sombre.',
      stats: 'Santé: ⭐⭐⭐ | Dégâts: ⭐⭐⭐'
    }
  ];

  const handleSelect = (character) => {
    setSelectedCharacter(character.id);
    setTimeout(() => {
      onSelect(character);
    }, 300);
  };

  return (
    <div className="character-selector-overlay">
      <div className="character-selector-modal">
        <h1 className="selector-title">Choisissez votre personnage</h1>
        <p className="selector-subtitle">Choisissez votre héros pour commencer l'aventure</p>
        
        <div className="characters-grid">
          {characters.map((character) => (
            <div
              key={character.id}
              className={`character-card ${selectedCharacter === character.id ? 'selected' : ''}`}
              onClick={() => handleSelect(character)}
            >
              <div className="character-image-container">
                <img src={character.image} alt={character.name} className="character-image" />
              </div>
              
              <div className="character-info">
                <h2 className="character-name">{character.name}</h2>
                <p className="character-description">{character.description}</p>
                <div className="character-stats">{character.stats}</div>
              </div>

              {selectedCharacter === character.id && (
                <div className="selected-badge">✓ Sélectionné</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CharacterSelector;
