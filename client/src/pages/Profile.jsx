import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ShoppingBag, Heart, Upload, Edit, LogOut } from 'lucide-react';
import './Profile.css';

function Profile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoggedIn, setIsLoggedIn] = useState(!!userId && !!token);
  const [purchases, setPurchases] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  const fileInputRef = useRef(null);

  const navigate = useNavigate();

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

  // Function to ensure user data is properly initialized
  const ensureUserDataInitialized = useCallback(async (userData) => {
    try {
      let needsUpdate = false;
      const updatedData = { ...userData };

      // Check if any required arrays are missing and initialize them
      if (!updatedData.cartItems) {
        updatedData.cartItems = [];
        needsUpdate = true;
      }

      if (!updatedData.wishlistItems) {
        updatedData.wishlistItems = [];
        needsUpdate = true;
      }

      if (!updatedData.chatbotHistory) {
        updatedData.chatbotHistory = [];
        needsUpdate = true;
      }

      if (!updatedData.wardrobe) {
        updatedData.wardrobe = [];
        needsUpdate = true;
      }

      // If any data was missing, update the user profile
      if (needsUpdate) {
        console.log('Initializing missing user data arrays');

        const updateResponse = await fetch(`http://localhost:5000/user-activity/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            cartItems: updatedData.cartItems,
            wishlistItems: updatedData.wishlistItems,
            chatbotHistory: updatedData.chatbotHistory,
            wardrobe: updatedData.wardrobe
          })
        });

        if (!updateResponse.ok) {
          console.error('Failed to initialize user data');
        }
      }

      return updatedData;
    } catch (err) {
      console.error('Error initializing user data:', err);
      return userData;
    }
  }, [userId, token]);

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isLoggedIn) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch user profile data
        const profileResponse = await fetch(`http://localhost:5000/userprofile/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!profileResponse.ok) {
          throw new Error(`Failed to fetch user profile: ${profileResponse.status}`);
        }

        const profileData = await profileResponse.json();

        // Fetch user activity data (cart, wishlist, etc.)
        const activityResponse = await fetch(`http://localhost:5000/user-activity/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!activityResponse.ok) {
          throw new Error(`Failed to fetch user activity: ${activityResponse.status}`);
        }

        const activityData = await activityResponse.json();

        // Combine the data
        let combinedData = {
          ...profileData.data,
          ...activityData.data
        };

        // Ensure all required data arrays are initialized
        combinedData = await ensureUserDataInitialized(combinedData);

        setUserData(combinedData);
        setEditedUsername(combinedData.username || '');
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isLoggedIn, userId, token, ensureUserDataInitialized]);

  // Fetch purchase history
  useEffect(() => {
    const fetchPurchases = async () => {
      if (!isLoggedIn) {
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/purchases/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch purchases: ${response.status}`);
        }

        const result = await response.json();
        setPurchases(result.data || []);
      } catch (err) {
        console.error('Error fetching purchases:', err);
      }
    };

    fetchPurchases();
  }, [isLoggedIn, userId, token]);

  // Handle file selection for profile image
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file (PNG, JPEG, etc.)');
      return;
    }

    // Limit file size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size should be less than 5MB');
      return;
    }

    setSelectedFile(file);

    // Create preview for the selected image
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(file);

    // Clear any previous errors
    setUploadError(null);
  };

  // Upload profile image to Cloudinary
  const uploadProfileImage = async () => {
    if (!selectedFile) return;

    setUploadLoading(true);
    setUploadError(null);
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await fetch('http://localhost:5000/api/upload/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to upload image');
      }

      const data = await response.json();

      // Update user profile with new image URL
      const updateResponse = await fetch(`http://localhost:5000/update-profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          profileImage: data.imageUrl
        })
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update profile with new image');
      }

      // Update local state
      setUserData(prev => ({
        ...prev,
        profileImage: data.imageUrl
      }));

      setUploadSuccess(true);
      setSelectedFile(null);

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading profile image:', error);
      setUploadError(error.message || 'Failed to upload image');
    } finally {
      setUploadLoading(false);
    }
  };

  // Handle username update
  const updateUsername = async () => {
    if (!editedUsername.trim()) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/update-profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          username: editedUsername
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update username');
      }

      // Update local state
      setUserData(prev => ({
        ...prev,
        username: editedUsername
      }));

      setEditMode(false);
    } catch (error) {
      console.error('Error updating username:', error);
      setError(error.message);
    }
  };

  // Cancel edit mode
  const cancelEdit = () => {
    setEditedUsername(userData?.username || '');
    setEditMode(false);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    navigate('/login');
  };

  if (!isLoggedIn) {
    return (
      <div className="profile-container">
        <div className="login-prompt">
          <h2>Please log in to view your profile</h2>
          <button className="login-button" onClick={() => navigate('/login')}>
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {loading ? (
        <div className="loading">Loading your profile...</div>
      ) : error ? (
        <div className="error">Error: {error}</div>
      ) : userData ? (
        <>
          <div className="profile-header">
            <div className="profile-avatar-container">
              <div className="profile-avatar">
                {userData.profileImage ? (
                  <img src={userData.profileImage} alt="Profile" />
                ) : previewUrl ? (
                  <img src={previewUrl} alt="Profile Preview" />
                ) : (
                  <User size={60} />
                )}
              </div>

              <div className="profile-actions">
                <input
                  type="file"
                  id="profile-image"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input"
                />
                <button
                  className="upload-button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload profile picture"
                >
                  <Upload size={16} />
                </button>
              </div>

              {selectedFile && (
                <div className="upload-actions">
                  <button
                    className="save-upload-button"
                    onClick={uploadProfileImage}
                    disabled={uploadLoading}
                  >
                    {uploadLoading ? 'Uploading...' : 'Save'}
                  </button>
                  <button
                    className="cancel-upload-button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    disabled={uploadLoading}
                  >
                    Cancel
                  </button>
                </div>
              )}
              {uploadSuccess && (
                <div className="upload-success">Profile picture updated successfully!</div>
              )}
              {uploadError && (
                <div className="upload-error">{uploadError}</div>
              )}
            </div>

            <div className="profile-info">
              <div className="username-container">
                {editMode ? (
                  <div className="edit-username">
                    <input
                      type="text"
                      value={editedUsername}
                      onChange={(e) => setEditedUsername(e.target.value)}
                      className="username-input"
                    />
                    <div className="edit-actions">
                      <button className="save-button" onClick={updateUsername}>
                        Save
                      </button>
                      <button className="cancel-button" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <h1 className="username">
                    {userData.username}
                    <button className="edit-button" onClick={() => setEditMode(true)}>
                      <Edit size={16} />
                    </button>
                  </h1>
                )}
              </div>
              <p className="email">{userData.email}</p>

              <button className="logout-button" onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>

          <div className="profile-tabs">
            <button
              className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button
              className={`tab-button ${activeTab === 'wishlist' ? 'active' : ''}`}
              onClick={() => setActiveTab('wishlist')}
            >
              Wishlist ({userData.wishlistItems?.length || 0})
            </button>
            <button
              className={`tab-button ${activeTab === 'cart' ? 'active' : ''}`}
              onClick={() => setActiveTab('cart')}
            >
              Cart ({userData.cartItems?.length || 0})
            </button>
            <button
              className={`tab-button ${activeTab === 'purchases' ? 'active' : ''}`}
              onClick={() => setActiveTab('purchases')}
            >
              Purchases ({purchases.length})
            </button>
            <button
              className={`tab-button ${activeTab === 'wardrobe' ? 'active' : ''}`}
              onClick={() => setActiveTab('wardrobe')}
            >
              Wardrobe ({userData.wardrobe?.length || 0})
            </button>
          </div>

          <div className="profile-content">
            {activeTab === 'profile' && (
              <div className="profile-summary">
                <div className="summary-card">
                  <Heart className="summary-icon" />
                  <div className="summary-info">
                    <h3>Wishlist Items</h3>
                    <p>{userData.wishlistItems?.length || 0}</p>
                  </div>
                </div>

                <div className="summary-card">
                  <ShoppingBag className="summary-icon" />
                  <div className="summary-info">
                    <h3>Purchases</h3>
                    <p>{purchases.length}</p>
                  </div>
                </div>

                <div className="summary-card">
                  <User className="summary-icon" />
                  <div className="summary-info">
                    <h3>Wardrobe Items</h3>
                    <p>{userData.wardrobe?.length || 0}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="wishlist-items">
                {userData.wishlistItems?.length > 0 ? (
                  <div className="items-grid">
                    {userData.wishlistItems.map((item, index) => (
                      <div key={index} className="item-card">
                        <img src={item.image} alt={item.name} className="item-image" />
                        <div className="item-info">
                          <h3>{item.name}</h3>
                          <p className="item-price">${item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <Heart size={48} />
                    <h3>Your wishlist is empty</h3>
                    <button className="action-button" onClick={() => navigate('/collections')}>
                      Browse Collections
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'cart' && (
              <div className="cart-items">
                {userData.cartItems?.length > 0 ? (
                  <div className="items-grid">
                    {userData.cartItems.map((item, index) => (
                      <div key={index} className="item-card">
                        <img src={item.image} alt={item.name} className="item-image" />
                        <div className="item-info">
                          <h3>{item.name}</h3>
                          <p className="item-price">${item.price}</p>
                          <p className="item-quantity">Quantity: {item.quantity}</p>
                          {item.size && <p className="item-size">Size: {item.size}</p>}
                          {item.color && <p className="item-color">Color: {item.color}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <ShoppingBag size={48} />
                    <h3>Your cart is empty</h3>
                    <button className="action-button" onClick={() => navigate('/collections')}>
                      Shop Now
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'purchases' && (
              <div className="purchases-list">
                {purchases.length > 0 ? (
                  <div className="purchases-grid">
                    {purchases.map((purchase) => (
                      <div key={purchase._id} className="purchase-card">
                        <div className="purchase-header">
                          <div className="purchase-date">
                            {new Date(purchase.orderDate).toLocaleDateString()}
                          </div>
                          <div className="purchase-total">
                            ${purchase.totalAmount.toFixed(2)}
                          </div>
                        </div>
                        <div className="purchase-items">
                          {purchase.products.slice(0, 3).map((product, index) => (
                            <img
                              key={index}
                              src={product.image}
                              alt={product.name}
                              className="purchase-item-image"
                            />
                          ))}
                          {purchase.products.length > 3 && (
                            <div className="more-items">+{purchase.products.length - 3}</div>
                          )}
                        </div>
                        <div className="purchase-status">
                          Status: {purchase.orderStatus}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <ShoppingBag size={48} />
                    <h3>No purchases yet</h3>
                    <button className="action-button" onClick={() => navigate('/collections')}>
                      Shop Now
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'wardrobe' && (
              <div className="wardrobe-items">
                {userData.wardrobe?.length > 0 ? (
                  <div className="items-grid">
                    {userData.wardrobe.map((item, index) => (
                      <div key={index} className="item-card">
                        <img src={item.imageUrl} alt={item.name} className="item-image" />
                        <div className="item-info">
                          <h3>{item.name}</h3>
                          <p className="item-category">{item.category}</p>
                          {item.color && <p className="item-color">Color: {item.color}</p>}
                          {item.season && <p className="item-season">Season: {item.season}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <User size={48} />
                    <h3>Your wardrobe is empty</h3>
                    <button className="action-button" onClick={() => navigate('/wardrobe')}>
                      Add Items
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="error">No user data found</div>
      )}
    </div>
  );
}

export default Profile;
