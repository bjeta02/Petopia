import React, { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from "jwt-decode"; 

// Create AuthContext
const AuthContext = createContext();

// Function to get user information from the token
export const getUserFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = jwtDecode(token);
    return {
      userId: payload.id,
      ownerId: payload.ownerId,
      clinicId: payload.clinicId,
      role: payload.role
    };
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }  
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState({ userId: null, ownerId: null, clinicId: null, role: null });

  useEffect(() => {
    const user = getUserFromToken();
    if (user) {
      setUserInfo(user); 
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...userInfo, setUserInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};