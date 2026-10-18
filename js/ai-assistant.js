/**
 * ACPR AI Assistant & Bullet Polisher
 * Inspired by LingyiChen-AI/JadeAI
 * Features:
 * - Local offline heuristic enhancer (XYZ formula, power verbs, metric injection)
 * - Optional BYOK (Bring Your Own Key) for OpenAI / Groq / OpenAI-compatible endpoints
 */

const POWER_ACTION_VERBS = [
  "Architected", "Spearheaded", "Engineered", "Orchestrated", "Streamlined",
  "Pioneered", "Optimized", "Scaled", "Automated", "Consolidated", "Accelerated"
];

const WEAK_VERBS_REGEX = /\b(worked on|helped with|was responsible for|assisted in|participated in|did|made|managed|handled)\b/gi;

/**
 * Local Offline Heuristic Enhancer
 */
export function enhanceBulletLocal(rawBullet, roleContext = "") {
  if (!rawBullet || rawBullet.trim().length === 0) {
    return [];
  }

  const clean = rawBullet.trim();
  const verb = POWER_ACTION_VERBS[Math.floor(Math.random() * POWER_ACTION_VERBS.length)];
  const verb2 = POWER_ACTION_VERBS[(Math.floor(Math.random() * POWER_ACTION_VERBS.length) + 1) % POWER_ACTION_VERBS.length];
  const verb3 = POWER_ACTION_VERBS[(Math.floor(Math.random() * POWER_ACTION_VERBS.length) + 2) % POWER_ACTION_VERBS.length];

  // Remove weak verbs if present
  let coreText = clean.replace(WEAK_VERBS_REGEX, "").trim();
  // Capitalize first letter of remainder
  coreText = coreText.charAt(0).toLowerCase() + coreText.slice(1);

  const variations = [
    {
      type: "High-Impact Leadership",
      badge: "Scale & Leadership",
      text: `${verb} ${coreText}, accelerating team delivery velocity and reducing operational overhead across multi-tier production services.`
    },
    {
      type: "Quantified Metrics (XYZ Formula)",
      badge: "Results & ROI",
      text: `${verb2} ${coreText}, driving a measurable 34% reduction in latency and saving an estimated $120k annually in cluster infrastructure costs.`
    },
    {
      type: "Technical Rigor & Architecture",
      badge: "Deep Systems",
      text: `${verb3} end-to-end resilient architecture for ${coreText}, implementing automated fault tolerance and achieving 99.99% system availability.`
    }
  ];

  return variations;
}

/**
 * Cloud LLM API Integration (OpenAI-compatible)
 */
export async function enhanceBulletWithAI({ apiKey, baseUrl, model, prompt, bullet }) {
  if (!apiKey) {
    throw new Error("No API key provided. Please configure your API key in Settings or use the Offline AI Engine.");
  }

  const endpoint = (baseUrl ? baseUrl.replace(/\/+$/, "") : "https://api.openai.com/v1") + "/chat/completions";
  const modelName = model || "gpt-4o-mini";

  const systemPrompt = `You are ACPR's elite resume optimization engine. The user provides a resume bullet point. Rewrite it into exactly 3 distinct, high-impact variations following Google's XYZ formula ("Accomplished [X] as measured by [Y] by doing [Z]"). Use strong action verbs, quantifiable outcomes, and clear technical specificity. Output pure JSON format:
{
  "variations": [
    { "type": "Scale & Leadership", "text": "..." },
    { "type": "Quantified Metrics", "text": "..." },
    { "type": "Technical Rigor", "text": "..." }
  ]
}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Original Bullet: "${bullet}"\nAdditional Context: ${prompt || "Tech role"}` }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`AI API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  const parsed = JSON.parse(content);
  return parsed.variations || [];
}
