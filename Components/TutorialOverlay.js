import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useTutorial } from './TutorialContext';

const { width, height } = Dimensions.get('window');

const tutorialSteps = [
  {
    image: require('../assets/Maria.png'),
    text: 'Hi there! I\'m Maria, and I\'m so excited to help you get started with your semester at Binghamton University! Let\'s make this the best semester ever! 🌟',
  },
  {
    image: require('../assets/Mar_hap.png'),
    text: 'Welcome to your home screen! Here you\'ll see your daily tasks and schedule. I\'ll help you stay organized and make the most of your time at BU! 🎓',
  },
  {
    image: require('../assets/Mar_speak.png'),
    text: 'The Tasks tab is where you\'ll manage all your assignments and projects. Let\'s keep track of everything together and make sure nothing falls through the cracks! 📚',
  },
  {
    image: require('../assets/Mar_hap.png'),
    text: 'Planning your day is super important! In the Schedule tab, you can set up your classes, study sessions, and even fun activities around campus. Go Bearcats! 🐻',
  },
  {
    image: require('../assets/Mar_speak.png'),
    text: 'College life means managing your budget! The Budget tab helps you track expenses for textbooks, food, and fun activities. Let\'s make smart financial choices together! 💰',
  },
  {
    image: require('../assets/Maria.png'),
    text: 'Last but not least, visit the Profile tab to customize your avatar and settings. Make it uniquely you! I\'m so excited to be your guide this semester! Let\'s make it amazing! ✨',
  },
];

export const TutorialOverlay = () => {
  const { showTutorial, currentStep, nextStep, skipTutorial, completeTutorial } = useTutorial();

  if (!showTutorial) {
    console.log('Tutorial not showing because showTutorial is false');
    return null;
  }

  console.log('Rendering tutorial overlay, current step:', currentStep);
  const currentTutorialStep = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      completeTutorial();
    } else {
      nextStep();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image
          source={currentTutorialStep.image}
          style={styles.mariaImage}
          resizeMode="contain"
        />
        <View style={styles.textContainer}>
          <Text style={styles.text}>{currentTutorialStep.text}</Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={skipTutorial}>
            <Text style={styles.buttonText}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleNext}>
            <Text style={[styles.buttonText, styles.primaryButtonText]}>
              {isLastStep ? 'Let\'s Go!' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  content: {
    width: width * 0.9,
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  mariaImage: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  textContainer: {
    backgroundColor: '#f8e1f4',
    borderRadius: 15,
    padding: 15,
    borderWidth: 2,
    borderColor: '#d291bc',
    marginBottom: 20,
  },
  text: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    textAlign: 'center',
    color: '#a259c6',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    padding: 15,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
    backgroundColor: '#f8e1f4',
    borderWidth: 2,
    borderColor: '#d291bc',
  },
  primaryButton: {
    backgroundColor: '#d291bc',
  },
  buttonText: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    color: '#a259c6',
  },
  primaryButtonText: {
    color: '#fff',
  },
});
