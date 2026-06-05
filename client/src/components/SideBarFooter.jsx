// src/components/SidebarFooter.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";

export default function SidebarFooter() {
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const user = auth.currentUser;
    const displayName = user?.displayName || user?.email || "User";
    const initial = displayName.charAt(0).toUpperCase();

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/login");
    };

    return (
        <div className="sf-wrap" ref={ref}>
            <div className="sf-profile" onClick={() => setOpen((v) => !v)}>
                <div className="avatar">{initial}</div>
                <div style={{ minWidth: 0 }}>
                    <p className="sf-name">{displayName}</p>
                    <p className="sf-plan">Free plan</p>
                </div>
                <span style={{ fontSize: "0.6rem", color: "var(--text-muted)", marginLeft: "auto", flexShrink: 0 }}>
                    {open ? "▲" : "▼"}
                </span>
            </div>

            <button
                onClick={toggleTheme}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "0.85rem", padding: "0.25rem", marginLeft: "0.5rem", flexShrink: 0 }}
            >
                {theme === "dark" ? "☀" : "☾"}
            </button>

            {open && (
                <div className="sf-dropdown">
                    <div className="sf-dropdown-header">
                        <p className="sf-name">{displayName}</p>
                        <p className="sf-dropdown-email">{user?.email}</p>
                    </div>
                    <div className="sf-menu-item" onClick={() => setOpen(false)}>
                        <span>⚙</span> Settings
                    </div>
                    <div className="sf-menu-item danger" onClick={handleLogout}>
                        <span>→</span> Log out
                    </div>
                </div>
            )}
        </div>
    );
}