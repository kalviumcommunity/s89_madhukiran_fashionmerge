import React from 'react';
import './Footer.css';
const Footer = () => (
  <footer className="footer">
    <div className="footer-content">
      <div className="footer-logo">FASHION MERGE</div>
      <div className="footer-links">
        <div className="footer-column">
          <h3>CUSTOMER SERVICE</h3>
          <a href="#contact">Contact Us</a>
          <a href="#shipping">Shipping & Returns</a>
          <a href="#care">Product Care</a>
        </div>
        <div className="footer-column">
          <h3>ABOUT</h3>
          <a href="#history">Our History</a>
          <a href="#sustainability">Sustainability</a>
          <a href="#careers">Careers</a>
        </div>
        <div className="footer-column">
          <h3>LEGAL</h3>
          <a href="#terms">Terms of Service</a>
          <a href="#privacy">Privacy Policy</a>
          <a href="#cookie">Cookie Policy</a>
        </div>
      </div>
    </div>
    <div className="footer-bottom">
      <p>© 2025 Fashion Merge. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;