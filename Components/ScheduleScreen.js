import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSchedule } from './ScheduleContext';

export default function ScheduleScreen() {
  const { schedule, addEvent, deleteEvent } = useSchedule();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Schedule</Text>
      <ScrollView style={styles.scheduleList}>
        {schedule.map((event, index) => (
          <View key={index} style={styles.eventItem}>
            <View style={styles.eventTime}>
              <Text style={styles.timeText}>{event.time}</Text>
            </View>
            <View style={styles.eventDetails}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventLocation}>{event.location}</Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteEvent(index)}
            >
              <Text style={styles.deleteButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => addEvent({
          time: '9:00 AM',
          title: 'New Event',
          location: 'Location'
        })}
      >
        <Text style={styles.addButtonText}>+ Add Event</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8e1f4',
    padding: 20,
  },
  title: {
    fontFamily: 'PressStart2P',
    fontSize: 14,
    color: '#a259c6',
    marginBottom: 20,
    textAlign: 'center',
  },
  scheduleList: {
    flex: 1,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#d291bc',
  },
  eventTime: {
    width: 80,
    alignItems: 'center',
    borderRightWidth: 2,
    borderRightColor: '#d291bc',
    paddingRight: 10,
  },
  timeText: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#a259c6',
  },
  eventDetails: {
    flex: 1,
    paddingLeft: 10,
  },
  eventTitle: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#a259c6',
    marginBottom: 5,
  },
  eventLocation: {
    fontFamily: 'PressStart2P',
    fontSize: 6,
    color: '#d291bc',
  },
  deleteButton: {
    padding: 5,
  },
  deleteButtonText: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#d291bc',
  },
  addButton: {
    backgroundColor: '#d291bc',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#fff',
  },
}); 