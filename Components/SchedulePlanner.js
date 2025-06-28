import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, ScrollView, Dimensions, Image, FlatList, Keyboard, ImageBackground, TouchableWithoutFeedback, Switch, AppState, Animated } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar } from 'react-native-big-calendar';
import { useSchedule } from './ScheduleContext';
import { useAuth } from './AuthContext';
import { HelpOverlay } from './HelpOverlay';

const { width, height } = Dimensions.get('window');

const SchedulePlanner = () => {
  const { scheduleData, setScheduleData } = useSchedule();
  const { currentUser: authUser } = useAuth();
  const [openMonth, setOpenMonth] = useState(false);
  const [semester, setSemester] = useState('Fall 2025');
  const [openDay, setOpenDay] = useState(false);
  const [day, setDay] = useState(null);
  const [className, setClassName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [dailyClasses, setDailyClasses] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [isEvent, setIsEvent] = useState(false);
  const [eventDescription, setEventDescription] = useState('');
  const [currentUser, setCurrentUser] = useState(authUser || 'Maria');
  const [showEventsInCalendar, setShowEventsInCalendar] = useState(true);
  const [semesterOpen, setSemesterOpen] = useState(false);
  const [dayOpen, setDayOpen] = useState(false);
  const [allClassesFull, setAllClassesFull] = useState([]);
  const [isComparing, setIsComparing] = useState(false);
  const [users, setUsers] = useState(['Maria', 'Luna', 'Reni', 'Sheila']);
  const [showHelp, setShowHelp] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [timeListRef, setTimeListRef] = useState(null);
  const [currentScrollY, setCurrentScrollY] = useState(0);

  // States for new time dropdowns
  const [startTimeHour, setStartTimeHour] = useState(null);
  const [startTimeMinute, setStartTimeMinute] = useState(null);
  const [startTimeAmPm, setStartTimeAmPm] = useState(null);
  const [endTimeHour, setEndTimeHour] = useState(null);
  const [endTimeMinute, setEndTimeMinute] = useState(null);
  const [endTimeAmPm, setEndTimeAmPm] = useState(null);

  // States for time dropdowns open/close
  const [startHourOpen, setStartHourOpen] = useState(false);
  const [startMinuteOpen, setStartMinuteOpen] = useState(false);
  const [startAmPmOpen, setStartAmPmOpen] = useState(false);
  const [endHourOpen, setEndHourOpen] = useState(false);
  const [endMinuteOpen, setEndMinuteOpen] = useState(false);
  const [endAmPmOpen, setEndAmPmOpen] = useState(false);

  // States for new date picker
  const [showDatePicker, setShowDatePicker] = useState(false);

  // For smooth vertical paging in compare view - simplified for FlatList
  const timeSlotHeight = 35; // Approximate height of each time slot row (matches minHeight in styles)
  const slotsPerPage = 16; // 4 hours (16 x 15min)

  const getSemesterDates = (semester) => {
    const [term, year] = semester.split(' ');
    if (term === 'Fall') {
      return {
        start: new Date(parseInt(year), 7, 1), // August 1st
        end: new Date(parseInt(year), 11, 31)  // December 31st
      };
    } else {
      return {
        start: new Date(parseInt(year), 0, 1),  // January 1st
        end: new Date(parseInt(year), 4, 31)    // May 31st
      };
    }
  };

  // Load classes function - moved outside useEffect so it can be called from multiple places
  const loadClasses = async () => {
    try {
      const savedClasses = await AsyncStorage.getItem('allClasses');
      console.log('Raw saved classes from AsyncStorage:', savedClasses);
      let fullList = savedClasses ? JSON.parse(savedClasses) : [];
      console.log('Parsed fullList:', fullList);
      
      // Clean up any invalid or orphaned data
      fullList = fullList.filter(item => {
        // Remove items without required fields
        if (!item.id || !item.name || !item.creator) {
          console.log('Filtering out item without required fields:', item);
          return false;
        }
        
        // Remove items with invalid dates
        if (item.date && !item.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          console.log('Filtering out item with invalid date:', item);
          return false;
        }
        
        // Remove items with invalid times
        if (!item.startTime || !item.endTime) {
          console.log('Filtering out item with invalid times:', item);
          return false;
        }
        
        return true;
      });
      
      console.log('After filtering, fullList length:', fullList.length);
      setAllClassesFull(fullList);
      // Only filter for display
      const relevantClasses = fullList.filter(cls => cls.creator === currentUser || cls.isShared);
      console.log('Relevant classes for current user:', relevantClasses.length);
      setAllClasses(relevantClasses);
      setScheduleData(relevantClasses);
      // Update marked dates for all loaded classes (use fullList, not relevantClasses)
      const newMarkedDates = {};
      fullList.forEach(item => {
        if (item.isRecurring) {
          const semesterDates = getSemesterDates(item.semester);
          let currentDate = new Date(semesterDates.start);
          while (currentDate <= semesterDates.end) {
            if (currentDate.getDay() === item.day) {
              const dateStr = currentDate.toISOString().split('T')[0];
              newMarkedDates[dateStr] = { 
                marked: true, 
                dotColor: item.semester === semester ? '#a259c6' : '#d1b3ff',
                selected: item.semester === semester
              };
            }
            currentDate.setDate(currentDate.getDate() + 1);
          }
        } else {
          newMarkedDates[item.date] = { 
            marked: true, 
            dotColor: item.semester === semester ? '#a259c6' : '#d1b3ff',
            selected: item.semester === semester
          };
        }
      });
      setMarkedDates(newMarkedDates);
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  // Load classes when component mounts or user/semester changes
  useEffect(() => {
    loadClasses();
  }, [currentUser, semester]);

  // Save classes whenever they change
  useEffect(() => {
    const saveClasses = async () => {
      try {
        // Save allClassesFull instead of allClasses to preserve all data
        if (allClassesFull.length > 0) {
          await AsyncStorage.setItem('allClasses', JSON.stringify(allClassesFull));
        }
      } catch (error) {
        console.error('Error saving classes:', error);
      }
    };

    saveClasses();
  }, [allClassesFull]);

  // Update handleDeleteAll to recalculate marked dates from allClassesFull after deletion
  const handleDeleteAll = () => {
    Alert.alert(
      "Delete All",
      "Are you sure you want to delete all your classes and events? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            try {
              // Remove current user's items (including their shared items)
              const updatedFull = allClassesFull.filter(item => item.creator !== currentUser);
              
              setAllClassesFull(updatedFull);
              await AsyncStorage.setItem('allClasses', JSON.stringify(updatedFull));
              
              // Update filtered lists for display
              const relevantClasses = updatedFull.filter(cls => cls.creator === currentUser || cls.isShared);
              setAllClasses(relevantClasses);
              setScheduleData(relevantClasses);
              
              // Force immediate recalculation of marked dates
              const newMarkedDatesArray = getMarkedDates();
              const newMarkedDatesObj = {};
              newMarkedDatesArray.forEach(([date, config]) => {
                newMarkedDatesObj[date] = config;
              });
              setMarkedDates(newMarkedDatesObj);
              
              // Force refresh of daily schedule
              if (selectedDate) {
                const schedule = getDailySchedule();
                setDailyClasses(schedule);
              } else {
                setDailyClasses([]);
              }
              
              Alert.alert("Success", "All your classes and events have been deleted.");
            } catch (error) {
              console.error('Error deleting all items:', error);
              Alert.alert('Error', 'Failed to delete all items. Please try again.');
            }
          }
        }
      ]
    );
  };

  const days = [
    { label: 'Sunday', value: 0 },
    { label: 'Monday', value: 1 },
    { label: 'Tuesday', value: 2 },
    { label: 'Wednesday', value: 3 },
    { label: 'Thursday', value: 4 },
    { label: 'Friday', value: 5 },
    { label: 'Saturday', value: 6 }
  ];

  const handleAddClass = async () => {
    Keyboard.dismiss();
    if (isEvent) {
      if (!eventDescription || !startTime || !endTime || !selectedDate) {
        Alert.alert("Error", "Please fill all event fields and select a date from calendar");
        return;
      }
    } else {
      if (!className || !startTime || !endTime || day === null) {
        Alert.alert("Error", "Please fill all class fields");
        return;
      }
    }
    let newItem;
    const semesterDates = getSemesterDates(semester);
    if (!isEvent) {
      newItem = {
        id: Date.now().toString(),
        type: 'class',
        name: className,
        startTime,
        endTime,
        day: day,
        isRecurring: true,
        isEvent: false,
        creator: currentUser,
        semester: semester,
        semesterStart: semesterDates.start.toISOString().split('T')[0],
        semesterEnd: semesterDates.end.toISOString().split('T')[0],
      };
    } else {
      const selectedDateObj = new Date(selectedDate);
      newItem = {
        id: Date.now().toString(),
        type: 'event',
        name: eventDescription,
        startTime,
        endTime,
        date: selectedDate,
        isRecurring: false,
        isEvent: true,
        creator: currentUser,
        semester: semester,
        semesterStart: semesterDates.start.toISOString().split('T')[0],
        semesterEnd: semesterDates.end.toISOString().split('T')[0],
      };
    }
    try {
      // Use allClassesFull for the full list
      let updatedFull = [...allClassesFull, newItem];
      setAllClassesFull(updatedFull);
      await AsyncStorage.setItem('allClasses', JSON.stringify(updatedFull));
      // Only filter for display
      const relevantClasses = updatedFull.filter(cls => cls.creator === currentUser || cls.isShared);
      setAllClasses(relevantClasses);
      setScheduleData(relevantClasses);
      
      // Force refresh of daily schedule if we're on the selected date
      if (selectedDate) {
        const schedule = getDailySchedule();
        setDailyClasses(schedule);
      }
      
      // Reset form
      setClassName('');
      setStartTimeHour(null);
      setStartTimeMinute(null);
      setStartTimeAmPm(null);
      setEndTimeHour(null);
      setEndTimeMinute(null);
      setEndTimeAmPm(null);
      setDay(null);
      setEventDescription('');
      // Don't reset selectedDate - keep it so user can see their newly added class/event
      
      Alert.alert("Success", `${isEvent ? 'Event' : 'Class'} added successfully!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to save item: ' + error.message);
    }
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      // Correct for timezone offset
      const timezoneOffset = date.getTimezoneOffset() * 60000;
      const adjustedDate = new Date(date.getTime() - timezoneOffset);
      const dateString = adjustedDate.toISOString().split('T')[0];
      setSelectedDate(dateString);
      handleDayPress({ day: adjustedDate.toISOString().split('T')[0] });
    }
  };

  const handleDayPress = (input) => {
    let dateObj;
    if (input instanceof Date) {
      dateObj = input;
    } else if (typeof input === 'string') {
      dateObj = new Date(input + 'T00:00:00');
    } else if (input && typeof input === 'object' && input.day) {
      dateObj = new Date(input.day + 'T00:00:00');
    } else {
      dateObj = new Date();
    }
    
    // Fix timezone issue by using local date
    const localDate = new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000));
    
    // Build YYYY-MM-DD in local time
    const year = localDate.getFullYear();
    const month = (localDate.getMonth() + 1).toString().padStart(2, '0');
    const day = localDate.getDate().toString().padStart(2, '0');
    const dayString = `${year}-${month}-${day}`;
    
    console.log('handleDayPress:', {
      originalInput: input,
      dateObj,
      localDate,
      dayString
    });
    
    setSelectedDate(dayString);
    // Use getDailySchedule for consistent filtering logic
    const schedule = getDailySchedule();
    setDailyClasses(schedule);
  };

  const handleShare = async (item) => {
    try {
      const fullList = [...allClassesFull];

      // Check if this exact item from this creator is already shared
      const isAlreadyShared = fullList.some(cls =>
        cls.originalId === item.id && cls.isShared
      );

      if (isAlreadyShared) {
        Alert.alert("Already Shared", "This item has already been shared.");
        return;
      }

      // Create a new, distinct shared item
      const sharedItem = {
        ...item,
        id: Date.now().toString(), // New ID for the shared copy
        originalId: item.id, // Keep track of the original
        isShared: true,
        sharedBy: currentUser, // Person who clicked share
        // creator field remains the same as the original item's creator
      };

      const updatedFullList = [...fullList, sharedItem];
      setAllClassesFull(updatedFullList);
      await AsyncStorage.setItem('allClasses', JSON.stringify(updatedFullList));

      Alert.alert("Shared!", `${item.type === 'class' ? 'Class' : 'Event'} has been shared.`);

    } catch (error) {
      Alert.alert('Error', 'Failed to share item: ' + error.message);
    }
  };

  const getDailySchedule = () => {
    if (!selectedDate) return [];
    const selectedDateObj = new Date(selectedDate + 'T00:00:00');
    const selectedDay = selectedDateObj.getDay();
    
    console.log('getDailySchedule called with:', {
      selectedDate,
      selectedDay,
      currentUser,
      allClassesFullLength: allClassesFull.length
    });
    
    const filteredItems = allClassesFull.filter(item => {
      console.log('Checking item:', {
        name: item.name,
        creator: item.creator,
        currentUser,
        isShared: item.isShared,
        isRecurring: item.isRecurring,
        day: item.day,
        date: item.date,
        semester: item.semester
      });
      
      // Only show items for the current user
      if (item.creator !== currentUser) {
        console.log('Filtered out - wrong creator:', item.name, item.creator);
        return false;
      }
      
      // Don't show shared items in the main schedule view
      if (item.isShared) {
        console.log('Filtered out - shared item:', item.name);
        return false;
      }
      
      // Check if it's a recurring item
      if (item.isRecurring) {
        // Verify the item is within the semester date range
        const semesterDates = getSemesterDates(item.semester);
        const semesterStart = semesterDates.start.toISOString().split('T')[0];
        const semesterEnd = semesterDates.end.toISOString().split('T')[0];
        
        const isCorrectDay = item.day === selectedDay;
        const isInSemesterRange = selectedDate >= semesterStart && selectedDate <= semesterEnd;
        
        console.log('Recurring item check:', {
          itemName: item.name,
          itemDay: item.day,
          selectedDay,
          isCorrectDay,
          semesterStart,
          semesterEnd,
          selectedDate,
          isInSemesterRange
        });
        
        return isCorrectDay && isInSemesterRange;
      }
      
      // For non-recurring items, check if the date matches
      const dateMatches = item.date === selectedDate;
      console.log('Non-recurring item check:', {
        itemName: item.name,
        itemDate: item.date,
        selectedDate,
        dateMatches
      });
      
      return dateMatches;
    });
    
    console.log('Filtered items:', filteredItems.map(item => ({ name: item.name, time: item.startTime })));
    
    return filteredItems.sort((a, b) => {
      // Sort by start time
      const timeA = a.startTime;
      const timeB = b.startTime;
      return timeA.localeCompare(timeB);
    });
  };

  const getMarkedDates = () => {
    // Use a map to merge dots for the same date
    const dateMap = {};
    allClassesFull.forEach(item => {
      const dotColor = item.semester === semester ? '#a259c6' : '#d1b3ff';
      if (item.isRecurring) {
        const semesterDates = getSemesterDates(item.semester);
        let currentDate = new Date(semesterDates.start);
        while (currentDate <= semesterDates.end) {
          if (currentDate.getDay() === item.day) {
            const dateStr = currentDate.toISOString().split('T')[0];
            if (!dateMap[dateStr]) {
              dateMap[dateStr] = { dots: [{ color: dotColor }] };
            } else {
              // Merge dots if not already present
              if (!dateMap[dateStr].dots.some(dot => dot.color === dotColor)) {
                dateMap[dateStr].dots.push({ color: dotColor });
              }
            }
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else if (item.date) {
        if (!dateMap[item.date]) {
          dateMap[item.date] = { dots: [{ color: dotColor }] };
        } else {
          if (!dateMap[item.date].dots.some(dot => dot.color === dotColor)) {
            dateMap[item.date].dots.push({ color: dotColor });
          }
        }
      }
    });
    if (selectedDate) {
      dateMap[selectedDate] = { ...(dateMap[selectedDate] || {}), selected: true };
    }
    return Object.entries(dateMap);
  };

  const handleDeleteItem = (item) => {
    Alert.alert(
      "Delete Item",
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Remove the original item and any shared copies
              const updatedFull = allClassesFull.filter(cls => {
                // Remove the original item
                if (cls.id === item.id) return false;
                // Remove any shared copies that reference this item
                if (cls.originalId === item.id) return false;
                // Remove any items that share the same name, creator, and time (duplicates)
                if (cls.name === item.name && 
                    cls.creator === item.creator && 
                    cls.startTime === item.startTime && 
                    cls.endTime === item.endTime &&
                    cls.day === item.day &&
                    cls.date === item.date) return false;
                return true;
              });
              
              setAllClassesFull(updatedFull);
              await AsyncStorage.setItem('allClasses', JSON.stringify(updatedFull));
              
              // Update filtered lists for display
              const relevantClasses = updatedFull.filter(cls => cls.creator === currentUser || cls.isShared);
              setAllClasses(relevantClasses);
              setScheduleData(relevantClasses);
              
              // Force immediate recalculation of marked dates
              const newMarkedDatesArray = getMarkedDates();
              const newMarkedDatesObj = {};
              newMarkedDatesArray.forEach(([date, config]) => {
                newMarkedDatesObj[date] = config;
              });
              setMarkedDates(newMarkedDatesObj);
              
              // Force refresh of daily schedule
              if (selectedDate) {
                const schedule = getDailySchedule();
                setDailyClasses(schedule);
              }
              
              Alert.alert("Success", `Successfully deleted ${item.name}`);
            } catch (error) {
              console.error('Error deleting item:', error);
              Alert.alert('Error', 'Failed to delete item. Please try again.');
            }
          }
        }
      ]
    );
  };

  const renderDailyItem = ({ item }) => {
    console.log('renderDailyItem called with:', item);
    return (
      <Animatable.View
        animation="fadeIn"
        style={styles.dailyItem}
      >
        <View style={styles.dailyItemContent}>
          <View style={styles.dailyItemInfo}>
            <Text style={styles.dailyItemTitle}>
              {item.name}
              <Text style={styles.creatorText}> ~{item.creator}</Text>
            </Text>
            <Text style={styles.dailyItemTime}>
              {item.startTime} - {item.endTime}
            </Text>
          </View>
          {/* Show delete icon if this is the current user's item */}
          {item.creator === currentUser && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteItem(item)}
            >
              <Image source={require('../assets/trash.png')} style={styles.deleteIcon} />
            </TouchableOpacity>
          )}
        </View>
        {/* Show share button only on original, un-shared items in the "Your Schedule" tab */}
        {!item.isShared && (
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => handleShare(item)}
          >
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>
        )}
      </Animatable.View>
    );
  };

  // Add useEffect to update daily schedule when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      const schedule = getDailySchedule();
      setDailyClasses(schedule);
    } else {
      setDailyClasses([]);
    }
  }, [selectedDate, allClassesFull, currentUser, semester]);

  // Add useEffect to update marked dates when allClassesFull changes
  useEffect(() => {
    const newMarkedDatesArray = getMarkedDates();
    const newMarkedDatesObj = {};
    newMarkedDatesArray.forEach(([date, config]) => {
      newMarkedDatesObj[date] = config;
    });
    setMarkedDates(newMarkedDatesObj);
  }, [allClassesFull, semester]);

  // Add useEffect to reload classes when the app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        loadClasses();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [currentUser, semester]);

  useEffect(() => {
    setCurrentUser(authUser);
  }, [authUser]);

  // Helper function to generate 15-minute time slots for the day view (compare mode)
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 8;
    const endHour = 22; // 10 PM
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let min = 0; min < 60; min += 15) {
        let displayHour = hour;
        let period = 'AM';
        
        // Convert to 12-hour format
        if (hour === 0) {
          displayHour = 12;
        } else if (hour === 12) {
          period = 'PM';
        } else if (hour > 12) {
          displayHour = hour - 12;
          period = 'PM';
        }
        
        const minStr = min.toString().padStart(2, '0');
        slots.push(`${displayHour}:${minStr} ${period}`);
      }
    }
    return slots;
  };

  // Helper to get event for a user at a specific 15-min interval
  const getEventForUserAtTime = (user, timeLabel) => {
    if (!selectedDate) return 'Free';
    // Parse '8:15 AM', '12:00 PM', etc. to 24-hour time
    const [time, period] = timeLabel.split(' ');
    let [hour, minute] = time.split(':').map(Number);
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    const slotStart = hour * 60 + minute;
    const slotEnd = slotStart + 15; // 15-minute slot

    const selectedDateObj = new Date(selectedDate + 'T00:00:00');
    const selectedDay = selectedDateObj.getDay();

    console.log(`Looking for events for user ${user} at time ${timeLabel} (${slotStart}-${slotEnd}) on day ${selectedDay}`);
    console.log(`Available items for ${user}:`, allClassesFull.filter(item => item.creator === user));

    const event = allClassesFull.find(item => {
      // Find items for the specific user (creator matches user OR item is shared and user is the creator)
      if (item.creator !== user && !(item.isShared && item.creator === user)) return false;
      
      // Parse event start/end
      const [eventStartHour, eventStartMinute] = item.startTime.split(':').map(Number);
      const [eventEndHour, eventEndMinute] = item.endTime.split(':').map(Number);
      const eventStart = eventStartHour * 60 + eventStartMinute;
      const eventEnd = eventEndHour * 60 + eventEndMinute;
      
      // Check if the 15-minute slot overlaps with the event
      if (slotStart < eventEnd && slotEnd > eventStart) {
        if (item.isRecurring) {
          const dayMatches = item.day === selectedDay;
          console.log(`Recurring event ${item.name}: day ${item.day} vs selected ${selectedDay}, matches: ${dayMatches}`);
          return dayMatches;
        }
        const dateMatches = item.date === selectedDate;
        console.log(`One-time event ${item.name}: date ${item.date} vs selected ${selectedDate}, matches: ${dateMatches}`);
        return dateMatches;
      }
      return false;
    });
    
    const result = event ? event.name : 'Free';
    console.log(`Result for ${user} at ${timeLabel}: ${result}`);
    return result;
  };

  useEffect(() => {
    if (startTimeHour && startTimeMinute && startTimeAmPm) {
      let hour = parseInt(startTimeHour, 10);
      if (startTimeAmPm === 'PM' && hour < 12) {
        hour += 12;
      }
      if (startTimeAmPm === 'AM' && hour === 12) {
        hour = 0; // Midnight case
      }
      const formattedHour = hour < 10 ? `0${hour}` : `${hour}`;
      setStartTime(`${formattedHour}:${startTimeMinute}`);
    }
  }, [startTimeHour, startTimeMinute, startTimeAmPm]);

  useEffect(() => {
    if (endTimeHour && endTimeMinute && endTimeAmPm) {
      let hour = parseInt(endTimeHour, 10);
      if (endTimeAmPm === 'PM' && hour < 12) {
        hour += 12;
      }
      if (endTimeAmPm === 'AM' && hour === 12) {
        hour = 0; // Midnight case
      }
      const formattedHour = hour < 10 ? `0${hour}` : `${hour}`;
      setEndTime(`${formattedHour}:${endTimeMinute}`);
    }
  }, [endTimeHour, endTimeMinute, endTimeAmPm]);

  // Force refresh function for immediate updates
  const forceRefresh = async () => {
    await loadClasses();
    if (selectedDate) {
      const schedule = getDailySchedule();
      setDailyClasses(schedule);
    }
  };

  // Helper functions for recurring events:
  function getNextOccurrence(item, selectedDate) {
    // If selectedDate is provided, use that day, otherwise use today
    const baseDate = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date();
    // Set to the correct weekday
    const dayDiff = (item.day - baseDate.getDay() + 7) % 7;
    const nextDate = new Date(baseDate);
    nextDate.setDate(baseDate.getDate() + dayDiff);
    // Set start time
    const [hour, minute] = item.startTime.split(':').map(Number);
    nextDate.setHours(hour, minute, 0, 0);
    return nextDate;
  }
  function getNextOccurrenceEnd(item, selectedDate) {
    const baseDate = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date();
    const dayDiff = (item.day - baseDate.getDay() + 7) % 7;
    const nextDate = new Date(baseDate);
    nextDate.setDate(baseDate.getDate() + dayDiff);
    // Set end time
    const [hour, minute] = item.endTime.split(':').map(Number);
    nextDate.setHours(hour, minute, 0, 0);
    return nextDate;
  }

  return (
    <ImageBackground source={require('../assets/pixel-bg.webp')} style={styles.bg}>
      {/* Decorative Elements */}
      <View style={styles.decorativeContainer}>
        
        <Image source={require('../assets/decor2.gif')} style={[styles.decorativeIcon, { top: 50, right: 10, width: 25, height: 25 }]} />
        <Image source={require('../assets/decor3.gif')} style={[styles.decorativeIcon, { bottom: 100, left: 15, width: 25, height: 25 }]} />
        <Image source={require('../assets/decor4.gif')} style={[styles.decorativeIcon, { bottom: 130, right: 15, width: 25, height: 25 }]} />
      </View>
      
      <Animatable.View animation="bounceIn" style={styles.header}>
        <Image source={require('../assets/kawaii-star.gif')} style={styles.starIcon} />
        <Text style={styles.title}>✨ Schedule Planner ✨</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => setShowHelp(true)}
          >
            <Image source={require('../assets/help.png')} style={styles.helpIcon} />
          </TouchableOpacity>
          
          {/* Debug Button */}
          <TouchableOpacity
            style={styles.debugButton}
            onPress={() => {
              console.log('=== DEBUG INFO ===');
              console.log('Current User:', currentUser);
              console.log('Selected Date:', selectedDate);
              console.log('Current Semester:', semester);
              console.log('Is Comparing:', isComparing);
              console.log('Users Array:', users);
              console.log('All Classes Full Length:', allClassesFull.length);
              console.log('All Classes:', allClassesFull);
              console.log('Daily Classes Length:', dailyClasses.length);
              console.log('Daily Classes:', dailyClasses);
              console.log('getDailySchedule() result:', getDailySchedule());
              console.log('Time Slots Generated:', generateTimeSlots().length);
              console.log('=== END DEBUG INFO ===');
              
              Alert.alert(
                'Debug Info',
                `isComparing: ${isComparing}\nselectedDate: ${selectedDate}\nusers: ${users.length}\nclasses: ${allClassesFull.length}\ntimeSlots: ${generateTimeSlots().length}`,
                [{ text: 'OK' }]
              );
            }}
          >
            <Text style={styles.debugButtonText}>🐛 Debug</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={forceRefresh}
          >
            <Text style={styles.debugButtonText}>Refresh</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.debugShowButton}
            onPress={async () => {
              const savedClasses = await AsyncStorage.getItem('allClasses');
              console.log('=== ASYNCSTORAGE DEBUG ===');
              console.log('Raw saved classes:', savedClasses);
              if (savedClasses) {
                const parsed = JSON.parse(savedClasses);
                console.log('Parsed classes:', parsed);
                console.log('Number of classes:', parsed.length);
              } else {
                console.log('No classes found in AsyncStorage');
              }
              console.log('=== END ASYNCSTORAGE DEBUG ===');
              
              Alert.alert(
                'AsyncStorage Debug',
                `Raw data: ${savedClasses ? savedClasses.substring(0, 200) + '...' : 'null'}`,
                [{ text: 'OK' }]
              );
            }}
          >
            <Text style={styles.debugButtonText}>Storage</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.debugShowButton}
            onPress={() => {
              console.log('=== CURRENT STATE DEBUG ===');
              console.log('Selected Date:', selectedDate);
              console.log('All Classes Full:', allClassesFull);
              console.log('All Classes Full Length:', allClassesFull.length);
              console.log('Current User:', currentUser);
              console.log('Is Comparing:', isComparing);
              console.log('Users:', users);
              console.log('=== END CURRENT STATE DEBUG ===');
              
              Alert.alert(
                'Current State',
                `Selected Date: ${selectedDate}\nClasses: ${allClassesFull.length}\nIs Comparing: ${isComparing}`,
                [{ text: 'OK' }]
              );
            }}
          >
            <Text style={styles.debugButtonText}>State</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.debugShowButton}
            onPress={async () => {
              // Create a single test class for Maria
              const today = new Date();
              const todayString = today.toISOString().split('T')[0];
              const todayDay = today.getDay();
              
              const singleTestClass = {
                id: 'single-test',
                name: 'Test Class',
                creator: 'Maria',
                startTime: '09:00',
                endTime: '10:00',
                day: todayDay,
                date: todayString,
                isRecurring: false,
                semester: 'Fall 2025',
                isShared: false
              };
              
              console.log('Creating single test class:', singleTestClass);
              await AsyncStorage.setItem('allClasses', JSON.stringify([singleTestClass]));
              await loadClasses();
              setSelectedDate(todayString);
              
              Alert.alert('Single Test', 'Created one test class for Maria. Check Compare tab!');
            }}
          >
            <Text style={styles.debugButtonText}>Single Test</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.debugShowButton}
            onPress={async () => {
              // Clear all data
              await AsyncStorage.removeItem('allClasses');
              await loadClasses();
              setSelectedDate(null);
              
              Alert.alert('Cleared', 'All data cleared!');
            }}
          >
            <Text style={styles.debugButtonText}>Clear All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.deleteAllButton}
            onPress={handleDeleteAll}
          >
            <Text style={styles.deleteButtonText}>Delete All</Text>
          </TouchableOpacity>
        </View>
      </Animatable.View>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
      >
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, !isEvent && !isComparing && styles.activeToggle]}
            onPress={() => {
              setIsEvent(false);
              setIsComparing(false);
            }}
          >
            <Text style={styles.toggleText}>Class</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, isEvent && !isComparing && styles.activeToggle]}
            onPress={() => {
              setIsEvent(true);
              setIsComparing(false);
            }}
          >
            <Text style={styles.toggleText}>Event</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, isComparing && styles.activeToggle]}
            onPress={() => {
              setIsComparing(true);
              setIsEvent(false);
            }}
          >
            <Text style={styles.toggleText}>Compare</Text>
          </TouchableOpacity>
        </View>

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.content}>
            {/* Calendar */}
            <Animatable.View animation="fadeInUp" style={styles.calendarContainer}>
              {/* Custom Month Title with Navigation */}
              <View style={styles.calendarHeader}>
                <TouchableOpacity 
                  style={styles.monthNavButton}
                  onPress={() => {
                    const prevMonth = new Date(currentMonth);
                    prevMonth.setMonth(prevMonth.getMonth() - 1);
                    setCurrentMonth(prevMonth);
                  }}
                >
                  <Text style={styles.monthNavButtonText}>‹</Text>
                </TouchableOpacity>
                
                <Text style={styles.calendarMonthTitle}>
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Text>
                
                <TouchableOpacity 
                  style={styles.monthNavButton}
                  onPress={() => {
                    const nextMonth = new Date(currentMonth);
                    nextMonth.setMonth(nextMonth.getMonth() + 1);
                    setCurrentMonth(nextMonth);
                  }}
                >
                  <Text style={styles.monthNavButtonText}>›</Text>
                </TouchableOpacity>
              </View>
              
              <Calendar
                height={350}
                events={allClassesFull
                  .filter(item => item.creator === currentUser && !item.isShared)
                  .map(item => {
                    if (item.isRecurring) {
                      // For recurring classes, create events for the current month
                      const events = [];
                      const semesterDates = getSemesterDates(item.semester);
                      const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
                      const currentMonthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
                      
                      // Find all occurrences in the current month
                      let currentDate = new Date(Math.max(semesterDates.start, currentMonthStart));
                      while (currentDate <= Math.min(semesterDates.end, currentMonthEnd)) {
                        if (currentDate.getDay() === item.day) {
                          const [hour, minute] = item.startTime.split(':').map(Number);
                          const startTime = new Date(currentDate);
                          startTime.setHours(hour, minute, 0, 0);
                          
                          const [endHour, endMinute] = item.endTime.split(':').map(Number);
                          const endTime = new Date(currentDate);
                          endTime.setHours(endHour, endMinute, 0, 0);
                          
                          events.push({
                            title: item.name,
                            start: startTime,
                            end: endTime,
                            color: item.isEvent ? '#ff69b4' : '#a259c6',
                            id: `${item.id}-${currentDate.toISOString().split('T')[0]}`,
                          });
                        }
                        currentDate.setDate(currentDate.getDate() + 1);
                      }
                      return events;
                    } else {
                      // For one-time events
                      return [{
                        title: item.name,
                        start: new Date(item.date + 'T' + item.startTime),
                        end: new Date(item.date + 'T' + item.endTime),
                        color: item.isEvent ? '#ff69b4' : '#a259c6',
                        id: item.id,
                      }];
                    }
                  })
                  .flat()}
                mode="month"
                date={currentMonth}
                onPressEvent={event => {
                  // Extract the original date from the event ID or start time
                  const eventDate = event.start.toISOString().split('T')[0];
                  setSelectedDate(eventDate);
                }}
                onPressCell={date => {
                  // Fix timezone issue by using local date
                  const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
                  const dateString = localDate.toISOString().split('T')[0];
                  setSelectedDate(dateString);
                }}
                onPressDateHeader={date => {
                  // Fix timezone issue by using local date
                  const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
                  const dateString = localDate.toISOString().split('T')[0];
                  setSelectedDate(dateString);
                }}
                onMonthChange={date => {
                  setCurrentMonth(date);
                }}
                theme={{
                  palette: {
                    primary: '#a259c6',
                    secondary: '#ff69b4',
                  },
                  eventCellOverlappings: [
                    { main: '#a259c6', others: '#ffb6c1' },
                  ],
                  header: {
                    dayHeader: {
                      fontWeight: 'bold',
                      color: '#6e3abf',
                    },
                    monthHeader: {
                      fontWeight: 'bold',
                      color: '#6e3abf',
                      fontSize: 16,
                    },
                  },
                }}
              />
            </Animatable.View>

            {/* Add Form - Only show in Class and Event tabs */}
            {!isComparing && (
              <Animatable.View animation="fadeInUp" delay={100} style={styles.eventCard}>
                <Text style={styles.eventCardTitle}>
                  {isEvent ? 'Add New Event' : 'Add New Class'}
                </Text>
                {!isEvent && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Class Name</Text>
                    <TextInput
                      style={styles.input}
                      value={className}
                      onChangeText={setClassName}
                      placeholder="Enter class name"
                      placeholderTextColor="#d1b3ff"
                    />
                  </View>
                )}
                {isEvent && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Event Description</Text>
                    <TextInput
                      style={styles.input}
                      value={eventDescription}
                      onChangeText={setEventDescription}
                      placeholder="Enter event description"
                      placeholderTextColor="#d1b3ff"
                    />
                  </View>
                )}
                <View style={[styles.timeContainer, { zIndex: 6 }]}>
                  <View style={styles.timeInput}>
                    <Text style={styles.inputLabel}>Start Time</Text>
                    <View style={styles.timeRowContainer}>
                      <DropDownPicker
                        open={startHourOpen}
                        value={startTimeHour}
                        items={Array.from({ length: 12 }, (_, i) => ({ label: `${i + 1}`, value: `${i + 1}` }))}
                        setOpen={setStartHourOpen}
                        setValue={setStartTimeHour}
                        placeholder="Hr"
                        containerStyle={{ flex: 1, marginRight: 5 }}
                        style={styles.picker}
                        dropDownContainerStyle={styles.pickerDropdown}
                        textStyle={styles.pickerText}
                        listMode="SCROLLVIEW"
                      />
                      <DropDownPicker
                        open={startMinuteOpen}
                        value={startTimeMinute}
                        items={[
                          { label: '00', value: '00' },
                          { label: '15', value: '15' },
                          { label: '30', value: '30' },
                          { label: '45', value: '45' },
                        ]}
                        setOpen={setStartMinuteOpen}
                        setValue={setStartTimeMinute}
                        placeholder="Min"
                        containerStyle={{ flex: 1, marginRight: 5 }}
                        style={styles.picker}
                        dropDownContainerStyle={styles.pickerDropdown}
                        textStyle={styles.pickerText}
                        listMode="SCROLLVIEW"
                      />
                      <DropDownPicker
                        open={startAmPmOpen}
                        value={startTimeAmPm}
                        items={[{ label: 'AM', value: 'AM' }, { label: 'PM', value: 'PM' }]}
                        setOpen={setStartAmPmOpen}
                        setValue={setStartTimeAmPm}
                        placeholder="AM/PM"
                        containerStyle={{ flex: 1 }}
                        style={styles.picker}
                        dropDownContainerStyle={styles.pickerDropdown}
                        textStyle={styles.pickerText}
                        listMode="SCROLLVIEW"
                      />
                    </View>
                  </View>
                </View>
                <View style={[styles.timeContainer, { zIndex: 5 }]}>
                  <View style={styles.timeInput}>
                    <Text style={styles.inputLabel}>End Time</Text>
                    <View style={styles.timeRowContainer}>
                      <DropDownPicker
                        open={endHourOpen}
                        value={endTimeHour}
                        items={Array.from({ length: 12 }, (_, i) => ({ label: `${i + 1}`, value: `${i + 1}` }))}
                        setOpen={setEndHourOpen}
                        setValue={setEndTimeHour}
                        placeholder="Hr"
                        containerStyle={{ flex: 1, marginRight: 5 }}
                        style={styles.picker}
                        dropDownContainerStyle={styles.pickerDropdown}
                        textStyle={styles.pickerText}
                        listMode="SCROLLVIEW"
                      />
                      <DropDownPicker
                        open={endMinuteOpen}
                        value={endTimeMinute}
                        items={[
                          { label: '00', value: '00' },
                          { label: '15', value: '15' },
                          { label: '30', value: '30' },
                          { label: '45', value: '45' },
                        ]}
                        setOpen={setEndMinuteOpen}
                        setValue={setEndTimeMinute}
                        placeholder="Min"
                        containerStyle={{ flex: 1, marginRight: 5 }}
                        style={styles.picker}
                        dropDownContainerStyle={styles.pickerDropdown}
                        textStyle={styles.pickerText}
                        listMode="SCROLLVIEW"
                      />
                      <DropDownPicker
                        open={endAmPmOpen}
                        value={endTimeAmPm}
                        items={[{ label: 'AM', value: 'AM' }, { label: 'PM', value: 'PM' }]}
                        setOpen={setEndAmPmOpen}
                        setValue={setEndTimeAmPm}
                        placeholder="AM/PM"
                        containerStyle={{ flex: 1 }}
                        style={styles.picker}
                        dropDownContainerStyle={styles.pickerDropdown}
                        textStyle={styles.pickerText}
                        listMode="SCROLLVIEW"
                      />
                    </View>
                  </View>
                </View>
                {!isEvent && (
                  <>
                    <View style={[styles.inputContainer, { zIndex: 4 }]}>
                      <Text style={styles.inputLabel}>Semester</Text>
                      <DropDownPicker
                        open={semesterOpen}
                        value={semester}
                        items={[
                          { label: 'Fall 2025', value: 'Fall 2025' },
                          { label: 'Spring 2026', value: 'Spring 2026' }
                        ]}
                        setOpen={setSemesterOpen}
                        setValue={setSemester}
                        listMode="SCROLLVIEW"
                        style={styles.picker}
                        dropDownContainerStyle={styles.pickerDropdown}
                        textStyle={styles.pickerText}
                      />
                    </View>
                    <View style={[styles.inputContainer, { zIndex: 3 }]}>
                      <Text style={styles.inputLabel}>Day of Week</Text>
                      <DropDownPicker
                        open={dayOpen}
                        value={day}
                        items={days}
                        setOpen={setDayOpen}
                        setValue={setDay}
                        listMode="SCROLLVIEW"
                        style={styles.picker}
                        dropDownContainerStyle={styles.pickerDropdown}
                        textStyle={styles.pickerText}
                      />
                    </View>
                  </>
                )}
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={handleAddClass}
                >
                  <Text style={styles.addButtonText}>
                    {isEvent ? 'Add Event' : 'Add Class'}
                  </Text>
                </TouchableOpacity>
              </Animatable.View>
            )}

            {/* Daily Schedule */}
            {!isComparing && (
              <Animatable.View animation="fadeInUp" delay={200} style={styles.dailySchedule}>
                <Text style={styles.dailyTitle}>
                  Your Schedule for {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString() : 'Selected Day'}
                </Text>
                {console.log('dailyClasses state:', dailyClasses)}
                {dailyClasses.length > 0 ? (
                  <ScrollView
                    style={styles.dailyList}
                    showsVerticalScrollIndicator={true}
                    nestedScrollEnabled={true}
                    scrollEnabled={true}
                  >
                    {dailyClasses.map((item, index) => (
                      <View key={item.id || index}>
                        {renderDailyItem({ item })}
                      </View>
                    ))}
                  </ScrollView>
                ) : (
                  <Text style={styles.noScheduleText}>
                    No schedule for this day
                  </Text>
                )}
              </Animatable.View>
            )}

            {/* Group Schedule View */}
            {isComparing && (
              <Animatable.View animation="fadeInUp" delay={200} style={[styles.groupScheduleContainer, { position: 'relative' }]}> 
                <Text style={styles.dailyTitle}>
                  Group Schedule {selectedDate ? `for ${new Date(selectedDate).toLocaleDateString()}` : '(Select a date)'}
                </Text>
                {!selectedDate && (
                  <Text style={styles.noScheduleText}>Please select a date from the calendar above to view the group schedule</Text>
                )}
                {selectedDate && (
                  <View style={styles.compareContainer}>
                    <ScrollView
                      ref={(ref) => setTimeListRef(ref)}
                      showsVerticalScrollIndicator={true}
                      style={styles.timeTableScroll}
                      nestedScrollEnabled={true}
                      scrollEnabled={true}
                      onScroll={(event) => {
                        setCurrentScrollY(event.nativeEvent.contentOffset.y);
                      }}
                      scrollEventThrottle={16}
                    >
                      {/* Time Slots */}
                      {generateTimeSlots().map((time, index) => (
                        <View key={time} style={styles.timeSlotContainer}>
                          <Text style={styles.timeSlotLabel}>{time}</Text>
                          <View style={styles.usersRow}>
                            {users.map(user => (
                              <View key={user} style={styles.userCell}>
                                <Text style={styles.userName}>{user}</Text>
                                <Text style={[styles.userSchedule, getEventForUserAtTime(user, time) !== 'Free' && styles.busyCell]}>
                                  {getEventForUserAtTime(user, time)}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      ))}
                    </ScrollView>
                    
                    {/* Scroll Navigation Buttons */}
                    <View style={styles.scrollNavigation}>
                      <TouchableOpacity
                        style={styles.scrollButton}
                        onPress={() => {
                          if (timeListRef) {
                            // Scroll up slowly by 300 pixels from current position
                            const newY = Math.max(0, currentScrollY - 300);
                            timeListRef.scrollTo({ y: newY, animated: true });
                          }
                        }}
                      >
                        <Text style={styles.scrollButtonText}>▲</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.scrollButton}
                        onPress={() => {
                          if (timeListRef) {
                            // Scroll down slowly by 300 pixels from current position
                            const newY = currentScrollY + 300;
                            timeListRef.scrollTo({ y: newY, animated: true });
                          }
                        }}
                      >
                        <Text style={styles.scrollButtonText}>▼</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </Animatable.View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
      <HelpOverlay 
        visible={showHelp} 
        tab="schedule" 
        onClose={() => setShowHelp(false)} 
      />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#f9f6fc',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 0,
    backgroundColor: 'transparent',
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80,
    backgroundColor: 'transparent',
    minHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 4,
    backgroundColor: '#fff0fa',
  },
  starIcon: {
    width: 25,
    height: 25,
    marginRight: 6,
  },
  title: {
    fontSize: 12,
    color: '#6e3abf',
    fontWeight: 'bold',
    fontFamily: 'PressStart2P',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7d57c3',
    marginBottom: 12,
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: '#f96565',
    borderRadius: 20,
    paddingVertical: 10,
    marginBottom: 20,
    width: '60%',
    alignSelf: 'center',
    shadowColor: '#d94e4e',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  resetButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'PressStart2P',
    fontSize: 8,
  },
  dropdownContainer: {
    height: 50,
    marginBottom: 15,
  },
  dropdown: {
    backgroundColor: '#f3c6f6',
    borderColor: '#d1b3ff',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  dropdownList: {
    backgroundColor: '#fff0fa',
    borderColor: '#d1b3ff',
    borderRadius: 12,
  },
  dropdownText: {
    color: '#a259c6',
    fontWeight: 'bold',
    fontSize: 8,
    fontFamily: 'PressStart2P',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#d1b3ff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 8,
    color: '#5c3c9d',
    marginBottom: 15,
    shadowColor: '#a259c6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
    fontFamily: 'PressStart2P',
  },
  addButton: {
    backgroundColor: '#a259c6',
    borderRadius: 25,
    paddingVertical: 14,
    marginVertical: 20,
    marginHorizontal: 20,
    shadowColor: '#6a3ba2',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 10,
    textAlign: 'center',
    fontFamily: 'PressStart2P',
  },
  classListContainer: {
    marginTop: 10,
    backgroundColor: '#e9d6ff',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#b292ff',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  classCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#c8a2ff',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  className: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6e3abf',
    fontFamily: 'PressStart2P',
  },
  classTime: {
    fontSize: 8,
    color: '#7a58b8',
    fontFamily: 'PressStart2P',
  },
  calendarContainer: {
    marginTop: 20,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    backgroundColor: '#fff0fa',
    borderWidth: 1,
    borderColor: '#d1b3ff',
    height: 420, // Fixed height to ensure calendar is visible
  },
  deleteButton: {
    padding: 5,
    borderRadius: 8,
    backgroundColor: '#ffe6e6',
    borderWidth: 1,
    borderColor: '#ff6b6b',
  },
  deleteAllButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#ff4757',
    alignItems: 'center',
    justifyContent: 'center',
  },
  debugButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#45a049',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  debugShowButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#1976D2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  debugButtonText: {
    fontFamily: 'PressStart2P',
    fontSize: 6,
    color: '#fff',
  },
  deleteButtonText: {
    fontFamily: 'PressStart2P',
    fontSize: 6,
    color: '#fff',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  toggleButton: {
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#e9d6ff',
    borderWidth: 2,
    borderColor: '#d1b3ff',
    minWidth: 80,
  },
  activeToggle: {
    backgroundColor: '#d1b3ff',
  },
  toggleText: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#6e3abf',
    textAlign: 'center',
  },
  eventCard: {
    borderColor: '#ff85a2',
    backgroundColor: '#ffeef8'
  },
  creatorText: {
    fontSize: 8,
    color: '#d291bc',
    fontStyle: 'italic',
    fontFamily: 'PressStart2P',
  },
  semesterText: {
    fontFamily: 'PressStart2P',
    fontSize: 6,
    color: '#d291bc',
    marginTop: 5,
  },
  noClassesText: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#d291bc',
    textAlign: 'center',
    marginTop: 20,
  },
  noClassesContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#ffeef8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffb6c1'
  },
  debugText: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#666',
    marginBottom: 4
  },
  button: {
    backgroundColor: '#ccc',
    borderRadius: 20,
    paddingVertical: 10,
    marginVertical: 20,
    marginHorizontal: 50,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  debugContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8
  },
  dailyItem: {
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#fff0fa',
    borderWidth: 2,
    borderColor: '#d1b3ff',
    shadowColor: '#a259c6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  dailyItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dailyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  dailyItemInfo: {
    flex: 1,
  },
  dailyItemTitle: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    color: '#6e3abf',
    marginBottom: 5,
  },
  dailyItemTime: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#7a58b8',
  },
  dailyItemSubtitle: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#a259c6',
  },
  dailySchedule: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#b292ff',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    minHeight: 150,
    maxHeight: 400,
    borderWidth: 2,
    borderColor: '#d1b3ff',
    zIndex: 1000,
  },
  dailyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6e3abf',
    marginBottom: 10,
  },
  dailyList: {
    minHeight: 100,
  },
  shareButton: {
    backgroundColor: '#6e3abf',
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 10,
    minWidth: 50,
    alignItems: 'center',
  },
  shareButtonText: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#fff',
  },
  eventCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6e3abf',
    marginBottom: 10,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    color: '#6e3abf',
    marginBottom: 5,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  timeInput: {
    flex: 1,
  },
  timeRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  picker: {
    backgroundColor: '#f3c6f6',
    borderColor: '#d1b3ff',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  pickerDropdown: {
    backgroundColor: '#fff0fa',
    borderColor: '#d1b3ff',
    borderRadius: 12,
  },
  pickerText: {
    color: '#a259c6',
    fontFamily: 'PressStart2P',
    fontSize: 12,
  },
  pickerPlaceholder: {
    color: '#d1b3ff',
    fontFamily: 'PressStart2P',
    fontSize: 12,
  },
  noScheduleText: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    color: '#a259c6',
    textAlign: 'center',
    marginTop: 20,
  },
  groupScheduleContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#b292ff',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    height: Dimensions.get('window').height * 0.75,
    marginBottom: 20,
    overflow: 'hidden', // Prevent overflow
  },
  compareContainer: {
    flex: 1,
    minHeight: 200,
    overflow: 'hidden',
  },
  timeTableScroll: {
    flex: 1,
  },
  timeSlotContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#d1b3ff',
    backgroundColor: '#fff',
    marginBottom: 2,
    borderRadius: 8,
  },
  timeSlotLabel: {
    fontWeight: 'bold',
    color: '#6e3abf',
    fontFamily: 'PressStart2P',
    fontSize: 10,
    marginBottom: 8,
    textAlign: 'center',
  },
  usersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  userCell: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  userName: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#6e3abf',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  userSchedule: {
    fontFamily: 'PressStart2P',
    fontSize: 7,
    color: '#7a58b8',
    textAlign: 'center',
  },
  busyCell: {
    fontWeight: 'bold',
    color: '#ff6b6b',
    backgroundColor: '#ffe6e6',
    borderRadius: 4,
    paddingVertical: 2,
  },
  deleteIcon: {
    width: 16,
    height: 16,
    marginLeft: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpButton: {
    padding: 10,
    marginRight: 10,
  },
  helpIcon: {
    width: 20,
    height: 20,
  },
  scrollNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  scrollButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#e9d6ff',
    borderWidth: 2,
    borderColor: '#d1b3ff',
  },
  scrollButtonText: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    color: '#6e3abf',
  },
  calendarMonthTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6e3abf',
    fontFamily: 'PressStart2P',
    textAlign: 'center',
    backgroundColor: '#f8f0ff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#d1b3ff',
    shadowColor: '#a259c6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  monthNavButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#e9d6ff',
    borderWidth: 2,
    borderColor: '#d1b3ff',
    minWidth: 35,
    minHeight: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#a259c6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  monthNavButtonText: {
    fontSize: 18,
    color: '#6e3abf',
    fontWeight: 'bold',
    fontFamily: 'PressStart2P',
    textAlign: 'center',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 10,
  },
});

export default SchedulePlanner;
