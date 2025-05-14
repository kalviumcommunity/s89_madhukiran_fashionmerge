import React, { useState, useEffect, useCallback } from 'react';
import { X, ShoppingCart, Loader } from 'lucide-react';
import { useWishlistStore } from './wishlistStore';
import { useCartStore } from './cartStore';
import './Wishlist.css';

function Wishlist() {
  const {
    items,
    removeItem: removeItemFromStore,
    fetchItems,
    isLoading,
    error
  } = useWishlistStore();
  const { addItem } = useCartStore();
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoggedIn, setIsLoggedIn] = useState(!!userId && !!token);

  // Check login status on component mount and when localStorage changes
  useEffect(() => {
    const checkLoginStatus = () => {
      const currentUserId = localStorage.getItem('userId');
      const currentToken = localStorage.getItem('token');
      setUserId(currentUserId);
      setToken(currentToken);
      setIsLoggedIn(!!currentUserId && !!currentToken);

      if (currentUserId && currentToken) {
        console.log('User is logged in with ID:', currentUserId);
      } else {
        console.log('User is not logged in');
      }
    };

    // Check initially
    checkLoginStatus();

    // Set up event listener for storage changes
    window.addEventListener('storage', checkLoginStatus);

    // Clean up
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  // Fetch wishlist items from MongoDB when component mounts or login status changes
  useEffect(() => {
    // Use the fetchItems function from the store
    fetchItems();
  }, [isLoggedIn, userId, token, fetchItems]);

  // Remove item using the store's method which handles MongoDB sync
  const removeItem = useCallback((itemId) => {
    removeItemFromStore(itemId);
  }, [removeItemFromStore]);

  const moveToCart = useCallback((item) => {
    console.log('Moving item from wishlist to cart:', item.name);
    addItem({
      ...item,
      quantity: 1,
      size: item.details?.size[0] || 'Default',
      color: item.details?.color[0] || 'Default',
    });
    removeItem(item.id);
  }, [addItem, removeItem]);

  return (
    <div className="wishlist-container">
      <h1 className="wishlist-title">My Wishlist</h1>

      {isLoading ? (
        <div className="loading-wishlist">
          <Loader className="spinner" size={24} />
          <p>Loading your wishlist...</p>
        </div>
      ) : error ? (
        <div className="error-wishlist">
          <p>Error loading your wishlist: {error}</p>
          <button onClick={fetchItems} className="retry-btn">Retry</button>
        </div>
      ) : items.length === 0 ? (
        <div className="empty-wishlist">
          <p>Your wishlist is empty</p>
        </div>
      ) : (
        <div className="wishlist-items">
          {items.map((item) => (
            <div key={item.id} className="wishlist-item">
              <img src={item.image} alt={item.name} className="wishlist-item-image" />

              <div className="wishlist-item-details">
                <h3 className="wishlist-item-name">{item.name}</h3>
                <p className="wishlist-item-price">${item.price.toFixed(2)}</p>

                <div className="wishlist-item-actions">
                  <button
                    onClick={() => moveToCart(item)}
                    className="move-to-cart-btn"
                  >
                    <ShoppingCart size={16} />
                    Add to Cart
                  </button>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="remove-wishlist-item-btn"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Wishlist;