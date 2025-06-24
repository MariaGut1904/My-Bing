// Import packages
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, FlatList, ImageBackground,
  KeyboardAvoidingView, Platform, Image, Alert, useWindowDimensions, Keyboard, TouchableWithoutFeedback, ActivityIndicator, Modal, ScrollView
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBudget } from './BudgetContext';
import { HelpOverlay } from './HelpOverlay';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './AuthContext';

// Preload images
const images = {
  decor5: require('../assets/decor5.gif'),
  decor6: require('../assets/decor6.gif'),
  decor7: require('../assets/decor7.gif'),
  decor8: require('../assets/decor8.gif'),
  decor9: require('../assets/decor9.gif'),
  pastelBg: require('../assets/pastel-pixel-bg.jpg'),
};

// 🌟 Quote Bubble Component
const QuoteBubble = ({ text }) => (
  <View style={styles.quoteBubble}>
    <Text style={styles.quoteText}>
      🎀 {text}
    </Text>
  </View>
);

// 🍱 Food Tab
const FoodTab = () => {
  const { budget, addExpense, deleteExpense } = useBudget();
  const foodExpenses = budget?.food || [];

  return (
    <View style={styles.tabContent}>
      {foodExpenses.map(expense => (
        <View key={expense.id} style={styles.expenseItem}>
          <Text style={styles.expenseText}>{expense.name}</Text>
          <Text style={styles.expenseAmount}>${expense.amount}</Text>
        </View>
      ))}
    </View>
  );
};

// 💸 Money Tab (updated with same safeguards)
const MoneyTab = () => {
  const { budget, addExpense, deleteExpense } = useBudget();
  const moneyExpenses = budget?.money || [];

  return (
    <View style={styles.tabContent}>
      {moneyExpenses.map(expense => (
        <View key={expense.id} style={styles.expenseItem}>
          <Text style={styles.expenseText}>{expense.name}</Text>
          <Text style={styles.expenseAmount}>${expense.amount}</Text>
        </View>
      ))}
    </View>
  );
};

// 🌸 Main Component
const BudgetTracker = () => {
  const { budget = { food: [], money: [], limits: { food: 0, money: 0 } }, addExpense, deleteExpense, setBudgetLimit } = useBudget();
  const [activeTab, setActiveTab] = useState('food');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLimitModalVisible, setIsLimitModalVisible] = useState(false);
  const [newExpense, setNewExpense] = useState({ amount: '', description: '' });
  const [newLimit, setNewLimit] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  const handleAddExpense = () => {
    if (newExpense.amount && newExpense.description) {
      addExpense(activeTab, {
        id: Date.now().toString(),
        amount: parseFloat(newExpense.amount),
        description: newExpense.description,
        date: new Date().toISOString(),
      });
      setNewExpense({ amount: '', description: '' });
      setIsModalVisible(false);
    }
  };

  const handleSetLimit = () => {
    if (newLimit) {
      setBudgetLimit(activeTab, parseFloat(newLimit));
      setNewLimit('');
      setIsLimitModalVisible(false);
    }
  };

  const getTotalExpenses = (expenses) => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  const getRemainingBudget = (category) => {
    const limit = budget.limits[category] || 0;
    const spent = getTotalExpenses(budget[category]);
    return limit - spent;
  };

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground 
        source={require('../assets/pastel-pixel-bg.jpg')} 
        style={styles.bg} 
        resizeMode="cover"
      >
        <SafeAreaView style={styles.bg}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <Animatable.View animation="bounceIn" style={styles.header}>
              <Image 
                source={require('../assets/decor5.gif')} 
                style={styles.headerIcon}
              />
              <Text style={styles.title}>✨ Budget Tracker ✨</Text>
              <TouchableOpacity 
                style={styles.helpButton}
                onPress={() => setShowHelp(true)}
              >
                <Image 
                  source={require('../assets/help.png')} 
                  style={styles.helpIcon}
                />
              </TouchableOpacity>
            </Animatable.View>

            {/* Tab Navigation */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'food' && styles.activeTab]}
                onPress={() => setActiveTab('food')}
              >
                <Image 
                  source={require('../assets/food-icon.gif')} 
                  style={styles.tabIcon}
                />
                <Text style={[styles.tabText, activeTab === 'food' && styles.activeTabText]}>
                  Food
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'money' && styles.activeTab]}
                onPress={() => setActiveTab('money')}
              >
                <Image 
                  source={require('../assets/money-icon.gif')} 
                  style={styles.tabIcon}
                />
                <Text style={[styles.tabText, activeTab === 'money' && styles.activeTabText]}>
                  Money
                </Text>
              </TouchableOpacity>
            </View>

            {/* Budget Summary Card */}
            <Animatable.View animation="fadeInUp" style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryTitle}>Budget Limit:</Text>
                <Text style={styles.summaryAmount}>
                  {formatCurrency(budget.limits[activeTab] || 0)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryTitle}>Spent:</Text>
                <Text style={styles.summaryAmount}>
                  {formatCurrency(getTotalExpenses(budget[activeTab]))}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryTitle}>Remaining:</Text>
                <Text style={[
                  styles.summaryAmount,
                  { color: getRemainingBudget(activeTab) >= 0 ? '#4CAF50' : '#ff6b6b' }
                ]}>
                  {formatCurrency(getRemainingBudget(activeTab))}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.setLimitButton}
                onPress={() => setIsLimitModalVisible(true)}
              >
                <Text style={styles.setLimitButtonText}>Set Budget Limit ✨</Text>
              </TouchableOpacity>
            </Animatable.View>

            {/* Expense List */}
            <Animatable.View animation="fadeInUp" delay={200} style={styles.expenseList}>
              {budget[activeTab].length > 0 ? (
                budget[activeTab].map((expense) => (
                  <View key={expense.id} style={styles.expenseItem}>
                    <View style={styles.expenseInfo}>
                      <Text style={styles.expenseDescription}>{expense.description}</Text>
                      <Text style={styles.expenseDate}>
                        {new Date(expense.date).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.expenseAmountContainer}>
                      <Text style={styles.expenseAmount}>
                        {formatCurrency(expense.amount)}
                      </Text>
                      <TouchableOpacity
                        onPress={() => deleteExpense(activeTab, expense.id)}
                        style={styles.deleteButton}
                      >
                        <Image
                          source={require('../assets/trash.png')}
                          style={styles.deleteIcon}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noExpensesText}>No expenses yet. Add one below! ✨</Text>
              )}
            </Animatable.View>

            {/* Add Expense Button */}
            <Animatable.View animation="fadeInUp" delay={400}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setIsModalVisible(true)}
              >
                <Text style={styles.addButtonText}>Add Expense ✨</Text>
              </TouchableOpacity>
            </Animatable.View>
          </ScrollView>

          {/* Add Expense Modal */}
          <Modal
            visible={isModalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setIsModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Add New Expense ✨</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Amount"
                  keyboardType="decimal-pad"
                  value={newExpense.amount}
                  onChangeText={(text) => setNewExpense({ ...newExpense, amount: text })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Description"
                  value={newExpense.description}
                  onChangeText={(text) => setNewExpense({ ...newExpense, description: text })}
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: '#ffb6c1' }]}
                    onPress={() => setIsModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: '#ff69b4' }]}
                    onPress={handleAddExpense}
                  >
                    <Text style={styles.modalButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Set Budget Limit Modal */}
          <Modal
            visible={isLimitModalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setIsLimitModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Set Budget Limit ✨</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter budget limit"
                  keyboardType="decimal-pad"
                  value={newLimit}
                  onChangeText={setNewLimit}
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: '#ffb6c1' }]}
                    onPress={() => setIsLimitModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: '#ff69b4' }]}
                    onPress={handleSetLimit}
                  >
                    <Text style={styles.modalButtonText}>Set Limit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      </ImageBackground>
      <HelpOverlay 
        visible={showHelp} 
        tab="budget" 
        onClose={() => setShowHelp(false)} 
      />
    </View>
  );
};

export default BudgetTracker;

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
    backgroundColor: 'rgba(255, 214, 231, 0.9)',
    borderRadius: 25,
    padding: 12,
    borderWidth: 3,
    borderColor: '#ffb6c1',
    shadowColor: '#ff85a2',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  headerIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  title: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#ff69b4',
    textShadowColor: 'rgba(255,255,255,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#ffd6e7',
    borderRadius: 20,
    padding: 10,
    borderWidth: 3,
    borderColor: '#ffb6c1',
    shadowColor: '#ff85a2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 15,
  },
  activeTab: {
    backgroundColor: '#ffb6c1',
  },
  tabIcon: {
    width: 25,
    height: 25,
    marginRight: 5,
  },
  tabText: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#ff69b4',
  },
  activeTabText: {
    color: '#fff',
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 240, 250, 0.9)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#ffb6c1',
    shadowColor: '#ff85a2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    alignItems: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  summaryTitle: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#ff69b4',
  },
  summaryAmount: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#ff69b4',
  },
  expenseList: {
    backgroundColor: 'rgba(255, 240, 250, 0.9)',
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#ffb6c1',
    shadowColor: '#ff85a2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#ffd6e7',
  },
  expenseInfo: {
    flex: 1,
  },
  expenseDescription: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#ff69b4',
  },
  expenseDate: {
    fontFamily: 'PressStart2P',
    fontSize: 6,
    color: '#ffb6c1',
  },
  expenseAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expenseAmount: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#ff69b4',
    marginRight: 10,
  },
  deleteButton: {
    padding: 5,
  },
  deleteIcon: {
    width: 20,
    height: 20,
  },
  noExpensesText: {
    fontFamily: 'PressStart2P',
    fontSize: 6,
    color: '#ffb6c1',
    textAlign: 'center',
    marginTop: 10,
  },
  addButton: {
    backgroundColor: '#ffb6c1',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ff69b4',
    shadowColor: '#ff69b4',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  addButtonText: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff0fa',
    padding: 20,
    borderRadius: 20,
    width: '80%',
    borderWidth: 3,
    borderColor: '#ffb6c1',
    shadowColor: '#ff85a2',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  modalTitle: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#ff69b4',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 10,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#ffb6c1',
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#ff69b4',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    padding: 10,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  modalButtonText: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#fff',
  },
  setLimitButton: {
    backgroundColor: '#ffb6c1',
    padding: 10,
    borderRadius: 15,
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#ff69b4',
  },
  setLimitButtonText: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#fff',
    textAlign: 'center',
  },
  helpButton: {
    padding: 5,
  },
  helpIcon: {
    width: 20,
    height: 20,
  },
});
