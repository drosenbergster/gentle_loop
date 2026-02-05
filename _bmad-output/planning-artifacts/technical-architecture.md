# Technical Architecture - gentle_loop

**Version:** 1.0  
**Date:** 2026-02-05

---

## Executive Summary

gentle_loop is a React Native mobile app designed for dementia caregivers. The architecture prioritizes:

1. **Instant Load** — Anchor screen visible in <2 seconds
2. **Offline-First** — Core features work without network
3. **Minimal Complexity** — Simple stack for fast MVP delivery
4. **Privacy by Default** — All sensitive data stays on device

---

## Technology Stack

### Core Framework

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | React Native (Expo) | Cross-platform iOS/Android, fast iteration |
| **Language** | TypeScript | Type safety, better developer experience |
| **UI Components** | React Native Paper | Accessible, themeable, Material Design base |
| **Navigation** | Expo Router | File-based routing, deep linking support |

### Data & State

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Local Storage** | MMKV | Fastest synchronous storage for React Native |
| **State Management** | Zustand | Simple, lightweight, TypeScript-native |
| **Data Sync (Phase 2)** | TBD (Supabase or Firebase) | For family features later |

### Development Tools

| Tool | Purpose |
|------|---------|
| **Expo** | Build, preview, OTA updates |
| **EAS Build** | App store builds |
| **TypeScript** | Type checking |
| **ESLint + Prettier** | Code quality |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        gentle_loop                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│   │   Screens   │  │ Components  │  │   Hooks     │        │
│   │             │  │             │  │             │        │
│   │ - Anchor    │  │ - IdeaCard  │  │ - useIdeas  │        │
│   │ - Onboarding│  │ - Slider    │  │ - useEnergy │        │
│   │ - Settings  │  │ - Button    │  │ - useAnchor │        │
│   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
│          │                │                │                │
│          └────────────────┼────────────────┘                │
│                           │                                 │
│                    ┌──────▼──────┐                          │
│                    │   Stores    │                          │
│                    │  (Zustand)  │                          │
│                    │             │                          │
│                    │ - settings  │                          │
│                    │ - energy    │                          │
│                    │ - ideas     │                          │
│                    └──────┬──────┘                          │
│                           │                                 │
│                    ┌──────▼──────┐                          │
│                    │    MMKV    │                          │
│                    │  (Storage)  │                          │
│                    └─────────────┘                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
gentle_loop/
├── app/                          # Expo Router screens
│   ├── (tabs)/                   # Tab-based navigation (if needed)
│   │   └── index.tsx             # Anchor Screen (home)
│   ├── onboarding/
│   │   ├── welcome.tsx
│   │   ├── how-it-works.tsx
│   │   ├── your-name.tsx
│   │   └── your-anchor.tsx
│   ├── settings/
│   │   └── index.tsx
│   ├── _layout.tsx               # Root layout
│   └── index.tsx                 # Entry redirect
│
├── components/
│   ├── ui/                       # Primitive components
│   │   ├── Button.tsx
│   │   ├── Text.tsx
│   │   ├── Card.tsx
│   │   └── Slider.tsx
│   ├── anchor/
│   │   ├── AnchorImage.tsx
│   │   ├── Affirmation.tsx
│   │   └── EnergySlider.tsx
│   ├── ideas/
│   │   ├── IdeaCard.tsx
│   │   └── IdeaOverlay.tsx
│   └── onboarding/
│       ├── OnboardingStep.tsx
│       └── ProgressDots.tsx
│
├── stores/                       # Zustand stores
│   ├── settingsStore.ts
│   ├── energyStore.ts
│   └── ideasStore.ts
│
├── data/                         # Static content
│   ├── ideas.ts                  # Ideas library (16 ideas)
│   ├── affirmations.ts           # Rotating affirmations
│   └── defaults.ts               # Default images, etc.
│
├── hooks/                        # Custom hooks
│   ├── useIdeas.ts
│   ├── useEnergy.ts
│   └── useOnboarding.ts
│
├── theme/                        # Design tokens
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   └── index.ts
│
├── utils/                        # Utilities
│   ├── storage.ts                # MMKV wrapper
│   └── haptics.ts                # Haptic feedback
│
├── assets/                       # Static assets
│   ├── images/
│   │   └── default-anchor.jpg
│   └── fonts/
│       └── Poppins/
│
├── app.json                      # Expo config
├── package.json
├── tsconfig.json
└── README.md
```

---

## Data Architecture

### Local Storage Schema (MMKV)

```typescript
// User Settings
interface UserSettings {
  name: string;
  hasCompletedOnboarding: boolean;
  anchorImageUri: string | null;      // Custom photo path
  anchorVideoUri: string | null;      // Custom video path
  reduceMotion: boolean;
  largerText: boolean;
  highContrast: boolean;
}

// Energy State (ephemeral, not persisted long-term)
interface EnergyState {
  currentLevel: number;               // 0-1 (slider position)
  lastUpdated: string;                // ISO timestamp
}

// Usage Analytics (optional, local only)
interface UsageLog {
  date: string;
  opens: number;
  ideasViewed: number;
  avgEnergyLevel: number;
}
```

### Storage Keys

```typescript
const STORAGE_KEYS = {
  USER_SETTINGS: 'user_settings',
  ENERGY_STATE: 'energy_state',
  USAGE_LOG: 'usage_log',
  LAST_IDEA_INDEX: 'last_idea_index',
} as const;
```

### Storage Utility

```typescript
// utils/storage.ts
import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV();

export const storageUtils = {
  get: <T>(key: string): T | null => {
    const value = storage.getString(key);
    return value ? JSON.parse(value) : null;
  },
  
  set: <T>(key: string, value: T): void => {
    storage.set(key, JSON.stringify(value));
  },
  
  delete: (key: string): void => {
    storage.delete(key);
  },
};
```

---

## State Management

### Zustand Store Pattern

```typescript
// stores/settingsStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '../utils/storage';

interface SettingsState {
  name: string;
  hasCompletedOnboarding: boolean;
  anchorImageUri: string | null;
  reduceMotion: boolean;
  
  // Actions
  setName: (name: string) => void;
  setAnchorImage: (uri: string) => void;
  completeOnboarding: () => void;
  toggleReduceMotion: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      name: '',
      hasCompletedOnboarding: false,
      anchorImageUri: null,
      reduceMotion: false,
      
      setName: (name) => set({ name }),
      setAnchorImage: (uri) => set({ anchorImageUri: uri }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      toggleReduceMotion: () => set((state) => ({ 
        reduceMotion: !state.reduceMotion 
      })),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => storage.getString(name) ?? null,
        setItem: (name, value) => storage.set(name, value),
        removeItem: (name) => storage.delete(name),
      })),
    }
  )
);
```

### Energy Store

```typescript
// stores/energyStore.ts
import { create } from 'zustand';

type EnergyState = 'resting' | 'warming' | 'glowing';

interface EnergyStoreState {
  level: number;                    // 0-1 continuous
  state: EnergyState;               // Derived category
  
  setLevel: (level: number) => void;
}

const getStateFromLevel = (level: number): EnergyState => {
  if (level < 0.33) return 'resting';
  if (level < 0.66) return 'warming';
  return 'glowing';
};

export const useEnergyStore = create<EnergyStoreState>((set) => ({
  level: 0.5,
  state: 'warming',
  
  setLevel: (level) => set({ 
    level, 
    state: getStateFromLevel(level) 
  }),
}));
```

---

## Ideas System

### Ideas Data Structure

```typescript
// data/ideas.ts
export interface Idea {
  id: string;
  validation: string;
  title: string;
  content: string;
  energyState: 'resting' | 'warming' | 'glowing';
}

export const ideas: Idea[] = [
  // Resting (Low Energy)
  {
    id: 'resting-1',
    validation: "Running on empty is exhausting. You're still showing up — that matters.",
    title: "Feel your feet on the floor",
    content: "Name 5 things you can see. 4 you can touch. 3 you can hear. This tells your body it's safe.",
    energyState: 'resting',
  },
  // ... 15 more ideas
];

export const getIdeasForState = (state: EnergyState): Idea[] => {
  return ideas.filter(idea => idea.energyState === state);
};

export const getRandomIdea = (state: EnergyState): Idea => {
  const stateIdeas = getIdeasForState(state);
  return stateIdeas[Math.floor(Math.random() * stateIdeas.length)];
};
```

### useIdeas Hook

```typescript
// hooks/useIdeas.ts
import { useState, useCallback } from 'react';
import { useEnergyStore } from '../stores/energyStore';
import { getRandomIdea, Idea } from '../data/ideas';

export const useIdeas = () => {
  const [currentIdea, setCurrentIdea] = useState<Idea | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const energyState = useEnergyStore((state) => state.state);
  
  const showIdea = useCallback(() => {
    const idea = getRandomIdea(energyState);
    setCurrentIdea(idea);
    setIsVisible(true);
  }, [energyState]);
  
  const showAnother = useCallback(() => {
    const idea = getRandomIdea(energyState);
    setCurrentIdea(idea);
  }, [energyState]);
  
  const dismiss = useCallback(() => {
    setIsVisible(false);
  }, []);
  
  return {
    currentIdea,
    isVisible,
    showIdea,
    showAnother,
    dismiss,
  };
};
```

---

## Theme System

### Color Tokens

```typescript
// theme/colors.ts
export const colors = {
  // Energy States (Sunset Gradient)
  energy: {
    resting: '#6B5B7A',     // Twilight Purple
    warming: '#C4A4A4',     // Dusty Rose
    glowing: '#E8C47C',     // Golden Amber
  },
  
  // Backgrounds
  bg: {
    primary: '#FAF8F5',     // Warm Cream
    surface: '#E8E4EC',     // Muted Lavender
  },
  
  // Text
  text: {
    primary: '#3D3A38',     // Warm Charcoal
    secondary: 'rgba(61, 58, 56, 0.7)',
    muted: 'rgba(61, 58, 56, 0.5)',
  },
  
  // Utilities
  white: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.4)',
};

// Get tint color based on energy level (0-1)
export const getEnergyTint = (level: number): string => {
  if (level < 0.33) return colors.energy.resting;
  if (level < 0.66) return colors.energy.warming;
  return colors.energy.glowing;
};
```

### Typography

```typescript
// theme/typography.ts
export const typography = {
  fontFamily: {
    regular: 'Poppins_400Regular',
    medium: 'Poppins_500Medium',
    semibold: 'Poppins_600SemiBold',
  },
  
  sizes: {
    affirmation: 28,
    title: 20,
    body: 16,
    idea: 16,
    caption: 14,
    small: 12,
  },
  
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.6,
  },
};
```

### Spacing

```typescript
// theme/spacing.ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 24,
  xl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 16,
  lg: 24,
  full: 9999,
};
```

---

## Component Architecture

### Anchor Screen

```typescript
// app/index.tsx (Anchor Screen)
import { View, StyleSheet } from 'react-native';
import { AnchorImage } from '../components/anchor/AnchorImage';
import { Affirmation } from '../components/anchor/Affirmation';
import { EnergySlider } from '../components/anchor/EnergySlider';
import { IdeaButton } from '../components/anchor/IdeaButton';
import { IdeaOverlay } from '../components/ideas/IdeaOverlay';
import { useIdeas } from '../hooks/useIdeas';

export default function AnchorScreen() {
  const { currentIdea, isVisible, showIdea, showAnother, dismiss } = useIdeas();
  
  return (
    <View style={styles.container}>
      <AnchorImage />
      <Affirmation />
      <EnergySlider />
      <IdeaButton onPress={showIdea} />
      
      <IdeaOverlay
        idea={currentIdea}
        visible={isVisible}
        onAnother={showAnother}
        onDismiss={dismiss}
      />
    </View>
  );
}
```

### Idea Card Component

```typescript
// components/ideas/IdeaCard.tsx
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { Idea } from '../../data/ideas';
import { Button } from '../ui/Button';

interface IdeaCardProps {
  idea: Idea;
  onAnother: () => void;
  onDismiss: () => void;
}

export function IdeaCard({ idea, onAnother, onDismiss }: IdeaCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.validation}>{idea.validation}</Text>
      <Text style={styles.title}>{idea.title}</Text>
      <Text style={styles.content}>{idea.content}</Text>
      
      <View style={styles.actions}>
        <Button 
          variant="secondary" 
          onPress={onAnother}
        >
          Something else
        </Button>
        <Button 
          variant="primary" 
          onPress={onDismiss}
        >
          That helps
        </Button>
      </View>
    </View>
  );
}
```

---

## Performance Considerations

### App Startup

```typescript
// Optimize for <2 second load
// 1. Minimize bundle size
// 2. Preload fonts during splash
// 3. Keep Anchor Screen minimal

// app.json
{
  "expo": {
    "splash": {
      "backgroundColor": "#FAF8F5",
      "resizeMode": "contain"
    },
    "plugins": [
      [
        "expo-font",
        {
          "fonts": ["./assets/fonts/Poppins"]
        }
      ]
    ]
  }
}
```

### Image Optimization

```typescript
// Use expo-image for better performance
import { Image } from 'expo-image';

<Image
  source={anchorImageUri || require('../assets/images/default-anchor.jpg')}
  style={styles.anchorImage}
  contentFit="cover"
  transition={300}
  cachePolicy="memory-disk"
/>
```

### Animation Performance

```typescript
// Use Reanimated for smooth 60fps animations
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  withTiming,
} from 'react-native-reanimated';

// Breathing pulse animation
const pulseStyle = useAnimatedStyle(() => ({
  transform: [{ 
    scale: withSpring(isPulsing ? 1.02 : 1.0, {
      damping: 10,
      stiffness: 100,
    })
  }],
}));
```

---

## Offline-First Design

### Core Principle

All MVP features work without network:

| Feature | Data Source | Network Required |
|---------|-------------|------------------|
| Anchor Screen | Local storage | No |
| Energy Slider | Local state | No |
| Ideas Library | Bundled JSON | No |
| Affirmations | Bundled JSON | No |
| Settings | Local storage | No |
| Custom Photos | Local filesystem | No |

### Network Requirements (Phase 2+)

| Feature | Network Use |
|---------|-------------|
| Family Sticky Notes | Cloud sync |
| Companion Mode | Local network cast |
| Voice Transcription | Speech-to-text API |

---

## Security & Privacy

### Data Classification

| Data Type | Storage | Encryption | Shared |
|-----------|---------|------------|--------|
| User name | MMKV | Device encryption | No |
| Energy logs | MMKV | Device encryption | No |
| Custom photos | Filesystem | Device encryption | No |
| Voice audio | RAM only | N/A (deleted) | No |

### Privacy Implementation

```typescript
// Voice recording (Phase 2) - transcribe and delete
const transcribeAndDelete = async (audioUri: string) => {
  try {
    const transcript = await speechToText(audioUri);
    // Immediately delete audio file
    await FileSystem.deleteAsync(audioUri);
    return transcript;
  } catch (error) {
    // Ensure deletion even on error
    await FileSystem.deleteAsync(audioUri);
    throw error;
  }
};
```

---

## Development Setup

### Initial Setup

```bash
# Create new Expo project
npx create-expo-app gentle_loop -t expo-template-blank-typescript

# Install core dependencies
npx expo install react-native-mmkv
npx expo install react-native-reanimated
npx expo install expo-image
npx expo install expo-font
npx expo install react-native-paper

# Install Zustand
npm install zustand

# Install navigation
npx expo install expo-router
```

### Package.json Scripts

```json
{
  "scripts": {
    "start": "expo start",
    "ios": "expo run:ios",
    "android": "expo run:android",
    "build:ios": "eas build --platform ios",
    "build:android": "eas build --platform android",
    "lint": "eslint . --ext .ts,.tsx",
    "typecheck": "tsc --noEmit"
  }
}
```

### Environment Setup

```typescript
// app.config.ts
export default {
  expo: {
    name: 'gentle_loop',
    slug: 'gentle-loop',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      backgroundColor: '#FAF8F5',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.gentleloop.app',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#FAF8F5',
      },
      package: 'com.gentleloop.app',
    },
  },
};
```

---

## Testing Strategy

### Unit Tests

```typescript
// __tests__/ideas.test.ts
import { getIdeasForState, getRandomIdea } from '../data/ideas';

describe('Ideas System', () => {
  it('returns ideas for resting state', () => {
    const ideas = getIdeasForState('resting');
    expect(ideas.length).toBeGreaterThan(0);
    ideas.forEach(idea => {
      expect(idea.energyState).toBe('resting');
    });
  });
  
  it('returns random idea within state', () => {
    const idea = getRandomIdea('warming');
    expect(idea.energyState).toBe('warming');
  });
});
```

### Component Tests

```typescript
// __tests__/IdeaCard.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { IdeaCard } from '../components/ideas/IdeaCard';

const mockIdea = {
  id: 'test-1',
  validation: 'Test validation',
  title: 'Test title',
  content: 'Test content',
  energyState: 'resting' as const,
};

describe('IdeaCard', () => {
  it('renders idea content', () => {
    const { getByText } = render(
      <IdeaCard idea={mockIdea} onAnother={() => {}} onDismiss={() => {}} />
    );
    
    expect(getByText('Test title')).toBeTruthy();
    expect(getByText('Test content')).toBeTruthy();
  });
  
  it('calls onDismiss when "That helps" pressed', () => {
    const onDismiss = jest.fn();
    const { getByText } = render(
      <IdeaCard idea={mockIdea} onAnother={() => {}} onDismiss={onDismiss} />
    );
    
    fireEvent.press(getByText('That helps'));
    expect(onDismiss).toHaveBeenCalled();
  });
});
```

---

## Build & Deployment

### EAS Configuration

```json
// eas.json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

### Build Commands

```bash
# Development build (with dev client)
eas build --profile development --platform ios

# Preview build (internal testing)
eas build --profile preview --platform all

# Production build
eas build --profile production --platform all

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

---

## MVP Development Phases

### Phase 1: Foundation (Week 1)
- [ ] Project setup with Expo
- [ ] Theme system (colors, typography, spacing)
- [ ] Basic navigation structure
- [ ] MMKV storage setup
- [ ] Zustand stores

### Phase 2: Anchor Screen (Week 2)
- [ ] Anchor image component with breathing pulse
- [ ] Affirmation display
- [ ] Energy slider with gradient
- [ ] Screen tinting based on energy
- [ ] Header icons

### Phase 3: Ideas System (Week 3)
- [ ] Ideas data structure
- [ ] Idea card component
- [ ] Idea overlay with slide-up animation
- [ ] "Something else" / "That helps" actions
- [ ] State-based idea filtering

### Phase 4: Onboarding (Week 4)
- [ ] Welcome screen
- [ ] How it works screen
- [ ] Name input screen
- [ ] Anchor selection screen
- [ ] Onboarding completion flow

### Phase 5: Settings & Polish (Week 5)
- [ ] Settings screen
- [ ] Custom photo upload
- [ ] Accessibility toggles
- [ ] Crisis detection (5s timeout)
- [ ] Final polish and testing

---

## Next Steps

1. **Set up project** — Initialize Expo project with dependencies
2. **Build theme system** — Implement color, typography, and spacing tokens
3. **Create Anchor Screen** — Core UI without ideas system
4. **Add Ideas** — Idea card and overlay components
5. **Complete Onboarding** — Full onboarding flow
6. **Test with family** — Get real feedback from target users
