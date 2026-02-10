/**
 * Toolbox Types
 *
 * "That worked" suggestions saved by the caregiver.
 */

export interface ToolboxEntry {
  /** Unique identifier (UUID) */
  id: string;
  /** The suggestion text that was saved */
  suggestionText: string;
  /** ISO 8601 timestamp when the entry was saved */
  savedAt: string;
}
