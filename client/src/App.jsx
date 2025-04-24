import './App.css';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Signup from './components/signup';
import Login from './components/login';
import ResetPassword from './components/ResetPassword';
import Home from './components/Home';
import Navbar from './components/Navbar'; // Import the Navbar component

function App() {
  const location = useLocation(); // Get the current route

  return (
    <>
      {location.pathname === '/home' && <Navbar />} {/* Show Navbar only on /home */}
      <Routes>
        <Route path="/" element={<Signup />} /> {/* Default route */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/home" element={<Home />} /> {/* Add Home route */}
      </Routes>
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