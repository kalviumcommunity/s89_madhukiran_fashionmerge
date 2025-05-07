import React, { useState } from 'react';
import HeroSection from './HeroSection';
import Navbar from './NavBar';
import CollectionSection from './CollectionSection';
import MaisonSection from './MaisonSection';
import AtelierSection from './AtelierSection';
import Footer from './Footer';
import './About'
import './home.css';
import About from './About';
import Register from './Register';

const Home = () => {
  const [scrolled, setScrolled] = useState(true);

  const handleScroll = (event) => {
    const scrollTop = event.target.scrollTop;
    const viewportHeight = 100;
    setScrolled(scrollTop > viewportHeight);
  };

  return (
    <div className="home" onScroll={handleScroll}>
      <Navbar scrolled={scrolled} />
      <main>
        <HeroSection />
        <CollectionSection />
        <MaisonSection />
        <AtelierSection />
        <About />
        <Register />
      </main>
      <Footer />
    </div>
  );
};

export default Home;