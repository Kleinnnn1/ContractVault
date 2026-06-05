// src/pages/DocumentDetail.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import SidebarFooter from "../components/SidebarFooter";

const MOCK_DOCS = [
    {
        id: 1, title: "NDA — Acme Corp", type: "NDA", party: "Acme Corp", date: "2024-01-15", expiry: "2025-01-15", status: "Active", size: "124 KB", uploadedBy: "John Doe", uploadedAt: "2024-01-16", fileName: "nda_acme_corp_2024.pdf",
        ai: { summary: "A mutual non-disclosure agreement between ContractVault LLC and Acme Corp, covering all proprietary and confidential information shared during a potential business partnership. Both parties agree not to disclose, copy, or use the information for any purpose outside the agreed scope.", parties: ["ContractVault LLC", "Acme Corp"], keyDates: [{ label: "Signed date", value: "January 15, 2024" }, { label: "Effective date", value: "January 15, 2024" }, { label: "Expiry date", value: "January 15, 2025" }], obligations: ["Both parties must keep all shared information strictly confidential", "Information may not be shared with third parties without written consent", "Confidential materials must be returned or destroyed upon request", "Agreement survives termination for 2 years"], riskFlags: [], confidence: 97 },
    },
    {
        id: 2, title: "Service Agreement — TechFlow", type: "Service Agreement", party: "TechFlow Inc.", date: "2024-03-02", expiry: "2025-03-02", status: "Active", size: "98 KB", uploadedBy: "John Doe", uploadedAt: "2024-03-03", fileName: "service_agreement_techflow.pdf",
        ai: { summary: "A service agreement between ContractVault LLC and TechFlow Inc. for software development and maintenance services. TechFlow agrees to deliver specified deliverables on a monthly retainer basis, with defined SLAs and escalation procedures.", parties: ["ContractVault LLC", "TechFlow Inc."], keyDates: [{ label: "Start date", value: "March 2, 2024" }, { label: "Review date", value: "September 2, 2024" }, { label: "Expiry date", value: "March 2, 2025" }], obligations: ["TechFlow must deliver monthly progress reports", "Response time for critical issues: 4 hours", "Client must provide access to necessary systems within 5 business days", "Payment due within 30 days of invoice"], riskFlags: ["Auto-renewal clause on page 7 — review before expiry"], confidence: 94 },
    },
    {
        id: 3, title: "Employment Contract — J. Reyes", type: "Employment", party: "Juan Reyes", date: "2023-11-20", expiry: "2026-11-20", status: "Active", size: "210 KB", uploadedBy: "John Doe", uploadedAt: "2023-11-21", fileName: "employment_jreyes.pdf",
        ai: { summary: "Full-time employment contract for Juan Reyes as Senior Software Engineer. Covers compensation, benefits, IP ownership, and termination clauses.", parties: ["ContractVault LLC", "Juan Reyes"], keyDates: [{ label: "Start date", value: "November 20, 2023" }, { label: "Probation end", value: "February 20, 2024" }, { label: "Review date", value: "November 20, 2024" }], obligations: ["Employee must complete 30-day notice period", "IP created during employment belongs to company", "Non-compete applies for 1 year post-employment"], riskFlags: ["Non-compete clause may be unenforceable in some jurisdictions"], confidence: 91 },
    },
    {
        id: 4, title: "Lease Agreement — Unit 4B", type: "Lease", party: "PropertyCo", date: "2023-06-01", expiry: "2024-06-01", status: "Expired", size: "305 KB", uploadedBy: "John Doe", uploadedAt: "2023-06-02", fileName: "lease_unit4b.pdf",
        ai: { summary: "Commercial lease for office Unit 4B. Covers rental terms, maintenance responsibilities, and termination conditions. Lease has now expired.", parties: ["PropertyCo", "ContractVault LLC"], keyDates: [{ label: "Start date", value: "June 1, 2023" }, { label: "Expiry date", value: "June 1, 2024" }], obligations: ["Tenant responsible for interior maintenance", "3 months notice required for non-renewal", "No subletting without written consent"], riskFlags: ["Lease expired — renewal or exit action required"], confidence: 98 },
    },
    {
        id: 5, title: "Vendor Agreement — SupplyBase", type: "Vendor", party: "SupplyBase Ltd.", date: "2024-05-10", expiry: "2025-05-10", status: "Active", size: "178 KB", uploadedBy: "John Doe", uploadedAt: "2024-05-11", fileName: "vendor_supplybase.pdf",
        ai: { summary: "Vendor supply agreement with SupplyBase Ltd. for procurement of office and technology supplies on a preferred vendor basis.", parties: ["ContractVault LLC", "SupplyBase Ltd."], keyDates: [{ label: "Start date", value: "May 10, 2024" }, { label: "Expiry date", value: "May 10, 2025" }], obligations: ["Orders fulfilled within 5 business days", "Defective items replaced within 14 days", "Minimum order value of $500 per month"], riskFlags: [], confidence: 95 },
    },
    {
        id: 6, title: "Consulting Agreement — Bright", type: "Consulting", party: "Bright Strategy", date: "2024-02-28", expiry: "2024-08-28", status: "Expired", size: "89 KB", uploadedBy: "John Doe", uploadedAt: "2024-03-01", fileName: "consulting_bright.pdf",
        ai: { summary: "Short-term consulting agreement with Bright Strategy for market research and go-to-market strategy development. Agreement has expired.", parties: ["ContractVault LLC", "Bright Strategy"], keyDates: [{ label: "Start date", value: "February 28, 2024" }, { label: "Expiry date", value: "August 28, 2024" }], obligations: ["Weekly status updates required", "Final deliverable: strategic report", "Consultant may not work with direct competitors"], riskFlags: ["Agreement expired — archive or renew"], confidence: 93 },
    },
];

const TYPE_COLORS = {
    "NDA": { bg: "rgba(99,120,200,0.12)", text: "#7b8fd4" },
    "Service Agreement": { bg: "rgba(92,170,111,0.12)", text: "#5caa6f" },
    "Employment": { bg: "rgba(212,146,79,0.12)", text: "#d4924f" },
    "Lease": { bg: "rgba(180,100,100,0.12)", text: "#c47070" },
    "Vendor": { bg: "rgba(130,100,200,0.12)", text: "#9b7ed4" },
    "Consulting": { bg: "rgba(79,170,200,0.12)", text: "#4faac8" },
};

const NAV_ITEMS = [
    { icon: "⊞", label: "All Documents" },
    { icon: "◈", label: "Contracts" },
    { icon: "⊙", label: "NDAs" },
    { icon: "◎", label: "Expiring Soon" },
    { icon: "✕", label: "Expired" },
];

function MetaRow({ label, value }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", padding: "0.75rem 0", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>{label}</span>
            <span style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>{value}</span>
        </div>
    );
}

export default function DocumentDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");

    const doc = MOCK_DOCS.find((d) => d.id === parseInt(id));
    const color = doc ? (TYPE_COLORS[doc.type] || { bg: "rgba(150,150,150,0.1)", text: "var(--text-muted)" }) : null;

    if (!doc) {
        return (
            <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem", fontFamily: "'DM Mono', monospace" }}>
                <p style={{ fontSize: "2rem" }}>◈</p>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Document not found</p>
                <button className="cv-btn-primary" style={{ width: "auto", padding: "0.6rem 1.5rem" }} onClick={() => navigate("/dashboard")}>
                    Back to dashboard
                </button>
            </div>
        );
    }

    const tabs = ["overview", "obligations", "raw info"];

    return (
        <div className="detail-root">
            <div className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />

            {/* Sidebar */}
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
                        <div key={item.label} className="nav-item" onClick={() => { navigate("/dashboard"); setSidebarOpen(false); }}>
                            <span style={{ fontSize: "0.85rem" }}>{item.icon}</span>
                            {item.label}
                        </div>
                    ))}
                    <p className="nav-label" style={{ marginTop: "1.25rem" }}>Settings</p>
                    <div className="nav-item"><span>⚙</span> Settings</div>
                    <div className="nav-item"><span>?</span> Help</div>
                </nav>
                <SidebarFooter />
            </aside>

            {/* Main */}
            <div className="detail-main">
                <header className="detail-topbar">
                    <button className="hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
                    <button className="back-btn" onClick={() => navigate("/dashboard")}>← Back to dashboard</button>
                    <div style={{ marginLeft: "auto" }}>
                        <div className="action-row">
                            <button className="action-btn">⬇ Download</button>
                            <button className="action-btn">✎ Rename</button>
                            <button className="action-btn" style={{ color: "#e05c5c" }}>✕ Delete</button>
                        </div>
                    </div>
                </header>

                <main className="detail-content">
                    {/* Document header card */}
                    <div className="doc-header fade-up fade-up-1">
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                                <span className="type-badge" style={{ background: color.bg, color: color.text }}>
                                    {doc.type}
                                </span>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.72rem", color: doc.status === "Active" ? "#5caa6f" : "#c47070" }}>
                                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                                    {doc.status}
                                </span>
                            </div>
                            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.4rem", fontWeight: 400, color: "var(--text-primary)", lineHeight: 1.2, marginBottom: "0.35rem" }}>
                                {doc.title}
                            </h1>
                            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                {doc.fileName} · {doc.size} · Uploaded {doc.uploadedAt}
                            </p>
                        </div>

                        {/* AI confidence */}
                        <div style={{ minWidth: "140px", maxWidth: "180px", flexShrink: 0 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>AI confidence</span>
                                <span style={{ fontSize: "0.78rem", color: "#5caa6f", fontWeight: 500 }}>{doc.ai.confidence}%</span>
                            </div>
                            <div className="confidence-track">
                                <div className="confidence-fill" style={{ width: `${doc.ai.confidence}%` }} />
                            </div>
                            <p style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>✦ Auto-categorized by AI</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="tabs fade-up fade-up-2">
                        {tabs.map((tab) => (
                            <button key={tab} className={`tab-btn ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Tab: Overview */}
                    {activeTab === "overview" && (
                        <div className="detail-grid fade-up fade-up-3">
                            <div>
                                <div className="info-card">
                                    <p className="info-card-title">✦ AI summary</p>
                                    <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.75 }}>{doc.ai.summary}</p>
                                </div>

                                {doc.ai.riskFlags.length > 0 && (
                                    <div className="info-card">
                                        <p className="info-card-title">⚠ Risk flags</p>
                                        {doc.ai.riskFlags.map((flag, i) => (
                                            <div key={i} className="risk-flag">
                                                <span style={{ flexShrink: 0 }}>⚠</span>{flag}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="info-card">
                                    <p className="info-card-title">Parties involved</p>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                        {doc.ai.parties.map((party, i) => (
                                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.6rem 0.75rem", background: "var(--bg-input)", borderRadius: "6px", border: "1px solid var(--border)" }}>
                                                <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "var(--accent-subtle)", border: "1px solid rgba(193,123,62,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", color: "var(--accent)", fontWeight: 600, flexShrink: 0 }}>
                                                    {party.charAt(0)}
                                                </div>
                                                <span style={{ fontSize: "0.8rem", color: "var(--text-primary)" }}>{party}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="info-card">
                                    <p className="info-card-title">Key dates</p>
                                    {doc.ai.keyDates.map((d, i) => (
                                        <MetaRow key={i} label={d.label} value={d.value} />
                                    ))}
                                </div>
                                <div className="info-card">
                                    <p className="info-card-title">File info</p>
                                    <MetaRow label="File name" value={doc.fileName} />
                                    <MetaRow label="File size" value={doc.size} />
                                    <MetaRow label="Uploaded by" value={doc.uploadedBy} />
                                    <MetaRow label="Upload date" value={doc.uploadedAt} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab: Obligations */}
                    {activeTab === "obligations" && (
                        <div className="fade-up fade-up-3">
                            <div className="info-card">
                                <p className="info-card-title">Key obligations</p>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                                    {doc.ai.obligations.map((ob, i) => (
                                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", padding: "0.75rem", background: "var(--bg-input)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                                            <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "var(--accent-subtle)", border: "1px solid rgba(193,123,62,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", color: "var(--accent)", fontWeight: 600, flexShrink: 0, marginTop: "1px" }}>
                                                {i + 1}
                                            </span>
                                            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{ob}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab: Raw info */}
                    {activeTab === "raw info" && (
                        <div className="fade-up fade-up-3">
                            <div className="info-card">
                                <p className="info-card-title">Raw extracted data</p>
                                <pre style={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 1.7, overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                                    {JSON.stringify({ id: doc.id, title: doc.title, type: doc.type, status: doc.status, party: doc.party, signedDate: doc.date, expiryDate: doc.expiry, fileName: doc.fileName, size: doc.size, uploadedBy: doc.uploadedBy, uploadedAt: doc.uploadedAt, ai: doc.ai }, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}