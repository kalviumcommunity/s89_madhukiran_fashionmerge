import React from 'react';
import { Search, Heart, User } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ scrolled }) => {
  return (
    <nav className="navbar" style={{ background: scrolled ? "white" : "transparent" }}>
      <div className="nav-left">
        <a href="/contact" className="nav-title" style={{ fontSize: '11px', fontWeight: 'bold' }}>CONTACT</a> {/* Updated href */}
        <div className="language-selector">
        </div>
      </div>
      <div className="nav-center">
        <a href="/music" className="nav-title" style={{ fontSize: '11px', fontWeight: 'bold' }}>MUSIC</a>
        <a href="/collections" className="nav-title" style={{ fontSize: '11px', fontWeight: 'bold' }}>COLLECTIONS</a>
        <a href="/about" className="nav-title" style={{ fontSize: '11px', fontWeight: 'bold' }}>ABOUT</a>
        <a href="/home" className="logo" style={{ fontFamily: 'Playfair Display, serif', fontSize: '30px', fontWeight: 'semi-bold' }}>
          FashionMerge
        </a>
        <a href="/wardrobe" className="nav-title" style={{ fontSize: '11px', fontWeight: 'bold' }}>WARDROBE</a>
        <a href="/alita" className="nav-title" style={{ fontSize: '11px', fontWeight: 'bold' }}>ALITA</a>
        <a href="/login" className="nav-title" style={{ fontSize: '11px', fontWeight: 'bold' }}>ACCOUNT</a>
      </div>
      <div className="nav-right">
        <Search size={20} />
        <Heart size={20} />
        <User size={20} />
      </div>
    </nav>
  );
};

export default Navbar;