import { useEffect, useState } from "react";
import BarberScissorsIcon from "../../../shared/ui/BarberScissorsIcon";

export default function ClientSnipEffect() {
  const [snips, setSnips] = useState([]);

  useEffect(() => {
    const handleClick = (e) => {
      // Activar en botones, links o elementos clickeables
      const target = e.target.closest("button, a, .btn-snip, [role='button']");
      if (!target) return;

      const id = Date.now() + Math.random();
      const x = e.clientX;
      const y = e.clientY;

      setSnips((prev) => [...prev.slice(-4), { id, x, y }]);

      setTimeout(() => {
        setSnips((prev) => prev.filter((s) => s.id !== id));
      }, 700);
    };

    window.addEventListener("click", handleClick, { passive: true });
    return () => window.removeEventListener("click", handleClick);
  }, []);

  if (snips.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {snips.map((snip) => (
        <div
          key={snip.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-snip-fade"
          style={{ left: snip.x, top: snip.y }}
        >
          {/* Tijera animada dorada */}
          <div className="relative flex items-center justify-center">
            <div className="w-8 h-8 text-[#DFB755] animate-snip-cut drop-shadow-[0_0_8px_rgba(223,183,85,0.7)]">
              <BarberScissorsIcon className="w-full h-full" strokeWidth={2.2} />
            </div>

            {/* Partículas doradas de destello */}
            <div className="absolute w-2 h-2 rounded-full bg-[#FFE082] animate-snip-p1" />
            <div className="absolute w-1.5 h-1.5 rounded-full bg-[#DFB755] animate-snip-p2" />
            <div className="absolute w-2 h-2 rounded-full bg-[#E8C466] animate-snip-p3" />
            <div className="absolute w-1.5 h-1.5 rounded-full bg-white animate-snip-p4" />
          </div>
        </div>
      ))}
    </div>
  );
}
