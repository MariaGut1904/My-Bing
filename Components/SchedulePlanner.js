import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, ScrollView, Dimensions, Image, FlatList, Keyboard, ImageBackground, TouchableWithoutFeedback } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar } from 'react-native-calendars';
import { useSchedule } from './ScheduleContext';

const { width } = Dimensions.get('window');

const SchedulePlanner = () => {
  const { scheduleData, setScheduleData } = useSchedule();
  const [openMonth, setOpenMonth] = useState(false);
  const [semester, setSemester] = useState('Fall');
  const [openDay, setOpenDay] = useState(false);
  const [day, setDay] = useState(null);
  const [className, setClassName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [dailyClasses, setDailyClasses] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [isEvent, setIsEvent] = useState(false);
  const [eventDescription, setEventDescription] = useState('');
  const [currentUser, setCurrentUser] = useState('You'); // Default creator name

  // Load saved classes on mount
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const savedClasses = await AsyncStorage.getItem('classes');
        if (savedClasses) {
          const parsed = JSON.parse(savedClasses);
          setAllClasses(parsed);
          
          // Update marked dates
          const dates = {};
          parsed.forEach(cls => {
            dates[cls.date] = { marked: true, dotColor: '#a259c6' };
          });
          setMarkedDates(dates);
        }
      } catch (error) {
        console.error('Failed to load classes', error);
      }
    };
    loadClasses();
  }, []);

  // Save classes when they change
  useEffect(() => {
    AsyncStorage.setItem('classes', JSON.stringify(allClasses));
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

  const days = [
    { label: "Monday", value: 1 },
    { label: "Tuesday", value: 2 },
    { label: "Wednesday", value: 3 },
    { label: "Thursday", value: 4 },
    { label: "Friday", value: 5 },
    { label: "Saturday", value: 6 },
    { label: "Sunday", value: 0 }
  ];

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

    const itemDay = isEvent ? new Date(selectedDate).getDay() : day;
    
    const newItem = {
      id: Date.now().toString(),
      type: isEvent ? 'event' : 'class',
      name: isEvent ? eventDescription : className,
      startTime,
      endTime,
      day: itemDay,
      date: isEvent ? selectedDate : new Date().toISOString().split('T')[0],
      isRecurring: !isEvent,
      creator: currentUser,
      semester: semester,
      ...(isEvent ? { description: eventDescription } : { className })
    };

    const updatedClasses = [...allClasses, newItem];
    setAllClasses(updatedClasses);
    setScheduleData(updatedClasses);
    
    const updatedMarkedDates = { ...markedDates };
    
    if (!isEvent) {
      // For classes (always recurring), mark all future dates matching this day AND semester
      const today = new Date();
      const currentYear = today.getFullYear();
      
      // Define semester date ranges (months are 0-indexed in JavaScript)
      const semesterMonths = semester === 'Fall' 
        ? [7, 8, 9, 10, 11]  // August (7) - December (11)
        : [0, 1, 2, 3, 4];    // January (0) - May (4)

      for (let i = 0; i < 180; i++) { // Check next 6 months
        const date = new Date();
        date.setDate(today.getDate() + i);
        
        // Check if date is within semester months and matches the selected day
        if (semesterMonths.includes(date.getMonth()) && date.getDay() === day) {
          const dateStr = date.toISOString().split('T')[0];
          updatedMarkedDates[dateStr] = { 
            marked: true, 
            dotColor: '#a259c6',
            customStyles: {
              container: {
                backgroundColor: '#f0d0ff',
                borderRadius: 12
              }
            }
          };
        }
      }
    } else {
      // For events (single day only)
      updatedMarkedDates[selectedDate] = { 
        marked: true, 
        dotColor: '#ff85a2',
        customStyles: {
          container: {
            backgroundColor: '#ffb6c1',
            borderRadius: 12
          }
        }
      };
    }

    setMarkedDates(updatedMarkedDates);
    
    // Update daily items if we're adding to the currently selected date
    if (selectedDate === newItem.date || (!isEvent && new Date().getDay() === day)) {
      setDailyClasses(prev => [...prev, newItem]);
    }

    // Clear form
    setClassName('');
    setEventDescription('');
    setStartTime('');
    setEndTime('');
  };

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    
    // Parse the date string in local timezone to avoid UTC conversion issues
    const dateParts = day.dateString.split('-');
    const selectedDateObj = new Date(
      parseInt(dateParts[0]),  // year
      parseInt(dateParts[1]) - 1,  // month (0-indexed)
      parseInt(dateParts[2])   // day
    );
    
    const selectedDay = selectedDateObj.getDay(); // 0 (Sun) to 6 (Sat)
    const selectedDayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][selectedDay];
    
    console.log(`Selected: ${day.dateString} (${selectedDayName})`);

    const filtered = allClasses.filter(cls => {
      if (cls.isRecurring) {
        const semesterMonths = cls.semester === 'Fall' 
          ? [7, 8, 9, 10, 11]  // August-December
          : [0, 1, 2, 3, 4];    // January-May
        
        const dayMatch = selectedDay === cls.day;
        const monthMatch = semesterMonths.includes(selectedDateObj.getMonth());
        
        console.log(`Class "${cls.name}": 
          Day ${cls.day} (${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][cls.day]}) vs Selected ${selectedDay} (${selectedDayName})
          Semester ${cls.semester} vs Current ${semester}
          Month ${selectedDateObj.getMonth()} in semester? ${monthMatch}`);
        
        return dayMatch && monthMatch && cls.semester === semester;
      } else {
        return cls.date === day.dateString;
      }
    });

    console.log('Matching classes:', filtered);
    setDailyClasses(filtered);
  };

  return (
    <ImageBackground source={require('../assets/pixel-bg.png')} style={styles.bg}>
      <SafeAreaView style={{ flex: 1 }}>
        <Animatable.View animation="bounceIn" style={styles.header}>
          <Image source={require('../assets/kawaii-star.gif')} style={styles.starIcon} />
          <Text style={styles.title}>✨ Schedule Planner ✨</Text>
        </Animatable.View>

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.toggleContainer}>
              <TouchableOpacity 
                style={[styles.toggleButton, !isEvent && styles.activeToggle]}
                onPress={() => setIsEvent(false)}
              >
                <Text style={styles.toggleText}>Class</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.toggleButton, isEvent && styles.activeToggle]}
                onPress={() => setIsEvent(true)}
              >
                <Text style={styles.toggleText}>Event</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Add New {isEvent ? 'Event' : 'Class'}</Text>

            {!isEvent ? (
              <>
                <DropDownPicker
                  open={openMonth}
                  value={semester}
                  items={[
                    { label: 'Fall', value: 'Fall' },
                    { label: 'Spring', value: 'Spring' }
                  ]}
                  setOpen={setOpenMonth}
                  setValue={setSemester}
                  placeholder="Select Semester"
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownList}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Class Name"
                  value={className}
                  onChangeText={setClassName}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Start Time (e.g. 09:00)"
                  value={startTime}
                  onChangeText={setStartTime}
                  keyboardType="numeric"
                />

                <TextInput
                  style={styles.input}
                  placeholder="End Time (e.g. 10:30)"
                  value={endTime}
                  onChangeText={setEndTime}
                  keyboardType="numeric"
                />

                <DropDownPicker
                  open={openDay}
                  value={day}
                  items={days}
                  setOpen={setOpenDay}
                  setValue={setDay}
                  placeholder="Select Day"
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownList}
                  listMode="SCROLLVIEW"
                />
              </>
            ) : (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Event Description"
                  value={eventDescription}
                  onChangeText={setEventDescription}
                  multiline
                />

                <TextInput
                  style={styles.input}
                  placeholder="Start Time (e.g. 09:00)"
                  value={startTime}
                  onChangeText={setStartTime}
                  keyboardType="numeric"
                />

                <TextInput
                  style={styles.input}
                  placeholder="End Time (e.g. 10:30)"
                  value={endTime}
                  onChangeText={setEndTime}
                  keyboardType="numeric"
                />
              </>
            )}

            <TouchableOpacity style={styles.addButton} onPress={handleAddClass}>
              <Text style={styles.addButtonText}>Add {isEvent ? 'Event' : 'Class'}</Text>
            </TouchableOpacity>

            <Calendar
              onDayPress={handleDayPress}
              markedDates={{
                ...markedDates,
                [selectedDate]: { selected: true, selectedColor: '#a259c6' }
              }}
              theme={{
                calendarBackground: '#fff0fa',
                selectedDayBackgroundColor: '#a259c6',
                todayTextColor: '#a259c6',
                'stylesheet.calendar.header': {
                  dayHeader: {
                    color: '#6e3abf',
                    fontFamily: 'PressStart2P',
                  }
                }
              }}
              firstDay={1}
            />

            {dailyClasses.length > 0 ? (
              <View style={styles.classListContainer}>
                <Text style={styles.sectionTitle}>
                  {dailyClasses[0].isRecurring ? 'Classes' : 'Events'} on {new Date(selectedDate).toLocaleDateString()}
                </Text>
                {dailyClasses.map((item) => (
                  <View key={item.id} style={styles.classCard}>
                    <Text style={styles.className}>
                      {item.type === 'event' ? '🎀 ' : '📚 '}{item.name}
                    </Text>
                    <Text style={styles.classTime}>
                      {item.startTime} - {item.endTime}
                    </Text>
                    {item.isRecurring && (
                      <Text style={styles.semesterText}>
                        {item.semester} Semester • Every {days.find(d => d.value === item.day)?.label}
                      </Text>
                    )}
                    <Text style={styles.debugText}>
                      ID: {item.id} • Added: {new Date(parseInt(item.id)).toLocaleString()}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.noClassesContainer}>
                <Text style={styles.noClassesText}>
                  No classes/events found for {new Date(selectedDate).toLocaleDateString()}
                </Text>
                <Text style={styles.debugText}>
                  Selected day: {new Date(selectedDate).getDay()} ({
                    ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(selectedDate).getDay()]
                  })
                </Text>
                <Text style={styles.debugText}>
                  Current semester: {semester}
                </Text>
              </View>
            )}

            <TouchableOpacity 
              style={styles.resetButton} 
              onPress={resetSchedule}
            >
              <Text style={styles.resetButtonText}>Reset All Classes</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, {backgroundColor: '#ccc'}]}
              onPress={() => console.log('Current state:', {
                allClasses,
                dailyClasses,
                selectedDate,
                semester
              })}
            >
              <Text style={styles.buttonText}>Debug Info</Text>
            </TouchableOpacity>

            <View style={styles.debugContainer}>
              <Text style={styles.debugText}>
                Debug Info:
              </Text>
              <Text style={styles.debugText}>
                Selected: {selectedDate} ({new Date(selectedDate).toDateString()})
              </Text>
              <Text style={styles.debugText}>
                Day: {new Date(selectedDate).getDay()} ({['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(selectedDate).getDay()]})
              </Text>
              <Text style={styles.debugText}>
                Current Semester: {semester}
              </Text>
              <Text style={styles.debugText}>
                All Classes: {allClasses.length}
              </Text>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: 'rgba(210, 170, 255, 0.15)',
    borderBottomWidth: 1,
    borderColor: '#d1b3ff',
    marginBottom: 12,
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
    backgroundColor: '#f96565',
    borderRadius: 8,
    padding: 5,
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
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
});

export default SchedulePlanner;
