import React, { useEffect, useState } from 'react';
import './music.css';
import Navbar from '../components/NavBar';
import { useMusicStore } from './musicStore';

const MusicPage = () => {
  const { currentMusic, isPlaying, playPlaylist } = useMusicStore();
  const [scrolled, setScrolled] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const viewportHeight = 100;
      setScrolled(scrollTop > viewportHeight);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const playlists = [
    { name: 'Chill Vibes', src: "https://open.spotify.com/embed/artist/1uNFoZAHBGtllmzznpCI3s?utm_source=generator" },
    { name: 'Workout Mix', src: "https://open.spotify.com/embed/artist/1Xyo4u8uXC1ZmMpatF05PJ?utm_source=generator" },
    { name: 'Classic Rock', src: "https://open.spotify.com/embed/artist/6VuMaDnrHyPL1p4EHjYLi7?utm_source=generator" },
    { name: 'Jazz Classics', src: "https://open.spotify.com/embed/artist/4zCH9qm4R2DADamUHMCa6O?utm_source=generator" },
    { name: 'Pop Rising', src: "https://open.spotify.com/embed/album/2cWBwpqMsDJC1ZUwz813lo?utm_source=generator" },
    { name: 'Rap Caviar', src: "https://open.spotify.com/embed/artist/15UsOTVnJzReFVN1VCnxy4?utm_source=generator" },
  ];

  const handlePlayPause = (playlistSrc) => {
    playPlaylist(playlistSrc);
  };

  return (
    <div className="music-page">
      <Navbar scrolled={scrolled} />
      <h1>
        <span className="music-live-dot"></span>
        Explore Our Playlists
      </h1>
      {/* Inline style to center the text horizontally */}
     
      <div className="playlists-container">
        {playlists.map((playlist, index) => (
          <div
            key={index}
            className={`playlist-card ${currentMusic === playlist.src && isPlaying ? 'playing' : ''}`}
          >
            <iframe
              src={playlist.src}
              width="300"
              height="380"
              style={{ border: 'none' }}
              allow="encrypted-media"
              title={playlist.name}
            ></iframe>
            <button
              onClick={() => handlePlayPause(playlist.src)}
              aria-label={currentMusic === playlist.src && isPlaying ? 'Pause' : 'Play'}
            >
              {currentMusic === playlist.src && isPlaying ? '❚❚' : '▶'}
            </button>
          </div>
        ))}
      </div>
       <p style={{ textAlign: 'center' }}>NEW PLAYLISTS WILL BE COMING SOON....</p>
    </div>
    
  );
};

export default MusicPage;