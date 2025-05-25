import React, { useState, useEffect } from 'react';
import { Heart, User, ShoppingCart, LogOut, ShoppingBag, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './NavBar.css';

const Navbar = ({ scrolled }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const checkLoginStatus = () => {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!userId && !!token);
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

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Navigate and close mobile menu
  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    setIsLoggedIn(false);

    // Navigate to home page
    navigate('/home');

    // Trigger storage event for other components to detect the change
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <>
      {/* Mobile menu backdrop - only needed if menu is not fullscreen */}
      {mobileMenuOpen && (
        <div className="mobile-menu-backdrop" onClick={() => setMobileMenuOpen(false)}></div>
      )}
      <nav className={`navbar ${mobileMenuOpen ? 'mobile-open' : ''}`} style={{ background: scrolled ? "white" : "transparent" }}>
        {/* Mobile logo - visible only on small screens */}
        <a onClick={() => handleNavigation('/home')} className="mobile-logo" style={{ fontFamily: 'Playfair Display, serif', fontWeight: '600' }}>
          FashionMerge
        </a>

        <div className="nav-left">
          <a onClick={() => handleNavigation('/contact')} className="nav-title" style={{ fontSize: '11px', fontWeight: 'bold' }}>{t('navbar.contact')}</a>
          <div className="language-selector">
          </div>
        </div>
      <div className="nav-center">
        {/* Close button for mobile menu - only visible when menu is open */}
        {mobileMenuOpen && (
          <button className="mobile-close-button" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
            <X size={24} />
          </button>
        )}

        <a onClick={() => handleNavigation('/music')} className="nav-title" style={{ fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="music-dot"></span>
          {t('navbar.music')}
        </a>
        <a onClick={() => handleNavigation('/collections')} className="nav-title" style={{ fontSize: '11px', fontWeight: 'bold' }}>{t('navbar.collections')}</a>
        <a onClick={() => handleNavigation('/polls')} className="nav-title" style={{ fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="live-dot"></span>
          {t('navbar.livePolls')}
        </a>
        <a onClick={() => handleNavigation('/home')} className="logo" style={{ fontFamily: 'Playfair Display, serif', fontSize: '30px', fontWeight: 'semi-bold' }}>
          FashionMerge
        </a>
        <a onClick={() => handleNavigation('/wardrobe')} className="nav-title" style={{ fontSize: '11px', fontWeight: 'bold' }}>{t('navbar.wardrobe')}</a>
        <a onClick={() => handleNavigation('/alita')} className="nav-title" style={{ fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <svg className="chipset-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="5" y="5" width="14" height="14" stroke="#6200EA" strokeWidth="2" />
            <rect x="9" y="9" width="6" height="6" stroke="#6200EA" strokeWidth="2" />
            <line x1="12" y1="2" x2="12" y2="5" stroke="#6200EA" strokeWidth="2" />
            <line x1="12" y1="19" x2="12" y2="22" stroke="#6200EA" strokeWidth="2" />
            <line x1="19" y1="12" x2="22" y2="12" stroke="#6200EA" strokeWidth="2" />
            <line x1="2" y1="12" x2="5" y2="12" stroke="#6200EA" strokeWidth="2" />
          </svg>
          {t('navbar.alita')}
        </a>
        <a onClick={() => isLoggedIn ? handleNavigation('/profile') : handleNavigation('/login')} className="nav-title" style={{ fontSize: '11px', fontWeight: 'bold' }}>
          {isLoggedIn ? t('navbar.profile') : t('navbar.login')}
        </a>
      </div>
      <div className="nav-right">
        <ShoppingCart size={20} onClick={() => handleNavigation('/cart')} title="Cart" />
        <Heart size={20} onClick={() => handleNavigation('/wishlist')} title="Wishlist" />
        {isLoggedIn && (
          <ShoppingBag size={20} onClick={() => handleNavigation('/purchases')} style={{ cursor: 'pointer' }} title="My Purchases" />
        )}
        {isLoggedIn ? (
          <LogOut size={20} onClick={handleLogout} style={{ cursor: 'pointer' }} title="Logout" />
        ) : (
          <User size={20} onClick={() => handleNavigation('/login')} style={{ cursor: 'pointer' }} title="Login" />
        )}

        {/* Mobile menu toggle button - only shows hamburger, not X */}
        <button className="mobile-menu-button" onClick={toggleMobileMenu} aria-label="Toggle menu">
          <Menu size={24} />
        </button>
      </div>
    </nav>
    </>
  );
};

export default Navbar;