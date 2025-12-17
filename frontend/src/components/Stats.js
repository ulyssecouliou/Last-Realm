import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Stats = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const res = await axios.get('/stats/me');
        if (mounted) {
          setStats(res.data?.stats || null);
        }
      } catch (e) {
        if (mounted) {
          setStats(null);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const derived = useMemo(() => {
    const s = stats || {};
    const gamesPlayed = Number(s.gamesPlayed) || 0;
    const totalSurvivalSeconds = Number(s.totalSurvivalSeconds) || 0;
    const avgSeconds = gamesPlayed > 0 ? Math.round(totalSurvivalSeconds / gamesPlayed) : 0;

    const formatSeconds = (seconds) => {
      const sec = Math.max(0, Number(seconds) || 0);
      const m = Math.floor(sec / 60);
      const r = sec % 60;
      return `${m}m ${r}s`;
    };

    return {
      gamesPlayed,
      bestScore: Number(s.bestScore) || 0,
      maxKills: Number(s.maxKills) || 0,
      totalKills: Number(s.totalKills) || 0,
      totalEpicKills: Number(s.totalEpicKills) || 0,
      heroModeWins: Number(s.heroModeWins) || 0,
      normalModeWins: Number(s.normalModeWins) || 0,
      maxLevel: Number(s.maxLevel) || 1,
      maxSurvivalSeconds: Number(s.maxSurvivalSeconds) || 0,
      avgSurvivalSeconds: avgSeconds,
      formatSeconds
    };
  }, [stats]);

  const fakeGlobal = useMemo(() => {
    const baseNames = [
      'DarkKnight',
      'EldaraMage',
      'RogueOfMist',
      'LunaTemplar',
      'ObsidianWolf',
      'CursedArcher',
      'SableSorcerer',
      'IronWarden',
      'FrostSeer',
      'CrimsonPaladin',
      'AshenDruid',
      'NightRaven',
      'SilverWitch',
      'WyrmSlayer',
      'GloomSentry',
      'ThornValkyrie',
      'MireAssassin',
      'Sunforged',
      'VoidTactician',
      'GraveBard'
    ];

    let seed = 1337;
    const rand = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    };

    const rows = [];
    const total = 55;
    let score = 10250;
    for (let i = 0; i < total; i += 1) {
      const base = baseNames[i % baseNames.length];
      const suffix = Math.floor(rand() * 999);
      const username = i < baseNames.length ? base : `${base}${String(suffix).padStart(3, '0')}`;
      score = Math.max(120, score - (80 + Math.floor(rand() * 140)));
      rows.push({ rank: i + 1, username, score });
    }

    return rows;
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#e6e6e6' }}>
      <div style={{
        maxWidth: 1000,
        margin: '0 auto',
        padding: '24px 16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <h1 style={{ margin: 0, color: '#d4af37', fontFamily: 'serif' }}>Statistiques</h1>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '10px 14px',
              backgroundColor: '#d4af37',
              color: '#1a1a1a',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            ← Retour
          </button>
        </div>

        <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
          <button
            onClick={() => setActiveTab('personal')}
            style={{
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid rgba(212, 175, 55, 0.35)',
              background: activeTab === 'personal' ? 'rgba(212, 175, 55, 0.18)' : 'rgba(255,255,255,0.04)',
              color: '#e6e6e6',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Statistiques personnelles
          </button>
          <button
            onClick={() => setActiveTab('global')}
            style={{
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid rgba(212, 175, 55, 0.35)',
              background: activeTab === 'global' ? 'rgba(212, 175, 55, 0.18)' : 'rgba(255,255,255,0.04)',
              color: '#e6e6e6',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Score mondial
          </button>
        </div>

        <div style={{ marginTop: 18 }}>
          {activeTab === 'personal' ? (
            <div style={{
              border: '1px solid rgba(212, 175, 55, 0.25)',
              borderRadius: 12,
              background: 'rgba(255,255,255,0.03)',
              padding: 16
            }}>
              <h2 style={{ margin: '0 0 12px 0', fontFamily: 'serif', color: '#d4af37' }}>Votre profil</h2>

              {!stats ? (
                <div style={{ opacity: 0.9 }}>Chargement...</div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: 12
                }}>
                  <div style={{ padding: 12, borderRadius: 10, background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ opacity: 0.8, fontSize: 12 }}>Nombre de parties</div>
                    <div style={{ fontSize: 22, fontWeight: 'bold' }}>{derived.gamesPlayed}</div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 10, background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ opacity: 0.8, fontSize: 12 }}>Score max</div>
                    <div style={{ fontSize: 22, fontWeight: 'bold' }}>{derived.bestScore}</div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 10, background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ opacity: 0.8, fontSize: 12 }}>Nombre de monstres tués (total)</div>
                    <div style={{ fontSize: 22, fontWeight: 'bold' }}>{derived.totalKills}</div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 10, background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ opacity: 0.8, fontSize: 12 }}>Nombre de monstres tués (max / partie)</div>
                    <div style={{ fontSize: 22, fontWeight: 'bold' }}>{derived.maxKills}</div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 10, background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ opacity: 0.8, fontSize: 12 }}>Monstres épiques tués (total)</div>
                    <div style={{ fontSize: 22, fontWeight: 'bold' }}>{derived.totalEpicKills}</div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 10, background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ opacity: 0.8, fontSize: 12 }}>Mode Héros gagnés</div>
                    <div style={{ fontSize: 22, fontWeight: 'bold' }}>{derived.heroModeWins}</div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 10, background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ opacity: 0.8, fontSize: 12 }}>Mode Normal terminés</div>
                    <div style={{ fontSize: 22, fontWeight: 'bold' }}>{derived.normalModeWins}</div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 10, background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ opacity: 0.8, fontSize: 12 }}>Niveau max atteint</div>
                    <div style={{ fontSize: 22, fontWeight: 'bold' }}>{derived.maxLevel}</div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 10, background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ opacity: 0.8, fontSize: 12 }}>Temps max de survie</div>
                    <div style={{ fontSize: 22, fontWeight: 'bold' }}>{derived.formatSeconds(derived.maxSurvivalSeconds)}</div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 10, background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ opacity: 0.8, fontSize: 12 }}>Temps moyen d'une partie</div>
                    <div style={{ fontSize: 22, fontWeight: 'bold' }}>{derived.formatSeconds(derived.avgSurvivalSeconds)}</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{
              border: '1px solid rgba(212, 175, 55, 0.25)',
              borderRadius: 12,
              background: 'rgba(255,255,255,0.03)',
              padding: 16
            }}>
              <h2 style={{ margin: '0 0 12px 0', fontFamily: 'serif', color: '#d4af37' }}>Classement mondial</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <th style={{ padding: '10px 8px', opacity: 0.85 }}>#</th>
                      <th style={{ padding: '10px 8px', opacity: 0.85 }}>Pseudo</th>
                      <th style={{ padding: '10px 8px', opacity: 0.85 }}>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fakeGlobal.map((row) => (
                      <tr key={row.rank} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <td style={{ padding: '10px 8px' }}>{row.rank}</td>
                        <td style={{ padding: '10px 8px' }}>{row.username}</td>
                        <td style={{ padding: '10px 8px', fontWeight: 'bold' }}>{row.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stats;
