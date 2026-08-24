import { BrowserRouter } from "react-router";
import { useState } from "react";
import { Toaster } from "sonner";
import AppRoutes from "./AppRoutes.jsx";

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <div className={isDark ? "dark" : ""}>
      <BrowserRouter>
        <AppRoutes
          isDark={isDark}
          setIsDark={setIsDark}
          isAuthenticated={isAuthenticated}
          onLogin={() => setIsAuthenticated(true)}
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
