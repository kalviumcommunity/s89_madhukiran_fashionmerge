import CollectionCard from './CollectionsCard';
import { collections } from './collections';
import React, { useState, useEffect,  } from 'react';
import { Filter, ShoppingCart, Heart, Search } from 'lucide-react';
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
  const filterContainerRef = React.useRef(null);
  const [isMenuHovered, setIsMenuHovered] = useState(false);
  const [scrolled, setScrolled] = useState(true);
  const [cartNotification, setCartNotification] = useState(null);
  const [wishlistNotification, setWishlistNotification] = useState(null);
  const [isWishlistRemoval, setIsWishlistRemoval] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
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

  // Mouse enter handler for filter container
  const handleFilterMouseEnter = () => {
    setShowFilterMenu(true);
  };

  // Mouse enter handler for the filter menu
  const handleMenuMouseEnter = () => {
    setIsMenuHovered(true);
  };

  // Mouse leave handler for the filter menu
  const handleMenuMouseLeave = () => {
    setIsMenuHovered(false);
  };

  // Mouse leave handler for filter container with a longer delay
  const handleFilterMouseLeave = () => {
    // Longer delay to give time to move to the menu and select an option
    setTimeout(() => {
      // Only close the menu if it's not being hovered
      if (!isMenuHovered) {
        setShowFilterMenu(false);
      }
    }, 1000); // 1 second delay
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowFilterMenu(false);
  };

  // Immediate search implementation (no debounce)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    // Update search term immediately for better responsiveness
    setDebouncedSearchTerm(searchQuery);
    setIsSearching(!!searchQuery.trim());
  }, [searchQuery]);

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    // Focus is already handled by the input change
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setDebouncedSearchTerm("");
    setIsSearching(false);
  };

  // Get base collection items based on selected category
  const categoryItems = collections.find(collection =>
    collection.category === selectedCategory
  )?.items || collections.find(collection => collection.category === "All")?.items || [];

  // Apply search filter if there's a search query
  const filteredCollections = debouncedSearchTerm.trim()
    ? categoryItems.filter(item => {
        const query = debouncedSearchTerm.toLowerCase().trim();

        // Check if query exactly matches a category name
        const categories = ["accessories", "men's clothing", "women's clothing", "maison"];
        if (categories.includes(query)) {
          // For "accessories" search
          if (query === "accessories") {
            return item.subcategory && ["watches", "belts", "hats", "sunglasses", "jewelry", "bags"].includes(item.subcategory);
          }

          // For "men's clothing" search
          if (query === "men's clothing") {
            return item.gender === "men";
          }

          // For "women's clothing" search
          if (query === "women's clothing") {
            return item.gender === "women";
          }

          // For "maison" search
          if (query === "maison") {
            return item.subcategory && ["decor", "bedding", "kitchenware", "furniture"].includes(item.subcategory);
          }
        }

        // Check if query matches gender
        if (query === 'men' || query === "men's" || query === 'mens') {
          return item.gender === 'men';
        }

        if (query === 'women' || query === "women's" || query === 'womens') {
          return item.gender === 'women';
        }

        // Check for accessory types
        if (query === 'accessory' || query === 'accessories') {
          return item.subcategory && ["watches", "belts", "hats", "sunglasses", "jewelry", "bags"].includes(item.subcategory);
        }

        // Check if query matches subcategory
        if (item.subcategory && item.subcategory.toLowerCase().includes(query)) {
          return true;
        }

        // Check if query matches name
        if (item.name.toLowerCase().includes(query)) {
          return true;
        }

        // Check for combined gender + category searches
        if (query.includes('men') && item.gender === 'men') {
          // For queries like "men's shirts", "men jackets", etc.
          const categoryPart = query.replace(/men['s]*\s*/i, '').trim();
          if (categoryPart && item.subcategory && item.subcategory.toLowerCase().includes(categoryPart)) {
            return true;
          }
        }

        if (query.includes('women') && item.gender === 'women') {
          // For queries like "women's dresses", "women tops", etc.
          const categoryPart = query.replace(/women['s]*\s*/i, '').trim();
          if (categoryPart && item.subcategory && item.subcategory.toLowerCase().includes(categoryPart)) {
            return true;
          }
        }

        return false;
      })
    : categoryItems;

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
        <div
          className="filter-container"
          ref={filterContainerRef}
          onMouseEnter={handleFilterMouseEnter}
          onMouseLeave={handleFilterMouseLeave}
        >
          <button
            className="filter-button"
            aria-label="Filter collections"
          >
            <Filter size={24} />
            <span>Filter</span>
          </button>

          {showFilterMenu && (
            <div
              className="filter-menu"
              onMouseEnter={handleMenuMouseEnter}
              onMouseLeave={handleMenuMouseLeave}
            >
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
        <h2>
          {isSearching ? (
            <>
              <Search size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Search Results
            </>
          ) : (
            selectedCategory
          )}
        </h2>

        {/* Search input */}
        <div className={`search-container ${isSearching ? 'active-search' : ''}`}>
          <form onSubmit={handleSearch}>
            <input
              type="text"
              className="search-input"
              placeholder="Search men, women, accessories..."
              value={searchQuery}
              onChange={handleSearchChange}
              autoFocus
            />
            <button type="submit" className="search-button" aria-label="Search">
              <Search size={18} />
            </button>
          </form>
          {searchQuery && (
            <button className="clear-search" onClick={clearSearch}>
              ×
            </button>
          )}
          {isSearching && filteredCollections.length > 0 && (
            <div className="search-results-count">
              Found {filteredCollections.length} {filteredCollections.length === 1 ? 'product' : 'products'}
              {debouncedSearchTerm && <span className="search-term"> for "{debouncedSearchTerm}"</span>}
            </div>
          )}
        </div>
      </div>

      {filteredCollections.length > 0 ? (
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
      ) : (
        <div className="no-results">
          <p>No products found matching your search criteria.</p>
          {searchQuery && (
            <button className="reset-search" onClick={clearSearch}>
              Clear search and show all products
            </button>
          )}
        </div>
      )}

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