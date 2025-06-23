import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

const BudgetContext = createContext();

export const BudgetProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [budget, setBudget] = useState({
    food: [],
    money: [],
    limits: {
      food: 0,
      money: 0
    }
  });

  // Load budget for the current user
  useEffect(() => {
    const loadBudget = async () => {
      if (!currentUser) return;
      try {
        const userBudget = await AsyncStorage.getItem(`budget_${currentUser}`);
        if (userBudget) {
          setBudget(JSON.parse(userBudget));
        }
      } catch (error) {
        console.error('Error loading budget:', error);
      }
    };
    loadBudget();
  }, [currentUser]);

  // Save budget whenever it changes
  useEffect(() => {
    const saveBudget = async () => {
      if (!currentUser) return;
      try {
        await AsyncStorage.setItem(`budget_${currentUser}`, JSON.stringify(budget));
      } catch (error) {
        console.error('Error saving budget:', error);
      }
    };
    saveBudget();
  }, [budget, currentUser]);

  const addExpense = (category, expense) => {
    setBudget(prevBudget => ({
      ...prevBudget,
      [category]: [...prevBudget[category], { ...expense, id: Date.now().toString() }]
    }));
  };

  const deleteExpense = (category, expenseId) => {
    setBudget(prevBudget => ({
      ...prevBudget,
      [category]: prevBudget[category].filter(expense => expense.id !== expenseId)
    }));
  };

  const setBudgetLimit = (category, limit) => {
    setBudget(prevBudget => ({
      ...prevBudget,
      limits: {
        ...prevBudget.limits,
        [category]: limit
      }
    }));
  };

  const resetBudget = () => {
    setBudget({
      food: [],
      money: [],
      limits: {
        food: 0,
        money: 0
      }
    });
  };

  return (
    <BudgetContext.Provider value={{ budget, addExpense, deleteExpense, setBudgetLimit, resetBudget }}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};
