import CollectionCard from './CollectionsCard';
import { collections } from './collections';
import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Heart, Search, ChevronDown } from 'lucide-react';
import CollectionModal from './CollectionsModal';
import { useCartStore } from './cartStore';
import { useWishlistStore } from './wishlistStore';
import { useTranslation } from 'react-i18next';
import AddToCartNotification from '../components/AddToCartNotification';
import WishlistNotification from '../components/WishlistNotification';
import './CollectionsPage.css';
import './AddToCartNotification.css';
import './WishlistNotification.css';

const CollectionsPage = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);
  const sortDropdownRef = useRef(null);
  const [scrolled, setScrolled] = useState(true);
  const [cartNotification, setCartNotification] = useState(null);
  const [wishlistNotification, setWishlistNotification] = useState(null);
  const [isWishlistRemoval, setIsWishlistRemoval] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
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

  // Handle clicks outside of the sort dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle sort dropdown
  const toggleSortDropdown = () => {
    setShowSortDropdown(prev => !prev);
  };



  const categories = [...new Set(collections.map(collection => collection.category))];

  const handleCategorySelect = (e, category) => {
    e.stopPropagation(); // Prevent event bubbling
    setSelectedCategory(category);
    setShowSortDropdown(false);
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
  let filteredCollections = debouncedSearchTerm.trim()
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

  // Sort by newest (assuming id is related to newness, higher id = newer)
  filteredCollections = [...filteredCollections].sort((a, b) => b.id - a.id);

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
        <h1>{t('collections.title')}</h1>
        <div className="header-controls">
          {/* Filter Dropdown */}
          <div className="sort-container" ref={sortDropdownRef}>
            <div className="sort-label">{t('collections.sortBy')}</div>
            <div className="sort-dropdown-wrapper" onClick={toggleSortDropdown}>
              <button className="sort-button">
                {selectedCategory === "All" ? t('collections.allProducts') :
                 selectedCategory === "Accessories" ? t('collections.accessories') :
                 selectedCategory === "Men's Clothing" ? t('collections.menClothing') :
                 selectedCategory === "Women's Clothing" ? t('collections.womenClothing') :
                 selectedCategory === "Maison" ? t('collections.maison') : selectedCategory}
                <ChevronDown size={16} />
              </button>

              {showSortDropdown && (
                <div className="sort-dropdown-menu">
                  {/* Filter Options */}
                  {categories.map(category => (
                    <div
                      key={category}
                      className={`filter-option ${selectedCategory === category ? 'selected' : ''}`}
                      onClick={(e) => handleCategorySelect(e, category)}
                    >
                      {category === "All" ? t('collections.allProducts') :
                       category === "Accessories" ? t('collections.accessories') :
                       category === "Men's Clothing" ? t('collections.menClothing') :
                       category === "Women's Clothing" ? t('collections.womenClothing') :
                       category === "Maison" ? t('collections.maison') : category}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="category-indicator">
        <h2>
          {isSearching ? (
            <>
              <Search size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              {t('collections.searchResults')}
            </>
          ) : (
            selectedCategory
          )}
        </h2>

        {/* Search input */}
        <div className={`search-container ${isSearching ? 'active-search' : ''}`}>
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-wrapper">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder={t('collections.searchPlaceholder')}
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <button type="submit" className="search-button" aria-label="Search">
              {t('collections.search')}
            </button>
          </form>
          {searchQuery && (
            <button className="clear-search" onClick={clearSearch} title="Clear search">
              ×
            </button>
          )}
          {isSearching && filteredCollections.length > 0 && (
            <div className="search-results-count">
              {t('collections.foundProducts', { count: filteredCollections.length })}
              {debouncedSearchTerm && <span className="search-term"> {t('collections.forSearchTerm', { term: debouncedSearchTerm })}</span>}
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
                {t('product.addToCart')}
              </button>
            </CollectionCard>
          ))}
        </div>
      ) : (
        <div className="no-results">
          <p>{t('collections.noResults')}</p>
          {searchQuery && (
            <button className="reset-search" onClick={clearSearch}>
              {t('collections.clearSearch')}
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