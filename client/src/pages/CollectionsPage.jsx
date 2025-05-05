import CollectionCard from './CollectionsCard';
import Navbar from '../components/NavBar'
import { collections } from './collections';
import React, { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import CollectionModal from './CollectionsModal';
import './CollectionsPage.css';

const CollectionsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [scrolled, setScrolled] = useState(true);

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

  return (
    <div className={`collections-container ${scrolled ? 'scrolled' : ''}`}>
      {/* Remove this line if Navbar is included in a higher-level component */}
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
          />
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