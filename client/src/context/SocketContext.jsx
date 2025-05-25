import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/api';

// Create context
const SocketContext = createContext(null);

// Custom hook to use the socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

// Socket provider component
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  
  // Get user info from localStorage
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  
  useEffect(() => {
    // Only connect if user is logged in
    if (token && userId) {
      // Initialize socket connection
      const socketInstance = io(SOCKET_URL, {
        transports: ['websocket'],
        auth: {
          token
        }
      });
      
      // Set up event listeners
      socketInstance.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);
        
        // Join user's private room for notifications
        socketInstance.emit('join', userId);
      });
      
      socketInstance.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });
      
      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnected(false);
      });
      
      // Save socket instance to state
      setSocket(socketInstance);
      
      // Clean up on unmount
      return () => {
        if (socketInstance) {
          socketInstance.disconnect();
        }
      };
    }
    
    return () => {}; // Empty cleanup if no token/userId
  }, [token, userId]);
  
  // Value to be provided by the context
  const value = {
    socket,
    connected,
    // Helper methods
    emit: (event, data) => {
      if (socket && connected) {
        socket.emit(event, data);
      } else {
        console.warn('Socket not connected, cannot emit event:', event);
      }
    }
  };
  
  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
