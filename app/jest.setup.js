// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    Gesture: {
      Pan: () => ({
        activeOffsetX: () => ({
          onUpdate: () => ({
            onEnd: () => ({}),
          }),
        }),
      }),
    },
    GestureDetector: ({ children }) => children,
    GestureHandlerRootView: View,
  };
});

// Mock expo-speech-recognition native module
jest.mock('expo-speech-recognition', () => ({
  ExpoSpeechRecognitionModule: {
    supportsOnDeviceRecognition: jest.fn(() => true),
    requestPermissionsAsync: jest.fn(() =>
      Promise.resolve({ status: 'granted', granted: true, canAskAgain: true, expires: 'never' })
    ),
    start: jest.fn(),
    stop: jest.fn(),
    abort: jest.fn(),
    getSupportedLocales: jest.fn(() =>
      Promise.resolve({ locales: ['en-US', 'en-GB'], installedLocales: ['en-US'] })
    ),
  },
  useSpeechRecognitionEvent: jest.fn(),
  AudioEncodingAndroid: {
    ENCODING_PCM_16BIT: 2,
  },
}));

// Mock expo-speech
jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  isSpeakingAsync: jest.fn(() => Promise.resolve(false)),
  getAvailableVoicesAsync: jest.fn(() => Promise.resolve([])),
  maxSpeechInputLength: 4096,
}));

// Mock expo-image
jest.mock('expo-image', () => {
  const { View } = require('react-native');
  return {
    Image: View,
  };
});

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted', granted: true })
  ),
  launchImageLibraryAsync: jest.fn(() =>
    Promise.resolve({ canceled: false, assets: [{ uri: 'file:///test/photo.jpg' }] })
  ),
  MediaTypeOptions: { Images: 'Images' },
}));

// Mock @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn((callback) => {
    // Immediately call with "online" state
    callback({ isConnected: true, isInternetReachable: true, type: 'wifi' });
    return jest.fn(); // unsubscribe
  }),
  fetch: jest.fn(() =>
    Promise.resolve({ isConnected: true, isInternetReachable: true, type: 'wifi' })
  ),
}));

// Mock react-native-mmkv — simulates an in-memory MMKV store
const createMockMMKV = () => {
  const store = new Map();
  return {
    getString: jest.fn((key) => store.get(key)),
    getNumber: jest.fn((key) => store.get(key)),
    getBoolean: jest.fn((key) => store.get(key)),
    set: jest.fn((key, value) => store.set(key, value)),
    delete: jest.fn((key) => store.delete(key)),
    contains: jest.fn((key) => store.has(key)),
    getAllKeys: jest.fn(() => Array.from(store.keys())),
    clearAll: jest.fn(() => store.clear()),
  };
};

jest.mock('react-native-mmkv', () => {
  return {
    MMKV: jest.fn().mockImplementation(() => createMockMMKV()),
  };
});
