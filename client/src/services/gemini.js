const { GoogleGenerativeAI } = require("@google/generative-ai");

const PROMPT = `You are a contract analysis AI. Analyze the following document text and return a JSON object with EXACTLY this structure — no extra fields, no markdown, no explanation, just the raw JSON:

{
  "title": "Short descriptive title (e.g. NDA — Acme Corp)",
  "type": "One of: NDA, Service Agreement, Employment, Lease, Vendor, Consulting, Partnership, Other",
  "party": "The main counterparty name (not the document owner)",
  "summary": "2-3 sentence plain English summary of what this document is about",
  "keyDates": [
    { "label": "Signed date", "value": "Month DD, YYYY" },
    { "label": "Effective date", "value": "Month DD, YYYY" },
    { "label": "Expiry date", "value": "Month DD, YYYY" }
  ],
  "expiryDate": "YYYY-MM-DD or null if not found",
  "obligations": [
    "Plain English description of obligation 1",
    "Plain English description of obligation 2"
  ],
  "riskFlags": [
    "Description of risk or clause to watch — or empty array if none"
  ],
  "confidence": 85
}

Rules:
- keyDates: include only dates you actually found in the document (1–5 entries)
- obligations: 3–6 most important obligations, plain language
- riskFlags: auto-renewal clauses, non-competes, liability caps, unusual termination terms — empty array if none
- confidence: integer 0–100 reflecting how clearly the document matched a known contract type
- If a field cannot be determined, use null for strings and [] for arrays

Document text:
`;

async function analyzeWithGemini(text, apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent(PROMPT + text);
  const raw = result.response.text().trim();

  const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
  const parsed = JSON.parse(cleaned);

  return {
    title: parsed.title || null,
    type: parsed.type || "Other",
    party: parsed.party || null,
    summary: parsed.summary || null,
    keyDates: Array.isArray(parsed.keyDates) ? parsed.keyDates : [],
    expiryDate: parsed.expiryDate || null,
    obligations: Array.isArray(parsed.obligations) ? parsed.obligations : [],
    riskFlags: Array.isArray(parsed.riskFlags) ? parsed.riskFlags : [],
    confidence: typeof parsed.confidence === "number" ? parsed.confidence : null,
  };
}

module.exports = { analyzeWithGemini };