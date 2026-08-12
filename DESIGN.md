---
name: GAP VoicePilot Design System
description: High-contrast editorial operating-room design system for GAP VoicePilot realtime AI phone agent platform.
colors:
  primary: "#000000"
  neutral-bg: "#ffffff"
  surface-soft: "#f8f9fa"
  block-lime: "#d8f5a2"
  block-lilac: "#eebefa"
  block-mint: "#b2f2bb"
  block-coral: "#ffc9c9"
  block-navy: "#0c192c"
typography:
  display:
    fontFamily: "var(--font-space-grotesk), Inter, sans-serif"
    fontSize: "clamp(2.75rem, 6.5vw, 5.5rem)"
    fontWeight: 340
    lineHeight: 0.94
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  sm: "12px"
  md: "18px"
  lg: "24px"
  xl: "28px"
  pill: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "48px"
components:
  button-primary:
    backgroundColor: "#000000"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    padding: "12px 28px"
---

# Design System: GAP VoicePilot

## Overview

**Creative North Star: "The Editorial Voice Console"**

GAP VoicePilot uses a high-contrast operating-room layout that turns complex real-time voice streaming, regional phone call routing, and telemetry into clean visual artifacts. Built on a stark white canvas (`#ffffff`), strong dark typography, rounded pill controls, and vibrant pastel poster block accents (`#d8f5a2`, `#eebefa`, `#b2f2bb`, `#ffc9c9`, `#0c1c2c`), the interface conveys speed, transparency, and operational authority.

**Key Characteristics:**
- Stark white canvas with deep black ink typography and pill controls.
- Full-bleed pastel poster block surfaces for core feature groups.
- Animated live audio stream visualizer and real-time turn-taking badges.
- Strict typography hierarchy with generous spatial rhythm.

## Colors

The color system uses a high-contrast base grounded by stark white and deep black, with high-saturation pastel block accents to demarcate functional surfaces.

### Primary
- **Deep Black Ink** (`#000000`): Primary headings, buttons, pill borders, and high-emphasis surface blocks.

### Neutral
- **Stark White Canvas** (`#ffffff`): Page backdrop, card surfaces, and interior containers.
- **Soft Slate Neutral** (`#f8f9fa`): Secondary section backgrounds and input fill.
- **Hairline Border** (`rgba(0,0,0,0.08)`): Subtle section dividers and container framing.

### Functional Accent Poster Blocks
- **Block Lime** (`#d8f5a2`): Realtime audio streaming, active call states, key call-to-action blocks.
- **Block Lilac** (`#eebefa`): Regional language engine, voice accent customization, Hinglish speech models.
- **Block Mint** (`#b2f2bb`): Telephony infrastructure, SIP trunking, business number routing.
- **Block Coral** (`#ffc9c9`): Developer surface, API webhooks, urgent call handoffs.
- **Block Navy** (`#0c192c`): Realtime analytics console, dark theme code snippet surfaces.

## Typography

**Display Font:** Space Grotesk / System Display
**Body Font:** Inter / System Sans
**Label / Mono Font:** JetBrains Mono / System Monospace

### Hierarchy
- **Display** (340 weight, clamp 2.75rem - 5.5rem, 0.94 line-height, -0.035em tracking): Primary hero headlines.
- **Headline** (340 weight, 2.25rem - 3.75rem, 1.04 line-height, -0.03em tracking): Section titles.
- **Title** (600 weight, 1.25rem - 1.5rem, 1.2 line-height, -0.015em tracking): Card & feature headings.
- **Body** (300-400 weight, 0.875rem - 1.125rem, 1.6 line-height): Descriptions and copy.
- **Label / Mono** (600 weight, 0.75rem, tracking 0.18em uppercase): Badges, telemetry keys, and code labels.

## Layout

- **Container Width:** Max 1340px for broad content sections; 1080px for floating header navbar.
- **Section Spacing:** Generous 96px (py-24) vertical padding for distinct visual separation.
- **Card Padding:** 28px - 48px rounded block containers.

## Elevation & Depth

Surfaces rely primarily on clean 1px hairline borders (`border border-black/10`) and smooth backdrop blur filters (`backdrop-blur-2xl`) rather than heavy drop shadows. High-elevation overlays (floating navbar, auth dropdowns) use soft ambient shadows (`0 10px 35px rgba(0,0,0,0.06)`).

## Shapes

- **Header / Controls:** Full pill radius (`rounded-full` / `rounded-pill`).
- **Cards & Poster Blocks:** Generous curved corners (`rounded-[24px]` - `rounded-[32px]`).
- **Badges:** Pill caps with monospace tracking.

## Components

### Floating Navbar
- Floating pill header with white glassmorphic backdrop (`bg-white/75 backdrop-blur-2xl`), subtle border, and brand logo.

### Action Buttons
- **Primary:** Full black background (`bg-black text-white`), pill rounded, bold font with subtle hover scale.
- **Secondary / Outline:** White pill with crisp black border (`border border-black/15 text-black hover:bg-surface-soft`).

### Interactive Call Console
- Dark block container (`bg-black text-white rounded-[28px]`) with animated waveform indicator, live streaming transcript feed, and latency benchmarks.

## Do's and Don'ts

### Do:
- **Do** use full-bleed pastel block backgrounds (`bg-block-lime`, `bg-block-lilac`, etc.) to group capabilities into legible visual areas.
- **Do** keep headings light-to-normal weight (`font-[340]`) for an editorial, non-cluttered display.
- **Do** preserve 24px - 32px rounded corners on all major cards.

### Don't:
- **Don't** use generic gradient text or neon glows.
- **Don't** add eyebrows or kickers above main display headings.
- **Don't** mix unstyled browser controls; every input and button must use the pill/rounded design system.
