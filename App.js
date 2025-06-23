import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator, StyleSheet, Platform, LogBox, StatusBar } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import { AuthProvider, useAuth } from './Components/AuthContext';
import { TaskProvider } from './Components/TaskContext';
import { ScheduleProvider } from './Components/ScheduleContext';
import { BudgetProvider } from './Components/BudgetContext';
import { TutorialProvider } from './Components/TutorialContext';
import { TutorialOverlay } from './Components/TutorialOverlay';
import LoginScreen from './Components/LoginScreen';
import HomeScreen from './Components/HomeScreen';
import BudgetTracker from './Components/BudgetTracker';
import SchedulePlanner from './Components/SchedulePlanner';
import AvatarBuilder from './Components/AvatarBuilder';
import LoadingScreen from './Components/LoadingScreen';

// Enable screens for better performance
enableScreens(true);

// Ignore specific warnings
LogBox.ignoreLogs([
  'Unsupported top level event type "topInsetsChange"',
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
  'Non-serializable values were found in the navigation state',
  'Sending `onAnimatedValueUpdate` with no listeners registered',
  'Require cycle',
  'Possible Unhandled Promise Rejection',
  'VirtualizedLists should never be nested',
]);

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  const { currentUser } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Budget') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Schedule') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Avatar') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#ff69b4',
        tabBarInactiveTintColor: '#ffb6c1',
        tabBarStyle: {
          backgroundColor: '#fff0fa',
          borderTopWidth: 2,
          borderTopColor: '#ffb6c1',
          paddingBottom: 5,
          paddingTop: 5,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Home',
        }}
      />
      <Tab.Screen 
        name="Budget" 
        component={BudgetTracker}
        options={{
          title: 'Budget',
        }}
      />
      <Tab.Screen 
        name="Schedule" 
        component={SchedulePlanner}
        options={{
          title: 'Schedule',
        }}
      />
      <Tab.Screen 
        name="Avatar" 
        component={AvatarBuilder}
        options={{
          title: 'Avatar',
        }}
      />
    </Tab.Navigator>
  );
}

function NavigationWrapper() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#fff' }
        }}
      >
        {!currentUser ? (
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <Stack.Screen 
            name="MainTabs" 
            component={TabNavigator}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <AuthProvider>
        <TaskProvider>
          <ScheduleProvider>
            <BudgetProvider>
              <TutorialProvider>
                <NavigationWrapper />
              </TutorialProvider>
            </BudgetProvider>
          </ScheduleProvider>
        </TaskProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  bg: {
    flex: 1,
    backgroundColor: '#f8e1f4',
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8e1f4',
  },
});

