import React from 'react';
import './CollectionsCard.css';

const CollectionsCard = ({ item, onClick, children }) => {
  return (
    <div className="collection-card" onClick={onClick}>
      <div className="collection-image-container">
        <img src={item.image} alt={item.name} className="collection-image" />
      </div>
      <div className="collection-info">
        <h3 className="collection-name">{item.name}</h3>
        <p className="collection-description">{item.description}</p>
        <div className='price-addtocart-button'>
        <p className="collection-price">${item.price}</p>
        
        {children} {/* Render children elements, such as the button */}
      </div>
      </div>
    </div>
  );
};

export default CollectionsCard;