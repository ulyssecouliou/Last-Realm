import React from 'react';
import useAuthStore from '../store/authStore';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout, isLoading } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  const handleStartGame = () => {
    // TODO: Implement game start logic
    console.log('Starting Last Realm game...');
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
              <button className="secondary-button">
                📊 Voir les statistiques
              </button>
            </div>
          </div>
          
          <div className="hero-stats">
            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <div className="stat-info">
                <span className="stat-value">0</span>
                <span className="stat-label">Meilleur Score</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">⚔️</div>
              <div className="stat-info">
                <span className="stat-value">0</span>
                <span className="stat-label">Ennemis Vaincus</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">🕐</div>
              <div className="stat-info">
                <span className="stat-value">0m</span>
                <span className="stat-label">Temps de Survie</span>
              </div>
            </div>
          </div>
        </div>

        <div className="features-section">
          <h3>Caractéristiques du jeu</h3>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🧙‍♂️</div>
              <h4>Classes Uniques</h4>
              <p>Choisissez parmi 4 classes : Chevalier déchu, Arcaniste, Rôdeur des forêts, ou Templier corrompu.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h4>Upgrades Dynamiques</h4>
              <p>Améliorez vos capacités à chaque niveau avec des upgrades aléatoires et stratégiques.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🌊</div>
              <h4>Vagues Infinies</h4>
              <p>Affrontez des vagues d'ennemis de plus en plus difficiles dans un combat sans fin.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🏰</div>
              <h4>Monde Immersif</h4>
              <p>Explorez le royaume d'Eldara corrompu par la Brume d'Obsidienne.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="dashboard-footer">
        <p>&copy; 2024 Last Realm - Survivez aux ténèbres</p>
      </footer>
    </div>
  );
};

export default Dashboard;
