import React from 'react';
import './AtelierSection.css'

const AtelierSection = () => (
  <section className="atelier-section">
    <div className="atelier-grid">
      <div className="atelier-text">
        <h2>THE ATELIER</h2>
        <p>Each piece is meticulously crafted by our master artisans, bringing together centuries of tradition with modern innovation.</p>
        <a href="#craftsmanship" className="craft-btn">EXPLORE CRAFTSMANSHIP</a>
      </div>
      <div className="atelier-image">
        <img src="https://images.pexels.com/photos/5370706/pexels-photo-5370706.jpeg" alt="Jewelry craftsmanship" />
      </div>
    </div>
  </section>
);

export default AtelierSection;