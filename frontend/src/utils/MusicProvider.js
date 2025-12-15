import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const MusicContext = createContext(null);

const TRACKS = {
  menu: '/music/menu.mp3',
  game: '/music/game.mp3'
};

export const MusicProvider = ({ children }) => {
  const audioRef = useRef(null);
  const currentTrackRef = useRef(null);
  const [mode, setMode] = useState('menu');

  if (!audioRef.current) {
    const a = new Audio();
    a.loop = true;
    a.preload = 'auto';
    a.volume = 0.35;
    audioRef.current = a;
  }

  const playCurrent = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      await audio.play();
    } catch (e) {
      // Autoplay can be blocked until a user gesture
    }
  }, []);

  const setMusicMode = useCallback(
    async (nextMode) => {
      const audio = audioRef.current;
      const key = nextMode === 'game' ? 'game' : 'menu';
      if (!audio) return;

      setMode(key);

      if (currentTrackRef.current === key) {
        if (audio.paused) {
          await playCurrent();
        }
        return;
      }

      currentTrackRef.current = key;
      audio.src = TRACKS[key];
      audio.currentTime = 0;
      await playCurrent();
    },
    [playCurrent]
  );

  useEffect(() => {
    const tryResume = () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (audio.paused) {
        playCurrent();
      }
    };

    window.addEventListener('pointerdown', tryResume, { passive: true });
    window.addEventListener('keydown', tryResume);

    return () => {
      window.removeEventListener('pointerdown', tryResume);
      window.removeEventListener('keydown', tryResume);
    };
  }, [playCurrent]);

  useEffect(() => {
    setMusicMode('menu');
  }, [setMusicMode]);

  const value = {
    mode,
    setMusicMode
  };

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
};

export const useMusic = () => {
  const ctx = useContext(MusicContext);
  if (!ctx) {
    throw new Error('useMusic must be used within MusicProvider');
  }
  return ctx;
};
