# Design System: ACPR Supertool

## 1. Visual Theme & Atmosphere
ACPR is styled as a precision career engineering workstation, combining the clinical focus of an aerospace CAD cockpit with the understated elegance of a modern architecture studio.
- **Density:** Cockpit Dense (8/10) — High information density with disciplined whitespace hierarchy, compact micro-controls, and clear visual zoning.
- **Variance:** Offset Asymmetric (7/10) — Balanced two-pane split with a dominant left control workbench and a dedicated right paper-canvas preview.
- **Motion:** Fluid CSS with Spring Physics (6/10) — Snappy, tactile micro-transitions calibrated to hardware-accelerated transforms with perpetual live-sync indicators.

## 2. Color Palette & Roles
- **Obsidian Dark** (`#09090b`) — Root application background, deep zinc foundation
- **Cockpit Surface** (`#121217`) — Primary sidebar, navigation panels, and workbench containers
- **Elevated Slate** (`#181820`) — Form section cards, dropdown overlays, and modal bodies
- **Input Neutral** (`#0f1015`) — Text inputs, code editor textareas, and slider tracks
- **Hairline Border** (`rgba(255, 255, 255, 0.08)` / `#27272a`) — 1px structural grid dividers and card perimeters
- **Focus Border** (`#0ea5e9`) — Active input and focus indicator outline
- **Text Bright** (`#f4f4f5`) — Primary headings, active tab labels, and prominent data (Zinc-50)
- **Text Dim** (`#a1a1aa`) — Body labels, descriptions, and secondary metadata (Zinc-400)
- **Text Muted** (`#71717a`) — Field hints, shortcuts, and disabled states (Zinc-500)
- **Calibrated Electric Azure** (`#0ea5e9`) — Singular accent color for primary actions, active navigation states, sliders, and score gauges (Saturation: 74%, Lightness: 49%)
- **Semantic Emerald** (`#10b981`) — ATS matched keywords and verified local LLM connections
- **Semantic Rose** (`#f43f5e`) — Missing critical skills, destructive delete buttons
- **Semantic Amber** (`#f59e0b`) — Offline heuristic fallback badges and warnings

*(Constraint enforcement: Exactly 1 primary accent. Saturation strictly below 80%. No purple or neon button glows.)*

## 3. Typography Rules
- **Display & Headings:** `Outfit`, sans-serif — Track-tight (`letter-spacing: -0.025em`), weight-driven hierarchy (`font-weight: 600` / `700`). Controlled scale, never oversized.
- **Body & Controls:** `Plus Jakarta Sans`, sans-serif — Geometric precision with open counters, relaxed line height (`1.45`), crisp legibility at small sizes (`12px` to `14px`).
- **Monospace Override:** `JetBrains Mono`, monospace — Mandated for all high-density numbers (ATS gauge percentages, zoom levels, publication counts, bibtex keys, code synchronizer, and status badges).
- **Banned:** `Inter` is strictly banned for UI chrome. Generic serif fonts (`Times New Roman`, `Georgia`, `Garamond`) are banned from all dashboard controls.

## 4. Component Stylings
- **Buttons:**
  - Flat aesthetic with crisp 1px hairline border and subtle surface gradient (`linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.08) 100%)`).
  - Tactile physical push: `:active { transform: translateY(1px); }`.
  - Icon treatment: High-precision inline SVG micro-icons (15px × 15px, 1.8px stroke width). No emojis.
  - Primary button: Calibrated Azure fill (`#0ea5e9`), crisp dark text or pure white contrast, no neon outer shadow.
  - Secondary button: Subtle dark surface (`#1e2029`), crisp border, text `#f4f4f5`.
- **Navigation Tabs:**
  - Compact horizontal rail with clean 1px bottom border.
  - Active tab indicated by an azure bottom hairline (`box-shadow: inset 0 -2px 0 #0ea5e9`) and bright text contrast.
  - Every tab uses an inline SVG symbol for instant recognition.
- **Form Cards & Containers:**
  - Clean 10px rounded corners (`border-radius: 10px`).
  - Background: Elevated Slate (`#181820`).
  - Thin 1px perimeter border (`rgba(255,255,255,0.08)`).
  - Subtle diffuse shadow: `0 2px 10px rgba(0,0,0,0.25)`.
- **Inputs & Textareas:**
  - Label strictly above the input in secondary muted text (`#a1a1aa`, `font-size: 0.78rem`, `font-weight: 600`).
  - Background fill `#0f1015`, border `rgba(255, 255, 255, 0.1)`.
  - Focus state: Border color transitions to `#0ea5e9` with subtle `0 0 0 2px rgba(14, 165, 233, 0.15)`.
- **ATS Gauge & Metrics:**
  - Circular conic-gradient gauge with centered monospace score (`85%`).
  - Keyword chips with subtle tinted backgrounds and contrasting border (Emerald for matched, Rose for missing).
- **Loading & State Indicators:**
  - Perpetual micro-pulse live-sync dot (`@keyframes pulse-dot`).
  - Skeletal shimmer state for AI generation with matching layout proportions. No generic spinners.

## 5. Layout Principles
- **Dual-Pane Cockpit Architecture:**
  - Left Workbench Pane: Fixed-width flex column (`min-width: 440px`, `max-width: 720px`, `flex: 1`) with independently scrollable sections.
  - Right Preview Pane: Canvas viewport (`flex: 1.2`) with zoom controls, paper center alignment, and millimeter-accurate A4 boundaries.
- **Responsive Collapse:**
  - On viewports `< 1024px`, workspace toggles into stacked or single-column mode.
  - Horizontal overflow on the shell is strictly forbidden.
- **Z-Index Cleanliness:**
  - Header: `100`, Floating Toolbars: `50`, Modals: `1000`, Drag-and-drop overlays: `2000`.

## 6. Motion & Interaction
- **Timing Curve:** `cubic-bezier(0.16, 1, 0.3, 1)` (spring-like responsiveness, zero lag).
- **Duration:** Fast micro-interactions (`150ms` to `220ms`).
- **Hardware Acceleration:** Animations restricted to `transform` and `opacity`.
- **Tactile Active Feedback:** `translateY(1px)` applied consistently to buttons, tab selectors, and interactive keyword tags.

## 7. Anti-Patterns (Banned AI Tells)
- **NO emojis anywhere** in UI chrome, headers, buttons, tabs, modal dialogs, or dropdowns.
- **NO `Inter` font** for application chrome.
- **NO pure black (`#000000`)** surfaces.
- **NO neon or purple glowing buttons** (`box-shadow: 0 0 20px #8b5cf6`).
- **NO 3-column equal card rows** in marketing or settings.
- **NO AI copywriting clichés** ("Elevate your career", "Seamless next-gen experience", "Unleash your potential").
- **NO generic names or placeholder personas** ("John Doe", "Acme Corp").
- **NO filler scroll indicator text** ("Scroll to explore", bouncing arrows).
