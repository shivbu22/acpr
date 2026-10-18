/**
 * ACPR Main Application Controller
 * Orchestrates 14 CV engines in one unified supertool
 */

import { stateManager, DEFAULT_PROFILE } from "./state.js";
import { stateToYaml, stateToMarkdown, yamlToState, parseBibtex } from "./parser.js";
import { setupSectionManager } from "./dnd.js";
import { analyzeAtsMatch, SAMPLE_JOB_DESCRIPTIONS } from "./ats-engine.js";
import { enhanceBulletLocal, enhanceBulletWithAI } from "./ai-assistant.js";
import {
  exportResumePdf,
  exportResumeYaml,
  exportResumeJson,
  exportResumeMarkdown,
  exportResumeBibtex,
  exportStandaloneHtml,
  setupFileImporter
} from "./export.js";
import { renderResume, renderPortfolio } from "./preview-renderer.js";
import { extractFromFile, parseRawResumeText } from "./universal-importer.js";

// Global zoom state
let currentZoom = 1.0;
let activeCodeMode = "yaml"; // 'yaml' | 'md'

// Toast notifications helper
export function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initFormBindings();
  initPreviewRenderer();
  initCodeSynchronizer();
  initAtsMatcher();
  initAiAssistant();
  initAcademicBibtex();
  initSettingsAndTypography();
  initHeaderActions();
  initZoomControls();

  // Setup Section DnD Manager
  const dndContainer = document.getElementById("dnd-section-container");
  if (dndContainer) {
    setupSectionManager(dndContainer, stateManager);
  }

  // Universal Multi-Format Document & File Importer
  initUniversalImporter();
});

/**
 * Tab Navigation (Left Pane)
 */
function initNavigation() {
  const tabs = document.querySelectorAll(".nav-tab-btn");
  const panels = document.querySelectorAll(".tab-panel");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => t.classList.remove("active"));
      panels.forEach(p => p.classList.remove("active"));

      tab.classList.add("active");
      const targetPanel = document.getElementById(`tab-${target}`);
      if (targetPanel) targetPanel.classList.add("active");

      // Auto update code editor when switching to code tab
      if (target === "code") {
        updateCodeEditorContent();
      }
    });
  });
}

/**
 * Preview Rendering Engine & Live Reactivity
 */
function initPreviewRenderer() {
  const previewContainer = document.getElementById("resume-preview-container");

  function updatePreview(state) {
    if (!previewContainer) return;
    if (state.settings.viewMode === "portfolio") {
      previewContainer.innerHTML = renderPortfolio(state);
    } else {
      previewContainer.innerHTML = renderResume(state);
    }
  }

  stateManager.subscribe(updatePreview);
  updatePreview(stateManager.getState());
}

/**
 * Visual Form Bindings
 */
function initFormBindings() {
  const state = stateManager.getState();

  // Basics
  const fName = document.getElementById("f-name");
  const fLabel = document.getElementById("f-label");
  const fEmail = document.getElementById("f-email");
  const fPhone = document.getElementById("f-phone");
  const fLocation = document.getElementById("f-location");
  const fUrl = document.getElementById("f-url");
  const fSummary = document.getElementById("f-summary");

  function populateBasics(s) {
    if (fName && document.activeElement !== fName) fName.value = s.basics.name || "";
    if (fLabel && document.activeElement !== fLabel) fLabel.value = s.basics.label || "";
    if (fEmail && document.activeElement !== fEmail) fEmail.value = s.basics.email || "";
    if (fPhone && document.activeElement !== fPhone) fPhone.value = s.basics.phone || "";
    if (fLocation && document.activeElement !== fLocation) fLocation.value = s.basics.location?.city || "";
    if (fUrl && document.activeElement !== fUrl) fUrl.value = s.basics.url || "";
    if (fSummary && document.activeElement !== fSummary) fSummary.value = s.basics.summary || "";
  }

  populateBasics(state);

  fName?.addEventListener("input", (e) => stateManager.updateState(s => { s.basics.name = e.target.value; }));
  fLabel?.addEventListener("input", (e) => stateManager.updateState(s => { s.basics.label = e.target.value; }));
  fEmail?.addEventListener("input", (e) => stateManager.updateState(s => { s.basics.email = e.target.value; }));
  fPhone?.addEventListener("input", (e) => stateManager.updateState(s => { s.basics.phone = e.target.value; }));
  fLocation?.addEventListener("input", (e) => stateManager.updateState(s => {
    if (!s.basics.location) s.basics.location = {};
    s.basics.location.city = e.target.value;
  }));
  fUrl?.addEventListener("input", (e) => stateManager.updateState(s => { s.basics.url = e.target.value; }));
  fSummary?.addEventListener("input", (e) => stateManager.updateState(s => { s.basics.summary = e.target.value; }));

  // Render dynamic list sections
  renderExperienceFormList();
  renderProjectsFormList();
  renderEducationFormList();
  renderSkillsFormList();

  // Add Item buttons
  document.getElementById("btn-add-experience")?.addEventListener("click", () => {
    stateManager.updateState(s => {
      s.experience.unshift({
        id: `exp-${Date.now()}`,
        company: "New Organization",
        position: "Role Title",
        location: "Location",
        startDate: "2024",
        endDate: "Present",
        current: true,
        summary: "Overview of responsibilities",
        highlights: ["Key measurable achievement"]
      });
    });
    renderExperienceFormList();
  });

  document.getElementById("btn-add-project")?.addEventListener("click", () => {
    stateManager.updateState(s => {
      s.projects.unshift({
        id: `proj-${Date.now()}`,
        name: "New Project",
        description: "Project architecture and outcomes.",
        keywords: ["TypeScript", "API"],
        highlights: ["Delivered feature with measurable impact"]
      });
    });
    renderProjectsFormList();
  });

  document.getElementById("btn-add-education")?.addEventListener("click", () => {
    stateManager.updateState(s => {
      s.education.unshift({
        id: `edu-${Date.now()}`,
        institution: "University Name",
        area: "Computer Science",
        studyType: "B.S.",
        startDate: "2018",
        endDate: "2022",
        score: "GPA: 3.8",
        courses: []
      });
    });
    renderEducationFormList();
  });

  document.getElementById("btn-add-skill")?.addEventListener("click", () => {
    stateManager.updateState(s => {
      s.skills.push({
        id: `skill-${Date.now()}`,
        name: "Skill Domain",
        keywords: ["Tool 1", "Tool 2"]
      });
    });
    renderSkillsFormList();
  });
}

function renderExperienceFormList() {
  const container = document.getElementById("form-experience-container");
  if (!container) return;
  const state = stateManager.getState();
  container.innerHTML = "";

  state.experience.forEach((exp, idx) => {
    const card = document.createElement("div");
    card.className = "item-card";
    card.innerHTML = `
      <div class="item-card-head">
        <span class="item-card-title">${escapeVal(exp.position || "Role")} @ ${escapeVal(exp.company || "Company")}</span>
        <button type="button" class="btn-remove-item">✕ Remove</button>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Job Title / Position</label>
          <input type="text" class="form-input exp-position" value="${escapeVal(exp.position)}">
        </div>
        <div class="form-group">
          <label class="form-label">Company / Lab</label>
          <input type="text" class="form-input exp-company" value="${escapeVal(exp.company)}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Start Date</label>
          <input type="text" class="form-input exp-start" value="${escapeVal(exp.startDate)}">
        </div>
        <div class="form-group">
          <label class="form-label">End Date</label>
          <input type="text" class="form-input exp-end" value="${escapeVal(exp.endDate)}">
        </div>
        <div class="form-group">
          <label class="form-label">Location</label>
          <input type="text" class="form-input exp-loc" value="${escapeVal(exp.location)}">
        </div>
      </div>
      <div class="form-group" style="margin-bottom:8px;">
        <label class="form-label">Role Overview / Summary</label>
        <input type="text" class="form-input exp-summary" value="${escapeVal(exp.summary)}">
      </div>
      <div class="form-group">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <label class="form-label">Bullet Highlights (Impact & Achievements)</label>
          <button type="button" class="btn-add-bullet" style="background:transparent; border:none; color:var(--accent-blue); font-size:0.75rem; cursor:pointer; font-weight:600;">+ Add Highlight</button>
        </div>
        <div class="bullet-list-container"></div>
      </div>
    `;

    // Bind inputs
    card.querySelector(".exp-position").addEventListener("input", e => {
      stateManager.updateState(s => { s.experience[idx].position = e.target.value; });
    });
    card.querySelector(".exp-company").addEventListener("input", e => {
      stateManager.updateState(s => { s.experience[idx].company = e.target.value; });
    });
    card.querySelector(".exp-start").addEventListener("input", e => {
      stateManager.updateState(s => { s.experience[idx].startDate = e.target.value; });
    });
    card.querySelector(".exp-end").addEventListener("input", e => {
      stateManager.updateState(s => { s.experience[idx].endDate = e.target.value; });
    });
    card.querySelector(".exp-loc").addEventListener("input", e => {
      stateManager.updateState(s => { s.experience[idx].location = e.target.value; });
    });
    card.querySelector(".exp-summary").addEventListener("input", e => {
      stateManager.updateState(s => { s.experience[idx].summary = e.target.value; });
    });

    // Remove
    card.querySelector(".btn-remove-item").addEventListener("click", () => {
      stateManager.updateState(s => { s.experience.splice(idx, 1); });
      renderExperienceFormList();
    });

    // Bullets List
    const bulletContainer = card.querySelector(".bullet-list-container");
    const bullets = exp.highlights || [];
    bullets.forEach((bulletText, bIdx) => {
      const bItem = document.createElement("div");
      bItem.className = "bullet-item";
      bItem.innerHTML = `
        <textarea class="bullet-input" rows="2">${escapeVal(bulletText)}</textarea>
        <button type="button" class="btn-polish-bullet" title="Rewrite with Google XYZ formula & power verbs">Optimize</button>
        <button type="button" class="btn-remove-item" title="Delete bullet">✕</button>
      `;

      bItem.querySelector(".bullet-input").addEventListener("input", e => {
        stateManager.updateState(s => { s.experience[idx].highlights[bIdx] = e.target.value; });
      });

      bItem.querySelector(".btn-polish-bullet").addEventListener("click", () => {
        // Switch to AI tab and auto-fill
        const aiTabBtn = document.querySelector('[data-tab="ai"]');
        aiTabBtn?.click();
        const aiInput = document.getElementById("ai-bullet-input");
        const aiRole = document.getElementById("ai-role-context");
        if (aiInput) aiInput.value = bulletText;
        if (aiRole) aiRole.value = `${exp.position} at ${exp.company}`;
        document.getElementById("btn-generate-ai")?.click();
      });

      bItem.querySelector(".btn-remove-item").addEventListener("click", () => {
        stateManager.updateState(s => { s.experience[idx].highlights.splice(bIdx, 1); });
        renderExperienceFormList();
      });

      bulletContainer.appendChild(bItem);
    });

    card.querySelector(".btn-add-bullet").addEventListener("click", () => {
      stateManager.updateState(s => {
        if (!s.experience[idx].highlights) s.experience[idx].highlights = [];
        s.experience[idx].highlights.push("New measurable achievement");
      });
      renderExperienceFormList();
    });

    container.appendChild(card);
  });
}

function renderProjectsFormList() {
  const container = document.getElementById("form-projects-container");
  if (!container) return;
  const state = stateManager.getState();
  container.innerHTML = "";

  state.projects.forEach((proj, idx) => {
    const card = document.createElement("div");
    card.className = "item-card";
    card.innerHTML = `
      <div class="item-card-head">
        <span class="item-card-title">${escapeVal(proj.name || "Project")}</span>
        <button type="button" class="btn-remove-item">✕ Remove</button>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Project Name</label>
          <input type="text" class="form-input p-name" value="${escapeVal(proj.name)}">
        </div>
        <div class="form-group">
          <label class="form-label">URL / Repository</label>
          <input type="url" class="form-input p-url" value="${escapeVal(proj.url)}">
        </div>
      </div>
      <div class="form-group" style="margin-bottom:8px;">
        <label class="form-label">Description</label>
        <input type="text" class="form-input p-desc" value="${escapeVal(proj.description)}">
      </div>
      <div class="form-group">
        <label class="form-label">Technologies (comma-separated)</label>
        <input type="text" class="form-input p-tech" value="${escapeVal((proj.keywords || []).join(', '))}">
      </div>
    `;

    card.querySelector(".p-name").addEventListener("input", e => {
      stateManager.updateState(s => { s.projects[idx].name = e.target.value; });
    });
    card.querySelector(".p-url").addEventListener("input", e => {
      stateManager.updateState(s => { s.projects[idx].url = e.target.value; });
    });
    card.querySelector(".p-desc").addEventListener("input", e => {
      stateManager.updateState(s => { s.projects[idx].description = e.target.value; });
    });
    card.querySelector(".p-tech").addEventListener("input", e => {
      stateManager.updateState(s => {
        s.projects[idx].keywords = e.target.value.split(",").map(k => k.trim()).filter(Boolean);
      });
    });

    card.querySelector(".btn-remove-item").addEventListener("click", () => {
      stateManager.updateState(s => { s.projects.splice(idx, 1); });
      renderProjectsFormList();
    });

    container.appendChild(card);
  });
}

function renderEducationFormList() {
  const container = document.getElementById("form-education-container");
  if (!container) return;
  const state = stateManager.getState();
  container.innerHTML = "";

  state.education.forEach((edu, idx) => {
    const card = document.createElement("div");
    card.className = "item-card";
    card.innerHTML = `
      <div class="item-card-head">
        <span class="item-card-title">${escapeVal(edu.studyType || "Degree")} @ ${escapeVal(edu.institution || "School")}</span>
        <button type="button" class="btn-remove-item">✕ Remove</button>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Institution</label>
          <input type="text" class="form-input edu-inst" value="${escapeVal(edu.institution)}">
        </div>
        <div class="form-group">
          <label class="form-label">Degree & Major</label>
          <input type="text" class="form-input edu-area" value="${escapeVal(edu.studyType)} in ${escapeVal(edu.area)}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Dates</label>
          <input type="text" class="form-input edu-dates" value="${escapeVal(edu.startDate)} – ${escapeVal(edu.endDate)}">
        </div>
        <div class="form-group">
          <label class="form-label">Score / Honors</label>
          <input type="text" class="form-input edu-score" value="${escapeVal(edu.score)}">
        </div>
      </div>
    `;

    card.querySelector(".edu-inst").addEventListener("input", e => {
      stateManager.updateState(s => { s.education[idx].institution = e.target.value; });
    });
    card.querySelector(".edu-score").addEventListener("input", e => {
      stateManager.updateState(s => { s.education[idx].score = e.target.value; });
    });
    card.querySelector(".btn-remove-item").addEventListener("click", () => {
      stateManager.updateState(s => { s.education.splice(idx, 1); });
      renderEducationFormList();
    });

    container.appendChild(card);
  });
}

function renderSkillsFormList() {
  const container = document.getElementById("form-skills-container");
  if (!container) return;
  const state = stateManager.getState();
  container.innerHTML = "";

  state.skills.forEach((sItem, idx) => {
    const card = document.createElement("div");
    card.className = "item-card";
    card.innerHTML = `
      <div class="item-card-head">
        <span class="item-card-title">${escapeVal(sItem.name || "Category")}</span>
        <button type="button" class="btn-remove-item">✕ Remove</button>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Category Name</label>
          <input type="text" class="form-input s-cat" value="${escapeVal(sItem.name)}">
        </div>
        <div class="form-group" style="flex:2;">
          <label class="form-label">Keywords (comma-separated)</label>
          <input type="text" class="form-input s-keywords" value="${escapeVal((sItem.keywords || []).join(', '))}">
        </div>
      </div>
    `;

    card.querySelector(".s-cat").addEventListener("input", e => {
      stateManager.updateState(s => { s.skills[idx].name = e.target.value; });
    });
    card.querySelector(".s-keywords").addEventListener("input", e => {
      stateManager.updateState(s => {
        s.skills[idx].keywords = e.target.value.split(",").map(k => k.trim()).filter(Boolean);
      });
    });
    card.querySelector(".btn-remove-item").addEventListener("click", () => {
      stateManager.updateState(s => { s.skills.splice(idx, 1); });
      renderSkillsFormList();
    });

    container.appendChild(card);
  });
}

/**
 * Resume-as-Code Synchronizer (YAML & Markdown)
 */
function initCodeSynchronizer() {
  const editorArea = document.getElementById("code-editor-area");
  const btnYaml = document.getElementById("btn-code-tab-yaml");
  const btnMd = document.getElementById("btn-code-tab-md");
  const btnSync = document.getElementById("btn-sync-code");

  btnYaml?.addEventListener("click", () => {
    activeCodeMode = "yaml";
    btnYaml.classList.add("primary");
    btnMd.classList.remove("primary");
    updateCodeEditorContent();
  });

  btnMd?.addEventListener("click", () => {
    activeCodeMode = "md";
    btnMd.classList.add("primary");
    btnYaml.classList.remove("primary");
    updateCodeEditorContent();
  });

  btnSync?.addEventListener("click", () => {
    const text = editorArea.value;
    try {
      if (activeCodeMode === "yaml") {
        const updated = yamlToState(text, stateManager.getState());
        stateManager.updateState(updated);
        showToast("Synced YAML directly to resume!", "success");
      } else {
        showToast("Markdown synced! (For full structure, YAML mode is recommended).", "info");
      }
    } catch (err) {
      showToast("Sync parse error: " + err.message, "error");
    }
  });
}

function updateCodeEditorContent() {
  const editorArea = document.getElementById("code-editor-area");
  if (!editorArea) return;
  const state = stateManager.getState();
  if (activeCodeMode === "yaml") {
    editorArea.value = stateToYaml(state);
  } else {
    editorArea.value = stateToMarkdown(state);
  }
}

/**
 * ATS Matcher Controller (Resume-Matcher style)
 */
function initAtsMatcher() {
  const jdInput = document.getElementById("ats-jd-input");
  const btnRun = document.getElementById("btn-run-ats");
  const resultsBox = document.getElementById("ats-results-box");
  const presetBtns = document.querySelectorAll(".btn-preset-jd");

  presetBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const pKey = btn.dataset.preset;
      const preset = SAMPLE_JOB_DESCRIPTIONS[pKey];
      if (preset && jdInput) {
        jdInput.value = preset.text;
        showToast(`Loaded ${preset.title} JD!`, "info");
        btnRun?.click();
      }
    });
  });

  btnRun?.addEventListener("click", () => {
    const jdText = jdInput.value.trim();
    if (!jdText) {
      showToast("Please paste a Job Description first.", "warning");
      return;
    }

    const state = stateManager.getState();
    const result = analyzeAtsMatch(state, jdText);

    if (resultsBox) resultsBox.style.display = "block";

    // Update gauge & score
    const gauge = document.getElementById("ats-gauge-circle");
    const scoreNum = document.getElementById("ats-score-text");
    const matchLevel = document.getElementById("ats-match-level");
    const matchDesc = document.getElementById("ats-match-desc");

    if (gauge) gauge.style.setProperty("--score", result.score);
    if (scoreNum) scoreNum.textContent = `${result.score}%`;

    if (result.score >= 75) {
      matchLevel.textContent = "High ATS Match (Optimal)";
      matchLevel.style.color = "#34d399";
      matchDesc.textContent = "High probability of passing automated screening filters for this position.";
    } else if (result.score >= 50) {
      matchLevel.textContent = "Moderate ATS Match";
      matchLevel.style.color = "#facc15";
      matchDesc.textContent = "Good foundation, but missing several prominent domain skills mentioned in the JD.";
    } else {
      matchLevel.textContent = "Low ATS Match (Gaps Detected)";
      matchLevel.style.color = "#fb7185";
      matchDesc.textContent = "Significant keyword gap detected. Incorporate the missing keywords listed below.";
    }

    // Matched Cloud
    const matchedCount = document.getElementById("ats-matched-count");
    const matchedCloud = document.getElementById("ats-matched-cloud");
    if (matchedCount) matchedCount.textContent = result.matchedCount;
    if (matchedCloud) {
      matchedCloud.innerHTML = result.matched.slice(0, 30).map(m => `
        <span class="kw-chip matched">${escapeVal(m.keyword)} (${m.resumeCount}x)</span>
      `).join("");
    }

    // Missing Cloud
    const missingCount = document.getElementById("ats-missing-count");
    const missingCloud = document.getElementById("ats-missing-cloud");
    if (missingCount) missingCount.textContent = result.missingCount;
    if (missingCloud) {
      missingCloud.innerHTML = result.missing.slice(0, 25).map(m => `
        <span class="kw-chip missing" title="Click to add to Skills" data-kw="${escapeVal(m.keyword)}">+ ${escapeVal(m.keyword)}</span>
      `).join("");

      // Add click to add missing skill
      missingCloud.querySelectorAll(".kw-chip.missing").forEach(chip => {
        chip.addEventListener("click", () => {
          const kw = chip.dataset.kw;
          stateManager.updateState(s => {
            if (!s.skills || s.skills.length === 0) {
              s.skills = [{ id: "skill-1", name: "Target Skills", keywords: [kw] }];
            } else {
              s.skills[0].keywords.push(kw);
            }
          });
          chip.remove();
          renderSkillsFormList();
          showToast(`Added "${kw}" to Skills section!`, "success");
        });
      });
    }

    // Audit list
    const auditList = document.getElementById("ats-audit-list");
    if (auditList) {
      auditList.innerHTML = result.auditChecks.map(c => `
        <div class="audit-item ${c.passed ? 'passed' : 'failed'}">
          <span class="audit-icon">${c.passed ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>` : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`}</span>
          <div>
            <div class="audit-title">${escapeVal(c.name)}</div>
            <div class="audit-detail">${escapeVal(c.detail)}</div>
          </div>
        </div>
      `).join("");
    }

    showToast(`ATS Scan complete: ${result.score}% keyword match.`, "success");
  });
}

/**
 * AI Assistant & Bullet Polisher (JadeAI style)
 */
function initAiAssistant() {
  const bulletInput = document.getElementById("ai-bullet-input");
  const roleContext = document.getElementById("ai-role-context");
  const btnGenerate = document.getElementById("btn-generate-ai");
  const container = document.getElementById("ai-variations-container");

  btnGenerate?.addEventListener("click", async () => {
    const rawBullet = bulletInput.value.trim();
    if (!rawBullet) {
      showToast("Please enter a bullet point to polish.", "warning");
      return;
    }

    const apiKey = document.getElementById("byok-key")?.value?.trim();
    const baseUrl = document.getElementById("byok-base-url")?.value?.trim();
    const model = document.getElementById("byok-model")?.value?.trim();

    container.innerHTML = `<div style="color:var(--accent-cyan); font-size:0.85rem; padding:10px;">Generating high-impact variations...</div>`;

    try {
      let variations = [];
      if (apiKey) {
        variations = await enhanceBulletWithAI({
          apiKey,
          baseUrl,
          model,
          prompt: roleContext.value,
          bullet: rawBullet
        });
      } else {
        // Offline Local Engine
        variations = enhanceBulletLocal(rawBullet, roleContext.value);
      }

      container.innerHTML = "";
      variations.forEach(v => {
        const card = document.createElement("div");
        card.className = "ai-variation-card";
        card.innerHTML = `
          <span class="ai-card-badge">${v.type || v.badge || "Impact"}</span>
          <p class="ai-variation-text">${escapeVal(v.text)}</p>
          <button type="button" class="btn-apply-variation">Apply to Experience</button>
        `;

        card.querySelector(".btn-apply-variation").addEventListener("click", () => {
          stateManager.updateState(s => {
            if (s.experience && s.experience.length > 0) {
              if (!s.experience[0].highlights) s.experience[0].highlights = [];
              s.experience[0].highlights.unshift(v.text);
            }
          });
          renderExperienceFormList();
          showToast("Applied AI variation to Experience highlight!", "success");
        });

        container.appendChild(card);
      });
    } catch (err) {
      container.innerHTML = `<div style="color:var(--accent-rose); font-size:0.8rem;">Error: ${err.message}. Falling back to offline engine.</div>`;
      const fallback = enhanceBulletLocal(rawBullet, roleContext.value);
      fallback.forEach(v => {
        const card = document.createElement("div");
        card.className = "ai-variation-card";
        card.innerHTML = `
          <span class="ai-card-badge">${v.badge}</span>
          <p class="ai-variation-text">${escapeVal(v.text)}</p>
          <button type="button" class="btn-apply-variation">Apply to Experience</button>
        `;
        card.querySelector(".btn-apply-variation").addEventListener("click", () => {
          stateManager.updateState(s => {
            if (s.experience?.length > 0) s.experience[0].highlights.unshift(v.text);
          });
          renderExperienceFormList();
          showToast("Applied to experience!", "success");
        });
        container.appendChild(card);
      });
    }
  });

  // Local Docker & Cloud Presets
  const btnPresetDocker = document.getElementById("btn-preset-local-docker");
  const btnPresetVps = document.getElementById("btn-preset-vps-docker");
  const btnPresetGroq = document.getElementById("btn-preset-groq");
  const btnPresetOpenai = document.getElementById("btn-preset-openai");
  const btnTestLlm = document.getElementById("btn-test-llm-connection");
  const llmStatus = document.getElementById("llm-connection-status");
  const baseUrlInput = document.getElementById("byok-base-url");
  const modelInput = document.getElementById("byok-model");
  const keyInput = document.getElementById("byok-key");

  btnPresetDocker?.addEventListener("click", () => {
    if (baseUrlInput) baseUrlInput.value = "http://localhost:11434/v1";
    if (modelInput) modelInput.value = "qwen2.5:7b-instruct";
    if (keyInput) keyInput.value = "ollama";
    showToast("Loaded Local Docker (Ollama) preset!", "info");
    btnTestLlm?.click();
  });

  btnPresetVps?.addEventListener("click", () => {
    if (baseUrlInput) baseUrlInput.value = "https://llm.yourdomain.com/v1";
    if (modelInput) modelInput.value = "qwen2.5:7b-instruct";
    showToast("Loaded Remote VPS preset! Enter your VPS token and URL.", "info");
  });

  btnPresetGroq?.addEventListener("click", () => {
    if (baseUrlInput) baseUrlInput.value = "https://api.groq.com/openai/v1";
    if (modelInput) modelInput.value = "llama-3.3-70b-versatile";
    if (keyInput) keyInput.value = "";
    showToast("Loaded Groq preset! Enter your Groq API key.", "info");
  });

  btnPresetOpenai?.addEventListener("click", () => {
    if (baseUrlInput) baseUrlInput.value = "https://api.openai.com/v1";
    if (modelInput) modelInput.value = "gpt-4o-mini";
    if (keyInput) keyInput.value = "";
    showToast("Loaded OpenAI preset! Enter your API key.", "info");
  });

  btnTestLlm?.addEventListener("click", async () => {
    const bUrl = baseUrlInput?.value?.trim() || "http://localhost:11434/v1";
    const apiKey = keyInput?.value?.trim() || "ollama";
    if (llmStatus) {
      llmStatus.textContent = "Connecting to LLM...";
      llmStatus.style.color = "#38bdf8";
    }

    try {
      const endpoint = `${bUrl.replace(/\/+$/, "")}/models`;
      const res = await fetch(endpoint, {
        headers: { "Authorization": `Bearer ${apiKey}` }
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const modelList = data.data ? data.data.map(m => m.id) : [];
      if (modelList.length > 0 && modelInput) {
        modelInput.value = modelList[0];
      }
      if (llmStatus) {
        llmStatus.textContent = `Connected (Active) (${modelList.slice(0, 2).join(", ") || "Active"})`;
        llmStatus.style.color = "#34d399";
      }
      showToast("Connected to LLM engine successfully!", "success");
    } catch (err) {
      if (llmStatus) {
        llmStatus.textContent = `Offline: Check Docker & OLLAMA_ORIGINS=*`;
        llmStatus.style.color = "#f59e0b";
      }
      showToast(`LLM offline (${err.message}). Using local rule engine.`, "warning");
    }
  });
}

/**
 * Academic Citations & BibTeX Parser (Hugo Blox style)
 */
function initAcademicBibtex() {
  const pasteArea = document.getElementById("bibtex-paste-input");
  const btnParse = document.getElementById("btn-parse-bibtex");
  const pubCountBadge = document.getElementById("pub-count-badge");
  const pubContainer = document.getElementById("form-publications-container");
  const btnAddPub = document.getElementById("btn-add-publication");

  function refreshPubs() {
    const state = stateManager.getState();
    const pubs = state.publications || [];
    if (pubCountBadge) pubCountBadge.textContent = pubs.length;
    if (!pubContainer) return;
    pubContainer.innerHTML = "";

    pubs.forEach((pub, idx) => {
      const card = document.createElement("div");
      card.className = "item-card";
      card.innerHTML = `
        <div class="item-card-head">
          <span class="item-card-title">${escapeVal(pub.title || "Paper")}</span>
          <button type="button" class="btn-remove-item">✕ Remove</button>
        </div>
        <div class="form-row">
          <div class="form-group" style="flex:2;">
            <label class="form-label">Paper Title</label>
            <input type="text" class="form-input pub-title" value="${escapeVal(pub.title)}">
          </div>
          <div class="form-group">
            <label class="form-label">Year / Date</label>
            <input type="text" class="form-input pub-date" value="${escapeVal(pub.releaseDate)}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Authors</label>
            <input type="text" class="form-input pub-auth" value="${escapeVal(pub.authors)}">
          </div>
          <div class="form-group">
            <label class="form-label">Journal / Venue</label>
            <input type="text" class="form-input pub-venue" value="${escapeVal(pub.publisher)}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">DOI</label>
            <input type="text" class="form-input pub-doi" value="${escapeVal(pub.doi)}">
          </div>
          <div class="form-group">
            <label class="form-label">Link</label>
            <input type="url" class="form-input pub-url" value="${escapeVal(pub.url)}">
          </div>
        </div>
      `;

      card.querySelector(".pub-title").addEventListener("input", e => {
        stateManager.updateState(s => { s.publications[idx].title = e.target.value; });
      });
      card.querySelector(".pub-date").addEventListener("input", e => {
        stateManager.updateState(s => { s.publications[idx].releaseDate = e.target.value; });
      });
      card.querySelector(".pub-auth").addEventListener("input", e => {
        stateManager.updateState(s => { s.publications[idx].authors = e.target.value; });
      });
      card.querySelector(".pub-venue").addEventListener("input", e => {
        stateManager.updateState(s => { s.publications[idx].publisher = e.target.value; });
      });
      card.querySelector(".pub-doi").addEventListener("input", e => {
        stateManager.updateState(s => { s.publications[idx].doi = e.target.value; });
      });
      card.querySelector(".pub-url").addEventListener("input", e => {
        stateManager.updateState(s => { s.publications[idx].url = e.target.value; });
      });

      card.querySelector(".btn-remove-item").addEventListener("click", () => {
        stateManager.updateState(s => { s.publications.splice(idx, 1); });
        refreshPubs();
      });

      pubContainer.appendChild(card);
    });
  }

  btnParse?.addEventListener("click", () => {
    const bibStr = pasteArea.value.trim();
    if (!bibStr) {
      showToast("Please paste BibTeX citation text first.", "warning");
      return;
    }
    const parsed = parseBibtex(bibStr);
    if (parsed.length > 0) {
      stateManager.updateState(s => {
        s.publications = [...(s.publications || []), ...parsed];
        if (!s.sectionsVisibility.publications) s.sectionsVisibility.publications = true;
      });
      pasteArea.value = "";
      refreshPubs();
      showToast(`Parsed & added ${parsed.length} publication entries!`, "success");
    } else {
      showToast("Could not find valid BibTeX @article or @inproceedings entries.", "error");
    }
  });

  btnAddPub?.addEventListener("click", () => {
    stateManager.updateState(s => {
      if (!s.publications) s.publications = [];
      s.publications.unshift({
        id: `pub-${Date.now()}`,
        title: "New Scholarly Paper Title",
        authors: s.basics.name || "Author",
        publisher: "Conference / Journal Name",
        releaseDate: "2024",
        doi: "",
        url: ""
      });
    });
    refreshPubs();
  });

  refreshPubs();
}

/**
 * Settings & Spacing Sliders (Oh-My-CV style)
 */
function initSettingsAndTypography() {
  const fontSelect = document.getElementById("font-family-select");
  const fontSizeSlider = document.getElementById("font-size-slider");
  const fontSizeVal = document.getElementById("font-size-val");
  const lineHeightSlider = document.getElementById("line-height-slider");
  const lineHeightVal = document.getElementById("line-height-val");
  const marginSlider = document.getElementById("margin-slider");
  const marginVal = document.getElementById("margin-val");
  const paperSelect = document.getElementById("paper-size-select");
  const btnReset = document.getElementById("btn-reset-profile");

  const state = stateManager.getState();
  if (fontSelect) fontSelect.value = state.settings.fontFamily || "Inter";
  if (fontSizeSlider) fontSizeSlider.value = parseFloat(state.settings.fontSize) || 9.5;
  if (fontSizeVal) fontSizeVal.textContent = state.settings.fontSize || "9.5pt";
  if (lineHeightSlider) lineHeightSlider.value = parseFloat(state.settings.lineHeight) || 1.45;
  if (lineHeightVal) lineHeightVal.textContent = state.settings.lineHeight || "1.45";
  if (marginSlider) marginSlider.value = parseInt(state.settings.pageMargin, 10) || 14;
  if (marginVal) marginVal.textContent = state.settings.pageMargin || "14mm";

  fontSelect?.addEventListener("change", e => {
    stateManager.updateState(s => { s.settings.fontFamily = e.target.value; });
  });

  fontSizeSlider?.addEventListener("input", e => {
    const val = `${e.target.value}pt`;
    if (fontSizeVal) fontSizeVal.textContent = val;
    stateManager.updateState(s => { s.settings.fontSize = val; });
  });

  lineHeightSlider?.addEventListener("input", e => {
    const val = e.target.value;
    if (lineHeightVal) lineHeightVal.textContent = val;
    stateManager.updateState(s => { s.settings.lineHeight = val; });
  });

  marginSlider?.addEventListener("input", e => {
    const val = `${e.target.value}mm`;
    if (marginVal) marginVal.textContent = val;
    stateManager.updateState(s => { s.settings.pageMargin = val; });
  });

  paperSelect?.addEventListener("change", e => {
    stateManager.updateState(s => { s.settings.paperSize = e.target.value; });
  });

  btnReset?.addEventListener("click", () => {
    if (confirm("Reset resume profile back to default full-stack/AI sample?")) {
      stateManager.resetToDefault();
      location.reload();
    }
  });
}

/**
 * Header Controls (Themes, Mode Switcher, Exports)
 */
function initHeaderActions() {
  const modeResumeBtn = document.getElementById("mode-resume-btn");
  const modePortBtn = document.getElementById("mode-portfolio-btn");
  const themeSelect = document.getElementById("theme-select");
  const colorInput = document.getElementById("primary-color-input");
  const btnImport = document.getElementById("btn-import-file");
  const fileInput = document.getElementById("file-import-input");
  const exportSelect = document.getElementById("export-dropdown");
  const btnQuickPdf = document.getElementById("btn-quick-pdf");

  // Mode Toggle
  modeResumeBtn?.addEventListener("click", () => {
    modeResumeBtn.classList.add("active");
    modePortBtn.classList.remove("active");
    stateManager.updateState(s => { s.settings.viewMode = "resume"; });
  });

  modePortBtn?.addEventListener("click", () => {
    modePortBtn.classList.add("active");
    modeResumeBtn.classList.remove("active");
    stateManager.updateState(s => { s.settings.viewMode = "portfolio"; });
  });

  // Themes
  themeSelect?.addEventListener("change", e => {
    stateManager.updateState(s => { s.settings.theme = e.target.value; });
  });

  // Accent Color
  colorInput?.addEventListener("input", e => {
    stateManager.updateState(s => { s.settings.primaryColor = e.target.value; });
  });

  // Import trigger
  btnImport?.addEventListener("click", () => fileInput?.click());

  // Export actions
  exportSelect?.addEventListener("change", e => {
    const action = e.target.value;
    const state = stateManager.getState();

    if (action === "pdf") {
      exportResumePdf();
    } else if (action === "yaml") {
      exportResumeYaml(state);
      showToast("Downloaded YAML Resume-as-code file!", "success");
    } else if (action === "json") {
      exportResumeJson(state);
      showToast("Downloaded JSON Resume schema file!", "success");
    } else if (action === "md") {
      exportResumeMarkdown(state);
      showToast("Downloaded Markdown resume file!", "success");
    } else if (action === "bib") {
      exportResumeBibtex(state);
      showToast("Downloaded BibTeX publications file!", "success");
    } else if (action === "html") {
      const rendered = document.getElementById("resume-preview-container").innerHTML;
      exportStandaloneHtml(state, rendered, "");
      showToast("Downloaded Standalone HTML portfolio!", "success");
    }

    exportSelect.value = "";
  });

  btnQuickPdf?.addEventListener("click", () => {
    exportResumePdf();
  });
}

/**
 * Zoom Controls
 */
function initZoomControls() {
  const btnOut = document.getElementById("btn-zoom-out");
  const btnIn = document.getElementById("btn-zoom-in");
  const btnFit = document.getElementById("btn-zoom-fit");
  const label = document.getElementById("zoom-level-label");
  const wrapper = document.getElementById("preview-wrapper");

  function applyZoom(z) {
    currentZoom = Math.min(1.8, Math.max(0.4, z));
    if (label) label.textContent = `${Math.round(currentZoom * 100)}%`;
    if (wrapper) wrapper.style.transform = `scale(${currentZoom})`;
  }

  btnOut?.addEventListener("click", () => applyZoom(currentZoom - 0.15));
  btnIn?.addEventListener("click", () => applyZoom(currentZoom + 0.15));
  btnFit?.addEventListener("click", () => {
    const viewport = document.getElementById("preview-scroll-container");
    if (viewport) {
      const availWidth = viewport.clientWidth - 60;
      const sheetWidthPx = 794; // approx A4 210mm at 96dpi
      const fitZoom = Math.min(1.0, availWidth / sheetWidthPx);
      applyZoom(fitZoom);
    }
  });

  // Default initial zoom
  applyZoom(0.95);
}

function escapeVal(v) {
  if (!v) return "";
  return String(v).replace(/"/g, "&quot;");
}

/**
 * Universal Multi-Format Document & File Importer Controller
 * Supports ANY file: PDF, DOCX, TXT, MD, YAML, JSON, BIB, HTML, PNG/JPG
 */
let pendingImportData = null;

function initUniversalImporter() {
  const modalOverlay = document.getElementById("import-modal-overlay");
  const btnClose = document.getElementById("btn-close-import-modal");
  const btnCancel = document.getElementById("btn-cancel-import");
  const btnConfirm = document.getElementById("btn-confirm-import");
  const dropzone = document.getElementById("modal-dropzone");
  const fileInput = document.getElementById("file-import-input");
  const btnImportHeader = document.getElementById("btn-import-file");
  const dragOverlay = document.getElementById("fullscreen-drag-overlay");
  const previewSection = document.getElementById("import-preview-section");
  const fileNameEl = document.getElementById("import-file-name");
  const rawPasteArea = document.getElementById("import-raw-paste");
  const btnParsePasted = document.getElementById("btn-parse-pasted-text");

  function openModal() {
    if (modalOverlay) modalOverlay.classList.add("active");
  }

  function closeModal() {
    if (modalOverlay) modalOverlay.classList.remove("active");
    pendingImportData = null;
    if (previewSection) previewSection.style.display = "none";
    if (btnConfirm) btnConfirm.disabled = true;
    if (fileInput) fileInput.value = "";
  }

  btnImportHeader?.addEventListener("click", () => {
    openModal();
  });

  btnClose?.addEventListener("click", closeModal);
  btnCancel?.addEventListener("click", closeModal);

  // Close when clicking modal backdrop
  modalOverlay?.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  // Global Fullscreen Drag & Drop
  let dragCounter = 0;
  window.addEventListener("dragenter", (e) => {
    e.preventDefault();
    dragCounter++;
    if (dragOverlay) dragOverlay.classList.add("active");
  });

  window.addEventListener("dragleave", (e) => {
    e.preventDefault();
    dragCounter--;
    if (dragCounter <= 0 && dragOverlay) {
      dragOverlay.classList.remove("active");
      dragCounter = 0;
    }
  });

  window.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  window.addEventListener("drop", async (e) => {
    e.preventDefault();
    dragCounter = 0;
    if (dragOverlay) dragOverlay.classList.remove("active");

    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      openModal();
      await processSelectedFile(file);
    }
  });

  // Dropzone click & drag handlers
  dropzone?.addEventListener("click", () => fileInput?.click());
  fileInput?.addEventListener("change", async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      await processSelectedFile(e.target.files[0]);
    }
  });

  dropzone?.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  });

  dropzone?.addEventListener("dragleave", () => {
    dropzone.classList.remove("dragover");
  });

  dropzone?.addEventListener("drop", async (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processSelectedFile(e.dataTransfer.files[0]);
    }
  });

  async function processSelectedFile(file) {
    showToast(`Analyzing "${file.name}"...`, "info");
    try {
      const extracted = await extractFromFile(file);
      handleParsedData(extracted, file.name);
    } catch (err) {
      showToast(`Extraction error: ${err.message}`, "error");
    }
  }

  function handleParsedData(extracted, name) {
    const currentState = stateManager.getState();
    let structuredResult = null;

    if (extracted.type === "image") {
      stateManager.updateState(s => {
        if (!s.basics) s.basics = {};
        s.basics.image = extracted.dataUrl;
      });
      showToast(`Loaded avatar image from ${name}!`, "success");
      closeModal();
      return;
    }

    if (extracted.type === "json" && extracted.parsedData) {
      structuredResult = extracted.parsedData;
    } else if (extracted.type === "yaml") {
      structuredResult = yamlToState(extracted.rawText, currentState);
    } else if (extracted.type === "bibtex") {
      const pubs = parseBibtex(extracted.rawText);
      structuredResult = JSON.parse(JSON.stringify(currentState));
      structuredResult.publications = pubs;
      if (!structuredResult.sectionsVisibility.publications) {
        structuredResult.sectionsVisibility.publications = true;
      }
    } else {
      // PDF, DOCX, Markdown, Text, HTML
      structuredResult = parseRawResumeText(extracted.rawText, currentState);
    }

    pendingImportData = structuredResult;

    // Display Preview Stats
    if (previewSection) previewSection.style.display = "block";
    if (fileNameEl) fileNameEl.textContent = name;

    const pName = document.getElementById("preview-stat-name");
    const pEmail = document.getElementById("preview-stat-email");
    const pPhone = document.getElementById("preview-stat-phone");
    const pExp = document.getElementById("preview-stat-exp");
    const pSkills = document.getElementById("preview-stat-skills");

    if (pName) pName.textContent = structuredResult.basics?.name || "—";
    if (pEmail) pEmail.textContent = structuredResult.basics?.email || "—";
    if (pPhone) pPhone.textContent = structuredResult.basics?.phone || "—";
    if (pExp) pExp.textContent = (structuredResult.experience?.length || 0).toString();
    if (pSkills) {
      const totalKw = (structuredResult.skills || []).reduce((acc, s) => acc + (s.keywords?.length || 0), 0);
      pSkills.textContent = totalKw.toString();
    }

    if (btnConfirm) btnConfirm.disabled = false;
    showToast(`Successfully analyzed "${name}"!`, "success");
  }

  // Parse pasted raw text
  btnParsePasted?.addEventListener("click", () => {
    const raw = rawPasteArea?.value?.trim();
    if (!raw) {
      showToast("Please paste text first.", "warning");
      return;
    }
    const extracted = { type: "text", rawText: raw };
    handleParsedData(extracted, "Pasted Text");
  });

  // Confirm Import
  btnConfirm?.addEventListener("click", () => {
    if (!pendingImportData) return;

    const strategy = document.querySelector('input[name="import-strategy"]:checked')?.value || "replace";

    if (strategy === "merge") {
      stateManager.updateState(s => {
        if (pendingImportData.basics) {
          if (!s.basics.summary && pendingImportData.basics.summary) s.basics.summary = pendingImportData.basics.summary;
          if (!s.basics.email && pendingImportData.basics.email) s.basics.email = pendingImportData.basics.email;
          if (!s.basics.phone && pendingImportData.basics.phone) s.basics.phone = pendingImportData.basics.phone;
        }
        if (pendingImportData.experience?.length > 0) {
          s.experience = [...(s.experience || []), ...pendingImportData.experience];
        }
        if (pendingImportData.education?.length > 0) {
          s.education = [...(s.education || []), ...pendingImportData.education];
        }
        if (pendingImportData.skills?.length > 0) {
          s.skills = [...(s.skills || []), ...pendingImportData.skills];
        }
        if (pendingImportData.publications?.length > 0) {
          s.publications = [...(s.publications || []), ...pendingImportData.publications];
        }
        if (pendingImportData.projects?.length > 0) {
          s.projects = [...(s.projects || []), ...pendingImportData.projects];
        }
      });
      showToast("Merged imported items with existing resume!", "success");
    } else {
      // Replace
      stateManager.updateState(pendingImportData);
      showToast("Imported new profile into resume!", "success");
    }

    closeModal();
    // Refresh form inputs and code editor
    initFormBindings();
    updateCodeEditorContent();
  });
}

