import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState([]);

  // Load tasks for the current user
  useEffect(() => {
    const loadTasks = async () => {
      if (!currentUser) return;
      try {
        const userTasks = await AsyncStorage.getItem(`tasks_${currentUser}`);
        if (userTasks) {
          setTasks(JSON.parse(userTasks));
        }
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    };
    loadTasks();
  }, [currentUser]);

  // Save tasks whenever they change
  useEffect(() => {
    const saveTasks = async () => {
      if (!currentUser) return;
      try {
        await AsyncStorage.setItem(`tasks_${currentUser}`, JSON.stringify(tasks));
      } catch (error) {
        console.error('Error saving tasks:', error);
      }
    };
    saveTasks();
  }, [tasks, currentUser]);

  const addTask = (text) => {
    const newTask = {
      id: Date.now().toString(),
      text: text,
      completed: false,
      createdAt: new Date().toISOString()
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  const deleteTask = (taskId) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  const resetTasks = () => {
    setTasks([]);
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, deleteTask, resetTasks }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within TaskProvider');
  return context;
};
