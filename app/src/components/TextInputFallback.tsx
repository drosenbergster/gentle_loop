/**
 * Text Input Fallback
 *
 * FR13: Type a situation when voice isn't possible.
 * Sends text through the same AI pipeline as voice input.
 * Supports autocorrect, paste, multi-line. Dismiss via tap outside or swipe down.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text } from 'react-native-paper';
import Animated, { FadeIn, FadeOut, SlideInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { colors, spacing, fontFamilies } from '../theme';
import type { EnergyLevel } from '../theme/colors';
import { useAccessibility } from '../hooks';

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

interface TextInputFallbackProps {
  visible: boolean;
  energyLevel: EnergyLevel;
  onSubmit: (text: string) => void;
  onDismiss: () => void;
}

// ─────────────────────────────────────────
// Component
// ─────────────────────────────────────────

export function TextInputFallback({
  visible,
  energyLevel,
  onSubmit,
  onDismiss,
}: TextInputFallbackProps) {
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);
  const { scale } = useAccessibility();
  const energyColor = colors.energy[energyLevel];

  // Focus the input when it becomes visible
  useEffect(() => {
    if (visible) {
      // Small delay to let animation start before focusing
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleSubmit = useCallback(() => {
    const trimmed = text.trim();
    if (trimmed.length === 0) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    Keyboard.dismiss();
    onSubmit(trimmed);
    setText('');
  }, [text, onSubmit]);

  const handleDismiss = useCallback(() => {
    Keyboard.dismiss();
    setText('');
    onDismiss();
  }, [onDismiss]);

  if (!visible) return null;

  const canSubmit = text.trim().length > 0;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={styles.backdrop}
    >
      {/* Tap outside to dismiss */}
      <Pressable style={styles.dismissArea} onPress={handleDismiss} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={0}
      >
        <Animated.View
          entering={SlideInDown.duration(300).springify()}
          style={styles.inputContainer}
        >
          {/* Drag indicator */}
          <View style={styles.dragIndicator} />

          <TextInput
            ref={inputRef}
            style={[styles.textInput, { fontSize: scale(16) }]}
            placeholder="Describe what's happening..."
            placeholderTextColor={colors.textMuted}
            value={text}
            onChangeText={setText}
            multiline
            autoCorrect
            autoCapitalize="sentences"
            textAlignVertical="top"
            returnKeyType="default"
            blurOnSubmit={false}
            maxLength={500}
            accessibilityLabel="Describe your situation"
            accessibilityHint="Type what's happening and tap Send"
          />

          {/* Send button */}
          <Pressable
            style={({ pressed }) => [
              styles.sendButton,
              { backgroundColor: canSubmit ? energyColor : colors.textMuted },
              pressed && canSubmit && styles.buttonPressed,
            ]}
            onPress={handleSubmit}
            disabled={!canSubmit}
            accessibilityRole="button"
            accessibilityLabel="Send"
            accessibilityState={{ disabled: !canSubmit }}
          >
            <Text style={[styles.sendText, { fontSize: scale(16) }]}>
              Send
            </Text>
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

// ─────────────────────────────────────────
// Styles
// ─────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 25,
  },
  dismissArea: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  keyboardAvoid: {
    width: '100%',
  },
  inputContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingTop: 12,
    paddingBottom: spacing.lg,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px -4px 20px rgba(0,0,0,0.15)' }
      : {
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
          elevation: 10,
        }),
  },
  dragIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(61, 61, 61, 0.3)',
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  textInput: {
    minHeight: 56,
    maxHeight: 120,
    backgroundColor: colors.softGray,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    fontFamily: fontFamilies.regular,
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  sendButton: {
    height: 48,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  sendText: {
    fontFamily: fontFamilies.medium,
    fontSize: 16,
    color: colors.white,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
