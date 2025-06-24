import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

const TutorialContext = createContext();

export const TutorialProvider = ({ children }) => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentTab, setCurrentTab] = useState('Home');
  const { currentUser } = useAuth();

  // Define which tab each tutorial step should show
  const tutorialTabs = [
    'Home',    // Step 0: Introduction
    'Home',    // Step 1: Home screen explanation
    'Schedule', // Step 2: Schedule tab explanation
    'Budget',  // Step 3: Budget tab explanation
    'Avatar',  // Step 4: Avatar tab explanation
  ];

  useEffect(() => {
    const checkTutorialStatus = async () => {
      if (!currentUser) {
        // If no user is logged in, don't show tutorial
        setShowTutorial(false);
        setCurrentStep(0);
        setCurrentTab('Home');
        return;
      }
      
      try {
        const tutorialKey = `tutorialShown_${currentUser}`;
        const tutorialShown = await AsyncStorage.getItem(tutorialKey);
        console.log(`Tutorial status for ${currentUser}:`, tutorialShown);
        // Only hide if explicitly marked as shown for this user
        if (tutorialShown === 'true') {
          console.log(`Hiding tutorial for ${currentUser} because it was shown before`);
          setShowTutorial(false);
        } else {
          console.log(`Showing tutorial for ${currentUser} because it was not shown before`);
          setShowTutorial(true);
          setCurrentStep(0);
          setCurrentTab('Home');
        }
      } catch (error) {
        console.error('Error checking tutorial status:', error);
        // If there's an error, show the tutorial
        setShowTutorial(true);
        setCurrentStep(0);
        setCurrentTab('Home');
      }
    };
    checkTutorialStatus();
  }, [currentUser]);

  // Update current tab when step changes
  useEffect(() => {
    console.log('Tab switching effect triggered:', { showTutorial, currentStep, tutorialTabs });
    if (showTutorial && currentStep < tutorialTabs.length) {
      // Only change tab for explanation steps (step 2 and onwards), not introduction
      if (currentStep >= 2) {
        const newTab = tutorialTabs[currentStep];
        console.log(`Switching to tab: ${newTab} for step ${currentStep}`);
        setCurrentTab(newTab);
      } else {
        // Keep on Home for introduction steps
        console.log('Keeping on Home tab for introduction step');
        setCurrentTab('Home');
      }
    }
  }, [currentStep, showTutorial]);

  const completeTutorial = async () => {
    if (!currentUser) {
      console.log('Cannot complete tutorial: no user logged in');
      return;
    }
    
    try {
      console.log(`Completing tutorial for ${currentUser}`);
      const tutorialKey = `tutorialShown_${currentUser}`;
      await AsyncStorage.setItem(tutorialKey, 'true');
      setShowTutorial(false);
      console.log('Tutorial completed successfully');
    } catch (error) {
      console.error('Error saving tutorial status:', error);
    }
  };

  const resetTutorial = async () => {
    if (!currentUser) {
      console.log('Cannot reset tutorial: no user logged in');
      return;
    }
    
    try {
      console.log(`Resetting tutorial for ${currentUser}`);
      const tutorialKey = `tutorialShown_${currentUser}`;
      await AsyncStorage.removeItem(tutorialKey);
      setShowTutorial(true);
      setCurrentStep(0);
      setCurrentTab('Home');
      console.log('Tutorial reset successfully');
    } catch (error) {
      console.error('Error resetting tutorial status:', error);
    }
  };

  const nextStep = () => {
    const nextStepNumber = currentStep + 1;
    console.log('Moving to next step:', nextStepNumber);
    setCurrentStep(nextStepNumber);
    
    // Immediately update tab for the next step
    if (nextStepNumber >= 2 && nextStepNumber < tutorialTabs.length) {
      const nextTab = tutorialTabs[nextStepNumber];
      console.log(`Immediately setting next tab: ${nextTab} for step ${nextStepNumber}`);
      setCurrentTab(nextTab);
    }
  };

  const skipTutorial = () => {
    console.log('Skipping tutorial');
    completeTutorial();
  };

  console.log('Current tutorial state:', { showTutorial, currentStep, currentTab, currentUser });

  return (
    <TutorialContext.Provider value={{
      showTutorial,
      currentStep,
      currentTab,
      nextStep,
      skipTutorial,
      completeTutorial,
      resetTutorial
    }}>
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
}; 