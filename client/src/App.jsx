import React, { useEffect, useRef } from 'react'; // Import useRef
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Signup from './components/signup';
import Login from './components/login';
import ResetPassword from './components/ResetPassword';
import Home from './components/Home';
import MusicPage from './pages/music';
import Navbar from './components/NavBar';
import { MusicPlayerProvider, useMusicPlayer } from './context/MusicPlayerContext';
import AboutUs from './pages/AboutUs';
import CreateCollections from './pages/CreateCollections';
import Contact from './pages/Contact';

function App() {
  const { currentPlaylist } = useMusicPlayer();
  const audioRef = useRef(new Audio()); // Use useRef to persist audio object

  useEffect(() => {
    if (currentPlaylist) {
      audioRef.current.src = currentPlaylist;
      audioRef.current.play();
    }
    return () => {
      audioRef.current.pause();
    };
  }, [currentPlaylist]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/contact" element={<Contact />} />        
        <Route path="/home" element={<Home />} />
        <Route path="/music" element={<MusicPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/collections" element={<CreateCollections />} />
      </Routes>
    </>
  );
}

function AppWrapper() {
  return (
    <BrowserRouter>
      <MusicPlayerProvider>
        <App />
      </MusicPlayerProvider>
    </BrowserRouter>
  );
}

export default AppWrapper;