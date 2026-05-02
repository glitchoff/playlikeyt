'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface SettingsContextType {
  playbackRate: number;
  setPlaybackRate: (rate: number | ((prev: number) => number)) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [playbackRate, setPlaybackRateState] = useState(1);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('playlikeyt-playback-rate');
    if (saved) {
      const rate = parseFloat(saved);
      if (!isNaN(rate)) {
        setPlaybackRateState(rate);
      }
    }
  }, []);

  // Save to localStorage when playbackRate changes
  useEffect(() => {
    localStorage.setItem('playlikeyt-playback-rate', playbackRate.toString());
  }, [playbackRate]);

  const setPlaybackRate = (rate: number | ((prev: number) => number)) => {
    setPlaybackRateState(rate);
  };

  return (
    <SettingsContext.Provider value={{ playbackRate, setPlaybackRate }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
