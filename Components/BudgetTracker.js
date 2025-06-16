// Import packages
import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, FlatList, ImageBackground,
  KeyboardAvoidingView, Platform, Image, Alert, useWindowDimensions, Keyboard, TouchableWithoutFeedback, ActivityIndicator
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBudget } from './BudgetContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Preload images
const images = {
  kawaiiStar: require('../assets/kawaii-star.gif'),
  pixelHeart: require('../assets/pixel-heart.gif'),
  catFace: require('../assets/cat-face.gif'),
  rainbow: require('../assets/rainbow.gif'),
  pastelBg: require('../assets/pastel-pixel-bg.jpg'),
};

const Tab = createBottomTabNavigator();

// Create AuthContext
const AuthContext = React.createContext();

// 🌟 Quote Bubble Component
const QuoteBubble = ({ text }) => (
  <View style={styles.quoteBubble}>
    <Text style={styles.quoteText}>
      🎀 {text}
    </Text>
  </View>
);

// 🎀 Decorative Icons
const DecorativeElements = ({ isSmallScreen }) => (
  <>
    <Image source={images.kawaiiStar} style={[styles.decorativeIcon, { top: isSmallScreen ? 5 : 10, left: 10, width: 25, height: 25 }]} />
    <Image source={images.pixelHeart} style={[styles.decorativeIcon, { top: isSmallScreen ? 5 : 10, right: 10, width: 25, height: 25 }]} />
    <Image source={images.catFace} style={[styles.decorativeIcon, { bottom: isSmallScreen ? 5 : 10, left: 10, width: 25, height: 25 }]} />
    <Image source={images.rainbow} style={[styles.decorativeIcon, { bottom: isSmallScreen ? 5 : 10, right: 10, width: 25, height: 25 }]} />
  </>
);

// 🍱 Food Tab
const FoodTab = () => {
  const { budgetData, updateBudget, isLoading: contextLoading } = useBudget();
  const [foodLogs, setFoodLogs] = useState([]);
  const [foodName, setFoodName] = useState('');
  const [foodPrice, setFoodPrice] = useState('');
  const [initialBalance, setInitialBalance] = useState(100);
  const [totalSpent, setTotalSpent] = useState(0);
  const [showBalanceInput, setShowBalanceInput] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load saved data on startup
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [savedFoodLogs, savedBalance] = await Promise.all([
          AsyncStorage.getItem('foodLogs'),
          AsyncStorage.getItem('initialBalance')
        ]);
        
        if (isMounted) {
          if (savedFoodLogs) {
            setFoodLogs(JSON.parse(savedFoodLogs));
          }
          if (savedBalance) {
            setInitialBalance(parseFloat(savedBalance));
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        if (isMounted) {
          setError('Failed to load saved data');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Update budget whenever spending or balance changes
  useEffect(() => {
    try {
      const totalSpent = foodLogs.reduce((sum, item) => sum + (item.price || 0), 0);
      setTotalSpent(totalSpent);
      updateBudget(totalSpent, initialBalance);
    } catch (error) {
      console.error('Failed to update budget:', error);
      setError('Failed to update budget');
    }
  }, [foodLogs, initialBalance, updateBudget]);

  // Save data to AsyncStorage
  useEffect(() => {
    const saveData = async () => {
      try {
        await Promise.all([
          AsyncStorage.setItem('foodLogs', JSON.stringify(foodLogs)),
          AsyncStorage.setItem('initialBalance', initialBalance.toString())
        ]);
      } catch (error) {
        console.error('Failed to save data:', error);
        setError('Failed to save data');
      }
    };
    saveData();
  }, [foodLogs, initialBalance]);

  // Calculate remaining balance
  const remainingBalance = initialBalance - totalSpent;

  const handleBalanceChange = (text) => {
    try {
      const value = text === '' ? 0 : parseFloat(text) || 0;
      setInitialBalance(value);
    } catch (error) {
      console.error('Failed to update balance', error);
      Alert.alert('Error', 'Invalid balance amount');
    }
  };

  const handleAddFood = () => {
    try {
      if (!foodName || !foodPrice || isNaN(parseFloat(foodPrice))) {
        Alert.alert('Error', 'Please enter valid food name and price');
        return;
      }

      const price = parseFloat(foodPrice);
      const newFoodLog = {
        id: Date.now().toString(),
        name: foodName,
        price,
        date: new Date().toLocaleDateString()
      };

      setFoodLogs(prevLogs => [...prevLogs, newFoodLog]);
      setTotalSpent(prev => prev + price);
      setFoodName('');
      setFoodPrice('');
      Keyboard.dismiss();
    } catch (error) {
      console.error('Failed to add food', error);
      Alert.alert('Error', 'Failed to add food item');
    }
  };

  const handleAddMoney = () => {
    try {
      if (!foodName || !foodPrice || isNaN(parseFloat(foodPrice))) {
        Alert.alert('Error', 'Please enter valid amount');
        return;
      }

      const amount = parseFloat(foodPrice);
      setInitialBalance(prev => prev + amount);
      setFoodName('');
      setFoodPrice('');
      Keyboard.dismiss();
    } catch (error) {
      console.error('Failed to add money', error);
      Alert.alert('Error', 'Failed to add money');
    }
  };

  const handleRemoveFood = (id) => {
    Alert.alert(
      "Remove Food",
      "Are you sure you want to remove this item?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          onPress: () => {
            try {
              setFoodLogs(prevLogs => prevLogs.filter(item => item.id !== id));
            } catch (error) {
              console.error('Failed to remove food', error);
              Alert.alert('Error', 'Failed to remove food item');
            }
          }
        }
      ]
    );
  };

  if (isLoading || contextLoading) {
    return (
      <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size={36} color="#ff69b4" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            setIsLoading(true);
          }}
        >
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.content}>
        <QuoteBubble text="Every bite counts—track your tasty treats!" />
        {showBalanceInput ? (
          <>
            <Text style={styles.sectionTitle}>💖 Set Your Initial Balance</Text>
            <TouchableOpacity 
              style={styles.balanceButton}
              onPress={() => setShowBalanceInput(true)}
            >
              <Text style={styles.balanceButtonText}>
                {initialBalance ? `$${initialBalance.toFixed(2)}` : 'Set Balance'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>💰 Remaining: ${remainingBalance.toFixed(2)}</Text>
            <TextInput style={styles.input} placeholder="Item name" value={foodName} onChangeText={setFoodName} />
            <TextInput style={styles.input} placeholder="$ Amount" value={foodPrice} onChangeText={setFoodPrice} keyboardType="numeric" />
            
            <View style={styles.buttonRow}>
              <Animatable.View animation="pulse" iterationCount="infinite" style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.addButton, styles.expenseButton]} onPress={handleAddFood}>
                  <Text style={styles.buttonText}>➕ Add Expense</Text>
                </TouchableOpacity>
              </Animatable.View>
              
              <Animatable.View animation="pulse" iterationCount="infinite" style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.addButton, styles.incomeButton]} onPress={handleAddMoney}>
                  <Text style={styles.buttonText}>💰 Add Money</Text>
                </TouchableOpacity>
              </Animatable.View>
            </View>
            
            <FlatList
              data={foodLogs}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.item} 
                  onLongPress={() => handleRemoveFood(item.id)}
                >
                  <Text style={styles.itemText}>{item.name} - ${(item.price || 0).toFixed(2)}</Text>
                  <Text style={styles.dateText}>{item.date}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={item => item.id}
              contentContainerStyle={{ paddingBottom: 50 }}
            />
          </>
        )}
        {showBalanceInput && (
          <Animatable.View animation="fadeIn" style={styles.balanceInputContainer}>
            <TextInput
              style={styles.input}
              placeholder="$ New Balance"
              value={initialBalance === 0 ? '' : initialBalance.toString()}
              onChangeText={handleBalanceChange}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.addButton} onPress={() => setShowBalanceInput(false)}>
              <Text style={styles.buttonText}>Update</Text>
            </TouchableOpacity>
          </Animatable.View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

// 💸 Money Tab (updated with same safeguards)
const MoneyTab = () => {
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(0);
  const [isExpense, setIsExpense] = useState(true);

  useEffect(() => {
    const calculatedBalance = transactions.reduce((sum, t) => sum + t.amount, 0);
    setBalance(calculatedBalance);
  }, [transactions]);

  const handleAddTransaction = () => {
    const numericAmount = parseFloat(amount) || 0;
    if (!description || numericAmount <= 0) {
      Alert.alert("Error", "Please enter valid description and amount");
      return;
    }

    const transactionAmount = isExpense ? -Math.abs(numericAmount) : Math.abs(numericAmount);
    
    const newTransaction = {
      id: Date.now().toString(),
      desc: description,
      amount: transactionAmount,
      date: new Date().toLocaleDateString(),
      type: isExpense ? 'expense' : 'income'
    };

    setTransactions([newTransaction, ...transactions]);
    setDescription('');
    setAmount('');
    Keyboard.dismiss();
  };

  const handleRemoveTransaction = (id) => {
    Alert.alert(
      "Remove Transaction",
      "Are you sure you want to remove this transaction?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          onPress: () => {
            setTransactions(transactions.filter(item => item.id !== id));
          }
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
      <QuoteBubble text="Track your glittery coins and sparkle on!" />
      
      <Text style={styles.sectionTitle}>
        Current Balance: ${balance.toFixed(2)}
      </Text>

      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[styles.toggleButton, isExpense && styles.activeToggle]}
          onPress={() => setIsExpense(true)}
        >
          <Text style={styles.toggleText}>Expense</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleButton, !isExpense && styles.activeToggle]}
          onPress={() => setIsExpense(false)}
        >
          <Text style={styles.toggleText}>Income</Text>
        </TouchableOpacity>
      </View>

      <TextInput 
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />
      
      <TextInput
        style={styles.input}
        placeholder="$ Amount"
        value={amount}
        onChangeText={(text) => setAmount(text.replace(/[^0-9.]/g, ''))}
        keyboardType="numeric"
      />
      
      <TouchableOpacity style={styles.addButton} onPress={handleAddTransaction}>
        <Text style={styles.buttonText}>Add Transaction</Text>
      </TouchableOpacity>

      <FlatList
        data={transactions}
        renderItem={({ item }) => (
          <TouchableOpacity 
            onLongPress={() => handleRemoveTransaction(item.id)}
            style={[
              styles.item, 
              item.type === 'expense' ? styles.expenseItem : styles.incomeItem
            ]}
          >
            <Text style={styles.itemText}>{item.desc}</Text>
            <Text style={styles.amountText}>
              {item.type === 'expense' ? '-' : '+'}${Math.abs(item.amount).toFixed(2)}
            </Text>
            <Text style={styles.dateText}>{item.date}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
      />
    </KeyboardAvoidingView>
  );
};

// 🌸 Main Component
const BudgetTracker = () => {
  const { height } = useWindowDimensions();
  const isSmallScreen = height < 700;
  const { user } = useContext(AuthContext) || {}; // Safe access to context

  return (
    <SafeAreaView style={styles.bg}>
      <ImageBackground source={images.pastelBg} style={{ flex: 1 }} resizeMode="cover">
        <DecorativeElements isSmallScreen={isSmallScreen} />

        <Animatable.View animation="bounceIn" style={[styles.header]}>
          <Image source={images.kawaiiStar} style={{ width: 30, height: 30, marginRight: 10 }} />
          <Text style={[styles.title, { fontSize: Platform.OS === 'ios' ? 14 : 12 }]}>✨ Budget Tracker ✨</Text>
        </Animatable.View>

        <Tab.Navigator screenOptions={{
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: '#ff69b4',
          tabBarInactiveTintColor: '#ffb6c1',
        }}>
          <Tab.Screen name="Food" component={FoodTab} options={{ headerShown: false }} />
          <Tab.Screen name="Money" component={MoneyTab} options={{ headerShown: false }} />
        </Tab.Navigator>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default BudgetTracker;

export { AuthContext };
const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#fff0f5',
  },
  tabBar: {
    backgroundColor: '#ffd6e7',
    borderTopWidth: 0,
    elevation: 0,
    height: Platform.OS === 'ios' ? 70 : 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#ffb6c1',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.2,
    shadowRadius: 10
  },
  header: {
    backgroundColor: 'rgba(255, 214, 231, 0.9)',
    borderRadius: 25,
    padding: 12,
    margin: 15,
    marginTop: 25,
    borderWidth: 3,
    borderColor: '#ffb6c1',
    shadowColor: '#ff85a2',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontFamily: 'PressStart2P',
    fontSize: Platform.OS === 'ios' ? 18 : 16,
    color: '#ff69b4',
    textShadowColor: 'rgba(255,255,255,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2
  },
  content: {
    flex: 1,
    padding: 10,
    backgroundColor: 'rgba(255, 240, 250, 0.9)'
  },
  input: {
    borderWidth: 3,
    borderColor: '#ffb6c1',
    backgroundColor: '#fff0f5',
    padding: 8,
    marginBottom: 8,
    borderRadius: 15,
    fontFamily: 'PressStart2P',
    fontSize: 12,
    color: '#ff69b4',
    textAlign: 'center',
    shadowColor: '#ffccff',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6
  },
  addButton: {
    backgroundColor: '#ffb6c1',
    padding: 8,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#ff69b4',
    shadowColor: '#ff69b4',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5
  },
  buttonText: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    color: '#fff'
  },
  item: {
    backgroundColor: '#ffe6f2',
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#ffb6c1',
    shadowColor: '#ffb6c1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5
  },
  incomeItem: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4CAF50'
  },
  expenseItem: {
    backgroundColor: '#ffebee',
    borderColor: '#F44336'
  },
  itemText: {
    fontFamily: 'PressStart2P',
    fontSize: 14,
    color: '#ff69b4'
  },
  dateText: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#ffb6c1',
    marginTop: 5
  },
  sectionTitle: {
    fontFamily: 'PressStart2P',
    fontSize: 14,
    color: '#ff69b4',
    marginBottom: 20,
    textAlign: 'center',
    textDecorationLine: 'underline',
    textShadowColor: 'rgba(255,255,255,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3
  },
  decorativeIcon: {
    position: 'absolute',
    resizeMode: 'contain',
    zIndex: 0
  },
  balanceButton: {
    backgroundColor: '#ffb6c1',
    padding: 8,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#ff69b4',
    shadowColor: '#ff69b4',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5
  },
  balanceButtonText: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    color: '#fff'
  },
  balanceInputContainer: {
    backgroundColor: 'rgba(255, 240, 250, 0.9)',
    padding: 10,
    borderRadius: 15,
    marginBottom: 10
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  toggleButton: {
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#e9d6ff',
    borderWidth: 2,
    borderColor: '#d1'
  },
  activeToggle: {
    backgroundColor: '#ffb6c1',
    borderColor: '#ff69b4'
  },
  toggleText: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    color: '#ff69b4'
  },
  amountText: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    color: '#ff69b4'
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  buttonContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  expenseButton: {
    backgroundColor: '#ff6b6b',
    borderColor: '#ff4757',
  },
  incomeButton: {
    backgroundColor: '#51cf66',
    borderColor: '#40c057',
  },
  quoteBubble: {
    backgroundColor: '#ffeef8',
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#ffb6c1',
    shadowColor: '#ffb6c1',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4
  },
  quoteText: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    color: '#ff69b4',
    textAlign: 'center'
  },
  errorText: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    color: '#ff4757',
    textAlign: 'center',
    marginBottom: 10
  },
  retryButton: {
    backgroundColor: '#ff6b6b',
    padding: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ff4757'
  }
});
