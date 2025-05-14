import React from 'react';
import './CollectionSection.css';

const CollectionSection = () => {
  const handleViewAllClick = () => {
    window.location.href = '/collections'; // Redirect to the collections page
  };

  const handleItemClick = () => {
    window.location.href = '/collections'; // Redirect to the collections page when clicking on an item
  };

  return (
    <section
      id="collections-section"
      className="collection-section">
      <h2>NEW COLLECTION</h2>
      <div className="collection-grid">
        <div className="collection-item" onClick={handleItemClick}>
          <img src="https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg" alt="Jewelry piece" />
          <div className="item-info">
            <h3>The Eternal Lock</h3>
            <p>18K Gold & Diamond</p>
          </div>
        </div>
        <div className="collection-item" onClick={handleItemClick}>
          <img src="https://images.pexels.com/photos/248077/pexels-photo-248077.jpeg" alt="Jewelry piece" />
          <div className="item-info">
            <h3>Pearl Essence</h3>
            <p>Natural Pearls & White Gold</p>
          </div>
        </div>
        <div className="collection-item" onClick={handleItemClick}>
          <img src="https://images.pexels.com/photos/266621/pexels-photo-266621.jpeg" alt="Jewelry piece" />
          <div className="item-info">
            <h3>Sapphire Dreams</h3>
            <p>Blue Sapphire & Platinum</p>
          </div>
        </div>
      </div>
      <button className="view-all-btn" onClick={handleViewAllClick}>VIEW ALL</button>
    </section>
  );
};

export default CollectionSection;