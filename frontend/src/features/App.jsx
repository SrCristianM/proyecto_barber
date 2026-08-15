import { BrowserRouter } from "react-router";
import { useState } from "react";
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
    </div>
  );
}
