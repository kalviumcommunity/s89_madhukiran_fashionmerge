import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Signup from './components/signup';
import Login from './components/login';
import ResetPassword from './components/ResetPassword';
import Home from './components/Home';
import MusicPage from './pages/music';
import Navbar from './components/NavBar';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import Chatbot from './pages/chatbot';
import CollectionsPage from './pages/CollectionsPage';
import Cart from './pages/Cart';
import Wishlist from './pages/WishList';
import Wardrobe from './pages/wardrobe';
import Purchases from './pages/Purchases';
import { MusicProvider } from './context/MusicContext';
function App() {
  const [scrolled, setScrolled] = useState(true);

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
    <>
     <MusicProvider>
      <Navbar scrolled={scrolled} /> {/* Pass scrolled state to Navbar */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/home" element={<Home />} />
        <Route path="/music" element={<MusicPage  />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/collections" element={<CollectionsPage />} />
        <Route path="/alita" element={<Chatbot />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/wardrobe" element={<Wardrobe />} />
        <Route path="/purchases" element={<Purchases />} />
      </Routes>
      </MusicProvider>
    </>
  );
}

function AppWrapper() {
  return (
    <BrowserRouter>
        <App />
    </BrowserRouter>
  );
}

export default AppWrapper;