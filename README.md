# ACPR (All-in-One Career Profile & Resume Supertool)

**ACPR** is a next-generation career and resume supertool that synthesizes **all 14 top open-source CV/resume ecosystems** into one unified, offline-capable, lightning-fast application.

---

## ⚡ The 14-in-1 Integration Architecture

| # | Open Source Engine | Core Capability Integrated into ACPR |
|---|---|---|
| 1 | **[Resume-Matcher](https://github.com/srbhr/Resume-Matcher)** | **ATS JD Matcher & Keyword Gap Analyzer**: Real-time TF-IDF & vector similarity scoring against job postings, missing keyword alerts, and automated ATS compliance audits. |
| 2 | **[Reactive Resume](https://github.com/reactive-resume/reactive-resume)** | **Live Synchronized Dual-Pane Preview**: Real-time reactive updates as you type, multi-language data structure, and cloud-ready data model. |
| 3 | **[RenderCV](https://github.com/rendercv/rendercv)** | **Resume-as-Code (YAML)**: Bidirectional synchronization with strict declarative YAML schemas version-controllable via Git. |
| 4 | **[Open Resume](https://github.com/xitanggg/open-resume)** | **High-Fidelity PDF Engine**: Zero-server client-side vector PDF generation with strict 1-page fit heuristics and standard tech typography. |
| 5 | **[LapisCV](https://github.com/BingyanStudio/LapisCV)** | **Markdown Live Sync**: Split-screen Markdown editing with auto-pagination and dual-language font rendering. |
| 6 | **[Hugo Academic CV](https://github.com/HugoBlox/hugo-theme-academic-cv)** | **Academic & Research Module**: Full BibTeX citation parser (`@article`, `@inproceedings`), peer-reviewed journal tracking, grants, and DOI links. |
| 7 | **[visiky/resume](https://github.com/visiky/resume)** | **Minimalist Nordic Theme**: Distraction-free, high-whitespace monochrome typographic layout. |
| 8 | **[Modern Resume Theme](https://github.com/sproogen/modern-resume-theme)** | **Interactive Web Portfolio Mode**: 1-click transformation of your CV into a modern, responsive personal website with live social chips and project cards. |
| 9 | **[JadeAI](https://github.com/LingyiChen-AI/JadeAI)** | **AI Assistant & Bullet Polisher**: Offline heuristic action-verb enhancer implementing Google's XYZ formula (*"Accomplished [X] measured by [Y] by doing [Z]"*), plus optional BYOK (Bring Your Own Key) for OpenAI/Groq/Cloud LLMs. |
| 10 | **[yamlresume](https://github.com/yamlresume/yamlresume)** | **Declarative Data Separation**: Decouples career facts from presentation styling for clean exports. |
| 11 | **[dnd-resume](https://github.com/Arman19941113/dnd-resume)** | **Drag-and-Drop Section Hierarchy**: Interactive reordering of sections with 1-click visibility toggle switches. |
| 12 | **[Resume Builder](https://github.com/sadanandpai/resume-builder)** | **Guided Form Wizard**: Step-by-step structured input editors for experience, projects, education, and skills. |
| 13 | **[oh-my-cv](https://github.com/Renovamen/oh-my-cv)** | **Typographic Fine-Tuning**: Real-time sliders for base font size (pt), line spacing, and page margins (mm) across 5 distinct curated themes. |
| 14 | **[markdown-resume](https://github.com/junian/markdown-resume)** | **Portable Markdown Importer/Exporter**: 1-click export of your entire profile as clean standard `resume.md`. |

---

## 🚀 Key Features

1. **Dual Viewing Modes:**
   - 📄 **Resume Mode:** Print-ready, pixel-perfect A4 / Letter PDF vector sheet.
   - 🌐 **Web Portfolio Mode:** Modern interactive portfolio with sticky navigation, project showcases, and social contact cards.
2. **5 Curated Aesthetic Themes:**
   - *Modern Tech* (clean Silicon Valley layout)
   - *Classic Executive Serif* (traditional Merriweather/Georgia)
   - *Academic Scholarly* (BibTeX publications & compact citations)
   - *Minimalist Nordic* (clean Swiss monochrome)
   - *Creative Split* (dynamic accented header)
3. **Multi-Format Export & Import:**
   - Export to **Vector PDF (Print)**, **YAML**, **JSON Resume**, **Markdown**, **BibTeX**, and **Standalone HTML**.
   - Import existing **JSON**, **YAML**, or **BibTeX** files directly.
4. **ATS Scanner:**
   - Evaluates resume keyword density against job descriptions.
   - Shows matched keywords vs missing keywords.
   - 1-click helper to add missing keywords straight into your skills list!
5. **AI Bullet Enhancer:**
   - Rewrites weak passive bullets into quantifiable, high-impact leadership bullet points.
   - Works 100% offline with built-in heuristic NLP, or connects to any OpenAI-compatible API.

---

## 💻 How to Run Locally

You can open `index.html` directly in any web browser, or launch the included zero-dependency dev server:

```bash
# Start local server (Node.js)
node serve.js

# Or start with Python:
python -m http.server 3333
```
Then navigate to: `http://localhost:3333` in your browser.
