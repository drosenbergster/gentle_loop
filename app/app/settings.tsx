/**
 * Settings Screen
 *
 * Sections in order (UX-12):
 * 1. Energy — 3-position discrete selector
 * 2. Toolbox — Preview of 3 most recent (full UI in Epic 4)
 * 3. Personalization — Name, anchor image
 * 4. AI Response — Response mode, TTS speed
 * 5. Accessibility — Reduce motion, larger text, high contrast
 * 6. About — Version, description
 */

import { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  Switch,
  TextInput,
  Image,
  Platform,
  Alert,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

import { colors, spacing, fontFamilies, fontSizes } from '../src/theme';
import {
  useSettingsStore,
  useEnergyStore,
  useToolboxStore,
  type EnergyLevel,
  ENERGY_LEVELS,
} from '../src/stores';
// TTS types removed — TTS is disabled
import { useAccessibility } from '../src/hooks';

// --- Constants ---

const ANCHOR_OPTIONS = [
  { key: 'default-mountains', label: 'Mountains', source: require('../assets/images/mountains.jpg') },
  { key: 'default-water', label: 'Water', source: require('../assets/images/water.jpg') },
  { key: 'default-sunset', label: 'Sunset', source: require('../assets/images/sunset.jpg') },
];

const ENERGY_LABELS: Record<EnergyLevel, string> = {
  running_low: 'Running low',
  holding_steady: 'Holding steady',
  ive_got_this: "I've got this",
};

// TTS options removed — TTS is disabled

// --- Shared Components ---

function ToggleRow({
  label,
  description,
  value,
  onValueChange,
  labelStyle,
  descriptionStyle,
}: {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  labelStyle?: any;
  descriptionStyle?: any;
}) {
  return (
    <View style={rowStyles.container}>
      <View style={rowStyles.textColumn}>
        <Text style={[rowStyles.label, labelStyle]}>{label}</Text>
        <Text style={[rowStyles.description, descriptionStyle]}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.softGray, true: colors.dustyRose }}
        thumbColor={colors.white}
      />
    </View>
  );
}

/** Segmented control for selecting from discrete options */
function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  labelStyle,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (val: T) => void;
  labelStyle?: any;
}) {
  return (
    <View style={segmentStyles.container}>
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <Pressable
            key={option.value}
            style={[
              segmentStyles.option,
              isSelected && segmentStyles.optionSelected,
            ]}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={option.label}
          >
            <Text
              style={[
                segmentStyles.optionText,
                isSelected && segmentStyles.optionTextSelected,
                labelStyle,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const segmentStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.softGray,
    borderRadius: 12,
    padding: 3,
  },
  option: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  optionSelected: {
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  optionText: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  optionTextSelected: {
    fontFamily: fontFamilies.medium,
    color: colors.textPrimary,
  },
});

// --- Main Screen ---

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { scale, textColor } = useAccessibility();

  // Settings store
  const userName = useSettingsStore((s) => s.userName);
  const anchorImage = useSettingsStore((s) => s.anchorImage);
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);
  const largerText = useSettingsStore((s) => s.largerText);
  const highContrast = useSettingsStore((s) => s.highContrast);
  const setUserName = useSettingsStore((s) => s.setUserName);
  const setAnchorImage = useSettingsStore((s) => s.setAnchorImage);
  const setReduceMotion = useSettingsStore((s) => s.setReduceMotion);
  const setLargerText = useSettingsStore((s) => s.setLargerText);
  const setHighContrast = useSettingsStore((s) => s.setHighContrast);

  // Energy store
  const energyLevel = useEnergyStore((s) => s.energyLevel);
  const setEnergyLevel = useEnergyStore((s) => s.setEnergyLevel);

  // Toolbox store (preview only)
  const toolboxEntries = useToolboxStore((s) => s.entries);
  const recentToolbox = toolboxEntries.slice(-3).reverse(); // 3 most recent, newest first

  // Local state
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(userName);

  // Dynamic accessibility styles
  const labelA11y = {
    fontSize: scale(fontSizes.base),
    color: textColor('textPrimary'),
  };
  const descA11y = {
    fontSize: scale(fontSizes.xs),
    color: textColor('textMuted'),
  };

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, [router]);

  const handleSaveName = () => {
    setUserName(nameValue.trim());
    setEditingName(false);
  };

  const handleEnergyChange = useCallback(
    (level: EnergyLevel) => {
      setEnergyLevel(level);
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    [setEnergyLevel],
  );

  const handlePickPhoto = useCallback(async () => {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Permission needed',
          'Please allow photo access to choose your own anchor image.',
        );
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAnchorImage(result.assets[0].uri);
    }
  }, [setAnchorImage]);

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text
          style={[
            styles.headerTitle,
            {
              fontSize: scale(fontSizes.lg),
              color: textColor('textPrimary'),
            },
          ]}
        >
          Settings
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. YOUR ENERGY */}
        <Text
          style={[
            styles.sectionHeader,
            styles.sectionHeaderFirst,
            { fontSize: scale(fontSizes.xs), color: textColor('textMuted') },
          ]}
        >
          YOUR ENERGY
        </Text>
        <View style={styles.section}>
          <View style={styles.energySection}>
            <View style={styles.energySelector}>
              {ENERGY_LEVELS.map((level) => {
                const isSelected = level === energyLevel;
                return (
                  <Pressable
                    key={level}
                    style={[
                      styles.energyOption,
                      isSelected && {
                        backgroundColor: colors.energy[level],
                      },
                    ]}
                    onPress={() => handleEnergyChange(level)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={`Energy: ${ENERGY_LABELS[level]}`}
                  >
                    <Text
                      style={[
                        styles.energyOptionText,
                        { fontSize: scale(fontSizes.sm) },
                        isSelected && styles.energyOptionTextSelected,
                      ]}
                    >
                      {ENERGY_LABELS[level]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text
              style={[
                styles.energyHelper,
                { fontSize: scale(fontSizes.xs), color: textColor('textMuted') },
              ]}
            >
              Helps the AI adjust its tone. Set whenever you think to.
            </Text>
          </View>
        </View>

        {/* 2. TOOLBOX (Preview) */}
        <Text
          style={[
            styles.sectionHeader,
            { fontSize: scale(fontSizes.xs), color: textColor('textMuted') },
          ]}
        >
          TOOLBOX
        </Text>
        <View style={styles.section}>
          {recentToolbox.length === 0 ? (
            <View style={styles.toolboxEmpty}>
              <Text
                style={[
                  styles.toolboxEmptyText,
                  { fontSize: scale(fontSizes.sm), color: textColor('textMuted') },
                ]}
              >
                Strategies you mark as "That worked" will appear here.
              </Text>
            </View>
          ) : (
            <>
              {recentToolbox.map((entry) => (
                <View key={entry.id} style={rowStyles.container}>
                  <View style={rowStyles.textColumn}>
                    <Text
                      style={[rowStyles.label, labelA11y]}
                      numberOfLines={2}
                    >
                      "{entry.suggestionText}"
                    </Text>
                    <Text style={[rowStyles.description, descA11y]}>
                      Saved {formatDate(entry.savedAt)}
                    </Text>
                  </View>
                </View>
              ))}
              <Pressable
                style={styles.viewAllButton}
                onPress={() => router.push('/toolbox')}
                accessibilityRole="button"
                accessibilityLabel={`View all ${toolboxEntries.length} Toolbox entries`}
              >
                <Text
                  style={[
                    styles.viewAllText,
                    { fontSize: scale(fontSizes.sm) },
                  ]}
                >
                  View All ({toolboxEntries.length}) →
                </Text>
              </Pressable>
            </>
          )}
        </View>

        {/* 3. PERSONALIZATION */}
        <Text
          style={[
            styles.sectionHeader,
            { fontSize: scale(fontSizes.xs), color: textColor('textMuted') },
          ]}
        >
          PERSONALIZATION
        </Text>
        <View style={styles.section}>
          {/* Name */}
          <View style={rowStyles.container}>
            <View style={rowStyles.textColumn}>
              <Text style={[rowStyles.label, labelA11y]}>Your Name</Text>
              {editingName ? (
                <TextInput
                  style={[
                    styles.nameInput,
                    {
                      fontSize: scale(fontSizes.sm),
                      color: textColor('textPrimary'),
                    },
                  ]}
                  value={nameValue}
                  onChangeText={setNameValue}
                  placeholder="Enter your name"
                  placeholderTextColor={colors.textMuted}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleSaveName}
                  onBlur={handleSaveName}
                  maxLength={30}
                />
              ) : (
                <Text style={[rowStyles.description, descA11y]}>
                  {userName || 'Not set'}
                </Text>
              )}
            </View>
            {!editingName && (
              <Pressable
                onPress={() => {
                  setNameValue(userName);
                  setEditingName(true);
                }}
                style={styles.editTapTarget}
                accessibilityRole="button"
                accessibilityLabel="Edit name"
              >
                <Text
                  style={[styles.editButton, { fontSize: scale(fontSizes.sm) }]}
                >
                  Edit
                </Text>
              </Pressable>
            )}
          </View>

          {/* Anchor Image */}
          <View style={styles.anchorSection}>
            <Text style={[rowStyles.label, labelA11y]}>Anchor Image</Text>
            <Text
              style={[
                rowStyles.description,
                descA11y,
                { marginBottom: spacing.md },
              ]}
            >
              This image greets you every time you open the app.
            </Text>
            <View style={styles.imageRow}>
              {ANCHOR_OPTIONS.map((option) => (
                <Pressable
                  key={option.key}
                  onPress={() => setAnchorImage(option.key)}
                  style={styles.imageOption}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: anchorImage === option.key }}
                  accessibilityLabel={`Select ${option.label}`}
                >
                  <Image
                    source={option.source}
                    style={[
                      styles.imageThumb,
                      anchorImage === option.key && styles.imageThumbSelected,
                    ]}
                    resizeMode="cover"
                  />
                  <Text
                    style={[
                      styles.imageLabel,
                      {
                        fontSize: scale(fontSizes.xs),
                        color: textColor('textMuted'),
                      },
                      anchorImage === option.key && styles.imageLabelSelected,
                      anchorImage === option.key && {
                        color: textColor('textPrimary'),
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}

              {/* Custom photo */}
              <Pressable
                onPress={handlePickPhoto}
                style={styles.imageOption}
                accessibilityRole="button"
                accessibilityLabel="Choose your own photo"
              >
                {anchorImage && !anchorImage.startsWith('default-') ? (
                  <Image
                    source={{ uri: anchorImage }}
                    style={[styles.imageThumb, styles.imageThumbSelected]}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.imageThumb, styles.addPhotoThumb]}>
                    <Text style={styles.addPhotoIcon}>+</Text>
                  </View>
                )}
                <Text
                  style={[
                    styles.imageLabel,
                    {
                      fontSize: scale(fontSizes.xs),
                      color: textColor('textMuted'),
                    },
                    anchorImage &&
                      !anchorImage.startsWith('default-') &&
                      styles.imageLabelSelected,
                    anchorImage &&
                      !anchorImage.startsWith('default-') && {
                        color: textColor('textPrimary'),
                      },
                  ]}
                >
                  Your photo
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* 4. AI RESPONSE */}
        <Text
          style={[
            styles.sectionHeader,
            { fontSize: scale(fontSizes.xs), color: textColor('textMuted') },
          ]}
        >
          AI RESPONSE
        </Text>
        <View style={styles.section}>
          <View style={[styles.aiRow, { borderBottomWidth: 0 }]}>
            <Text style={[rowStyles.label, labelA11y]}>Responses are text-only</Text>
            <Text style={[rowStyles.description, descA11y]}>
              Suggestions appear as text on screen
            </Text>
          </View>
        </View>

        {/* 5. ACCESSIBILITY */}
        <Text
          style={[
            styles.sectionHeader,
            { fontSize: scale(fontSizes.xs), color: textColor('textMuted') },
          ]}
        >
          ACCESSIBILITY
        </Text>
        <View style={styles.section}>
          <ToggleRow
            label="Reduce Motion"
            description="Disables breathing pulse and animations"
            value={reduceMotion}
            onValueChange={setReduceMotion}
            labelStyle={labelA11y}
            descriptionStyle={descA11y}
          />
          <ToggleRow
            label="Larger Text"
            description="Increases font sizes throughout the app"
            value={largerText}
            onValueChange={setLargerText}
            labelStyle={labelA11y}
            descriptionStyle={descA11y}
          />
          <ToggleRow
            label="High Contrast"
            description="Improves text visibility"
            value={highContrast}
            onValueChange={setHighContrast}
            labelStyle={labelA11y}
            descriptionStyle={descA11y}
          />
        </View>

        {/* 6. ABOUT */}
        <Text
          style={[
            styles.sectionHeader,
            { fontSize: scale(fontSizes.xs), color: textColor('textMuted') },
          ]}
        >
          ABOUT
        </Text>
        <View style={styles.section}>
          <View style={rowStyles.container}>
            <Text style={[rowStyles.label, labelA11y]}>Version</Text>
            <Text
              style={[
                styles.versionText,
                { fontSize: scale(fontSizes.sm), color: textColor('textMuted') },
              ]}
            >
              1.0.0
            </Text>
          </View>
          <View style={[rowStyles.container, { borderBottomWidth: 0 }]}>
            <View style={rowStyles.textColumn}>
              <Text style={[rowStyles.label, labelA11y]}>Gentle Loop</Text>
              <Text style={[rowStyles.description, descA11y]}>
                A wellness support tool for family caregivers. This app does not
                provide medical advice, diagnoses, or treatment. It is not a
                substitute for professional medical care. In an emergency, always
                call 911.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// --- Styles ---

const rowStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  textColumn: {
    flex: 1,
    marginRight: spacing.lg,
  },
  label: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.base,
    color: colors.textPrimary,
  },
  description: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.warmCream,
  },

  // -- Header --
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 24,
    color: colors.textPrimary,
  },
  headerTitle: {
    flex: 1,
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.lg,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },

  // -- Scroll --
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
  },

  // -- Sections --
  sectionHeader: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginTop: spacing.xxl,
    marginBottom: spacing.sm,
  },
  sectionHeaderFirst: {
    marginTop: spacing.lg,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },

  // -- Energy --
  energySection: {
    paddingVertical: spacing.lg,
  },
  energySelector: {
    flexDirection: 'row',
    backgroundColor: colors.softGray,
    borderRadius: 12,
    padding: 3,
  },
  energyOption: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.xs,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  energyOptionText: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  energyOptionTextSelected: {
    fontFamily: fontFamilies.medium,
    color: colors.white,
  },
  energyHelper: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    marginTop: spacing.md,
    textAlign: 'center',
  },

  // -- Toolbox preview --
  toolboxEmpty: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  toolboxEmptyText: {
    fontFamily: fontFamilies.light,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  viewAllButton: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  viewAllText: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.sm,
    color: colors.dustyRose,
  },

  // -- Name editing --
  nameInput: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.dustyRose,
    paddingVertical: spacing.xs,
    marginTop: spacing.xs,
    ...Platform.select({
      web: { outlineStyle: 'none' as any },
    }),
  },
  editTapTarget: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.sm,
    color: colors.dustyRose,
  },

  // -- AI Response --
  aiRow: {
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },

  // -- Anchor image picker --
  anchorSection: {
    paddingVertical: spacing.lg,
  },
  imageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  imageOption: {
    alignItems: 'center',
    flex: 1,
  },
  imageThumb: {
    width: 88,
    height: 88,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  imageThumbSelected: {
    borderColor: colors.dustyRose,
  },
  imageLabel: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  imageLabelSelected: {
    fontFamily: fontFamilies.medium,
    color: colors.textPrimary,
  },
  addPhotoThumb: {
    backgroundColor: colors.softGray,
    borderColor: colors.dustyRose,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoIcon: {
    fontSize: 28,
    color: colors.dustyRose,
    fontFamily: fontFamilies.light,
  },

  // -- About --
  versionText: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
});
