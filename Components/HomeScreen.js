import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Image, ImageBackground, TouchableOpacity, ScrollView, Alert, Modal, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTasks } from './TaskContext';
import { useSchedule } from './ScheduleContext';
import { useBudget } from './BudgetContext';
import { useAuth } from './AuthContext';
import { HelpOverlay } from './HelpOverlay';
import * as Animatable from 'react-native-animatable';
import { nuclearDataCleanup } from '../utils/cleanData';

const HomeScreen = ({ navigation }) => {
  const { currentUser, logout } = useAuth();
  const { tasks = [], addTask, deleteTask, resetTasks } = useTasks();
  const { schedule = [], resetSchedule } = useSchedule();
  const { budget = { food: [], money: [] }, resetBudget } = useBudget();
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [avatarLoaded, setAvatarLoaded] = useState(false);

  // Memoize expensive calculations
  const todayEvents = React.useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const todayDay = today.getDay();

    return schedule.filter(event => {
      // For recurring classes
      if (event.isRecurring && event.day === todayDay && event.creator === currentUser) {
        // Also check if today is within the semester range for recurring events
        return todayStr >= event.semesterStart && todayStr <= event.semesterEnd;
      }
      // For one-time events
      if (!event.isRecurring && event.date === todayStr && event.creator === currentUser) {
        return true;
      }
      return false;
    });
  }, [schedule, currentUser]);

  // Memoize today's classes count
  const todayClassesCount = React.useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const todayDay = today.getDay();

    return schedule.filter(event => {
      if (event.type !== 'class') return false;
      // For recurring classes
      if (event.isRecurring && event.day === todayDay && event.creator === currentUser) {
        // Also check if today is within the semester range for recurring events
        return todayStr >= event.semesterStart && todayStr <= event.semesterEnd;
      }
      // For one-time classes
      if (!event.isRecurring && event.date === todayStr && event.creator === currentUser) {
        return true;
      }
      return false;
    }).length;
  }, [schedule, currentUser]);

  // Memoize today's date
  const todayDate = React.useMemo(() => {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return today.toLocaleDateString('en-US', options);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      resetTasks();
      resetSchedule();
      resetBudget();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      addTask(newTaskText);
      setNewTaskText('');
      setIsTaskModalVisible(false);
    }
  };

  // Add clear all data handler for Maria
  const handleClearData = async () => {
    if (currentUser !== 'Maria') {
      Alert.alert(
        'Access Denied',
        'Only Maria (administrator) can clear all data.',
        [{ text: 'OK' }]
      );
      return;
    }
    Alert.alert(
      'Confirm Clear All Data',
      'Are you sure you want to clear ALL app data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await nuclearDataCleanup();
              Alert.alert('Success', 'All app data has been cleared!');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data: ' + error.message);
            }
          }
        }
      ]
    );
  };

  return (
    <ImageBackground 
      source={require('../assets/pastel-pixel-bg.webp')} 
      style={styles.bg} 
      resizeMode="cover"
    >
      <SafeAreaView style={styles.bg}>
        {/* Decorative Elements */}
        <View style={styles.decorativeContainer}>
          <Image source={require('../assets/decor8.gif')} style={[styles.decorativeIcon, { top: 20, left: 10, width: 25, height: 25 }]} />
        </View>
        
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Animatable.View animation={avatarLoaded ? 'bounceIn' : undefined} style={styles.header}>
            <Animatable.View 
              animation={avatarLoaded ? 'pulse' : undefined}
              iterationCount="infinite"
              duration={2000}
              style={styles.avatarContainer}
            >
              <Image 
                source={
                  currentUser === 'Reni' 
                    ? require('../assets/reni.png') 
                    : currentUser === 'Luna'
                    ? require('../assets/luna.png')
                    : currentUser === 'Sheila'
                    ? require('../assets/sheila.png')
                    : require('../assets/Maria.png')
                } 
                style={styles.avatar}
                resizeMode="contain"
                onLoad={() => setAvatarLoaded(true)}
                defaultSource={require('../assets/avatar-base.png')}
              />
            </Animatable.View>
            <Text style={styles.welcomeText}>Welcome back, {currentUser || 'User'}</Text>
            <Text style={styles.dateText}>{todayDate}</Text>
          </Animatable.View>

          {/* Quick Stats Section */}
          <Animatable.View animation="fadeInUp" style={styles.card}>
            <Text style={styles.cardTitle}>✨ Today's Stats</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Image source={require('../assets/kawaii-star.gif')} style={styles.statIcon} />
                <Text style={styles.statValue}>{tasks.length}</Text>
                <Text style={styles.statLabel}>Tasks</Text>
              </View>
              <View style={styles.statItem}>
                <Image source={require('../assets/pixel-heart.gif')} style={styles.statIcon} />
                <Text style={styles.statValue}>{budget?.percentage || 0}%</Text>
                <Text style={styles.statLabel}>Budget</Text>
              </View>
              <View style={styles.statItem}>
                <Image source={require('../assets/cat-face.gif')} style={styles.statIcon} />
                <Text style={styles.statValue}>{todayClassesCount}</Text>
                <Text style={styles.statLabel}>Classes</Text>
              </View>
            </View>
          </Animatable.View>

          {/* Today's Events */}
          <Animatable.View animation="fadeInUp" delay={200} style={styles.card}>
            <Text style={styles.cardTitle}>📅 Today's Schedule</Text>
            {todayEvents.length > 0 ? (
              todayEvents.map((event, index) => (
                <View key={index} style={styles.eventItem}>
                  <Image 
                    source={event.type === 'class' 
                      ? require('../assets/rainbow.gif') 
                      : require('../assets/kawaii-star.gif')} 
                    style={styles.eventIcon} 
                  />
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle}>
                      {event.name}
                      <Text style={styles.creatorText}> ~{event.creator}</Text>
                    </Text>
                    <Text style={styles.eventTime}>
                      {event.startTime} - {event.endTime}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noEventsText}>No events scheduled for today.</Text>
            )}
          </Animatable.View>

          {/* Task Input Modal */}
          <Modal
            visible={isTaskModalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setIsTaskModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Add New Task</Text>
                <TextInput
                  style={styles.taskInput}
                  placeholder="Enter task..."
                  value={newTaskText}
                  onChangeText={setNewTaskText}
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: '#f96565' }]}
                    onPress={() => setIsTaskModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: '#a259c6' }]}
                    onPress={handleAddTask}
                  >
                    <Text style={styles.modalButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Task List Section */}
          <Animatable.View animation="fadeInUp" delay={400} style={styles.card}>
            <Text style={styles.cardTitle}>📝 Tasks ({tasks.length})</Text>
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <View key={task.id} style={styles.taskItem}>
                  <View style={styles.taskContent}>
                    <Text style={styles.taskText}>{task.text}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => deleteTask(task.id)}
                    style={styles.deleteButton}
                  >
                    <Image
                      source={require('../assets/trash.png')}
                      style={styles.deleteIcon}
                    />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.noTasksText}>No tasks yet. Add one above!</Text>
            )}
          </Animatable.View>

          {/* Quick Actions */}
          <View style={styles.buttonRow}>
            <Animatable.View animation="fadeInLeft" delay={400}>
              <TouchableOpacity 
                style={[styles.button, { backgroundColor: '#d1b3ff' }]}
                onPress={() => setIsTaskModalVisible(true)}
              >
                <Text style={styles.buttonText}>Add Task ✏️</Text>
              </TouchableOpacity>
            </Animatable.View>
            <Animatable.View animation="fadeInRight" delay={400}>
              <TouchableOpacity 
                style={[styles.button, { backgroundColor: '#f6b4e6' }]}
                onPress={() => navigation.navigate('Schedule')}
              >
                <Text style={styles.buttonText}>View Schedule 🗓️</Text>
              </TouchableOpacity>
            </Animatable.View>
          </View>

          {/* Motivational Quote */}
          <Animatable.View animation="fadeInUp" delay={600} style={styles.quoteCard}>
            <Text style={styles.quoteText}>
              {currentUser === 'Reni' 
                ? '"You\'re absolutely incredible, Reni! Keep shining! ✨"'
                : currentUser === 'Luna'
                ? '"You\'re a star, Luna! Your light brightens every day! 🌟"'
                : currentUser === 'Sheila'
                ? '"You\'re amazing, Sheila! Your strength inspires us all! 💪"'
                : '"You\'re doing amazing, sweetie! 💖"'
              }
            </Text>
            <Image source={require('../assets/pixel-heart.gif')} style={styles.quoteIcon} />
          </Animatable.View>
        </ScrollView>
        <View style={styles.floatingContainer}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Image 
              source={require('../assets/logout.png')} 
              style={styles.logoutIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowHelp(true)} style={styles.tutorialButton}>
            <Image 
              source={require('../assets/help.png')} 
              style={styles.tutorialIcon}
            />
          </TouchableOpacity>
          {/* Only show Clear All Data button for Maria */}
          {currentUser === 'Maria' && (
            <TouchableOpacity onPress={handleClearData} style={styles.clearDataButton}>
              <Image 
                source={require('../assets/trash-can.png')} 
                style={styles.tutorialIcon}
              />
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
      <HelpOverlay 
        visible={showHelp} 
        tab="home" 
        onClose={() => setShowHelp(false)} 
      />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 25,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 120,
    height: 150,
    resizeMode: 'contain',
  },
  welcomeText: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#a259c6',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#ffb6c1',
  },
  cardTitle: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    color: '#ff69b4',
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    width: 30,
    height: 30,
    marginBottom: 5,
  },
  statValue: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#6e3abf',
  },
  statLabel: {
    fontFamily: 'PressStart2P',
    fontSize: 6,
    color: '#d291bc',
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#ffb6c1',
  },
  eventInfo: {
    flex: 1,
    marginLeft: 10,
  },
  eventTitle: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#ff69b4',
    marginBottom: 5,
  },
  creatorText: {
    fontFamily: 'PressStart2P',
    fontSize: 6,
    color: '#ffb6c1',
    fontStyle: 'italic',
  },
  eventTime: {
    fontFamily: 'PressStart2P',
    fontSize: 6,
    color: '#ffb6c1',
  },
  eventIcon: {
    width: 30,
    height: 30,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#a259c6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    fontFamily: 'PressStart2P',
    fontSize: 6,
    color: '#fff',
  },
  quoteCard: {
    backgroundColor: 'rgba(210, 179, 255, 0.3)',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#d1b3ff',
  },
  quoteText: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#6e3abf',
    flex: 1,
  },
  quoteIcon: {
    width: 30,
    height: 30,
    marginLeft: 10,
  },
  floatingContainer: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    zIndex: 100,
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 240, 250, 0.8)',
    borderRadius: 30,
    padding: 10,
    borderWidth: 2,
    borderColor: '#d1b3ff',
    shadowColor: '#a259c6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  logoutIcon: {
    width: 30,
    height: 30,
    tintColor: '#a259c6',
  },
  noEventsText: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#ff69b4',
    textAlign: 'center',
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff0fa',
    padding: 20,
    borderRadius: 15,
    width: '80%',
    borderWidth: 2,
    borderColor: '#d1b3ff',
  },
  modalTitle: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#a259c6',
    marginBottom: 15,
    textAlign: 'center',
  },
  taskInput: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#d1b3ff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: 'white',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#ffb6c1',
  },
  taskContent: {
    flex: 1,
    marginRight: 10,
  },
  taskText: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#ff69b4',
  },
  deleteButton: {
    padding: 5,
  },
  deleteIcon: {
    width: 20,
    height: 20,
  },
  noTasksText: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#ff69b4',
    textAlign: 'center',
    marginTop: 10,
  },
  dateText: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#ff69b4',
    marginTop: 5,
    textAlign: 'center',
  },
  decorativeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  decorativeIcon: {
    position: 'absolute',
  },
  tutorialButton: {
    backgroundColor: 'rgba(255, 240, 250, 0.8)',
    borderRadius: 30,
    padding: 10,
    borderWidth: 2,
    borderColor: '#d1b3ff',
    shadowColor: '#a259c6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  tutorialIcon: {
    width: 30,
    height: 30,
  },
  clearDataButton: {
    marginLeft: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 20,
    padding: 6,
    borderWidth: 2,
    borderColor: '#ff6b6b',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HomeScreen;


