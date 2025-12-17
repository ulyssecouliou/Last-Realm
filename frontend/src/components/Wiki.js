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
          title: 'Système de choix (x3)',
          image: '/projectile.png',
          description: "À chaque amélioration, 3 powerups aléatoires sont proposés. Il existe des powerups universels (communs) et des powerups uniques à votre classe."
        },
        {
          title: 'Vitesse',
          image: '/projectile.png',
          description: "Universel : augmente la vitesse de déplacement."
        },
        {
          title: 'Dégâts',
          image: '/projectile.png',
          description: "Universel : augmente les dégâts."
        },
        {
          title: 'Vitalité',
          image: '/projectile.png',
          description: "Universel : +PV max et soigne immédiatement."
        },
        {
          title: 'Armure',
          image: '/projectile.png',
          description: "Universel : réduit les dégâts subis."
        },
        {
          title: "Vitesse d'attaque",
          image: '/projectile.png',
          description: "Universel : augmente la vitesse d'attaque (affecte le rythme d'attaque / rotation)."
        },
        {
          title: 'Chevalier — Épée: dégâts',
          image: '/epee.png',
          description: "Unique : +dégâts de l'épée tournoyante."
        },
        {
          title: 'Chevalier — Épée: taille',
          image: '/epee.png',
          description: "Unique : augmente la hitbox ET le sprite de l'épée."
        },
        {
          title: 'Chevalier — Épée: portée',
          image: '/epee.png',
          description: "Unique : augmente le rayon de rotation de l'épée (porte plus loin autour du joueur)."
        },
        {
          title: 'Chevalier — Épée: rotation',
          image: '/epee.png',
          description: "Unique : augmente la vitesse de rotation de l'épée."
        },
        {
          title: 'Chevalier — Garde',
          image: '/projectile.png',
          description: "Unique : réduit les dégâts subis."
        },
        {
          title: 'Chevalier — Endurance',
          image: '/projectile.png',
          description: "Unique : bonus de vitesse pour mieux se repositionner."
        },
        {
          title: 'Mage — Boule de feu: taille',
          image: '/projectile.png',
          description: "Unique : augmente la taille/hitbox des projectiles."
        },
        {
          title: 'Mage — Multi-tir',
          image: '/projectile.png',
          description: "Unique : +1 projectile par attaque."
        },
        {
          title: 'Mage — Arcane',
          image: '/projectile.png',
          description: "Unique : augmente les dégâts à distance."
        },
        {
          title: 'Mage — Hâte',
          image: '/projectile.png',
          description: "Unique : augmente la vitesse d'attaque."
        },
        {
          title: 'Mage — Focus',
          image: '/projectile.png',
          description: "Unique : augmente la vitesse des projectiles."
        },
        {
          title: 'Mage — Barrière',
          image: '/projectile.png',
          description: "Unique : réduit les dégâts subis."
        },
        {
          title: 'Rôdeur — Multi-tir',
          image: '/fleche.png',
          description: "Unique : +1 projectile par attaque."
        },
        {
          title: 'Rôdeur — Flèches: dégâts',
          image: '/fleche.png',
          description: "Unique : augmente les dégâts des flèches."
        },
        {
          title: 'Rôdeur — Flèches: vitesse',
          image: '/fleche.png',
          description: "Unique : augmente la vitesse des flèches."
        },
        {
          title: 'Rôdeur — Flèches: portée',
          image: '/fleche.png',
          description: "Unique : augmente la portée (distance max) des flèches."
        },
        {
          title: 'Rôdeur — Agilité',
          image: '/projectile.png',
          description: "Unique : bonus de vitesse."
        },
        {
          title: 'Rôdeur — Cuirasse',
          image: '/projectile.png',
          description: "Unique : réduit les dégâts subis."
        },
        {
          title: 'Templier — Nombre de lances',
          image: '/lance.png',
          description: "Unique : +1 lance (jusqu'à une limite)."
        },
        {
          title: 'Templier — Lance: dégâts',
          image: '/lance.png',
          description: "Unique : augmente les dégâts des lances."
        },
        {
          title: 'Templier — Lance: hitbox',
          image: '/lance.png',
          description: "Unique : augmente la taille de la pointe (hitbox)."
        },
        {
          title: 'Templier — Lance: portée',
          image: '/lance.png',
          description: "Unique : augmente la portée des lances."
        },
        {
          title: 'Templier — Serment',
          image: '/projectile.png',
          description: "Unique : réduit les dégâts subis."
        },
        {
          title: 'Templier — Ferveur',
          image: '/projectile.png',
          description: "Unique : augmente la vitesse d'attaque."
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
        },
        {
          title: 'Boss (3 minutes)',
          image: '/BOSS.png',
          description: "Apparaît à 3 minutes en Mode Normal. Très résistant et lance des lasers : esquivez l'avertissement puis le rayon. Le Mode Normal est gagné quand vous le tuez."
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
