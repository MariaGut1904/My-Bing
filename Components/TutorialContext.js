import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TutorialContext = createContext();

export const TutorialProvider = ({ children }) => {
  const [showTutorial, setShowTutorial] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const checkTutorialStatus = async () => {
      try {
        const tutorialShown = await AsyncStorage.getItem('tutorialShown');
        console.log('Tutorial status from storage:', tutorialShown);
        // Only hide if explicitly marked as shown
        if (tutorialShown === 'true') {
          console.log('Hiding tutorial because it was shown before');
          setShowTutorial(false);
        } else {
          console.log('Showing tutorial because it was not shown before');
          setShowTutorial(true);
        }
      } catch (error) {
        console.error('Error checking tutorial status:', error);
        // If there's an error, show the tutorial
        setShowTutorial(true);
      }
    };
    checkTutorialStatus();
  }, []);

  const completeTutorial = async () => {
    try {
      console.log('Completing tutorial');
      await AsyncStorage.setItem('tutorialShown', 'true');
      setShowTutorial(false);
    } catch (error) {
      console.error('Error saving tutorial status:', error);
    }
  };

  const resetTutorial = async () => {
    try {
      console.log('Resetting tutorial');
      await AsyncStorage.removeItem('tutorialShown');
      setShowTutorial(true);
      setCurrentStep(0);
    } catch (error) {
      console.error('Error resetting tutorial status:', error);
    }
  };

  const nextStep = () => {
    console.log('Moving to next step:', currentStep + 1);
    setCurrentStep(prev => prev + 1);
  };

  const skipTutorial = () => {
    console.log('Skipping tutorial');
    completeTutorial();
  };

  console.log('Current tutorial state:', { showTutorial, currentStep });

  return (
    <TutorialContext.Provider value={{
      showTutorial,
      currentStep,
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