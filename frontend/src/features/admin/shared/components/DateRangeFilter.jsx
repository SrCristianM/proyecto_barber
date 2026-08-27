import { Calendar, X } from "lucide-react";

/**
 * Componente unificado de filtro por rango de fechas (Desde / Hasta) para toolbar.
 */
export default function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClear,
  className = ""
}) {
  const hasValue = Boolean(startDate || endDate);

  return (
    <div className={`flex items-center gap-1.5 bg-input-background border border-input rounded-lg px-2.5 h-10 text-xs ${className}`}>
      <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="text-muted-foreground">Desde:</span>
      <input
        type="date"
        value={startDate || ""}
        onChange={(e) => onStartDateChange(e.target.value)}
        className="bg-transparent text-foreground focus:outline-none text-xs"
      />
      <span className="text-muted-foreground ml-1">Hasta:</span>
      <input
        type="date"
        value={endDate || ""}
        onChange={(e) => onEndDateChange(e.target.value)}
        className="bg-transparent text-foreground focus:outline-none text-xs"
      />
      {hasValue && (
        <button
          type="button"
          onClick={onClear}
          className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors ml-0.5"
          title="Limpiar fechas"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
