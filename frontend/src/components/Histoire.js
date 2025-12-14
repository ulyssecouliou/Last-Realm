import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Histoire.css';

const Histoire = () => {
  const navigate = useNavigate();

  const chapters = [
    {
      id: 'prologue',
      title: 'Prologue — Les quatre astres',
      paragraphs: [
        "On dit qu'Eldara fut bâti pour durer mille printemps. Quatre astres veillaient au-dessus des remparts, et chaque nuit, leurs reflets bleus et or dessinaient une couronne de lumière sur les toits de pierre blanche.",
        "Dans les grandes halles, les forges ne s'éteignaient jamais. Les marteaux battaient le rythme du royaume et l'acier chantait, trempé dans l'eau des sources sacrées. Sur les routes, des lanternes gravées de runes guidaient les voyageurs, et nul ne craignait la nuit."
      ]
    },
    {
      id: 'brume',
      title: "Chapitre I — La Brume d'Obsidienne",
      paragraphs: [
        "La Brume ne vint pas comme un orage. Elle arriva comme un soupir. Un matin, les champs furent couverts d'une rosée noire, et les oiseaux cessèrent de chanter. Puis les souvenirs commencèrent à se fendre, comme de vieux miroirs.",
        "Les villageois oublièrent des noms, puis des visages. Les serments devinrent lourds à prononcer. Les runes s'effacèrent des portes. Et dans les bois, des silhouettes se mirent à marcher au rythme d'un vent qui n'existait pas.",
        "Les sages appelèrent cela la Brume d'Obsidienne : un voile froid qui ronge la mémoire, corrompt les bêtes et fracture les serments. Là où elle s'accrochait, la peur se nourrissait d'elle-même."
      ],
      quote: "\"La Brume ne tue pas. Elle remplace.\" — Extrait du Codex des Veilleurs"
    },
    {
      id: 'ordres',
      title: 'Chapitre II — Les ordres brisés',
      paragraphs: [
        "Face à l'ombre, Eldara se tourna vers ses trois grands ordres : les Templiers, gardiens des serments; les Arcanistes, gardiens du feu; et les Rôdeurs, gardiens des chemins.",
        "Les Templiers furent les premiers à tomber. Ils jurèrent de ne jamais reculer. Alors ils ne reculèrent pas… même quand la Brume s'insinua sous leurs armures, jusque dans leurs prières. Les plus forts devinrent des statues de fer, vidées de leur chant intérieur.",
        "Les Arcanistes, eux, apprirent la vérité la plus cruelle : la Brume se nourrit des incantations mal prononcées, des pensées inachevées. Ils se retranchèrent dans les ruines, préférant le silence à la folie.",
        "Les Rôdeurs prirent la route des forêts mortes. Ils suivirent les traces des monstres comme on suit une malédiction, apprenant à vivre sans feu, sans bannière, avec seulement le souffle et la vigilance."
      ]
    },
    {
      id: 'guerres',
      title: 'Chapitre III — Les Guerres de Cendre',
      paragraphs: [
        "Vint un temps où l'on ne compta plus les jours mais les attaques. Les villages dressèrent des palissades, puis des murs. Les murs tombèrent, puis les palissades.",
        "Les batailles furent d'abord des marches. Puis elles devinrent des sièges. Enfin, elles ne furent plus que des survies : tenir une minute de plus, reculer de deux pas, reprendre un pas, respirer.",
        "On nomma cette période les Guerres de Cendre, car tout brûlait : les greniers, les bibliothèques, les serments. Et pourtant, au milieu de la poussière, une idée resta vivante : la Brume pouvait être repoussée."
      ],
      quote: "\"Quand tout s'effondre, il reste la discipline : un pas, un souffle, un coup.\" — Serment des survivants"
    },
    {
      id: 'reliques',
      title: 'Chapitre IV — Les Reliques et les armes',
      paragraphs: [
        "Au plus noir de l'époque, des artisans jurèrent de fabriquer des armes qui ne se contenteraient pas de trancher la chair, mais aussi la peur. Chaque arme devint une relique, et chaque relique, une histoire.",
        "L'épée du Chevalier fut taillée pour danser autour de son porteur, comme un rempart vivant. Les boules de feu des Arcanistes furent rendues plus stables, afin que la pensée n'ait pas à vaciller au moment du tir.",
        "Les flèches des Rôdeurs furent forgées pour traverser l'ennemi sans s'arrêter, car les vagues étaient trop denses pour les gestes timides. Et la lance des Templiers déchus, elle, fut conçue pour frapper la vérité : au bout de la pointe, là où l'intention se matérialise."
      ]
    },
    {
      id: 'heros',
      title: 'Chapitre V — Les héros sans noms',
      paragraphs: [
        "La Brume prenait les noms, alors les survivants devinrent prudents. Les héros n'avaient plus de titres. Ils portaient des cicatrices, des silhouettes, des manières de marcher.",
        "Un Chevalier qui tournait sans cesse son épée, comme pour repousser un souvenir. Une Arcaniste qui comptait ses respirations avant chaque tir, pour ne pas laisser la Brume entrer entre deux syllabes.",
        "Un Rôdeur qui dormait assis, arc contre la poitrine. Et un Templier déchu, dont la prière s'était éteinte mais dont la main n'avait jamais appris à trembler.",
        "Ils ne cherchaient pas à être aimés. Ils cherchaient simplement à gagner du temps."
      ]
    },
    {
      id: 'epiques',
      title: 'Chapitre VI — Les monstres épiques',
      paragraphs: [
        "Quand Eldara crut avoir compris les vagues, la Brume changea de visage. Des créatures plus grandes apparurent, bardées d'os et de symboles gravés à même leur peau.",
        "Elles ne se contentaient pas de courir. Elles observaient. Elles tiraient. Elles forçaient les survivants à choisir : esquiver ou frapper, s'exposer ou reculer.",
        "On les appela monstres épiques, non pas pour leur gloire, mais pour la catastrophe qu'ils annonçaient. Leur arrivée signifiait que la Brume apprenait."
      ]
    },
    {
      id: 'flamme',
      title: 'Épilogue — La dernière flamme',
      paragraphs: [
        "Au cœur de la plaine, une dernière flamme refuse de s'éteindre. Elle ne promet pas la victoire. Elle promet seulement une chance.",
        "Chaque bataille repousse la nuit. Chaque niveau gagné réveille un fragment d'espoir. Chaque powerup choisi est une décision : survivre mieux, frapper plus fort, ou courir plus vite.",
        "Tenez bon, survivant. Si Eldara doit tomber, elle tombera en vous regardant droit dans les yeux."
      ]
    }
  ];

  return (
    <div className="story-page">
      <header className="story-header">
        <div className="story-header-inner">
          <div>
            <h1>🕯️ Histoire d'Eldara</h1>
            <p>Chroniques du royaume et de la Brume d'Obsidienne.</p>
          </div>
          <div className="story-header-actions">
            <button type="button" className="story-btn" onClick={() => navigate('/dashboard')}>Retour</button>
          </div>
        </div>
      </header>

      <main className="story-content">
        <aside className="story-sidebar">
          <div className="story-sidebar-box">
            <h2>Chapitres</h2>
            {chapters.map((c) => (
              <a key={c.id} className="story-nav-link" href={`#${c.id}`}>{c.title}</a>
            ))}
          </div>
        </aside>

        <section className="story-panel">
          {chapters.map((c) => (
            <div key={c.id} id={c.id} className="story-chapter">
              <h2>{c.title}</h2>
              {c.quote ? <div className="story-quote">{c.quote}</div> : null}
              {c.paragraphs.map((p, idx) => (
                <p key={`${c.id}-${idx}`}>{p}</p>
              ))}
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default Histoire;
