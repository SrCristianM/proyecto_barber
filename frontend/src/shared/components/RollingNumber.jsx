import { useEffect, useState, useRef } from "react";

/**
 * Componente contador rodante suave para cifras numéricas (unidades, dinero, etc.)
 */
export default function RollingNumber({
  value = 0,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 650,
  className = ""
}) {
  const numericTarget = typeof value === "number" ? value : Number(String(value).replace(/[^0-9.-]/g, "")) || 0;
  const [displayValue, setDisplayValue] = useState(numericTarget);
  const prevValueRef = useRef(numericTarget);

  useEffect(() => {
    const startVal = prevValueRef.current;
    const endVal = numericTarget;
    prevValueRef.current = endVal;

    if (startVal === endVal) {
      setDisplayValue(endVal);
      return;
    }

    const startTime = performance.now();
    let animationFrameId;

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing cúbico suave hacia afuera (easeOutCubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (endVal - startVal) * easeOut;

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCounter);
      } else {
        setDisplayValue(endVal);
      }
    };

    animationFrameId = requestAnimationFrame(updateCounter);
    return () => cancelAnimationFrame(animationFrameId);
  }, [numericTarget, duration]);

  const formatted = decimals > 0
    ? displayValue.toLocaleString("es-CO", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : Math.round(displayValue).toLocaleString("es-CO");

  return (
    <span className={`inline-flex items-baseline font-mono tracking-tight ${className}`}>
      {prefix && <span className="mr-0.5 select-none">{prefix}</span>}
      <span>{formatted}</span>
      {suffix && <span className="ml-1 text-[0.8em] font-sans opacity-80">{suffix}</span>}
    </span>
  );
}
