import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTasks } from './TaskContext';

export default function TasksScreen() {
  const { tasks, addTask, deleteTask } = useTasks();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Tasks</Text>
      <ScrollView style={styles.taskList}>
        {tasks.map((task, index) => (
          <View key={index} style={styles.taskItem}>
            <Text style={styles.taskText}>{task}</Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteTask(index)}
            >
              <Text style={styles.deleteButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => addTask('New Task')}
      >
        <Text style={styles.addButtonText}>+ Add Task</Text>
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
    fontSize: 24,
    color: '#a259c6',
    marginBottom: 20,
    textAlign: 'center',
  },
  taskList: {
    flex: 1,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#d291bc',
  },
  taskText: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    color: '#a259c6',
    flex: 1,
  },
  deleteButton: {
    padding: 5,
  },
  deleteButtonText: {
    fontFamily: 'PressStart2P',
    fontSize: 16,
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
    fontSize: 12,
    color: '#fff',
  },
}); 