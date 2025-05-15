import { useRef, useState, useEffect, useCallback } from 'react';
import { useMusicStore } from '../pages/musicStore';
import { Move } from 'lucide-react';
import './MusicPlayer.css';

const MusicPlayer = () => {
  const {
    currentMusic,
    stopPlayback
  } = useMusicStore();

  const playerRef = useRef(null);
  const iframeRef = useRef(null);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Load saved position from localStorage on mount
  useEffect(() => {
    const savedPosition = localStorage.getItem('musicPlayerPosition');
    if (savedPosition) {
      try {
        const parsedPosition = JSON.parse(savedPosition);
        setPosition(parsedPosition);
      } catch (error) {
        console.error('Error parsing saved position:', error);
      }
    }
  }, []);

  // Save position to localStorage when it changes
  useEffect(() => {
    if (position.x !== 20 || position.y !== 20) {
      localStorage.setItem('musicPlayerPosition', JSON.stringify(position));
    }
  }, [position]);

  // Handle mouse down event to start dragging
  const handleMouseDown = (e) => {
    if (playerRef.current) {
      const rect = playerRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  // Handle touch start event for mobile devices
  const handleTouchStart = (e) => {
    if (playerRef.current && e.touches && e.touches[0]) {
      const touch = e.touches[0];
      const rect = playerRef.current.getBoundingClientRect();
      setDragOffset({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  // Handle mouse move event during dragging
  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      // Calculate new position
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Update position
      setPosition({ x: newX, y: newY });
    }
  }, [isDragging, dragOffset]);

  // Handle touch move event for mobile devices
  const handleTouchMove = useCallback((e) => {
    if (isDragging && e.touches && e.touches[0]) {
      const touch = e.touches[0];

      // Calculate new position
      const newX = touch.clientX - dragOffset.x;
      const newY = touch.clientY - dragOffset.y;

      // Update position
      setPosition({ x: newX, y: newY });

      // Prevent scrolling while dragging
      e.preventDefault();
    }
  }, [isDragging, dragOffset]);

  // Handle mouse up event to stop dragging
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add and remove event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      // Add global event listeners
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleMouseUp);
    } else {
      // Remove global event listeners
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleMouseUp);
    }

    // Cleanup on unmount
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleTouchMove, handleMouseUp]);

  // If there's no current music, don't render anything
  if (!currentMusic) return null;

  return (
    <div
      ref={playerRef}
      className={`music-player ${isDragging ? 'dragging' : ''}`}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      <div
        className="music-player-header"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="drag-handle">
          <Move size={16} />
        </div>
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#333', marginRight: '100px' }}>SPOTIFY PLAYER</span>
        <button className="close-button" onClick={stopPlayback}>
          ✕
        </button>
      </div>

      <div className="music-player-content">
        <div className="iframe-container">
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
