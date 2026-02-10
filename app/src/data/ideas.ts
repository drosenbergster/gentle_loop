/**
 * Ideas Library
 *
 * Evidence-based supportive ideas matched to energy states.
 * Each idea validates the caregiver's experience before offering guidance.
 * FR26: 16 curated ideas across energy states.
 * FM-10: Pool reshuffles when all ideas for current level have been shown.
 */

import type { EnergyLevel } from '../theme/colors';

export interface Idea {
  id: string;
  validation: string;
  title: string;
  content: string;
}

export type IdeasByLevel = Record<EnergyLevel, Idea[]>;

export const ideas: IdeasByLevel = {
  // When You're Running Low (4 ideas)
  running_low: [
    {
      id: 'rl-1',
      validation: "Running on empty is exhausting. You're still showing up — that matters.",
      title: 'Feel your feet on the floor',
      content:
        "Name 5 things you can see. 4 you can touch. 3 you can hear. This tells your body it's safe.",
    },
    {
      id: 'rl-2',
      validation: "Low energy days are part of this. You're allowed to rest.",
      title: 'Say it out loud',
      content:
        "\"I'm doing the best I can. I can't control everything.\" Your brain believes what it hears you say.",
    },
    {
      id: 'rl-3',
      validation: "Your body is carrying stress. Let's help it release.",
      title: 'Try this breath',
      content:
        "In for 4. Out for 6. The longer exhale tells your body it's safe. Do it three times.",
    },
    {
      id: 'rl-4',
      validation: "You don't have to fix this moment. Just be present in it.",
      title: 'Find a familiar scent',
      content:
        'Coffee, a lotion you love, fresh air. Something that brings you back to yourself, even for a moment.',
    },
  ],

  // When You're Holding Steady (6 ideas)
  holding_steady: [
    {
      id: 'hs-1',
      validation: "You're holding steady. That takes real strength.",
      title: 'Feelings before fixing',
      content:
        "Try \"I can see you're upset\" before solving anything. Validation opens doors. Correction closes them.",
    },
    {
      id: 'hs-2',
      validation: 'Loops happen. You have more options than you think.',
      title: 'Change the scene',
      content:
        "If they're stuck in a loop, move somewhere else. \"Let's go look out the window.\" Movement breaks thought patterns.",
    },
    {
      id: 'hs-3',
      validation: 'Words can be hard for both of you right now.',
      title: 'Show instead of tell',
      content:
        "Hold up the mug instead of saying \"coffee.\" Point to the chair. Visuals often land when words don't.",
    },
    {
      id: 'hs-4',
      validation: 'Sudden changes usually have a reason.',
      title: 'Check the basics',
      content:
        'Hungry? Thirsty? In pain? Need bathroom? Too hot or cold? Behavior is often trying to tell you something.',
    },
    {
      id: 'hs-5',
      validation: 'Small adjustments can shift everything.',
      title: 'Lower and slower',
      content:
        'Speak slower and lower. Even well-meaning loud voices can increase stress. A calm, low tone signals safety.',
    },
    {
      id: 'hs-6',
      validation: 'Simplicity is a gift you can give right now.',
      title: 'One question at a time',
      content:
        "\"Are you cold?\" works. \"Do you want a sweater or blanket or should I turn up the heat?\" overwhelms.",
    },
  ],

  // When You've Got This (6 ideas)
  ive_got_this: [
    {
      id: 'ig-1',
      validation: "You've got some capacity right now. That's a gift.",
      title: 'Set up the space',
      content:
        'Good moment to reduce clutter, label things with words AND pictures. A calmer space means fewer hard moments.',
    },
    {
      id: 'ig-2',
      validation: 'Predictability is one of the most powerful things you can offer.',
      title: 'Same time, same way',
      content:
        "Routines reduce anxiety. Write down what works and repeat it. The brain relaxes when it can predict what's coming.",
    },
    {
      id: 'ig-3',
      validation: "What you're learning is valuable. Capture it.",
      title: "Note what's working",
      content:
        'What music helped? What phrase landed? What triggered the hard moment? Future you will thank present you.',
    },
    {
      id: 'ig-4',
      validation: "Sustainability requires support. This isn't optional.",
      title: 'When did you last ask for help?',
      content:
        'Even 2 hours away helps you show up better. Who could you reach out to today?',
    },
    {
      id: 'ig-5',
      validation: "Connection doesn't require words.",
      title: 'Try a photo or song',
      content:
        "Familiar music can shift the mood even when words don't land. The feeling remains when the memory doesn't.",
    },
    {
      id: 'ig-6',
      validation: 'Small preparations have outsized impact.',
      title: 'Set up tomorrow tonight',
      content:
        "Lay out clothes. Prep breakfast. Small things now mean fewer decisions when you're tired.",
    },
  ],
};

/** Total idea count across all levels */
export const TOTAL_IDEAS_COUNT = Object.values(ideas).flat().length;

/**
 * Fisher-Yates shuffle (immutable — returns new array)
 */
function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Shuffled idea pool that cycles through all ideas for a given energy level.
 * FM-10: When all ideas have been shown, pool reshuffles and restarts.
 */
export class IdeaCycler {
  private pool: Idea[] = [];
  private index: number = 0;
  private currentLevel: EnergyLevel;

  constructor(level: EnergyLevel) {
    this.currentLevel = level;
    this.reshuffle(level);
  }

  private reshuffle(level: EnergyLevel) {
    this.pool = shuffle(ideas[level]);
    this.index = 0;
    this.currentLevel = level;
  }

  /** Get the next idea. Reshuffles when pool is exhausted or level changes. */
  next(level: EnergyLevel): Idea {
    if (level !== this.currentLevel || this.index >= this.pool.length) {
      this.reshuffle(level);
    }
    const idea = this.pool[this.index];
    this.index++;
    return idea;
  }

  /** Get the current pool size for the given level */
  poolSize(level: EnergyLevel): number {
    return ideas[level].length;
  }
}

/**
 * Get a random idea for the given energy level
 */
export function getRandomIdea(level: EnergyLevel): Idea {
  const levelIdeas = ideas[level];
  const randomIndex = Math.floor(Math.random() * levelIdeas.length);
  return levelIdeas[randomIndex];
}

/**
 * Get a random idea that's different from the last one shown
 */
export function getNextIdea(level: EnergyLevel, lastIdeaId?: string): Idea {
  const levelIdeas = ideas[level];

  if (!lastIdeaId || levelIdeas.length <= 1) {
    return getRandomIdea(level);
  }

  const availableIdeas = levelIdeas.filter((idea) => idea.id !== lastIdeaId);
  const randomIndex = Math.floor(Math.random() * availableIdeas.length);
  return availableIdeas[randomIndex];
}
