import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Search,
  X,
  Users,
  Building2,
  UserCheck,
  Scissors,
  Package,
  Calendar,
  DollarSign,
  ShoppingCart,
  LayoutDashboard,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useGlobalSearch } from "../hooks/useGlobalSearch";

const CATEGORY_CONFIG = {
  Clientes: {
    icon: Users,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/20"
  },
  Proveedores: {
    icon: Building2,
    color: "text-blue-500",
    bg: "bg-blue-500/10 border-blue-500/20"
  },
  Barberos: {
    icon: UserCheck,
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/20"
  },
  Servicios: {
    icon: Scissors,
    color: "text-purple-500",
    bg: "bg-purple-500/10 border-purple-500/20"
  },
  Productos: {
    icon: Package,
    color: "text-orange-500",
    bg: "bg-orange-500/10 border-orange-500/20"
  },
  Citas: {
    icon: Calendar,
    color: "text-primary",
    bg: "bg-primary/10 border-primary/20"
  },
  Ventas: {
    icon: DollarSign,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/20"
  },
  Compras: {
    icon: ShoppingCart,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10 border-indigo-500/20"
  },
  Páginas: {
    icon: LayoutDashboard,
    color: "text-muted-foreground",
    bg: "bg-secondary border-border"
  }
};

export default function GlobalSearchBar() {
  const navigate = useNavigate();
  const { searchTerm, setSearchTerm, searchResults } = useGlobalSearch();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Atajo de teclado global Ctrl + K / Cmd + K
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectResult = (route) => {
    if (route) {
      navigate(route);
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    } else if (e.key === "Enter" && searchResults.length > 0) {
      handleSelectResult(searchResults[0].route);
    }
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-lg">
      {/* Input de Búsqueda Global */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors" />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar clientes, proveedores, barberos, citas, productos..."
          className="w-full pl-10 pr-20 py-2 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-xs sm:text-sm transition-all placeholder:text-muted-foreground shadow-2xs"
        />

        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {searchTerm ? (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              className="p-1 text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
              title="Borrar búsqueda"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-muted-foreground bg-secondary/80 border border-border/80 rounded-md shadow-2xs">
              <span className="text-xs">⌘</span>K
            </kbd>
          )}
        </div>
      </div>

      {/* Menú Flotante de Resultados */}
      <AnimatePresence>
        {isOpen && searchTerm.trim().length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 top-full mt-2 w-full bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-3 border-b border-border/80 bg-secondary/30 flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Resultados Globales ({searchResults.length})
              </span>
              <span className="text-[10px] text-muted-foreground">
                Presiona ↵ Enter para ir
              </span>
            </div>

            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {searchResults.length === 0 ? (
                <div className="py-8 px-4 text-center">
                  <p className="text-xs font-semibold text-foreground">
                    No se encontraron coincidencias para &ldquo;{searchTerm}&rdquo;
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Prueba buscando por nombre de cliente, NIT de proveedor, servicio o producto.
                  </p>
                </div>
              ) : (
                searchResults.map((item) => {
                  const cfg = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.Páginas;
                  const Icon = cfg.icon;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectResult(item.route)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${cfg.bg}`}
                        >
                          <Icon className={`h-4 w-4 ${cfg.color}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                              {item.title}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border shrink-0 ${cfg.bg} ${cfg.color}`}
                            >
                              {item.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>

                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all shrink-0 ml-2" />
                    </button>
                  );
                })
              )}
            </div>

            <div className="p-2.5 bg-muted/20 border-t border-border text-center text-[10px] text-muted-foreground">
              Búsqueda en tiempo real conectada a todos los módulos
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
