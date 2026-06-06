import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { auth, storage, db } from "../lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as pdfjs from "pdfjs-dist";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;

const ACCEPTED = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const ACCEPTED_EXT = [".pdf", ".docx"];
const MAX_SIZE_MB = 20;

const GEMINI_PROMPT = `You are a contract analysis AI. Analyze the following document text and return a JSON object with EXACTLY this structure — no extra fields, no markdown, no explanation, just the raw JSON:

{
  "title": "Short descriptive title (e.g. NDA — Acme Corp)",
  "type": "One of: NDA, Service Agreement, Employment, Lease, Vendor, Consulting, Partnership, Other",
  "party": "The main counterparty name (not the document owner)",
  "summary": "2-3 sentence plain English summary of what this document is about",
  "keyDates": [
    { "label": "Signed date", "value": "Month DD, YYYY" }
  ],
  "expiryDate": "YYYY-MM-DD or null if not found",
  "obligations": ["obligation 1", "obligation 2"],
  "riskFlags": ["risk 1"],
  "confidence": 85
}

Rules:
- keyDates: only dates actually found in the document (1-5 entries)
- obligations: 3-6 most important, plain language
- riskFlags: auto-renewal, non-competes, liability caps — empty array if none
- confidence: integer 0-100
- Use null for missing strings, [] for missing arrays

Document text:
`;

function formatSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

async function extractTextFromPDF(buffer) {
    const uint8 = new Uint8Array(buffer);
    const pdf = await pdfjs.getDocument({ data: uint8 }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item) => item.str).join(" ") + "\n";
    }
    return text;
}

async function extractTextFromDOCX(buffer) {
    // Dynamically import mammoth (CommonJS) via a workaround for Vite
    const mammoth = (await import("mammoth")).default;
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value || "";
}

async function analyzeWithGemini(text) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const trimmed = text.replace(/\s+/g, " ").trim().slice(0, 24000);
    const result = await model.generateContent(GEMINI_PROMPT + trimmed);
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

const NAV_ITEMS = [
    { icon: "⊞", label: "All Documents", key: "all" },
    { icon: "◈", label: "Contracts", key: "contracts" },
    { icon: "⊙", label: "NDAs", key: "ndas" },
    { icon: "◎", label: "Expiring Soon", key: "expiring" },
    { icon: "✕", label: "Expired", key: "expired" },
];

export default function Upload() {
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [files, setFiles] = useState([]);

    const addFiles = (incoming) => {
        const valid = Array.from(incoming).filter((f) => {
            if (!ACCEPTED.includes(f.type)) return false;
            if (f.size > MAX_SIZE_MB * 1024 * 1024) return false;
            return true;
        });
        const newEntries = valid.map((f) => ({
            file: f,
            id: crypto.randomUUID(),
            progress: 0,
            status: "pending",
            statusLabel: "Ready to upload",
            error: null,
            url: null,
        }));
        setFiles((prev) => [...prev, ...newEntries]);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        addFiles(e.dataTransfer.files);
    };

    const handleFileInput = (e) => {
        addFiles(e.target.files);
        e.target.value = "";
    };

    const removeFile = (id) => setFiles((prev) => prev.filter((f) => f.id !== id));

    const updateFile = (id, patch) =>
        setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));

    const uploadAll = async () => {
        const pending = files.filter((f) => f.status === "pending");
        if (!pending.length) return;
        const user = auth.currentUser;

        for (const entry of pending) {
            updateFile(entry.id, { status: "uploading", statusLabel: "Uploading..." });

            try {
                // 1. Upload to Firebase Storage
                const filePath = `documents/${user.uid}/${Date.now()}_${entry.file.name}`;
                const storageRef = ref(storage, filePath);
                const uploadTask = uploadBytesResumable(storageRef, entry.file);

                const downloadURL = await new Promise((resolve, reject) => {
                    uploadTask.on(
                        "state_changed",
                        (snap) => {
                            const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
                            updateFile(entry.id, { progress: pct });
                        },
                        reject,
                        async () => resolve(await getDownloadURL(uploadTask.snapshot.ref))
                    );
                });

                // 2. Write initial Firestore record
                updateFile(entry.id, { statusLabel: "Analyzing with AI..." });
                const docRef = await addDoc(collection(db, "documents"), {
                    uid: user.uid,
                    fileName: entry.file.name,
                    fileType: entry.file.type,
                    fileSize: entry.file.size,
                    storagePath: filePath,
                    downloadURL,
                    status: "processing",
                    uploadedAt: serverTimestamp(),
                    title: null, type: null, party: null, summary: null,
                    keyDates: [], expiryDate: null, obligations: [],
                    riskFlags: [], confidence: null,
                });

                // 3. Extract text client-side
                const buffer = await entry.file.arrayBuffer();
                let text = "";
                if (entry.file.type === "application/pdf") {
                    text = await extractTextFromPDF(buffer);
                } else {
                    text = await extractTextFromDOCX(buffer);
                }

                if (!text || text.trim().length < 50) {
                    throw new Error("Could not extract text from this document.");
                }

                // 4. Analyze with Gemini
                const ai = await analyzeWithGemini(text);

                // 5. Update Firestore with AI results
                await updateDoc(docRef, {
                    status: "ready",
                    title: ai.title || entry.file.name,
                    type: ai.type,
                    party: ai.party,
                    summary: ai.summary,
                    keyDates: ai.keyDates,
                    expiryDate: ai.expiryDate,
                    obligations: ai.obligations,
                    riskFlags: ai.riskFlags,
                    confidence: ai.confidence,
                    processedAt: serverTimestamp(),
                });

                updateFile(entry.id, { status: "done", progress: 100, url: downloadURL, statusLabel: "Done" });

            } catch (err) {
                console.error(err);
                updateFile(entry.id, { status: "error", error: err.message, statusLabel: "Failed" });
            }
        }
    };

    const allDone = files.length > 0 && files.every((f) => f.status === "done");
    const anyUploading = files.some((f) => f.status === "uploading" || f.status === "processing");
    const pendingCount = files.filter((f) => f.status === "pending").length;

    return (
        <div className="upload-root">
            <div className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />

            <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
                <div className="sidebar-logo">
                    <div style={{ width: "26px", height: "26px", background: "var(--accent)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                            <rect x="2" y="1" width="8" height="10" rx="1.5" stroke="white" strokeWidth="1.2" />
                            <path d="M4 5h4M4 7h4M4 9h2" stroke="white" strokeWidth="1" strokeLinecap="round" />
                            <rect x="8" y="7" width="4" height="5" rx="1" fill="white" opacity="0.9" />
                        </svg>
                    </div>
                    <span>ContractVault</span>
                </div>
                <nav className="sidebar-nav">
                    <p className="nav-label">Library</p>
                    {NAV_ITEMS.map((item) => (
                        <div key={item.key} className="nav-item" onClick={() => { navigate("/dashboard"); setSidebarOpen(false); }}>
                            <span style={{ fontSize: "0.85rem" }}>{item.icon}</span>{item.label}
                        </div>
                    ))}
                    <p className="nav-label" style={{ marginTop: "1.25rem" }}>Settings</p>
                    <div className="nav-item"><span>⚙</span> Settings</div>
                    <div className="nav-item"><span>?</span> Help</div>
                </nav>
                <div className="sidebar-footer">
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <div className="avatar">{auth.currentUser?.displayName?.charAt(0)?.toUpperCase() || "U"}</div>
                        <div>
                            <p style={{ fontSize: "0.75rem", color: "var(--text-primary)", lineHeight: 1.2 }}>{auth.currentUser?.displayName || auth.currentUser?.email}</p>
                            <p style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Free plan</p>
                        </div>
                    </div>
                    <button onClick={toggleTheme} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "0.85rem", padding: "0.25rem" }}>
                        {theme === "dark" ? "☀" : "☾"}
                    </button>
                </div>
            </aside>

            <div className="upload-main">
                <header className="upload-topbar">
                    <button className="hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
                    <button className="back-btn" onClick={() => navigate("/dashboard")}>← Back to dashboard</button>
                </header>

                <main className="upload-content">
                    <div style={{ marginBottom: "1.75rem" }}>
                        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.4rem", fontWeight: 400, color: "var(--text-primary)", marginBottom: "0.3rem" }}>
                            Upload Documents
                        </h1>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            PDF and DOCX files up to {MAX_SIZE_MB}MB — AI analysis runs automatically
                        </p>
                    </div>

                    <div
                        className={`drop-zone ${dragging ? "dragging" : ""}`}
                        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input ref={fileInputRef} type="file" accept={ACCEPTED_EXT.join(",")} multiple style={{ display: "none" }} onChange={handleFileInput} />
                        <div className="drop-icon">📄</div>
                        <p style={{ fontSize: "0.88rem", color: "var(--text-primary)", marginBottom: "0.4rem", fontWeight: 500 }}>
                            {dragging ? "Drop files here" : "Drag & drop files here"}
                        </p>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            or <span style={{ color: "var(--accent)", cursor: "pointer" }}>browse</span> to choose files
                        </p>
                        <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "0.75rem", letterSpacing: "0.06em" }}>
                            PDF · DOCX · Max {MAX_SIZE_MB}MB per file
                        </p>
                    </div>

                    {files.length > 0 && (
                        <div className="file-list">
                            {files.map((entry) => (
                                <div key={entry.id} className={`file-row ${entry.status}`}>
                                    <div className="file-icon">
                                        {entry.file.type === "application/pdf" ? "📕" : "📘"}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
                                            <p style={{ fontSize: "0.8rem", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {entry.file.name}
                                            </p>
                                            <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", flexShrink: 0 }}>
                                                {formatSize(entry.file.size)}
                                            </span>
                                        </div>
                                        {entry.status === "uploading" && (
                                            <div className="progress-track">
                                                <div className="progress-fill" style={{ width: `${entry.progress}%` }} />
                                            </div>
                                        )}
                                        {entry.status === "done" && <p style={{ fontSize: "0.68rem", color: "#5caa6f", marginTop: "0.3rem" }}>✓ Uploaded & analyzed</p>}
                                        {entry.status === "error" && <p style={{ fontSize: "0.68rem", color: "#e05c5c", marginTop: "0.3rem" }}>✕ {entry.error}</p>}
                                        {(entry.status === "pending" || entry.status === "uploading") && (
                                            <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>{entry.statusLabel}</p>
                                        )}
                                        {entry.status === "processing" && (
                                            <p style={{ fontSize: "0.68rem", color: "var(--accent)", marginTop: "0.3rem" }}>✦ Analyzing with AI...</p>
                                        )}
                                    </div>
                                    {entry.status !== "uploading" && entry.status !== "processing" && (
                                        <button className="remove-btn" onClick={() => removeFile(entry.id)}>✕</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {files.length > 0 && (
                        <div className="upload-actions">
                            {!allDone && (
                                <button className="cv-btn-primary" style={{ width: "auto", padding: "0.65rem 1.5rem" }} onClick={uploadAll} disabled={anyUploading || pendingCount === 0}>
                                    {anyUploading ? "Processing..." : `Upload ${pendingCount} file${pendingCount !== 1 ? "s" : ""}`}
                                </button>
                            )}
                            {allDone && (
                                <button className="cv-btn-primary" style={{ width: "auto", padding: "0.65rem 1.5rem" }} onClick={() => navigate("/dashboard")}>
                                    Go to dashboard →
                                </button>
                            )}
                            <button className="btn-secondary" onClick={() => setFiles([])}>Clear all</button>
                        </div>
                    )}

                    {allDone && (
                        <p className="upload-notice">
                            <span>✦</span>
                            All documents analyzed and ready in your dashboard.
                        </p>
                    )}
                </main>
            </div>
        </div>
    );
}