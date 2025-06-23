import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useBudget } from './BudgetContext';

export default function BudgetScreen() {
  const { budget, addExpense, deleteExpense } = useBudget();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Budget</Text>
      
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Budget</Text>
          <Text style={styles.summaryValue}>${budget.total || 0}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Spent</Text>
          <Text style={styles.summaryValue}>${budget.spent || 0}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Remaining</Text>
          <Text style={styles.summaryValue}>${(budget.total || 0) - (budget.spent || 0)}</Text>
        </View>
      </View>

      <ScrollView style={styles.expenseList}>
        {budget.expenses?.map((expense, index) => (
          <View key={index} style={styles.expenseItem}>
            <View style={styles.expenseDetails}>
              <Text style={styles.expenseTitle}>{expense.title}</Text>
              <Text style={styles.expenseCategory}>{expense.category}</Text>
            </View>
            <View style={styles.expenseAmount}>
              <Text style={styles.amountText}>${expense.amount}</Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteExpense(index)}
              >
                <Text style={styles.deleteButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => addExpense({
          title: 'New Expense',
          amount: 0,
          category: 'Other'
        })}
      >
        <Text style={styles.addButtonText}>+ Add Expense</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8e1f4',
    padding: 20,
  },
  title: {
    fontFamily: 'PressStart2P',
    fontSize: 24,
    color: '#a259c6',
    marginBottom: 20,
    textAlign: 'center',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#d291bc',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#d291bc',
    marginBottom: 5,
  },
  summaryValue: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    color: '#a259c6',
  },
  expenseList: {
    flex: 1,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#d291bc',
  },
  expenseDetails: {
    flex: 1,
  },
  expenseTitle: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    color: '#a259c6',
    marginBottom: 5,
  },
  expenseCategory: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#d291bc',
  },
  expenseAmount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountText: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    color: '#a259c6',
    marginRight: 10,
  },
  deleteButton: {
    padding: 5,
  },
  deleteButtonText: {
    fontFamily: 'PressStart2P',
    fontSize: 16,
    color: '#d291bc',
  },
  addButton: {
    backgroundColor: '#d291bc',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    color: '#fff',
  },
}); 