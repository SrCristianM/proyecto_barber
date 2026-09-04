import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X, Check, Plus } from "lucide-react";

/**
 * Componente MultiSelectSearchable con búsqueda en tiempo real y chips interactivos.
 * Usado para:
 * - Especialidades de barberos.
 * - Servicios + Paquetes en agendamiento de citas.
 */
export default function MultiSelectSearchable({
  value,
  selectedValues,
  onChange,
  options = [],
  placeholder = "Seleccionar opciones...",
  searchPlaceholder = "Escribe para buscar...",
  disabled = false,
  label = null,
  error = null,
  className = "",
  badgeVariant = "default", // 'default' | 'gold' | 'primary'
  id,
  groupByCategory = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Normalizar valor entrante aceptando tanto 'value' como 'selectedValues'
  const rawSelected = value !== undefined ? value : selectedValues;
  const currentSelected = Array.isArray(rawSelected) ? rawSelected : [];

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

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Filtrar opciones
  const filteredOptions = options.filter((opt) => {
    if (!searchTerm.trim()) return true;
    const labelStr = (opt.label || "").toString().toLowerCase();
    const groupStr = (opt.group || opt.category || "").toString().toLowerCase();
    const subStr = (opt.subtitle || "").toString().toLowerCase();
    const query = searchTerm.toLowerCase().trim();
    return labelStr.includes(query) || groupStr.includes(query) || subStr.includes(query);
  });

  // Agrupar si existen categorías o grupos
  const hasGroups = groupByCategory || options.some((o) => !!(o.group || o.category));
  const groupedOptions = hasGroups
    ? filteredOptions.reduce((acc, opt) => {
        const g = opt.group || opt.category || "Otros";
        if (!acc[g]) acc[g] = [];
        acc[g].push(opt);
        return acc;
      }, {})
    : null;

  const handleToggle = (val) => {
    if (disabled) return;
    const isAlready = currentSelected.some((v) => String(v) === String(val));
    let next;
    if (isAlready) {
      next = currentSelected.filter((v) => String(v) !== String(val));
    } else {
      next = [...currentSelected, val];
    }
    onChange?.(next);
  };

  const handleRemoveOne = (e, val) => {
    e.stopPropagation();
    if (disabled) return;
    const next = currentSelected.filter((v) => String(v) !== String(val));
    onChange?.(next);
  };

  const handleClearAll = (e) => {
    e.stopPropagation();
    if (disabled) return;
    onChange?.([]);
    setSearchTerm("");
  };

  const getOptionLabel = (val) => {
    const found = options.find((o) => String(o.value) === String(val));
    return found ? found.label : String(val);
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef} id={id ? `container-${id}` : undefined}>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs sm:text-sm font-medium text-foreground">
            {label}
          </label>
          {currentSelected.length > 0 && !disabled && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[11px] text-muted-foreground hover:text-destructive transition-colors font-medium"
            >
              Limpiar todos ({currentSelected.length})
            </button>
          )}
        </div>
      )}

      {/* Trigger / Caja que contiene los chips y el botón */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => {
          if (!disabled) setIsOpen((prev) => !prev);
        }}
        className={`w-full min-h-[44px] p-2 rounded-xl border transition-all select-none cursor-pointer flex flex-wrap items-center gap-1.5 ${
          disabled
            ? "bg-muted/40 border-border text-muted-foreground cursor-not-allowed opacity-60"
            : error
            ? "bg-input-background border-destructive ring-1 ring-destructive/30"
            : isOpen
            ? "bg-input-background border-primary ring-2 ring-primary/20"
            : "bg-input-background border-input hover:border-primary/50 hover:bg-accent/10"
        }`}
      >
        {currentSelected.length === 0 ? (
          <span className="text-xs sm:text-sm text-muted-foreground px-1.5 py-0.5">
            {placeholder}
          </span>
        ) : (
          currentSelected.map((val) => (
            <span
              key={val}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary/15 text-primary border border-primary/30 animate-in fade-in-50 duration-100"
            >
              <span className="truncate max-w-[180px]">{getOptionLabel(val)}</span>
              {!disabled && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => handleRemoveOne(e, val)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleRemoveOne(e, val);
                    }
                  }}
                  className="hover:bg-primary/20 rounded-full p-0.5 transition-colors cursor-pointer"
                  title="Eliminar opción"
                >
                  <X className="h-3 w-3" />
                </span>
              )}
            </span>
          ))
        )}

        <div className="ml-auto flex items-center gap-1 pl-2">
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
          {/* Barra de búsqueda interactiva */}
          <div className="p-2.5 border-b border-border/60 bg-muted/20">
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

          {/* Opciones con o sin agrupación */}
          <div className="max-h-60 overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <div className="p-3.5 text-center text-xs text-muted-foreground">
                No se encontraron opciones coincidentes.
              </div>
            ) : hasGroups && groupedOptions ? (
              Object.entries(groupedOptions).map(([groupName, groupOpts]) => (
                <div key={groupName} className="mb-1 last:mb-0">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-muted/40 border-y border-border/30">
                    {groupName}
                  </div>
                  {groupOpts.map((opt) => {
                    const isSelected = currentSelected.some((v) => String(v) === String(opt.value));
                    return (
                      <div
                        key={opt.value}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleToggle(opt.value);
                        }}
                        className={`px-3.5 py-2.5 text-xs flex items-center justify-between cursor-pointer transition-colors select-none ${
                          isSelected
                            ? "bg-primary/15 text-primary font-bold"
                            : "text-foreground hover:bg-accent/60"
                        }`}
                      >
                        <div className="flex flex-col flex-1 mr-2 pointer-events-none">
                          <span className="truncate">{opt.label}</span>
                          {opt.subtitle && (
                            <span className="text-[10px] text-muted-foreground truncate">{opt.subtitle}</span>
                          )}
                        </div>
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border transition-all pointer-events-none ${
                            isSelected
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-input bg-card"
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = currentSelected.some((v) => String(v) === String(opt.value));
                return (
                  <div
                    key={opt.value}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleToggle(opt.value);
                    }}
                    className={`px-3.5 py-2.5 text-xs flex items-center justify-between cursor-pointer transition-colors select-none ${
                      isSelected
                        ? "bg-primary/15 text-primary font-bold"
                        : "text-foreground hover:bg-accent/60"
                    }`}
                  >
                    <div className="flex flex-col flex-1 mr-2 pointer-events-none">
                      <span className="truncate">{opt.label}</span>
                      {opt.subtitle && (
                        <span className="text-[10px] text-muted-foreground truncate">{opt.subtitle}</span>
                      )}
                    </div>
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border transition-all pointer-events-none ${
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-input bg-card"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
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
