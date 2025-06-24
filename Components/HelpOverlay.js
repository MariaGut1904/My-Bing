import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const helpContent = {
  home: {
    image: require('../assets/Mar_hap.png'),
    title: 'Home Screen Help',
    text: 'Welcome to your home screen! Here you can:\n\n• View your daily tasks and add new ones\n• See today\'s schedule and upcoming events\n• Check your budget progress\n• View quick stats for the day\n• Add tasks using the "Add Task" button\n• Navigate to other tabs for more features\n\nYour avatar shows who you\'re logged in as, and you\'ll see a personalized motivational message! 🌟',
  },
  schedule: {
    image: require('../assets/Mar_speak.png'),
    title: 'Schedule Planner Help',
    text: 'The Schedule tab is your command center for planning! Here you can:\n\n• Add recurring classes for the semester\n• Create one-time events and activities\n• View your schedule in calendar format\n• See daily breakdowns of your schedule\n• Share classes with friends\n• Compare schedules with group members\n• Delete classes and events you no longer need\n\nUse the toggle buttons to switch between Class, Event, and Compare modes! 📅',
  },
  budget: {
    image: require('../assets/Maria.png'),
    title: 'Budget Tracker Help',
    text: 'Stay on top of your finances with the Budget tab! Here you can:\n\n• Track food expenses and set budgets\n• Monitor money spending and savings\n• Add new expenses with categories\n• View spending history and trends\n• Set budget limits for different categories\n• See your budget progress as percentages\n• Delete expenses if needed\n\nCollege life is expensive, so let\'s make smart financial choices together! 💰',
  },
};

export const HelpOverlay = ({ visible, tab, onClose }) => {
  if (!visible || !helpContent[tab]) {
    return null;
  }

  const content = helpContent[tab];

  return (
    <View style={styles.container}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Image source={content.image} style={styles.mariaImage} resizeMode="contain" />
            <Text style={styles.title}>{content.title}</Text>
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.helpText}>{content.text}</Text>
          </View>
          
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Got it! ✨</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    backgroundColor: '#fff0fa',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    borderWidth: 3,
    borderColor: '#ffb6c1',
    shadowColor: '#ff69b4',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    maxWidth: width * 0.9,
    maxHeight: height * 0.8,
  },
  content: {
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  mariaImage: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  title: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    color: '#ff69b4',
    textAlign: 'center',
    marginBottom: 5,
  },
  textContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#d1b3ff',
  },
  helpText: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#6e3abf',
    lineHeight: 16,
    textAlign: 'left',
  },
  closeButton: {
    backgroundColor: '#ffb6c1',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#ff69b4',
    shadowColor: '#ff69b4',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  closeButtonText: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#fff',
  },
}); 