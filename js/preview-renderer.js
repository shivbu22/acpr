/**
 * ACPR Resume & Web Portfolio Renderer
 * Generates both ATS-optimized A4 Print Document and Interactive Web Portfolio
 */

export function renderResume(state) {
  const { basics, settings } = state;
  const order = state.sectionsOrder || ["experience", "projects", "education", "publications", "skills", "certifications", "awards"];
  const vis = state.sectionsVisibility || {};
  const theme = settings.theme || "modern";

  // Section renderers mapping
  const sectionRenderers = {
    experience: () => renderExperienceSection(state.experience),
    projects: () => renderProjectsSection(state.projects),
    education: () => renderEducationSection(state.education),
    skills: () => renderSkillsSection(state.skills),
    publications: () => renderPublicationsSection(state.publications),
    certifications: () => renderCertificationsSection(state.certifications),
    awards: () => renderAwardsSection(state.awards)
  };

  const sectionsHtml = order
    .filter(key => vis[key] !== false && sectionRenderers[key])
    .map(key => sectionRenderers[key]())
    .filter(Boolean)
    .join("\n");

  return `
    <div class="resume-sheet theme-${theme}" style="--primary-color: ${settings.primaryColor || '#0ea5e9'}; --base-font-size: ${settings.fontSize || '9.5pt'}; --page-margin: ${settings.pageMargin || '14mm'}; --line-height: ${settings.lineHeight || '1.45'}; font-family: '${settings.fontFamily || 'Plus Jakarta Sans'}', sans-serif;">
      ${renderHeader(basics, theme)}
      ${basics.summary ? `
        <section class="resume-section section-summary">
          <h2 class="section-title">Summary</h2>
          <div class="summary-text">${escapeHtml(basics.summary)}</div>
        </section>
      ` : ""}
      ${sectionsHtml}
    </div>
  `;
}

function renderHeader(basics, theme) {
  const contactItems = [];
  const svgMail = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-right:2px;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`;
  const svgPhone = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-right:2px;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;
  const svgPin = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-right:2px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
  const svgGlobe = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-right:2px;"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;
  const svgLink = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-right:2px;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;

  if (basics.email) contactItems.push(`<a href="mailto:${basics.email}" class="contact-link"><span class="icon">${svgMail}</span>${escapeHtml(basics.email)}</a>`);
  if (basics.phone) contactItems.push(`<span class="contact-item"><span class="icon">${svgPhone}</span>${escapeHtml(basics.phone)}</span>`);
  if (basics.location?.city) contactItems.push(`<span class="contact-item"><span class="icon">${svgPin}</span>${escapeHtml(basics.location.city)}</span>`);
  if (basics.url) contactItems.push(`<a href="${basics.url}" target="_blank" rel="noopener" class="contact-link"><span class="icon">${svgGlobe}</span>${escapeHtml(basics.url.replace(/^https?:\/\//, ''))}</a>`);

  if (basics.profiles) {
    basics.profiles.forEach(p => {
      contactItems.push(`<a href="${p.url}" target="_blank" rel="noopener" class="contact-link"><span class="icon">${svgLink}</span>${escapeHtml(p.network)}: ${escapeHtml(p.username)}</a>`);
    });
  }

  return `
    <header class="resume-header">
      <h1 class="header-name">${escapeHtml(basics.name)}</h1>
      ${basics.label ? `<div class="header-title">${escapeHtml(basics.label)}</div>` : ""}
      <div class="header-contacts">
        ${contactItems.join(`<span class="sep">•</span>`)}
      </div>
    </header>
  `;
}

function renderExperienceSection(experience) {
  if (!experience || experience.length === 0) return "";
  return `
    <section class="resume-section section-experience">
      <h2 class="section-title">Experience</h2>
      <div class="entries-list">
        ${experience.map(exp => `
          <article class="entry-item">
            <div class="entry-header">
              <div class="entry-main">
                <span class="entry-title">${escapeHtml(exp.position)}</span>
                <span class="entry-subtitle">@ ${escapeHtml(exp.company)}</span>
              </div>
              <div class="entry-meta">
                <span class="entry-date">${escapeHtml(exp.startDate)} — ${exp.current ? 'Present' : escapeHtml(exp.endDate || '')}</span>
                ${exp.location ? `<span class="entry-location">${escapeHtml(exp.location)}</span>` : ""}
              </div>
            </div>
            ${exp.summary ? `<p class="entry-summary">${escapeHtml(exp.summary)}</p>` : ""}
            ${exp.highlights && exp.highlights.length > 0 ? `
              <ul class="entry-highlights">
                ${exp.highlights.map(h => `<li>${escapeHtml(h)}</li>`).join("")}
              </ul>
            ` : ""}
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderProjectsSection(projects) {
  if (!projects || projects.length === 0) return "";
  return `
    <section class="resume-section section-projects">
      <h2 class="section-title">Key Projects & Open Source</h2>
      <div class="entries-list">
        ${projects.map(proj => `
          <article class="entry-item">
            <div class="entry-header">
              <div class="entry-main">
                <span class="entry-title">${escapeHtml(proj.name)}</span>
                ${proj.url ? `<a href="${proj.url}" target="_blank" class="entry-link">[Link]</a>` : ""}
              </div>
              ${proj.keywords && proj.keywords.length > 0 ? `
                <div class="entry-tags">
                  ${proj.keywords.map(k => `<span class="tag-pill">${escapeHtml(k)}</span>`).join("")}
                </div>
              ` : ""}
            </div>
            ${proj.description ? `<p class="entry-summary">${escapeHtml(proj.description)}</p>` : ""}
            ${proj.highlights && proj.highlights.length > 0 ? `
              <ul class="entry-highlights">
                ${proj.highlights.map(h => `<li>${escapeHtml(h)}</li>`).join("")}
              </ul>
            ` : ""}
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderEducationSection(education) {
  if (!education || education.length === 0) return "";
  return `
    <section class="resume-section section-education">
      <h2 class="section-title">Education</h2>
      <div class="entries-list">
        ${education.map(edu => `
          <article class="entry-item">
            <div class="entry-header">
              <div class="entry-main">
                <span class="entry-title">${escapeHtml(edu.studyType)} in ${escapeHtml(edu.area)}</span>
                <span class="entry-subtitle">${escapeHtml(edu.institution)}</span>
              </div>
              <div class="entry-meta">
                <span class="entry-date">${escapeHtml(edu.startDate)} — ${escapeHtml(edu.endDate)}</span>
                ${edu.score ? `<span class="entry-score">${escapeHtml(edu.score)}</span>` : ""}
              </div>
            </div>
            ${edu.courses && edu.courses.length > 0 ? `
              <div class="entry-courses"><strong>Core Curriculum:</strong> ${edu.courses.map(escapeHtml).join(", ")}</div>
            ` : ""}
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderSkillsSection(skills) {
  if (!skills || skills.length === 0) return "";
  return `
    <section class="resume-section section-skills">
      <h2 class="section-title">Skills & Technologies</h2>
      <div class="skills-grid">
        ${skills.map(s => `
          <div class="skill-category">
            <span class="skill-name">${escapeHtml(s.name)}:</span>
            <span class="skill-tags">${s.keywords.map(k => `<span class="skill-keyword">${escapeHtml(k)}</span>`).join(", ")}</span>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function renderPublicationsSection(publications) {
  if (!publications || publications.length === 0) return "";
  return `
    <section class="resume-section section-publications">
      <h2 class="section-title">Peer-Reviewed Publications & Preprints</h2>
      <div class="entries-list">
        ${publications.map(pub => `
          <article class="entry-item pub-item">
            <div class="pub-title"><strong>"${escapeHtml(pub.title)}"</strong></div>
            <div class="pub-meta">
              ${escapeHtml(pub.authors)} (${escapeHtml(pub.releaseDate)}). <em>${escapeHtml(pub.publisher)}</em>.
              ${pub.doi ? `<span class="pub-doi">DOI: <a href="https://doi.org/${pub.doi}" target="_blank">${escapeHtml(pub.doi)}</a></span>` : ""}
            </div>
            ${pub.summary ? `<p class="pub-summary">${escapeHtml(pub.summary)}</p>` : ""}
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderCertificationsSection(certifications) {
  if (!certifications || certifications.length === 0) return "";
  return `
    <section class="resume-section section-certifications">
      <h2 class="section-title">Certifications</h2>
      <div class="cert-list">
        ${certifications.map(c => `
          <div class="cert-item">
            <span class="cert-name"><strong>${escapeHtml(c.name)}</strong></span> — 
            <span class="cert-issuer">${escapeHtml(c.issuer)}</span> 
            ${c.date ? `<span class="cert-date">(${escapeHtml(c.date)})</span>` : ""}
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function renderAwardsSection(awards) {
  if (!awards || awards.length === 0) return "";
  return `
    <section class="resume-section section-awards">
      <h2 class="section-title">Honors & Awards</h2>
      <div class="awards-list">
        ${awards.map(a => `
          <div class="award-item">
            <span class="award-title"><strong>${escapeHtml(a.title)}</strong></span> — 
            <span class="award-issuer">${escapeHtml(a.awarder)}</span> 
            <span class="award-date">(${escapeHtml(a.date)})</span>
            ${a.summary ? `<p class="award-summary">${escapeHtml(a.summary)}</p>` : ""}
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

/**
 * Render Interactive Web Portfolio View
 * Inspired by sproogen/modern-resume-theme and Hugo Blox
 */
export function renderPortfolio(state) {
  const { basics, experience, projects, skills, education, publications } = state;

  return `
    <div class="portfolio-site" style="--primary-color: ${state.settings.primaryColor || '#0284c7'};">
      <nav class="portfolio-nav">
        <div class="nav-brand">${escapeHtml(basics.name)}</div>
        <div class="nav-links">
          <a href="#about">About</a>
          <a href="#experience">Experience</a>
          <a href="#projects">Projects</a>
          <a href="#skills">Skills</a>
          <a href="#publications">Publications</a>
          <button type="button" class="btn-portfolio-print" onclick="window.print()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-right:5px;"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>Print CV
          </button>
        </div>
      </nav>

      <header id="about" class="portfolio-hero">
        <div class="hero-content">
          <div class="hero-badge">Available for Principal & Advisory Roles</div>
          <h1 class="hero-title">Hello, I'm <span class="highlight">${escapeHtml(basics.name)}</span></h1>
          <p class="hero-subtitle">${escapeHtml(basics.label)}</p>
          <p class="hero-bio">${escapeHtml(basics.summary)}</p>
          <div class="hero-actions">
            <a href="mailto:${basics.email}" class="btn-primary">Get in Touch</a>
            <a href="${basics.url || '#'}" class="btn-secondary" target="_blank">View GitHub</a>
          </div>
          <div class="hero-socials">
            ${basics.profiles ? basics.profiles.map(p => `
              <a href="${p.url}" target="_blank" class="social-chip">
                <span>${escapeHtml(p.network)}</span>: <strong>${escapeHtml(p.username)}</strong>
              </a>
            `).join("") : ""}
          </div>
        </div>
      </header>

      <main class="portfolio-body">
        <section id="experience" class="portfolio-section">
          <h2 class="port-section-title">Career Milestones</h2>
          <div class="port-timeline">
            ${experience.map(exp => `
              <div class="port-card timeline-card">
                <div class="card-head">
                  <div class="role-title">${escapeHtml(exp.position)}</div>
                  <div class="company-badge">${escapeHtml(exp.company)}</div>
                </div>
                <div class="card-meta">${escapeHtml(exp.startDate)} – ${exp.current ? 'Present' : escapeHtml(exp.endDate)} • ${escapeHtml(exp.location || '')}</div>
                <p class="card-desc">${escapeHtml(exp.summary || '')}</p>
                <ul class="card-bullets">
                  ${exp.highlights ? exp.highlights.map(h => `<li>${escapeHtml(h)}</li>`).join("") : ""}
                </ul>
              </div>
            `).join("")}
          </div>
        </section>

        <section id="projects" class="portfolio-section">
          <h2 class="port-section-title">Featured Projects & Systems</h2>
          <div class="port-grid">
            ${projects.map(proj => `
              <div class="port-card project-card">
                <h3 class="proj-title">${escapeHtml(proj.name)}</h3>
                <p class="proj-desc">${escapeHtml(proj.description || '')}</p>
                <div class="proj-tech">
                  ${proj.keywords ? proj.keywords.map(k => `<span class="tech-badge">${escapeHtml(k)}</span>`).join("") : ""}
                </div>
                ${proj.url ? `<div class="card-foot"><a href="${proj.url}" target="_blank" class="proj-link">Explore Repository →</a></div>` : ""}
              </div>
            `).join("")}
          </div>
        </section>

        <section id="skills" class="portfolio-section">
          <h2 class="port-section-title">Technical Expertise</h2>
          <div class="port-grid">
            ${skills.map(s => `
              <div class="port-card skill-card">
                <h4 class="skill-cat-title">${escapeHtml(s.name)}</h4>
                <div class="skill-chip-wrap">
                  ${s.keywords.map(k => `<span class="skill-chip">${escapeHtml(k)}</span>`).join("")}
                </div>
              </div>
            `).join("")}
          </div>
        </section>

        ${publications && publications.length > 0 ? `
          <section id="publications" class="portfolio-section">
            <h2 class="port-section-title">Publications & Research</h2>
            <div class="publications-stack">
              ${publications.map(pub => `
                <div class="port-card pub-card">
                  <h4 class="pub-card-title">${escapeHtml(pub.title)}</h4>
                  <div class="pub-card-authors">${escapeHtml(pub.authors)} (${escapeHtml(pub.releaseDate)})</div>
                  <div class="pub-card-venue">${escapeHtml(pub.publisher)} ${pub.doi ? `• DOI: ${escapeHtml(pub.doi)}` : ""}</div>
                  ${pub.summary ? `<p class="pub-card-abstract">${escapeHtml(pub.summary)}</p>` : ""}
                </div>
              `).join("")}
            </div>
          </section>
        ` : ""}
      </main>

      <footer class="portfolio-footer">
        <p>© ${new Date().getFullYear()} ${escapeHtml(basics.name)}. Built & Rendered with ACPR Supertool.</p>
      </footer>
    </div>
  `;
}

function escapeHtml(str) {
  if (typeof str !== "string") return str || "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
