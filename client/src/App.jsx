import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Login from "./pages/Login";

const Dashboard = () => <div style={{ color: "var(--text-primary)", padding: "2rem" }}>Dashboard — coming soon</div>;
const Register = () => <div style={{ color: "var(--text-primary)", padding: "2rem" }}>Register — coming soon</div>;

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;