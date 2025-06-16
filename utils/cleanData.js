import AsyncStorage from '@react-native-async-storage/async-storage';

export const nuclearDataCleanup = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    await AsyncStorage.multiRemove(keys);
    console.log('All app data cleared successfully');
  } catch (error) {
    console.error('Failed to clear data:', error);
  }
};
