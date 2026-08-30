import { useEffect } from "react";
import { useSearchParams } from "react-router";

export function useSearchHighlight() {
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("highlight");

  useEffect(() => {
    if (!highlightId) return;

    // Pequeño retardo para asegurar que los componentes de la vista estén montados
    const timer = setTimeout(() => {
      const el =
        document.getElementById(`row-${highlightId}`) ||
        document.getElementById(`card-${highlightId}`) ||
        document.querySelector(`[data-highlight-id="${highlightId}"]`);

      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("search-highlight-pulse");

        const removeTimer = setTimeout(() => {
          el.classList.remove("search-highlight-pulse");
        }, 3600);

        return () => clearTimeout(removeTimer);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [highlightId]);

  return { highlightId };
}
