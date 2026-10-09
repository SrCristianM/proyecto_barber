import { Table, LayoutGrid } from "lucide-react";

/**
 * Componente universal para alternar entre vista de Tabla y Tarjetas.
 *
 * @param {string} viewMode - "table" | "cards" | "grid"
 * @param {Function} onChange - (newMode: "table" | "cards") => void
 */
export default function ViewModeToggle({ viewMode = "table", onChange }) {
  const isTable = viewMode === "table";
  const isCards = viewMode === "cards" || viewMode === "grid";

  return (
    <div className="flex items-center bg-muted/40 p-1 rounded-xl border border-border">
      <button
        type="button"
        onClick={() => onChange("table")}
        className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
          isTable
            ? "bg-card text-foreground shadow-xs border border-border font-bold"
            : "text-muted-foreground hover:text-foreground"
        }`}
        title="Vista de Tabla"
      >
        <Table className="h-4 w-4" />
        <span className="hidden sm:inline">Tabla</span>
      </button>
      <button
        type="button"
        onClick={() => onChange("cards")}
        className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
          isCards
            ? "bg-card text-foreground shadow-xs border border-border font-bold"
            : "text-muted-foreground hover:text-foreground"
        }`}
        title="Vista de Tarjetas"
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="hidden sm:inline">Tarjetas</span>
      </button>
    </div>
  );
}
