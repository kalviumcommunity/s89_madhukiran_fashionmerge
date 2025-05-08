import React from 'react';
import { Heart } from 'lucide-react';
import { useWishlistStore } from './wishlistStore';
import './CollectionsCard.css';

const CollectionsCard = ({ item, onClick, children, onWishlistClick }) => {
  const { items: wishlistItems } = useWishlistStore();
  const isWishlisted = wishlistItems.some((i) => i.id === item.id);

  const handleWishlistClick = (e) => {
    e.stopPropagation(); // Prevent card click
    if (onWishlistClick) {
      onWishlistClick(e, item);
    }
  };

  return (
    <div className="collection-card" onClick={onClick}>
      <div className="collection-image-container">
        <img src={item.image} alt={item.name} className="collection-image" />
        <button
          className={`wishlist-button-card ${isWishlisted ? 'wishlisted' : ''}`}
          onClick={handleWishlistClick}
        >
          <Heart size={18} fill={isWishlisted ? "#e64980" : "none"} />
        </button>
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