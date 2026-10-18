/**
 * ACPR Parser & Serializer Engine
 * Supports YAML (RenderCV / YAMLResume), Markdown (LapisCV / Oh-My-CV), BibTeX (Hugo Academic), and JSON Resume
 */

/**
 * Clean YAML Serializer
 */
export function stateToYaml(state) {
  const lines = [];
  lines.push("# ACPR Resume-as-Code (RenderCV & YAMLResume compatible)");
  lines.push(`version: "1.0"`);
  lines.push("");

  // Basics
  lines.push("basics:");
  lines.push(`  name: "${escapeYaml(state.basics.name)}"`);
  lines.push(`  label: "${escapeYaml(state.basics.label)}"`);
  lines.push(`  email: "${escapeYaml(state.basics.email)}"`);
  lines.push(`  phone: "${escapeYaml(state.basics.phone)}"`);
  lines.push(`  url: "${escapeYaml(state.basics.url)}"`);
  lines.push("  location:");
  lines.push(`    city: "${escapeYaml(state.basics.location?.city || '')}"`);
  lines.push(`    country: "${escapeYaml(state.basics.location?.country || '')}"`);
  
  if (state.basics.summary) {
    lines.push("  summary: >-");
    lines.push(`    ${escapeYaml(state.basics.summary)}`);
  }

  if (state.basics.profiles && state.basics.profiles.length > 0) {
    lines.push("  profiles:");
    state.basics.profiles.forEach(p => {
      lines.push(`    - network: "${escapeYaml(p.network)}"`);
      lines.push(`      username: "${escapeYaml(p.username)}"`);
      lines.push(`      url: "${escapeYaml(p.url)}"`);
    });
  }
  lines.push("");

  // Experience
  if (state.experience && state.experience.length > 0) {
    lines.push("experience:");
    state.experience.forEach(exp => {
      lines.push(`  - company: "${escapeYaml(exp.company)}"`);
      lines.push(`    position: "${escapeYaml(exp.position)}"`);
      lines.push(`    location: "${escapeYaml(exp.location || '')}"`);
      lines.push(`    startDate: "${escapeYaml(exp.startDate || '')}"`);
      lines.push(`    endDate: "${escapeYaml(exp.endDate || '')}"`);
      lines.push(`    current: ${!!exp.current}`);
      if (exp.summary) lines.push(`    summary: "${escapeYaml(exp.summary)}"`);
      if (exp.highlights && exp.highlights.length > 0) {
        lines.push("    highlights:");
        exp.highlights.forEach(h => lines.push(`      - "${escapeYaml(h)}"`));
      }
    });
    lines.push("");
  }

  // Education
  if (state.education && state.education.length > 0) {
    lines.push("education:");
    state.education.forEach(edu => {
      lines.push(`  - institution: "${escapeYaml(edu.institution)}"`);
      lines.push(`    area: "${escapeYaml(edu.area)}"`);
      lines.push(`    studyType: "${escapeYaml(edu.studyType)}"`);
      lines.push(`    startDate: "${escapeYaml(edu.startDate || '')}"`);
      lines.push(`    endDate: "${escapeYaml(edu.endDate || '')}"`);
      if (edu.score) lines.push(`    score: "${escapeYaml(edu.score)}"`);
      if (edu.courses && edu.courses.length > 0) {
        lines.push("    courses:");
        edu.courses.forEach(c => lines.push(`      - "${escapeYaml(c)}"`));
      }
    });
    lines.push("");
  }

  // Skills
  if (state.skills && state.skills.length > 0) {
    lines.push("skills:");
    state.skills.forEach(s => {
      lines.push(`  - name: "${escapeYaml(s.name)}"`);
      if (s.keywords && s.keywords.length > 0) {
        lines.push("    keywords:");
        s.keywords.forEach(k => lines.push(`      - "${escapeYaml(k)}"`));
      }
    });
    lines.push("");
  }

  // Projects
  if (state.projects && state.projects.length > 0) {
    lines.push("projects:");
    state.projects.forEach(p => {
      lines.push(`  - name: "${escapeYaml(p.name)}"`);
      lines.push(`    description: "${escapeYaml(p.description || '')}"`);
      if (p.url) lines.push(`    url: "${escapeYaml(p.url)}"`);
      if (p.githubUrl) lines.push(`    githubUrl: "${escapeYaml(p.githubUrl)}"`);
      if (p.keywords && p.keywords.length > 0) {
        lines.push("    keywords:");
        p.keywords.forEach(k => lines.push(`      - "${escapeYaml(k)}"`));
      }
      if (p.highlights && p.highlights.length > 0) {
        lines.push("    highlights:");
        p.highlights.forEach(h => lines.push(`      - "${escapeYaml(h)}"`));
      }
    });
    lines.push("");
  }

  // Publications
  if (state.publications && state.publications.length > 0) {
    lines.push("publications:");
    state.publications.forEach(pub => {
      lines.push(`  - title: "${escapeYaml(pub.title)}"`);
      lines.push(`    authors: "${escapeYaml(pub.authors || '')}"`);
      lines.push(`    publisher: "${escapeYaml(pub.publisher || '')}"`);
      lines.push(`    releaseDate: "${escapeYaml(pub.releaseDate || '')}"`);
      if (pub.url) lines.push(`    url: "${escapeYaml(pub.url)}"`);
      if (pub.doi) lines.push(`    doi: "${escapeYaml(pub.doi)}"`);
      if (pub.summary) lines.push(`    summary: "${escapeYaml(pub.summary)}"`);
    });
    lines.push("");
  }

  return lines.join("\n");
}

function escapeYaml(str) {
  if (typeof str !== "string") return str || "";
  return str.replace(/"/g, '\\"');
}

/**
 * Lightweight, robust YAML parser for Resume data
 */
export function yamlToState(yamlStr, baseState) {
  const result = JSON.parse(JSON.stringify(baseState));
  const lines = yamlStr.split("\n");
  let currentSection = null;
  let currentItem = null;
  let currentSubKey = null;

  for (let rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line || line.trim().startsWith("#")) continue;

    const indent = rawLine.search(/\S|$/);
    const trimmed = line.trim();

    // Top-level sections (indent === 0)
    if (indent === 0 && trimmed.endsWith(":")) {
      currentSection = trimmed.slice(0, -1).trim();
      currentItem = null;
      currentSubKey = null;
      if (["experience", "education", "skills", "projects", "publications"].includes(currentSection)) {
        result[currentSection] = [];
      }
      continue;
    }

    if (!currentSection) continue;

    if (currentSection === "basics") {
      if (trimmed.startsWith("- network:")) {
        if (!result.basics.profiles) result.basics.profiles = [];
        const match = trimmed.match(/- network:\s*"?(.*?)"?$/);
        currentItem = { network: match ? match[1] : "", username: "", url: "" };
        result.basics.profiles.push(currentItem);
        continue;
      }
      if (currentItem && trimmed.startsWith("username:")) {
        currentItem.username = cleanVal(trimmed.replace("username:", ""));
        continue;
      }
      if (currentItem && trimmed.startsWith("url:")) {
        currentItem.url = cleanVal(trimmed.replace("url:", ""));
        continue;
      }
      if (trimmed.startsWith("city:")) {
        if (!result.basics.location) result.basics.location = {};
        result.basics.location.city = cleanVal(trimmed.replace("city:", ""));
        continue;
      }
      if (trimmed.startsWith("country:")) {
        if (!result.basics.location) result.basics.location = {};
        result.basics.location.country = cleanVal(trimmed.replace("country:", ""));
        continue;
      }
      const pair = parseKeyValue(trimmed);
      if (pair) {
        result.basics[pair.key] = pair.value;
      }
      continue;
    }

    // List item start in array sections (e.g. "  - company: Google" or "  - name: Core")
    if (trimmed.startsWith("- ")) {
      const rest = trimmed.substring(2).trim();
      const pair = parseKeyValue(rest);
      currentItem = { id: `${currentSection}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}` };
      if (pair) {
        currentItem[pair.key] = pair.value;
      }
      if (Array.isArray(result[currentSection])) {
        result[currentSection].push(currentItem);
      }
      currentSubKey = null;
      continue;
    }

    // Sub-keys or array items under current item
    if (currentItem) {
      if (trimmed.startsWith("- ") && currentSubKey) {
        const itemVal = cleanVal(trimmed.substring(2));
        if (!Array.isArray(currentItem[currentSubKey])) currentItem[currentSubKey] = [];
        currentItem[currentSubKey].push(itemVal);
        continue;
      }

      if (trimmed.endsWith(":")) {
        currentSubKey = trimmed.slice(0, -1).trim();
        if (!Array.isArray(currentItem[currentSubKey])) {
          currentItem[currentSubKey] = [];
        }
        continue;
      }

      const pair = parseKeyValue(trimmed);
      if (pair) {
        currentItem[pair.key] = pair.value;
        currentSubKey = null;
      }
    }
  }

  return result;
}

function parseKeyValue(str) {
  const colonIdx = str.indexOf(":");
  if (colonIdx === -1) return null;
  const key = str.slice(0, colonIdx).trim();
  const rawVal = str.slice(colonIdx + 1).trim();
  return { key, value: cleanVal(rawVal) };
}

function cleanVal(val) {
  if (!val) return "";
  let v = val.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }
  if (v === "true") return true;
  if (v === "false") return false;
  return v;
}

/**
 * State to Markdown Serializer (LapisCV / Oh-My-CV style)
 */
export function stateToMarkdown(state) {
  const lines = [];

  // Header
  lines.push(`# ${state.basics.name}`);
  lines.push(`**${state.basics.label}**  `);
  
  const contacts = [];
  if (state.basics.email) contacts.push(`Email: [${state.basics.email}](mailto:${state.basics.email})`);
  if (state.basics.phone) contacts.push(`Phone: ${state.basics.phone}`);
  if (state.basics.location?.city) contacts.push(`Location: ${state.basics.location.city}`);
  if (state.basics.url) contacts.push(`Website: [${state.basics.url}](${state.basics.url})`);
  lines.push(contacts.join(" | "));
  lines.push("");

  if (state.basics.summary) {
    lines.push("## Summary");
    lines.push(state.basics.summary);
    lines.push("");
  }

  // Experience
  if (state.experience?.length > 0) {
    lines.push("## Experience");
    state.experience.forEach(exp => {
      lines.push(`### ${exp.position} | **${exp.company}**`);
      lines.push(`*${exp.startDate} – ${exp.endDate}* ${exp.location ? `| *${exp.location}*` : ""}`);
      if (exp.summary) lines.push(`\n${exp.summary}`);
      if (exp.highlights?.length > 0) {
        lines.push("");
        exp.highlights.forEach(h => lines.push(`- ${h}`));
      }
      lines.push("");
    });
  }

  // Projects
  if (state.projects?.length > 0) {
    lines.push("## Projects");
    state.projects.forEach(proj => {
      const link = proj.url ? ` ([Link](${proj.url}))` : "";
      lines.push(`### ${proj.name}${link}`);
      if (proj.keywords?.length > 0) lines.push(`*Technologies: ${proj.keywords.join(", ")}*`);
      if (proj.description) lines.push(proj.description);
      if (proj.highlights?.length > 0) {
        lines.push("");
        proj.highlights.forEach(h => lines.push(`- ${h}`));
      }
      lines.push("");
    });
  }

  // Publications (Hugo Academic)
  if (state.publications?.length > 0) {
    lines.push("## Publications");
    state.publications.forEach(pub => {
      lines.push(`- **${pub.title}**  `);
      lines.push(`  ${pub.authors} (${pub.releaseDate}). *${pub.publisher}*. ${pub.doi ? `DOI: ${pub.doi}` : ""}`);
    });
    lines.push("");
  }

  // Education
  if (state.education?.length > 0) {
    lines.push("## Education");
    state.education.forEach(edu => {
      lines.push(`### ${edu.studyType} in ${edu.area} | **${edu.institution}**`);
      lines.push(`*${edu.startDate} – ${edu.endDate}* ${edu.score ? `| *${edu.score}*` : ""}`);
      if (edu.courses?.length > 0) {
        lines.push(`Key Courses: ${edu.courses.join(", ")}`);
      }
      lines.push("");
    });
  }

  // Skills
  if (state.skills?.length > 0) {
    lines.push("## Skills");
    state.skills.forEach(s => {
      lines.push(`- **${s.name}**: ${s.keywords.join(", ")}`);
    });
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * State to BibTeX citations serializer (Hugo Academic feature)
 */
export function stateToBibtex(state) {
  if (!state.publications || state.publications.length === 0) {
    return "% No publications registered in this profile.";
  }

  return state.publications.map((pub, idx) => {
    const key = (pub.authors ? pub.authors.split(" ")[0].replace(/[^a-zA-Z]/g, "").toLowerCase() : "author") +
      (pub.releaseDate ? pub.releaseDate.split("-")[0] : "2024") +
      (pub.title ? pub.title.split(" ")[0].toLowerCase() : `item${idx}`);

    return `@article{${key},
  title = {${pub.title}},
  author = {${pub.authors || "Rivera, Alex J."}},
  journal = {${pub.publisher || "Conference Proceedings"}},
  year = {${pub.releaseDate ? pub.releaseDate.split("-")[0] : "2024"}},
  doi = {${pub.doi || ""}},
  url = {${pub.url || ""}}
}`;
  }).join("\n\n");
}

/**
 * Parse BibTeX string into publications array
 */
export function parseBibtex(bibtexStr) {
  const entries = [];
  const articleRegex = /@(\w+)\s*\{([^,]+),\s*([\s\S]*?)\n\}/g;
  let match;

  while ((match = articleRegex.exec(bibtexStr)) !== null) {
    const body = match[3];
    const fields = {};
    const fieldRegex = /(\w+)\s*=\s*[\{"]([\s\S]*?)[\}"]/g;
    let fieldMatch;
    while ((fieldMatch = fieldRegex.exec(body)) !== null) {
      fields[fieldMatch[1].toLowerCase()] = fieldMatch[2].trim().replace(/\s+/g, ' ');
    }

    if (fields.title) {
      entries.push({
        id: `pub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: fields.title,
        authors: fields.author || "",
        publisher: fields.journal || fields.booktitle || fields.publisher || "Publication",
        releaseDate: fields.year || "",
        url: fields.url || "",
        doi: fields.doi || "",
        summary: fields.abstract || ""
      });
    }
  }

  return entries;
}
