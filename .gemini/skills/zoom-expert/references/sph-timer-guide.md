# SPH Timer Technical Guide

This guide covers the specialized implementation details of the SPH Timer application for Zoom.

## Two-Phase State Machine

The SPH Timer uses a unique two-phase countdown logic:
1. **Phase 1 (Initial):** The main speaker time. Participants see both Phase 1 and Phase 2 remaining times.
2. **Phase 2 (Final):** The wrap-up time. Triggered automatically after Phase 1 ends.

### State Store (`src/store/timer-store.ts`)
- `phase`: 1 | 2
- `timeLeft`: Current countdown time.
- `phase2Time`: Fixed duration for the second phase.
- `totalTime`: Sum of both phases (calculated).

## Zoom Integration Patterns

### Auto-Queue via Hand Raise
The app listens for `onFeedbackReaction` events from the Zoom Apps SDK.
- If `event.feedback === 'raiseHand'`, the participant is automatically added to the speaker queue.
- Prevents duplicates and maintains order.

### Overlay Synchronization
The overlay widget (`src/components/zoom-timer/OverlayTimer.tsx`) displays:
- Mini circular progress ring.
- Countdown with context-aware labels.
- Phase transition alerts.
- Time-up messages.

### Fullscreen Mode
Designed for Zoom Screen Sharing. It hides UI controls to maximize readability of the timer for participants.

## Common Tasks

### Updating Presets
Modify the `PRESETS` constant in the timer store to add or change duration combinations (e.g., 3+2, 5+5).

### Customizing Sounds
The `useAudio` hook handles sound effects for:
- Phase 1 end (Alert).
- Time up (Final).

### Marketplace Scopes
Ensure `zoomapp:inmeeting` is enabled in the Zoom portal for `zoomSdk.config` to succeed.
