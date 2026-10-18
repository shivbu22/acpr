/**
 * ACPR Drag-and-Drop & Section Management Engine
 * Inspired by Arman19941113/dnd-resume
 */

export const SECTION_METADATA = {
  experience: { title: "Work Experience", icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>` },
  projects: { title: "Projects & Open Source", icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>` },
  education: { title: "Education", icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>` },
  skills: { title: "Skills & Technologies", icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>` },
  publications: { title: "Academic Publications & Papers", icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>` },
  certifications: { title: "Certifications & Licenses", icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>` },
  awards: { title: "Honors & Awards", icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>` }
};

export function setupSectionManager(containerEl, stateManager) {
  let draggedItem = null;

  function renderList() {
    const state = stateManager.getState();
    const order = state.sectionsOrder || Object.keys(SECTION_METADATA);
    const vis = state.sectionsVisibility || {};

    containerEl.innerHTML = "";

    const helpText = document.createElement("div");
    helpText.className = "dnd-help-hint";
    helpText.innerHTML = `<span>Drag sections or use arrows to reorder. Toggle switches to hide or display on your resume.</span>`;
    containerEl.appendChild(helpText);

    const list = document.createElement("div");
    list.className = "dnd-section-list";

    order.forEach((secKey, index) => {
      const meta = SECTION_METADATA[secKey] || { title: secKey.toUpperCase(), icon: "" };
      const isVisible = vis[secKey] !== false;

      const item = document.createElement("div");
      item.className = `dnd-item ${isVisible ? "active" : "disabled"}`;
      item.setAttribute("draggable", "true");
      item.dataset.key = secKey;
      item.dataset.index = index;

      item.innerHTML = `
        <div class="dnd-handle" title="Drag to reorder">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
            <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
            <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
          </svg>
        </div>
        <div class="dnd-title">
          <span class="dnd-icon">${meta.icon}</span>
          <span class="dnd-label">${meta.title}</span>
        </div>
        <div class="dnd-actions">
          <button type="button" class="dnd-btn btn-up" title="Move Up" ${index === 0 ? "disabled" : ""}>▲</button>
          <button type="button" class="dnd-btn btn-down" title="Move Down" ${index === order.length - 1 ? "disabled" : ""}>▼</button>
          <label class="switch" title="Toggle section visibility">
            <input type="checkbox" class="vis-toggle" ${isVisible ? "checked" : ""}>
            <span class="slider round"></span>
          </label>
        </div>
      `;

      // Event Listeners for reordering
      const btnUp = item.querySelector(".btn-up");
      const btnDown = item.querySelector(".btn-down");
      const toggle = item.querySelector(".vis-toggle");

      btnUp?.addEventListener("click", () => {
        if (index > 0) {
          stateManager.updateState(s => {
            const temp = s.sectionsOrder[index - 1];
            s.sectionsOrder[index - 1] = s.sectionsOrder[index];
            s.sectionsOrder[index] = temp;
          });
          renderList();
        }
      });

      btnDown?.addEventListener("click", () => {
        if (index < order.length - 1) {
          stateManager.updateState(s => {
            const temp = s.sectionsOrder[index + 1];
            s.sectionsOrder[index + 1] = s.sectionsOrder[index];
            s.sectionsOrder[index] = temp;
          });
          renderList();
        }
      });

      toggle.addEventListener("change", (e) => {
        const checked = e.target.checked;
        stateManager.updateState(s => {
          if (!s.sectionsVisibility) s.sectionsVisibility = {};
          s.sectionsVisibility[secKey] = checked;
        });
        item.classList.toggle("active", checked);
        item.classList.toggle("disabled", !checked);
      });

      // Native HTML5 Drag and Drop events
      item.addEventListener("dragstart", (e) => {
        draggedItem = item;
        e.dataTransfer.effectAllowed = "move";
        item.classList.add("dragging");
      });

      item.addEventListener("dragend", () => {
        item.classList.remove("dragging");
        draggedItem = null;
        document.querySelectorAll(".dnd-item").forEach(el => el.classList.remove("drag-over"));
      });

      item.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (item !== draggedItem) {
          item.classList.add("drag-over");
        }
      });

      item.addEventListener("dragleave", () => {
        item.classList.remove("drag-over");
      });

      item.addEventListener("drop", (e) => {
        e.preventDefault();
        item.classList.remove("drag-over");
        if (draggedItem && draggedItem !== item) {
          const fromIndex = parseInt(draggedItem.dataset.index, 10);
          const toIndex = parseInt(item.dataset.index, 10);

          stateManager.updateState(s => {
            const newOrder = [...s.sectionsOrder];
            const [moved] = newOrder.splice(fromIndex, 1);
            newOrder.splice(toIndex, 0, moved);
            s.sectionsOrder = newOrder;
          });
          renderList();
        }
      });

      list.appendChild(item);
    });

    containerEl.appendChild(list);
  }

  renderList();
  stateManager.subscribe(() => renderList());
}
