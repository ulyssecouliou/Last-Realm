import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Wiki.css';

const Wiki = () => {
  const navigate = useNavigate();

  const sections = [
    {
      id: 'personnages',
      title: 'Personnages',
      items: [
        {
          title: 'Chevalier',
          image: '/—Pngtree—knight avatar soldier with shield_23256476.png',
          description: "Une épée tourne autour de vous et inflige des dégâts en continu. Idéal pour tenir la distance et nettoyer les vagues."
        },
        {
          title: 'Magicien',
          image: '/magicien.png',
          description: "Tire des boules de feu vers l'ennemi le plus proche. Les powerups peuvent renforcer les projectiles (taille, dégâts, multi-tir)."
        },
        {
          title: 'Rôdeur',
          image: '/rodeur.png',
          description: "Tire des flèches perforantes : elles traversent plusieurs ennemis et disparaissent après une distance maximale."
        },
        {
          title: 'Templier déchu',
          image: '/templier_dechu.png',
          description: "Combat à la lance : attaque en avant/arrière, orientée vers l'ennemi le plus proche. Les dégâts se font au bout de la pointe."
        }
      ]
    },
    {
      id: 'armes',
      title: 'Armes',
      items: [
        {
          title: 'Épée',
          image: '/epee.png',
          description: "Zone de frappe au corps-à-corps. Tourne autour du joueur et touche tout ce qui traverse sa hitbox."
        },
        {
          title: 'Boule de feu',
          image: '/projectile.png',
          description: "Projectile à distance. Tire automatiquement vers l'ennemi le plus proche quand il est à portée."
        },
        {
          title: 'Flèche perforante',
          image: '/fleche.png',
          description: "Projectile perforant : peut toucher plusieurs ennemis avant de disparaître après une distance maximale."
        },
        {
          title: 'Lance',
          image: '/lance.png',
          description: "Attaque orientée vers la cible la plus proche. Mouvement avant/arrière, collision sur la pointe."
        }
      ]
    },
    {
      id: 'powerups',
      title: 'Powerups',
      items: [
        {
          title: 'Vitesse',
          image: '/projectile.png',
          description: "Augmente la vitesse de déplacement. Parfait pour esquiver et repositionner."
        },
        {
          title: 'Dégâts',
          image: '/projectile.png',
          description: "Augmente vos dégâts. Rend chaque coup plus impactant."
        },
        {
          title: 'Plusieurs épées',
          image: '/epee.png',
          description: "Chevalier uniquement : invoque plusieurs épées autour de vous pour toucher davantage d'ennemis en même temps."
        },
        {
          title: 'Multi-tir',
          image: '/projectile.png',
          description: "Ajoute des projectiles par attaque (classes à distance). Les tirs partent en éventail."
        },
        {
          title: "Vitesse d'attaque",
          image: '/projectile.png',
          description: "Accélère le rythme d'attaque (classes corps-à-corps)."
        },
        {
          title: 'Nombre de lances',
          image: '/lance.png',
          description: "Ajoute une lance supplémentaire (Templier déchu). Plusieurs lances frappent simultanément."
        }
      ]
    },
    {
      id: 'monstres',
      title: 'Monstres',
      items: [
        {
          title: 'Monstre',
          image: '/monster.png.png',
          description: "Ennemi de base : poursuit le joueur et inflige des dégâts au contact."
        },
        {
          title: 'Monstre épique',
          image: '/monstreEpique.png',
          description: "Plus de vie, plus dangereux, capable de tirer des projectiles. Priorité absolue quand il apparaît."
        }
      ]
    }
  ];

  return (
    <div className="wiki-page">
      <header className="wiki-header">
        <div className="wiki-header-inner">
          <div className="wiki-title">
            <h1>📖 Wiki - Last Realm</h1>
            <p>Armes, personnages, powerups et monstres : tout est ici.</p>
          </div>
          <div className="wiki-header-actions">
            <button type="button" className="wiki-btn" onClick={() => navigate('/dashboard')}>Retour</button>
          </div>
        </div>
      </header>

      <main className="wiki-content">
        <aside className="wiki-sidebar">
          <div className="wiki-sidebar-box">
            <h2>Navigation</h2>
            {sections.map((s) => (
              <a key={s.id} className="wiki-nav-link" href={`#${s.id}`}>{s.title}</a>
            ))}
          </div>
        </aside>

        <div className="wiki-main">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="wiki-section">
              <div className="wiki-section-header">
                <h2>{section.title}</h2>
                <span className="wiki-section-sub">{section.items.length} entrées</span>
              </div>

              <div className="wiki-grid">
                {section.items.map((item) => (
                  <div key={`${section.id}-${item.title}`} className="wiki-card">
                    <div className="wiki-card-media">
                      <img className="wiki-card-img" src={item.image} alt={item.title} />
                    </div>
                    <div className="wiki-card-body">
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Wiki;
