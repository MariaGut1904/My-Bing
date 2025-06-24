import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useTutorial } from './TutorialContext';
import { useNavigation } from '@react-navigation/native';

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
  const { showTutorial, currentStep, currentTab, nextStep, skipTutorial, completeTutorial } = useTutorial();
  const navigation = useNavigation();

  if (!showTutorial) {
    console.log('Tutorial not showing because showTutorial is false');
    return null;
  }

  console.log('Rendering tutorial overlay, current step:', currentStep, 'current tab:', currentTab);
  const currentTutorialStep = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;
  const isIntroduction = currentTutorialStep.isIntroduction;

  // Manual navigation effect for tab switching
  React.useEffect(() => {
    if (showTutorial && currentStep >= 2 && currentTab) {
      console.log(`TutorialOverlay: Manually navigating to ${currentTab}`);
      setTimeout(() => {
        try {
          navigation.navigate(currentTab);
          console.log(`TutorialOverlay: Successfully navigated to ${currentTab}`);
        } catch (error) {
          console.log(`TutorialOverlay: Navigation failed:`, error);
        }
      }, 100);
    }
  }, [currentStep, currentTab, showTutorial, navigation]);

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
      {/* Tab indicator */}
      {!isIntroduction && (
        <View style={styles.tabIndicator}>
          <Text style={styles.tabIndicatorText}>
            Current Tab: {currentTab} (Step {currentStep + 1}/5)
          </Text>
        </View>
      )}
      
      <View style={styles.bottomCornerContainer}>
        <View style={styles.speechBubble}>
          <Text style={styles.sparkleLeft}>✨</Text>
          <Text style={styles.speechBubbleText}>{currentTutorialStep.text}</Text>
          <Text style={styles.sparkleRight}>✨</Text>
          <View style={styles.speechBubbleArrow} />
        </View>
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
    fontSize: 8,
    textAlign: 'center',
    color: '#a259c6',
    lineHeight: 16,
  },
  // Bottom corner layout styles (for tab explanations)
  speechBubbleContainer: {
    position: 'absolute',
    top: height * 0.12,
    left: 15,
    right: 15,
    zIndex: 10000,
  },
  speechBubble: {
    backgroundColor: '#ffeef8',
    borderRadius: 12,
    padding: 15,
    borderWidth: 4,
    borderColor: '#ffb6c1',
    position: 'relative',
    shadowColor: '#ffb6c1',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 8,
    maxWidth: width * 0.7,
    marginRight: 10,
    // More rounded corners
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  speechBubbleText: {
    fontFamily: 'PressStart2P',
    fontSize: 6,
    textAlign: 'left',
    color: '#a259c6',
    lineHeight: 10,
    textShadowColor: '#ffb6c1',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
    paddingHorizontal: 10,
  },
  speechBubbleArrow: {
    position: 'absolute',
    right: -15,
    bottom: 30,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 15,
    borderBottomWidth: 15,
    borderLeftWidth: 18,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#ffb6c1',
    // Add a small shadow to the arrow
    shadowColor: '#ffb6c1',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
  },
  bottomCornerContainer: {
    position: 'absolute',
    bottom: height * 0.12,
    right: 20,
    zIndex: 10000,
    flexDirection: 'row',
    alignItems: 'flex-end',
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
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    padding: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    backgroundColor: '#ffeef8',
    borderWidth: 2,
    borderColor: '#ffb6c1',
  },
  primaryButton: {
    backgroundColor: '#ffb6c1',
  },
  buttonText: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#a259c6',
  },
  primaryButtonText: {
    color: '#fff',
  },
  tabIndicator: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    zIndex: 10001,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    padding: 5,
  },
  tabIndicatorText: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#fff',
    textAlign: 'center',
  },
  sparkleLeft: {
    position: 'absolute',
    top: 5,
    left: 5,
    fontSize: 16,
    color: '#ffb6c1',
    zIndex: 1,
  },
  sparkleRight: {
    position: 'absolute',
    top: 5,
    right: 5,
    fontSize: 16,
    color: '#ffb6c1',
    zIndex: 1,
  },
});
