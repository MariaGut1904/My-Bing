import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { View, ActivityIndicator, StyleSheet, Platform, LogBox, StatusBar } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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

// Initialize navigation
const Stack = createNativeStackNavigator();
const Tab = createMaterialTopTabNavigator();

// Import components directly
import HomeScreen from './Components/HomeScreen';
import LoginScreen from './Components/LoginScreen';
import BudgetTracker from './Components/BudgetTracker';
import SchedulePlanner from './Components/SchedulePlanner';
import AvatarBuilder from './Components/AvatarBuilder';
import { AuthProvider } from './Components/AuthContext';
import { ScheduleProvider } from './Components/ScheduleContext';
import { TaskProvider } from './Components/TaskContext';
import { BudgetProvider } from './Components/BudgetContext';

// Loading component
const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8e1f4' }}>
    <ActivityIndicator size={36} color="#d291bc" />
  </View>
);

function HomeTabs() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8e1f4" />
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: '#f8e1f4',
            height: 70,
            paddingTop: Platform.OS === 'ios' ? 30 : 25,
            borderBottomWidth: 1,
            borderBottomColor: '#d1b3ff',
          },
          tabBarItemStyle: {
            justifyContent: 'flex-end',
            alignItems: 'center',
            paddingBottom: Platform.OS === 'ios' ? 50 : 25,
          },
          tabBarLabelStyle: {
            fontSize: Platform.OS === 'ios' ? 8 : 9,
            paddingBottom: 2,
            color: '#a259c6',
            includeFontPadding: false,
            textAlign: 'center',
          },
          tabBarActiveTintColor: '#a259c6',
          tabBarInactiveTintColor: '#d291bc',
          tabBarIndicatorStyle: {
            backgroundColor: '#d1b3ff',
            height: 3,
          },
          animationEnabled: false,
          lazy: true,
          freezeOnBlur: true,
          unmountOnBlur: true,
        }}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ lazy: true }}
        />
        <Tab.Screen 
          name="Budget" 
          component={BudgetTracker}
          options={{ lazy: true }}
        />
        <Tab.Screen 
          name="Schedule" 
          component={SchedulePlanner}
          options={{ lazy: true }}
        />
        <Tab.Screen 
          name="Avatar" 
          component={AvatarBuilder}
          options={{ lazy: true }}
        />
      </Tab.Navigator>
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <TaskProvider>
          <ScheduleProvider>
            <BudgetProvider>
              <NavigationContainer>
                <View style={styles.bg}>
                  <StatusBar barStyle="dark-content" backgroundColor="#f8e1f4" />
                  <Stack.Navigator
                    initialRouteName="Login"
                    screenOptions={{
                      headerShown: false,
                      animation: 'none',
                      freezeOnBlur: true,
                      unmountOnBlur: true,
                    }}
                  >
                    <Stack.Screen 
                      name="Login" 
                      component={LoginScreen}
                      options={{ animationEnabled: false }}
                    />
                    <Stack.Screen 
                      name="Home" 
                      component={HomeTabs}
                      options={{ animationEnabled: false }}
                    />
                  </Stack.Navigator>
                </View>
              </NavigationContainer>
            </BudgetProvider>
          </ScheduleProvider>
        </TaskProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
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

