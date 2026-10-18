/**
 * ACPR ATS Matcher & Keyword Gap Analyzer
 * Inspired by srbhr/Resume-Matcher
 */

export const SAMPLE_JOB_DESCRIPTIONS = {
  ai_systems: {
    title: "Staff AI Systems Engineer (Inference & Distributed Infrastructure)",
    company: "Frontier AI Lab",
    text: `We are seeking a Staff AI Systems Engineer to architect and optimize our high-throughput distributed LLM inference engine. 

Responsibilities:
- Design and scale distributed inference pipelines supporting large language models with billions of parameters.
- Optimize GPU memory hierarchy, KV-cache utilization, continuous batching, and FlashAttention kernels.
- Implement low-latency network communication using NCCL, RDMA/RoCE, and Triton custom CUDA kernels.
- Build fault-tolerant microservices on Kubernetes clusters, monitoring p99 latency with Prometheus and Grafana.
- Collaborate with research scientists to deploy quantized models (INT4, FP8) using vLLM and TensorRT-LLM.

Requirements:
- 6+ years of systems engineering experience in Python, C++20, and Rust.
- Deep expertise in PyTorch, CUDA, Triton, DeepSpeed, and distributed consensus (Raft).
- Strong track record of improving inference throughput, reducing p99 latency, and optimizing cluster costs.
- Solid background in operating systems, eBPF telemetry, and multi-node GPU cluster networking.`
  },
  fullstack_lead: {
    title: "Lead Full-Stack Engineer (Next.js, TypeScript & Cloud)",
    company: "CloudTech Innovations",
    text: `Looking for a Lead Full-Stack Engineer to scale our collaborative enterprise developer platform.

Responsibilities:
- Build high-performance user interfaces using React, Next.js, TypeScript, and modern CSS/Tailwind.
- Architect resilient backend microservices using Node.js, Go, PostgreSQL, Redis, and GraphQL.
- Lead system architecture decisions, CI/CD pipelines, Docker containerization, and AWS infrastructure with Terraform.
- Champion accessibility (WCAG AA), Core Web Vitals, and responsive web performance across web and mobile browsers.

Requirements:
- 7+ years of full-stack web development experience.
- Strong proficiency in modern JavaScript/TypeScript, React state management, and REST APIs.
- Experience with relational database indexing, schema migrations, and real-time WebSockets.
- Proven leadership skills mentoring junior developers and driving agile sprint deliverables.`
  },
  ml_research: {
    title: "Research Scientist / Applied ML (Long-Context & Efficiency)",
    company: "NextGen AI Research",
    text: `Seeking an Applied ML Research Scientist specializing in architectural efficiency, sparse attention, and model compression.

Responsibilities:
- Publish top-tier papers at NeurIPS, ICML, ICLR, or CVPR in deep learning efficiency and transformer architecture.
- Conduct experimental saturation studies on speculative decoding, sparse KV-cache compression, and mixture-of-experts (MoE).
- Benchmark algorithmic accuracy tradeoffs against vanilla attention baselines.
- Write reproducible PyTorch and JAX research prototypes and open-source models for the community.

Requirements:
- Ph.D. in Computer Science, Machine Learning, or related quantitative field.
- First-author publication record in peer-reviewed conferences.
- Strong coding fluency in Python, PyTorch, Hugging Face ecosystem, and Slurm/GPU orchestration.`
  }
};

const COMMON_STOPWORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
  "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can",
  "cannot", "could", "did", "do", "does", "doing", "don't", "down", "during", "each", "few", "for", "from",
  "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself", "him", "himself",
  "his", "how", "i", "if", "in", "into", "is", "isn't", "it", "its", "itself", "let's", "me", "more",
  "most", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought",
  "our", "ours", "ourselves", "out", "over", "own", "same", "she", "should", "so", "some", "such", "than",
  "that", "the", "their", "theirs", "them", "themselves", "then", "there", "these", "they", "this", "those",
  "through", "to", "too", "under", "until", "up", "very", "was", "we", "were", "what", "when", "where",
  "which", "while", "who", "whom", "why", "with", "would", "you", "your", "yours", "yourself", "yourselves",
  "responsibilities", "requirements", "looking", "seeking", "years", "experience", "work", "working", "team",
  "candidates", "role", "help", "ideal", "position", "ability", "skills", "join", "opportunity"
]);

/**
 * Extract full searchable text string from resume state
 */
export function extractResumePlainText(state) {
  const parts = [];
  parts.push(state.basics.name || "");
  parts.push(state.basics.label || "");
  parts.push(state.basics.summary || "");

  if (state.experience) {
    state.experience.forEach(exp => {
      parts.push(exp.company || "");
      parts.push(exp.position || "");
      parts.push(exp.summary || "");
      if (exp.highlights) parts.push(...exp.highlights);
    });
  }

  if (state.education) {
    state.education.forEach(edu => {
      parts.push(edu.institution || "");
      parts.push(edu.area || "");
      parts.push(edu.studyType || "");
      if (edu.courses) parts.push(...edu.courses);
    });
  }

  if (state.skills) {
    state.skills.forEach(s => {
      parts.push(s.name || "");
      if (s.keywords) parts.push(...s.keywords);
    });
  }

  if (state.projects) {
    state.projects.forEach(p => {
      parts.push(p.name || "");
      parts.push(p.description || "");
      if (p.keywords) parts.push(...p.keywords);
      if (p.highlights) parts.push(...p.highlights);
    });
  }

  if (state.publications) {
    state.publications.forEach(pub => {
      parts.push(pub.title || "");
      parts.push(pub.authors || "");
      parts.push(pub.publisher || "");
      parts.push(pub.summary || "");
    });
  }

  return parts.join(" ");
}

/**
 * Tokenize and extract significant terms and compound tech keywords
 */
export function extractKeywords(text) {
  if (!text) return new Map();
  
  // Normalize
  const clean = text.toLowerCase().replace(/[\r\n\t]/g, " ");
  
  // Recognized key phrases (bigrams/trigrams)
  const keyPhrases = [
    "distributed systems", "distributed inference", "continuous batching", "paged attention",
    "kv-cache", "kv cache", "flashattention", "deep learning", "large language models",
    "cuda kernels", "machine learning", "triton kernels", "system architecture",
    "microservices", "raft consensus", "cloud infrastructure", "ci/cd", "ci/cd pipelines",
    "core web vitals", "web performance", "rest apis", "restful apis", "full stack",
    "fault tolerance", "fault tolerant", "low latency", "p99 latency", "zero copy",
    "speculative decoding", "sparse attention", "model compression", "mixture of experts"
  ];

  const counts = new Map();

  // Match key phrases first
  let remainingText = clean;
  keyPhrases.forEach(phrase => {
    const regex = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    const matches = clean.match(regex);
    if (matches && matches.length > 0) {
      counts.set(phrase, matches.length * 2); // boost phrase importance
      remainingText = remainingText.replace(regex, " ");
    }
  });

  // Tokenize single words
  const words = remainingText.match(/[a-z0-9+#.-]{2,}/g) || [];
  for (const word of words) {
    const normalized = word.replace(/^[.-]+|[.-]+$/g, '');
    if (normalized.length < 2 || COMMON_STOPWORDS.has(normalized)) continue;
    counts.set(normalized, (counts.get(normalized) || 0) + 1);
  }

  return counts;
}

/**
 * Run comprehensive ATS Analysis against a Job Description
 */
export function analyzeAtsMatch(resumeState, jobDescriptionText) {
  const resumeText = extractResumePlainText(resumeState);
  const resumeKeywords = extractKeywords(resumeText);
  const jdKeywords = extractKeywords(jobDescriptionText);

  if (jdKeywords.size === 0) {
    return {
      score: 0,
      matched: [],
      missing: [],
      density: 0,
      auditChecks: []
    };
  }

  const matched = [];
  const missing = [];
  let totalJdWeight = 0;
  let matchedWeight = 0;

  // Evaluate overlap
  for (const [kw, count] of jdKeywords.entries()) {
    const weight = Math.min(count, 4);
    totalJdWeight += weight;

    if (resumeKeywords.has(kw)) {
      matchedWeight += weight;
      matched.push({
        keyword: kw,
        jdCount: count,
        resumeCount: resumeKeywords.get(kw)
      });
    } else {
      missing.push({
        keyword: kw,
        jdCount: count
      });
    }
  }

  // Sort matched & missing by prominence
  matched.sort((a, b) => b.jdCount - a.jdCount);
  missing.sort((a, b) => b.jdCount - a.jdCount);

  const rawScore = totalJdWeight > 0 ? (matchedWeight / totalJdWeight) * 100 : 0;
  const score = Math.min(100, Math.round(rawScore));

  // ATS Formatting Safety Audit Checks
  const auditChecks = [
    {
      name: "Contact Information Completeness",
      passed: !!(resumeState.basics.email && resumeState.basics.phone && resumeState.basics.name),
      detail: resumeState.basics.email && resumeState.basics.phone 
        ? "Valid Name, Email, and Phone number detected." 
        : "Missing vital contact channels (Email or Phone)."
    },
    {
      name: "Measurable Impact & Metrics",
      passed: /\b(\d+%|\$\d+|\d+x|\d+M|\d+k)\b/i.test(resumeText),
      detail: "Contains quantified achievements (percentages, revenue, scale, latency gains)."
    },
    {
      name: "Standard Section Headings",
      passed: resumeState.experience.length > 0 && resumeState.education.length > 0 && resumeState.skills.length > 0,
      detail: "Uses industry-standard sections (Experience, Education, Skills) readable by standard ATS parsers."
    },
    {
      name: "High-Priority Action Verbs",
      passed: /\b(architected|engineered|spearheaded|implemented|designed|scaled|pioneered|optimized|built)\b/i.test(resumeText),
      detail: "Strong presence of leadership action verbs driving bullet points."
    },
    {
      name: "Appropriate Length & Density",
      passed: resumeText.split(/\s+/).length >= 250 && resumeText.split(/\s+/).length <= 1100,
      detail: `Total length is ~${resumeText.split(/\s+/).length} words (optimal for 1–2 page ATS review).`
    }
  ];

  return {
    score,
    matched,
    missing,
    totalKeywordsCount: jdKeywords.size,
    matchedCount: matched.length,
    missingCount: missing.length,
    auditChecks
  };
}
