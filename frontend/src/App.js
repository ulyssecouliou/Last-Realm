import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/Dashboard';
import Game from './components/Game';
import Stats from './components/Stats';
import Wiki from './components/Wiki';
import Histoire from './components/Histoire';
import ProtectedRoute from './components/ProtectedRoute';
import { MusicProvider, useMusic } from './utils/MusicProvider';
import './App.css';

const MusicRouteSync = () => {
  const location = useLocation();
  const { setMusicMode, mode } = useMusic();

  useEffect(() => {
    const isGame = location.pathname === '/game';
    if (isGame) {
      if (mode !== 'boss' && mode !== 'hero') {
        setMusicMode('game');
      }
    } else {
      setMusicMode('menu');
    }
  }, [location.pathname, mode, setMusicMode]);

  return null;
};

function App() {
  const { initializeAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Initialize authentication when app starts
    initializeAuth();
  }, [initializeAuth]);

  return (
    <MusicProvider>
      <Router>
        <MusicRouteSync />
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route 
              path="/login" 
              element={
                isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
              } 
            />
            <Route 
              path="/register" 
              element={
                isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
              } 
            />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/game" 
              element={
                <ProtectedRoute>
                  <Game />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/stats" 
              element={
                <ProtectedRoute>
                  <Stats />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/wiki" 
              element={
                <ProtectedRoute>
                  <Wiki />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/histoire" 
              element={
                <ProtectedRoute>
                  <Histoire />
                </ProtectedRoute>
              } 
            />
            
            {/* Default redirect */}
            <Route 
              path="/" 
              element={
                <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
              } 
            />
            
            {/* Catch all route */}
            <Route 
              path="*" 
              element={
                <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
              } 
            />
          </Routes>
        </div>
      </Router>
    </MusicProvider>
  );
 }

export default App;
