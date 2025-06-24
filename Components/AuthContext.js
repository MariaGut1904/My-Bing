import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load current user from AsyncStorage on app start
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('currentUser');
        if (savedUser) {
          setCurrentUser(savedUser);
        }
      } catch (error) {
        console.error('Error loading current user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrentUser();
  }, []);

  const login = async (username) => {
    setCurrentUser(username);
    await AsyncStorage.setItem('currentUser', username);
  };

  const logout = async () => {
    setCurrentUser(null);
    await AsyncStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Define the useAuth hook
export const useAuth = () => {
  return useContext(AuthContext);
};
