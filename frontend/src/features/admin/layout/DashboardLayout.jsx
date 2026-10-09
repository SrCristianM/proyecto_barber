import { Outlet, useLocation } from "react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

const DashboardLayout = ({ isDark, setIsDark }) => {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 1024 : false
  );
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true
  );
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Cerrar sidebar automáticamente al navegar en pantallas móviles
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Backdrop overlay para pantallas móviles */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden cursor-pointer"
            aria-label="Cerrar menú"
          />
        )}
      </AnimatePresence>

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
      />

      <div
        className={`transition-all duration-300 min-w-0 ${
          isMobile ? "ml-0" : sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        <TopBar
          isDark={isDark}
          setIsDark={setIsDark}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isMobile={isMobile}
        />

        <main className="p-3 sm:p-5 lg:p-6 min-w-0">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="w-full min-w-0"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;