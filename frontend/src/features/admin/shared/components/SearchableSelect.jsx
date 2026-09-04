import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X, Check } from "lucide-react";

/**
 * Componente SearchableSelect accesible y moderno para filtros y formularios.
 * Permite:
 * - Clic para desplegar lista completa.
 * - Escribir texto para buscar y filtrar en tiempo real.
 * - Botón de limpiar selección cuando aplique.
 * - Estados: normal, hover, focus, disabled, seleccionado.
 * - Responsive y coherente con el diseño del ERP.
 */
export default function SearchableSelect({
  value,
  onChange,
  options = [],
  placeholder = "Seleccionar opción...",
  searchPlaceholder = "Escribe para buscar...",
  disabled = false,
  allowClear = true,
  className = "",
  size = "md", // 'sm' | 'md' | 'lg'
  icon = null,
  label = null,
  error = null,
  id
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Enfocar input de búsqueda al abrir
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Encontrar la opción seleccionada
  const selectedOption = options.find((opt) => {
    if (value === null || value === undefined || value === "") return false;
    return String(opt.value) === String(value);
  });

  // Filtrar opciones
  const filteredOptions = options.filter((opt) => {
    if (!searchTerm.trim()) return true;
    const labelStr = (opt.label || "").toString().toLowerCase();
    const subStr = (opt.subtitle || "").toString().toLowerCase();
    const query = searchTerm.toLowerCase().trim();
    return labelStr.includes(query) || subStr.includes(query);
  });

  const handleSelect = (val) => {
    onChange?.(val);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.("");
    setSearchTerm("");
  };

  const toggleOpen = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
    if (!isOpen) setSearchTerm("");
  };

  const sizeClasses = {
    sm: "h-9 text-xs px-2.5",
    md: "h-10 text-xs sm:text-sm px-3",
    lg: "h-11 text-sm px-3.5"
  }[size] || "h-10 text-xs sm:text-sm px-3";

  return (
    <div className={`relative w-full ${className}`} ref={containerRef} id={id ? `container-${id}` : undefined}>
      {label && (
        <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger principal */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={toggleOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleOpen();
          }
        }}
        className={`w-full flex items-center justify-between rounded-xl border transition-all select-none cursor-pointer ${sizeClasses} ${
          disabled
            ? "bg-muted/40 border-border text-muted-foreground cursor-not-allowed opacity-60"
            : error
            ? "bg-input-background border-destructive text-foreground focus:ring-2 focus:ring-destructive/30"
            : isOpen
            ? "bg-input-background border-primary ring-2 ring-primary/20 text-foreground"
            : "bg-input-background border-input text-foreground hover:border-primary/50 hover:bg-accent/20"
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden flex-1 mr-1">
          {icon && <span className="text-muted-foreground shrink-0">{icon}</span>}
          <span className={`truncate ${!selectedOption ? "text-muted-foreground font-normal" : "font-medium text-foreground"}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {allowClear && selectedOption && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-secondary rounded-full text-muted-foreground hover:text-foreground transition-colors"
              title="Limpiar selección"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
              isOpen ? "rotate-180 text-primary" : ""
            }`}
          />
        </div>
      </div>

      {/* Dropdown flotante */}
      {isOpen && !disabled && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-card dark:bg-[#13161B] border border-border/80 rounded-xl shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Input de búsqueda interactiva */}
          <div className="p-2 border-b border-border/60 bg-muted/20">
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-7 py-1.5 bg-input-background border border-border/70 rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                onClick={(e) => e.stopPropagation()}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 text-muted-foreground hover:text-foreground p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Lista de opciones */}
          <div className="max-h-56 overflow-y-auto py-1 divide-y divide-border/20">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-muted-foreground">
                No se encontraron opciones coincidentes.
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <div
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className={`px-3 py-2 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-primary/15 text-primary font-bold"
                        : "text-foreground hover:bg-accent/50 hover:text-foreground"
                    }`}
                  >
                    <div className="flex flex-col flex-1 mr-2">
                      <span className="truncate">{opt.label}</span>
                      {opt.subtitle && (
                        <span className="text-[10px] text-muted-foreground truncate">{opt.subtitle}</span>
                      )}
                    </div>
                    {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
