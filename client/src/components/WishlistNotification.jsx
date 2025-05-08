import React, { useState, useEffect, useRef } from 'react';
import { Heart, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../pages/WishlistNotification.css';

const WishlistNotification = ({ item, onClose, isRemoved = false, autoClose = true, autoCloseTime = 3000 }) => {
  const [isClosing, setIsClosing] = useState(false);
  const timeoutRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (autoClose) {
      timeoutRef.current = setTimeout(() => {
        handleClose();
      }, autoCloseTime);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [autoClose, autoCloseTime]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 500); // Match the animation duration
  };

  const handleViewWishlist = () => {
    navigate('/wishlist');
    handleClose();
  };

  return (
    <div className={`wishlist-notification ${isClosing ? 'closing' : ''} ${isRemoved ? 'removed' : ''}`}>
      <div className="wishlist-notification-icon">
        <Heart size={20} fill={isRemoved ? "none" : "#e64980"} />
      </div>
      <div className="wishlist-notification-content">
        <h3 className="wishlist-notification-title">
          {isRemoved ? 'Removed from Wishlist' : 'Added to Wishlist'}
        </h3>
        <p className="wishlist-notification-message">
          {isRemoved 
            ? `${item.name} has been removed from your wishlist` 
            : `${item.name} has been added to your wishlist`}
        </p>
        <button className="wishlist-notification-action" onClick={handleViewWishlist}>
          View Wishlist
        </button>
      </div>
      <button className="wishlist-notification-close" onClick={handleClose}>
        <X size={16} />
      </button>
      {autoClose && <div className="wishlist-notification-progress"></div>}
    </div>
  );
};

export default WishlistNotification;
