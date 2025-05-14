import React, { useState, useEffect, useCallback } from 'react';
import { X, ShoppingCart } from 'lucide-react';
import { useWishlistStore } from './wishlistStore';
import { useCartStore } from './cartStore';
import { BASE_URL } from '../config/api';
import './Wishlist.css';

function Wishlist() {
  const { items, removeItem: removeItemFromStore, setItems } = useWishlistStore();
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

  // Fetch wishlist items from server when logged in
  useEffect(() => {
    const fetchUserActivity = async () => {
      try {
        if (!isLoggedIn) {
          console.log('User not logged in, wishlist will be empty');
          setItems([]);
          return;
        }

        console.log('Fetching wishlist items for user:', userId);
        const response = await fetch(`${BASE_URL}/user-activity/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server response:', response.status, errorText);
          throw new Error(`Failed to fetch user activity: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Server response for wishlist items:', result);

        // Update wishlist items with fetched data if available
        if (result.data && result.data.wishlistItems && result.data.wishlistItems.length > 0) {
          console.log('Fetched wishlist items from server:', result.data.wishlistItems);
          setItems(result.data.wishlistItems);
        } else {
          console.log('No wishlist items found on server');
          setItems([]);
        }
      } catch (error) {
        console.error('Error fetching user activity:', error);
        setItems([]);
      }
    };

    fetchUserActivity();
  }, [isLoggedIn, userId, token, setItems]);

  // Save wishlist items to server when they change
  const saveWishlistItems = useCallback(async (items) => {
    try {
      // Skip if user is not logged in
      if (!isLoggedIn) {
        console.log('User not logged in, wishlist not saved');
        return;
      }

      console.log('Saving wishlist items to server for user:', userId);
      const response = await fetch(`${BASE_URL}/user-activity/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ wishlistItems: items }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', response.status, errorText);
        throw new Error(`Failed to save wishlist items: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Wishlist items saved successfully:', result);
    } catch (error) {
      console.error('Error saving wishlist items:', error);
    }
  }, [isLoggedIn, userId, token]);

  // Save wishlist items to server when they change, with debounce
  useEffect(() => {
    // Only save if user is logged in and there are items
    if (isLoggedIn && items.length > 0) {
      // Use a timeout to debounce the save operation
      const saveTimeout = setTimeout(() => {
        console.log('Saving wishlist items to server (debounced):', items.length);
        saveWishlistItems(items);
      }, 500); // 500ms debounce

      // Clear the timeout if the component unmounts or items change again
      return () => clearTimeout(saveTimeout);
    }
  }, [items, isLoggedIn, saveWishlistItems]);

  // Remove item and update MongoDB
  const removeItem = useCallback(async (itemId) => {
    // First remove from local store
    removeItemFromStore(itemId);

    // Then update MongoDB with the updated items list
    if (isLoggedIn) {
      try {
        const updatedItems = items.filter(item => item.id !== itemId);
        await saveWishlistItems(updatedItems);
      } catch (error) {
        console.error('Error updating MongoDB after removing wishlist item:', error);
      }
    }
  }, [isLoggedIn, items, removeItemFromStore, saveWishlistItems]);

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

      {items.length === 0 ? (
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