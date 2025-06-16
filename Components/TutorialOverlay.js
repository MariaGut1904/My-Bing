import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

export default function TutorialOverlay({ image, text, onNext, onSkip }) {
  return (
    <View style={styles.overlay}>
      <Image source={image} style={styles.maria} />
      <View style={styles.dialog}>
        <Text style={styles.text}>{text}</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={onSkip} style={styles.skipBtn}>
            <Text style={styles.btnText}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onNext} style={styles.nextBtn}>
            <Text style={styles.btnText}>Next ➜</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
    zIndex: 100,
  },
  maria: {
    width: 90,
    height: 90,
    marginRight: 8,
    resizeMode: 'contain',
  },
  dialog: {
    backgroundColor: '#ffffffdd',
    borderRadius: 12,
    padding: 10,
    maxWidth: 260,
    borderWidth: 2,
    borderColor: '#d1b3ff',
  },
  text: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#a259c6',
    marginBottom: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  skipBtn: {
    backgroundColor: '#f8e1f4',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#d291bc',
  },
  nextBtn: {
    backgroundColor: '#f8e1f4',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#d291bc',
  },
  btnText: {
    fontFamily: 'PressStart2P',
    fontSize: 7,
    color: '#d291bc',
  },
});
