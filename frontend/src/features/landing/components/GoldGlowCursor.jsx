import { useEffect, useState } from "react";
import { motion, useSpring } from "motion/react";

export default function GoldGlowCursor() {
  const [enabled, setEnabled] = useState(false);

  const springConfig = { damping: 28, stiffness: 220, mass: 0.5 };
  const cursorX = useSpring(-100, springConfig);
  const cursorY = useSpring(-100, springConfig);

  useEffect(() => {
    // Only enable on devices with a mouse/pointer (not purely touch)
    if (window.matchMedia("(pointer: fine)").matches) {
      setEnabled(true);
    }

    const handleMouseMove = (e) => {
      cursorX.set(e.clientX - 150);
      cursorY.set(e.clientY - 150);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [cursorX, cursorY]);

  if (!enabled) return null;

  return (
    <motion.div
      style={{
        x: cursorX,
        y: cursorY,
      }}
      className="fixed top-0 left-0 w-[300px] h-[300px] rounded-full pointer-events-none z-30 opacity-40 mix-blend-screen transition-opacity duration-300"
    >
      <div className="w-full h-full rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.22)_0%,rgba(201,162,74,0.06)_45%,transparent_70%)] filter blur-xl" />
    </motion.div>
  );
}
