/**
 * Affirmations
 * 
 * Gentle, rotating messages shown on the Anchor Screen.
 * Designed to validate and support without being preachy.
 */

export interface Affirmation {
  id: string;
  text: string;
  category: 'universal' | 'resting' | 'warming' | 'glowing';
}

export const affirmations: Affirmation[] = [
  // Universal (Any State)
  { id: 'u1', text: "You're doing something hard. That's worth acknowledging.", category: 'universal' },
  { id: 'u2', text: "You're still here. That matters.", category: 'universal' },
  { id: 'u3', text: 'This moment will pass.', category: 'universal' },
  { id: 'u4', text: "You don't have to have all the answers.", category: 'universal' },
  { id: 'u5', text: 'One thing at a time.', category: 'universal' },

  // When Running on Empty
  { id: 'r1', text: "It's okay to rest.", category: 'resting' },
  { id: 'r2', text: 'Low energy days are part of this.', category: 'resting' },
  { id: 'r3', text: "You're allowed to stop.", category: 'resting' },
  { id: 'r4', text: 'Rest is not giving up.', category: 'resting' },
  { id: 'r5', text: "You've already done enough today.", category: 'resting' },

  // When Holding Steady
  { id: 'w1', text: "You're holding steady. That takes strength.", category: 'warming' },
  { id: 'w2', text: 'One moment at a time.', category: 'warming' },
  { id: 'w3', text: "You're doing better than you think.", category: 'warming' },
  { id: 'w4', text: "This is hard. And you're doing it.", category: 'warming' },
  { id: 'w5', text: 'Small steps still count.', category: 'warming' },

  // When Glowing
  { id: 'g1', text: "You've got some capacity today. Use it wisely.", category: 'glowing' },
  { id: 'g2', text: 'Good energy is a gift. Receive it.', category: 'glowing' },
  { id: 'g3', text: 'Today has possibilities.', category: 'glowing' },
  { id: 'g4', text: "There's space to breathe right now.", category: 'glowing' },
  { id: 'g5', text: 'This is a good moment.', category: 'glowing' },
];

// Calm breathing prompts (used on anchor screen)
export const calmPrompts = [
  'Take a breath',
  'Exhale longer than you inhale',
  "It's okay to pause",
  'You are here now',
  'This moment is enough',
];

/**
 * Get a random affirmation
 * Can optionally filter by category or prefer certain categories
 */
export function getRandomAffirmation(preferCategory?: Affirmation['category']): Affirmation {
  let pool = affirmations;
  
  if (preferCategory) {
    // Include all universal + the preferred category
    pool = affirmations.filter(
      a => a.category === 'universal' || a.category === preferCategory
    );
  }
  
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

/**
 * Get a random calm prompt for the breathing state
 */
export function getRandomCalmPrompt(): string {
  const randomIndex = Math.floor(Math.random() * calmPrompts.length);
  return calmPrompts[randomIndex];
}
