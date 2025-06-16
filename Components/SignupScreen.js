import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { useAuth } from './AuthContext';

export default function SignupScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSignup = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Username cannot be empty.');
      return;
    }
    if (!/^\d{4}$/.test(password)) {
      Alert.alert('Error', 'Password must be exactly 4 digits.');
      return;
    }
    // Simulate successful signup
    await login(username.toLowerCase());
    navigation.replace('Home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        placeholder="Name"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        placeholder="4-digit Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
        keyboardType="numeric"
        maxLength={4}
      />
      <Button title="Sign Up" onPress={handleSignup} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: { borderWidth: 1, marginBottom: 10, padding: 8, borderRadius: 4 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
}); 
 