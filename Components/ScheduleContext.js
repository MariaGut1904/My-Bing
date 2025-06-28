import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

const ScheduleContext = createContext();

export const ScheduleProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [schedule, setSchedule] = useState([]);
  const [allClasses, setAllClasses] = useState([]);

  // Load schedule for the current user
  useEffect(() => {
    const loadSchedule = async () => {
      if (!currentUser) return;
      try {
        // Load all classes from AsyncStorage
        const allClassesStr = await AsyncStorage.getItem('allClasses');
        const allClasses = allClassesStr ? JSON.parse(allClassesStr) : [];
        
        // Remove duplicates based on unique key
        const uniqueClasses = new Map();
        allClasses.forEach(cls => {
          const key = `${cls.name}-${cls.startTime}-${cls.endTime}-${cls.day}-${cls.semester}-${cls.creator}`;
          if (!uniqueClasses.has(key)) {
            uniqueClasses.set(key, cls);
          }
        });
        
        // Filter classes that belong to current user or are shared
        const userSchedule = Array.from(uniqueClasses.values()).filter(cls => {
          const isUserClass = cls.creator === currentUser;
          const isShared = cls.isShared;
          return isUserClass || isShared;
        });
        
        setSchedule(userSchedule);
        setAllClasses(userSchedule);
      } catch (error) {
        console.error('Error loading schedule:', error);
      }
    };
    loadSchedule();
  }, [currentUser]);

  // Save schedule whenever it changes
  useEffect(() => {
    const saveSchedule = async () => {
      if (!currentUser) return;
      try {
        // Get all existing classes
        const allClassesStr = await AsyncStorage.getItem('allClasses');
        const allClasses = allClassesStr ? JSON.parse(allClassesStr) : [];
        
        // Remove duplicates based on unique key
        const uniqueClasses = new Map();
        allClasses.forEach(cls => {
          const key = `${cls.name}-${cls.startTime}-${cls.endTime}-${cls.day}-${cls.semester}-${cls.creator}`;
          if (!uniqueClasses.has(key)) {
            uniqueClasses.set(key, cls);
          }
        });
        
        // Keep classes that don't belong to current user
        const otherUsersClasses = Array.from(uniqueClasses.values()).filter(cls => 
          cls.creator !== currentUser
        );
        
        // Get current user's classes and shared classes
        const userClasses = schedule.filter(cls => 
          cls.creator === currentUser || cls.isShared
        );
        
        // Combine all classes
        const finalClasses = [...otherUsersClasses, ...userClasses];
        
        // Save to AsyncStorage
        await AsyncStorage.setItem('allClasses', JSON.stringify(finalClasses));
      } catch (error) {
        console.error('Error saving schedule:', error);
      }
    };
    saveSchedule();
  }, [schedule, currentUser]);

  const addEvent = (event) => {
    const newEvent = {
      ...event,
      id: Date.now().toString(),
      creator: currentUser,
      isShared: false
    };
    
    const updatedSchedule = [...schedule, newEvent];
    setSchedule(updatedSchedule);
    
    // Update the comprehensive list
    const updatedAllClasses = [...allClasses, newEvent];
    setAllClasses(updatedAllClasses);
    
    // Save to AsyncStorage
    saveToStorage(updatedAllClasses);
  };

  const deleteEvent = (eventId) => {
    setSchedule(prevSchedule => prevSchedule.filter(event => event.id !== eventId));
  };

  const setScheduleData = (newSchedule) => {
    setSchedule(newSchedule);
  };

  const resetSchedule = () => {
    setSchedule([]);
  };

  const saveToStorage = async (classes) => {
    try {
      await AsyncStorage.setItem('allClasses', JSON.stringify(classes));
    } catch (error) {
      console.error('Error saving classes to storage:', error);
    }
  };

  return (
    <ScheduleContext.Provider value={{ 
      schedule, 
      addEvent, 
      deleteEvent, 
      resetSchedule,
      setScheduleData 
    }}>
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
};
