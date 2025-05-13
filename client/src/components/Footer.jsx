import React from 'react';
import './Footer.css';

const Footer = () => {
  const handleContactClick = () => {
    window.location.href = '/contact'; // Redirect to the contact page
  };

  const handleAboutClick = () => {
    window.location.href = '/about'; // Redirect to the about page
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-logo">FASHION MERGE</div>
        <div className="footer-links">
          <div className="footer-column">
            <h3>CUSTOMER SERVICE</h3>
            <a href="#contact" onClick={handleContactClick}>Contact Us</a>
          </div>
          <div className="footer-column">
            <h3>ABOUT</h3>
            <a href="#about" onClick={handleAboutClick}>Our History</a>
            <a href="#about" onClick={handleAboutClick}>Sustainability</a>
            <a href="#about" onClick={handleAboutClick}>Careers</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2025 Fashion Merge. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;