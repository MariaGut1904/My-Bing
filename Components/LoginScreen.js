import React, { useState, useContext } from 'react';
import { View, TextInput, Text, StyleSheet, Image, Keyboard, TouchableOpacity, Alert } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { AuthContext } from './AuthContext';
import { ScheduleContext } from './ScheduleContext';
import { TaskContext } from './TaskContext';
import { BudgetContext } from './BudgetContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [open, setOpen] = useState(false);
  const { login } = useContext(AuthContext);
  const names = [
    { label: 'Maria', value: 'Maria' },
    { label: 'Reni', value: 'Reni' },
    { label: 'Luna', value: 'Luna' },
    { label: 'Sheila', value: 'Sheila' },
  ];

  const handleCleanup = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      await AsyncStorage.multiRemove(keys);
      Alert.alert('Success', 'All app data has been cleared successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to clear data: ' + error.message);
    }
  };

  const handleLogin = async () => {
    if (!username) {
      Alert.alert("Error", "Please select your name.");
      return;
    }

    // Password validation (ensure keys are lowercase)
    const validPasswords = {
      maria: '0919',
      reni: '1234',
      luna: '5678',
      sheila: '4321'
    };

    const userKey = username.toLowerCase(); // Force lowercase

    if (!password || password.length !== 4) {
      Alert.alert("Error", "Password must be 4 digits.");
      return;
    }

    if (password !== validPasswords[userKey]) {
      Alert.alert("Error", "Incorrect password.");
      setPassword(''); // Clear the input
      return;
    }

    try {
      // Proceed if password is correct
      await login(userKey);
      // Use replace instead of reset to avoid navigation state issues
      navigation.replace('Home');
    } catch (error) {
      Alert.alert("Error", "Failed to login: " + error.message);
    }
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (text.length === 4) {
      Keyboard.dismiss();
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/pixel-heart.gif')} style={styles.heartIcon} />
      <Text style={styles.title}>Login</Text>
      <DropDownPicker
        open={open}
        value={username}
        items={names}
        setOpen={setOpen}
        setValue={setUsername}
        placeholder="Select your name"
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
        textStyle={styles.dropdownText}
        zIndex={3000}
        zIndexInverse={1000}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={handlePasswordChange}
        style={styles.input}
        secureTextEntry
        keyboardType="numeric"
        maxLength={4}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleCleanup} style={styles.cleanupButton}>
        <Text style={styles.cleanupButtonText}>Clear All Data</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderRadius: 24,
    shadowColor: '#f8a1d1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  heartIcon: {
    width: 48,
    height: 48,
    marginBottom: 10,
  },
  input: {
    borderWidth: 2,
    marginBottom: 14,
    padding: 10,
    borderRadius: 12,
    borderColor: '#f8a1d1',
    backgroundColor: '#fff0fa',
    color: '#a259c6',
    width: 260,
    fontSize: 16,
    letterSpacing: 1,
    shadowColor: '#f8a1d1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  title: {
    fontSize: 26,
    marginBottom: 18,
    textAlign: 'center',
    color: '#f8a1d1',
    letterSpacing: 2,
    textShadowColor: '#fff0fa',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  dropdown: {
    borderWidth: 2,
    borderColor: '#f8a1d1',
    borderRadius: 12,
    backgroundColor: '#fff0fa',
    marginBottom: 14,
    width: 260,
  },
  dropdownContainer: {
    borderColor: '#f8a1d1',
    backgroundColor: '#fff0fa',
    width: 260,
  },
  dropdownText: {
    color: '#a259c6',
    fontSize: 15,
  },
  button: {
    backgroundColor: '#f8a1d1',
    padding: 14,
    borderRadius: 12,
    width: 260,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  cleanupButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#ff6b6b',
    borderRadius: 8,
  },
  cleanupButtonText: {
    color: '#fff',
    fontSize: 12,
  },
}); 