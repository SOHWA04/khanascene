import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

process.env.EXPO_PUBLIC_DATA_MODE = 'mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));
