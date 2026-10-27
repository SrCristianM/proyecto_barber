import { Search, X } from "lucide-react";

/**
 * Componente unificado de Barra de Búsqueda para todos los módulos.
 * Mantiene la misma altura, padding, iconos, border radius, borde y comportamiento focus.
 */
export default function SearchBar({
  value,
  onChange,
  placeholder = "Buscar...",
  className = "",
  maxWidthClass = "max-w-xs sm:max-w-sm",
  autoFocus = false
}) {
  return (
    <div className={`relative flex-1 ${maxWidthClass} ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full h-10 pl-9 pr-8 py-2 bg-card border border-border/40 hover:border-[#DFB755]/50 focus:border-[#DFB755] rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#DFB755]/30 transition-all shadow-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground rounded-md transition-colors"
          title="Limpiar búsqueda"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
