<!--
SYNC IMPACT REPORT
==================
Version Change: Initial Creation → v1.0.0 (Ratification)
Modified Principles: None (Initial adoption)
Added Principles:
  - Principle 1: Local-First Sovereignty & Client-Side Privacy
  - Principle 2: 14-Engine Reactive Interoperability & Data Integrity
  - Principle 3: Anti-Slop Visual Standards & Semantic Design Taste
  - Principle 4: Universal File Ingestion Resilience & Zero Rejection
  - Principle 5: Deterministic Export & Print Geometric Fidelity
Added Sections:
  - Preamble & Scope
  - Core Non-Negotiable Principles
  - Governance & Amendment Procedure
  - Compliance Review Protocol
Follow-up Deferred Items / TODOs: None
-->

# ACPR Project Constitution

## Preamble & Mission
ACPR (All-in-One Career Profile & Resume Supertool) is an open-source, local-first professional profile suite that unifies the functionality of 14 leading developer resume and portfolio projects into a unified desktop and web workspace. This Constitution establishes the foundational engineering, design, and privacy standards governing all ACPR systems, subsystems, and automated modifications.

- **Constitution Version:** 1.0.0
- **Ratification Date:** 2026-10-11
- **Last Amended Date:** 2026-10-11
- **Governance Status:** Ratified & Active

---

## Core Non-Negotiable Principles

### Principle 1: Local-First Sovereignty & Client-Side Privacy
1. **Zero External Telemetry:** All personal profile data, imported documents, employment records, academic publications, and generated resumes MUST remain strictly inside client-side memory or browser local storage unless the user explicitly triggers an external service.
2. **Local Model Priority:** AI-powered resume enhancement, XYZ bullet generation, and ATS analysis MUST support local Docker/Ollama execution (`http://localhost:11434`) out-of-the-box. Any cloud API integration MUST remain strictly opt-in ("Bring Your Own Key").
3. **Rationale:** Career documents contain sensitive personal and financial data. Sovereign, offline-capable execution is the foundational trust contract of ACPR.

### Principle 2: 14-Engine Reactive Interoperability & Data Integrity
1. **Single Unified State:** The application state MUST maintain a single, normalized reactive schema. Edits performed in the Visual Form, Resume-as-Code (YAML/Markdown), Drag & Drop Reordering, BibTeX Manager, or ATS Missing Keywords injector MUST bidirectionally synchronize instantly across all 14 subsystem views.
2. **Conflict-Free Serialization:** State exports to JSON Resume, RenderCV YAML, LapisCV Markdown, and BibTeX format MUST be strictly deterministic and lossless.
3. **Rationale:** Users must be free to transition fluidly between visual GUI editing, programmatic code editing, and automated optimization without losing data or experiencing state desynchronization.

### Principle 3: Anti-Slop Visual Standards & Semantic Design Taste
1. **No Emojis in UI Chrome:** All application chrome, buttons, tab navigation, modals, and status badges MUST use crisp, hardware-accelerated inline SVG micro-icons. Emojis in navigation tabs and action buttons are strictly forbidden.
2. **Typography Discipline:** The generic system default `Inter` font is banned for the primary UI display shell. ACPR MUST utilize curated typography (`Outfit` for headings and display, `Plus Jakarta Sans` for body, `JetBrains Mono` for code, counters, and high-density numbers).
3. **Calibrated Color Architecture:** The design system MUST utilize a singular calibrated accent color with saturation below 80% (calibrated Electric Azure `#0ea5e9`), grounded on an Off-Black/Zinc neutral baseline. Neon glowing buttons, purple AI gradients, and 3-column equal card rows are strictly prohibited.
4. **Tactile Interaction:** Interactive controls MUST provide tactile physical feedback (1px downward translation on `:active` state) and spring-physics micro-animations.
5. **Rationale:** Professional career tooling must look and feel like a precision CAD/developer workstation (Linear/Figma/Raycast caliber), not a generic, throwaway AI-generated template.

### Principle 4: Universal File Ingestion Resilience & Zero Rejection
1. **Any File Acceptance:** The Universal Document Importer MUST accept and parse any common document or data format (.pdf, .docx, .txt, .md, .yaml, .json, .bib, .html, and image avatars) without crashing or unhandled rejections.
2. **Heuristic Gracefulness:** When encountering non-standard or malformed candidate documents, the parsing engine MUST extract maximum heuristic structure (name, contact channels, roles, metrics, dates, and skills) and present an interactive diff/preview modal before applying changes.
3. **Rationale:** Candidates possess resumes in arbitrary legacy formats. A supertool must eliminate import friction rather than demanding manual data re-entry.

### Principle 5: Deterministic Export & Print Geometric Fidelity
1. **A4 & US-Letter Precision:** Print and vector PDF exports MUST adhere to exact millimeter geometries. Headers, dates, skill badges, and bullet text MUST never clip, overflow margins, or cause awkward single-line page splits.
2. **Dual-Mode Cohesion:** The application MUST cleanly toggle between A4 Print Resume geometry and responsive single-page Web Portfolio mode without layout breakage or DOM rebuild anomalies.
3. **Rationale:** A resume supertool succeeds only if the final exported artifact passes human recruiter scrutiny and automated ATS parsing flawlessly.

---

## Governance & Amendment Procedure

### 1. Amendment Thresholds
- **Major Amendment (X.0.0):** Requires formal review and validation when modifying core principles, deprecating engine capabilities, or altering privacy guarantees.
- **Minor Amendment (1.X.0):** Requires documentation when adding new engine subsystems, expanding supported file codecs, or augmenting design tokens.
- **Patch Amendment (1.0.X):** Applied for typo corrections, token value clarifications, or non-semantic wording improvements.

### 2. Compliance Review Protocol
Every pull request, refactor, or AI-generated modification MUST be audited against the 5 principles:
- Does it leak candidate data externally?
- Does it break state synchronization between form and code?
- Does it introduce emojis, generic fonts, or neon glows into the UI?
- Does it degrade universal file import handling?
- Does it maintain print and responsive portfolio fidelity?
If any check fails, the change is non-compliant and must be remediated.
