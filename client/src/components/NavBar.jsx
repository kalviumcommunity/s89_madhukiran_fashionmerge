import React, { useState, useEffect } from 'react';
import { Heart, User, ShoppingCart, LogOut, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ scrolled }) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
    <nav className="navbar" style={{ background: scrolled ? "white" : "transparent" }}>
      <div className="nav-left">
        <a onClick={() => navigate('/contact')} className="nav-title" style={{ fontSize: '11px', fontWeight: 'bold' }}>CONTACT</a>
        <div className="language-selector">
        </div>
      </div>
      <div className="nav-center">
        <a onClick={() => navigate('/music')} className="nav-title" style={{ fontSize: '11px', fontWeight: 'bold' }}>MUSIC</a>
        <a onClick={() => navigate('/collections')} className="nav-title" style={{ fontSize: '11px', fontWeight: 'bold' }}>COLLECTIONS</a>
        <a onClick={() => navigate('/about')} className="nav-title" style={{ fontSize: '11px', fontWeight: 'bold' }}>ABOUT</a>
        <a onClick={() => navigate('/home')} className="logo" style={{ fontFamily: 'Playfair Display, serif', fontSize: '30px', fontWeight: 'semi-bold' }}>
          FashionMerge
        </a>
        <a onClick={() => navigate('/wardrobe')} className="nav-title" style={{ fontSize: '11px', fontWeight: 'bold' }}>WARDROBE</a>
        <a onClick={() => navigate('/alita')} className="nav-title" style={{ fontSize: '11px', fontWeight: 'bold' }}>ALITA</a>
        <a onClick={() => isLoggedIn ? navigate('/profile') : navigate('/login')} className="nav-title" style={{ fontSize: '11px', fontWeight: 'bold' }}>
          {isLoggedIn ? 'PROFILE' : 'ACCOUNT'}
        </a>
      </div>
      <div className="nav-right">
        <ShoppingCart size={20} onClick={() => navigate('/cart')} title="Cart" />
        <Heart size={20} onClick={() => navigate('/wishlist')} title="Wishlist" />
        {isLoggedIn && (
          <ShoppingBag size={20} onClick={() => navigate('/purchases')} style={{ cursor: 'pointer' }} title="My Purchases" />
        )}
        {isLoggedIn ? (
          <LogOut size={20} onClick={handleLogout} style={{ cursor: 'pointer' }} title="Logout" />
        ) : (
          <User size={20} onClick={() => navigate('/login')} style={{ cursor: 'pointer' }} title="Login" />
        )}
      </div>
    </nav>
  );
};

export default Navbar;