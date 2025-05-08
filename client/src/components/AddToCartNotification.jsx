import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../pages/AddToCartNotification.css';

const AddToCartNotification = ({ item, onClose, autoClose = true, autoCloseTime = 3000 }) => {
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

  const handleViewCart = () => {
    navigate('/cart');
    handleClose();
  };

  return (
    <div className={`cart-notification ${isClosing ? 'closing' : ''}`}>
      <div className="cart-notification-icon">
        <ShoppingCart size={20} />
      </div>
      <div className="cart-notification-content">
        <h3 className="cart-notification-title">Added to Cart</h3>
        <p className="cart-notification-message">
          {item.name} has been added to your cart
        </p>
        <button className="cart-notification-action" onClick={handleViewCart}>
          View Cart
        </button>
      </div>
      <button className="cart-notification-close" onClick={handleClose}>
        <X size={16} />
      </button>
      {autoClose && <div className="cart-notification-progress"></div>}
    </div>
  );
};

export default AddToCartNotification;
