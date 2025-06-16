import { useContext } from 'react';
import { AuthContext } from './AuthContext';

// Create separate files for each hook:

// useAuth.js
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// useTasks.js
export const useTasks = (TaskContext) => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within TaskProvider');
  return context;
};
