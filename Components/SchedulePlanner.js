import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, ScrollView, Dimensions, Image, FlatList, Keyboard, ImageBackground, TouchableWithoutFeedback, Switch, AppState, Animated } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MonthCalendar } from '@quidone/react-native-calendars';
import { useSchedule } from './ScheduleContext';
import { useAuth } from './AuthContext';

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

  // Fix: use useRef() instead of React.createRef() for functional components
  const groupScrollRef = useRef();
  const groupVerticalScrollRef = useRef();

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
      let fullList = savedClasses ? JSON.parse(savedClasses) : [];
      setAllClassesFull(fullList);
      // Only filter for display
      const relevantClasses = fullList.filter(cls => cls.creator === currentUser || cls.isShared);
      setAllClasses(relevantClasses);
      setScheduleData(relevantClasses);
      // Update marked dates for all loaded classes
      const newMarkedDates = {};
      relevantClasses.forEach(item => {
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
        if (allClasses.length > 0) {
          console.log('Saving classes:', allClasses);
          await AsyncStorage.setItem('allClasses', JSON.stringify(allClasses));
          console.log('Successfully saved classes to AsyncStorage');
        }
      } catch (error) {
        console.error('Error saving classes:', error);
      }
    };

    saveClasses();
  }, [allClasses]);

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
            // Remove only current user's items (including their shared items)
            const updatedFull = allClassesFull.filter(item => item.creator !== currentUser);
            setAllClassesFull(updatedFull);
            await AsyncStorage.setItem('allClasses', JSON.stringify(updatedFull));
            // Update filtered lists for display
            const relevantClasses = updatedFull.filter(cls => cls.creator === currentUser || cls.isShared);
            setAllClasses(relevantClasses);
            setScheduleData(relevantClasses);
            // Update marked dates using updatedFull
            const newMarkedDates = {};
            updatedFull.forEach(item => {
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
              } else if (item.date) {
                newMarkedDates[item.date] = { 
                  marked: true, 
                  dotColor: item.semester === semester ? '#a259c6' : '#d1b3ff',
                  selected: item.semester === semester
                };
              }
            });
            setMarkedDates(newMarkedDates);
            Alert.alert("Success", "All your classes and events have been deleted.");
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
      // Update marked dates as before
      const newMarkedDates = { ...markedDates };
      if (!isEvent) {
        const semesterDates = getSemesterDates(semester);
        let currentDate = new Date(semesterDates.start);
        while (currentDate <= semesterDates.end) {
          if (currentDate.getDay() === day) {
            const dateStr = currentDate.toISOString().split('T')[0];
            newMarkedDates[dateStr] = { 
              marked: true, 
              dotColor: '#a259c6',
              selected: true
            };
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else {
        newMarkedDates[selectedDate] = { 
          marked: true, 
          dotColor: '#a259c6',
          selected: true
        };
      }
      setMarkedDates(newMarkedDates);
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
      setSelectedDate(null);
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
    // Build YYYY-MM-DD in local time
    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObj.getDate().toString().padStart(2, '0');
    const dayString = `${year}-${month}-${day}`;
    setSelectedDate(dayString);
    const selectedDay = dateObj.getDay();
    const filtered = allClassesFull.filter(cls => {
      if (cls.creator !== currentUser) return false;
      if (cls.isRecurring) {
        return cls.day === selectedDay && dayString >= cls.semesterStart && dayString <= cls.semesterEnd;
      } else {
        return cls.date === dayString;
      }
    });
    setDailyClasses(filtered);
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

      // Re-calculate marked dates
      const newMarkedDates = getMarkedDates();
      setMarkedDates(newMarkedDates);

      Alert.alert("Shared!", `${item.type === 'class' ? 'Class' : 'Event'} has been shared.`);

    } catch (error) {
      Alert.alert('Error', 'Failed to share item: ' + error.message);
    }
  };

  const getDailySchedule = () => {
    if (!selectedDate) return [];
    const selectedDateObj = new Date(selectedDate + 'T00:00:00');
    const selectedDay = selectedDateObj.getDay();
    return allClassesFull.filter(item => {
      // Only show the original (not shared) items for the current user
      if (item.creator !== currentUser) return false;
      if (item.isShared) return false;
      if (item.isRecurring) {
        return item.day === selectedDay && selectedDate >= item.semesterStart && selectedDate <= item.semesterEnd;
      }
      return item.date === selectedDate;
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
      'Delete',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            // Only remove if the item belongs to the current user
            const updatedFull = allClassesFull.filter(i => !(i.id === item.id && i.creator === currentUser));
            setAllClassesFull(updatedFull);
            await AsyncStorage.setItem('allClasses', JSON.stringify(updatedFull));
            // Update filtered lists for display
            const relevantClasses = updatedFull.filter(cls => cls.creator === currentUser || cls.isShared);
            setAllClasses(relevantClasses);
            setScheduleData(relevantClasses);
            // Update marked dates
            const newMarkedDates = getMarkedDates();
            setMarkedDates(newMarkedDates);
          }
        }
      ]
    );
  };

  const renderDailyItem = ({ item }) => (
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

  // Add useEffect to update daily schedule when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      const schedule = getDailySchedule();
      setDailyClasses(schedule);
    }
  }, [selectedDate, allClassesFull, isComparing]);

  // Add console.log for debugging
  useEffect(() => {
    if (selectedDate) {
      console.log('Selected Date:', selectedDate);
      console.log('All Classes:', allClasses);
      console.log('Marked Dates:', markedDates);
      console.log('Daily Schedule:', getDailySchedule());
    }
  }, [selectedDate, allClasses, markedDates]);

  // Add useEffect to reload classes when the app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        console.log('App came to foreground, reloading classes...'); // Debug log
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

  // Helper function to generate 15-minute time slots for the day view
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 8;
    const endHour = 23; // 11 PM
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let min = 0; min < 60; min += 15) {
        let displayHour = hour;
        let period = 'AM';
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
    const slotEnd = slotStart + 15;
    const selectedDateObj = new Date(selectedDate + 'T00:00:00');
    const selectedDay = selectedDateObj.getDay();
    const event = allClassesFull.find(item => {
      if (item.creator !== user) return false;
      // Parse event start/end
      const [eventStartHour, eventStartMinute] = item.startTime.split(':').map(Number);
      const [eventEndHour, eventEndMinute] = item.endTime.split(':').map(Number);
      const eventStart = eventStartHour * 60 + eventStartMinute;
      const eventEnd = eventEndHour * 60 + eventEndMinute;
      // Mark busy if slot overlaps event, or if slotEnd === eventEnd (so the slot ending exactly at the event end is busy)
      if ((slotStart < eventEnd && slotEnd > eventStart) || slotEnd === eventEnd) {
        if (item.isRecurring) {
          return item.day === selectedDay;
        }
        return item.date === selectedDate;
      }
      return false;
    });
    return event ? event.name : 'Free';
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

  return (
    <ImageBackground source={require('../assets/pixel-bg.png')} style={styles.bg}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Decorative Elements */}
        <View style={styles.decorativeContainer}>
          
          <Image source={require('../assets/decor2.gif')} style={[styles.decorativeIcon, { top: 50, right: 10, width: 25, height: 25 }]} />
          <Image source={require('../assets/decor3.gif')} style={[styles.decorativeIcon, { bottom: 100, left: 15, width: 25, height: 25 }]} />
          <Image source={require('../assets/decor4.gif')} style={[styles.decorativeIcon, { bottom: 130, right: 15, width: 25, height: 25 }]} />
        </View>
        
        <Animatable.View animation="bounceIn" style={styles.header}>
          <Image source={require('../assets/kawaii-star.gif')} style={styles.starIcon} />
          <Text style={styles.title}>✨ Schedule Planner ✨</Text>
          <TouchableOpacity 
            style={styles.deleteAllButton}
            onPress={handleDeleteAll}
          >
            <Text style={styles.deleteButtonText}>Delete All</Text>
          </TouchableOpacity>
        </Animatable.View>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
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
                <MonthCalendar
                  selectedDay={selectedDate ? new Date(selectedDate) : undefined}
                  onDayPress={handleDayPress}
                  markedDays={getMarkedDates()}
                  theme={{
                    calendarBackground: '#fff0fa',
                    monthTitleColor: '#6e3abf',
                    dayContainerSize: 32,
                    daySelectedBgColor: { value: '#a259c6' },
                    daySelectedColor: { value: '#ffffff' },
                    todayTextColor: '#ff69b4',
                    dayTextColor: '#6e3abf',
                    dayDisabledOpacity: 0.4,
                    dayDotSize: 4,
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
                  {getDailySchedule().length > 0 ? (
                    <FlatList
                      data={getDailySchedule()}
                      renderItem={renderDailyItem}
                      keyExtractor={item => item.id}
                      style={styles.dailyList}
                    />
                  ) : (
                    <Text style={styles.noScheduleText}>
                      No schedule for this day
                    </Text>
                  )}
                </Animatable.View>
              )}

              {/* Group Schedule View */}
              {isComparing && selectedDate && (
                <Animatable.View animation="fadeInUp" delay={200} style={[styles.groupScheduleContainer, { position: 'relative' }]}> 
                  <Text style={styles.dailyTitle}>Group Schedule for {new Date(selectedDate).toLocaleDateString()}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity
                      style={styles.scrollButton}
                      onPress={() => {
                        if (groupScrollRef.current) {
                          groupScrollRef.current.scrollTo({ x: 0, animated: true });
                        }
                      }}
                    >
                      <Text style={styles.scrollButtonText}>{'<'}</Text>
                    </TouchableOpacity>
                    <ScrollView
                      horizontal
                      ref={groupScrollRef}
                      showsHorizontalScrollIndicator={false}
                      style={{ flex: 1 }}
                    >
                      <ScrollView
                        ref={groupVerticalScrollRef}
                        showsVerticalScrollIndicator={true}
                      >
                        <View style={{ paddingBottom: 80 }}>
                          <View style={styles.groupHeaderRow}>
                            <Text style={styles.timeSlotHeader}>Time</Text>
                            {users.map(user => <Text key={user} style={styles.userHeader}>{user}</Text>)}
                          </View>
                          {generateTimeSlots().map(time => (
                            <View key={time} style={styles.groupRow}>
                              <Text style={styles.timeSlot}>{time}</Text>
                              {users.map(user => (
                                <Text key={user} style={[styles.scheduleCell, getEventForUserAtTime(user, time) !== 'Free' && styles.busyCell]}>
                                  {getEventForUserAtTime(user, time)}
                                </Text>
                              ))}
                            </View>
                          ))}
                        </View>
                      </ScrollView>
                    </ScrollView>
                    <TouchableOpacity
                      style={styles.scrollButton}
                      onPress={() => {
                        if (groupScrollRef.current) {
                          groupScrollRef.current.scrollTo({ x: 1000, animated: true });
                        }
                      }}
                    >
                      <Text style={styles.scrollButtonText}>{'>'}</Text>
                    </TouchableOpacity>
                  </View>
                  {/* Floating Scroll to Bottom Button */}
                  <TouchableOpacity
                    style={styles.scrollToBottomButton}
                    onPress={() => {
                      if (groupVerticalScrollRef.current) {
                        groupVerticalScrollRef.current.scrollToEnd({ animated: true });
                      }
                    }}
                  >
                    <Text style={styles.scrollToBottomText}>↓</Text>
                  </TouchableOpacity>
                </Animatable.View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </SafeAreaView>
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
    paddingTop: 12,
    backgroundColor: 'transparent',
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 6,
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
    borderColor: '#d1b3ff'
  },
  deleteButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 10,
    minWidth: 0,
    minHeight: 0,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
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
  },
  dailyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6e3abf',
    marginBottom: 10,
  },
  dailyList: {
    marginTop: 10,
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
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#b292ff',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  groupHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#d1b3ff',
    paddingBottom: 5,
  },
  timeSlotHeader: {
    width: 80,
    fontWeight: 'bold',
    color: '#6e3abf',
  },
  userHeader: {
    width: 120,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#6e3abf',
  },
  groupRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e9d6ff',
  },
  timeSlot: {
    width: 80,
    color: '#a259c6',
  },
  scheduleCell: {
    width: 120,
    textAlign: 'center',
    color: '#7a58b8',
  },
  busyCell: {
    fontWeight: 'bold',
    color: '#ff6b6b',
  },
  deleteIcon: {
    width: 16,
    height: 16,
    marginLeft: 4,
  },
  scrollButton: {
    backgroundColor: '#d1b3ff',
    borderRadius: 20,
    padding: 10,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  scrollButtonText: {
    fontSize: 18,
    color: '#6e3abf',
    fontWeight: 'bold',
    fontFamily: 'PressStart2P',
  },
  scrollToBottomButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#a259c6',
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#6e3abf',
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  scrollToBottomText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'PressStart2P',
    textAlign: 'center',
    marginTop: -2,
  },
  decorativeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  decorativeIcon: {
    position: 'absolute',
  },
});

export default SchedulePlanner;
