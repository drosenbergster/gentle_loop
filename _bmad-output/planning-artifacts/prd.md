---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish']
inputDocuments: ['_bmad-output/brainstorming/brainstorming-session-2026-02-04.md', 'dementia_engagement_app_summary.md', 'person_centered_dementia_care.md', 'caregiving_tools_strategies_dementia.md', 'competitor_analysis_daa_apps.md']
workflowType: 'prd'
classification:
  projectType: 'mobile_app'
  domain: 'healthcare'
  complexity: 'high'
  projectContext: 'greenfield'
---

# Product Requirements Document - gentle_loop

**Author:** Fam
**Date:** 2026-02-04

## Executive Summary

**gentle_loop** is a mobile app for dementia family caregivers. It provides real-time stress regulation tools (Anchor Screen, Battery Check) and contextual caregiving strategies (Nudge Database). Unlike medication trackers or task apps, gentle_loop focuses on the *caregiver's nervous system first*—helping them breathe, reset, and make better decisions under pressure.

**Target Users:** Family caregivers (primary), distant family members (secondary), person with dementia (passive recipient).

**Differentiator:** Caregiver-State Routing. We adjust advice based on the caregiver's energy level, not just the patient's behavior. When the battery is empty, the advice is "Stop" not "Try harder."

## Success Criteria

### User Success (The "Relief" Moment)
*   **The Moment of Regulation (MVP):** A caregiver (Mom/Aunt) opens the app feeling *frustrated*, uses the "Anchor" or "Vent" feature, and reports feeling *calmer* or "reset" within **60 seconds**.
*   **The Quiet Room Metric (Phase 2):** A noticeable reduction in repetitive questioning ("What day is it?") due to the persistent visibility of the **Companion Mode** (TV/Tablet display).
*   **The Connection Loop (Phase 2):** A family member sends a "Sticky Note" (Love/Support) and sees it "Viewed," feeling connected without interrupting the care routine.

### Business/Project Success (Adoption & Retention)
*   **Daily Reliance:** The primary caregiver ("The Doer") opens the app at least **3 times daily** (Morning Intention, Stress Moment, Nightly Win).
*   **Crisis Aversion:** The app is used during at least **50% of high-stress episodes** (Sundowning/Agitation) instead of purely reactive shouting/conflict.
*   **Retention:** Family members continue to use the app after the first month (preventing "abandonment" common in health apps).

### Technical Success (MVP)
*   **Zero-Friction Performance:** The app loads the "Anchor Screen" in under **2 seconds** (critical for stressed users).
*   **Instant Response:** Battery Check and Nudge delivery complete in under **1 second**.
*   **Reliable Local Storage:** Caregiver data persists across app restarts without data loss.

## Product Scope

### MVP - Minimum Viable Product (Phase 1)
*   **Anchor Screen:** Rotating affirmation/family photo for a "Moment of Pause."
*   **Battery Check:** Red/Yellow/Green input to capture caregiver energy level.
*   **Nudge Database:** Hard-coded strategies for common triggers (Refusal, Agitation, Sundowning).
*   **Local Data:** All data stored on device. No login wall required.

### Growth Features (Phase 2)
*   **Companion Mode:** Digital Whiteboard castable to TV/Tablet (Date, Time, Next Event).
*   **Family Sticky Notes:** Asynchronous messages from family to the Anchor Screen (Cloud Sync).
*   **Voice Venting:** Speak frustrations, transcribe instantly, delete audio.

### Expansion Features (Phase 3)
*   **Music Integration:** Spotify/Apple Music for one-tap playlist starts.
*   **Wearable Integration:** Detect high heart rate and auto-prompt the Anchor.
*   **Multi-Home Support:** Scaling to professional caregivers or multiple households.

### Vision (Future)
*   **Predictive AI:** The app predicts a "Sundown" episode based on historical data/weather/time and prompts preventative action *before* it happens.
*   **Community Hive:** Connecting with other "Gentle Loop" families for anonymous emotional support.

## User Journeys

### Journey 1: The "Doer" (Caregiver Battery Check)
**Persona:** Aunt/Mom ("The Doer"). Tired, holding a wet washcloth, frustrated.
*   **Trigger:** Mom is refusing to shower. It's an argument loop.
*   **Action:** Aunt opens the app.
*   **The Anchor:** She sees a photo of Mom smiling. She breathes.
*   **Check-In:** The app asks **"How is your Battery?"** (Red/Yellow/Green).
*   **Response:** She taps **RED (Empty)**.
*   **Input (Optional):** She holds the mic button and says "She won't get in the shower."
*   **Intervention:** The app says: *"Permission to stop. Walk away. It's not worth the fight. Try again in an hour."*
*   **Outcome:** Aunt feels validated, not guilty. She stops the fight. Stress drops.

### Journey 2: The "Supporter" (Family Connection)
**Persona:** You (Distant Family). Want to help but don't want to call and interrupt.
*   **Trigger:** Thinking about Mom/Aunt during work.
*   **Action:** Open app -> Tap "Send Love."
*   **Input:** Type: "You guys are rockstars! Thinking of you."
*   **Outcome:** The message appears as a **Sticky Note** on Aunt's dashboard (no notification sound) AND rotates onto the **Companion Screen** (TV) so Grandma can see "Love from Fam."

### Journey 3: The "Recipient" (Companion Mode)
**Persona:** Grandmother. Confused about time/place. Anxious.
*   **Trigger:** She looks around the room, feeling unmoored. "When are we going?"
*   **Action:** She looks at the TV.
*   **Display:** High-contrast text: **"TUESDAY. 4:00 PM. DINNER SOON."** + A sticky note: "Love from Fam."
*   **Outcome:** She orients herself. She feels safe. She sits back down.

### Journey Requirements Summary
*   **Battery Logic:** System must branch logic based on *Caregiver State* (Low Battery = Stop) vs. *Patient Behavior*.
*   **Silent Messaging:** "Sticky Notes" must be push-notification silent but visually persistent.
*   **Casting/Web View:** "Companion Mode" must be a simple URL or Cast target that never sleeps (Wake Lock).

## Domain-Specific Requirements

### Compliance & Regulatory (The "Not a Medical Device" Line)
*   **Disclaimer:** Clear onboarding statement that this is a "Wellness Support Tool," not a medical diagnostic device.
*   **Language Safety:** AI prompts must use supportive language ("Try calming music") rather than prescriptive language ("Treat agitation with music").
*   **Emergency Protocol:** If "Red Battery" + "Danger keywords" (hitting, hurt) are detected, the app must display a pre-set Emergency Contact or "Call 911" button.

### Privacy & Data Security (Voice "Lite")
*   **Ephemeral Audio:** Voice recordings for venting are **transcribed instantly and the audio file is deleted**. It is never stored on a server.
*   **Local Storage:** Sensitive "Venting" text logs are stored locally on the user's device (Private Diary) and not shared with the Family Circle unless explicitly posted.
*   **Shared vs. Private:** "Sticky Notes" are public to the family; "Battery Checks" are private to the Caregiver (default).
*   **HIPAA Safe Harbor:** Since no Protected Health Information (PHI) is transmitted to external servers and all sensitive data is stored locally with encryption, HIPAA Safe Harbor provisions apply.

### Technical Constraints
*   **Offline-Capable Core:** Anchor Screen and Nudge Database must work without network calls (all content local).
*   **Wake Lock (Phase 2):** Companion Mode must prevent screen from sleeping when casting.

## Innovation & Novel Patterns

### Detected Innovation Areas
1.  **Caregiver-State Routing (The "Battery Check"):**
    *   *Concept:* Routing advice based on the *caregiver's* emotional capacity (Red/Green Battery), not just the patient's behavior.
    *   *Differentiation:* Competitors focus on "Managing the Patient." We focus on "Resourcing the Caregiver." If the battery is empty, the advice changes from "Try X" to "Stop."

2.  **Companion Mode (The "Digital Orientation Board"):**
    *   *Concept:* Using existing household hardware (TV/Tablet) as a passive, always-on orientation screen driven by the caregiver's app.
    *   *Differentiation:* Most apps are "Pocket Tools" hidden on a phone. This feature creates a "Shared Environment" of safety and information.

### Market Context
*   **Existing Apps (DAA):** Focus on medication reminders (Memory Clock) or task lists (MapHabit).
*   **Our Wedge:** We are the only solution combining **Real-Time Stress Regulation** (Anchor/Battery) with **Environmental Orientation** (Companion Mode).

### Validation Approach
*   **The "60-Second Test":** Measure if a caregiver's self-reported stress (1-10) drops after using the Anchor/Battery loop.
*   **The "Question Count":** Count the number of "What day is it?" questions per day *before* and *after* installing Companion Mode.

### Risk Mitigation
*   **Risk:** Caregivers ignoring the "Red Battery" warning and pushing through.
*   **Fallback:** If "Red Battery" is logged frequently, the app prompts a "Family Meeting" sticky note to the Supporter group ("Mom/Aunt needs a break").

## Mobile App Specific Requirements

### Project-Type Overview
**Platform Strategy:** Cross-platform Mobile App (React Native) targeting iOS and Android simultaneously.
**Category:** Health & Fitness / Lifestyle (Explicitly "Non-Medical" to avoid regulatory hurdles).
**Connectivity:** Wi-Fi/Cellular assumed for installation and updates. Core features (Anchor, Battery, Nudge) work offline.

### Technical Architecture Considerations
*   **Platform Support:**
    *   **Primary:** Mobile (Phone) for Caregivers and Family.
    *   **Secondary:** Tablet/Smart TV (via Cast/AirPlay) for the "Companion" display.
*   **Permissions Required:**
    *   **Microphone:** For transient voice logging (transcribe & delete).
    *   **Local Network:** For discovering and connecting to Cast devices (Chromecast/Apple TV).
    *   **Wake Lock:** To keep the Companion Screen active indefinitely.
*   **Notifications:**
    *   **Silent:** "New Sticky Note" (Badge only, to avoid startling).
    *   **Urgent:** "Red Battery Alert" (if configured to notify other family members).

### Implementation Considerations
*   **Store Compliance:**
    *   **Health & Fitness Category:** To position as "Lifestyle" tool.
    *   Must include "Not a Medical Device" disclaimers.
*   **User Interface:**
    *   **High Contrast & Large Buttons:** Essential for stressed/tired eyes.
    *   **Zero-Friction Navigation:** No "Hamburger Menus" deep in the stress flow. Linear, one-tap interactions only.

## Project Scoping & Phased Development

### MVP Strategy & Philosophy
**MVP Approach:** "Resilience MVP" - Single-User, High-Impact. Focus on the Caregiver's nervous system first.
**Philosophy:** Do less, but deeper. A perfect "Battery Check" is better than a mediocre "Calendar."

### MVP Feature Set (Phase 1)
*   **Core Journey:** "The Doer" (Aunt) only.
*   **Features:**
    1.  **Anchor Screen:** Rotating affirmations/photos.
    2.  **Battery Check:** Red/Yellow/Green input.
    3.  **Basic Nudge DB:** Hard-coded strategies for "Refusal" and "Agitation."
    4.  **Local Data:** Everything stored on phone. No login/signup wall if possible (or very simple).

### Post-MVP Features
*   **Phase 2 (Growth):**
    *   **Companion Mode:** Casting to TV/Tablet.
    *   **Sticky Notes:** Invite Family -> Cloud Sync -> Shared Wall.
*   **Phase 3 (Expansion):**
    *   **Music Integration:** Spotify API.
    *   **Voice Venting:** Adding the rich transcription layer.

### Risk Mitigation Strategy
*   **Technical Risk (Casting):** Mitigated by moving to Phase 2. Allows team to focus on Core UI first.
*   **Market Risk (Adoption):** Mitigated by "Single Player" MVP. Aunt gets value immediately without needing to onboard 5 other family members.

## Functional Requirements

### Caregiver Core (The "Anchor Loop")
*   **FR1:** Caregiver can open the app and immediately see an "Anchor Screen" (photo/affirmation).
*   **FR2:** Caregiver can report their current energy level ("Battery Check") using a Red/Yellow/Green input (single tap).
*   **FR3:** Caregiver can optionally speak or type a brief description of what is happening.
*   **FR4:** Caregiver can receive a contextual "Nudge" (tip/strategy) based on their Battery level and input.

### Content & Personalization
*   **FR5:** Caregiver can upload or select photos for the Anchor Screen rotation.
*   **FR6:** Caregiver can customize the default affirmation messages shown on the Anchor Screen.
*   **FR7:** System provides a pre-loaded "Nudge Database" of common strategies (Refusal, Agitation, Sundowning).

### Onboarding & Safety
*   **FR8:** Caregiver can complete onboarding in ≤3 steps (Name, optional Photo upload, Disclaimer acceptance).
*   **FR9:** Caregiver must accept a "Wellness Tool, Not Medical Device" disclaimer before first use.
*   **FR10:** If "Red Battery" + danger keywords detected, app displays an "Emergency Contact" prompt.

### Data & Privacy
*   **FR11:** Caregiver's data (Battery logs, Vent text) is stored locally on the device by default.
*   **FR12:** Voice recordings are transcribed instantly and the audio is deleted (never stored).

## Non-Functional Requirements

### Performance
*   **NFR1:** The Anchor Screen must load and be interactive within **2 seconds** of app launch.
*   **NFR2:** The "Battery Check" response must appear within **1 second** of user input.

### Security & Privacy
*   **NFR3:** Voice audio must be transcribed and deleted within **5 seconds** of recording completion.
*   **NFR4:** All local data must be encrypted at rest (Device Keychain / Secure Storage).
*   **NFR5:** No personally identifiable health data is transmitted to external servers in MVP.

### Accessibility
*   **NFR6:** All interactive elements must have a minimum tap target of **44x44 points** (Apple HIG).
*   **NFR7:** Text on Anchor Screen must meet **WCAG AA contrast ratio** (4.5:1).
*   **NFR8:** App must support system-level "Large Text" accessibility settings.
