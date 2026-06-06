const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

async function extractText(buffer, mimeType) {
  if (mimeType === "application/pdf") {
    const data = await pdfParse(buffer);
    return data.text || "";
  }

  if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  }

  throw new Error(`Unsupported file type: ${mimeType}`);
}

function trimText(text, maxChars = 24000) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxChars) return clean;
  return clean.slice(0, maxChars) + "\n\n[Document truncated for processing]";
}

module.exports = { extractText, trimText };