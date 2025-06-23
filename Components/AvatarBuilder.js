import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import * as Animatable from 'react-native-animatable';

const AvatarBuilder = () => {
  const [upperHair, setUpperHair] = useState('none');
  const [lowerHair, setLowerHair] = useState('none');
  const [outfit, setOutfit] = useState('none');
  const [accessory, setAccessory] = useState('none');

  // Upper hair options
  const upperHairOptions = [
    { id: 'none', name: 'None', icon: null },
    { id: 'upper1', name: 'Style 1', icon: require('../assets/hair-upper1.png') },
    { id: 'upper2', name: 'Style 2', icon: require('../assets/hair-upper2.png') },
    { id: 'upper3', name: 'Style 3', icon: require('../assets/hair-upper3.png') },
  ];

  // Lower hair options
  const lowerHairOptions = [
    { id: 'none', name: 'None', icon: null },
    { id: 'lower1', name: 'Style 1', icon: require('../assets/hair-lower1.png') },
    { id: 'lower2', name: 'Style 2', icon: require('../assets/hair-lower2.png') },
    { id: 'lower3', name: 'Style 3', icon: require('../assets/hair-lower3.png') },
    { id: 'lower4', name: 'Style 4', icon: require('../assets/hair-lower4.png') },
    { id: 'lower5', name: 'Style 5', icon: require('../assets/hair-lower5.png') },
    { id: 'lower6', name: 'Style 6', icon: require('../assets/hair-lower6.png') },
  ];

  // Outfit options
  const outfitOptions = [
    { id: 'none', name: 'None', icon: null },
    { id: 'default', name: 'Default', icon: require('../assets/cat-face.gif') },
    { id: 'dress', name: 'Dress', icon: require('../assets/rainbow.gif') },
  ];

  // Accessory options
  const accessoryOptions = [
    { id: 'none', name: 'None', icon: null },
    { id: 'glasses', name: 'Glasses', icon: require('../assets/kawaii-star.gif') },
  ];

  return (
    <ImageBackground source={require('../assets/pixel-bg.png')} style={styles.bg} resizeMode="cover">
      <ScrollView contentContainerStyle={styles.container}>
        <Animatable.View animation="bounceIn" style={styles.header}>
          <Image source={require('../assets/kawaii-star.gif')} style={styles.starIcon} />
          <Text style={styles.title}>✨ Avatar Builder ✨</Text>
        </Animatable.View>

        {/* Avatar Preview */}
        <Animatable.View animation="pulse" iterationCount="infinite" style={styles.avatarContainer}>
          <View style={styles.avatarBase}>
            <Image source={require('../assets/avatar-base.png')} style={styles.baseImage} />
            {upperHair !== 'none' && (
              <Image 
                source={upperHairOptions.find(h => h.id === upperHair)?.icon} 
                style={styles.upperHairImage}
              />
            )}
            {lowerHair !== 'none' && (
              <Image 
                source={lowerHairOptions.find(h => h.id === lowerHair)?.icon} 
                style={styles.lowerHairImage}
              />
            )}
            {outfit !== 'none' && (
              <Image 
                source={outfitOptions.find(o => o.id === outfit)?.icon} 
                style={styles.outfitImage}
              />
            )}
            {accessory !== 'none' && (
              <Image 
                source={accessoryOptions.find(a => a.id === accessory)?.icon} 
                style={styles.accessoryImage}
              />
            )}
          </View>
        </Animatable.View>

        {/* Upper Hair Options */}
        <Animatable.View animation="fadeInUp" style={styles.section}>
          <Text style={styles.sectionTitle}>Upper Hair</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsRow}>
            {upperHairOptions.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                onPress={() => setUpperHair(item.id)}
                style={styles.optionButton}
              >
                {item.icon ? (
                  <Image source={item.icon} style={[
                    styles.optionImage,
                    upperHair === item.id && styles.selectedOption
                  ]} />
                ) : (
                  <View style={styles.emptyOption}>
                    <Text style={styles.optionText}>None</Text>
                  </View>
                )}
                <Text style={styles.optionText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animatable.View>

        {/* Lower Hair Options */}
        <Animatable.View animation="fadeInUp" delay={300} style={styles.section}>
          <Text style={styles.sectionTitle}>Lower Hair</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsRow}>
            {lowerHairOptions.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                onPress={() => setLowerHair(item.id)}
                style={styles.optionButton}
              >
                {item.icon ? (
                  <Image source={item.icon} style={[
                    styles.optionImage,
                    lowerHair === item.id && styles.selectedOption
                  ]} />
                ) : (
                  <View style={styles.emptyOption}>
                    <Text style={styles.optionText}>None</Text>
                  </View>
                )}
                <Text style={styles.optionText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animatable.View>

        {/* Outfit Options */}
        <Animatable.View animation="fadeInUp" delay={400} style={styles.section}>
          <Text style={styles.sectionTitle}>Outfits</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsRow}>
            {outfitOptions.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                onPress={() => setOutfit(item.id)}
                style={styles.optionButton}
              >
                <Image source={item.icon} style={[
                  styles.optionImage,
                  outfit === item.id && styles.selectedOption
                ]} />
                <Text style={styles.optionText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animatable.View>

        {/* Accessory Options */}
        <Animatable.View animation="fadeInUp" delay={600} style={styles.section}>
          <Text style={styles.sectionTitle}>Accessories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsRow}>
            {accessoryOptions.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                onPress={() => setAccessory(item.id)}
                style={styles.optionButton}
              >
                {item.icon ? (
                  <Image source={item.icon} style={[
                    styles.optionImage,
                    accessory === item.id && styles.selectedOption
                  ]} />
                ) : (
                  <View style={styles.emptyOption}>
                    <Text style={styles.optionText}>None</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animatable.View>

        <Animatable.View animation="pulse" iterationCount={1} style={styles.saveButtonContainer}>
          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save Avatar</Text>
          </TouchableOpacity>
        </Animatable.View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
    paddingTop: 30,
  },
  starIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  title: {
    fontFamily: 'PressStart2P',
    fontSize: 22,
    color: '#a259c6',
    textShadowColor: 'rgba(255,255,255,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarBase: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  baseImage: {
    width: 150,
    height: 150,
    position: 'absolute',
    zIndex: 1,
  },
  upperHairImage: {
    width: 150,
    height: 150,
    position: 'absolute',
    zIndex: 3,
  },
  lowerHairImage: {
    width: 150,
    height: 150,
    position: 'absolute',
    zIndex: 0,
  },
  outfitImage: {
    width: 150,
    height: 150,
    position: 'absolute',
    zIndex: 4,
  },
  accessoryImage: {
    width: 150,
    height: 150,
    position: 'absolute',
    zIndex: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'PressStart2P',
    fontSize: 14,
    color: '#a259c6',
    marginBottom: 10,
    textAlign: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  optionButton: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  optionImage: {
    width: 80,
    height: 80,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 10,
  },
  selectedOption: {
    borderColor: '#a259c6',
    shadowColor: '#a259c6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
  },
  emptyOption: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0d0ff',
    borderRadius: 10,
  },
  optionText: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#a259c6',
    marginTop: 5,
  },
  saveButtonContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#a259c6',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: '#6e3abf',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  saveButtonText: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
  },
});

export default AvatarBuilder;
