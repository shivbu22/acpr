/**
 * ACPR Universal File Importer & Document Parser
 * Supports ANY file: PDF (.pdf), Word (.docx), Plain Text (.txt), Markdown (.md),
 * JSON (.json), YAML (.yaml, .yml), BibTeX (.bib), HTML (.html), Rich Text (.rtf), and Images (.png, .jpg)
 */

import { yamlToState, parseBibtex, stateToYaml } from "./parser.js";

/**
 * Extract plain text or data structure from ANY file object
 */
export async function extractFromFile(file) {
  const fileName = file.name.toLowerCase();
  const fileExt = fileName.substring(fileName.lastIndexOf('.'));

  // 1. Image Files -> Convert to Profile Avatar / Image
  if (['.png', '.jpg', '.jpeg', '.webp', '.svg'].includes(fileExt)) {
    const dataUrl = await readFileAsDataUrl(file);
    return {
      type: "image",
      fileName: file.name,
      dataUrl,
      rawText: `[Image file: ${file.name}]`
    };
  }

  // 2. JSON Files
  if (fileExt === '.json') {
    const text = await readFileAsText(file);
    try {
      const parsed = JSON.parse(text);
      return {
        type: "json",
        fileName: file.name,
        parsedData: parsed,
        rawText: text
      };
    } catch (e) {
      return { type: "text", fileName: file.name, rawText: text };
    }
  }

  // 3. YAML Files
  if (['.yaml', '.yml'].includes(fileExt)) {
    const text = await readFileAsText(file);
    return {
      type: "yaml",
      fileName: file.name,
      rawText: text
    };
  }

  // 4. BibTeX Citations
  if (fileExt === '.bib') {
    const text = await readFileAsText(file);
    return {
      type: "bibtex",
      fileName: file.name,
      rawText: text
    };
  }

  // 5. PDF Files (.pdf)
  if (fileExt === '.pdf') {
    try {
      const text = await extractTextFromPdf(file);
      return {
        type: "pdf",
        fileName: file.name,
        rawText: text
      };
    } catch (err) {
      console.warn("PDF extraction fallback:", err);
      const fallbackText = await extractTextBinaryFallback(file);
      return {
        type: "pdf",
        fileName: file.name,
        rawText: fallbackText || `[Extracted from ${file.name}]`
      };
    }
  }

  // 6. Word Document (.docx)
  if (fileExt === '.docx') {
    try {
      const text = await extractTextFromDocx(file);
      return {
        type: "docx",
        fileName: file.name,
        rawText: text
      };
    } catch (err) {
      console.warn("DOCX extraction fallback:", err);
      const fallbackText = await extractTextBinaryFallback(file);
      return {
        type: "docx",
        fileName: file.name,
        rawText: fallbackText || `[Extracted from ${file.name}]`
      };
    }
  }

  // 7. HTML Files (.html, .htm)
  if (['.html', '.htm'].includes(fileExt)) {
    const htmlText = await readFileAsText(file);
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, "text/html");
    const cleanText = doc.body ? (doc.body.innerText || doc.body.textContent || "") : htmlText;
    return {
      type: "html",
      fileName: file.name,
      rawText: cleanText.trim()
    };
  }

  // 8. Markdown or Text or Any other file (.txt, .md, .markdown, .rtf, source code, etc.)
  const text = await readFileAsText(file);
  return {
    type: fileExt === '.md' || fileExt === '.markdown' ? "markdown" : "text",
    fileName: file.name,
    rawText: text
  };
}

/**
 * PDF text extraction using PDF.js with fallback
 */
async function extractTextFromPdf(file) {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  
  if (window.pdfjsLib) {
    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pagesText = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageStrings = textContent.items.map(item => item.str);
      pagesText.push(pageStrings.join(" "));
    }
    return pagesText.join("\n\n");
  }

  // Fallback if pdfjsLib is unavailable
  return extractTextFromPdfBinary(arrayBuffer);
}

function extractTextFromPdfBinary(buffer) {
  const bytes = new Uint8Array(buffer);
  let binaryStr = "";
  for (let i = 0; i < bytes.length; i++) {
    binaryStr += String.fromCharCode(bytes[i]);
  }

  const textPieces = [];
  // Match text in parentheses e.g. (John Doe) Tj or [(Hello) -10 (World)] TJ
  const tjRegex = /\(([^)]+)\)\s*Tj/g;
  let match;
  while ((match = tjRegex.exec(binaryStr)) !== null) {
    textPieces.push(match[1]);
  }

  if (textPieces.length > 10) {
    return textPieces.join(" ");
  }

  // Fallback string extraction of printable ASCII
  const asciiMatches = binaryStr.match(/[a-zA-Z0-9.,;:!@#$%^&*()_\-+=/<>?\\"'\s]{4,}/g) || [];
  return asciiMatches.join(" ");
}

/**
 * DOCX text extraction using JSZip with XML parser fallback
 */
async function extractTextFromDocx(file) {
  const arrayBuffer = await readFileAsArrayBuffer(file);

  if (window.JSZip) {
    const zip = await window.JSZip.loadAsync(arrayBuffer);
    const docXmlFile = zip.file("word/document.xml");
    if (docXmlFile) {
      const xmlText = await docXmlFile.async("string");
      return parseDocxXml(xmlText);
    }
  }

  // Fallback: unzip or scan XML text in binary
  const binary = new TextDecoder("utf-8", { fatal: false }).decode(arrayBuffer);
  return parseDocxXml(binary);
}

function parseDocxXml(xml) {
  // Extract all <w:t> content
  const matches = xml.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
  if (!matches || matches.length === 0) return "";
  
  const paragraphs = [];
  let currentP = [];

  // Group by paragraph <w:p>
  const pRegex = /<w:p[^>]*>([\s\S]*?)<\/w:p>/g;
  let pMatch;
  while ((pMatch = pRegex.exec(xml)) !== null) {
    const pContent = pMatch[1];
    const tMatches = pContent.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
    if (tMatches) {
      const pText = tMatches.map(t => t.replace(/<[^>]+>/g, '')).join(" ");
      if (pText.trim()) paragraphs.push(pText.trim());
    }
  }

  if (paragraphs.length > 0) {
    return paragraphs.join("\n");
  }

  return matches.map(m => m.replace(/<[^>]+>/g, '')).join(" ");
}

/**
 * Fallback binary ASCII text extractor for corrupt or unknown file types
 */
async function extractTextBinaryFallback(file) {
  const buf = await readFileAsArrayBuffer(file);
  const text = new TextDecoder("utf-8", { fatal: false }).decode(buf);
  const printable = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, " ");
  return printable.replace(/\s+/g, " ").trim();
}

/**
 * Intelligent Universal Resume Text Parser & Section Extractor
 * Transforms any unstructured text stream into clean ACPR state
 */
export function parseRawResumeText(rawText, baseState) {
  const result = JSON.parse(JSON.stringify(baseState));
  if (!rawText || typeof rawText !== "string") return result;

  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return result;

  // 1. Contact Info Extraction via Regex
  const emailMatch = rawText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/i);
  if (emailMatch) result.basics.email = emailMatch[1];

  const phoneMatch = rawText.match(/(\+?\d{1,3}[-.\s]?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4})/);
  if (phoneMatch) result.basics.phone = phoneMatch[1];

  const urlMatch = rawText.match(/https?:\/\/(www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})(\/[^\s]*)?/i);
  if (urlMatch) result.basics.url = urlMatch[0];

  const linkedinMatch = rawText.match(/linkedin\.com\/in\/([a-zA-Z0-9-_]+)/i);
  if (linkedinMatch) {
    if (!result.basics.profiles) result.basics.profiles = [];
    result.basics.profiles.push({ network: "LinkedIn", username: linkedinMatch[1], url: `https://${linkedinMatch[0]}` });
  }

  const githubMatch = rawText.match(/github\.com\/([a-zA-Z0-9-_]+)/i);
  if (githubMatch) {
    if (!result.basics.profiles) result.basics.profiles = [];
    result.basics.profiles.push({ network: "GitHub", username: githubMatch[1], url: `https://${githubMatch[0]}` });
  }

  // 2. Detect Name (First clean line without email/phone/url)
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const candidate = lines[i];
    if (
      candidate.length >= 3 && candidate.length <= 45 &&
      !candidate.includes("@") && !candidate.includes("http") &&
      !/resume|curriculum|vitae|page|contact/i.test(candidate)
    ) {
      result.basics.name = candidate.replace(/^#+\s*/, '').trim();
      if (lines[i + 1] && lines[i + 1].length < 60 && !lines[i + 1].includes("@")) {
        result.basics.label = lines[i + 1].replace(/^#+\s*/, '').trim();
      }
      break;
    }
  }

  // 3. Section Segmentation
  const sectionKeywords = {
    experience: /^(work\s+)?experience|employment|work\s+history|professional\s+experience/i,
    education: /^education|academic\s+background|qualifications|degrees/i,
    skills: /^skills|technical\s+skills|core\s+competencies|technologies/i,
    projects: /^projects|key\s+projects|open\s+source|portfolio/i,
    publications: /^publications|papers|research\s+articles/i,
    certifications: /^certifications|licenses|credentials/i,
    summary: /^summary|professional\s+summary|profile|about\s+me/i
  };

  let currentSection = null;
  const sectionsContent = {
    summary: [],
    experience: [],
    education: [],
    skills: [],
    projects: [],
    publications: [],
    certifications: []
  };

  for (const line of lines) {
    const cleanHeader = line.replace(/^[#*_\-\s]+|[#*_\-\s:]+$/g, '').trim();
    let detectedSec = null;

    for (const [secKey, regex] of Object.entries(sectionKeywords)) {
      if (regex.test(cleanHeader)) {
        detectedSec = secKey;
        break;
      }
    }

    if (detectedSec) {
      currentSection = detectedSec;
      continue;
    }

    if (currentSection && sectionsContent[currentSection]) {
      sectionsContent[currentSection].push(line);
    }
  }

  // Process Summary
  if (sectionsContent.summary.length > 0) {
    result.basics.summary = sectionsContent.summary.join(" ").trim();
  }

  // Process Skills
  if (sectionsContent.skills.length > 0) {
    const skillList = [];
    const allTokens = sectionsContent.skills.join(" ").split(/[,•|·\n]/).map(s => s.trim()).filter(s => s.length > 1);
    if (allTokens.length > 0) {
      result.skills = [
        {
          id: `skill-imported-${Date.now()}`,
          name: "Imported Skills & Technologies",
          keywords: allTokens.slice(0, 35)
        }
      ];
    }
  }

  // Process Experience Entries
  if (sectionsContent.experience.length > 0) {
    const parsedExp = [];
    let currentExp = null;

    sectionsContent.experience.forEach(line => {
      const isBullet = /^[•\-*·]\s*/.test(line);
      const isDateLine = /\b(19\d\d|20\d\d|present|current)\b/i.test(line);

      if (!isBullet && isDateLine) {
        if (currentExp) parsedExp.push(currentExp);
        currentExp = {
          id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          company: line.split(/[-–—|@]/)[1]?.trim() || line.trim(),
          position: line.split(/[-–—|@]/)[0]?.trim() || "Role",
          startDate: extractDate(line, "start") || "2022",
          endDate: extractDate(line, "end") || "Present",
          highlights: []
        };
      } else if (currentExp && isBullet) {
        currentExp.highlights.push(line.replace(/^[•\-*·]\s*/, '').trim());
      } else if (currentExp && !currentExp.summary) {
        currentExp.summary = line;
      }
    });

    if (currentExp) parsedExp.push(currentExp);
    if (parsedExp.length > 0) {
      result.experience = parsedExp;
    }
  }

  // Process Education Entries
  if (sectionsContent.education.length > 0) {
    const parsedEdu = [];
    let currentEdu = null;

    sectionsContent.education.forEach(line => {
      const hasDegreeOrUniv = /university|college|institute|b\.s|b\.a|m\.s|ph\.d|bachelor|master|doctor/i.test(line);
      if (hasDegreeOrUniv) {
        if (currentEdu) parsedEdu.push(currentEdu);
        currentEdu = {
          id: `edu-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          institution: line.split(/[-–—|]/)[0]?.trim() || line.trim(),
          studyType: extractDegree(line) || "Degree",
          area: line.split(/[-–—|in]/)[1]?.trim() || "Field of Study",
          startDate: extractDate(line, "start") || "2018",
          endDate: extractDate(line, "end") || "2022",
          score: line.match(/gpa[:\s]*[\d.]+/i)?.[0] || ""
        };
      }
    });

    if (currentEdu) parsedEdu.push(currentEdu);
    if (parsedEdu.length > 0) {
      result.education = parsedEdu;
    }
  }

  return result;
}

function extractDate(str, type) {
  const dates = str.match(/\b(19\d\d|20\d\d|present|current)\b/gi);
  if (!dates) return "";
  if (type === "start") return dates[0];
  if (type === "end") return dates[1] || "Present";
  return dates[0];
}

function extractDegree(str) {
  const match = str.match(/\b(ph\.?d|m\.?s|b\.?s|b\.?a|m\.?a|bachelor|master|doctorate)\b/i);
  return match ? match[0].toUpperCase() : "B.S.";
}

// Helpers
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
