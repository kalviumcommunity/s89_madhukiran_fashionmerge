import React, { useState, useEffect } from 'react';
import './home.css'; // Import the CSS file for styling
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('User'); // Store username dynamically

  // Fetch user info dynamically
  useEffect(() => {
    // Check for token in URL parameters (for Google OAuth)
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    
    if (tokenFromUrl) {
      localStorage.setItem('token', tokenFromUrl);
      // Clean up the URL
      window.history.replaceState({}, document.title, '/home');
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('You are not logged in. Redirecting to login.');
      navigate('/login'); // Redirect to login if no token is found
      return;
    }

    // Fetch user info dynamically
    axios
      .get('http://localhost:5000/user', {
        headers: { Authorization: `Bearer ${token}` }, // Include the token in the request
      })
      .then((res) => {
        setUsername(res.data.username || 'User'); // Update username if available
      })
      .catch((err) => {
        console.error('Error fetching user info:', err);
        alert('Failed to fetch user information. Redirecting to login.');
        localStorage.removeItem('token'); // Remove invalid token
        navigate('/login'); // Redirect to login page
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove token from localStorage
    alert('You have logged out successfully.');
    navigate('/login'); // Redirect to login page
  };

  const handleDeleteAccount = () => {
    const token = localStorage.getItem('token'); // Retrieve the token from localStorage
    if (!token) {
      alert('Authorization token is missing.');
      return;
    }

    // Execute delete account API call
    axios
      .delete('http://localhost:5000/delete-account', {
        headers: { Authorization: `Bearer ${token}` }, // Include the token in the request
      })
      .then((res) => {
        alert(res.data.msg); // Show success message
        localStorage.removeItem('token'); // Remove token from localStorage
        navigate('/signup'); // Redirect to signup page
      })
      .catch((err) => {
        console.error('Error deleting account:', err);
        alert(err.response?.data?.msg || 'Something went wrong. Please try again.');
      });
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Welcome to FashionMerge</h1>
        <p>Your one-stop destination for the latest trends and styles.</p>
      </header>
      <main className="home-main">
        <div className="greeting">
          <h2>Hi, {username} 👋</h2>
          <p>We’re glad to have you back! Explore the latest trends curated just for you.</p>
        </div>
        <div className="actions">
          <button className="explore-button">Explore Trends</button>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
          <button className="delete-account-button" onClick={handleDeleteAccount}>
            Delete Account
          </button>
        </div>
      </main>
      <footer className="home-footer">
        <p>&copy; 2025 FashionMerge. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;