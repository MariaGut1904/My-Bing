import React, { createContext, useState, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  const login = async (username) => {
    setCurrentUser(username);
    await AsyncStorage.setItem('currentUser', username);
  };

  const logout = async () => {
    setCurrentUser(null);
    await AsyncStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Define the useAuth hook
export const useAuth = () => {
  return useContext(AuthContext);
};
