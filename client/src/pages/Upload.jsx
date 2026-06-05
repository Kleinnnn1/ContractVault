// src/pages/Upload.jsx
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { auth, storage, db } from "../lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const ACCEPTED = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const ACCEPTED_EXT = [".pdf", ".docx"];
const MAX_SIZE_MB = 20;

function formatSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
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
        setFiles((prev) => prev.map((f) => f.id === id ? { ...f, ...patch } : f));

    const uploadAll = async () => {
        const pending = files.filter((f) => f.status === "pending");
        if (!pending.length) return;
        const user = auth.currentUser;

        for (const entry of pending) {
            updateFile(entry.id, { status: "uploading" });
            const filePath = `documents/${user.uid}/${Date.now()}_${entry.file.name}`;
            const storageRef = ref(storage, filePath);
            const uploadTask = uploadBytesResumable(storageRef, entry.file);

            await new Promise((resolve) => {
                uploadTask.on(
                    "state_changed",
                    (snap) => {
                        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
                        updateFile(entry.id, { progress: pct });
                    },
                    (err) => {
                        updateFile(entry.id, { status: "error", error: err.message });
                        resolve();
                    },
                    async () => {
                        try {
                            const url = await getDownloadURL(uploadTask.snapshot.ref);
                            await addDoc(collection(db, "documents"), {
                                uid: user.uid,
                                fileName: entry.file.name,
                                fileType: entry.file.type,
                                fileSize: entry.file.size,
                                storagePath: filePath,
                                downloadURL: url,
                                status: "pending_review",
                                uploadedAt: serverTimestamp(),
                                title: null,
                                type: null,
                                party: null,
                                summary: null,
                                keyDates: [],
                                obligations: [],
                                riskFlags: [],
                                confidence: null,
                            });
                            updateFile(entry.id, { status: "done", progress: 100, url });
                        } catch (err) {
                            updateFile(entry.id, { status: "error", error: err.message });
                        }
                        resolve();
                    }
                );
            });
        }
    };

    const allDone = files.length > 0 && files.every((f) => f.status === "done");
    const anyUploading = files.some((f) => f.status === "uploading");
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
                            PDF and DOCX files up to {MAX_SIZE_MB}MB each
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
                                        {entry.status === "done" && <p style={{ fontSize: "0.68rem", color: "#5caa6f", marginTop: "0.3rem" }}>✓ Uploaded successfully</p>}
                                        {entry.status === "error" && <p style={{ fontSize: "0.68rem", color: "#e05c5c", marginTop: "0.3rem" }}>✕ {entry.error}</p>}
                                        {entry.status === "pending" && <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>Ready to upload</p>}
                                    </div>
                                    {entry.status !== "uploading" && (
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
                                    {anyUploading ? "Uploading..." : `Upload ${pendingCount} file${pendingCount !== 1 ? "s" : ""}`}
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
                            AI processing will begin shortly. Documents will appear in your dashboard once ready.
                        </p>
                    )}
                </main>
            </div>
        </div>
    );
}