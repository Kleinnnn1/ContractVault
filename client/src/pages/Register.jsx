import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export default function Register() {
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!form.name || !form.email || !form.password || !form.confirm) {
            setError("Please fill in all fields.");
            return;
        }
        if (form.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        if (form.password !== form.confirm) {
            setError("Passwords do not match.");
            return;
        }
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            navigate("/dashboard");
        }, 1000);
    };

    const strength = (() => {
        const p = form.password;
        if (!p) return null;
        if (p.length < 6) return { label: "Too short", color: "#e05c5c", width: "25%" };
        if (p.length < 8 || !/[0-9]/.test(p)) return { label: "Weak", color: "#e08c3c", width: "50%" };
        if (!/[^a-zA-Z0-9]/.test(p)) return { label: "Medium", color: "#d4b84f", width: "75%" };
        return { label: "Strong", color: "#5caa6f", width: "100%" };
    })();

    return (
        <>
            <style>{`
        .register-wrapper {
          min-height: 100vh;
          min-height: 100dvh;
          background: var(--bg-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          position: relative;
        }

        .register-card {
          width: 100%;
          max-width: 420px;
          padding: 2.5rem;
          position: relative;
          z-index: 1;
        }

        .theme-toggle {
          position: fixed;
          top: 1.25rem;
          right: 1.25rem;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 0.5rem 0.75rem;
          cursor: pointer;
          color: var(--text-secondary);
          font-family: 'DM Mono', monospace;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          transition: all 0.2s ease;
          z-index: 10;
        }

        .theme-toggle:hover {
          border-color: var(--border-focus);
          color: var(--text-primary);
        }

        .google-btn {
          width: 100%;
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 0.75rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          color: var(--text-secondary);
          font-family: 'DM Mono', monospace;
          font-size: 0.8rem;
          transition: all 0.2s ease;
        }

        .google-btn:hover {
          border-color: var(--border-focus);
          color: var(--text-primary);
        }

        .strength-bar-track {
          width: 100%;
          height: 3px;
          background: var(--border);
          border-radius: 999px;
          margin-top: 0.5rem;
          overflow: hidden;
        }

        .strength-bar-fill {
          height: 100%;
          border-radius: 999px;
          transition: width 0.3s ease, background 0.3s ease;
        }

        .login-link {
          color: var(--accent);
          text-decoration: none;
        }

        .login-link:hover {
          text-decoration: underline;
        }

        .terms-text {
          font-size: 0.72rem;
          color: var(--text-muted);
          text-align: center;
          margin-top: 1rem;
          line-height: 1.6;
        }

        .terms-text a {
          color: var(--accent);
          text-decoration: none;
        }

        .terms-text a:hover {
          text-decoration: underline;
        }

        @media (max-width: 640px) {
          .register-card {
            padding: 2rem 1.5rem;
          }
          .register-card h1 {
            font-size: 1.5rem !important;
          }
        }

        @media (max-width: 480px) {
          .register-wrapper {
            padding: 0;
            align-items: flex-start;
          }
          .register-card {
            max-width: 100%;
            min-height: 100dvh;
            padding: 1.5rem 1.25rem;
            border-radius: 0;
            border-left: none;
            border-right: none;
            border-top: none;
            box-shadow: none;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .theme-toggle {
            top: 1rem;
            right: 1rem;
            padding: 0.4rem 0.6rem;
            font-size: 0.7rem;
          }
        }

        @media (max-width: 360px) {
          .register-card {
            padding: 1.25rem 1rem;
          }
        }
      `}</style>

            <div className="register-wrapper">
                {/* Background glow */}
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundImage:
                            theme === "dark"
                                ? "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(212,146,79,0.07) 0%, transparent 70%)"
                                : "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(193,123,62,0.06) 0%, transparent 70%)",
                        pointerEvents: "none",
                    }}
                />

                {/* Theme toggle */}
                <button className="theme-toggle" onClick={toggleTheme}>
                    {theme === "dark" ? "☀ light" : "☾ dark"}
                </button>

                {/* Card */}
                <div className="cv-card register-card">

                    {/* Logo */}
                    <div className="fade-up fade-up-1" style={{ marginBottom: "2rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
                            <div
                                style={{
                                    width: "28px",
                                    height: "28px",
                                    background: "var(--accent)",
                                    borderRadius: "6px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}
                            >
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <rect x="2" y="1" width="8" height="10" rx="1.5" stroke="white" strokeWidth="1.2" />
                                    <path d="M4 5h4M4 7h4M4 9h2" stroke="white" strokeWidth="1" strokeLinecap="round" />
                                    <rect x="8" y="7" width="4" height="5" rx="1" fill="white" opacity="0.9" />
                                </svg>
                            </div>
                            <span
                                style={{
                                    fontFamily: "'DM Serif Display', serif",
                                    fontSize: "1.2rem",
                                    color: "var(--text-primary)",
                                    letterSpacing: "0.01em",
                                }}
                            >
                                ContractVault
                            </span>
                        </div>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", letterSpacing: "0.05em" }}>
                            Secure document intelligence
                        </p>
                    </div>

                    {/* Heading */}
                    <div className="fade-up fade-up-2" style={{ marginBottom: "1.75rem" }}>
                        <h1
                            style={{
                                fontFamily: "'DM Serif Display', serif",
                                fontSize: "1.75rem",
                                fontWeight: 400,
                                color: "var(--text-primary)",
                                lineHeight: 1.2,
                                marginBottom: "0.4rem",
                            }}
                        >
                            Create your vault
                        </h1>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                            Start managing your documents intelligently
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>

                        {/* Full name */}
                        <div className="fade-up fade-up-2" style={{ marginBottom: "1rem" }}>
                            <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
                                Full name
                            </label>
                            <input
                                className="cv-input"
                                type="text"
                                name="name"
                                placeholder="Jane Smith"
                                value={form.name}
                                onChange={handleChange}
                                autoComplete="name"
                            />
                        </div>

                        {/* Email */}
                        <div className="fade-up fade-up-3" style={{ marginBottom: "1rem" }}>
                            <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
                                Email
                            </label>
                            <input
                                className="cv-input"
                                type="email"
                                name="email"
                                placeholder="you@company.com"
                                value={form.email}
                                onChange={handleChange}
                                autoComplete="email"
                            />
                        </div>

                        {/* Password */}
                        <div className="fade-up fade-up-4" style={{ marginBottom: "1rem" }}>
                            <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
                                Password
                            </label>
                            <input
                                className="cv-input"
                                type="password"
                                name="password"
                                placeholder="Min. 6 characters"
                                value={form.password}
                                onChange={handleChange}
                                autoComplete="new-password"
                            />
                            {/* Password strength bar */}
                            {strength && (
                                <div>
                                    <div className="strength-bar-track">
                                        <div
                                            className="strength-bar-fill"
                                            style={{ width: strength.width, background: strength.color }}
                                        />
                                    </div>
                                    <p style={{ fontSize: "0.68rem", color: strength.color, marginTop: "0.3rem" }}>
                                        {strength.label}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Confirm password */}
                        <div className="fade-up fade-up-4" style={{ marginBottom: "1.5rem" }}>
                            <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
                                Confirm password
                            </label>
                            <input
                                className="cv-input"
                                type="password"
                                name="confirm"
                                placeholder="••••••••"
                                value={form.confirm}
                                onChange={handleChange}
                                autoComplete="new-password"
                                style={{
                                    borderColor:
                                        form.confirm && form.password !== form.confirm
                                            ? "rgba(224,92,92,0.6)"
                                            : form.confirm && form.password === form.confirm
                                                ? "rgba(92,170,111,0.6)"
                                                : undefined,
                                }}
                            />
                            {form.confirm && form.password !== form.confirm && (
                                <p style={{ fontSize: "0.68rem", color: "#e05c5c", marginTop: "0.3rem" }}>
                                    Passwords do not match
                                </p>
                            )}
                            {form.confirm && form.password === form.confirm && (
                                <p style={{ fontSize: "0.68rem", color: "#5caa6f", marginTop: "0.3rem" }}>
                                    ✓ Passwords match
                                </p>
                            )}
                        </div>

                        {error && (
                            <p
                                style={{
                                    fontSize: "0.78rem",
                                    color: "#e05c5c",
                                    marginBottom: "1rem",
                                    padding: "0.6rem 0.875rem",
                                    background: "rgba(224,92,92,0.08)",
                                    border: "1px solid rgba(224,92,92,0.2)",
                                    borderRadius: "6px",
                                }}
                            >
                                {error}
                            </p>
                        )}

                        <div className="fade-up fade-up-5">
                            <button className="cv-btn-primary" type="submit" disabled={loading}>
                                {loading ? "Creating account..." : "Create account →"}
                            </button>
                        </div>
                    </form>

                    {/* Terms */}
                    <p className="terms-text">
                        By creating an account you agree to our{" "}
                        <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                    </p>

                    {/* Divider */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "1.25rem 0" }}>
                        <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>or</span>
                        <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
                    </div>

                    {/* Google */}
                    <button className="google-btn" onClick={() => { }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>

                    {/* Login link */}
                    <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                        Already have an account?{" "}
                        <Link to="/login" className="login-link">Sign in</Link>
                    </p>
                </div>
            </div>
        </>
    );
}