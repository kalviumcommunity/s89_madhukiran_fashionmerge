import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './PollFilters.css';

const PollFilters = ({ filters, onFilterChange }) => {
  const { t } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Handle sort change
  const handleSortChange = (sort) => {
    onFilterChange({ ...filters, sort });
    setIsDropdownOpen(false);
  };
  
  // Handle category change
  const handleCategoryChange = (category) => {
    onFilterChange({ ...filters, category });
    setIsDropdownOpen(false);
  };
  
  // Handle type change
  const handleTypeChange = (type) => {
    onFilterChange({ ...filters, type });
    setIsDropdownOpen(false);
  };
  
  // Toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  // Close dropdown when clicking outside
  const handleClickOutside = (e) => {
    if (!e.target.closest('.poll-filters-dropdown')) {
      setIsDropdownOpen(false);
    }
  };
  
  // Add event listener when dropdown is open
  React.useEffect(() => {
    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isDropdownOpen]);
  
  return (
    <div className="poll-filters">
      <div className="poll-filters-dropdown">
        <button 
          className="poll-filters-button"
          onClick={toggleDropdown}
        >
          {t('polls.filterAndSort')}
          <span className={`poll-filters-arrow ${isDropdownOpen ? 'open' : ''}`}>▼</span>
        </button>
        
        {isDropdownOpen && (
          <div className="poll-filters-menu">
            <div className="poll-filters-section">
              <h4>{t('polls.sortBy')}</h4>
              <ul>
                <li 
                  className={filters.sort === 'recent' ? 'active' : ''}
                  onClick={() => handleSortChange('recent')}
                >
                  {t('polls.sortOptions.recent')}
                </li>
                <li 
                  className={filters.sort === 'popular' ? 'active' : ''}
                  onClick={() => handleSortChange('popular')}
                >
                  {t('polls.sortOptions.popular')}
                </li>
              </ul>
            </div>
            
            <div className="poll-filters-section">
              <h4>{t('polls.filterByCategory')}</h4>
              <ul>
                <li 
                  className={filters.category === 'all' ? 'active' : ''}
                  onClick={() => handleCategoryChange('all')}
                >
                  {t('polls.categories.all')}
                </li>
                <li 
                  className={filters.category === 'outfits' ? 'active' : ''}
                  onClick={() => handleCategoryChange('outfits')}
                >
                  {t('polls.categories.outfits')}
                </li>
                <li 
                  className={filters.category === 'trends' ? 'active' : ''}
                  onClick={() => handleCategoryChange('trends')}
                >
                  {t('polls.categories.trends')}
                </li>
                <li 
                  className={filters.category === 'accessories' ? 'active' : ''}
                  onClick={() => handleCategoryChange('accessories')}
                >
                  {t('polls.categories.accessories')}
                </li>
                <li 
                  className={filters.category === 'colors' ? 'active' : ''}
                  onClick={() => handleCategoryChange('colors')}
                >
                  {t('polls.categories.colors')}
                </li>
                <li 
                  className={filters.category === 'styles' ? 'active' : ''}
                  onClick={() => handleCategoryChange('styles')}
                >
                  {t('polls.categories.styles')}
                </li>
                <li 
                  className={filters.category === 'other' ? 'active' : ''}
                  onClick={() => handleCategoryChange('other')}
                >
                  {t('polls.categories.other')}
                </li>
              </ul>
            </div>
            
            <div className="poll-filters-section">
              <h4>{t('polls.filterByType')}</h4>
              <ul>
                <li 
                  className={filters.type === 'all' ? 'active' : ''}
                  onClick={() => handleTypeChange('all')}
                >
                  {t('polls.types.all')}
                </li>
                <li 
                  className={filters.type === 'visual' ? 'active' : ''}
                  onClick={() => handleTypeChange('visual')}
                >
                  {t('polls.types.visual')}
                </li>
                <li 
                  className={filters.type === 'text' ? 'active' : ''}
                  onClick={() => handleTypeChange('text')}
                >
                  {t('polls.types.text')}
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
      
      <div className="poll-filters-active">
        {filters.sort !== 'recent' && (
          <div className="poll-filter-tag">
            {t(`polls.sortOptions.${filters.sort}`)}
            <button onClick={() => handleSortChange('recent')}>×</button>
          </div>
        )}
        
        {filters.category !== 'all' && (
          <div className="poll-filter-tag">
            {t(`polls.categories.${filters.category}`)}
            <button onClick={() => handleCategoryChange('all')}>×</button>
          </div>
        )}
        
        {filters.type !== 'all' && (
          <div className="poll-filter-tag">
            {t(`polls.types.${filters.type}`)}
            <button onClick={() => handleTypeChange('all')}>×</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PollFilters;
