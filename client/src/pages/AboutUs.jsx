import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import Navbar from '../components/NavBar'; // Ensure this path is correct
import './AboutUs.css';

const AboutUs = () => {
  const [scrolled, setScrolled] = useState(true);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const viewportHeight = 100;
      setScrolled(scrollTop > viewportHeight);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="about">
      <Navbar scrolled={scrolled} />
      <section className={`about-us-section ${scrolled ? 'scrolled' : 'white'}`}>
        <div className="about-us-container">
          <div className="about-us-text">
            <h1 className="about-us-title">Our Mission</h1>
            <p className="about-us-description">
              Welcome to FashionMerge, where the worlds of cutting-edge fashion and immersive music collide. Our community is a vibrant, creative hub designed for trendsetters, music lovers, and anyone who thrives on originality. Here, technology meets artistry: curated style challenges, live listening sessions, personalized outfits, and mood-based playlists create a dynamic space where every member has the opportunity to shine.
            </p>
          </div>
          <div className="about-us-image">
            <img 
              src="https://plus.unsplash.com/premium_photo-1661962766454-57c02128ded3?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDMyfHx8ZW58MHx8fHx8" 
              alt="Fashion Merge Team"
              className="image"
            />
          </div>
        </div>
        <div className="about-us-container reverse">
          <div className="about-us-image">
            <img 
              src="https://images.pexels.com/photos/6069552/pexels-photo-6069552.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
              alt="Fashion Merge Team"
              className="image"
            />
          </div>
          <div className="about-us-text">
            <h1 className="about-us-title">Our Story</h1>
            <p className="about-us-description">
              At FashionMerge, every trend tells a story and every song sets the tone for a new era of self-expression. Members come together to inspire one another, share insights, and set new trends while having fun along the way. Whether you’re looking to discover the latest fashion tips or connect with fellow enthusiasts over a favorite track, our community is the place to ignite your passion and elevate your creative journey.
            </p>
          </div>
        </div>
        <div className="about-us-container">
          <div className="about-us-text">
            <h1 className="about-us-title">So, who am I?</h1>
            <p className="about-us-description">
              I'm your new social media bestie. My mission is to help small and medium-sized businesses grow their audience and brand recognition through social media. My goal is to help you understand the power of social media and create connections that go beyond the internet.
            </p>
            <button className="contact-btn" onClick={() => navigate('/contact')}>CONTACT ME</button> {/* Updated button */}
          </div>
          <div className="about-us-image">
            <img 
              src="https://plus.unsplash.com/premium_photo-1675081853634-54e2897df4ff?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8dW5rbm93bnxlbnwwfHwwfHx8MA%3D%3D" 
              alt="Fashion Merge Team"
              className="image"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;