import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './MaisonSection.css';

const MaisonSection = () => {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const sectionRef = useRef(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);

  const handleDiscoverMoreClick = () => {
    window.location.href = '/collections'; // Redirect to the discover page
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    const currentSection = sectionRef.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          // Start loading video when section comes into view
          if (!isVideoLoaded) {
            setIsVideoLoaded(true);
          }
        }
      },
      {
        threshold: 0.1, // Trigger when 10% of the section is visible
        rootMargin: '50px' // Start loading 50px before the section comes into view
      }
    );

    if (currentSection) {
      observer.observe(currentSection);
    }

    return () => {
      if (currentSection) {
        observer.unobserve(currentSection);
      }
    };
  }, [isVideoLoaded]);

  // Handle video loading and playing
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideoLoaded) return;

    const handleCanPlay = () => {
      setIsVideoReady(true);
      // Only autoplay if the section is in view
      if (isInView) {
        video.play().catch(console.error);
      }
    };

    const handleLoadStart = () => {
      setIsVideoReady(false);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadstart', handleLoadStart);

    // Load the video
    video.load();

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadstart', handleLoadStart);
    };
  }, [isVideoLoaded, isInView]);

  // Play/pause video based on visibility
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideoReady) return;

    if (isInView) {
      video.play().catch(console.error);
    } else {
      video.pause();
    }
  }, [isInView, isVideoReady]);

  return (
    <section className="maison-section" ref={sectionRef}>
      {/* Placeholder background image for immediate loading */}
      <div className="maison-video-placeholder">
        <img
          src="https://www.vancleefarpels.com/content/dam/vancleefarpels/La-Maison/videos/the-making-of-your-flowerlace-creation/VCA_2022_Craftsmanship_Flowerlace_ring-4K.mp4"
          alt="Maison background"
          className="placeholder-image"
        />
      </div>

      {/* Lazy-loaded video */}
      {isVideoLoaded && (
        <video
          ref={videoRef}
          className={`maison-video ${isVideoReady ? 'video-ready' : 'video-loading'}`}
          loop
          muted
          playsInline
          preload="none"
        >
          <source src="https://www.vancleefarpels.com/content/dam/vancleefarpels/La-Maison/videos/the-making-of-your-flowerlace-creation/VCA_2022_Craftsmanship_Flowerlace_ring-4K.mp4" />
          {t('maison.videoAlt')}
        </video>
      )}

      {/* Loading indicator */}
      {isVideoLoaded && !isVideoReady && (
        <div className="video-loading-indicator">
          <div className="loading-spinner"></div>
        </div>
      )}

      <div className="maison-content">
        <h2>{t('maison.title')}</h2>
        <p>{t('maison.description')}</p>
        <a href="#discover" className="discover-btn" onClick={handleDiscoverMoreClick}>
          {t('maison.button')}
        </a>
      </div>
    </section>
  );
};

export default MaisonSection;
