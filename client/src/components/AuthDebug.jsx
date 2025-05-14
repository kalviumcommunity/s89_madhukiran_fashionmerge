import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../config/api';

const AuthDebug = () => {
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoggedIn, setIsLoggedIn] = useState(!!userId && !!token);
  const [authCheckResult, setAuthCheckResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkLoginStatus = () => {
      const currentUserId = localStorage.getItem('userId');
      const currentToken = localStorage.getItem('token');
      setUserId(currentUserId);
      setToken(currentToken);
      setIsLoggedIn(!!currentUserId && !!currentToken);
    };

    // Check initially
    checkLoginStatus();

    // Set up event listener for storage changes
    window.addEventListener('storage', checkLoginStatus);

    // Clean up
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  const checkAuth = async () => {
    if (!isLoggedIn) {
      setError('Not logged in. Please log in first.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/check-auth`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Authentication check failed: ${response.status}`);
      }

      const data = await response.json();
      setAuthCheckResult(data);
      setLoading(false);
    } catch (err) {
      console.error('Error checking auth:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const checkUserProfile = async () => {
    if (!isLoggedIn) {
      setError('Not logged in. Please log in first.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/userprofile/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user profile: ${response.status}`);
      }

      const data = await response.json();
      setAuthCheckResult(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const checkUserActivity = async () => {
    if (!isLoggedIn) {
      setError('Not logged in. Please log in first.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/user-activity/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user activity: ${response.status}`);
      }

      const data = await response.json();
      setAuthCheckResult(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching activity:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Function to decode JWT token
  const decodeToken = () => {
    if (!token) {
      setError('No token available to decode');
      return;
    }

    try {
      // Split the token into its parts
      const parts = token.split('.');
      if (parts.length !== 3) {
        setError('Invalid token format');
        return;
      }

      // Decode the payload (middle part)
      const payload = JSON.parse(atob(parts[1]));

      setAuthCheckResult({
        msg: 'Token decoded successfully',
        decodedToken: payload
      });
    } catch (err) {
      console.error('Error decoding token:', err);
      setError(`Error decoding token: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Authentication Debug</h2>

      <div style={{ marginBottom: '20px' }}>
        <h3>Authentication Status</h3>
        <p><strong>Logged In:</strong> {isLoggedIn ? 'Yes' : 'No'}</p>
        <p><strong>User ID:</strong> {userId || 'Not set'}</p>
        <p><strong>Token:</strong> {token ? `${token.substring(0, 20)}...` : 'Not set'}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={checkAuth}
          disabled={loading}
          style={{ marginRight: '10px', padding: '8px 16px' }}
        >
          Check Authentication
        </button>

        <button
          onClick={checkUserProfile}
          disabled={loading}
          style={{ marginRight: '10px', padding: '8px 16px' }}
        >
          Check User Profile
        </button>

        <button
          onClick={checkUserActivity}
          disabled={loading}
          style={{ marginRight: '10px', padding: '8px 16px' }}
        >
          Check User Activity
        </button>

        <button
          onClick={decodeToken}
          disabled={loading || !token}
          style={{ padding: '8px 16px' }}
        >
          Decode Token
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}><strong>Error:</strong> {error}</p>}

      {authCheckResult && (
        <div>
          <h3>Result</h3>
          <pre style={{
            backgroundColor: '#f5f5f5',
            padding: '15px',
            borderRadius: '5px',
            overflow: 'auto',
            maxHeight: '400px'
          }}>
            {JSON.stringify(authCheckResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AuthDebug;
