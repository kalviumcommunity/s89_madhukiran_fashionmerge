import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useWardrobeStore } from './wardrobeStore';
import { Plus, X, Filter, RefreshCw } from 'lucide-react';
import { UPLOAD_ENDPOINTS } from '../config/api';
import './wardrobe.css';

const CATEGORIES = ['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories', 'other'];
const SEASONS = ['spring', 'summer', 'fall', 'winter', 'all'];

const Wardrobe = () => {
  const { t } = useTranslation();

  // State for the form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');
  const [color, setColor] = useState('');
  const [season, setSeason] = useState('all');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoggedIn, setIsLoggedIn] = useState(!!userId && !!token);
  const [filter, setFilter] = useState({ category: '', season: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get wardrobe store functions
  const {
    wardrobe,
    addItemAndSave,
    removeItemAndSave,
    loadWardrobeFromServer
  } = useWardrobeStore();

  // Check login status on component mount and when localStorage changes
  useEffect(() => {
    const checkLoginStatus = () => {
      const currentUserId = localStorage.getItem('userId');
      const currentToken = localStorage.getItem('token');
      setUserId(currentUserId);
      setToken(currentToken);
      setIsLoggedIn(!!currentUserId && !!currentToken);
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

  // Load wardrobe from server when logged in
  useEffect(() => {
    const fetchWardrobe = async () => {
      if (!isLoggedIn) {
        console.log('User not logged in, skipping wardrobe fetch');
        return;
      }

      setIsLoading(true);
      try {
        await loadWardrobeFromServer(userId, token);
        console.log('Wardrobe loaded successfully');
      } catch (error) {
        console.error('Error loading wardrobe:', error);
        setError(t('wardrobe.messages.loadError'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchWardrobe();
  }, [isLoggedIn, userId, token, loadWardrobeFromServer, t]);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPEG, etc.)');
      return;
    }

    // Limit file size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setSelectedFile(file);

    // Create preview for the selected image
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(file);

    // Clear any previous errors
    setError(null);
  };

  // Upload image to Cloudinary
  const uploadImageToCloudinary = async (file) => {
    if (!file) return null;

    console.log('Preparing to upload file:', file.name, file.type, file.size);

    const formData = new FormData();
    formData.append('image', file);

    try {
      console.log('Sending upload request to server...');
      const response = await fetch(UPLOAD_ENDPOINTS.UPLOAD_IMAGE, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      console.log('Server response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response from server:', errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { msg: 'Unknown server error' ,e};
        }

        throw new Error(errorData.msg || 'Failed to upload image');
      }

      const data = await response.json();
      console.log('Upload successful, received URL:', data.imageUrl);
      return data.imageUrl;
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      throw error;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!name.trim()) {
      setError(t('wardrobe.messages.nameRequired'));
      return;
    }

    if (!selectedFile && !previewUrl) {
      setError(t('wardrobe.messages.imageRequired'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let imageUrl;

      // Try to upload to server if logged in
      if (isLoggedIn && selectedFile) {
        try {
          imageUrl = await uploadImageToCloudinary(selectedFile);
        } catch (uploadError) {
          console.error('Error uploading to Cloudinary, using local preview instead:', uploadError);
          // Fallback to local preview URL if upload fails
          imageUrl = previewUrl;
        }
      } else {
        // For non-logged in users or if no new file is selected, use the preview URL
        imageUrl = previewUrl;
      }

      if (!imageUrl) {
        throw new Error('Failed to process image');
      }

      // Create new wardrobe item
      const newItem = {
        name,
        description,
        category,
        color,
        season,
        imageUrl,
        dateAdded: new Date()
      };

      // Add to wardrobe store and save to server if logged in
      await addItemAndSave(newItem, userId, token);

      // Reset form
      setName('');
      setDescription('');
      setCategory('other');
      setColor('');
      setSeason('all');
      setSelectedFile(null);
      setPreviewUrl('');

      // Show success message
      setSuccessMessage(t('wardrobe.messages.addSuccess'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error adding wardrobe item:', error);
      setError(t('wardrobe.messages.addError'));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle item deletion
  const handleDelete = async (index) => {
    if (window.confirm(t('wardrobe.messages.removeConfirm'))) {
      setIsLoading(true);
      try {
        await removeItemAndSave(index, userId, token);
        setSuccessMessage(t('wardrobe.messages.removeSuccess'));
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Error removing wardrobe item:', error);
        setError(t('wardrobe.messages.removeError'));
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Filter wardrobe items
  const filteredWardrobe = wardrobe.filter(item => {
    return (
      (!filter.category || item.category === filter.category) &&
      (!filter.season || item.season === filter.season)
    );
  });

  // Function to open modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Function to close modal
  const closeModal = () => {
    setIsModalOpen(false);
    // Reset form when closing modal
    setName('');
    setDescription('');
    setCategory('other');
    setColor('');
    setSeason('all');
    setSelectedFile(null);
    setPreviewUrl('');
    setError(null);
  };

  // Modified submit handler to close modal on success
  const handleModalSubmit = async (e) => {
    await handleSubmit(e);
    if (!error) {
      closeModal();
    }
  };

  return (
    <div className="wardrobe-container">
      <h1>{t('wardrobe.title')}</h1>

      {/* Wardrobe Items */}
      <div className="wardrobe-items-container">
        {/* Filters */}
        <div className="wardrobe-filters">
          <Filter size={18} color="#4a90e2" />

          <div className="filter-group">
            <label htmlFor="category-filter">{t('wardrobe.filters.category')}</label>
            <select
              id="category-filter"
              value={filter.category}
              onChange={(e) => setFilter({...filter, category: e.target.value})}
            >
              <option value="">{t('wardrobe.categories.allCategories')}</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {t(`wardrobe.categories.${cat}`)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="season-filter">{t('wardrobe.filters.season')}</label>
            <select
              id="season-filter"
              value={filter.season}
              onChange={(e) => setFilter({...filter, season: e.target.value})}
            >
              <option value="">{t('wardrobe.seasons.allSeasons')}</option>
              {SEASONS.map(s => (
                <option key={s} value={s}>
                  {t(`wardrobe.seasons.${s}`)}
                </option>
              ))}
            </select>
          </div>

          <button
            className="clear-filters-button"
            onClick={() => setFilter({ category: '', season: '' })}
          >
            <RefreshCw size={16} />
            {t('wardrobe.filters.resetFilters')}
          </button>
        </div>

        {successMessage && <div className="success-message">{successMessage}</div>}

        {isLoading && !isModalOpen && <div className="loading">{t('wardrobe.loading')}</div>}

        <div className="wardrobe-grid">
          {/* Add Item Button */}
          <div className="wardrobe-item add-item-button" onClick={openModal}>
            <div className="add-item-content">
              <Plus size={40} />
              <p>{t('wardrobe.addItem')}</p>
            </div>
          </div>

          {/* Wardrobe Items */}
          {filteredWardrobe.map((item, index) => (
            <div key={index} className="wardrobe-item">
              <div className="wardrobe-item-image">
                <img src={item.imageUrl} alt={item.name} />
              </div>
              <div className="wardrobe-item-details">
                <h3>{item.name}</h3>
                {item.description && <p>{item.description}</p>}
                <div className="wardrobe-item-meta">
                  {item.category && (
                    <span className="category">
                      {t(`wardrobe.categories.${item.category}`)}
                    </span>
                  )}
                  {item.color && (
                    <span className="color">
                      {item.color.charAt(0).toUpperCase() + item.color.slice(1)}
                    </span>
                  )}
                  {item.season && (
                    <span className="season">
                      {t(`wardrobe.seasons.${item.season}`)}
                    </span>
                  )}
                </div>
                <button
                  className="delete-button"
                  onClick={() => handleDelete(index)}
                  disabled={isLoading}
                >
                  {t('wardrobe.actions.remove')}
                </button>
              </div>
            </div>
          ))}

          {!isLoading && filteredWardrobe.length === 0 && !isModalOpen && (
            <div className="empty-wardrobe-message">
              <p>{t('wardrobe.emptyMessage')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Add Item Form */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <button className="close-button" onClick={closeModal}>
                <X size={40} />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="wardrobe-form">
              <div className="form-group">
                <label htmlFor="name" data-required="*">{t('wardrobe.form.name')}</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('wardrobe.form.namePlaceholder')}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">{t('wardrobe.form.description')}</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('wardrobe.form.descriptionPlaceholder')}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">{t('wardrobe.form.category')}</label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {t(`wardrobe.categories.${cat}`)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="color">{t('wardrobe.form.color')}</label>
                  <input
                    type="text"
                    id="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder={t('wardrobe.form.colorPlaceholder')}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="season">{t('wardrobe.form.season')}</label>
                  <select
                    id="season"
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                  >
                    {SEASONS.map(s => (
                      <option key={s} value={s}>
                        {t(`wardrobe.seasons.${s}`)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group image-upload-container">
                <label htmlFor="image" data-required="*">{t('wardrobe.form.image')}</label>
                {previewUrl ? (
                  <div className="image-preview-container">
                    <div className="image-preview">
                      <img src={previewUrl} alt="Preview" />
                    </div>
                    <div className="image-actions">
                      <button
                        type="button"
                        className="upload-new-button"
                        onClick={() => document.getElementById('image').click()}
                      >
                        {t('wardrobe.form.changeImage')}
                      </button>
                      <button
                        type="button"
                        className="remove-image-button"
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl('');
                        }}
                      >
                        {t('wardrobe.form.removeImage')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="upload-button-container">
                    <button
                      type="button"
                      className="upload-button"
                      onClick={() => document.getElementById('image').click()}
                    >
                      <Plus size={20} />
                      {t('wardrobe.form.uploadImage')}
                    </button>
                    <p className="upload-hint">{t('wardrobe.form.uploadHint')}</p>
                  </div>
                )}
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input hidden"
                  required={!previewUrl}
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeModal}
                >
                  {t('wardrobe.form.cancel')}
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={isLoading}
                >
                  {isLoading ? t('wardrobe.form.adding') : t('wardrobe.form.addToWardrobe')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wardrobe;