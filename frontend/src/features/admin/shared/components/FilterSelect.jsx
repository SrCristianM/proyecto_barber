import { ChevronDown } from "lucide-react";

/**
 * Componente unificado de Dropdown para filtros por Llave Foránea o Categoría.
 */
export default function FilterSelect({
  value,
  onChange,
  options = [],
  placeholder = "Todos",
  label = null,
  icon = null,
  className = ""
}) {
  return (
    <div className={`relative flex items-center bg-input-background border border-input rounded-lg px-2.5 h-10 ${className}`}>
      {icon && <span className="mr-1.5 text-muted-foreground">{icon}</span>}
      {label && <span className="text-xs text-muted-foreground mr-1.5 whitespace-nowrap">{label}:</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-xs font-medium text-foreground focus:outline-none cursor-pointer pr-4 appearance-none w-full"
      >
        <option value="all">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
    </div>
  );
}
