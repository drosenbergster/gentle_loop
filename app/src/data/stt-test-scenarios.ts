/**
 * STT Test Scenarios
 *
 * Story 1.1: STT Provider Evaluation Spike
 * 10+ test scenarios representing real caregiver speech patterns.
 * Each scenario has a description, ground truth text, and tags for categorization.
 *
 * Instructions for recording:
 * 1. Open the STT Eval screen (app/stt-eval.tsx) on a physical device
 * 2. For each scenario, type the ground truth text into the "Ground Truth" field
 * 3. Speak the text naturally (not reading robotically) and observe results
 * 4. Note: Some scenarios ask you to simulate conditions (noise, emotion, etc.)
 */

export interface STTTestScenario {
  id: string;
  description: string;
  groundTruth: string;
  tags: string[];
  recordingInstructions: string;
}

export const sttTestScenarios: STTTestScenario[] = [
  // --- Standard speech ---
  {
    id: 'S01',
    description: 'Calm description — clear speech, quiet environment',
    groundTruth:
      "Mom is sitting in her chair but she won't eat her dinner. She keeps pushing the plate away.",
    tags: ['calm', 'clear', 'quiet'],
    recordingInstructions:
      'Speak calmly and clearly in a quiet room, as if describing the situation to a friend.',
  },
  {
    id: 'S02',
    description: 'Medium-length description — multiple sentences',
    groundTruth:
      "Dad has been pacing back and forth for the last twenty minutes. He seems agitated and keeps asking where mom is. I've tried to redirect him but nothing is working.",
    tags: ['calm', 'clear', 'multi-sentence'],
    recordingInstructions:
      'Speak at normal pace. This tests multi-sentence transcription accuracy.',
  },

  // --- Stressed / emotional speech ---
  {
    id: 'S03',
    description: 'Stressed/rushed speech — speaking quickly under pressure',
    groundTruth:
      "She's trying to leave the house again and I can't get her to stop. She's getting really upset.",
    tags: ['stressed', 'rushed', 'emotional'],
    recordingInstructions:
      'Speak quickly as if under time pressure. Slightly breathless. This tests STT with rushed speech (UFG-4).',
  },
  {
    id: 'S04',
    description: 'Emotional/tearful speech — voice breaking',
    groundTruth:
      "I don't know what to do anymore. He doesn't recognize me today and it just breaks my heart.",
    tags: ['emotional', 'tearful', 'voice-breaking'],
    recordingInstructions:
      'Speak with emotion in your voice, as if upset. Pauses and uneven tone are expected.',
  },
  {
    id: 'S05',
    description: 'Breathless/exhausted speech — low energy, trailing off',
    groundTruth:
      "She's been up since three in the morning. I'm so tired. She keeps calling out for her mother.",
    tags: ['breathless', 'exhausted', 'low-energy'],
    recordingInstructions:
      'Speak as if very tired — quiet voice, possibly trailing off at the end. Tests breathless speech (UFG-4).',
  },

  // --- Background noise ---
  {
    id: 'S06',
    description: 'Background TV noise — typical living room',
    groundTruth:
      'He refuses to take his medication. He says the pills are poison.',
    tags: ['noise', 'tv-background'],
    recordingInstructions:
      'Turn on a TV or play audio from a speaker at normal volume while speaking. Tests noise resilience.',
  },
  {
    id: 'S07',
    description: 'Background child noise — kids playing/crying nearby',
    groundTruth:
      'Grandma is getting confused about where the bathroom is again. She almost fell.',
    tags: ['noise', 'child-background'],
    recordingInstructions:
      'Play children playing/crying audio in background, or have someone make noise. Tests child noise (UFG-4).',
  },

  // --- Edge cases ---
  {
    id: 'S08',
    description: 'Very short utterance — under 5 words',
    groundTruth: "He won't stop yelling.",
    tags: ['short', 'edge-case'],
    recordingInstructions:
      'Say only these few words. Tests minimum viable input length.',
  },
  {
    id: 'S09',
    description: 'Long description — near 60 seconds',
    groundTruth:
      "It's been a really difficult day. Mom woke up confused this morning and didn't know where she was. She kept asking for dad, who passed away five years ago. I tried to redirect her with breakfast but she wasn't interested. Then she started getting agitated when I helped her get dressed. She pulled away and said I was a stranger. After lunch she calmed down a bit and we looked at the photo album together which seemed to help. But now she's pacing again and I'm running out of ideas for what to try next.",
    tags: ['long', 'multi-sentence', 'detailed'],
    recordingInstructions:
      'Speak for close to 60 seconds. Tests long-form transcription and the 60-second recording limit.',
  },
  {
    id: 'S10',
    description: 'Whispered speech — trying not to be overheard',
    groundTruth:
      "He's getting aggressive again. I need help calming him down.",
    tags: ['whispered', 'quiet-voice'],
    recordingInstructions:
      'Whisper or speak very quietly, as if not wanting the care recipient to hear. Tests low-volume input.',
  },

  // --- Accent / pronunciation variation ---
  {
    id: 'S11',
    description: 'Accented English — non-native or regional accent',
    groundTruth:
      'My mother keeps wandering to the front door. She thinks she needs to go to work.',
    tags: ['accent', 'pronunciation-variation'],
    recordingInstructions:
      'If you have an accent, speak naturally. If not, ask someone with a different accent to record this. Tests accent handling.',
  },

  // --- Caregiving-specific terminology ---
  {
    id: 'S12',
    description: 'Caregiving terminology — sundowning, redirecting',
    groundTruth:
      "It's sundowning time and she's getting very anxious. I tried redirecting her with music but she keeps asking to go home.",
    tags: ['terminology', 'caregiving-specific'],
    recordingInstructions:
      'Speak clearly. Tests whether STT handles domain-specific terms like "sundowning" and "redirecting".',
  },
];

/**
 * Returns all test scenario IDs for iteration.
 */
export function getScenarioIds(): string[] {
  return sttTestScenarios.map((s) => s.id);
}

/**
 * Returns a scenario by ID.
 */
export function getScenarioById(id: string): STTTestScenario | undefined {
  return sttTestScenarios.find((s) => s.id === id);
}
