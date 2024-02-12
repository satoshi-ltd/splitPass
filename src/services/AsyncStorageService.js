import AsyncStorage from '@react-native-async-storage/async-storage';

export const AsyncStorageService = {
  get: async (key) => {
    let value;
    try {
      value = await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error getting data from AsyncStorage:', error);
    }

    return value ? JSON.parse(value) : undefined;
  },

  set: async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving data to AsyncStorage:', error);
    }

    return await AsyncStorageService.get(key);
  },

  remove: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data to AsyncStorage:', error);
    }

    return await AsyncStorageService.get(key);
  },

  wipe: async () => {},
};
