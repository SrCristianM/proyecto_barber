import { useEffect, useState } from "react";
import { useSpring, useTransform } from "motion/react";

/**
 * AnimatedCounter
 * Incrementa suavemente números de 0 al valor final con física elástica de Framer Motion.
 */
export default function AnimatedCounter({
  value = 0,
  prefix = "",
  suffix = "",
  className = ""
}) {
  const numericValue = typeof value === "number" ? value : parseFloat(value) || 0;
  const spring = useSpring(0, { mass: 0.8, stiffness: 60, damping: 15 });
  const rounded = useTransform(spring, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    spring.set(numericValue);
  }, [numericValue, spring]);

  useEffect(() => {
    return rounded.on("change", (latest) => {
      setDisplayValue(latest);
    });
  }, [rounded]);

  return (
    <span className={className}>
      {prefix}
      {displayValue.toLocaleString("es-CO")}
      {suffix}
    </span>
  );
}
