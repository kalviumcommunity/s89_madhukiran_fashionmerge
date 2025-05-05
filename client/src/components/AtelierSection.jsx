import React from 'react';
import './AtelierSection.css'

const AtelierSection = () => (
  <section className="atelier-section">
    <div className="atelier-grid">
      <div className="atelier-text">
        <h2>THE ALITA</h2>
        <p>ALITA is your personal fashion design assistant in FashionMerge.
She analyzes outfit images uploaded by users and offers smart styling tips.
From improving your look to matching it with trends or wardrobe items, ALITA’s got you.
Whether you're dressing up or designing, ALITA helps you refine your fashion game.</p>
        <a href="#craftsmanship" className="craft-btn">EXPLORE ALITA</a>
      </div>
      <div className="atelier-image">
        <img src="https://images.pexels.com/photos/2681751/pexels-photo-2681751.jpeg" alt="Jewelry craftsmanship" />
      </div>
    </div>
  </section>
);

export default AtelierSection;