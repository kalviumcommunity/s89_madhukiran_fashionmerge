import React, { useState, useEffect, useRef } from 'react';
import './MaisonSection.css';

const MaisonSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const sectionRef = useRef(null);
  const videoRef = useRef(null);

  const handleDiscoverMoreClick = () => {
    window.location.href = '/collections'; // Redirect to the discover page
  };

  // Set up Intersection Observer to detect when section is visible or not
  useEffect(() => {
    const options = {
      root: null, // Use viewport as root
      rootMargin: '100px 0px', // Load when close to viewport for smoother experience
      threshold: 0.1 // Trigger when at least 10% of the section is visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // Set visibility based on intersection
        setIsVisible(entry.isIntersecting);

        // Don't unobserve - we want to know when it leaves viewport too
        // This way we can unload the video when not needed
      });
    }, options);

    const currentRef = sectionRef.current; // Store ref value for cleanup

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  // Handle video load event
  const handleVideoLoaded = () => {
    setIsVideoLoaded(true);
  };

  // Effect to handle video element when visibility changes
  useEffect(() => {
    if (videoRef.current) {
      if (!isVisible) {
        // When not visible, pause the video but don't unload it immediately
        // This prevents constant reloading during small scroll adjustments
        videoRef.current.pause();

        // Use a timeout to unload the video if it remains invisible
        const unloadTimeout = setTimeout(() => {
          if (videoRef.current && !isVisible) {
            videoRef.current.src = ''; // Completely remove the source
            videoRef.current.load(); // Reset the video element
            setIsVideoLoaded(false);
          }
        }, 1000); // Wait 1 second before unloading

        return () => clearTimeout(unloadTimeout); // Clean up timeout if visibility changes
      } else if (isVisible && (videoRef.current.paused || !videoRef.current.src)) {
        // When becoming visible again and video is paused or has no source
        videoRef.current.src = "https://res.cloudinary.com/dwr6mvypn/video/upload/q_70,f_auto/v1747214721/klzqqfpkl8kjfrtamg1v.mp4";
        videoRef.current.load();
        videoRef.current.play().catch(e => console.log("Video play failed:", e));
      }
    }
  }, [isVisible]);

  return (
    <section className="maison-section" ref={sectionRef}>
      {isVisible ? (
        <>
          {!isVideoLoaded && <div className="video-placeholder"></div>}
          <video
            ref={videoRef}
            className={`maison-video ${isVideoLoaded ? 'loaded' : 'loading'}`}
            autoPlay
            loop
            muted
            onLoadedData={handleVideoLoaded}
            preload="metadata"
            playsInline
          >
            <source
              src="https://res.cloudinary.com/dwr6mvypn/video/upload/q_70,f_auto/v1747214721/klzqqfpkl8kjfrtamg1v.mp4"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
        </>
      ) : (
        <div className="video-placeholder"></div>
      )}
      <div className="maison-content">
        <h2>THE MAISON</h2>
        <p>Maison Decors in FashionMerge is where heritage meets innovation, offering users a curated selection of timeless fashion, blending luxury with modern trends to create unique, personalized styles. Discover the elegance of high-end fashion, reimagined for today's style enthusiasts.
        </p>
        <a href="#discover" className="discover-btn" onClick={handleDiscoverMoreClick}>DISCOVER MORE</a>
      </div>
    </section>
  );
};

export default MaisonSection;
