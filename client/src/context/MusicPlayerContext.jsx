import React, { createContext, useState, useContext, useRef } from 'react';

const MusicPlayerContext = createContext();

export const useMusicPlayer = () => {
  return useContext(MusicPlayerContext);
};

export const MusicPlayerProvider = ({ children }) => {
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const playerRef = useRef(null);

  const playPlaylist = (playlistSrc) => {
    setCurrentPlaylist(playlistSrc);
  };

  const handleDragStart = (e) => {
    const rect = playerRef.current.getBoundingClientRect();
    e.dataTransfer.setData('text/plain', JSON.stringify({
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    }));
  };

  const handleDragEnd = (e) => {
    const offset = JSON.parse(e.dataTransfer.getData('text/plain'));
    playerRef.current.style.left = `${e.clientX - offset.offsetX}px`;
    playerRef.current.style.top = `${e.clientY - offset.offsetY}px`;
  };

  return (
    <MusicPlayerContext.Provider value={{ currentPlaylist, playPlaylist }}>
      {children}
      
        <iframe
          
          src={'https://open.spotify.com/embed/playlist/37i9dQZF1DX4WYpdgoIcn6?utm_source=generator'}
          width="300"
          height="80"
          frameBorder="0"
          allow="encrypted-media"
          draggable="true"
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          style={{
            position: 'fixed', // Ensure it stays in view
            bottom: '20px', // Adjusted position for better visibility
            right: '20px',
            cursor: 'move',
            zIndex: 1000,
            backgroundColor: 'white', // Ensure background is visible
          }}
        ></iframe>
      
    </MusicPlayerContext.Provider>
  );
};