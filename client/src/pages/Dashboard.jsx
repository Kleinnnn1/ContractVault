import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

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
    const { theme, toggleTheme } = useTheme();
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
        <>
            <style>{`
        .dash-root {
          min-height: 100vh;
          min-height: 100dvh;
          background: var(--bg-primary);
          display: flex;
          font-family: 'DM Mono', monospace;
        }

        /* ── Sidebar ── */
        .sidebar {
          width: 240px;
          min-height: 100vh;
          background: var(--bg-card);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
          transition: transform 0.25s ease;
          z-index: 40;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 1.5rem 1.25rem 1.25rem;
          border-bottom: 1px solid var(--border);
        }

        .sidebar-nav {
          padding: 1rem 0.75rem;
          flex: 1;
        }

        .nav-label {
          font-size: 0.65rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-muted);
          padding: 0 0.5rem;
          margin-bottom: 0.4rem;
          margin-top: 0.75rem;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.55rem 0.75rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8rem;
          color: var(--text-secondary);
          transition: all 0.15s ease;
          border: 1px solid transparent;
          margin-bottom: 0.15rem;
        }

        .nav-item:hover {
          background: var(--bg-input);
          color: var(--text-primary);
        }

        .nav-item.active {
          background: var(--accent-subtle);
          color: var(--accent);
          border-color: rgba(193,123,62,0.2);
        }

        .sidebar-footer {
          padding: 1rem 1.25rem;
          border-top: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          color: white;
          font-weight: 500;
          flex-shrink: 0;
        }

        /* ── Main ── */
        .dash-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .dash-topbar {
          background: var(--bg-card);
          border-bottom: 1px solid var(--border);
          padding: 0.875rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          position: sticky;
          top: 0;
          z-index: 30;
        }

        .search-wrap {
          flex: 1;
          position: relative;
          max-width: 420px;
        }

        .search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          font-size: 0.85rem;
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          background: var(--bg-input);
          border: 1px solid var(--border);
          color: var(--text-primary);
          font-family: 'DM Mono', monospace;
          font-size: 0.8rem;
          padding: 0.55rem 0.875rem 0.55rem 2.1rem;
          border-radius: 6px;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .search-input:focus {
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3px var(--accent-subtle);
        }

        .search-input::placeholder { color: var(--text-muted); }

        .topbar-actions {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-left: auto;
        }

        .icon-btn {
          background: var(--bg-input);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 0.45rem 0.6rem;
          cursor: pointer;
          color: var(--text-secondary);
          font-size: 0.75rem;
          font-family: 'DM Mono', monospace;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          white-space: nowrap;
        }

        .icon-btn:hover {
          border-color: var(--border-focus);
          color: var(--text-primary);
        }

        .icon-btn.active-view {
          background: var(--accent-subtle);
          border-color: rgba(193,123,62,0.3);
          color: var(--accent);
        }

        .upload-btn {
          background: var(--accent);
          border: none;
          border-radius: 6px;
          padding: 0.5rem 1rem;
          cursor: pointer;
          color: white;
          font-family: 'DM Mono', monospace;
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          transition: background 0.2s ease, box-shadow 0.2s ease;
          white-space: nowrap;
        }

        .upload-btn:hover {
          background: var(--accent-hover);
          box-shadow: 0 4px 12px rgba(193,123,62,0.3);
        }

        /* ── Content ── */
        .dash-content {
          padding: 1.5rem;
          flex: 1;
        }

        .content-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        /* ── Grid view ── */
        .doc-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1rem;
        }

        .doc-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 1.25rem;
          cursor: pointer;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease;
        }

        .doc-card:hover {
          border-color: rgba(193,123,62,0.35);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          transform: translateY(-2px);
        }

        .doc-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 0.875rem;
        }

        .doc-icon {
          width: 36px;
          height: 36px;
          background: var(--accent-subtle);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          flex-shrink: 0;
        }

        /* ── Table view ── */
        .doc-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8rem;
        }

        .doc-table th {
          text-align: left;
          font-size: 0.68rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
          padding: 0.6rem 1rem;
          border-bottom: 1px solid var(--border);
          font-weight: 400;
          white-space: nowrap;
        }

        .doc-table td {
          padding: 0.875rem 1rem;
          border-bottom: 1px solid var(--border);
          color: var(--text-primary);
          vertical-align: middle;
        }

        .doc-table tr:last-child td { border-bottom: none; }

        .doc-table tbody tr {
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .doc-table tbody tr:hover {
          background: var(--bg-input);
        }

        .table-wrap {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 10px;
          overflow: hidden;
          overflow-x: auto;
        }

        /* ── Badges ── */
        .type-badge {
          display: inline-block;
          font-size: 0.65rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-weight: 500;
          white-space: nowrap;
        }

        .status-dot {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
        }

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        /* ── Empty state ── */
        .empty-state {
          text-align: center;
          padding: 4rem 1rem;
          color: var(--text-muted);
        }

        /* ── Mobile sidebar overlay ── */
        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 35;
        }

        .hamburger {
          display: none;
          background: var(--bg-input);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 0.45rem 0.55rem;
          cursor: pointer;
          color: var(--text-secondary);
          font-size: 1rem;
          line-height: 1;
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .doc-grid {
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            transform: translateX(-100%);
          }

          .sidebar.open {
            transform: translateX(0);
            box-shadow: 4px 0 24px rgba(0,0,0,0.3);
          }

          .sidebar-overlay.open {
            display: block;
          }

          .hamburger {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .dash-topbar {
            padding: 0.75rem 1rem;
          }

          .dash-content {
            padding: 1rem;
          }

          .upload-btn span {
            display: none;
          }

          .upload-btn::after {
            content: "+";
            font-size: 1.1rem;
          }
        }

        @media (max-width: 560px) {
          .doc-grid {
            grid-template-columns: 1fr;
          }

          .doc-table th:nth-child(3),
          .doc-table td:nth-child(3),
          .doc-table th:nth-child(5),
          .doc-table td:nth-child(5) {
            display: none;
          }

          .content-header h2 {
            font-size: 0.95rem !important;
          }
        }

        @media (max-width: 400px) {
          .doc-table th:nth-child(4),
          .doc-table td:nth-child(4) {
            display: none;
          }
        }
      `}</style>

            <div className="dash-root">

                {/* Sidebar overlay (mobile) */}
                <div
                    className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`}
                    onClick={() => setSidebarOpen(false)}
                />

                {/* Sidebar */}
                <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
                    {/* Logo */}
                    <div className="sidebar-logo">
                        <div style={{ width: "26px", height: "26px", background: "var(--accent)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                                <rect x="2" y="1" width="8" height="10" rx="1.5" stroke="white" strokeWidth="1.2" />
                                <path d="M4 5h4M4 7h4M4 9h2" stroke="white" strokeWidth="1" strokeLinecap="round" />
                                <rect x="8" y="7" width="4" height="5" rx="1" fill="white" opacity="0.9" />
                            </svg>
                        </div>
                        <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1rem", color: "var(--text-primary)" }}>
                            ContractVault
                        </span>
                    </div>

                    {/* Nav */}
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
                        <div className="nav-item" onClick={() => { }}>
                            <span>⚙</span> Settings
                        </div>
                        <div className="nav-item" onClick={() => { }}>
                            <span>?</span> Help
                        </div>
                    </nav>

                    {/* Footer */}
                    <div className="sidebar-footer">
                        <div className="user-info">
                            <div className="avatar">JD</div>
                            <div>
                                <p style={{ fontSize: "0.75rem", color: "var(--text-primary)", lineHeight: 1.2 }}>John Doe</p>
                                <p style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Free plan</p>
                            </div>
                        </div>
                        <button
                            onClick={toggleTheme}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "0.85rem", padding: "0.25rem" }}
                            title="Toggle theme"
                        >
                            {theme === "dark" ? "☀" : "☾"}
                        </button>
                    </div>
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
                            {/* View toggle */}
                            <button
                                className={`icon-btn ${view === "grid" ? "active-view" : ""}`}
                                onClick={() => setView("grid")}
                                title="Grid view"
                            >⊞</button>
                            <button
                                className={`icon-btn ${view === "list" ? "active-view" : ""}`}
                                onClick={() => setView("list")}
                                title="List view"
                            >☰</button>

                            <button className="upload-btn">
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
                                        <div key={doc.id} className="doc-card">
                                            <div className="doc-card-top">
                                                <div className="doc-icon">📄</div>
                                                <span
                                                    className="type-badge"
                                                    style={{ background: color.bg, color: color.text }}
                                                >
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
                                                <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                                                    Exp. {doc.expiry}
                                                </span>
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
                                                <tr key={doc.id}>
                                                    <td>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                                            <span style={{ fontSize: "1rem", flexShrink: 0 }}>📄</span>
                                                            <span style={{ fontSize: "0.82rem", fontWeight: 500 }}>{doc.title}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="type-badge" style={{ background: color.bg, color: color.text }}>
                                                            {doc.type}
                                                        </span>
                                                    </td>
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
        </>
    );
}