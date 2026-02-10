/**
 * Text-to-Speech Hook (DISABLED)
 *
 * TTS removed — system voices sound robotic and undermine trust.
 * Hook retained as a no-op so call sites don't need structural changes.
 * Can be re-enabled later with a cloud TTS service for natural-sounding voice.
 */

export interface TTSControls {
  /** No-op — TTS is disabled */
  speak: (text: string) => void;
  /** No-op — TTS is disabled */
  stop: () => void;
}

export function useTTS(): TTSControls {
  return {
    speak: () => {},
    stop: () => {},
  };
}
