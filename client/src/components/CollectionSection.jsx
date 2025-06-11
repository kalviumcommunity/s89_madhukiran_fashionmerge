import React from 'react';
import { useTranslation } from 'react-i18next';
import './CollectionSection.css';

const CollectionSection = () => {
  const { t } = useTranslation();
  const handleViewAllClick = () => {
    window.location.href = '/collections'; // Redirect to the collections page
  };

  const handleItemClick = () => {
    window.location.href = '/collections'; // Redirect to the collections page when clicking on an item
  };

  return (
    <section
      id="collections-section"
      className="collection-section">
      <h2>{t('collections.newCollection')}</h2>
      <div className="collection-grid">
        <div className="collection-item" onClick={handleItemClick}>
          <img src="https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg" alt={t('collections.item1.alt')} />
          <div className="item-info">
            <h3>{t('collections.item1.name')}</h3>
            <p>{t('collections.item1.description')}</p>
          </div>
        </div>
        <div className="collection-item" onClick={handleItemClick}>
          <img src="https://images.pexels.com/photos/248077/pexels-photo-248077.jpeg" alt={t('collections.item2.alt')} />
          <div className="item-info">
            <h3>{t('collections.item2.name')}</h3>
            <p>{t('collections.item2.description')}</p>
          </div>
        </div>
        <div className="collection-item" onClick={handleItemClick}>
          <img src="https://images.pexels.com/photos/266621/pexels-photo-266621.jpeg" alt={t('collections.item3.alt')} />
          <div className="item-info">
            <h3>{t('collections.item3.name')}</h3>
            <p>{t('collections.item3.description')}</p>
          </div>
        </div>
      </div>
      <button className="view-all-btn" onClick={handleViewAllClick}>{t('collections.viewAll')}</button>
    </section>
  );
};

export default CollectionSection;