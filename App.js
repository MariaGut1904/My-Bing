import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator, StyleSheet, Platform, LogBox, StatusBar, Image } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import { Asset } from 'expo-asset';
import { AuthProvider, useAuth } from './Components/AuthContext';
import { TaskProvider } from './Components/TaskContext';
import { ScheduleProvider } from './Components/ScheduleContext';
import { BudgetProvider } from './Components/BudgetContext';
import { TutorialProvider, useTutorial } from './Components/TutorialContext';
import { TutorialOverlay } from './Components/TutorialOverlay';
import ErrorBoundary from './Components/ErrorBoundary';
import LoginScreen from './Components/LoginScreen';
import HomeScreen from './Components/HomeScreen';
import TasksScreen from './Components/TasksScreen';
import BudgetTracker from './Components/BudgetTracker';
import SchedulePlanner from './Components/SchedulePlanner';
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
  'Internal React error: Expected static flag was missing',
  'React has detected a change in the order of Hooks',
]);

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  const { currentUser } = useAuth();
  const { showTutorial, currentTab, currentStep } = useTutorial();
  const navigationRef = useRef(null);

  // Effect to change tab when tutorial step changes
  useEffect(() => {
    if (showTutorial && currentStep >= 2 && currentTab) {
      // Use a more reliable navigation approach
      const navigateToTab = () => {
        if (navigationRef.current) {
          try {
            navigationRef.current.navigate(currentTab);
          } catch (error) {
            // Navigation failed silently
          }
        } else {
          // Retry after a short delay
          setTimeout(() => {
            if (navigationRef.current) {
              try {
                navigationRef.current.navigate(currentTab);
              } catch (error) {
                // Navigation retry failed silently
              }
            }
          }, 300);
        }
      };

      // Try immediate navigation
      navigateToTab();
    }
  }, [showTutorial, currentStep, currentTab]);

  return (
    <Tab.Navigator
      ref={navigationRef}
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Budget') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Schedule') {
            iconName = focused ? 'calendar' : 'calendar-outline';
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
    </Tab.Navigator>
  );
}

function NavigationWrapper() {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
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
      {currentUser && <TutorialOverlay />}
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    async function loadAssets() {
      try {
        // Load fonts
        await Font.loadAsync({
          'PressStart2P': require('./assets/fonts/PressStart2P-Regular.ttf'),
        });

        // Preload Maria's images for faster loading
        await Promise.all([
          Asset.loadAsync(require('./assets/Maria.png')),
          Asset.loadAsync(require('./assets/Mar_hap.png')),
          Asset.loadAsync(require('./assets/Mar_speak.png')),
        ]);

        setFontsLoaded(true);
        setImagesLoaded(true);
      } catch (error) {
        console.log('Error loading assets:', error);
        setFontsLoaded(true); // Continue without custom font
        setImagesLoaded(true); // Continue without preloaded images
      }
    }
    loadAssets();
  }, []);

  if (!fontsLoaded || !imagesLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#ff69b4" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <AuthProvider>
        <TaskProvider>
          <ScheduleProvider>
            <BudgetProvider>
              <TutorialProvider>
                <ErrorBoundary>
                  <NavigationWrapper />
                </ErrorBoundary>
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

