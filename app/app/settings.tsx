/**
 * Settings Screen
 * 
 * Personalization, accessibility, and about sections.
 * Back navigation returns to Anchor Screen.
 */

import { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable, ScrollView, Switch, TextInput, Image, Platform, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, fontFamilies, fontSizes } from '../src/theme';
import { useSettingsStore } from '../src/stores';
import { useAccessibility } from '../src/hooks';

// Anchor image options (same as onboarding)
const ANCHOR_OPTIONS = [
  {
    key: 'default-mountains',
    label: 'Mountains',
    source: require('../assets/images/mountains.jpg'),
  },
  {
    key: 'default-water',
    label: 'Water',
    source: require('../assets/images/water.jpg'),
  },
  {
    key: 'default-sunset',
    label: 'Sunset',
    source: require('../assets/images/sunset.jpg'),
  },
];

// Toggle row component (accepts optional scaled styles)
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

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { scale, textColor } = useAccessibility();

  // Settings store
  const userName = useSettingsStore(state => state.userName);
  const anchorImage = useSettingsStore(state => state.anchorImage);
  const reduceMotion = useSettingsStore(state => state.reduceMotion);
  const largerText = useSettingsStore(state => state.largerText);
  const highContrast = useSettingsStore(state => state.highContrast);

  const setUserName = useSettingsStore(state => state.setUserName);
  const setAnchorImage = useSettingsStore(state => state.setAnchorImage);
  const setReduceMotion = useSettingsStore(state => state.setReduceMotion);
  const setLargerText = useSettingsStore(state => state.setLargerText);
  const setHighContrast = useSettingsStore(state => state.setHighContrast);

  // Local state for name editing
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(userName);

  // Dynamic accessibility styles
  const labelA11y = { fontSize: scale(fontSizes.base), color: textColor('textPrimary') };
  const descA11y = { fontSize: scale(fontSizes.xs), color: textColor('textMuted') };

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

  const handlePickPhoto = useCallback(async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      if (Platform.OS === 'web') {
        // Web doesn't need permissions, proceed anyway
      } else {
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
        <Text style={[styles.headerTitle, { fontSize: scale(fontSizes.lg), color: textColor('textPrimary') }]}>Settings</Text>
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
        {/* PERSONALIZATION */}
        <Text style={[styles.sectionHeader, { fontSize: scale(fontSizes.xs), color: textColor('textMuted') }]}>PERSONALIZATION</Text>
        <View style={styles.section}>
          {/* Name */}
          <View style={rowStyles.container}>
            <View style={rowStyles.textColumn}>
              <Text style={[rowStyles.label, labelA11y]}>Your Name</Text>
              {editingName ? (
                <TextInput
                  style={[styles.nameInput, { fontSize: scale(fontSizes.sm), color: textColor('textPrimary') }]}
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
                accessibilityRole="button"
                accessibilityLabel="Edit name"
              >
                <Text style={[styles.editButton, { fontSize: scale(fontSizes.sm) }]}>Edit</Text>
              </Pressable>
            )}
          </View>

          {/* Anchor Image */}
          <View style={styles.anchorSection}>
            <Text style={[rowStyles.label, labelA11y]}>Anchor Image</Text>
            <Text style={[rowStyles.description, descA11y, { marginBottom: spacing.md }]}>
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
                  <Text style={[
                    styles.imageLabel,
                    { fontSize: scale(fontSizes.xs), color: textColor('textMuted') },
                    anchorImage === option.key && styles.imageLabelSelected,
                    anchorImage === option.key && { color: textColor('textPrimary') },
                  ]}>
                    {option.label}
                  </Text>
                </Pressable>
              ))}

              {/* Custom photo option */}
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
                <Text style={[
                  styles.imageLabel,
                  { fontSize: scale(fontSizes.xs), color: textColor('textMuted') },
                  anchorImage && !anchorImage.startsWith('default-') && styles.imageLabelSelected,
                  anchorImage && !anchorImage.startsWith('default-') && { color: textColor('textPrimary') },
                ]}>
                  Your photo
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* ACCESSIBILITY */}
        <Text style={[styles.sectionHeader, { fontSize: scale(fontSizes.xs), color: textColor('textMuted') }]}>ACCESSIBILITY</Text>
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

        {/* ABOUT */}
        <Text style={[styles.sectionHeader, { fontSize: scale(fontSizes.xs), color: textColor('textMuted') }]}>ABOUT</Text>
        <View style={styles.section}>
          <View style={rowStyles.container}>
            <Text style={[rowStyles.label, labelA11y]}>Version</Text>
            <Text style={[styles.versionText, { fontSize: scale(fontSizes.sm), color: textColor('textMuted') }]}>1.0.0</Text>
          </View>
          <View style={[rowStyles.container, { borderBottomWidth: 0 }]}>
            <View style={rowStyles.textColumn}>
              <Text style={[rowStyles.label, labelA11y]}>Gentle Loop</Text>
              <Text style={[rowStyles.description, descA11y]}>
                A wellness support tool for caregivers. Not a medical device.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

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
    width: 40,
    height: 40,
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
    width: 40,
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
  section: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
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
  editButton: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.sm,
    color: colors.dustyRose,
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
