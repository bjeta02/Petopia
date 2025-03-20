// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getOwnerIdFromToken } from '../utils/auth'; // Import the function to decode the token

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [ownerId, setOwnerId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token'); // Get the token from local storage
    const id = getOwnerIdFromToken(token); // Decode the token to get the owner ID
    setOwnerId(id); // Set the owner ID in state
  }, []);

  return (
    <AuthContext.Provider value={{ ownerId }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};