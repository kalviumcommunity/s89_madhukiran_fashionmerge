import React from 'react';
import { Heart, User, ShoppingCart } from 'lucide-react'; // Import ShoppingCart instead of Search
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ scrolled }) => {
  const navigate = useNavigate();

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
        <a onClick={() => navigate('/login')} className="nav-title" style={{ fontSize: '11px', fontWeight: 'bold' }}>ACCOUNT</a>
      </div>
      <div className="nav-right">
        <ShoppingCart size={20} /> {/* Replaced Search with ShoppingCart */}
        <Heart size={20} />
        <User size={20} />
      </div>
    </nav>
  );
};

export default Navbar;