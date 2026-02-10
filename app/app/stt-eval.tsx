/**
 * STT Evaluation Screen (Dev-Only)
 *
 * Story 1.1: STT Provider Evaluation Spike
 * Temporary test screen for comparing on-device STT vs Whisper API.
 * Gated behind __DEV__ — not visible in production builds.
 */

import { useState, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import { Text, Button, Card, Divider, ActivityIndicator } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { useRouter } from 'expo-router';

import {
  measureLatency,
  calculateWordAccuracy,
  type STTResult,
} from '../src/services/stt-evaluation';

// Whisper API key — dev-only, never committed. Set via .env or paste here for spike.
const WHISPER_API_KEY = process.env.EXPO_PUBLIC_WHISPER_API_KEY || '';

type RecordingState = 'idle' | 'recording' | 'transcribing-ondevice' | 'transcribing-whisper' | 'done';

export default function STTEvalScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [state, setState] = useState<RecordingState>('idle');
  const [onDeviceResult, setOnDeviceResult] = useState<STTResult | null>(null);
  const [whisperResult, setWhisperResult] = useState<STTResult | null>(null);
  const [groundTruth, setGroundTruth] = useState('');
  const [audioFileUri, setAudioFileUri] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [onDeviceSupported, setOnDeviceSupported] = useState<boolean | null>(null);

  // Track on-device transcription timing
  const onDeviceStartTime = useRef<number>(0);
  const onDeviceTranscript = useRef<string>('');

  // Check on-device support on mount
  useState(() => {
    const supported = ExpoSpeechRecognitionModule.supportsOnDeviceRecognition();
    setOnDeviceSupported(supported);
  });

  // Handle speech recognition results
  useSpeechRecognitionEvent('result', (event) => {
    if (event.isFinal) {
      const transcript = event.results[0]?.transcript || '';
      const latencyMs = Date.now() - onDeviceStartTime.current;
      onDeviceTranscript.current = transcript;

      setOnDeviceResult({
        provider: 'on-device',
        transcript,
        latencyMs,
        success: true,
      });

      // If we have a saved audio file, proceed to Whisper
      if (audioFileUri && WHISPER_API_KEY) {
        setState('transcribing-whisper');
        transcribeWithWhisper(audioFileUri);
      } else {
        setState('done');
      }
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    setOnDeviceResult({
      provider: 'on-device',
      transcript: '',
      latencyMs: Date.now() - onDeviceStartTime.current,
      success: false,
      error: event.error,
    });

    // Still try Whisper if we have the audio
    if (audioFileUri && WHISPER_API_KEY) {
      setState('transcribing-whisper');
      transcribeWithWhisper(audioFileUri);
    } else {
      setState('done');
    }
  });

  useSpeechRecognitionEvent('audioend', (event) => {
    if (event.uri) {
      setAudioFileUri(event.uri);
    }
  });

  const requestPermissions = useCallback(async () => {
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    setPermissionGranted(result.granted);
    if (!result.granted) {
      Alert.alert('Permission Denied', 'Microphone and speech recognition permissions are required.');
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (!permissionGranted) {
      await requestPermissions();
      return;
    }

    // Reset state
    setOnDeviceResult(null);
    setWhisperResult(null);
    setAudioFileUri(null);
    onDeviceTranscript.current = '';

    setState('recording');
    onDeviceStartTime.current = Date.now();

    ExpoSpeechRecognitionModule.start({
      lang: 'en-US',
      interimResults: false,
      requiresOnDeviceRecognition: true,
      addsPunctuation: true,
      recordingOptions: {
        persist: true,
        outputFileName: `stt-eval-${Date.now()}.wav`,
        outputSampleRate: 16000,
        outputEncoding: 'pcmFormatInt16',
      },
    });
  }, [permissionGranted, requestPermissions]);

  const stopRecording = useCallback(() => {
    setState('transcribing-ondevice');
    ExpoSpeechRecognitionModule.stop();
  }, []);

  const transcribeWithWhisper = useCallback(async (uri: string) => {
    try {
      const { result, latencyMs } = await measureLatency(async () => {
        const formData = new FormData();
        formData.append('file', {
          uri,
          type: 'audio/wav',
          name: 'recording.wav',
        } as any);
        formData.append('model', 'whisper-1');
        formData.append('language', 'en');

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${WHISPER_API_KEY}` },
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Whisper API error ${response.status}: ${errorText}`);
        }

        return await response.json();
      });

      setWhisperResult({
        provider: 'whisper-api',
        transcript: result.text || '',
        latencyMs,
        success: true,
      });
    } catch (error: any) {
      setWhisperResult({
        provider: 'whisper-api',
        transcript: '',
        latencyMs: 0,
        success: false,
        error: error.message,
      });
    } finally {
      setState('done');
    }
  }, []);

  const reset = useCallback(() => {
    setState('idle');
    setOnDeviceResult(null);
    setWhisperResult(null);
    setAudioFileUri(null);
    setGroundTruth('');
    onDeviceTranscript.current = '';
  }, []);

  // Guard: dev-only screen
  if (!__DEV__) {
    return (
      <View style={styles.container}>
        <Text>This screen is only available in development mode.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
    >
      <Text variant="headlineSmall" style={styles.title}>
        STT Provider Evaluation
      </Text>
      <Text variant="bodySmall" style={styles.subtitle}>
        Story 1.1 — Compare on-device vs Whisper API
      </Text>

      <Button mode="text" onPress={() => router.back()} style={styles.backButton}>
        ← Back
      </Button>

      <Divider style={styles.divider} />

      {/* Status Info */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleSmall">Device Info</Text>
          <Text variant="bodySmall">Platform: {Platform.OS} {Platform.Version}</Text>
          <Text variant="bodySmall">
            On-device STT: {onDeviceSupported === null ? 'Checking...' : onDeviceSupported ? 'Supported' : 'Not supported'}
          </Text>
          <Text variant="bodySmall">
            Whisper API Key: {WHISPER_API_KEY ? 'Configured' : 'Not set (set EXPO_PUBLIC_WHISPER_API_KEY)'}
          </Text>
          <Text variant="bodySmall">Permissions: {permissionGranted ? 'Granted' : 'Not yet requested'}</Text>
        </Card.Content>
      </Card>

      {/* Ground Truth Input */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleSmall">Ground Truth (what you'll say)</Text>
          <TextInput
            style={styles.input}
            placeholder="Type what you plan to say..."
            value={groundTruth}
            onChangeText={setGroundTruth}
            multiline
          />
        </Card.Content>
      </Card>

      {/* Controls */}
      <View style={styles.controls}>
        {!permissionGranted && (
          <Button mode="contained" onPress={requestPermissions}>
            Grant Permissions
          </Button>
        )}

        {permissionGranted && state === 'idle' && (
          <Button mode="contained" onPress={startRecording} buttonColor="#6B5B7A">
            Hold to Record (tap Start, then Stop)
          </Button>
        )}

        {state === 'recording' && (
          <Button mode="contained" onPress={stopRecording} buttonColor="#C44040">
            ● Stop Recording
          </Button>
        )}

        {(state === 'transcribing-ondevice' || state === 'transcribing-whisper') && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" />
            <Text style={styles.loadingText}>
              {state === 'transcribing-ondevice' ? 'On-device transcribing...' : 'Whisper API transcribing...'}
            </Text>
          </View>
        )}

        {state === 'done' && (
          <Button mode="outlined" onPress={reset}>
            Reset & Try Another
          </Button>
        )}
      </View>

      {/* Results */}
      {onDeviceResult && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleSmall">On-Device Result</Text>
            <Text variant="bodySmall">
              Status: {onDeviceResult.success ? '✅ Success' : `❌ ${onDeviceResult.error}`}
            </Text>
            {onDeviceResult.success && (
              <>
                <Text variant="bodySmall">Transcript: "{onDeviceResult.transcript}"</Text>
                <Text variant="bodySmall">Latency: {onDeviceResult.latencyMs}ms</Text>
                {groundTruth && (
                  <Text variant="bodySmall">
                    Accuracy: {calculateWordAccuracy(onDeviceResult.transcript, groundTruth)}%
                  </Text>
                )}
              </>
            )}
          </Card.Content>
        </Card>
      )}

      {whisperResult && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleSmall">Whisper API Result</Text>
            <Text variant="bodySmall">
              Status: {whisperResult.success ? '✅ Success' : `❌ ${whisperResult.error}`}
            </Text>
            {whisperResult.success && (
              <>
                <Text variant="bodySmall">Transcript: "{whisperResult.transcript}"</Text>
                <Text variant="bodySmall">Latency: {whisperResult.latencyMs}ms</Text>
                {groundTruth && (
                  <Text variant="bodySmall">
                    Accuracy: {calculateWordAccuracy(whisperResult.transcript, groundTruth)}%
                  </Text>
                )}
              </>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Side-by-Side Comparison */}
      {onDeviceResult && whisperResult && groundTruth && (
        <Card style={[styles.card, styles.comparisonCard]}>
          <Card.Content>
            <Text variant="titleSmall">Comparison</Text>
            <View style={styles.comparisonRow}>
              <View style={styles.comparisonCol}>
                <Text variant="labelSmall">On-Device</Text>
                <Text variant="bodySmall">
                  {onDeviceResult.success ? `${onDeviceResult.latencyMs}ms` : 'Failed'}
                </Text>
                <Text variant="bodySmall">
                  {onDeviceResult.success
                    ? `${calculateWordAccuracy(onDeviceResult.transcript, groundTruth)}%`
                    : '—'}
                </Text>
              </View>
              <View style={styles.comparisonCol}>
                <Text variant="labelSmall">Whisper</Text>
                <Text variant="bodySmall">
                  {whisperResult.success ? `${whisperResult.latencyMs}ms` : 'Failed'}
                </Text>
                <Text variant="bodySmall">
                  {whisperResult.success
                    ? `${calculateWordAccuracy(whisperResult.transcript, groundTruth)}%`
                    : '—'}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  content: {
    padding: 16,
  },
  title: {
    fontWeight: '600',
    color: '#3D3A38',
  },
  subtitle: {
    color: '#3D3A38',
    opacity: 0.6,
    marginBottom: 8,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  divider: {
    marginVertical: 12,
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  comparisonCard: {
    backgroundColor: '#F0EDF3',
  },
  controls: {
    marginVertical: 16,
    alignItems: 'center',
    gap: 12,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#3D3A38',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  comparisonRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 16,
  },
  comparisonCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
});
