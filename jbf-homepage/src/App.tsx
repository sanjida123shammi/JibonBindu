import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AboutPage from "./pages/AboutPage"; // <-- 1. Import
import AdvicePage from "./pages/AdvicePage";
import LandingPage from "./pages/LandingPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";

const ANGULAR_APP_URL =
  import.meta.env.VITE_ANGULAR_APP_URL ?? "http://localhost:4200";

function RedirectToAngular({ path }: { path: string }) {
  useEffect(() => {
    window.location.href = `${ANGULAR_APP_URL}${path}`;
  }, [path]);

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 text-white">
      <p>Redirecting to Jibonbindu Portal…</p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} /> {/* <-- 2. Register route */}
      <Route path="/advice" element={<AdvicePage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />

      {/* Redirect old routes to the Angular client */}
      <Route path="/login" element={<RedirectToAngular path="/login" />} />
      <Route path="/register" element={<RedirectToAngular path="/register" />} />
      <Route path="/dashboard" element={<RedirectToAngular path="/dashboard" />} />

      {/* Catch-all fallback to landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}