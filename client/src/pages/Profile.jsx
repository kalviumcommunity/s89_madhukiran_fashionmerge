import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ShoppingBag, Heart, Upload, Edit, LogOut, ShoppingCart, Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Profile.css';
import { USER_ENDPOINTS, UPLOAD_ENDPOINTS, PURCHASES_ENDPOINTS, POLLS_ENDPOINTS } from '../config/api';

function Profile() {
  const { t } = useTranslation();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoggedIn, setIsLoggedIn] = useState(!!userId && !!token);
  const [purchases, setPurchases] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState(null);
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

        const updateResponse = await fetch(USER_ENDPOINTS.USER_ACTIVITY(userId), {
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
        const profileResponse = await fetch(USER_ENDPOINTS.PROFILE(userId), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!profileResponse.ok) {
          throw new Error(`Failed to fetch user profile: ${profileResponse.status}`);
        }

        const profileData = await profileResponse.json();

        // Fetch user activity data (cart, wishlist, etc.)
        const activityResponse = await fetch(USER_ENDPOINTS.USER_ACTIVITY(userId), {
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
        const response = await fetch(`${PURCHASES_ENDPOINTS.GET_PURCHASES}/user/${userId}`, {
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

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isLoggedIn) {
        return;
      }

      try {
        setNotificationsLoading(true);
        setNotificationsError(null);

        const response = await fetch(POLLS_ENDPOINTS.GET_NOTIFICATIONS, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch notifications: ${response.status}`);
        }

        const result = await response.json();
        setNotifications(result.data || []);
        setNotificationsLoading(false);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setNotificationsError(err.message);
        setNotificationsLoading(false);
      }
    };

    fetchNotifications();
  }, [isLoggedIn, token]);

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
      const response = await fetch(UPLOAD_ENDPOINTS.UPLOAD_IMAGE, {
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
      const updateResponse = await fetch(USER_ENDPOINTS.UPDATE_PROFILE(userId), {
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
      const response = await fetch(USER_ENDPOINTS.UPDATE_PROFILE(userId), {
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

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    if (!token) return;

    try {
      const response = await fetch(POLLS_ENDPOINTS.MARK_NOTIFICATION_READ(notificationId), {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      // Update notification in state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Navigate to poll detail
  const navigateToPoll = (pollId, notificationId) => {
    // Mark notification as read
    if (notificationId) {
      markNotificationAsRead(notificationId);
    }

    // Navigate to the poll page
    navigate(`/polls?pollId=${pollId}`);
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
          <h2>{t('profile.loginPrompt')}</h2>
          <button className="login-button" onClick={() => navigate('/login')}>
            {t('auth.login')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {loading ? (
        <div className="loading">{t('profile.loading')}</div>
      ) : error ? (
        <div className="error">{t('profile.error')}: {error}</div>
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
                  title={t('profile.uploadProfilePicture')}
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
                    {uploadLoading ? t('profile.uploading') : t('profile.save')}
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
                    {t('profile.cancel')}
                  </button>
                </div>
              )}
              {uploadSuccess && (
                <div className="upload-success">{t('profile.uploadSuccess')}</div>
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
                        {t('profile.save')}
                      </button>
                      <button className="cancel-button" onClick={cancelEdit}>
                        {t('profile.cancel')}
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
                <LogOut size={16} /> {t('navbar.logout')}
              </button>
            </div>
          </div>

          <div className="profile-tabs">
            <button
              className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              PROFILE
            </button>
            <button
              className={`tab-button ${activeTab === 'wishlist' ? 'active' : ''}`}
              onClick={() => setActiveTab('wishlist')}
            >
              WISHLIST ({userData.wishlistItems?.length || 0})
            </button>
            <button
              className={`tab-button ${activeTab === 'cart' ? 'active' : ''}`}
              onClick={() => setActiveTab('cart')}
            >
              CART ({userData.cartItems?.length || 0})
            </button>
            <button
              className={`tab-button ${activeTab === 'purchases' ? 'active' : ''}`}
              onClick={() => setActiveTab('purchases')}
            >
              PURCHASES ({purchases.length})
            </button>
            <button
              className={`tab-button ${activeTab === 'wardrobe' ? 'active' : ''}`}
              onClick={() => setActiveTab('wardrobe')}
            >
              WARDROBE ({userData.wardrobe?.length || 0})
            </button>
            <button
              className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              NOTIFICATIONS
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="notification-badge">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
          </div>

          <div className="profile-content">
            {activeTab === 'profile' && (
              <div className="profile-summary">
                <div className="summary-card" onClick={() => setActiveTab('wishlist')}>
                  <Heart className="summary-icon" />
                  <div className="summary-info">
                    <h3>Wishlist Items</h3>
                    <p>{userData.wishlistItems?.length || 0}</p>
                  </div>
                </div>

                <div className="summary-card" onClick={() => setActiveTab('cart')}>
                  <ShoppingCart className="summary-icon" />
                  <div className="summary-info">
                    <h3>Cart Items</h3>
                    <p>{userData.cartItems?.length || 0}</p>
                  </div>
                </div>

                <div className="summary-card" onClick={() => setActiveTab('purchases')}>
                  <ShoppingBag className="summary-icon" />
                  <div className="summary-info">
                    <h3>Purchases</h3>
                    <p>{purchases.length}</p>
                  </div>
                </div>

                <div className="summary-card" onClick={() => setActiveTab('wardrobe')}>
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
                    <h3>{t('profile.emptyStates.wishlist')}</h3>
                    <button className="action-button" onClick={() => navigate('/collections')}>
                      {t('profile.actions.browseCollections')}
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
                    <h3>{t('profile.emptyStates.cart')}</h3>
                    <button className="action-button" onClick={() => navigate('/collections')}>
                      {t('profile.actions.shopNow')}
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
                    <h3>{t('profile.emptyStates.purchases')}</h3>
                    <button className="action-button" onClick={() => navigate('/collections')}>
                      {t('profile.actions.shopNow')}
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
                    <h3>{t('profile.emptyStates.wardrobe')}</h3>
                    <button className="action-button" onClick={() => navigate('/wardrobe')}>
                      {t('profile.actions.addItems')}
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="notifications-list">
                {notificationsLoading ? (
                  <div className="loading">{t('profile.loading')}</div>
                ) : notificationsError ? (
                  <div className="error">{t('profile.error')}: {notificationsError}</div>
                ) : notifications.length > 0 ? (
                  <div className="notifications-container">
                    {notifications.map((notification) => (
                      <div
                        key={notification._id}
                        className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                        onClick={() => navigateToPoll(notification.pollId, notification._id)}
                      >
                        <div className="notification-content">
                          <div className="notification-header">
                            <span className="notification-sender">{notification.senderUsername}</span>
                            <span className="notification-time">
                              {new Date(notification.createdAt).toLocaleDateString()}
                              {' '}
                              {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="notification-message">{notification.content}</p>
                          <p className="notification-poll-title">
                            {t('profile.notifications.pollTitle')}: {notification.pollTitle}
                          </p>
                          {!notification.read && (
                            <span className="notification-unread-badge">
                              {t('profile.notifications.new')}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <Bell size={48} />
                    <h3>{t('profile.emptyStates.notifications')}</h3>
                    <button className="action-button" onClick={() => navigate('/polls')}>
                      {t('profile.actions.explorePolls')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="error">{t('profile.noUserData')}</div>
      )}
    </div>
  );
}

export default Profile;
