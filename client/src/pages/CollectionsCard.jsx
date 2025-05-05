import React from 'react';
// ... existing code ...

const CollectionCard = ({ item, onClick }) => {
  return (
    <div className="collection-card" onClick={onClick}>
      <div className="collection-image-container">
        <img src={item.image} alt={item.name} className="collection-image" />
      </div>
      <div className="collection-info">
        <h3 className="collection-name">{item.name}</h3>
        <p className="collection-description">{item.description}</p>
        <p className="collection-price">${item.price.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default CollectionCard;