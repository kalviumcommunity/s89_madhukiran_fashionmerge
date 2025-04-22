import React, { useEffect } from 'react';
import './home.css'; // Import the CSS file for styling
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const navigate = useNavigate();

  // Check if the user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You are not logged in. Redirecting to login page.');
      navigate('/login'); // Redirect to login if no token is found
    }
  }, [navigate]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('token'); // Remove token from local storage
      navigate('/login'); // Redirect to login page
    } catch (err) {
      console.error('Error during logout:', err);
      alert('Something went wrong. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token'); // Retrieve the JWT token from local storage

      const res = await axios.delete('http://localhost:5000/delete-account', {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert(res.data.msg); // Show success message
      localStorage.removeItem('token'); // Remove token from local storage
      navigate('/signup'); // Redirect to signup page
    } catch (err) {
      console.error('Error deleting account:', err);
      alert(err.response?.data?.msg || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Welcome to FashionMerge</h1>
        <p>Your one-stop destination for the latest trends and styles.</p>
      </header>
      <main className="home-main">
        <div className="greeting">
          <h2>Hi, User 👋</h2>
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