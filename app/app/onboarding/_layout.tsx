/**
 * Onboarding Layout
 * 
 * Stack navigator for the 4-step onboarding flow.
 * Horizontal slide animation between steps.
 */

import { Stack } from 'expo-router';
import { colors } from '../../src/theme';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.warmCream },
        animation: 'slide_from_right',
      }}
    />
  );
}
