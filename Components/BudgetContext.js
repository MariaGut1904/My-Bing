import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BudgetContext = createContext();

export const BudgetProvider = ({ children }) => {
  const [budgetData, setBudgetData] = useState({ total: 0, percentage: 0 });
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Memoize the updateBudget function to prevent unnecessary re-renders
  const updateBudget = useCallback((totalSpent, totalBudget) => {
    try {
      const percentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
      setBudgetData(prev => ({ ...prev, total: totalBudget, percentage }));
    } catch (error) {
      console.error('Failed to update budget:', error);
    }
  }, []);

  // Load budget data
  useEffect(() => {
    let isMounted = true;
    const loadBudget = async () => {
      if (!currentUserId) {
        if (isMounted) {
          setBudgetData({ total: 0, percentage: 0 });
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        const savedBudget = await AsyncStorage.getItem(`budget_${currentUserId}`);
        if (isMounted) {
          setBudgetData(savedBudget ? JSON.parse(savedBudget) : { total: 0, percentage: 0 });
        }
      } catch (error) {
        console.error('Failed to load budget:', error);
        if (isMounted) {
          setBudgetData({ total: 0, percentage: 0 });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadBudget();
    return () => {
      isMounted = false;
    };
  }, [currentUserId]);

  // Save budget data
  useEffect(() => {
    const saveBudget = async () => {
      if (!currentUserId) return;
      
      try {
        await AsyncStorage.setItem(`budget_${currentUserId}`, JSON.stringify(budgetData));
      } catch (error) {
        console.error('Failed to save budget:', error);
      }
    };

    saveBudget();
  }, [budgetData, currentUserId]);

  const resetBudget = useCallback(() => {
    try {
      setBudgetData({ total: 0, percentage: 0 });
    } catch (error) {
      console.error('Failed to reset budget:', error);
    }
  }, []);

  const value = {
    budgetData,
    updateBudget,
    setCurrentUserId,
    resetBudget,
    isLoading
  };

  return (
    <BudgetContext.Provider value={value}>
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
