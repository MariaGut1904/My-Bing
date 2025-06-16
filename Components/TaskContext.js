import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './useAuth';

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const { currentUser } = useAuth();

  // Load tasks for the current user
  useEffect(() => {
    const loadTasks = async () => {
      if (!currentUser) return;
      try {
        const savedTasks = await AsyncStorage.getItem(`tasks_${currentUser}`);
        if (savedTasks) setTasks(JSON.parse(savedTasks));
      } catch (error) {
        console.error('Failed to load tasks:', error);
      }
    };
    loadTasks();
  }, [currentUser]);

  // Save tasks when they change
  useEffect(() => {
    if (!currentUser) return;
    AsyncStorage.setItem(`tasks_${currentUser}`, JSON.stringify(tasks));
  }, [tasks, currentUser]);

  // Optional: Add error boundary to TaskContext
  useEffect(() => {
    if (!currentUser && tasks.length > 0) {
      setTasks([]); // Clear tasks on logout
    }
  }, [currentUser]);

  const addTask = (text) => {
    setTasks([...tasks, { id: Date.now().toString(), text }]);
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, deleteTask }}>
      {children}
    </TaskContext.Provider>
  );
};
