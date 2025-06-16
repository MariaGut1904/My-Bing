import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ScheduleContext = createContext();

export const ScheduleProvider = ({ children }) => {
  const [scheduleData, setScheduleData] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Load schedule for the current user
  useEffect(() => {
    const loadSchedule = async () => {
      if (!currentUserId) {
        setScheduleData([]);
        return;
      }
      try {
        const data = await AsyncStorage.getItem(`schedule_${currentUserId}`);
        if (data) {
          const parsed = JSON.parse(data);
          // Validate data belongs to current user
          if (parsed.some(event => event.creator !== currentUserId)) {
            setScheduleData([]);
            await AsyncStorage.removeItem(`schedule_${currentUserId}`);
          } else {
            setScheduleData(parsed);
          }
        }
      } catch (error) {
        console.error('Failed to load schedule', error);
        setScheduleData([]);
      }
    };
    loadSchedule();
  }, [currentUserId]);

  // Save schedule for the current user
  useEffect(() => {
    if (!currentUserId) return;
    AsyncStorage.setItem(`schedule_${currentUserId}`, JSON.stringify(scheduleData));
  }, [scheduleData, currentUserId]);

  return (
    <ScheduleContext.Provider value={{ 
      scheduleData, 
      setScheduleData, 
      setCurrentUserId,
      resetSchedule: () => setScheduleData([])
    }}>
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = () => useContext(ScheduleContext);
