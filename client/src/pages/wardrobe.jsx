import { useState, useEffect } from 'react';
import { useWardrobeStore } from './wardrobeStore';
import { Plus, X, Filter, RefreshCw } from 'lucide-react';
import './wardrobe.css';

const CATEGORIES = ['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories', 'other'];
const SEASONS = ['spring', 'summer', 'fall', 'winter', 'all'];

const Wardrobe = () => {
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
        setError('Failed to load your wardrobe. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWardrobe();
  }, [isLoggedIn, userId, token, loadWardrobeFromServer]);

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
      const response = await fetch('http://localhost:5000/api/upload/upload', {
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
      setError('Please enter a name for your wardrobe item');
      return;
    }

    if (!selectedFile && !previewUrl) {
      setError('Please select an image for your wardrobe item');
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
      setSuccessMessage('Item added to your wardrobe successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error adding wardrobe item:', error);
      setError('Failed to add item to your wardrobe. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle item deletion
  const handleDelete = async (index) => {
    if (window.confirm('Are you sure you want to remove this item from your wardrobe?')) {
      setIsLoading(true);
      try {
        await removeItemAndSave(index, userId, token);
        setSuccessMessage('Item removed from your wardrobe successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Error removing wardrobe item:', error);
        setError('Failed to remove item from your wardrobe. Please try again later.');
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
      <h1>My Virtual Wardrobe</h1>

      {/* Wardrobe Items */}
      <div className="wardrobe-items-container">
        {/* Filters */}
        <div className="wardrobe-filters">
          <Filter size={18} color="#4a90e2" />

          <div className="filter-group">
            <label htmlFor="category-filter">Category:</label>
            <select
              id="category-filter"
              value={filter.category}
              onChange={(e) => setFilter({...filter, category: e.target.value})}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="season-filter">Season:</label>
            <select
              id="season-filter"
              value={filter.season}
              onChange={(e) => setFilter({...filter, season: e.target.value})}
            >
              <option value="">All Seasons</option>
              {SEASONS.map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>

          <button
            className="clear-filters-button"
            onClick={() => setFilter({ category: '', season: '' })}
          >
            <RefreshCw size={16} />
            Reset Filters
          </button>
        </div>

        {successMessage && <div className="success-message">{successMessage}</div>}

        {isLoading && !isModalOpen && <div className="loading">Loading your wardrobe...</div>}

        <div className="wardrobe-grid">
          {/* Add Item Button */}
          <div className="wardrobe-item add-item-button" onClick={openModal}>
            <div className="add-item-content">
              <Plus size={40} />
              <p>Add Item</p>
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
                  {item.category && <span className="category">{item.category}</span>}
                  {item.color && <span className="color">{item.color}</span>}
                  {item.season && <span className="season">{item.season}</span>}
                </div>
                <button
                  className="delete-button"
                  onClick={() => handleDelete(index)}
                  disabled={isLoading}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          {!isLoading && filteredWardrobe.length === 0 && !isModalOpen && (
            <div className="empty-wardrobe-message">
              <p>Your wardrobe is empty. Click the "+" button to add items.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Add Item Form */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Item</h2>
              <button className="close-button" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="wardrobe-form">
              <div className="form-group">
                <label htmlFor="name" data-required="*">Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter item name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description (optional)"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="color">Color</label>
                  <input
                    type="text"
                    id="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="e.g. Blue, Red, Black"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="season">Season</label>
                  <select
                    id="season"
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                  >
                    {SEASONS.map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="image" data-required="*">Image</label>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input"
                  required={!previewUrl}
                />
                {previewUrl && (
                  <div className="image-preview">
                    <img src={previewUrl} alt="Preview" />
                  </div>
                )}
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Adding...' : 'Add to Wardrobe'}
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