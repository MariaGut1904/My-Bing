import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ImageBackground, TouchableOpacity, ScrollView, Alert, Modal, TextInput } from 'react-native';
import * as Animatable from 'react-native-animatable';
import SchedulePlanner from './SchedulePlanner';
import { useSchedule } from './ScheduleContext';
import { useTasks } from './TaskContext';
import { useBudget } from './BudgetContext';
import { useAuth } from './AuthContext';

const HomeScreen = ({ navigation }) => {
  const { scheduleData, resetSchedule } = useSchedule();
  const { tasks, addTask, deleteTask, resetTasks } = useTasks();
  const { budgetData, resetBudget } = useBudget();
  const { logout } = useAuth();
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');

  const handleLogout = async () => {
    await logout();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    resetTasks();
    resetSchedule();
    resetBudget();
  };

  // Filter events for today and tomorrow
  const getUpcomingEvents = () => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    return scheduleData.filter(event => 
      event.date === today || event.date === tomorrowStr
    );
  };

  const upcomingEvents = getUpcomingEvents();

  // Count today's classes
  const getTodayClassesCount = () => {
    const today = new Date().toISOString().split('T')[0];
    return scheduleData.filter(event => 
      event.date === today && event.type === 'class'
    ).length;
  };

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      addTask(newTaskText);
      setNewTaskText('');
      setIsTaskModalVisible(false);
    }
  };

  return (
    <ImageBackground 
      source={require('../assets/pixel-bg.png')} 
      style={styles.bg} 
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animatable.View animation="bounceIn" style={styles.header}>
          <Image 
            source={require('../assets/Maria.png')} 
            style={styles.avatar}
          />
          <Text style={styles.title}>Welcome back, bestie! 💕</Text>
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
              <Text style={styles.statValue}>{budgetData.percentage}%</Text>
              <Text style={styles.statLabel}>Budget</Text>
            </View>
            <View style={styles.statItem}>
              <Image source={require('../assets/cat-face.gif')} style={styles.statIcon} />
              <Text style={styles.statValue}>{getTodayClassesCount()}</Text>
              <Text style={styles.statLabel}>Classes</Text>
            </View>
          </View>
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

        {/* Upcoming Events */}
        <Animatable.View animation="fadeInUp" delay={200} style={styles.card}>
          <Text style={styles.cardTitle}>📅 Upcoming</Text>
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event, index) => (
              <View key={index} style={styles.eventItem}>
                <Image 
                  source={event.type === 'class' 
                    ? require('../assets/rainbow.gif') 
                    : require('../assets/kawaii-star.gif')} 
                  style={styles.eventIcon} 
                />
                <View>
                  <Text style={styles.eventTitle}>{event.name}</Text>
                  <Text style={styles.eventTime}>
                    {event.startTime} - {event.endTime}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noEventsText}>No upcoming events today or tomorrow.</Text>
          )}
        </Animatable.View>

        {/* Task List Section */}
        <Animatable.View animation="fadeInUp" delay={400} style={styles.card}>
          <Text style={styles.cardTitle}>📝 Tasks ({tasks.length})</Text>
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <View key={task.id} style={styles.taskItem}>
                <Text style={styles.taskText}>{task.text}</Text>
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
          <Text style={styles.quoteText}>"You're doing amazing, sweetie! 💖"</Text>
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
      </View>
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
  avatar: {
    width: 100,
    height: 100,
    marginBottom: 15,
  },
  title: {
    fontFamily: 'PressStart2P',
    fontSize: 14,
    color: '#a259c6',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 240, 250, 0.8)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#d1b3ff',
    shadowColor: '#a259c6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#a259c6',
    marginBottom: 12,
    textAlign: 'center',
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
    fontSize: 12,
    color: '#6e3abf',
  },
  statLabel: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#d291bc',
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0d0ff',
  },
  eventIcon: {
    width: 25,
    height: 25,
    marginRight: 10,
  },
  eventTitle: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#6e3abf',
  },
  eventTime: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#d291bc',
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
    fontSize: 8,
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
    fontSize: 10,
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
    color: '#d291bc',
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
    fontSize: 12,
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
    fontSize: 10,
    color: 'white',
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1b3ff',
  },
  taskText: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#6e3abf',
    flex: 1,
  },
  deleteButton: {
    marginLeft: 10,
    padding: 5,
  },
  deleteIcon: {
    width: 20,
    height: 20,
    tintColor: '#f96565',
  },
  noTasksText: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#d291bc',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default HomeScreen;
