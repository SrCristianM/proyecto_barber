import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, IdCard } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import FormFieldError from "../../admin/shared/components/FormFieldError";

export default function FormSelect({
  id,
  name,
  label,
  value,
  onChange,
  options = [],
  error,
  required = false,
  icon = <IdCard className="w-4 h-4 text-[#8E8E93]" />,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Cerrar al hacer clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Manejo de teclado (Escape cierra, Enter / Espacio abre/cierra)
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    }
  };

  const handleSelect = (optionValue) => {
    onChange?.({
      target: {
        name: name ?? id,
        value: optionValue,
      },
    });
    setIsOpen(false);
  };

  // Normalizar opciones
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === "object" && opt !== null) {
      return {
        value: opt.value,
        label: opt.label !== undefined ? opt.label : String(opt.value),
      };
    }
    return { value: opt, label: String(opt) };
  });

  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value) === String(value)
  ) || normalizedOptions[0];

  return (
    <div className="space-y-1.5 relative" ref={containerRef}>
      <label
        htmlFor={id}
        className="block text-xs font-semibold text-[#CCCCCC] uppercase tracking-wider"
      >
        {label} {required && <span className="text-red-400">*</span>}
      </label>

      {/* Botón activador con diseño idéntico al resto de inputs */}
      <div
        role="button"
        id={id}
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={`w-full py-3 bg-[#181818] border rounded-xl text-white text-xs sm:text-sm transition-all duration-200 cursor-pointer select-none flex items-center justify-between ${
          icon ? "pl-10 pr-3.5" : "px-4 pr-3.5"
        } ${
          error
            ? "border-red-500/80 focus:border-red-500 ring-2 ring-red-500/30"
            : isOpen
            ? "border-[#C9A24A] ring-2 ring-[#C9A24A]/30 shadow-lg shadow-black/40"
            : "border-white/10 hover:border-white/20 focus:border-[#C9A24A] focus:ring-2 focus:ring-[#C9A24A]/30"
        }`}
      >
        {icon && (
          <div className="absolute left-3.5 pointer-events-none transition-colors">
            {icon}
          </div>
        )}

        <span className="truncate text-white font-medium">
          {selectedOption ? selectedOption.label : "Seleccionar..."}
        </span>

        <ChevronDown
          className={`w-4 h-4 text-[#8E8E93] shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#C9A24A]" : ""
          }`}
        />
      </div>

      {/* Input oculto para compatibilidad */}
      <input type="hidden" name={name ?? id} value={value ?? ""} />

      {/* Recuadro de opciones personalizado estilo Tu Turno Barber */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute z-50 left-0 right-0 top-full mt-2 bg-[#141414] border border-[#C9A24A]/40 rounded-2xl shadow-2xl shadow-black/90 p-1.5 backdrop-blur-xl space-y-1 max-h-64 overflow-y-auto"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#C9A24A #181818",
            }}
            role="listbox"
          >
            {normalizedOptions.map((opt) => {
              const isSelected = String(opt.value) === String(value);

              return (
                <div
                  key={String(opt.value)}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt.value)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-xs sm:text-sm transition-all duration-150 select-none group ${
                    isSelected
                      ? "bg-gradient-to-r from-[#C9A24A]/25 via-[#C9A24A]/15 to-transparent text-[#DFB755] font-semibold border border-[#C9A24A]/40 shadow-xs"
                      : "text-[#D6D6D6] hover:bg-white/[0.07] hover:text-white border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                    {/* Badge con código del documento */}
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider shrink-0 transition-colors ${
                        isSelected
                          ? "bg-[#C9A24A]/25 text-[#DFB755] border border-[#C9A24A]/50"
                          : "bg-white/5 text-[#9E9E9E] border border-white/10 group-hover:text-white group-hover:border-white/20"
                      }`}
                    >
                      {opt.value}
                    </span>

                    {/* Texto descriptivo completo */}
                    <span className="truncate">
                      {opt.label}
                    </span>
                  </div>

                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.12 }}
                    >
                      <Check className="w-4 h-4 text-[#C9A24A] shrink-0" />
                    </motion.div>
                  )}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <FormFieldError error={error} />
    </div>
  );
}
