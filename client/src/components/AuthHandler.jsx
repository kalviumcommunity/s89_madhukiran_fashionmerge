import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Component that handles authentication parameters from URL
 * This component doesn't render anything, it just processes auth tokens
 */
const AuthHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Get URL parameters
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userId = params.get('userId');
    const errorParam = params.get('error');

    // If there's an error parameter, we'll handle it in the Login component
    if (errorParam && location.pathname !== '/login') {
      navigate(`/login?error=${errorParam}`);
      return;
    }

    // If we have a token, store it and update auth state
    if (token) {
      console.log('Auth token found in URL, storing in localStorage');
      localStorage.setItem('token', token);

      // If userId is provided in URL, store it
      if (userId) {
        console.log('User ID found in URL, storing in localStorage:', userId);
        localStorage.setItem('userId', userId);
      }

      // Trigger storage event for other components to detect the change
      window.dispatchEvent(new Event('storage'));

      // Remove the token and userId from the URL by replacing the current history entry
      // This is a security best practice to prevent the token from being leaked
      const cleanUrl = location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      
      console.log('Authentication parameters processed and removed from URL');
    }
  }, [location, navigate]);

  // This component doesn't render anything
  return null;
};

export default AuthHandler;
