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
  const [selectedMode, setSelectedMode] = useState('infinite');

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
    setSelectedMode('infinite');
    setShowClassModal(true);
  };

  const handleStartNormalMode = () => {
    setSelectedMode('normal');
    setShowClassModal(true);
  };

  const handleStartBossMode = () => {
    setSelectedMode('boss');
    setShowClassModal(true);
  };

  const handleChooseClass = (playerClass) => {
    try {
      localStorage.setItem('lastrealm_player_class', playerClass);
    } catch (e) {
      // ignore
    }
    setShowClassModal(false);
    const mode = selectedMode || 'infinite';
    navigate(`/game?mode=${encodeURIComponent(mode)}&class=${encodeURIComponent(playerClass)}`);
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
            <h1><img className="ui-icon" src="/icon.png" alt="Last Realm" /> Last Realm</h1>
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
                ♾️ Mode Infini
              </button>
              <button
                onClick={handleStartNormalMode}
                className="secondary-button"
                title={'Survis jusqu’au boss (3 minutes) et gagne en le tuant'}
              >
                🛡️ Mode Normal
              </button>
              <button
                onClick={handleStartBossMode}
                className="secondary-button"
                title={'Choisis ta classe, puis 10 powerups, puis bats le boss'}
              >
                👑 Mode Boss
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

            <div className="stat-card">
              <div className="stat-icon">👑</div>
              <div className="stat-info">
                <span className="stat-value">{stats.heroModeWins || 0}</span>
                <span className="stat-label">Mode Héros gagnés</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🛡️</div>
              <div className="stat-info">
                <span className="stat-value">{stats.normalModeWins || 0}</span>
                <span className="stat-label">Mode Normal terminés</span>
              </div>
            </div>
          </div>
        </div>

        <div className="home-links">
          <button type="button" className="home-link-btn" onClick={() => navigate('/wiki')}>📖 Ouvrir le Wiki</button>
          <button type="button" className="home-link-btn" onClick={() => navigate('/histoire')}><img className="ui-icon" src="/icon.png" alt="Histoire" /> Lire l'Histoire</button>
        </div>
      </main>

      <footer className="dashboard-footer">
        <p>&copy; 2025 Last Realm - Survivez aux ténèbres</p>
      </footer>

      {showClassModal && (
        <div
          onClick={() => setShowClassModal(false)}
          className="class-modal-overlay"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="class-modal"
          >
            <div className="class-modal-header">
              <div>
                <h3 className="class-modal-title">Choisis ta classe</h3>
                <div className="class-modal-subtitle">Sélectionne ton héros avant de partir à l'aventure.</div>
              </div>
              <button
                onClick={() => setShowClassModal(false)}
                className="class-modal-close"
              >
                Fermer
              </button>
            </div>

            <div className="class-grid">
              <button type="button" className="class-card" onClick={() => handleChooseClass('knight')}>
                <div className="class-card-media">
                  <img className="class-card-img" src="/—Pngtree—knight avatar soldier with shield_23256476.png" alt="Chevalier" />
                </div>
                <div className="class-card-body">
                  <div className="class-card-title">Chevalier</div>
                  <div className="class-card-desc">Épée tournoyante, dégâts constants au corps-à-corps.</div>
                </div>
              </button>

              <button type="button" className="class-card" onClick={() => handleChooseClass('mage')}>
                <div className="class-card-media">
                  <img className="class-card-img" src="/magicien.png" alt="Magicien" />
                </div>
                <div className="class-card-body">
                  <div className="class-card-title">Magicien</div>
                  <div className="class-card-desc">Boules de feu à distance, excellent scaling avec les powerups.</div>
                </div>
              </button>

              <button type="button" className="class-card" onClick={() => handleChooseClass('ranger')}>
                <div className="class-card-media">
                  <img className="class-card-img" src="/rodeur.png" alt="Rôdeur" />
                </div>
                <div className="class-card-body">
                  <div className="class-card-title">Rôdeur</div>
                  <div className="class-card-desc">Flèches perforantes, idéal pour gérer les lignes d'ennemis.</div>
                </div>
              </button>

              <button type="button" className="class-card" onClick={() => handleChooseClass('templar')}>
                <div className="class-card-media">
                  <img className="class-card-img" src="/templier_dechu.png" alt="Templier déchu" />
                </div>
                <div className="class-card-body">
                  <div className="class-card-title">Templier déchu</div>
                  <div className="class-card-desc">Lance directionnelle, gros burst sur la pointe.</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
