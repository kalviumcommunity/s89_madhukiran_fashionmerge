import React, { useState, useEffect } from 'react';
import './music.css';
import Navbar from '../components/NavBar';

const MusicPage = ({ currentMusic, setCurrentMusic }) => {
  const [scrolled, setScrolled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

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
    { name: 'Chill Vibes', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4WYpdgoIcn6?utm_source=generator' },
    { name: 'Workout Mix', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX76Wlfdnj7AP?utm_source=generator' },
    { name: 'Classic Rock', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWXRqgorJj26U?utm_source=generator' },
    { name: 'Jazz Classics', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXbITWG1ZJKYt?utm_source=generator' },
    { name: 'Pop Rising', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWUa8ZRTfalHk?utm_source=generator' },
    { name: 'Rap Caviar', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX0XUsuxWHRQd?utm_source=generator' },
    { name: 'Rock Classics', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWXRqgorJj26U?utm_source=generator' },
    { name: 'Peaceful Piano', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwq3LiO?utm_source=generator' },
    { name: 'Hot Country', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX1lVhptIYRda?utm_source=generator' },
    { name: 'New Music Friday', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4JAvHpjipBk?utm_source=generator' },
    // { name: 'All Out 80s', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4UtSsGT1Svd?utm_source=generator' },
    // { name: 'Mood Booster', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX3rxVfibe1L0?utm_source=generator' },
    // { name: 'Summer Hits', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX6ALfRKlHn1t?utm_source=generator' },
    // { name: 'Deep Focus', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ?utm_source=generator' },
    // { name: 'Dance Party', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXaXB8fQg7xif?utm_source=generator' },
    // { name: 'Indie Pop', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX2Nc3B70tvx0?utm_source=generator' },
    // { name: 'Classical Essentials', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWWEJlAGA9gs0?utm_source=generator' },
    // { name: 'Latin Pop', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX10zKzsJ2jva?utm_source=generator' },
    // { name: 'Soul Classics', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWV7EzJMK2FUI?utm_source=generator' },
    // { name: 'Reggae Classics', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXbSbnqxMTGx9?utm_source=generator' },
    // { name: 'Metal Essentials', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX9qNs32fujYe?utm_source=generator' },
    // { name: 'Hip Hop Drive', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX6GwdWRQMQpq?utm_source=generator' },
    // { name: 'R&B Classics', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4SBhb3fqCJd?utm_source=generator' },
    // { name: 'Acoustic Hits', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWVqfgj8NZEp1?utm_source=generator' },
    // { name: 'Electronic Chill', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4E3UdUs7fUx?utm_source=generator' },
    // { name: 'Blues Classics', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXd9rSDyQguIk?utm_source=generator' },
    // { name: 'Funk Classics', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX7P3Ec4TfanK?utm_source=generator' },
    // { name: 'Alternative Hits', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX2sUQwD7tbmL?utm_source=generator' },
    // { name: 'K-Pop Hits', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX9tPFwDMOaN1?utm_source=generator' },
    // { name: 'Bollywood Hits', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX5KBgZM4MWjH?utm_source=generator' },
    // { name: 'French Pop', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXbJmi3bR5vwx?utm_source=generator' },
    // { name: 'Italian Pop', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWVqfgj8NZEp1?utm_source=generator' },
    // { name: 'Spanish Pop', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX10zKzsJ2jva?utm_source=generator' },
    // { name: 'German Pop', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXbITWG1ZJKYt?utm_source=generator' },
    // { name: 'Japanese Pop', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4WYpdgoIcn6?utm_source=generator' },
    // { name: 'Brazilian Pop', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX76Wlfdnj7AP?utm_source=generator' },
    // { name: 'Russian Pop', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWXRqgorJj26U?utm_source=generator' },
    // { name: 'Chinese Pop', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXbITWG1ZJKYt?utm_source=generator' },
    // { name: 'Arabic Pop', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4WYpdgoIcn6?utm_source=generator' },
    // { name: 'Turkish Pop', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX76Wlfdnj7AP?utm_source=generator' },
    // { name: 'Greek Pop', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWXRqgorJj26U?utm_source=generator' },
    // { name: 'Indian Classical', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXbITWG1ZJKYt?utm_source=generator' },
    // { name: 'African Beats', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4WYpdgoIcn6?utm_source=generator' },
    // { name: 'Caribbean Vibes', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX76Wlfdnj7AP?utm_source=generator' },
    // { name: 'Celtic Classics', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWXRqgorJj26U?utm_source=generator' },
    // { name: 'Nordic Sounds', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXbITWG1ZJKYt?utm_source=generator' },
    // { name: 'Australian Hits', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4WYpdgoIcn6?utm_source=generator' },
    // { name: 'New Zealand Sounds', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX76Wlfdnj7AP?utm_source=generator' },
    // { name: 'Canadian Hits', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWXRqgorJj26U?utm_source=generator' },
    // { name: 'American Classics', src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXbITWG1ZJKYt?utm_source=generator' },
    // Add more playlists as needed
  ];

  const handlePlayPause = (playlistSrc) => {
    if (currentMusic === playlistSrc) {
      if (isPlaying) {
        setIsPlaying(false);
        setCurrentMusic(null);
      } else {
        setIsPlaying(true);
        setCurrentMusic(playlistSrc);
      }
    } else {
      setIsPlaying(true);
      setCurrentMusic(playlistSrc);
    }
  };

  return (
    <div className="music-page">
      <Navbar scrolled={scrolled} />
      <h1>Explore Our Playlists</h1>
      <div className="playlists-container">
        {playlists.map((playlist, index) => (
          <div key={index} className="playlist-card">
            <iframe
              src={playlist.src}
              width="300"
              height="380"
              frameBorder="0"
              allow="encrypted-media"
              title={playlist.name}
            ></iframe>
            <button onClick={() => handlePlayPause(playlist.src)}>
              {currentMusic === playlist.src && isPlaying ? 'Pause' : 'Play'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MusicPage;