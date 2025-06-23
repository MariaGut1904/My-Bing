import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useTutorial } from './TutorialContext';

const { width, height } = Dimensions.get('window');

const tutorialSteps = [
  {
    image: require('../assets/Maria.png'),
    text: 'Hi there! I\'m Maria, and I\'m so excited to help you get started with your semester at Binghamton University! Let\'s make this the best semester ever! 🌟',
    isIntroduction: true,
  },
  {
    image: require('../assets/Mar_hap.png'),
    text: 'Welcome to your home screen! Here you\'ll see your daily tasks and schedule. You can add and manage tasks right here, and I\'ll help you stay organized! 🎓',
    isIntroduction: false,
  },
  {
    image: require('../assets/Mar_hap.png'),
    text: 'Planning your day is super important! In the Schedule tab, you can set up your classes, study sessions, and even fun activities around campus. Go Bearcats! 🐻',
    isIntroduction: false,
  },
  {
    image: require('../assets/Mar_speak.png'),
    text: 'College life means managing your budget! The Budget tab helps you track expenses for textbooks, food, and fun activities. Let\'s make smart financial choices together! 💰',
    isIntroduction: false,
  },
  {
    image: require('../assets/Maria.png'),
    text: 'Last but not least, visit the Avatar tab to customize your character and settings. Make it uniquely you! I\'m so excited to be your guide this semester! Let\'s make it amazing! ✨',
    isIntroduction: false,
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
  const isIntroduction = currentTutorialStep.isIntroduction;

  const handleNext = () => {
    if (isLastStep) {
      completeTutorial();
    } else {
      nextStep();
    }
  };

  if (isIntroduction) {
    // Center layout for introduction
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Image
            source={currentTutorialStep.image}
            style={styles.centerMariaImage}
            resizeMode="contain"
          />
          <View style={styles.centerTextContainer}>
            <Text style={styles.centerText}>{currentTutorialStep.text}</Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={skipTutorial}>
              <Text style={styles.buttonText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleNext}>
              <Text style={[styles.buttonText, styles.primaryButtonText]}>
                Next
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Bottom corner layout with speech bubble for tab explanations
  return (
    <View style={styles.transparentContainer}>
      <View style={styles.speechBubbleContainer}>
        <View style={styles.speechBubble}>
          <Text style={styles.speechBubbleText}>{currentTutorialStep.text}</Text>
          <View style={styles.speechBubbleArrow} />
        </View>
      </View>
      
      <View style={styles.bottomCornerContainer}>
        <Image
          source={currentTutorialStep.image}
          style={styles.bottomCornerMariaImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.bottomButtonContainer}>
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
    zIndex: 9999,
  },
  transparentContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 9999,
  },
  // Center layout styles (for introduction)
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  centerMariaImage: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  centerTextContainer: {
    backgroundColor: '#f8e1f4',
    borderRadius: 15,
    padding: 15,
    borderWidth: 2,
    borderColor: '#d291bc',
    marginBottom: 20,
    maxWidth: width * 0.8,
  },
  centerText: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    textAlign: 'center',
    color: '#a259c6',
    lineHeight: 20,
  },
  // Bottom corner layout styles (for tab explanations)
  speechBubbleContainer: {
    position: 'absolute',
    top: height * 0.15,
    left: 20,
    right: 20,
    zIndex: 10000,
  },
  speechBubble: {
    backgroundColor: '#f8e1f4',
    borderRadius: 20,
    padding: 20,
    borderWidth: 3,
    borderColor: '#d291bc',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  speechBubbleText: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    textAlign: 'center',
    color: '#a259c6',
    lineHeight: 20,
  },
  speechBubbleArrow: {
    position: 'absolute',
    bottom: -15,
    right: 50,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderTopWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#d291bc',
  },
  bottomCornerContainer: {
    position: 'absolute',
    bottom: height * 0.15,
    right: 20,
    zIndex: 10000,
  },
  bottomCornerMariaImage: {
    width: 100,
    height: 100,
  },
  // Button styles
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 300,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
