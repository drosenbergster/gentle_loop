/**
 * Onboarding Screen — 5-step flow
 *
 * Step 1: Welcome (Story 2.1)
 * Step 2: How It Works (Story 2.1)
 * Step 3: Your Name (Story 2.1)
 * Step 4: Your Anchor (Story 2.2)
 * Step 5: Meet the Mic + Disclaimer (Story 2.2, 2.3)
 *
 * FR29: 5-step onboarding flow
 * FR30: "Meet the Mic" with mic permission
 * FR31: Wellness disclaimer acceptance
 */

import { useState, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { colors, spacing, fontFamilies } from '../src/theme';
import { useSettingsStore } from '../src/stores';

// Default anchor images
const defaultImages: Record<string, any> = {
  'default-mountains': require('../assets/images/mountains.jpg'),
  'default-water': require('../assets/images/water.jpg'),
  'default-sunset': require('../assets/images/sunset.jpg'),
};

const TOTAL_STEPS = 5;

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const setUserName = useSettingsStore((s) => s.setUserName);
  const setAnchorImage = useSettingsStore((s) => s.setAnchorImage);
  const setOnboardingComplete = useSettingsStore((s) => s.setOnboardingComplete);

  const [step, setStep] = useState(0); // 0-indexed
  const [name, setName] = useState('');
  const [selectedImage, setSelectedImage] = useState('default-mountains');
  const [micPermissionDone, setMicPermissionDone] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const nameInputRef = useRef<TextInput>(null);

  const canAdvance = () => {
    switch (step) {
      case 2: return name.trim().length > 0; // Name required
      case 4: return disclaimerAccepted; // Disclaimer required
      default: return true;
    }
  };

  const advance = useCallback(() => {
    if (step === 2) {
      setUserName(name.trim());
    }
    if (step === 3) {
      setAnchorImage(selectedImage);
    }
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
    } else {
      // Final step — complete onboarding
      setAnchorImage(selectedImage);
      setOnboardingComplete();
      router.replace('/');
    }
  }, [step, name, selectedImage, setUserName, setAnchorImage, setOnboardingComplete, router]);

  // --- Photo picker (Story 2.2, FM-8) ---
  const pickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Photo Access',
        'We need access to your photos to set your anchor image. You can change this in Settings.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  }, []);

  // --- Mic permission (Story 2.2, FR30, ARCH-16) ---
  const requestMicPermission = useCallback(async () => {
    try {
      const { ExpoSpeechRecognitionModule } = require('expo-speech-recognition');
      const { status } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      setMicPermissionDone(true);
      if (status !== 'granted') {
        Alert.alert(
          'Mic Access',
          "No worries — you can still type instead. You can enable the mic anytime in your device's Settings.",
        );
      }
    } catch {
      // Fallback if module not available (e.g., web)
      setMicPermissionDone(true);
    }
  }, []);

  // --- Render steps ---
  const renderStep = () => {
    switch (step) {
      case 0: return renderWelcome();
      case 1: return renderHowItWorks();
      case 2: return renderYourName();
      case 3: return renderYourAnchor();
      case 4: return renderMeetTheMic();
      default: return null;
    }
  };

  const renderWelcome = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.appIcon}>🌅</Text>
      <Text style={styles.appName}>gentle_loop</Text>
      <Text style={styles.tagline}>
        A moment of calm when{'\n'}you need it most.
      </Text>
      <Text style={styles.description}>
        This app is your personal reset button. Open it when caregiving gets
        heavy. We'll help you pause, breathe, and find your next step.
      </Text>
    </View>
  );

  const renderHowItWorks = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>How it works</Text>
      <View style={styles.stepsBox}>
        <View style={styles.stepItem}>
          <Text style={styles.stepNumber}>1.</Text>
          <View style={styles.stepTextWrap}>
            <Text style={styles.stepItemTitle}>Open the app</Text>
            <Text style={styles.stepItemDesc}>
              See your anchor image. Take a breath.
            </Text>
          </View>
        </View>
        <View style={styles.stepItem}>
          <Text style={styles.stepNumber}>2.</Text>
          <View style={styles.stepTextWrap}>
            <Text style={styles.stepItemTitle}>Hold the mic</Text>
            <Text style={styles.stepItemDesc}>
              Describe what's happening. The AI listens.
            </Text>
          </View>
        </View>
        <View style={styles.stepItem}>
          <Text style={styles.stepNumber}>3.</Text>
          <View style={styles.stepTextWrap}>
            <Text style={styles.stepItemTitle}>Get a suggestion</Text>
            <Text style={styles.stepItemDesc}>
              A short, honest idea you can try right now.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderYourName = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What should we call you?</Text>
      <Text style={styles.subtitle}>
        This helps us personalize your experience.
      </Text>
      <TextInput
        ref={nameInputRef}
        style={styles.nameInput}
        placeholder="Your first name"
        placeholderTextColor={colors.textMuted}
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType="done"
        maxLength={30}
        accessibilityLabel="Your first name"
      />
    </View>
  );

  const renderYourAnchor = () => {
    const isCustomImage =
      selectedImage && !selectedImage.startsWith('default-');
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Choose your anchor</Text>
        <Text style={styles.subtitle}>
          This image will greet you every time you open the app. Pick something
          calming — a peaceful place, a pet, a favorite view.
        </Text>

        <View style={styles.imageGrid}>
          {Object.entries(defaultImages).map(([key, source]) => (
            <Pressable
              key={key}
              style={[
                styles.imageOption,
                selectedImage === key && styles.imageOptionSelected,
              ]}
              onPress={() => setSelectedImage(key)}
              accessibilityRole="button"
              accessibilityLabel={`Select ${key.replace('default-', '')} image`}
            >
              <Image
                source={source}
                style={styles.imageOptionImage}
                contentFit="cover"
              />
              {selectedImage === key && (
                <View style={styles.checkOverlay}>
                  <Text style={styles.checkMark}>✓</Text>
                </View>
              )}
            </Pressable>
          ))}

          {/* Upload custom photo */}
          <Pressable
            style={[
              styles.imageOption,
              isCustomImage && styles.imageOptionSelected,
            ]}
            onPress={pickImage}
            accessibilityRole="button"
            accessibilityLabel="Upload a photo from your library"
          >
            {isCustomImage ? (
              <>
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.imageOptionImage}
                  contentFit="cover"
                />
                <View style={styles.checkOverlay}>
                  <Text style={styles.checkMark}>✓</Text>
                </View>
              </>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Text style={styles.uploadIcon}>📷</Text>
                <Text style={styles.uploadText}>Upload</Text>
              </View>
            )}
          </Pressable>
        </View>

        <Text style={styles.hint}>You can change this anytime in Settings.</Text>
      </View>
    );
  };

  const renderMeetTheMic = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Meet the mic</Text>

      {/* Hold-to-talk illustration */}
      <View style={styles.micDemo}>
        <View style={styles.micCircle}>
          <Text style={styles.micEmoji}>🎤</Text>
        </View>
        <Text style={styles.micDemoLabel}>Hold to talk</Text>
      </View>

      <Text style={styles.description}>
        When you need help, hold the mic and describe what's happening. The AI
        will give you a short, honest suggestion you can try right now.
      </Text>

      <View style={styles.privacyNote}>
        <Text style={styles.privacyIcon}>🔒</Text>
        <Text style={styles.privacyText}>
          Audio is never stored. Your voice is converted to text and immediately
          discarded.
        </Text>
      </View>

      {/* Mic permission button */}
      {!micPermissionDone ? (
        <Pressable
          style={({ pressed }) => [
            styles.micPermissionButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={requestMicPermission}
          accessibilityRole="button"
          accessibilityLabel="Allow microphone access"
        >
          <Text style={styles.micPermissionText}>Allow Microphone</Text>
        </Pressable>
      ) : (
        <View style={styles.micPermissionDone}>
          <Text style={styles.micPermissionDoneText}>
            ✓ Mic {micPermissionDone ? 'set up' : 'ready'}
          </Text>
        </View>
      )}

      {/* Wellness disclaimer (FR31, Story 2.3) */}
      <Pressable
        style={styles.disclaimerRow}
        onPress={() => setDisclaimerAccepted((v) => !v)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: disclaimerAccepted }}
        accessibilityLabel="I understand this is a wellness tool, not a medical device"
      >
        <View
          style={[
            styles.checkbox,
            disclaimerAccepted && styles.checkboxChecked,
          ]}
        >
          {disclaimerAccepted && <Text style={styles.checkboxMark}>✓</Text>}
        </View>
        <Text style={styles.disclaimerText}>
          I understand this is a wellness tool, not a medical device. It doesn't
          diagnose, treat, or replace professional care.
        </Text>
      </Pressable>
    </View>
  );

  const buttonLabel =
    step === 0
      ? 'Get Started'
      : step === TOTAL_STEPS - 1
        ? 'Start Using gentle_loop'
        : 'Continue';

  const enabled = canAdvance();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.lg },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          key={step}
          entering={FadeIn.duration(250)}
          style={styles.stepWrapper}
        >
          {renderStep()}
        </Animated.View>
      </ScrollView>

      {/* Bottom: CTA + progress dots */}
      <View style={styles.bottomSection}>
        {/* Skip link (only on anchor step) */}
        {step === 3 && (
          <Pressable
            style={styles.skipButton}
            onPress={() => setStep(4)}
            accessibilityRole="button"
            accessibilityLabel="Skip choosing an anchor image"
          >
            <Text style={styles.skipText}>Skip for now</Text>
          </Pressable>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.ctaButton,
            !enabled && styles.ctaDisabled,
            pressed && enabled && styles.buttonPressed,
          ]}
          onPress={advance}
          disabled={!enabled}
          accessibilityRole="button"
          accessibilityLabel={buttonLabel}
          accessibilityState={{ disabled: !enabled }}
        >
          <Text style={[styles.ctaText, !enabled && styles.ctaTextDisabled]}>
            {buttonLabel}
          </Text>
        </Pressable>

        {/* Progress dots */}
        <View style={styles.dotsRow}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i <= step && styles.dotActive]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.warmCream,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenPadding,
  },
  stepWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  stepContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },

  // --- Welcome ---
  appIcon: { fontSize: 64, marginBottom: spacing.md },
  appName: {
    fontFamily: fontFamilies.semiBold,
    fontSize: 32,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  tagline: {
    fontFamily: fontFamilies.light,
    fontSize: 20,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: spacing.xl,
  },
  description: {
    fontFamily: fontFamilies.regular,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },

  // --- How It Works ---
  stepTitle: {
    fontFamily: fontFamilies.semiBold,
    fontSize: 28,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  subtitle: {
    fontFamily: fontFamilies.regular,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  stepsBox: {
    width: '100%',
    gap: spacing.lg,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.sm,
  },
  stepNumber: {
    fontFamily: fontFamilies.semiBold,
    fontSize: 18,
    color: colors.dustyRose,
    marginRight: spacing.md,
    marginTop: 2,
  },
  stepTextWrap: { flex: 1 },
  stepItemTitle: {
    fontFamily: fontFamilies.medium,
    fontSize: 17,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  stepItemDesc: {
    fontFamily: fontFamilies.regular,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 21,
  },

  // --- Your Name ---
  nameInput: {
    width: '100%',
    height: 56,
    backgroundColor: colors.softGray,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    fontFamily: fontFamilies.regular,
    fontSize: 18,
    color: colors.textPrimary,
  },

  // --- Your Anchor ---
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  imageOption: {
    width: 130,
    height: 130,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  imageOptionSelected: {
    borderColor: colors.dustyRose,
  },
  imageOptionImage: {
    width: '100%',
    height: '100%',
  },
  checkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: {
    fontSize: 32,
    color: colors.white,
  },
  uploadPlaceholder: {
    flex: 1,
    backgroundColor: colors.softGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadIcon: { fontSize: 32, marginBottom: spacing.xs },
  uploadText: {
    fontFamily: fontFamilies.regular,
    fontSize: 14,
    color: colors.textSecondary,
  },
  hint: {
    fontFamily: fontFamilies.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },

  // --- Meet the Mic ---
  micDemo: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  micCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.dustyRose,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  micEmoji: { fontSize: 40 },
  micDemoLabel: {
    fontFamily: fontFamilies.medium,
    fontSize: 16,
    color: colors.textSecondary,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(107, 91, 122, 0.06)',
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    width: '100%',
  },
  privacyIcon: { fontSize: 16, marginRight: spacing.sm, marginTop: 2 },
  privacyText: {
    fontFamily: fontFamilies.regular,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    flex: 1,
  },
  micPermissionButton: {
    width: '100%',
    height: 48,
    backgroundColor: colors.twilightPurple,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  micPermissionText: {
    fontFamily: fontFamilies.medium,
    fontSize: 16,
    color: colors.white,
  },
  micPermissionDone: {
    width: '100%',
    height: 48,
    backgroundColor: colors.success,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  micPermissionDoneText: {
    fontFamily: fontFamilies.medium,
    fontSize: 16,
    color: colors.white,
  },

  // --- Disclaimer ---
  disclaimerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    minHeight: 44,
    paddingVertical: spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.twilightPurple,
    borderColor: colors.twilightPurple,
  },
  checkboxMark: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '700',
  },
  disclaimerText: {
    fontFamily: fontFamilies.regular,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    flex: 1,
  },

  // --- Bottom section ---
  bottomSection: {
    paddingHorizontal: spacing.screenPadding,
    alignItems: 'center',
  },
  skipButton: {
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  skipText: {
    fontFamily: fontFamilies.regular,
    fontSize: 15,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
  ctaButton: {
    width: '100%',
    height: 56,
    backgroundColor: colors.dustyRose,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaDisabled: {
    backgroundColor: colors.softGray,
  },
  ctaText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: 18,
    color: colors.white,
  },
  ctaTextDisabled: {
    color: colors.textMuted,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  // --- Progress dots ---
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.softGray,
  },
  dotActive: {
    backgroundColor: colors.dustyRose,
  },
});
