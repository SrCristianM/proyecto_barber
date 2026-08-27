/**
 * Componente unificado de Pestañas / Pills de Estado.
 * Separado de la barra de búsqueda, inspirado en la vista de Categorías.
 */
export default function StatusFilterPills({
  value,
  onChange,
  options = [
    { key: "all", label: "Todos" },
    { key: "active", label: "Activos" },
    { key: "inactive", label: "Inactivos" }
  ],
  className = ""
}) {
  return (
    <div className={`flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border ${className}`}>
      {options.map((opt) => {
        const isSelected = String(value) === String(opt.key);
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onChange(opt.key)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              isSelected
                ? "bg-card text-foreground font-semibold shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
