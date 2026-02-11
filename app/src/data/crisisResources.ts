/**
 * Crisis Resources
 *
 * Emergency contact information surfaced when the AI detects a crisis
 * (response_type === 'crisis') or when client-side keyword pre-screening
 * identifies immediate danger.
 *
 * These resources are always available offline — they are bundled with the app,
 * not fetched from a server.
 */

export interface CrisisResource {
  id: string;
  /** Display name of the resource */
  name: string;
  /** Phone number (dialable format) */
  phone: string;
  /** Phone number (display format) */
  phoneDisplay: string;
  /** Brief description shown to the caregiver */
  description: string;
  /** When this resource is most relevant */
  contexts: CrisisContext[];
  /** Whether a call button should be prominently displayed */
  showCallButton: boolean;
  /** Optional: text/chat alternative */
  textOption?: string;
  /** Optional: website for more information */
  website?: string;
  /** Hours of availability */
  availability: string;
}

export type CrisisContext =
  | 'physical_danger'     // Someone is being hurt or in physical danger
  | 'medical_emergency'   // Fall, choking, injury, medical event
  | 'caregiver_self_harm' // Caregiver expressing suicidal ideation or self-harm
  | 'caregiver_harming'   // Caregiver afraid of hurting care recipient
  | 'panic_attack'        // Caregiver having a panic attack
  | 'general_crisis';     // Catch-all for other crisis situations

/**
 * Primary crisis resources — shown prominently when a crisis is detected.
 * Order matters: most urgent/universal first.
 */
export const crisisResources: CrisisResource[] = [
  {
    id: 'emergency-911',
    name: 'Emergency Services',
    phone: 'tel:911',
    phoneDisplay: '911',
    description: 'For immediate danger, injury, or medical emergency.',
    contexts: ['physical_danger', 'medical_emergency'],
    showCallButton: true,
    availability: '24/7',
  },
  {
    id: 'suicide-crisis-988',
    name: '988 Suicide & Crisis Lifeline',
    phone: 'tel:988',
    phoneDisplay: '988',
    description: 'Free, confidential support for people in distress. Call or text.',
    contexts: ['caregiver_self_harm', 'caregiver_harming', 'general_crisis'],
    showCallButton: true,
    textOption: 'Text 988',
    website: 'https://988lifeline.org',
    availability: '24/7',
  },
  {
    id: 'alzheimers-helpline',
    name: "Alzheimer's Association 24/7 Helpline",
    phone: 'tel:18002723900',
    phoneDisplay: '800-272-3900',
    description:
      'Specialists who understand dementia caregiving. For guidance, support, and crisis help.',
    contexts: [
      'physical_danger',
      'caregiver_self_harm',
      'caregiver_harming',
      'panic_attack',
      'general_crisis',
    ],
    showCallButton: true,
    website: 'https://www.alz.org/help-support/resources/helpline',
    availability: '24/7, 365 days a year',
  },
  {
    id: 'crisis-text-line',
    name: 'Crisis Text Line',
    phone: 'sms:741741',
    phoneDisplay: 'Text HOME to 741741',
    description: 'Free crisis counseling via text message.',
    contexts: ['caregiver_self_harm', 'caregiver_harming', 'panic_attack', 'general_crisis'],
    showCallButton: false,
    textOption: 'Text HOME to 741741',
    website: 'https://www.crisistextline.org',
    availability: '24/7',
  },
];

/**
 * Get crisis resources relevant to a specific crisis context.
 * Returns resources ordered by relevance (most relevant first).
 */
export function getResourcesForContext(context: CrisisContext): CrisisResource[] {
  return crisisResources.filter((r) => r.contexts.includes(context));
}

/**
 * Get all crisis resources — used when the specific crisis type is unknown
 * or when displaying a general crisis resources panel.
 */
export function getAllCrisisResources(): CrisisResource[] {
  return crisisResources;
}

/**
 * Infer the most likely crisis context from keywords in the caregiver's message.
 * Used by client-side pre-screening to determine which resources to show.
 * Returns null if no crisis context is detected.
 */
export function inferCrisisContext(message: string): CrisisContext | null {
  const lower = message.toLowerCase();

  // Physical danger keywords (care recipient or caregiver)
  const physicalDangerPatterns = [
    /\bhit(ting|s)?\s+(me|him|her|them)\b/,
    /\bpush(ing|ed)?\s+(me|him|her|them)\b/,
    /\bthrow(ing|s|n)?\b/,
    /\bbit(e[sd]?|ing)\b/,
    /\bscratchi?ng\b/,
    /\bgrab(bing|bed|s)?\b/,
    /\bkick(ing|ed|s)?\b/,
    /\bchok(e[sd]?|ing)\b/,
    /\bstrangl/,
    /\bweapon\b/,
    /\bknife\b/,
    /\bbleed(ing)?\b/,
    /\bblood\b(?!\s+(pressure|sugar|test|work|draw))/,
  ];

  // Medical emergency keywords
  const medicalEmergencyPatterns = [
    /\bfell\b.*\b(head|stair|floor|down)\b/,
    /\bfall(en|ing)?\b.*\b(hit|head|stair|hurt|injur)\b/,
    /\bhit\s+(their|his|her)\s+head\b/,
    /\bnot\s+(moving|breathing|responding|conscious)\b/,
    /\bunconscious\b/,
    /\bcan'?t\s+breathe?\b/,
    /\bchok(e[sd]?|ing)\b/,
    /\bseizure\b/,
    /\bstroke\b/,
    /\bheart\s+attack\b/,
    /\bcollapse[sd]?\b/,
    /\bon\s+the\s+(floor|ground)\b/,
  ];

  // Caregiver self-harm / suicidal ideation
  const selfHarmPatterns = [
    /\b(want|wanna|going)\s+to\s+(die|end\s+it|kill\s+my)/,
    /\bbetter\s+off\s+dead\b/,
    /\bdon'?t\s+want\s+to\s+(live|be\s+here|exist|go\s+on|keep\s+going)\b/,
    /\bend\s+(it|my\s+life|everything)\b/,
    /\bsuicid/,
    /\bkill\s+my\s*self\b/,
    /\bhurt\s+my\s*self\b/,
    /\bself[- ]?harm/,
    /\bno\s+point\s+(in|to)\s+(any\s+of\s+this|living|going\s+on)\b/,
    /\bwhat'?s?\s+the\s+point\b/,
    /\bcan'?t\s+do\s+this\s+anymore\b.*\b(don'?t|no|nothing|point|why|give\s+up)\b/,
    /\bgive\s+up\s+on\s+everything\b/,
  ];

  // Caregiver fear of harming care recipient
  const caregiverHarmingPatterns = [
    /\bafraid\s+(i'?m?\s+)?(going\s+to|gonna|might|will)\s+(hurt|hit|harm|snap)\b/,
    /\balmost\s+(hit|hurt|slapped|shook|grabbed)\b/,
    /\bcan'?t\s+control\s+(myself|my\s*(self|anger|temper|hands))\b/,
    /\bgoing\s+to\s+(snap|lose\s+it|hurt\s+them)\b/,
    /\bscared\s+(i'?ll|i\s+will|i\s+might|of\s+what\s+i)\b/,
  ];

  // Panic attack keywords
  // Note: patterns use [\w\s']* to allow intervening words (e.g., "chest is so tight", "heart won't stop racing")
  const panicPatterns = [
    /\bpanic\s+attack\b/,
    /\bhaving\s+a\s+panic\b/,
    /\bcan'?t\s+breathe?\b/,
    /\bchest[\w\s']*\b(tight|pain|pressure|hurts?)\b/,
    /\bheart[\w\s']*\b(racing|pounding)\b/,
    /\bheart[\w\s']*\bbeating\s+(fast|hard)\b/,
    /\bshaking\s+(all\s+over|uncontrollabl)/,
    /\bfeel(s?|ing)\s+like\s+(i'?m\s+)?(dying|going\s+crazy|losing\s+(control|my\s+mind))\b/,
    /\bcan'?t\s+stop\s+(shaking|trembling|crying)\b/,
  ];

  // Check in priority order
  for (const pattern of selfHarmPatterns) {
    if (pattern.test(lower)) return 'caregiver_self_harm';
  }

  for (const pattern of caregiverHarmingPatterns) {
    if (pattern.test(lower)) return 'caregiver_harming';
  }

  for (const pattern of medicalEmergencyPatterns) {
    if (pattern.test(lower)) return 'medical_emergency';
  }

  for (const pattern of physicalDangerPatterns) {
    if (pattern.test(lower)) return 'physical_danger';
  }

  for (const pattern of panicPatterns) {
    if (pattern.test(lower)) return 'panic_attack';
  }

  return null;
}
