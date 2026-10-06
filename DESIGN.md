---
name: Health Sync AI
description: A clinical monitoring product that reads like the instrument panel it actually is.
colors:
  ink-950: "#0A0E13"
  ink-900: "#10161D"
  ink-700: "#2A343F"
  ink-500: "#5B6875"
  ink-400: "#7C8996"
  ink-200: "#C7CFD6"
  ink-100: "#E4E8EB"
  ink-50: "#F3F5F6"
  surface: "#F6F7F5"
  surface-raised: "#FFFFFF"
  surface-sunken: "#EEF0ED"
  line: "#E1E4E1"
  line-strong: "#C9CDC9"
  accent-700: "#1A4E88"
  accent-600: "#2563A8"
  accent-400: "#6098D6"
  accent-100: "#E1EDF8"
  accent-50: "#F1F6FC"
  status-good-600: "#16794F"
  status-good-50: "#EAF6EF"
  status-watch-600: "#9C670C"
  status-watch-50: "#FBF1E1"
  status-critical-600: "#B3261E"
  status-critical-50: "#FBEAE9"
typography:
  display:
    fontFamily: "Public Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "normal"
  body:
    fontFamily: "Public Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Public Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.07em"
  readout:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "inherit"
    fontWeight: 400
    lineHeight: "inherit"
    letterSpacing: "normal"
rounded:
  control: "0.5rem"
  card: "0.875rem"
spacing:
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.accent-600}"
    textColor: "#FFFFFF"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "{colors.accent-700}"
  button-dark:
    backgroundColor: "{colors.ink-900}"
    textColor: "#FFFFFF"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  card:
    backgroundColor: "{colors.surface-raised}"
    rounded: "{rounded.card}"
    padding: "24px"
---

# Design System: Health Sync AI

## Overview

**Creative North Star: "The Clinical Control Room"**

Health Sync AI reads like the instrument panel it actually runs on, not another gradient AI-SaaS dashboard. The system borrows its discipline from mission-control and flight-instrument readouts: warm paper-toned surfaces (never sterile pure white, never dark-mode-by-default), graphite ink for structure and text, one steady instrument blue as the sole interactive accent, and a strict three-color status vocabulary reserved exclusively for genuine clinical state. Every clinical or numeric value (a blood-pressure reading, a risk percentage, a dosage, a timestamp) renders in tabular monospace numerals, the one recurring signature that makes the whole product feel like a calibrated instrument rather than a marketing page.

This direction was chosen over five alternatives (Clinical Journal Precision, Transit Cartography, and others) specifically because the product's core mechanism is live, multi-role monitoring (a real-time vitals stream, a DL risk classifier, a multi-patient clinician board), which the control-room metaphor carries more directly than an editorial or cartographic one. It explicitly rejects the purple/violet gradient, glassmorphic-card, generic-icon-tile language the product previously used, and rejects emoji anywhere in the interface, including AI-generated response text.

**Key Characteristics:**
- Warm off-white "paper" surfaces, not sterile white or default dark mode
- One interactive blue; three semantic status colors (good/watch/critical), never decorative color
- Hairline borders over drop shadows; elevation is structural, not soft
- Every clinical number is tabular-monospace: the instrument-panel signature
- Status is always labeled in text, never color-only (accessibility + clinical safety)
- Dark `ink-950` "instrument panels" are used sparingly, reserved for the product's actual live-risk/AI-summary surfaces, not as a global theme

## Colors

The palette is Restrained: neutrals and structure carry the page, with one blue accent and three status colors used only where they mean something.

### Primary
- **Instrument Blue** (`#2563A8` / `accent-600`): the only interactive/brand color, used for primary buttons, links, active nav state, and focus rings. Used sparingly by design; its rarity is what keeps it meaningful.

### Neutral
- **Graphite Ink** (`#10161D` / `ink-900`): primary text, and the fill for dark "instrument panel" surfaces (risk-engine cards, AI clinical summaries, hero sections on public pages).
- **Warm Paper** (`#F6F7F5` / `surface`): the page background; intentionally not `#FFFFFF`, to avoid a sterile/clinical-in-the-bad-sense feel.
- **Card White** (`#FFFFFF` / `surface-raised`): card and panel backgrounds, sitting just above the warm paper ground.
- **Hairline** (`#E1E4E1` / `line`): the default border color for every card, table row, and divider; elevation comes from this line, not from shadow.

### Named Rules
**The Labeled State Rule.** Color never carries meaning alone. Every status indicator (risk level, DDI severity, appointment status, audit-log action) ships as a `StatusPill` with both an icon and a text label, never a bare colored dot or background tint.

**The Blue Scarcity Rule.** `accent-600` is the only saturated interactive color in the system. If something isn't clickable or isn't the one primary action on a screen, it doesn't get blue.

## Typography

**Body/UI Font:** Public Sans (with `ui-sans-serif, system-ui, sans-serif` fallback)
**Readout Font:** IBM Plex Mono (with `ui-monospace, monospace` fallback)

**Character:** Public Sans was chosen for its civic/institutional legibility (the same register as government digital-service typefaces) over more common AI-product defaults (Inter, DM Sans, Plus Jakarta Sans). IBM Plex Mono is used narrowly and functionally: not as a code font, but as the tabular-numeral face for every clinical reading, giving the product its instrument-panel identity.

### Hierarchy
- **Display** (600 weight, 1.5rem–2rem, 1.15 line-height): page titles (`PageHeader`).
- **Title** (600 weight, 0.875rem–1rem): card/panel headers (`PanelHeader`).
- **Body** (400 weight, 0.875rem, 1.5 line-height): all body copy, descriptions, form labels.
- **Label** (600 weight, 0.6875rem, 0.07em tracking, uppercase): the `instrument-label`: section eyebrows above every card and page header.
- **Readout** (IBM Plex Mono, tabular-nums): every clinical/numeric value: vitals, dosages, risk %, IDs, timestamps.

### Named Rules
**The Readout Rule.** Any value that is a clinical measurement, a count, a percentage, an ID, or a timestamp is set in `.readout` (IBM Plex Mono, tabular numerals), never the body sans, even inline.

## Layout

Public/marketing surfaces (Home, Login, Register) render full-bleed with their own width-constrained internal sections. Authenticated app surfaces render inside a `max-w-7xl` shell with a fixed left sidebar (desktop, ≥768px) or an off-canvas drawer (mobile, triggered from the navbar hamburger). Content area padding is `1rem` at the smallest breakpoint, scaling to `1.5rem`/`2rem` at `sm`/`lg`. Grids follow a consistent collapse pattern: `grid-cols-1` on mobile → `sm:grid-cols-2` → `lg:grid-cols-3` or `4` at desktop widths, never a fixed-width layout that can overflow a 375px viewport. Dense tabular data (audit logs, patient rosters) scrolls horizontally within a bounded container rather than collapsing to cards, since that density is appropriate for its Operate-mode clinician/admin audience.

## Elevation & Depth

Flat-by-default, hairline-bordered. The system deliberately avoids soft drop-shadows as its primary depth cue: `shadow-panel` is a near-imperceptible 1px separation, not a floating-card effect. The one deliberate exception is `shadow-overlay`, used only for true overlays (modals, the demo-tour dialog) where separation from page content must be unambiguous.

### Shadow Vocabulary
- **`shadow-panel`** (`0 1px 2px rgba(10,14,19,0.05), 0 1px 1px rgba(10,14,19,0.03)`): default card elevation; barely there, hairline does the real work.
- **`shadow-overlay`** (`0 12px 32px rgba(10,14,19,0.18), 0 2px 8px rgba(10,14,19,0.08)`): modals and dropdowns only.

### Named Rules
**The Hairline-First Rule.** Reach for a `border-line` before a shadow. Depth is structural (a visible edge) before it is soft (a blur).

## Shapes

Two radii, used consistently everywhere: `rounded-control` (0.5rem: buttons, inputs, small tiles, nav items) and `rounded-card` (0.875rem: cards, panels, modals). `rounded-full` is reserved for true pills (`StatusPill`) and circular avatars/icon nodes only. No other radius values exist in the system: no `rounded-xl`/`rounded-2xl`/`rounded-lg` leftovers.

## Components

### Buttons (`components/ui/Button.jsx`)
- **Shape:** `rounded-control` (8px), never a pill.
- **Primary:** `accent-600` background, white text, `shadow-panel`. Hover darkens to `accent-700`.
- **Dark:** `ink-900` background, white text, used for the product's signature actions (e.g. "Stream live vitals") to tie into the instrument-panel dark surfaces.
- **Secondary:** white background, `line` border, `ink-800` text.
- **Ghost / Danger:** text-only `ink-600`, and `status-critical-600` fill respectively.

### Cards (`components/ui/Panel.jsx`)
- **Corner style:** `rounded-card` (14px).
- **Background:** `surface-raised` (white) on the `surface` (warm paper) page ground.
- **Border:** always `border-line` (1px hairline): this is the primary depth cue.
- **Internal padding:** 24px (`p-6`) standard.

### StatusPill (`components/ui/StatusPill.jsx`): signature component
The system's core trust primitive. A pill combining an icon (CheckCircle2/AlertTriangle/AlertOctagon/Info/Circle) and a text label, in one of five semantic variants (`good`/`watch`/`critical`/`info`/`neutral`). Used for every clinical severity, appointment status, medication status, and audit-log action across the app. Never rendered as color alone.

### Readout (`components/ui/Readout.jsx`): signature component
An icon tile + label + large tabular-numeral value, used for every "quick stat" (blood pressure, medication count, lab count, next appointment). The recurring unit of the instrument-panel language.

### Inputs
- **Style:** `border-line`, `rounded-control`, `surface-raised` background.
- **Focus:** `ring-2 ring-accent-500` with a matching border color shift; no glow/blur effects.

### Navigation
- **Desktop:** fixed 256px left sidebar, `surface-raised` background, active item gets `accent-50` background + `accent-700` text (no left-border accent bar from the old system).
- **Mobile:** hamburger-triggered off-canvas drawer with a scrim backdrop; identical link set and styling to desktop, closes on navigation.

## Do's and Don'ts

### Do:
- **Do** use `.readout` (tabular-nums, IBM Plex Mono) on every clinical/numeric value without exception.
- **Do** pair every status color with an explicit text label via `StatusPill`: this is a clinical-safety requirement (color-blind-safe), not just a style preference.
- **Do** reserve `accent-600` for genuinely interactive elements only.
- **Do** keep the academic-prototype disclosure (`DemoBanner`) present on every screen, small and honest, never the visual centerpiece.
- **Do** keep AI-generated response text (from the backend LLM providers) free of emoji; this is enforced in `backend/app/services/llm_provider.py` and `safety_service.py`, not just the frontend.

### Don't:
- **Don't** use purple, violet, indigo, or fuchsia anywhere in the system: this was the explicit reason for the redesign.
- **Don't** use `bg-gradient-to-*` decoratively. The only large-scale color fields are flat `ink-950` (dark instrument panels) or `surface`/`surface-raised` (paper/card).
- **Don't** use emoji as UI iconography; `lucide-react` covers every icon need in the system.
- **Don't** introduce a third interactive color. If a new accent seems needed, it's a sign the status-color vocabulary should be reused instead.
- **Don't** soften or hide the AI assistant's safety-intercept refusals; per product principle, visible safety is a trust feature, not friction to minimize.
- **Don't** put a small uppercase "eyebrow" or "kicker" label directly above an `<h1>`/`<h2>`/`<h3>` heading (e.g. "PATIENT STATUS BOARD" above "Welcome back, Arjun Kumar"). `PageHeader` and `PanelHeader` intentionally do not render one; the heading carries its own weight. The `instrument-label` class stays legitimate for genuine inline field/section labels that are *not* stacked directly above a heading (e.g. "Workspace" above a plain-text value, "Source:" before a value).
