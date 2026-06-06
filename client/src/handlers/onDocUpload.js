const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const { getStorage } = require("firebase-admin/storage");
const { extractText, trimText } = require("../services/parseDocument");
const { analyzeWithGemini } = require("../services/gemini");

if (!admin.apps.length) {
  admin.initializeApp();
}

exports.onDocUpload = onDocumentCreated(
  {
    document: "documents/{docId}",
    memory: "512MiB",
    timeoutSeconds: 120,
  },
  async (event) => {
    const snap = event.data;
    const docId = event.params.docId;
    const data = snap.data();

    if (data.status !== "pending_review") {
      console.log(`[${docId}] Skipping — status is "${data.status}"`);
      return null;
    }

    const db = admin.firestore();
    const docRef = db.collection("documents").doc(docId);

    await docRef.update({ status: "processing" });

    try {
      console.log(`[${docId}] Downloading: ${data.storagePath}`);
      const bucket = getStorage().bucket();
      const [buffer] = await bucket.file(data.storagePath).download();

      console.log(`[${docId}] Extracting text...`);
      const rawText = await extractText(buffer, data.fileType);

      if (!rawText || rawText.trim().length < 50) {
        throw new Error("Could not extract meaningful text from document.");
      }

      const trimmedText = trimText(rawText);

      console.log(`[${docId}] Sending to Gemini...`);
      const ai = await analyzeWithGemini(trimmedText, process.env.GEMINI_API_KEY);

      await docRef.update({
        status: "ready",
        title: ai.title || data.fileName,
        type: ai.type,
        party: ai.party,
        summary: ai.summary,
        keyDates: ai.keyDates,
        expiryDate: ai.expiryDate,
        obligations: ai.obligations,
        riskFlags: ai.riskFlags,
        confidence: ai.confidence,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`[${docId}] ✓ Done — ${ai.type}, ${ai.confidence}% confidence`);
      return null;

    } catch (err) {
      console.error(`[${docId}] Failed:`, err.message);
      await docRef.update({ status: "error", errorMessage: err.message });
      return null;
    }
  }
);