/**
 * ACPR Multi-Format Export & Import Engine
 * Supports PDF, YAML (RenderCV/yamlresume), JSON, Markdown (LapisCV/oh-my-cv), BibTeX, and HTML Portfolio
 */

import { stateToYaml, stateToMarkdown, stateToBibtex, yamlToState, parseBibtex } from "./parser.js";

export function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportResumePdf() {
  window.print();
}

export function exportResumeYaml(state) {
  const yamlStr = stateToYaml(state);
  const filename = `${sanitizeFilename(state.basics.name)}_resume.yaml`;
  downloadFile(filename, yamlStr, "text/yaml;charset=utf-8");
}

export function exportResumeJson(state) {
  const jsonStr = JSON.stringify(state, null, 2);
  const filename = `${sanitizeFilename(state.basics.name)}_resume.json`;
  downloadFile(filename, jsonStr, "application/json;charset=utf-8");
}

export function exportResumeMarkdown(state) {
  const mdStr = stateToMarkdown(state);
  const filename = `${sanitizeFilename(state.basics.name)}_resume.md`;
  downloadFile(filename, mdStr, "text/markdown;charset=utf-8");
}

export function exportResumeBibtex(state) {
  const bibStr = stateToBibtex(state);
  const filename = `${sanitizeFilename(state.basics.name)}_publications.bib`;
  downloadFile(filename, bibStr, "text/plain;charset=utf-8");
}

export function exportStandaloneHtml(state, renderedHtml, previewCss) {
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${state.basics.name} - Resume & Career Profile</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300&family=Outfit:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    ${previewCss}
    body {
      background: #f1f5f9;
      display: flex;
      justify-content: center;
      padding: 30px 15px;
      margin: 0;
      font-family: ${state.settings.fontFamily || "Inter"}, sans-serif;
    }
    @media print {
      body { background: white; padding: 0; }
    }
  </style>
</head>
<body>
  ${renderedHtml}
</body>
</html>`;

  const filename = `${sanitizeFilename(state.basics.name)}_portfolio.html`;
  downloadFile(filename, fullHtml, "text/html;charset=utf-8");
}

export function setupFileImporter(fileInputEl, stateManager, onFeedback) {
  fileInputEl.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    const name = file.name.toLowerCase();

    reader.onload = (event) => {
      const content = event.target.result;
      try {
        if (name.endsWith(".json")) {
          const parsed = JSON.parse(content);
          stateManager.updateState(parsed);
          onFeedback?.("JSON Resume imported successfully!", "success");
        } else if (name.endsWith(".yaml") || name.endsWith(".yml")) {
          const updated = yamlToState(content, stateManager.getState());
          stateManager.updateState(updated);
          onFeedback?.("YAML Resume-as-code imported successfully!", "success");
        } else if (name.endsWith(".bib")) {
          const pubs = parseBibtex(content);
          if (pubs.length > 0) {
            stateManager.updateState(s => {
              s.publications = [...(s.publications || []), ...pubs];
              if (!s.sectionsVisibility.publications) s.sectionsVisibility.publications = true;
            });
            onFeedback?.(`Imported ${pubs.length} BibTeX publication citations!`, "success");
          } else {
            onFeedback?.("No valid BibTeX entries found in file.", "warning");
          }
        } else if (name.endsWith(".md") || name.endsWith(".markdown")) {
          onFeedback?.("Markdown file loaded into Code Editor tab.", "info");
        } else {
          onFeedback?.("Unsupported file format. Please upload .json, .yaml, or .bib", "error");
        }
      } catch (err) {
        console.error("Import error:", err);
        onFeedback?.(`Import failed: ${err.message}`, "error");
      }
      fileInputEl.value = "";
    };

    reader.readAsText(file);
  });
}

function sanitizeFilename(name) {
  if (!name) return "acpr";
  return name.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_");
}
