import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Layers, User, Package, PlusCircle } from "lucide-react";

export default function AssignStationItemModal({
  isOpen,
  onClose,
  warehouseItems = [],
  barbers = [],
  initialBarberId = null,
  onSave,
  isSubmitting = false
}) {
  if (!isOpen) return null;

  const defaultBarber = initialBarberId || (barbers.length > 0 ? barbers[0].id_barbero : 1);
  const defaultInsumo = warehouseItems.length > 0 ? warehouseItems[0].id_insumo : "";

  const [barberoId, setBarberoId] = useState(defaultBarber);
  const [insumoId, setInsumoId] = useState(defaultInsumo);
  const [cantidad, setCantidad] = useState(1);
  const [notas, setNotas] = useState("");

  // Sincronizar automáticamente con initialBarberId cuando cambie
  useEffect(() => {
    if (initialBarberId) {
      setBarberoId(initialBarberId);
    } else if (barbers.length > 0 && (!barberoId || !barbers.some((b) => Number(b.id_barbero) === Number(barberoId)))) {
      setBarberoId(barbers[0].id_barbero);
    }
  }, [initialBarberId, barbers]);

  // Sincronizar automáticamente cuando los insumos de bodega carguen
  useEffect(() => {
    if (warehouseItems.length > 0 && (!insumoId || !warehouseItems.some((i) => Number(i.id_insumo) === Number(insumoId)))) {
      setInsumoId(warehouseItems[0].id_insumo);
    }
  }, [warehouseItems, insumoId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!barberoId || !insumoId) return;

    onSave({
      barbero_id: Number(barberoId),
      insumo_id: Number(insumoId),
      cantidad_asignada: Number(cantidad) || 1,
      notas: notas || "Asignación inicial de insumo a puesto"
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 10 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl bg-card border border-border/80 shadow-2xl p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-[#E8C466]/15 text-[#E8C466] border border-[#E8C466]/30">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground">Asignar Insumo a Estación</h3>
                <p className="text-xs text-muted-foreground">Inicia el control del semáforo para este barbero</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Seleccionar Barbero */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#E8C466]" /> Barbero y Puesto de Trabajo:
              </label>
              <select
                value={barberoId}
                onChange={(e) => setBarberoId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border/40 hover:border-[#DFB755]/50 focus:border-[#DFB755] text-foreground text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#DFB755]/30 transition-colors shadow-none cursor-pointer"
                required
              >
                {barbers.length > 0 ? (
                  barbers.map((b) => {
                    const fullName = b.nombre && b.apellido ? `${b.nombre} ${b.apellido}`.trim() : (b.nombre || `Barbero ${b.id_barbero}`);
                    return (
                      <option key={b.id_barbero} value={b.id_barbero} className="bg-card text-foreground">
                        {fullName} {b.especialidad ? `(${b.especialidad})` : ""}
                      </option>
                    );
                  })
                ) : (
                  <option value="" disabled className="bg-card text-foreground">
                    Cargando barberos registrados...
                  </option>
                )}
              </select>
            </div>

            {/* Seleccionar Insumo de Bodega General */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-cyan-400" /> Insumo de Almacén:
              </label>
              <select
                value={insumoId}
                onChange={(e) => setInsumoId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border/40 hover:border-[#DFB755]/50 focus:border-[#DFB755] text-foreground text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#DFB755]/30 transition-colors shadow-none cursor-pointer"
                required
              >
                {warehouseItems.length > 0 ? (
                  warehouseItems.map((item) => (
                    <option key={item.id_insumo} value={item.id_insumo} className="bg-card text-foreground py-1">
                      {item.nombre} ({item.stock_actual} {item.unidad_medida || "disp."} en almacén)
                    </option>
                  ))
                ) : (
                  <option value="" disabled className="bg-card text-muted-foreground">
                    Cargando insumos de bodega...
                  </option>
                )}
              </select>
            </div>

            {/* Cantidad asignada (por defecto 1) */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Cantidad Inicial en Puesto:
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={cantidad}
                onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 px-3.5 py-2 rounded-xl bg-card border border-border/40 hover:border-[#DFB755]/50 focus:border-[#DFB755] text-foreground text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#DFB755]/30 transition-colors shadow-none"
                required
              />
              <span className="text-[11px] text-muted-foreground ml-2">
                El semáforo iniciará en <strong className="text-emerald-400">VERDE</strong> (Nuevo/Lleno).
              </span>
            </div>

            {/* Notas opcionales */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Notas / Ubicación de la Estación:
              </label>
              <input
                type="text"
                placeholder="Ej. Espejo 2, gaveta superior"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-card border border-border/40 hover:border-[#DFB755]/50 focus:border-[#DFB755] text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-[#DFB755]/30 transition-colors shadow-none"
              />
            </div>

            {/* Botones de acción */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black text-xs font-black shadow-lg shadow-[#DDAE41]/25 transition-all cursor-pointer disabled:opacity-50"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isSubmitting ? "Asignando..." : "Asignar a Puesto"}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
