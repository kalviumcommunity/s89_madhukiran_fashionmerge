import React, { useState } from 'react';
import { X, Heart, ShoppingCart } from 'lucide-react';
import { useCartStore } from './cartStore';
import { useWishlistStore } from './wishlistStore';
import './CollectionsModal.css';

// Removed TypeScript interfaces and type annotations

function CollectionModal({ item, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(item.details.size[0]);
  const [selectedColor, setSelectedColor] = useState(item.details.color[0]);
  const [showConfirmation, setShowConfirmation] = useState(null);
  const [imageEnlarged, setImageEnlarged] = useState(false);

  const { addItem: addToCart } = useCartStore();
  const { items: wishlistItems, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();

  const isWishlisted = wishlistItems.some((i) => i.id === item.id);

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= item.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(item.id);
      showConfirmationMessage('Removed from wishlist!');
    } else {
      addToWishlist(item);
      showConfirmationMessage('Added to wishlist!');
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart({
      ...item,
      quantity,
      size: selectedSize,
      color: selectedColor,
    });
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
      <div className="square-modal">
        <button className="close-modal" onClick={onClose}>
          <X size={22} />
        </button>

        <div className="modal-header">
          <h2 className="modal-title">{item.name}</h2>
          <div className="product-id">ID: {item.id}</div>
        </div>

        <div className="modal-body">
          <div
            className={`modal-image-wrapper ${imageEnlarged ? 'enlarged' : ''}`}
            onClick={() => setImageEnlarged(!imageEnlarged)}
          >
            <div className="product-badge">Product Image</div>
            <img src={item.image} alt={item.name} className="modal-image" />
            <div className="image-overlay">
              <span className="view-text">{imageEnlarged ? 'Click to shrink' : 'Click to enlarge'}</span>
            </div>
          </div>

          <div className="modal-description-wrapper">
            <p className="modal-description">{item.description}</p>
          </div>

          <div className="modal-details">
            <h3>Product Details</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Material</span>
                <span className="detail-value">{item.details.material}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Care</span>
                <span className="detail-value">{item.details.care}</span>
              </div>
            </div>
          </div>

          <div className="modal-options">
            <div className="options-grid">
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
            </div>

            <div className="quantity-price-row">
              <div className="quantity-selector">
                <label>Quantity</label>
                <div className="quantity-controls">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="quantity-btn"
                  >
                    <span className="quantity-symbol">−</span>
                  </button>
                  <span className="quantity-display">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= item.stock}
                    className="quantity-btn"
                  >
                    <span className="quantity-symbol">+</span>
                  </button>
                </div>
              </div>

              <div className="price-section">
                <span className="total-price">${totalPrice}</span>
                <span className="stock-info">{item.stock} in stock</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="buy-button" onClick={handleAddToCart}>
            <ShoppingCart size={18} />
            Add to Cart
          </button>

          <button
            className={`wishlist-button ${isWishlisted ? 'wishlisted' : ''}`}
            onClick={handleWishlistToggle}
          >
            <Heart size={18} fill={isWishlisted ? "#e64980" : "none"} />
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
  );
}

export default CollectionModal;