import React from 'react';
import './MaisonSection.css';

const MaisonSection = () => {
  const handleDiscoverMoreClick = () => {
    window.location.href = '/collections'; // Redirect to the discover page
  };

  return (
    <section className="maison-section">
      <video className="maison-video" autoPlay loop muted>
        <source src="https://res.cloudinary.com/dwr6mvypn/video/upload/v1746449041/klzqqfpkl8kjfrtamg1v.mp4" type="video/mp4" /> 
        Your browser does not support the video tag.
      </video>
      <div className="maison-content">
        <h2>THE MAISON</h2>
        <p>Maison Decors in FashionMerge is where heritage meets innovation, offering users a curated selection of timeless fashion, blending luxury with modern trends to create unique, personalized styles. Discover the elegance of high-end fashion, reimagined for today’s style enthusiasts.
        </p>
        <a href="#discover" className="discover-btn" onClick={handleDiscoverMoreClick}>DISCOVER MORE</a>
      </div>
    </section>
  );
};

export default MaisonSection;