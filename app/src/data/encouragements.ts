/**
 * "Still With You" Encouragement Messages
 *
 * Story 5.1 / ARCH-18: Shown after 2+ suggestions without "That worked."
 * UFG-7: No toxic positivity. Grounded, honest, acknowledge the difficulty.
 *
 * Selection uses no-consecutive-repeat logic.
 */

export const ENCOURAGEMENT_MESSAGES: readonly string[] = [
  "You're still here. That takes strength.",
  "Every attempt matters, even the ones that don't land.",
  "You haven't given up. That says everything.",
  "Still trying is still caring.",
  "Not every idea will fit. That's okay.",
  "You're doing a hard thing right now.",
  "The fact that you're looking for answers matters.",
  "This is exhausting. And you're still showing up.",
  "Some days, nothing clicks. That doesn't mean you've failed.",
  "You're learning what works in real time. That's not easy.",
];

/** How many suggestions without "That worked" before showing encouragement */
export const ENCOURAGEMENT_THRESHOLD = 2;

/** Auto-fade duration for the encouragement banner (ms) */
export const ENCOURAGEMENT_DISPLAY_MS = 3_500;

/**
 * Pick a message from the pool that isn't the same as the last one shown.
 * ARCH-18: No-consecutive-repeat logic.
 */
export function pickEncouragement(lastShown: string | null): string {
  const pool = lastShown
    ? ENCOURAGEMENT_MESSAGES.filter((m) => m !== lastShown)
    : [...ENCOURAGEMENT_MESSAGES];

  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}
