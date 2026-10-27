import { useEffect, useState } from "react";
import { useLocation } from "react-router";

export default function ClientRouteProgressBar() {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Iniciar barra al cambiar de ruta
    setVisible(true);
    setProgress(35);

    const timer1 = setTimeout(() => setProgress(78), 100);
    const timer2 = setTimeout(() => setProgress(100), 280);
    const timer3 = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 450);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [location.pathname]);

  if (!visible && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none h-[3.5px] bg-transparent overflow-hidden">
      <div
        className="h-full transition-all duration-300 ease-out relative shadow-[0_0_12px_rgba(223,183,85,0.9)]"
        style={{
          width: `${progress}%`,
          opacity: visible ? 1 : 0,
          background: `repeating-linear-gradient(
            -45deg,
            #DFB755 0px,
            #DFB755 12px,
            #EF4444 12px,
            #EF4444 24px,
            #FFFFFF 24px,
            #FFFFFF 36px,
            #3B82F6 36px,
            #3B82F6 48px
          )`,
          backgroundSize: "200% 100%",
          animation: "barberPoleScroll 1s linear infinite"
        }}
      >
        <style>{`
          @keyframes barberPoleScroll {
            0% { background-position: 0 0; }
            100% { background-position: 48px 0; }
          }
        `}</style>
        {/* Glow dorado en la punta del progreso */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-[#DFB755] blur-[2px]" />
      </div>
    </div>
  );
}

