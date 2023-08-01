import AsyncStorage from '@react-native-async-storage/async-storage';

export const getItem = async key => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value;
  } catch (error) {
    throw error;
  }
};

export const setItem = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
    return true;
  } catch (error) {
    throw error;
  }
};
