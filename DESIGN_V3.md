# Design System: Health Sync AI v3 ("Vital Clay")

The standalone redesign living under `/v3` in the same app, alongside the v1
"Clinical Control Room" (`DESIGN.md`) on the root routes. The two route trees share
one backend.

---

## Creative North Star

**A health record you can hold.**

v3 is built from four materials, and every surface in the product is one of them:

| Material | What it is | Where it appears |
|---|---|---|
| **Bone** | The canvas. Warm bone paper with one soft petrol daylight bloom at the top of the page. | Every page ground |
| **Vellum** | Crisp warm-white cards, 1px sand hairline, two-layer soft shadow. | Content, panels, forms |
| **Clay** | Physically extruded controls: a hard keycap edge, a rim light, an ambient shadow, and a press that bottoms out into the page. | Every button, icon button, tab, chip |
| **Dusk** | Deep petrol-ink instrument faces with a bloom of light at the top-left and 4% film grain. | Risk, live vitals, the AI, the doctor summary, marketing chapter breaks |

The metaphor is the reason the interface behaves the way it does: a record is a
physical object on a surface. Controls can be picked up (hover lift) and pressed
(edge collapses); data sits on instrument faces where it is read carefully.

**Not:** purple or violet anywhere, glassmorphism, gradient washes as decoration,
emoji iconography, three identical feature cards, a floating pill nav, eyebrow
labels stacked above headings, em dashes in copy, or fabricated proof.

---

## Typography

Three faces, three strictly separated jobs. Loaded in `index.html` alongside the
v1 pair; namespaced `display3` / `body3` / `mono3` in `tailwind.config.js`.

- **Spectral** (`display3`): display only, light at scale (300â€“400), so hierarchy
  comes from scale and weight rather than boldness. Applied by CSS to `h1` and `h2`
  only (page titles, section statements, dialog titles) plus every first-class
  figure value. It never appears in the interface chrome or at small sizes.
- **Schibsted Grotesk** (`body3`): the entire interface, body copy, card and panel
  headings (`h3`), labels, buttons, navigation.
- **DM Mono** (`mono3`): every measured value, inline clinical numbers, table
  cells, timestamps, IDs, dosage strings, readouts. Always with `tabular-nums`
  (`.v3-num`).

### Steps (all named, nothing arbitrary)

`d1` clamp 42â†’72 Â· `d2` clamp 31â†’46 Â· `d3` 30 Â· `d4` 21 Â· `d5` 17 Â· `b1` 16 Â·
`b2` 15 Â· `b3` 13 Â· `b4` 12 Â· `lbl` 13 medium Â· `mic` 11 caps (0.09em) Â·
`m1`â€“`m4` mono readouts. Figure values have their own four sizes (`xs` 20 to
`lg` 46) exported as `FIGURE_SIZE` so a phone mock and a dashboard tile can never
invent a size of their own.

### Rules

**The one-voice rule.** A value is either a *figure* (Spectral, display
sizes, tabular) or a *readout* (DM Mono, inline and in tables). Clinical numbers
never render in the body sans.

**No eyebrow above a heading.** `mic` caps label a value or a column, never sit as
decoration above an `h1`, `h2` or `h3`.

---

## Color

| Role | Token | Value |
|---|---|---|
| Canvas | `bone` | `#F4F1E9` (raised `#FFFDF8`, sunken `#EBE7DC`) |
| Ink | `sand` 950â†’50 | `#141210` â€¦ `#FAF8F3` |
| Action | `petrol` 600 | `#0E5F66` (the single interactive accent) |
| Instrument surface | `dusk` 900 | `#0C1A1D` + text roles `dusk-text/body/soft/faint/dim` |
| Clinical state | `sig` good / watch / critical | `#1E7A4D` / `#A8701A` / `#B3261E` |

**The scarcity rule.** Petrol is the only chromatic interactive colour. If
something is not clickable and is not the one primary action on the screen, it is
not petrol.

**The labeled-state rule.** `sig` colours are reserved for real clinical state and
always ship inside a `StatusPill` with an icon and a text label. Event and record
*categories* use `categoryTone()` (petrol / sand / dusk tints), never a clinical
colour.

**The one-mapping rule.** Every status string resolves through
`lib/clinical.js â†’ clinicalTone(value, domain)`. `HIGH` on a lab is amber; `HIGH`
on a DDI check is red; that difference is declared in one file, not re-derived per
page. v2 shipped six divergent mappings, including one that rendered an
`ABNORMAL` lab green.

Contrast floor: secondary text is `sand-600` on bone (4.96:1) and `dusk-soft` on
dusk (8.5:1). `sand-400/500` are decoration and large text only.

---

## Clay: the plush control, in four parts

The user-visible signature of this system. Implemented in `theme.css` (`.v3-clay`
plus `.clay-petrol / .clay-dusk / .clay-vellum / .clay-critical / .clay-quiet`) and
`components/ui/Button.jsx`.

1. **Hard edge.** A zero-blur bottom edge (`0 4px 0 #073C42`) at roughly 12 to 14
   percent of control height. This is what the eye reads as real thickness; blur
   destroys the illusion.
2. **Rim light.** `inset 0 1px 0 rgba(255,255,255,.28)` so the face reads as lit
   from above.
3. **Ambient shadow.** One soft shadow under the edge, so the key sits on the bone
   rather than floating.
4. **The press.** On `:active` the edge collapses to 1px and an inset top shadow
   appears; Framer Motion translates the face down by exactly the edge height and
   squashes it (`scaleX 1.025`, `scaleY 0.955`, `transform-origin: center 65%`).
   The face bottoms out on the surface. Release springs back through
   `springRelease` (stiffness 430, damping 22, mass 0.8, damping ratio â‰ˆ 0.6) for
   exactly one soft wobble.

Division of ownership, enforced because mixing these is how plush becomes janky:
**CSS owns shading only** (gradients, box-shadow, filter, transitions at 150ms in,
80ms out). **Framer owns transform only** (hover lift `-2px`, press travel,
squash). Never a CSS `transform` on a clay control; never a JS `box-shadow`.

The plush is also keyboard-honest: the focus ring is drawn on the control's own
`::after` layer as a 2px petrol ring, because Safari does not round `outline` to
`border-radius`, and `prefers-reduced-motion` removes travel and squash while
keeping the edge/shadow state change, which is information rather than decoration.

Underscore rule: **the edge is 4px, the press travel is 4px, and they are the same
number.** They are wired together in `pressable(edge)`.

---

## Motion

`lib/motion.js` holds the entire vocabulary; nothing in `/v3` hard-codes a
duration or a curve.

**Frequency law:** 100+/day actions (nav, filters) get no entrance animation;
hover states stay â‰¤120ms; menus/dialogs get one authored entrance; page mounts are
the only place travel is allowed.

**Duration law:** press 90ms (must beat perception), hover/colour 150ms, menus
180ms, dialogs 200ms, sheets 300 to 340ms, page entrances 420ms. Exits are always
faster than entrances. Nothing functional exceeds 300ms.

**Easing law:** `easeOut [0.23, 1, 0.32, 1]` for entering and exiting,
`easeInOut [0.77, 0, 0.175, 1]` for movement on screen, `easeDrawer
[0.32, 0.72, 0, 1]` for sheets. `ease-in` is never used.

**The twelve principles at interface scale:** squash and stretch is the clay
press; anticipation is the 2px hover lift; staging is one entrance per page;
pose-to-pose is key states with springs interpolating; follow-through is the
settle; overlapping action is 30 to 60ms stagger; slow in / slow out is the custom
curves; arcs are menus growing from the trigger corner; secondary action is icons
shifting 2px (the label never moves); timing is the laws above; exaggeration is
deliberately near-zero (this is health data, calm is the point); appeal is one
vocabulary applied without exception.

`MotionConfig reducedMotion="user"` wraps the entire `/v3` tree in `V3Root`, and
`theme.css` enforces the same floor for CSS transitions. JS smooth scrolling goes
through `lib/scroll.js`, which checks the media query itself (a CSS
`scroll-behavior` rule cannot override an explicit `behavior: 'smooth'`).

---

## Layout and chrome

**One container.** `Container` exposes four named widths only: `app`
(`var(--v3-content)`, 1180px), `marketing` (1200px), `wide` (1320px), `reading`
(720px). **One page wrapper.** `Page` owns the vertical rhythm (`py-6 sm:py-8`,
`space-y-6 sm:space-y-7`), so no page invents its own spacing again.

**One chrome geometry.** `--v3-topbar-h`, `--v3-tabbar-h`, `--v3-shell`,
`--v3-sidebar` live on `.v3-root`; the topbar height, sticky offsets
(`.v3-sticky`), toast placement and tab-bar padding all read those variables. The
topbar is constrained to the same content width as the page below it, so its
control cluster shares the page's right edge.

Grid gaps are three values and no more: 16px for form rows, 20px for panel grids,
48/64px between marketing sections.

---

## Shapes

`rounded-tile3` 10px (icon tiles, avatars) Â· `rounded-ctl3` 12px (all controls,
inputs, nav items) Â· `rounded-card3` 16px (cards, popovers) Â· `rounded-panel3`
20px (large surfaces, sheets, drawers) Â· `rounded-hero3` 28px (marketing hero
panels, sheet tops) Â· `rounded-full` for pills and dots only. The device mock's
42/34px radii are the one documented exception: those are device dimensions, not
design radii.

---

## Components

- **Button / IconButton** (`ui/Button.jsx`): clay materials above; sizes 36/44/48;
  `block` for full width; loading keeps the label and swaps in a spinner.
- **Card / DuskPanel / PanelTitle / SectionHeader / RuleGrid** (`ui/Card.jsx`):
  the only card idioms. `PanelTitle` owns its own bottom offset; `RuleGrid` is the
  hairline-grid primitive behind every figure row and skeleton.
- **StatusPill / Tag** (`ui/Tag.jsx`): the trust primitives, always labelled.
- **Figure** (`ui/Figure.jsx`): display serif numerals plus `FIGURE_SIZE`.
- **Field set** (`ui/Field.jsx`): `Label`, `Hint`, `ErrorText`, `Input`,
  `Textarea`, `Select`, `FileButton`, `DataRow`. `error` on a control renders the
  message and wires `aria-invalid` / `aria-describedby` itself. `FileButton` is a
  real button that clicks an `sr-only` input, so uploads are keyboard-reachable.
- **Tabs / TabPanel / FilterChips / SubNav** (`ui/Tabs.jsx`): full APG tabs with
  roving tabindex and arrow keys; filters are `aria-pressed` buttons, never
  mislabelled tablists.
- **Dialog / Sheet / Drawer** (`ui/Overlay.jsx`): portalled to `<body>` so no
  `backdrop-filter` ancestor can ever trap a fixed overlay; focus moves in, is
  trapped, and is restored; Escape and scroll lock included.
- **Popover** (`ui/Popover.jsx`): anchored menus that grow from their trigger
  corner, closed on outside pointerdown or Escape.
- **Table set** (`ui/Table.jsx`): dense by design, horizontally scrollable on
  phones, tabular numerals in every cell by default.
- **EmptyState, Skeleton/PageSkeleton, PageHeader, LogoMark/Wordmark, Toast,
  RiskBand, Prose, Sparkline, ChatBubble/SafetyMark, DeviceFrame, Spotlight.**
- **Layout shells**: `V3Root` (theme + reduced-motion), `MarketingShell`,
  `AppShell`/`Topbar`/`Sidebar`/`MobileNav`/`BottomTabs`/`DemoStrip`, and `nav.js`
  as the single navigation model every surface derives from.

---

## Data and honesty

The backend is unchanged. v3 adds `lib/api.js`: four verb helpers that unwrap
`res.data`, `errorText()` which turns any thrown axios error into one human
sentence (401, offline, FastAPI `detail`, or a pydantic 422 array), and `useLoad`
which removes the copy-pasted fetch/unmount-guard/refetch boilerplate from every
page while keeping the guard.

Safety remains visible: the assistant's refusals render as first-class messages
with an urgency pill (`Safety interception` / `Emergency guidance`) and a
`Safety checked` mark on every answer. The academic-prototype disclosure is
present on every screen in the `DemoStrip`, small and honest, never the visual
centrepiece.

---

## Hard rules (read before adding a section)

1. No colour that is not a token. Dusk text uses `dusk-text/body/soft/faint/dim`;
   on-dusk hairlines use `border-white/10`.
2. No arbitrary radii, no arbitrary type sizes, no arbitrary touch targets:
   `rounded-tile3|ctl3|card3|panel3|hero3`, the named type steps, `min-h-touch`.
3. No `transform` in CSS on a clay control, and no `box-shadow` animation in JS.
4. Every entrance needs a reason from the frequency law; nothing below the fold
   animates on mount (`whileInView` with `once`).
5. Status colour only through `StatusPill` and only via `clinicalTone()`.
6. Overlays are portalled; nothing `fixed` is ever nested inside a blurred header.
7. Sticky offsets use `.v3-sticky`, page widths use `Container`, page rhythm uses
   `Page`.
8. No em dashes in copy, no emoji anywhere, no eyebrow above a heading.
