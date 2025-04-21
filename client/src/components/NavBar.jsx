import React from 'react';
import { Link } from 'react-router-dom';
import './navbar.css';

const Navbar = () => {


  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/home">FashionMerge</Link>
      </div>
      <ul className="navbar-links">
        <li>
          <Link to="/Explore">Explore</Link>
        </li>
        <li>
          <Link to="/Virtual Wardrobe">Virtual Wardrobe</Link>
        </li> 
        <li>
          <Link to="/Music">Music</Link>
        </li>
        <li>
          <Link to="/AI">AI stylist</Link>
        </li>
        <li>
          <Link to="/profile">Profile</Link>
        </li>
       
      
      </ul>
      <div className="navbar-toggle">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </nav>
  );
};

export default Navbar;