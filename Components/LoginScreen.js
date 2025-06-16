import React, { useState, useContext, useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Image, Keyboard, TouchableOpacity, Alert } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { AuthContext } from './AuthContext';
import { ScheduleContext } from './ScheduleContext';
import { TaskContext } from './TaskContext';
import { BudgetContext } from './BudgetContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [open, setOpen] = useState(false);
  const { login } = useAuth();
  const names = [
    { label: 'Maria', value: 'Maria' },
    { label: 'Reni', value: 'Reni' },
    { label: 'Luna', value: 'Luna' },
    { label: 'Sheila', value: 'Sheila' },
  ];

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

    // Proceed if password is correct
    await login(userKey);
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (text.length === 4) {
      Keyboard.dismiss();
    }
  };

  useEffect(() => {
    console.log("Current username state:", username);
    console.log("Current password state:", password);
  }, [username, password]);

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
      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.linkText}>Don't have an account? Sign up</Text>
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
    fontFamily: 'PressStart2P',
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
    fontFamily: 'PressStart2P',
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
    fontFamily: 'PressStart2P',
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
    fontFamily: 'PressStart2P',
    color: '#fff',
    textAlign: 'center',
  },
  linkText: {
    color: '#f8a1d1',
    fontFamily: 'PressStart2P',
    fontSize: 14,
    marginTop: 10,
  },
}); 