import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function ProtectedRoute({ children }) {
    const navigate = useNavigate();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                navigate("/login");
            } else {
                setChecking(false);
            }
        });
        return () => unsubscribe();
    }, []);

    if (checking) {
        return (
            <div style={{
                minHeight: "100vh",
                background: "var(--bg-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'DM Mono', monospace",
                fontSize: "0.78rem",
                color: "var(--text-muted)",
                letterSpacing: "0.08em",
            }}>
                Loading...
            </div>
        );
    }

    return children;
}