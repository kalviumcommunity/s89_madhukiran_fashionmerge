import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { usePollsStore } from '../../pages/pollsStore';
import './NotificationBadge.css';

const NotificationBadge = ({ count }) => {
  const { t } = useTranslation();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  // Get notifications and actions from store
  const { 
    notifications, 
    fetchNotifications, 
    markNotificationRead 
  } = usePollsStore();
  
  // Get user token
  const token = localStorage.getItem('token');
  
  // Toggle dropdown
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    
    // Fetch notifications when opening dropdown
    if (!showDropdown && token) {
      fetchNotifications(token);
    }
  };
  
  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Mark notification as read
    if (!notification.read && token) {
      markNotificationRead(notification._id, token);
    }
    
    // Close dropdown
    setShowDropdown(false);
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) {
      return t('common.justNow');
    } else if (diffMin < 60) {
      return t('common.minutesAgo', { count: diffMin });
    } else if (diffHour < 24) {
      return t('common.hoursAgo', { count: diffHour });
    } else if (diffDay < 7) {
      return t('common.daysAgo', { count: diffDay });
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div className="notification-badge-container" ref={dropdownRef}>
      <button 
        className="notification-badge-button"
        onClick={toggleDropdown}
      >
        <span className="notification-icon">🔔</span>
        {count > 0 && (
          <span className="notification-count">{count}</span>
        )}
      </button>
      
      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>{t('notifications.title')}</h3>
          </div>
          
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">
                <p>{t('notifications.empty')}</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification._id}
                  className={`notification-item ${notification.read ? '' : 'unread'}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-content">
                    <p>{notification.content}</p>
                    <span className="notification-time">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBadge;
