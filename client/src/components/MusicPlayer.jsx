import { useRef } from 'react';
import { useMusicStore } from '../pages/musicStore';
import './MusicPlayer.css';

const MusicPlayer = () => {
  const {
    currentMusic,
    stopPlayback
  } = useMusicStore();

  const iframeRef = useRef(null);

  // If there's no current music, don't render anything
  if (!currentMusic) return null;

  return (
    <div className="music-player">
      <div className="music-player-header">
        <div style={{ width: '24px' }}></div> {/* Empty div for spacing */}
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#333' }}>SPOTIFY PLAYER</span>
        <div style={{ width: '24px' }}></div> {/* Empty div for spacing */}
      </div>

      <div className="music-player-content">
        <div className="iframe-container">
          <button className="close-button" onClick={stopPlayback}>
            ✕
          </button>
          <iframe
            ref={iframeRef}
            style={{ borderRadius: '12px' }}
            src={currentMusic}
            width="100%"
            height="152"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title="Spotify Player"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
