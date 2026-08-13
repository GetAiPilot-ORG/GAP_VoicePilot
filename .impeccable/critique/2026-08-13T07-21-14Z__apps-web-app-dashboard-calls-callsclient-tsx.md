---
target: apps/web/app/dashboard/calls/CallsClient.tsx
total_score: 31
max_score: 36
na_heuristics: 10
p0_count: 0
p1_count: 0
timestamp: 2026-08-13T07-21-14Z
slug: apps-web-app-dashboard-calls-callsclient-tsx
---
#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 4 | Clear indicators for call activity and audio streaming |
| 2 | Match System / Real World | 4 | Uses standard telephony terminology (SIP, Latency) |
| 3 | User Control and Freedom | 3 | Modal close and audio seek are clear, but lacks bulk/delete actions |
| 4 | Consistency and Standards | 4 | Highly consistent with the established `DESIGN.md` |
| 5 | Error Prevention | 3 | Audio fallback is good, but lacks preventative constraints on actions |
| 6 | Recognition Rather Than Recall | 4 | Table layout and metadata blocks make discovery trivial |
| 7 | Flexibility and Efficiency | 2 | No keyboard shortcuts (e.g. Space to play/pause) or bulk actions |
| 8 | Aesthetic and Minimalist Design | 4 | High contrast, bold editorial typography, and disciplined block usage |
| 9 | Error Recovery | 3 | Functional audio error states, but could offer clearer recovery steps |
| 10 | Help and Documentation | n/a | Dashboard surface; self-evident through layout |
| **Total** | | **31/36** | **Excellent** |

#### Design Specificity Verdict

**LLM assessment**: The layout feels very authored for the GAP VoicePilot identity. The high-contrast block accents (`bg-block-lime`, `bg-block-lilac`, `bg-block-mint`) paired with deep black ink text clearly establish the "Editorial Voice Console" motif. The layout avoids generic shadows in favor of crisp 1px borders and targeted ambient overlays, cementing its specificity.

**Deterministic scan**: The `detect.mjs` mechanical scanner found 0 defects, validating that the layout uses correct spacing constants and approved radii sizes.

#### Overall Impression
The surface acts as an excellent, high-fidelity operations console. The structural rhythm and visual contrast are striking and extremely legible. The biggest opportunity is elevating the power-user experience through better keyboard and screen-reader accessibility for the audio playback controls.

#### What's Working
- **Visual Rhythm**: The generous spacing (`space-y-12`, `pb-24`) combined with the `24px` block radius creates an authoritative, clean layout.
- **Micro-Copy**: Tags like `[Connecting to telephony media stream...]` and specific error states elevate the premium feel.

#### Priority Issues
- **[P2] What**: Missing keyboard shortcuts for the audio player.
- **Why it matters**: A critical function of this console is reviewing call audio. Having to manually click play/pause, especially across dozens of calls, adds severe friction for power users.
- **Fix**: Add a global listener for the Spacebar to toggle play/pause when the modal is open.
- **Suggested command**: `$impeccable adapt`

- **[P2] What**: Poor screen reader accessibility on the custom audio scrubber.
- **Why it matters**: Users reliant on assistive tech will not know how to interact with the input range slider or the custom play/pause button if they lack ARIA labels.
- **Fix**: Add `aria-label="Play audio"` and `aria-label="Seek audio position"` to the respective controls.
- **Suggested command**: `$impeccable harden`

- **[P3] What**: Missing bulk actions on the table.
- **Why it matters**: As the log grows, dealing with calls one-by-one becomes tedious.
- **Fix**: Add a bulk selection checkbox column to allow for exporting or archiving multiple call logs simultaneously.
- **Suggested command**: `$impeccable shape`

#### Persona Red Flags

**Alex (Power User)**:
- Must use the mouse to play/pause audio recordings in the modal.
- Cannot bulk-export or bulk-retry multiple failed calls.

**Sam (Accessibility-Dependent User)**:
- Custom audio controls (Play/Pause, Range Scrubber) lack explicit `aria-labels`.
- No focus trapping within the Call Detail Modal, leading to potential background scrolling or losing context.

#### Minor Observations
- The "Listen & Inspect" button could use a subtle tooltip or hover state to indicate that it loads live audio.
- The `animate-fadeIn` on the modal backdrop could be slightly faster (e.g. `duration-200`) to feel more responsive.

#### Questions to Consider
- What if the transcript auto-scrolled to the active playing segment during audio playback?
- Would adding a mini-waveform visualization next to the active row make the table feel more alive?
