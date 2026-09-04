import { BrowserRouter } from "react-router";
import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import AppRoutes from "./AppRoutes.jsx";

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    try {
      const raw = localStorage.getItem("barber_settings");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed?.system?.modo_oscuro === "boolean") {
          return parsed.system.modo_oscuro;
        }
      }
      const stored = localStorage.getItem("barber_theme_mode");
      if (stored !== null) {
        return stored === "dark";
      }
    } catch {
      // Ignorar error de parsing
    }
    return false;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return !!localStorage.getItem("barber_current_user");
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("barber_theme_mode", isDark ? "dark" : "light");
      const raw = localStorage.getItem("barber_settings");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.system) {
          parsed.system.modo_oscuro = isDark;
          localStorage.setItem("barber_settings", JSON.stringify(parsed));
        }
      }
    } catch {
      // Ignorar error de storage
    }
  }, [isDark]);

  return (
    <div className={isDark ? "dark" : ""}>
      <BrowserRouter>
        <AppRoutes
          isDark={isDark}
          setIsDark={setIsDark}
          isAuthenticated={isAuthenticated}
          onLogin={() => setIsAuthenticated(true)}
          onLogout={() => setIsAuthenticated(false)}
        />
      </BrowserRouter>
      <Toaster
        position="top-right"
        richColors
        toastOptions={{
          style: {
            background: "var(--popover)",
            color: "var(--popover-foreground)",
            border: "1px solid var(--border)"
          }
        }}
      />
    </div>
  );
}
