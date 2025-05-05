import React, { useState } from 'react';
import { X, Heart, Minus, Plus, ShoppingCart } from 'lucide-react';
import './CollectionsPage.css';

// Removed TypeScript interfaces and type annotations

const CollectionModal = ({ item, onClose }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(item.details.size[0]);
  const [selectedColor, setSelectedColor] = useState(item.details.color[0]);
  const [showConfirmation, setShowConfirmation] = useState(null);

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= item.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    showConfirmationMessage(isWishlisted ? 'Removed from wishlist!' : 'Added to wishlist!');
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    showConfirmationMessage('Added to cart!');
  };

  const showConfirmationMessage = (message) => {
    setShowConfirmation(message);
    setTimeout(() => setShowConfirmation(null), 2000);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const totalPrice = (item.price * quantity).toFixed(2);

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="collection-modal">
        <button className="close-modal" onClick={onClose}>
          <X size={24} />
        </button>
        
        <div className="modal-content">
          <div className="modal-image-container">
            <img src={item.image} alt={item.name} className="modal-image" />
          </div>
          
          <div className="modal-info">
            <h2 className="modal-title">{item.name}</h2>
            <p className="modal-description">{item.description}</p>
            
            <div className="modal-details">
              <h3>Product Details</h3>
              <p><strong>Material:</strong> {item.details.material}</p>
              <p><strong>Care:</strong> {item.details.care}</p>
            </div>

            <div className="modal-options">
              <div className="option-group">
                <label>Size</label>
                <div className="size-options">
                  {item.details.size.map((size) => (
                    <button
                      key={size}
                      className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="option-group">
                <label>Color</label>
                <div className="color-options">
                  {item.details.color.map((color) => (
                    <button
                      key={color}
                      className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                    >
                      <span className="sr-only">{color}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="quantity-selector">
                <label>Quantity</label>
                <div className="quantity-controls">
                  <button 
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="quantity-btn"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="quantity-display">{quantity}</span>
                  <button 
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= item.stock}
                    className="quantity-btn"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="modal-price-section">
              <div className="price-details">
                <span className="price-per-item">${item.price} per item</span>
                <span className="total-price">Total: ${totalPrice}</span>
              </div>
              <span className="stock-info">
                {item.stock} items in stock
              </span>
            </div>

            <div className="modal-actions">
              <button className="buy-button" onClick={handleAddToCart}>
                <ShoppingCart size={20} />
                Add to Cart
              </button>
              
              <button 
                className={`wishlist-button ${isWishlisted ? 'wishlisted' : ''}`} 
                onClick={handleWishlistToggle}
              >
                <Heart size={20} fill={isWishlisted ? "#f43f5e" : "none"} />
                <span>{isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}</span>
              </button>
            </div>
            
            {showConfirmation && (
              <div className="confirmation-message">
                {showConfirmation}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionModal;