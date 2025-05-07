import React from 'react';
import './AtelierSection.css';

const AtelierSection = () => {
  const handleExploreAlitaClick = () => {
    window.location.href = '/alita'; // Redirect to the chatbot page
  };

  return (
    <section className="atelier-section">
      <div className="atelier-grid">
        <div className="atelier-text">
          <h2>THE ALITA</h2>
          <p>ALITA is your personal fashion design assistant in FashionMerge.
          She analyzes outfit images uploaded by users and offers smart styling tips.
          From improving your look to matching it with trends or wardrobe items, ALITA’s got you.
          Whether you're dressing up or designing, feel free to upload photos and let Alita give feedback and enhance your style to next level. ALITA helps you refine your fashion game.</p>
          <a href="#craftsmanship" className="craft-btn" onClick={handleExploreAlitaClick}>EXPLORE ALITA</a>
        </div>
        <div className="atelier-image">
          <img src="https://images.pexels.com/photos/2681751/pexels-photo-2681751.jpeg" alt="Jewelry craftsmanship" />
        </div>
      </div>
    </section>
  );
};

export default AtelierSection;