/**
 * Toolbox Screen — Personal Strategy Playbook
 *
 * Story 4.1: Browse all saved strategies with dates.
 * Story 4.2: Delete entries with confirmation.
 *
 * FR20, FR21, FR22, FR24, FR37
 */

import { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  FlatList,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { Text } from 'react-native-paper';
import Animated, { FadeIn, FadeOut, SlideOutRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { colors, spacing, fontFamilies, fontSizes } from '../src/theme';
import { useToolboxStore } from '../src/stores';
import { useAccessibility } from '../src/hooks';
import type { ToolboxEntry } from '../src/types/toolbox';

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

// ─────────────────────────────────────────
// Component
// ─────────────────────────────────────────

export default function ToolboxScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { height: screenHeight } = useWindowDimensions();
  const { scale } = useAccessibility();

  const entries = useToolboxStore((s) => s.entries);
  const removeEntry = useToolboxStore((s) => s.removeEntry);

  // Reversed so newest first (FR22)
  const sortedEntries = [...entries].reverse();

  // Expanded entry ID for full text view
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const handleDelete = useCallback(
    (entry: ToolboxEntry) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Alert.alert(
        'Remove from Toolbox?',
        `"${entry.suggestionText.substring(0, 80)}${entry.suggestionText.length > 80 ? '…' : ''}"`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => {
              removeEntry(entry.id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            },
          },
        ],
      );
    },
    [removeEntry],
  );

  const renderEntry = useCallback(
    ({ item }: { item: ToolboxEntry }) => {
      const isExpanded = expandedId === item.id;

      return (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={SlideOutRight.duration(250)}
        >
          <Pressable
            style={({ pressed }) => [
              styles.entryCard,
              pressed && styles.entryPressed,
            ]}
            onPress={() => toggleExpand(item.id)}
            accessibilityRole="button"
            accessibilityLabel={`Strategy saved ${formatDate(item.savedAt)}: ${item.suggestionText}`}
            accessibilityHint={
              isExpanded
                ? 'Tap to collapse'
                : 'Tap to expand full text'
            }
          >
            <View style={styles.entryHeader}>
              <Text
                style={[styles.entryDate, { fontSize: scale(fontSizes.xs) }]}
              >
                {formatDate(item.savedAt)}
              </Text>
              <Pressable
                style={styles.deleteButton}
                onPress={() => handleDelete(item)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Remove this strategy from Toolbox"
              >
                <Text style={styles.deleteIcon}>✕</Text>
              </Pressable>
            </View>

            <Text
              style={[
                styles.entryText,
                { fontSize: scale(fontSizes.md) },
              ]}
              numberOfLines={isExpanded ? undefined : 3}
            >
              {item.suggestionText}
            </Text>

            {!isExpanded && item.suggestionText.length > 120 && (
              <Text
                style={[
                  styles.readMore,
                  { fontSize: scale(fontSizes.xs) },
                ]}
              >
                Tap to read more
              </Text>
            )}
          </Pressable>
        </Animated.View>
      );
    },
    [expandedId, toggleExpand, handleDelete, scale],
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyEmoji, { fontSize: scale(40) }]}>📋</Text>
      <Text style={[styles.emptyTitle, { fontSize: scale(fontSizes.lg) }]}>
        Nothing here yet
      </Text>
      <Text style={[styles.emptyBody, { fontSize: scale(fontSizes.md) }]}>
        When you get a suggestion that helps, tap "That worked" to save it here.
        Your Toolbox builds over time into a personal playbook of what works for
        you.
      </Text>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + spacing.md,
          paddingBottom: insets.bottom + spacing.md,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back to Settings"
        >
          <Text style={[styles.backText, { fontSize: scale(fontSizes.md) }]}>
            ← Back
          </Text>
        </Pressable>
        <Text style={[styles.title, { fontSize: scale(fontSizes.xl) }]}>
          My Toolbox
        </Text>
        <Text style={[styles.subtitle, { fontSize: scale(fontSizes.sm) }]}>
          {entries.length === 0
            ? 'Strategies that work for you'
            : `${entries.length} saved ${entries.length === 1 ? 'strategy' : 'strategies'}`}
        </Text>
      </View>

      {/* Entry list */}
      {entries.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList
          data={sortedEntries}
          renderItem={renderEntry}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

// ─────────────────────────────────────────
// Styles
// ─────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.warmCream,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  backButton: {
    paddingVertical: spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  backText: {
    fontFamily: fontFamilies.medium,
    color: colors.textSecondary,
  },
  title: {
    fontFamily: fontFamilies.semiBold,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  subtitle: {
    fontFamily: fontFamilies.light,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  separator: {
    height: spacing.md,
  },
  entryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.lg,
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  entryPressed: {
    opacity: 0.85,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  entryDate: {
    fontFamily: fontFamilies.light,
    color: colors.textMuted,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  deleteIcon: {
    fontSize: 14,
    color: colors.textMuted,
  },
  entryText: {
    fontFamily: fontFamilies.regular,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  readMore: {
    fontFamily: fontFamilies.light,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  emptyEmoji: {
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontFamily: fontFamilies.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyBody: {
    fontFamily: fontFamilies.light,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
