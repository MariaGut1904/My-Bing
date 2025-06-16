import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator, StyleSheet, Platform, LogBox, StatusBar } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

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
const Tab = createBottomTabNavigator();

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

const TabNavigator = () => {
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
        tabBarStyle: {
          backgroundColor: '#f8e1f4',
          height: 70,
          paddingTop: 10,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          borderTopWidth: 1,
          borderTopColor: '#d1b3ff',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          color: '#a259c6',
        },
        tabBarActiveTintColor: '#a259c6',
        tabBarInactiveTintColor: '#d291bc',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Budget" component={BudgetTracker} />
      <Tab.Screen name="Schedule" component={SchedulePlanner} />
      <Tab.Screen name="Avatar" component={AvatarBuilder} />
    </Tab.Navigator>
  );
};

const App = () => {
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
                    }}
                  >
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Home" component={TabNavigator} />
                  </Stack.Navigator>
                </View>
              </NavigationContainer>
            </BudgetProvider>
          </ScheduleProvider>
        </TaskProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
};

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

export default App;

