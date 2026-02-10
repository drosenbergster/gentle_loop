/**
 * Affirmations
 *
 * Grounded, honest messages shown on the Anchor Screen.
 * Tone: like a friend who's been through it — warm, direct, not preachy.
 * Mix of reflective observations and concrete micro-actions.
 */

import type { EnergyLevel } from '../theme/colors';

export interface Affirmation {
  id: string;
  text: string;
  category: 'universal' | EnergyLevel;
}

export const affirmations: Affirmation[] = [
  // ─── Universal (any state) ───
  { id: 'u1', text: "This moment is temporary. It won't always feel like this. The next one is already on its way.", category: 'universal' },
  { id: 'u2', text: "You're still here, still showing up. That matters more than you probably realize right now.", category: 'universal' },
  { id: 'u3', text: "You don't have to figure it all out right now. Just this next moment. That's the only one that needs you.", category: 'universal' },
  { id: 'u4', text: "This loop will come back around. Whatever you missed or didn't get right, you'll have another chance at it.", category: 'universal' },
  { id: 'u5', text: 'One slow breath can shift something. Not everything, but enough to take the next step.', category: 'universal' },
  { id: 'u6', text: 'Try putting your hand on something cool — a counter, a window. Feel it for ten seconds. Small reset.', category: 'universal' },
  { id: 'u7', text: "Being present is the whole thing. You don't have to fix it or make it better. Just being here is enough.", category: 'universal' },
  { id: 'u8', text: "Taking care of yourself isn't time away from them. It's what makes it possible to keep going tomorrow.", category: 'universal' },
  { id: 'u9', text: "You're not failing. This is genuinely hard, and you're doing it anyway.", category: 'universal' },
  { id: 'u10', text: 'Forgive the last hour. Let it go. You get to start this one fresh.', category: 'universal' },
  { id: 'u11', text: "The guilt you feel? It means you care. But it's not always telling you the truth about how you're doing.", category: 'universal' },
  { id: 'u12', text: "Drop your shoulders. Unclench your jaw. You're probably holding more tension than you realize right now.", category: 'universal' },
  { id: 'u13', text: 'Nobody is grading you on this. There is no perfect version of today that you\'re falling short of.', category: 'universal' },
  { id: 'u14', text: "Some moments are just about getting through. That's not a lesser kind of caregiving — it's the realest kind.", category: 'universal' },
  { id: 'u15', text: "They don't need you to be perfect. They need you here. And you are.", category: 'universal' },
  { id: 'u16', text: "Grief shows up at strange times. Not just the big moments — sometimes in the middle of making lunch. That's normal.", category: 'universal' },
  { id: 'u17', text: 'Look out a window for a minute. Just look. Let your eyes focus on something far away.', category: 'universal' },
  { id: 'u18', text: "Your patience has limits. Hitting the wall doesn't mean you've failed — it means you've been going for a while.", category: 'universal' },
  { id: 'u19', text: "Think about where you were six months ago. You know more now. You're doing more than you could then.", category: 'universal' },
  { id: 'u20', text: "Pour yourself a glass of water. Drink the whole thing. That's a real thing you can do for yourself right now.", category: 'universal' },

  // ─── Running low ───
  { id: 'r1', text: "You've already done enough today. If the rest of the day is just being there, that counts.", category: 'running_low' },
  { id: 'r2', text: "Rest now so you can show up later. Stepping back isn't giving up — it's how you come back.", category: 'running_low' },
  { id: 'r3', text: "You're allowed to stop. This loop will come back around, and you'll meet it with more when you're ready.", category: 'running_low' },
  { id: 'r4', text: "Stand up and stretch your hands open wide. Hold it for five seconds. Shake them out. That's something.", category: 'running_low' },
  { id: 'r5', text: 'Doing less today doesn\'t mean you care less. Some days just take more from you.', category: 'running_low' },
  { id: 'r6', text: "You don't have to earn rest by being exhausted enough. You can just rest.", category: 'running_low' },
  { id: 'r7', text: 'Go splash cold water on your wrists. Thirty seconds. It actually helps.', category: 'running_low' },
  { id: 'r8', text: 'When everything feels heavy, just do the next small thing. Not the whole list. Just the one.', category: 'running_low' },
  { id: 'r9', text: "You've been running on less than you need for a while now. Noticing that is the first step.", category: 'running_low' },
  { id: 'r10', text: "The world won't fall apart if you sit down for five minutes. Let time hold things for a moment.", category: 'running_low' },

  // ─── Holding steady ───
  { id: 'w1', text: "Steady is its own kind of strong. You don't have to be having a great day to be doing a good job.", category: 'holding_steady' },
  { id: 'w2', text: 'Not everything needs to be resolved right now. Some things can just sit for a while.', category: 'holding_steady' },
  { id: 'w3', text: "You're probably doing better than you think. Hard days make it difficult to see clearly.", category: 'holding_steady' },
  { id: 'w4', text: "Accept what this moment is, not what you wish it was. There's something to be gained from just letting it be.", category: 'holding_steady' },
  { id: 'w5', text: "Small steps still count. You don't need a big move today.", category: 'holding_steady' },
  { id: 'w6', text: 'Try changing the light in the room. Open a curtain, turn off a harsh overhead. The space affects both of you.', category: 'holding_steady' },
  { id: 'w7', text: 'Not every day needs a breakthrough. Some days are just about holding the line.', category: 'holding_steady' },
  { id: 'w8', text: "Put on a song you both know. Not to fix anything — just to change the air in the room.", category: 'holding_steady' },
  { id: 'w9', text: "You're balancing more than anyone should have to. The fact that things are holding together is because of you.", category: 'holding_steady' },
  { id: 'w10', text: 'If you can step outside for sixty seconds, do it. Just the air on your face. Then come back.', category: 'holding_steady' },

  // ─── I've got this ───
  { id: 'g1', text: "A good day doesn't have to be a perfect day. Take what's here without putting pressure on it.", category: 'ive_got_this' },
  { id: 'g2', text: "You've got some energy right now. Use it to enjoy the space, not to push harder.", category: 'ive_got_this' },
  { id: 'g3', text: 'Today has room in it. Do something you\'ve been putting off — or do nothing at all. Both are fine.', category: 'ive_got_this' },
  { id: 'g4', text: 'This feeling will cycle back. When the hard days come, remember that this one existed too.', category: 'ive_got_this' },
  { id: 'g5', text: "Don't rush through a good moment. Be here for it.", category: 'ive_got_this' },
  { id: 'g6', text: "Good moments don't cancel out hard ones, and hard ones don't cancel out these. Both get to be true.", category: 'ive_got_this' },
  { id: 'g7', text: "If something made you smile today, hold onto that. You're allowed to feel good in the middle of something hard.", category: 'ive_got_this' },
  { id: 'g8', text: 'Call someone. Not about caregiving — about anything else. Let yourself be a person for ten minutes.', category: 'ive_got_this' },
  { id: 'g9', text: "This is what it looks like when things are working. It's quiet, but it's real.", category: 'ive_got_this' },
  { id: 'g10', text: 'Notice your body right now. Your shoulders, your jaw, your hands. Remember what this feels like.', category: 'ive_got_this' },
];

/**
 * Get a random affirmation.
 * Includes all universal + the preferred energy category.
 */
export function getRandomAffirmation(preferCategory?: Affirmation['category']): Affirmation {
  let pool = affirmations;

  if (preferCategory) {
    pool = affirmations.filter(
      (a) => a.category === 'universal' || a.category === preferCategory,
    );
  }

  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}
