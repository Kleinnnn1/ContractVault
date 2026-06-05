// src/pages/Dashboard.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarFooter from "../components/SidebarFooter";

const MOCK_DOCS = [
  { id: 1, title: "NDA — Acme Corp", type: "NDA", party: "Acme Corp", date: "2024-01-15", expiry: "2025-01-15", status: "Active", size: "124 KB" },
  { id: 2, title: "Service Agreement — TechFlow", type: "Service Agreement", party: "TechFlow Inc.", date: "2024-03-02", expiry: "2025-03-02", status: "Active", size: "98 KB" },
  { id: 3, title: "Employment Contract — J. Reyes", type: "Employment", party: "Juan Reyes", date: "2023-11-20", expiry: "2026-11-20", status: "Active", size: "210 KB" },
  { id: 4, title: "Lease Agreement — Unit 4B", type: "Lease", party: "PropertyCo", date: "2023-06-01", expiry: "2024-06-01", status: "Expired", size: "305 KB" },
  { id: 5, title: "Vendor Agreement — SupplyBase", type: "Vendor", party: "SupplyBase Ltd.", date: "2024-05-10", expiry: "2025-05-10", status: "Active", size: "178 KB" },
  { id: 6, title: "Consulting Agreement — Bright", type: "Consulting", party: "Bright Strategy", date: "2024-02-28", expiry: "2024-08-28", status: "Expired", size: "89 KB" },
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
  { icon: "⊞", label: "All Documents", key: "all" },
  { icon: "◈", label: "Contracts", key: "contracts" },
  { icon: "⊙", label: "NDAs", key: "ndas" },
  { icon: "◎", label: "Expiring Soon", key: "expiring" },
  { icon: "✕", label: "Expired", key: "expired" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");
  const [activeNav, setActiveNav] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filtered = MOCK_DOCS.filter((d) => {
    const matchSearch =
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.party.toLowerCase().includes(search.toLowerCase()) ||
      d.type.toLowerCase().includes(search.toLowerCase());
    const matchNav =
      activeNav === "all" ? true :
        activeNav === "expired" ? d.status === "Expired" :
          activeNav === "ndas" ? d.type === "NDA" :
            activeNav === "expiring" ? d.status === "Active" :
              true;
    return matchSearch && matchNav;
  });

  return (
    <div className="dash-root">
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
            <div
              key={item.key}
              className={`nav-item ${activeNav === item.key ? "active" : ""}`}
              onClick={() => { setActiveNav(item.key); setSidebarOpen(false); }}
            >
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
      <div className="dash-main">
        {/* Topbar */}
        <header className="dash-topbar">
          <button className="hamburger" onClick={() => setSidebarOpen(true)}>☰</button>

          <div className="search-wrap">
            <span className="search-icon">⌕</span>
            <input
              className="search-input"
              type="text"
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="topbar-actions">
            <button className={`icon-btn ${view === "grid" ? "active-view" : ""}`} onClick={() => setView("grid")} title="Grid view">⊞</button>
            <button className={`icon-btn ${view === "list" ? "active-view" : ""}`} onClick={() => setView("list")} title="List view">☰</button>
            <button className="upload-btn" onClick={() => navigate("/upload")}>
              <span>+ Upload</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="dash-content">
          <div className="content-header">
            <div>
              <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.1rem", fontWeight: 400, color: "var(--text-primary)" }}>
                {NAV_ITEMS.find(n => n.key === activeNav)?.label}
              </h2>
              <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                {filtered.length} document{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="empty-state">
              <p style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>◈</p>
              <p style={{ fontSize: "0.85rem", marginBottom: "0.4rem", color: "var(--text-secondary)" }}>No documents found</p>
              <p style={{ fontSize: "0.75rem" }}>Try a different search or upload a document</p>
            </div>
          )}

          {/* Grid view */}
          {view === "grid" && filtered.length > 0 && (
            <div className="doc-grid">
              {filtered.map((doc) => {
                const color = TYPE_COLORS[doc.type] || { bg: "rgba(150,150,150,0.1)", text: "var(--text-muted)" };
                return (
                  <div key={doc.id} className="doc-card" onClick={() => navigate(`/document/${doc.id}`)}>
                    <div className="doc-card-top">
                      <div className="doc-icon">📄</div>
                      <span className="type-badge" style={{ background: color.bg, color: color.text }}>
                        {doc.type}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--text-primary)", marginBottom: "0.35rem", lineHeight: 1.3 }}>
                      {doc.title}
                    </p>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "0.875rem" }}>
                      {doc.party}
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="status-dot">
                        <span className="dot" style={{ background: doc.status === "Active" ? "#5caa6f" : "#c47070" }} />
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{doc.status}</span>
                      </span>
                      <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>Exp. {doc.expiry}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* List view */}
          {view === "list" && filtered.length > 0 && (
            <div className="table-wrap">
              <table className="doc-table">
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Type</th>
                    <th>Party</th>
                    <th>Expiry</th>
                    <th>Size</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((doc) => {
                    const color = TYPE_COLORS[doc.type] || { bg: "rgba(150,150,150,0.1)", text: "var(--text-muted)" };
                    return (
                      <tr key={doc.id} onClick={() => navigate(`/document/${doc.id}`)}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                            <span style={{ fontSize: "1rem", flexShrink: 0 }}>📄</span>
                            <span style={{ fontSize: "0.82rem", fontWeight: 500 }}>{doc.title}</span>
                          </div>
                        </td>
                        <td><span className="type-badge" style={{ background: color.bg, color: color.text }}>{doc.type}</span></td>
                        <td style={{ color: "var(--text-secondary)", fontSize: "0.78rem" }}>{doc.party}</td>
                        <td style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>{doc.expiry}</td>
                        <td style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>{doc.size}</td>
                        <td>
                          <span className="status-dot">
                            <span className="dot" style={{ background: doc.status === "Active" ? "#5caa6f" : "#c47070" }} />
                            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{doc.status}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}