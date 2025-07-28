import React, { useState, createContext, useContext, useEffect } from 'react';
import { getAuthToken, getUserId, apiService } from '../services/apiService';


// --- Auth Context ---
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userId, setUserIdState] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    // Check for existing token on load
    const token = getAuthToken();
    const storedUserId = getUserId();
    if (token && storedUserId) {
      // In a real app, you'd verify the token with the backend
      // For this demo, we'll assume a valid token means logged in
      setCurrentUser({ id: storedUserId, email: 'user@example.com' }); // Dummy user object
      setUserIdState(storedUserId);
    }
    setLoadingAuth(false);
  }, []);

  const signUp = async (email, password) => {
    try {
      await apiService.register(email, password);
      return { success: true };
    } catch (error) {
      console.error("Error signing up:", error);
      return { success: false, error: error.message };
    }
  };

  const login = async (email, password) => {
    try {
      const data = await apiService.login(email, password);
      setCurrentUser({ id: data.userId, email: email }); // Set current user based on login response
      setUserIdState(data.userId);
      return { success: true };
    } catch (error) {
      console.error("Error logging in:", error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      apiService.logout();
      setCurrentUser(null);
      setUserIdState(null);
      return { success: true };
    } catch (error) {
      console.error("Error logging out:", error);
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, userId, loadingAuth, signUp, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);