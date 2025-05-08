import CollectionCard from './CollectionsCard';
import { collections } from './collections';
import React, { useState, useEffect } from 'react';
import { Filter, ShoppingCart, Heart } from 'lucide-react';
import CollectionModal from './CollectionsModal';
import { useCartStore } from './cartStore';
import { useWishlistStore } from './wishlistStore';
import AddToCartNotification from '../components/AddToCartNotification';
import WishlistNotification from '../components/WishlistNotification';
import './CollectionsPage.css';
import './AddToCartNotification.css';
import './WishlistNotification.css';

const CollectionsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [scrolled, setScrolled] = useState(true);
  const [cartNotification, setCartNotification] = useState(null);
  const [wishlistNotification, setWishlistNotification] = useState(null);
  const [isWishlistRemoval, setIsWishlistRemoval] = useState(false);
  const { addItem } = useCartStore();
  const { items: wishlistItems, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const viewportHeight = 100;
      setScrolled(scrollTop > viewportHeight);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const categories = [...new Set(collections.map(collection => collection.category))];

  const toggleFilterMenu = () => {
    setShowFilterMenu(!showFilterMenu);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowFilterMenu(false);
  };

  const filteredCollections = collections.find(collection =>
    collection.category === selectedCategory
  )?.items || collections.find(collection => collection.category === "All")?.items || [];

  const openCollectionModal = (item) => {
    setSelectedItem(item);
  };

  const closeModal = () => {
    setSelectedItem(null);
  };

  // Function to handle adding items to the cart
  const handleAddToCart = (e, item) => {
    e.stopPropagation(); // Prevent opening the modal

    // Add default size and color
    const itemToAdd = {
      ...item,
      quantity: 1,
      size: item.details?.size[0] || 'Default',
      color: item.details?.color[0] || 'Default',
    };

    // Add to cart
    addItem(itemToAdd);

    // Show notification
    setCartNotification(itemToAdd);

    // Log for debugging
    console.log(`Added ${item.name} to cart`);
  };

  // Function to handle adding items to the wishlist
  const handleAddToWishlist = (e, item) => {
    e.stopPropagation(); // Prevent opening the modal

    const isItemInWishlist = wishlistItems.some(i => i.id === item.id);

    if (isItemInWishlist) {
      // Remove from wishlist
      removeFromWishlist(item.id);
      setIsWishlistRemoval(true);
      setWishlistNotification(item);
      console.log(`Removed ${item.name} from wishlist`);
    } else {
      // Add to wishlist
      addToWishlist(item);
      setIsWishlistRemoval(false);
      setWishlistNotification(item);
      console.log(`Added ${item.name} to wishlist`);
    }
  };

  // Function to close the cart notification
  const closeCartNotification = () => {
    setCartNotification(null);
  };

  // Function to close the wishlist notification
  const closeWishlistNotification = () => {
    setWishlistNotification(null);
  };

  return (
    <div className={`collections-container ${scrolled ? 'scrolled' : ''}`}>
      {/* Notifications Container */}
      <div style={{ position: 'fixed', top: '120px', right: '20px', zIndex: 9999 }}>
        {/* Cart Notification */}
        <div className="cart-notification-container">
          {cartNotification && (
            <AddToCartNotification
              item={cartNotification}
              onClose={closeCartNotification}
            />
          )}
        </div>

        {/* Wishlist Notification */}
        <div className="wishlist-notification-container">
          {wishlistNotification && (
            <WishlistNotification
              item={wishlistNotification}
              onClose={closeWishlistNotification}
              isRemoved={isWishlistRemoval}
            />
          )}
        </div>
      </div>

      {/* <Navbar scrolled={scrolled} /> */}
      <div className="collections-header">
        <h1>FashionMerge Collections</h1>
        <div className="filter-container">
          <button
            className="filter-button"
            onClick={toggleFilterMenu}
            aria-label="Filter collections"
          >
            <Filter size={24} />
            <span>Filter</span>
          </button>

          {showFilterMenu && (
            <div className="filter-menu">
              {categories.map(category => (
                <button
                  key={category}
                  className={`filter-option ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="category-indicator">
        <h2>{selectedCategory}</h2>
      </div>

      <div className="collections-grid">
        {filteredCollections.map(item => (
          <CollectionCard
            key={item.id}
            item={item}
            onClick={() => openCollectionModal(item)}
            onWishlistClick={handleAddToWishlist}
          >
            <button
              className="add-to-cart-button"
              onClick={(e) => handleAddToCart(e, item)}
            >
              Add to Cart
            </button>
          </CollectionCard>
        ))}
      </div>

      {selectedItem && (
        <CollectionModal
          item={selectedItem}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default CollectionsPage;