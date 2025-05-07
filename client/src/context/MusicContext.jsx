import React, { createContext, useState, useEffect } from 'react';

export const MusicContext = createContext();

export const MusicProvider = ({ children }) => {
  const [currentMusic, setCurrentMusic] = useState(() => {
    return sessionStorage.getItem('currentMusic') || null;
  });
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    sessionStorage.setItem('currentMusic', currentMusic);
  }, [currentMusic]);

  return (
    <MusicContext.Provider value={{ currentMusic, setCurrentMusic, isPlaying, setIsPlaying }}>
      {children}
    </MusicContext.Provider>
  );
};