import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ bestScore: 0, maxKills: 0, maxSurvivalSeconds: 0 });
  const [showClassModal, setShowClassModal] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadStats = async () => {
      try {
        const res = await axios.get('/stats/me');
        if (mounted && res.data?.stats) {
          setStats(res.data.stats);
        }
      } catch (e) {
        if (mounted) {
          setStats({ bestScore: 0, maxKills: 0, maxSurvivalSeconds: 0 });
        }
      }
    };

    loadStats();

    return () => {
      mounted = false;
    };
  }, []);

  const formatSurvival = (seconds) => {
    const s = Math.max(0, Number(seconds) || 0);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}m ${r}s`;
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleStartGame = () => {
    setShowClassModal(true);
  };

  const handleChooseClass = (playerClass) => {
    try {
      localStorage.setItem('lastrealm_player_class', playerClass);
    } catch (e) {
      // ignore
    }
    setShowClassModal(false);
    navigate(`/game?class=${encodeURIComponent(playerClass)}`);
  };

  const handleViewStats = () => {
    navigate('/stats');
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo-section">
            <h1>🕯️ Last Realm</h1>
            <p className="tagline">Le dernier royaume vous attend</p>
          </div>
          
          <div className="user-section">
            <div className="user-info">
              <span className="welcome-text">Bienvenue,</span>
              <span className="username">{user?.username || 'Survivant'}</span>
            </div>
            <button onClick={handleLogout} className="logout-button">
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="hero-section">
          <div className="hero-content">
            <h2>Prêt à affronter les ténèbres ?</h2>
            <p>
              Le royaume d'Eldara se meurt. Les ombres déferlent et vous êtes 
              le dernier rempart entre la lumière et le néant. Survivez aux vagues 
              infinies de créatures corrompues et restaurez l'équilibre.
            </p>
            
            <div className="game-actions">
              <button onClick={handleStartGame} className="start-game-button">
                ⚔️ Commencer la bataille
              </button>
              <button onClick={handleViewStats} className="secondary-button">
                📊 Voir les statistiques
              </button>
            </div>
          </div>
          
          <div className="hero-stats">
            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <div className="stat-info">
                <span className="stat-value">{stats.bestScore || 0}</span>
                <span className="stat-label">Meilleur Score</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">⚔️</div>
              <div className="stat-info">
                <span className="stat-value">{stats.maxKills || 0}</span>
                <span className="stat-label">Ennemis Vaincus</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">🕐</div>
              <div className="stat-info">
                <span className="stat-value">{formatSurvival(stats.maxSurvivalSeconds)}</span>
                <span className="stat-label">Temps de Survie</span>
              </div>
            </div>
          </div>
        </div>

        <div className="home-links">
          <button type="button" className="home-link-btn" onClick={() => navigate('/wiki')}>📖 Ouvrir le Wiki</button>
          <button type="button" className="home-link-btn" onClick={() => navigate('/histoire')}>🕯️ Lire l'Histoire</button>
        </div>
      </main>

      <footer className="dashboard-footer">
        <p>&copy; 2024 Last Realm - Survivez aux ténèbres</p>
      </footer>

      {showClassModal && (
        <div
          onClick={() => setShowClassModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            zIndex: 9999
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(520px, 100%)',
              borderRadius: 14,
              border: '1px solid rgba(212, 175, 55, 0.35)',
              background: 'rgba(10,10,10,0.95)',
              padding: 16
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <h3 style={{ margin: 0, color: '#d4af37' }}>Choisis ta classe</h3>
              <button
                onClick={() => setShowClassModal(false)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#e6e6e6',
                  borderRadius: 10,
                  padding: '6px 10px',
                  cursor: 'pointer'
                }}
              >
                Fermer
              </button>
            </div>

            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                onClick={() => handleChooseClass('knight')}
                style={{
                  padding: 14,
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.10)',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#e6e6e6',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                ⚔️ Chevalier
              </button>
              <button
                onClick={() => handleChooseClass('mage')}
                style={{
                  padding: 14,
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.10)',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#e6e6e6',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                🧙‍♂️ Magicien
              </button>
              <button
                onClick={() => handleChooseClass('ranger')}
                style={{
                  padding: 14,
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.10)',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#e6e6e6',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  gridColumn: '1 / -1'
                }}
              >
                🏹 Rôdeur des forêts
              </button>
              <button
                onClick={() => handleChooseClass('templar')}
                style={{
                  padding: 14,
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.10)',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#e6e6e6',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  gridColumn: '1 / -1'
                }}
              >
                🛡️ Templier déchu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
