import SearchableSelect from "./SearchableSelect";

/**
 * Componente unificado de Dropdown para filtros por Llave Foránea, Estado o Categoría.
 * Implementa búsqueda, autocompletado y estilos modernos de forma consistente.
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
  // Garantizar opción de "Todos" / limpiar
  const allOption = { value: "all", label: placeholder };
  const unifiedOptions = [allOption, ...options.filter((o) => o.value !== "all")];

  return (
    <div className={`relative flex items-center min-w-[170px] ${className}`}>
      <SearchableSelect
        value={value ?? "all"}
        onChange={(val) => onChange(val === "" ? "all" : val)}
        options={unifiedOptions}
        placeholder={placeholder}
        searchPlaceholder={`Buscar en ${label || "filtro"}...`}
        icon={icon}
        label={label}
        size="md"
        allowClear={value !== "all" && value !== "" && value !== null}
        className="w-full"
      />
    </div>
  );
}
