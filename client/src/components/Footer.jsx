import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './Footer.css';

const Footer = () => {
  const { t, i18n } = useTranslation();
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');

  // Language options with country names
  const languageOptions = [
    { code: 'it', country: 'it', name: 'Italy', textColor: '#000000' },
    { code: 'fr', country: 'fr', name: 'France', textColor: '#000000' },
    { code: 'zh', country: 'cn', name: 'China', textColor: '#000000' },
    { code: 'ru', country: 'ru', name: 'Russia', textColor: '#000000' },
    { code: 'en', country: 'us', name: 'United States', textColor: '#000000' }
  ];

  // Initialize language from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('i18nextLng');
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const handleContactClick = () => {
    window.location.href = '/contact'; // Redirect to the contact page
  };

  const handleAboutClick = () => {
    window.location.href = '/about'; // Redirect to the about page
  };

  // Toggle language dropdown
  const toggleLanguageDropdown = () => {
    setIsLanguageDropdownOpen(!isLanguageDropdownOpen);
  };

  // Handle language change
  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    setCurrentLanguage(langCode);
    localStorage.setItem('i18nextLng', langCode);
    setIsLanguageDropdownOpen(false); // Close dropdown after selection
  };

  // Get current language display
  const getCurrentLanguageDisplay = () => {
    const lang = languageOptions.find(lang => lang.code === currentLanguage);
    return lang ? lang.name : 'United States';
  };

  // Scroll to hero section function
  const scrollToTop = () => {
    // Try to find the hero section by ID first, then by class
    const heroSection = document.querySelector('#home-section') ||
                       document.querySelector('.hero-section') ||
                       document.querySelector('main');

    if (heroSection) {
      heroSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    } else {
      // Fallback to top of page if hero section not found
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-logo">
          <img
            src="https://res.cloudinary.com/dwr6mvypn/image/upload/v1747398176/cld-sample-5.png"
            alt="Fashion Merge Logo"
          />
        </div>
        <div className="footer-links">
          <div className="footer-column">
            <h3>{t('footer.customerService')}</h3>
            <a href="#contact" onClick={handleContactClick}>{t('footer.contactUs')}</a>
          </div>
          <div className="footer-column">
            <h3>{t('footer.about')}</h3>
            <a href="#about" onClick={handleAboutClick}>{t('footer.ourHistory')}</a>
            <a href="#about" onClick={handleAboutClick}>{t('footer.sustainability')}</a>
            <a href="#about" onClick={handleAboutClick}>{t('footer.careers')}</a>
          </div>
          <div className="footer-column">
            <h3>{t('footer.language')}</h3>
            <div className="language-selector">
              <div className="selected-language" onClick={toggleLanguageDropdown}>
                <span style={{ color: '#e50012' }}>{getCurrentLanguageDisplay()}</span>
              </div>
              {isLanguageDropdownOpen && (
                <div className="language-dropdown">
                  {languageOptions.map((lang) => (
                    <div
                      key={lang.code}
                      className={`language-option ${currentLanguage === lang.code ? 'active' : ''}`}
                      onClick={() => changeLanguage(lang.code)}
                    >
                      <span className="language-name" style={{ color: currentLanguage === lang.code ? '#e50012' : '#000000' }}>{lang.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>{t('footer.copyright')}</p>
        <button className="back-to-top-btn" onClick={scrollToTop}>
          <span className="back-to-top-icon">↑</span>
          <span className="back-to-top-text">{t('footer.backToTop')}</span>
        </button>
      </div>
    </footer>
  );
};

export default Footer;