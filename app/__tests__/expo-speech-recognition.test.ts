import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';

describe('expo-speech-recognition module', () => {
  it('is importable and provides ExpoSpeechRecognitionModule', () => {
    expect(ExpoSpeechRecognitionModule).toBeDefined();
  });

  it('supportsOnDeviceRecognition() returns a boolean', () => {
    const result = ExpoSpeechRecognitionModule.supportsOnDeviceRecognition();
    expect(typeof result).toBe('boolean');
  });

  it('requestPermissionsAsync() returns a permission result', async () => {
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    expect(result).toHaveProperty('status');
    expect(result).toHaveProperty('granted');
    expect(typeof result.granted).toBe('boolean');
  });

  it('start() is callable with options', () => {
    expect(() => {
      ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
        requiresOnDeviceRecognition: true,
      });
    }).not.toThrow();
  });

  it('getSupportedLocales() returns locale data', async () => {
    const result = await ExpoSpeechRecognitionModule.getSupportedLocales();
    expect(result).toHaveProperty('locales');
    expect(Array.isArray(result.locales)).toBe(true);
  });
});
