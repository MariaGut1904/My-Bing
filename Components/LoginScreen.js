import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Image, Alert } from 'react-native';
import { useAuth } from './AuthContext';
import { useBudget } from './BudgetContext';
import { nuclearDataCleanup } from '../utils/cleanData';
import DropDownPicker from 'react-native-dropdown-picker';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const { login, currentUser } = useAuth();
  const { resetBudget } = useBudget();

  const users = [
    { label: 'Maria', value: 'Maria' },
    { label: 'Reni', value: 'Reni' },
    { label: 'Luna', value: 'Luna' },
    { label: 'Sheila', value: 'Sheila' },
  ];

  const handleLogin = async () => {
    try {
      console.log('Attempting login...');
      if (!username) {
        setError('Please select your name');
        return;
      }
      if (!password) {
        setError('Please enter your password');
        return;
      }

      // Check password based on username
      const validPasswords = {
        'Maria': '0919',
        'Reni': '0312',
        'Luna': '0924',
        'Sheila': '9012'
      };

      if (validPasswords[username] !== password) {
        setError('Incorrect password');
        return;
      }

      await login(username);
      console.log('Login successful, resetting tutorial...');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
    }
  };

  const handleClearData = async () => {
    // Only Maria (administrator) can clear all data, and she must be logged in
    if (currentUser !== 'Maria') {
      Alert.alert(
        'Access Denied', 
        'Only Maria (administrator) can clear all data. Please log in as Maria first.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Additional confirmation for Maria
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
      source={require('../assets/pastel-pixel-bg.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Image
          source={require('../assets/kawaii-star.gif')}
          style={styles.logo}
        />
        <Text style={styles.title}>✨ Welcome Back! ✨</Text>
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        <View style={styles.dropdownContainer}>
          <DropDownPicker
            open={open}
            value={username}
            items={users}
            setOpen={setOpen}
            setValue={setUsername}
            placeholder="Select your name"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownList}
            textStyle={styles.dropdownText}
            zIndex={3000}
            zIndexInverse={1000}
          />
        </View>
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login ✨</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontFamily: 'PressStart2P',
    fontSize: 14,
    color: '#ff69b4',
    marginBottom: 30,
    textAlign: 'center',
    textShadowColor: 'rgba(255,255,255,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  dropdownContainer: {
    width: '100%',
    marginBottom: 10,
    zIndex: 1000,
  },
  dropdown: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 2,
    borderColor: '#ffb6c1',
    borderRadius: 10,
    fontFamily: 'PressStart2P',
    fontSize: 8,
  },
  dropdownList: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 2,
    borderColor: '#ffb6c1',
    borderRadius: 10,
  },
  dropdownText: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#ff69b4',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#ffb6c1',
    fontFamily: 'PressStart2P',
    fontSize: 8,
  },
  loginButton: {
    backgroundColor: '#ffb6c1',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 3,
    borderColor: '#ff69b4',
    shadowColor: '#ff69b4',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  buttonText: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#fff',
  },
  errorText: {
    color: '#ff6b6b',
    marginBottom: 10,
    fontFamily: 'PressStart2P',
    fontSize: 8,
    textAlign: 'center',
  },
});

export default LoginScreen; 