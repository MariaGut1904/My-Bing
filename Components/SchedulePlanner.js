import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, ScrollView, Dimensions, Image, FlatList, Keyboard, ImageBackground, TouchableWithoutFeedback, Switch, AppState } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar } from 'react-native-calendars';
import { useSchedule } from './ScheduleContext';

const { width } = Dimensions.get('window');

const SchedulePlanner = () => {
  const { scheduleData, setScheduleData } = useSchedule();
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
  const [isShared, setIsShared] = useState(false);
  const [eventDescription, setEventDescription] = useState('');
  const [currentUser, setCurrentUser] = useState('You');
  const [showEventsInCalendar, setShowEventsInCalendar] = useState(true);
  const [semesterOpen, setSemesterOpen] = useState(false);
  const [dayOpen, setDayOpen] = useState(false);

  // Load classes when component mounts
  useEffect(() => {
    const loadClasses = async () => {
      try {
        console.log('Loading classes for user:', currentUser);
        const savedClasses = await AsyncStorage.getItem('allClasses');
        console.log('Raw saved classes:', savedClasses);
        
        if (savedClasses) {
          const parsedClasses = JSON.parse(savedClasses);
          console.log('Parsed classes:', parsedClasses);
          
          // Only load classes that are either created by current user or shared
          const relevantClasses = parsedClasses.filter(cls => {
            const isRelevant = cls.creator === currentUser || cls.isShared;
            console.log('Class:', cls.name, 'isRelevant:', isRelevant, 'creator:', cls.creator, 'isShared:', cls.isShared);
            return isRelevant;
          });
          
          console.log('Setting relevant classes:', relevantClasses);
          setAllClasses(relevantClasses);
          setScheduleData(relevantClasses);
          
          // Update marked dates for all loaded classes
          const newMarkedDates = {};
          relevantClasses.forEach(item => {
            if (item.isRecurring) {
              const semesterDates = getSemesterDates(semester);
              let currentDate = new Date(semesterDates.start);
              while (currentDate <= semesterDates.end) {
                if (currentDate.getDay() === item.day) {
                  const dateStr = currentDate.toISOString().split('T')[0];
                  newMarkedDates[dateStr] = { marked: true, dotColor: '#a259c6' };
                }
                currentDate.setDate(currentDate.getDate() + 1);
              }
            } else {
              newMarkedDates[item.date] = { marked: true, dotColor: '#a259c6' };
            }
          });
          setMarkedDates(newMarkedDates);
        }
      } catch (error) {
        console.error('Error loading classes:', error);
      }
    };

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

  const resetSchedule = async () => {
    Alert.alert(
      "Reset Schedule",
      "Are you sure you want to clear all classes?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset", 
          onPress: async () => {
            setAllClasses([]);
            setDailyClasses([]);
            setMarkedDates({});
            await AsyncStorage.removeItem('classes');
          }
        }
      ]
    );
  };

  const handleDeleteAll = () => {
    Alert.alert(
      "Delete All",
      "Are you sure you want to delete all classes and events? This cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete All",
          style: "destructive",
          onPress: () => {
            setAllClasses([]);
            setScheduleData([]);
            Alert.alert("Success", "All classes and events have been deleted.");
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

  const handleAddClass = () => {
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

    const semesterDates = getSemesterDates(semester);
    const selectedDateObj = new Date(selectedDate);
    
    if (selectedDateObj < semesterDates.start || selectedDateObj > semesterDates.end) {
      Alert.alert(
        "Invalid Date",
        `Please select a date between ${semesterDates.start.toLocaleDateString()} and ${semesterDates.end.toLocaleDateString()} for ${semester}`,
        [{ text: "OK" }]
      );
      return;
    }

    const itemDay = isEvent ? selectedDateObj.getDay() : day;
    const dateStr = selectedDate.split('T')[0]; // Format: YYYY-MM-DD
    
    const newItem = {
      id: Date.now().toString(),
      type: isEvent ? 'event' : 'class',
      name: isEvent ? eventDescription : className,
      startTime,
      endTime,
      day: itemDay,
      date: dateStr,
      isRecurring: !isEvent,
      creator: currentUser,
      semester: semester,
      ...(isEvent ? { description: eventDescription } : { className })
    };

    const updatedClasses = [...allClasses, newItem];
    setAllClasses(updatedClasses);
    setScheduleData(updatedClasses);
    
    // Update marked dates
    const newMarkedDates = { ...markedDates };
    if (isEvent) {
      newMarkedDates[dateStr] = { marked: true, dotColor: '#a259c6' };
    } else {
      // For recurring classes, mark all dates in the semester
      const semesterDates = getSemesterDates(semester);
      let currentDate = new Date(semesterDates.start);
      while (currentDate <= semesterDates.end) {
        if (currentDate.getDay() === itemDay) {
          const dateStr = currentDate.toISOString().split('T')[0];
          newMarkedDates[dateStr] = { marked: true, dotColor: '#a259c6' };
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    setMarkedDates(newMarkedDates);
    
    // Reset form
    setClassName('');
    setEventDescription('');
    setStartTime('');
    setEndTime('');
    setDay(null);
  };

  const handleDayPress = (day) => {
    // Use the exact date from the calendar
    setSelectedDate(day.dateString);
    
    const [year, month, date] = day.dateString.split('-').map(Number);
    const selectedDateObj = new Date(year, month - 1, date);
    const selectedDay = selectedDateObj.getDay();
    
    console.log(`Selected: ${day.dateString} (${selectedDay})`);

    const filtered = allClasses.filter(cls => {
      if (cls.isRecurring) {
        const semesterMonths = cls.semester === 'Fall' 
          ? [7, 8, 9, 10, 11]  // August-December
          : [0, 1, 2, 3, 4];    // January-May
        
        const dayMatch = selectedDay === cls.day;
        const monthMatch = semesterMonths.includes(selectedDateObj.getMonth());
        
        return dayMatch && monthMatch && cls.semester === semester;
      } else {
        return cls.date === day.dateString;
      }
    });

    console.log('Matching classes:', filtered);
    setDailyClasses(filtered);
  };

  const handleShare = async (item) => {
    // Check if this item is already shared
    const isAlreadyShared = allClasses.some(cls => 
      cls.isShared && 
      cls.name === item.name && 
      cls.startTime === item.startTime && 
      cls.endTime === item.endTime &&
      cls.day === item.day
    );

    if (isAlreadyShared) {
      Alert.alert(
        "Already Shared",
        "This class is already shared with everyone!",
        [{ text: "OK" }]
      );
      return;
    }

    // Create a copy of the item with the current user as creator
    const sharedItem = {
      ...item,
      id: Date.now().toString(),
      creator: currentUser,
      isShared: true,
      sharedBy: currentUser,
      date: item.date,
      day: item.day
    };

    try {
      // Get existing classes from AsyncStorage
      const existingClassesStr = await AsyncStorage.getItem('allClasses');
      const existingClasses = existingClassesStr ? JSON.parse(existingClassesStr) : [];
      
      // Add the new shared class
      const updatedClasses = [...existingClasses, sharedItem];
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('allClasses', JSON.stringify(updatedClasses));
      console.log('Saved shared class to AsyncStorage:', sharedItem);
      
      // Update state
      setAllClasses(updatedClasses);
      setScheduleData(updatedClasses);

      // Update marked dates for the shared item
      const newMarkedDates = { ...markedDates };
      if (item.isRecurring) {
        // For recurring classes, mark all dates in the semester
        const semesterDates = getSemesterDates(semester);
        let currentDate = new Date(semesterDates.start);
        while (currentDate <= semesterDates.end) {
          if (currentDate.getDay() === item.day) {
            const dateStr = currentDate.toISOString().split('T')[0];
            newMarkedDates[dateStr] = { marked: true, dotColor: '#a259c6' };
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else {
        // For one-time events, mark the specific date
        newMarkedDates[item.date] = { marked: true, dotColor: '#a259c6' };
      }
      setMarkedDates(newMarkedDates);

      // Show success message
      Alert.alert(
        "Shared!",
        `${item.type === 'class' ? 'Class' : 'Event'} has been shared with everyone!`,
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error('Error sharing class:', error);
      Alert.alert(
        "Error",
        "Failed to share the class. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const getDailySchedule = () => {
    if (!selectedDate) return [];
    
    // Use the exact date string from the calendar
    const [year, month, date] = selectedDate.split('-').map(Number);
    const selectedDateObj = new Date(year, month - 1, date);
    const selectedDay = selectedDateObj.getDay();
    const selectedDateStr = selectedDate;
    
    console.log('Getting schedule for:', selectedDateStr, 'Day:', selectedDay);
    console.log('Current user:', currentUser);
    console.log('All classes:', allClasses);
    
    // Use a Set to track unique classes
    const uniqueClasses = new Set();
    
    const filteredClasses = allClasses.filter(item => {
      // Create a unique key for this class
      const classKey = `${item.name}-${item.startTime}-${item.endTime}-${item.day}`;
      
      // Skip if we've already seen this class
      if (uniqueClasses.has(classKey)) {
        return false;
      }
      
      // Add to our set of seen classes
      uniqueClasses.add(classKey);
      
      // For recurring classes
      if (item.isRecurring) {
        if (item.day === selectedDay) {
          // Show if it's the user's class or if it's shared
          const shouldShow = item.creator === currentUser || item.isShared;
          console.log('Recurring class:', item.name, 'shouldShow:', shouldShow);
          return shouldShow;
        }
        return false;
      }
      
      // For one-time events
      if (item.date === selectedDateStr) {
        // Show if it's the user's class or if it's shared
        const shouldShow = item.creator === currentUser || item.isShared;
        console.log('One-time event:', item.name, 'shouldShow:', shouldShow);
        return shouldShow;
      }
      
      return false;
    });

    console.log('Filtered classes:', filteredClasses);
    return filteredClasses;
  };

  const renderDailyItem = ({ item }) => (
    <Animatable.View animation="fadeIn" style={styles.dailyItem}>
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
      </View>
      {!isShared && item.creator === currentUser && (
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={() => handleShare(item)}
        >
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>
      )}
    </Animatable.View>
  );

  const getMarkedDates = () => {
    const marked = {};
    
    allClasses.forEach(cls => {
      if (cls.isRecurring) {
        // For recurring classes, mark all dates in the semester
        const semesterDates = getSemesterDates(cls.semester);
        let currentDate = new Date(semesterDates.start);
        while (currentDate <= semesterDates.end) {
          if (currentDate.getDay() === cls.day) {
            const dateStr = currentDate.toISOString().split('T')[0];
            marked[dateStr] = { marked: true, dotColor: '#a259c6' };
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else {
        // For one-time events, mark the specific date
        marked[cls.date] = { marked: true, dotColor: '#a259c6' };
      }
    });
    
    return marked;
  };

  // Add useEffect to update daily schedule when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      const schedule = getDailySchedule();
      console.log('Updating daily schedule for date:', selectedDate);
      console.log('Schedule:', schedule);
      setDailyClasses(schedule);
    }
  }, [selectedDate, allClasses, isShared]);

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

  return (
    <ImageBackground source={require('../assets/pixel-bg.png')} style={styles.bg}>
      <SafeAreaView style={{ flex: 1 }}>
        <Animatable.View animation="bounceIn" style={styles.header}>
          <Image source={require('../assets/kawaii-star.gif')} style={styles.starIcon} />
          <Text style={styles.title}>✨ Schedule Planner ✨</Text>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={handleDeleteAll}
          >
            <Text style={styles.deleteButtonText}>Delete All</Text>
          </TouchableOpacity>
        </Animatable.View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.toggleContainer}>
            <TouchableOpacity 
              style={[styles.toggleButton, !isEvent && !isShared && styles.activeToggle]}
              onPress={() => {
                setIsEvent(false);
                setIsShared(false);
              }}
            >
              <Text style={styles.toggleText}>Class</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleButton, isEvent && !isShared && styles.activeToggle]}
              onPress={() => {
                setIsEvent(true);
                setIsShared(false);
              }}
            >
              <Text style={styles.toggleText}>Event</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleButton, isShared && styles.activeToggle]}
              onPress={() => {
                setIsShared(true);
                setIsEvent(false);
              }}
            >
              <Text style={styles.toggleText}>Shared</Text>
            </TouchableOpacity>
          </View>

          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.content}>
              {/* Calendar */}
              <Animatable.View animation="fadeInUp" style={styles.calendarContainer}>
                <Calendar
                  onDayPress={handleDayPress}
                  markedDates={getMarkedDates()}
                  theme={{
                    calendarBackground: '#fff0fa',
                    textSectionTitleColor: '#6e3abf',
                    selectedDayBackgroundColor: '#a259c6',
                    selectedDayTextColor: '#fff',
                    todayTextColor: '#ff69b4',
                    dayTextColor: '#6e3abf',
                    textDisabledColor: '#d1b3ff',
                    dotColor: '#6e3abf',
                    selectedDotColor: '#fff',
                    arrowColor: '#6e3abf',
                    monthTextColor: '#6e3abf',
                    indicatorColor: '#6e3abf',
                    textDayFontFamily: 'PressStart2P',
                    textMonthFontFamily: 'PressStart2P',
                    textDayHeaderFontFamily: 'PressStart2P',
                  }}
                />
              </Animatable.View>

              {/* Add Form - Only show in Class and Event tabs */}
              {!isShared && (
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

                  <View style={styles.timeContainer}>
                    <View style={styles.timeInput}>
                      <Text style={styles.inputLabel}>Start Time</Text>
                      <TextInput
                        style={styles.input}
                        value={startTime}
                        onChangeText={setStartTime}
                        placeholder="HH:MM"
                        placeholderTextColor="#d1b3ff"
                      />
                    </View>
                    <View style={styles.timeInput}>
                      <Text style={styles.inputLabel}>End Time</Text>
                      <TextInput
                        style={styles.input}
                        value={endTime}
                        onChangeText={setEndTime}
                        placeholder="HH:MM"
                        placeholderTextColor="#d1b3ff"
                      />
                    </View>
                  </View>

                  {!isEvent && (
                    <>
                      <View style={styles.semesterContainer}>
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
                          style={styles.picker}
                          dropDownContainerStyle={styles.pickerDropdown}
                          textStyle={styles.pickerText}
                          placeholder="Select semester"
                          placeholderStyle={styles.pickerPlaceholder}
                          zIndex={3000}
                        />
                      </View>

                      <View style={styles.dayContainer}>
                        <Text style={styles.inputLabel}>Day of Week</Text>
                        <DropDownPicker
                          open={dayOpen}
                          value={day}
                          items={days}
                          setOpen={setDayOpen}
                          setValue={setDay}
                          style={styles.picker}
                          dropDownContainerStyle={styles.pickerDropdown}
                          textStyle={styles.pickerText}
                          placeholder="Select day"
                          placeholderStyle={styles.pickerPlaceholder}
                          zIndex={2000}
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
              <Animatable.View animation="fadeInUp" delay={200} style={styles.dailySchedule}>
                <Text style={styles.dailyTitle}>
                  {isShared ? "Shared Schedule" : "Your Schedule"} for {selectedDate ? new Date(selectedDate).toLocaleDateString() : 'Selected Day'}
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
                    No {isShared ? 'shared ' : ''}schedule for this day
                  </Text>
                )}
              </Animatable.View>
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
    paddingVertical: 10,
    backgroundColor: '#fff0fa',
  },
  starIcon: {
    width: 30,
    height: 30,
    marginRight: 8,
  },
  title: {
    fontSize: 24,
    color: '#6e3abf',
    fontWeight: 'bold',
    fontFamily: 'Cochin',
  },
  sectionTitle: {
    fontSize: 20,
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
    fontSize: 16,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#d1b3ff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#5c3c9d',
    marginBottom: 15,
    shadowColor: '#a259c6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  addButton: {
    backgroundColor: '#a259c6',
    borderRadius: 25,
    paddingVertical: 14,
    marginVertical: 20,
    marginHorizontal: 50,
    shadowColor: '#6a3ba2',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
    textAlign: 'center',
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6e3abf',
  },
  classTime: {
    fontSize: 14,
    color: '#7a58b8',
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
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#ff4757',
  },
  deleteButtonText: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
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
    fontSize: 10,
    color: '#6e3abf',
    textAlign: 'center',
  },
  eventCard: {
    borderColor: '#ff85a2',
    backgroundColor: '#ffeef8'
  },
  creatorText: {
    fontSize: 10,
    color: '#d291bc',
    fontStyle: 'italic'
  },
  semesterText: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#d291bc',
    marginTop: 5,
  },
  noClassesText: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
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
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    marginLeft: 10,
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
  },
  timeInput: {
    flex: 1,
  },
  semesterContainer: {
    marginBottom: 15,
    zIndex: 3000,
  },
  dayContainer: {
    marginBottom: 15,
    zIndex: 2000,
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
});

export default SchedulePlanner;
