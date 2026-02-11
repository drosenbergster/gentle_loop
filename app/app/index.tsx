/**
 * Anchor Screen
 *
 * The emotional heart of gentle_loop.
 * Full flow: Anchor image + affirmation → hold mic → recording overlay →
 * processing overlay → suggestion card with actions.
 *
 * Story 1.8: AI Service Client & Suggestion Card (Phase A + B)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { Image } from 'expo-image';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  withSequence,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';

import {
  BreathingOverlay,
  MicButton,
  RecordingOverlay,
  ProcessingOverlay,
} from '../src/components/anchor';
import { EncouragementBanner } from '../src/components/EncouragementBanner';
import { IdeasOverlay } from '../src/components/IdeasOverlay';
import { SuggestionCard } from '../src/components/SuggestionCard';
import { CrisisBanner } from '../src/components/CrisisBanner';
import { TextInputFallback } from '../src/components/TextInputFallback';
import {
  pickEncouragement,
  ENCOURAGEMENT_THRESHOLD,
} from '../src/data/encouragements';
import { inferCrisisContext, type CrisisContext } from '../src/data/crisisResources';
import { colors, spacing, fontFamilies } from '../src/theme';
import {
  useEnergyLevel,
  useSettingsStore,
  useToolboxStore,
  useConversationStore,
} from '../src/stores';
import {
  useAccessibility,
  useResponsiveSize,
  useNetworkStatus,
  useTTS,
  useVoiceRecording,
  MESSAGE_AUTO_DISMISS_MS,
} from '../src/hooks';
import { getRandomAffirmation } from '../src/data';
import { getDeviceId } from '../src/utils';
import {
  getAISuggestion,
  AIServiceError,
  type AISuggestion,
} from '../src/services/aiClient';
import type { ResponseType, RequestType } from '../src/types/ai';

// Default images (bundled with app)
const defaultImages: Record<string, any> = {
  'default-mountains': require('../assets/images/mountains.jpg'),
  'default-water': require('../assets/images/water.jpg'),
  'default-sunset': require('../assets/images/sunset.jpg'),
};

const AFFIRMATION_INTERVAL_MS = 60_000;
const OFFLINE_TOAST_DURATION_MS = 1500;

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  return name ? `Good ${timeOfDay}, ${name}` : `Good ${timeOfDay}`;
}

const createShadow = (
  offsetY: number,
  radius: number,
  opacity: number,
): any => {
  if (Platform.OS === 'web') {
    return {
      boxShadow: `0px ${offsetY}px ${radius}px rgba(0, 0, 0, ${opacity})`,
    };
  }
  return {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation: Math.round(offsetY / 2),
  };
};

export default function AnchorScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const energyLevel = useEnergyLevel();
  const anchorImage = useSettingsStore((s) => s.anchorImage);
  const userName = useSettingsStore((s) => s.userName);
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);
  const hasCompletedOnboarding = useSettingsStore(
    (s) => s.hasCompletedOnboarding,
  );

  const { scale, textColor } = useAccessibility();
  const { imageSize, micSize, micIconSize } = useResponsiveSize();
  const { isOnline } = useNetworkStatus();

  // Stores
  const toolboxEntries = useToolboxStore((s) => s.entries);
  const addToolboxEntry = useToolboxStore((s) => s.addEntry);
  const conversation = useConversationStore();

  // TTS (Story 1.9)
  const tts = useTTS();

  // UI state
  const [affirmation, setAffirmation] = useState(
    () => getRandomAffirmation(energyLevel).text,
  );
  const [showOfflineToast, setShowOfflineToast] = useState(false);
  const [showIdeas, setShowIdeas] = useState(false);
  const [toastText, setToastText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] =
    useState<AISuggestion | null>(null);
  const [showCard, setShowCard] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);

  // Crisis detection state
  const [showCrisisBanner, setShowCrisisBanner] = useState(false);
  const [crisisContext, setCrisisContext] = useState<CrisisContext | null>(null);
  const [crisisAIMessage, setCrisisAIMessage] = useState<string | null>(null);

  // Story 5.1: "Still With You" encouragement
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [encouragementMsg, setEncouragementMsg] = useState('');
  const lastEncouragementRef = useRef<string | null>(null);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Core AI flow: transcript → API → card ---
  const sendToAI = useCallback(
    async (message: string, requestType: RequestType) => {
      setIsProcessing(true);
      setShowCard(false);

      // --- Client-side crisis pre-screening ---
      // Check for crisis keywords BEFORE sending to AI. If detected,
      // show crisis resources immediately while waiting for the AI response.
      const detectedCrisis = requestType !== 'another'
        ? inferCrisisContext(message)
        : null;

      if (detectedCrisis) {
        setCrisisContext(detectedCrisis);
        setCrisisAIMessage(null); // AI hasn't responded yet
        setShowCrisisBanner(true);
      }

      // Add caregiver turn to thread
      conversation.addCaregiverTurn(
        requestType === 'another'
          ? '[requested another suggestion]'
          : message,
      );

      try {
        const result = await getAISuggestion({
          energyLevel,
          requestType,
          caregiverMessage: message,
          toolboxEntries,
          conversationHistory: conversation.getHistoryString(),
          deviceId: getDeviceId(),
        });

        // Add assistant turn
        conversation.addAssistantTurn(result.text, result.responseType);

        setCurrentSuggestion(result);

        // --- Crisis response handling ---
        if (result.responseType === 'crisis') {
          // AI detected a crisis (may or may not match client-side pre-screening)
          if (!detectedCrisis) {
            // AI caught something pre-screening missed — use general context
            setCrisisContext('general_crisis');
          }
          setCrisisAIMessage(result.text);
          setShowCrisisBanner(true);
          setShowCard(false); // Don't show regular card for crisis

          // TTS: read crisis response aloud
          tts.speak(result.text);
        } else if (detectedCrisis) {
          // Pre-screening flagged it but AI didn't return crisis tag.
          // Update the banner with the AI message anyway — the resources are already showing.
          setCrisisAIMessage(result.text);

          // Also show the regular card underneath (user can dismiss banner)
          setShowCard(true);
          tts.speak(result.text);
        } else {
          // Normal (non-crisis) response flow
          // Story 5.1: Show encouragement banner if 2+ assistant turns without "That worked"
          const turnCount = conversation.getTurnCount();
          if (
            turnCount >= ENCOURAGEMENT_THRESHOLD &&
            result.responseType !== 'question' &&
            result.responseType !== 'out_of_ideas'
          ) {
            const msg = pickEncouragement(lastEncouragementRef.current);
            lastEncouragementRef.current = msg;
            setEncouragementMsg(msg);
            setShowEncouragement(true);
          }

          setShowCard(true);

          // TTS: read suggestion aloud (NFR4 — within 1s of card appearing)
          tts.speak(result.text);

          // Epic 3: If response_type is "pause" and energy is running_low,
          // start breathing timer after showing the card briefly
          if (
            result.responseType === 'pause' &&
            energyLevel === 'running_low' &&
            requestType !== 'timer_follow_up'
          ) {
            // Show the card with the pause suggestion, then start breathing
            setTimeout(() => {
              setShowBreathing(true);
            }, 2000); // Show card for 2s so they can read the suggestion
          }
        }
      } catch (err) {
        const errorMessage =
          err instanceof AIServiceError
            ? err.message
            : 'Something went wrong. Please try again.';

        setToastText(errorMessage);
        setShowOfflineToast(true);
        if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
        messageTimerRef.current = setTimeout(() => {
          setShowOfflineToast(false);
          setToastText('');
        }, MESSAGE_AUTO_DISMISS_MS);
      } finally {
        setIsProcessing(false);
      }
    },
    [energyLevel, toolboxEntries, conversation],
  );

  // --- Voice recording ---
  const handleTranscription = useCallback(
    (transcript: string) => {
      const requestType: RequestType = conversation.thread.isActive
        ? 'follow_up'
        : 'initial';
      sendToAI(transcript, requestType);
    },
    [sendToAI, conversation.thread.isActive],
  );

  const voice = useVoiceRecording(handleTranscription);

  // Redirect to onboarding
  if (!hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  // --- Affirmation rotation ---
  useEffect(() => {
    setAffirmation(getRandomAffirmation(energyLevel).text);
  }, [energyLevel]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAffirmation(getRandomAffirmation(energyLevel).text);
    }, AFFIRMATION_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [energyLevel]);

  // --- Voice messages → toasts ---
  useEffect(() => {
    if (voice.message) {
      let text = '';
      switch (voice.message.type) {
        case 'tap_tooltip':
          text = 'Hold the mic and talk \u2014 let go when you\u2019re done';
          break;
        case 'too_short':
          text = 'That was a short one \u2014 try holding a bit longer';
          break;
        case 'error':
          text = voice.message.message;
          break;
      }
      setToastText(text);
      setShowOfflineToast(true);
      if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
      messageTimerRef.current = setTimeout(() => {
        setShowOfflineToast(false);
        setToastText('');
        voice.clearMessage();
      }, MESSAGE_AUTO_DISMISS_MS);
    }
  }, [voice.message]);

  // --- Image pulse ---
  const pulseScale = useSharedValue(1);
  useEffect(() => {
    if (!reduceMotion) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
    } else {
      pulseScale.value = 1;
    }
  }, [reduceMotion, pulseScale]);
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const tintColor = colors.tints[energyLevel];
  const imageSource = anchorImage.startsWith('default-')
    ? defaultImages[anchorImage]
    : { uri: anchorImage };

  // --- Breathing timer handlers (Epic 3) ---
  const cancelBreathing = useCallback(() => {
    setShowBreathing(false);
  }, []);

  const handleBreathingExpired = useCallback(() => {
    setShowBreathing(false);
    setShowCard(false);
    sendToAI('[breathing timer completed — ready for a practical suggestion]', 'timer_follow_up');
  }, [sendToAI]);

  const handleBreathingSkip = useCallback(() => {
    setShowBreathing(false);
    setShowCard(false);
    sendToAI('[skipped breathing — ready for a practical suggestion]', 'timer_follow_up');
  }, [sendToAI]);

  // --- Mic handlers ---
  const handleMicPress = useCallback(() => {
    if (!isOnline) {
      setToastText("AI isn't available offline");
      setShowOfflineToast(true);
      toastTimerRef.current = setTimeout(() => {
        setShowOfflineToast(false);
        setToastText('');
        setShowIdeas(true);
      }, OFFLINE_TOAST_DURATION_MS);
    }
  }, [isOnline]);

  const handleMicPressIn = useCallback(() => {
    if (isOnline) {
      cancelBreathing();
      voice.onPressIn();
    }
  }, [isOnline, voice.onPressIn, cancelBreathing]);

  const handleMicPressOut = useCallback(() => {
    if (isOnline && voice.state !== 'idle') voice.onPressOut();
  }, [isOnline, voice.state, voice.onPressOut]);

  // --- Card action handlers ---
  const showToast = useCallback((text: string, durationMs = 2000) => {
    setToastText(text);
    setShowOfflineToast(true);
    if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    messageTimerRef.current = setTimeout(() => {
      setShowOfflineToast(false);
      setToastText('');
    }, durationMs);
  }, []);

  // --- Crisis banner dismiss ---
  const handleCrisisDismiss = useCallback(() => {
    setShowCrisisBanner(false);
    setCrisisContext(null);
    setCrisisAIMessage(null);
    // Don't clear the conversation — they may want to continue
  }, []);

  const handleThatWorked = useCallback(() => {
    tts.stop();
    if (currentSuggestion) {
      addToolboxEntry(currentSuggestion.text);
      showToast('Saved to your Toolbox');
    }
    setShowCard(false);
    setShowCrisisBanner(false);
    setCrisisContext(null);
    setCrisisAIMessage(null);
    setShowEncouragement(false);
    setCurrentSuggestion(null);
    lastEncouragementRef.current = null;
    conversation.clearThread();
  }, [currentSuggestion, addToolboxEntry, conversation, tts, showToast]);

  const handleDismiss = useCallback(() => {
    tts.stop();
    cancelBreathing();
    setShowCard(false);
    setShowCrisisBanner(false);
    setCrisisContext(null);
    setCrisisAIMessage(null);
    setShowEncouragement(false);
    setCurrentSuggestion(null);
    lastEncouragementRef.current = null;
    conversation.clearThread();
  }, [conversation, tts, cancelBreathing]);

  const handleAnother = useCallback(() => {
    tts.stop();
    cancelBreathing();
    if (conversation.isOutOfIdeas()) {
      showToast(
        toolboxEntries.length > 0
          ? "That's all I have for now. Your Toolbox might have something that fits."
          : "That's all I have for now. Sometimes the best thing is just being there.",
        MESSAGE_AUTO_DISMISS_MS,
      );
      return;
    }
    sendToAI('[requested another suggestion]', 'another');
  }, [conversation, toolboxEntries.length, sendToAI, tts, cancelBreathing]);

  // Card mic: follow-up recording
  const handleCardMicPressIn = useCallback(() => {
    if (isOnline) {
      cancelBreathing();
      voice.onPressIn();
    }
  }, [isOnline, voice.onPressIn, cancelBreathing]);

  const handleCardMicPressOut = useCallback(() => {
    if (isOnline && voice.state !== 'idle') voice.onPressOut();
  }, [isOnline, voice.state, voice.onPressOut]);

  // --- Text input fallback (Story 1.10) ---
  const handleOpenTextInput = useCallback(() => {
    if (!isOnline) {
      setToastText("AI isn't available offline");
      setShowOfflineToast(true);
      toastTimerRef.current = setTimeout(() => {
        setShowOfflineToast(false);
        setToastText('');
        setShowIdeas(true);
      }, OFFLINE_TOAST_DURATION_MS);
      return;
    }
    setShowTextInput(true);
  }, [isOnline]);

  const handleTextSubmit = useCallback(
    (text: string) => {
      setShowTextInput(false);
      const requestType: RequestType = conversation.thread.isActive
        ? 'follow_up'
        : 'initial';
      sendToAI(text, requestType);
    },
    [sendToAI, conversation.thread.isActive],
  );

  const handleTextDismiss = useCallback(() => {
    setShowTextInput(false);
  }, []);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    };
  }, []);

  const handleIdeasClose = useCallback(() => {
    setShowIdeas(false);
  }, []);

  const dismissToast = useCallback(() => {
    if (showOfflineToast && voice.message) {
      setShowOfflineToast(false);
      setToastText('');
      voice.clearMessage();
    }
  }, [showOfflineToast, voice.message]);

  const isRecording = voice.state === 'recording';

  return (
    <View style={styles.container}>
      <View style={[styles.background, { backgroundColor: tintColor }]} />

      {/* Recording overlay */}
      <RecordingOverlay
        visible={isRecording}
        duration={voice.recordingDuration}
        reduceMotion={reduceMotion}
      />

      {/* Processing overlay (FR8) */}
      <ProcessingOverlay visible={isProcessing} reduceMotion={reduceMotion} />

      {/* Breathing overlay (Epic 3) */}
      <BreathingOverlay
        visible={showBreathing}
        energyLevel={energyLevel}
        reduceMotion={reduceMotion}
        onTimerExpired={handleBreathingExpired}
        onSkip={handleBreathingSkip}
      />

      {/* Main Content */}
      <View
        style={[styles.content, { paddingTop: insets.top + spacing.md }]}
      >
        <Pressable
          style={styles.settingsButton}
          onPress={() => router.push('/settings')}
          accessibilityRole="button"
          accessibilityLabel="Open settings"
        >
          <Text style={styles.settingsIcon}>⚙</Text>
        </Pressable>

        <Animated.View style={[styles.imageWrapper, pulseStyle]}>
          <View
            style={[
              styles.imageContainer,
              { height: imageSize, width: imageSize },
            ]}
          >
            <Image
              source={imageSource}
              style={styles.anchorImage}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={600}
            />
          </View>
        </Animated.View>

        <View style={styles.affirmationContainer}>
          <Text
            style={[
              styles.greeting,
              {
                fontSize: scale(15),
                color: textColor('textMuted'),
              },
            ]}
          >
            {getGreeting(userName)}
          </Text>
          <Text
            style={[
              styles.affirmation,
              {
                fontSize: scale(16),
                lineHeight: scale(24),
                color: textColor('textPrimary'),
              },
            ]}
            numberOfLines={5}
          >
            {affirmation}
          </Text>
        </View>

        <View style={styles.spacer} />

        {/* Toast messages */}
        {showOfflineToast && toastText.length > 0 && (
          <Pressable onPress={dismissToast}>
            <Animated.View
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(200)}
              style={styles.toastContainer}
            >
              <Text style={[styles.toastText, { fontSize: scale(14) }]}>
                {toastText}
              </Text>
            </Animated.View>
          </Pressable>
        )}

        {/* Mic Button + keyboard icon (hidden when card is showing) */}
        {!showCard && (
          <View
            style={[
              styles.micContainer,
              { paddingBottom: insets.bottom + spacing.xl },
            ]}
          >
            <MicButton
              energyLevel={energyLevel}
              size={micSize}
              iconSize={micIconSize}
              reduceMotion={reduceMotion}
              offline={!isOnline}
              recording={isRecording}
              onPress={handleMicPress}
              onPressIn={handleMicPressIn}
              onPressOut={handleMicPressOut}
            />

            {/* Text input icon — visually secondary (UX-10), min 44x44 (UFG-5) */}
            {!isRecording && (
              <Pressable
                style={styles.keyboardButton}
                onPress={handleOpenTextInput}
                accessibilityRole="button"
                accessibilityLabel="Type instead of speaking"
                accessibilityHint="Opens a text input to describe your situation"
              >
                <Text style={styles.keyboardIcon}>⌨</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>

      {/* "Still With You" encouragement banner (Story 5.1) */}
      <EncouragementBanner
        message={encouragementMsg}
        visible={showEncouragement}
        reduceMotion={reduceMotion}
        onFaded={() => setShowEncouragement(false)}
      />

      {/* Suggestion Card (Phase A + B) */}
      {currentSuggestion && (
        <SuggestionCard
          suggestion={currentSuggestion.text}
          responseType={currentSuggestion.responseType}
          energyLevel={energyLevel}
          reduceMotion={reduceMotion}
          visible={showCard}
          onThatWorked={handleThatWorked}
          onDismiss={handleDismiss}
          onAnother={handleAnother}
          onMicPressIn={handleCardMicPressIn}
          onMicPressOut={handleCardMicPressOut}
          isRecording={isRecording}
        />
      )}

      {/* Crisis Banner — shown for crisis responses or client-side pre-screening */}
      <CrisisBanner
        aiMessage={crisisAIMessage}
        crisisContext={crisisContext}
        visible={showCrisisBanner}
        reduceMotion={reduceMotion}
        onDismiss={handleCrisisDismiss}
      />

      {/* Text Input Fallback (Story 1.10) */}
      <TextInputFallback
        visible={showTextInput}
        energyLevel={energyLevel}
        onSubmit={handleTextSubmit}
        onDismiss={handleTextDismiss}
      />

      {/* Gentle Ideas Overlay (offline) */}
      <IdeasOverlay visible={showIdeas} onClose={handleIdeasClose} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.warmCream },
  background: { ...StyleSheet.absoluteFillObject },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenPadding,
    alignItems: 'center',
  },
  settingsButton: {
    alignSelf: 'flex-end',
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  settingsIcon: { fontSize: 22, color: colors.textMuted },
  imageWrapper: { alignSelf: 'center' },
  imageContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    ...createShadow(4, 8, 0.1),
  },
  anchorImage: { width: '100%', height: '100%' },
  affirmationContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  greeting: {
    fontFamily: fontFamilies.medium,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  affirmation: {
    fontFamily: fontFamilies.light,
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
  },
  spacer: { flex: 1, minHeight: spacing.lg },
  toastContainer: {
    backgroundColor: 'rgba(61, 61, 61, 0.9)',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: 20,
    marginBottom: spacing.md,
  },
  toastText: {
    fontFamily: fontFamilies.regular,
    fontSize: 14,
    color: colors.white,
    textAlign: 'center',
  },
  micContainer: { alignItems: 'center' },
  keyboardButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  keyboardIcon: {
    fontSize: 22,
    color: colors.textMuted,
  },
});
