import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Contact.css';

const Contact = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=fashionmergeforyou@gmail.com&su=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(`Name: ${formData.firstName} ${formData.lastName}\nEmail: ${formData.email}\nPhone: ${formData.phone}\n\n${formData.subject}`)}`;
    window.open(gmailLink, '_blank');
  };

  return (
    <div className="page-container">
      <main className="main-content">
        <div className="image-section">
          <img
            src="https://res.cloudinary.com/dwr6mvypn/image/upload/v1746202820/con1_najibx.jpg"
            alt="Fashion"
            className="fashion-image"
          />
        </div>

        <div className="form-section">
            <br />
            <br />
            <br />
            <br />
          <h2>{t('contact.title')}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder={t('contact.firstName')}
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder={t('contact.lastName')}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder={t('contact.email')}
                />
              </div>
              <div className="form-group">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder={t('contact.phone')}
                />
              </div>
            </div>

            <div className="form-group full-width">
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder={t('contact.message')}
              />
            </div>

            <button type="submit" className="send-button">
              {t('contact.submit')}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Contact;