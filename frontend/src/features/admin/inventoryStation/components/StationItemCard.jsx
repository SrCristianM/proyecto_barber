import { motion } from "motion/react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Package,
  Layers,
  ArrowRight,
  Flame,
  ShieldAlert,
  User,
  Trash2
} from "lucide-react";

export default function StationItemCard({
  item,
  isBarberView = false,
  onUpdateStatus,
  onApproveRestock,
  onRemove,
  isSubmitting = false
}) {
  const estado = item.estado_semaforo || "VERDE";
  const days = item.dias_en_estacion !== undefined ? item.dias_en_estacion : (item.dias_en_uso || 0);
  const bodegaStock = Number(item.stock_actual || 0);
  const hasWarehouseStock = bodegaStock > 0;
  const idEstacion = item.id_estacion_insumo || item.id_estacion_item;

  // Formato texto de días
  const daysText =
    days === 0
      ? "Entregado hoy"
      : days === 1
      ? "Entregado hace 1 día"
      : `Entregado hace ${days} días`;

  // Estilos y configuraciones según estado del semáforo
  const config = {
    VERDE: {
      label: "Lleno / En uso",
      sublabel: "Nivel óptimo para servicios",
      badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      glowClass: "shadow-[0_0_20px_rgba(16,185,129,0.12)] border-emerald-500/25",
      dotClass: "bg-emerald-500 shadow-[0_0_10px_#10B981]",
      headerBg: "from-emerald-500/10 via-emerald-500/5 to-transparent",
      icon: CheckCircle2
    },
    AMARILLO: {
      label: "Queda poco",
      sublabel: "Agotándose próximamente",
      badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse",
      glowClass: "shadow-[0_0_25px_rgba(245,158,11,0.22)] border-amber-500/40 ring-1 ring-amber-500/30",
      dotClass: "bg-amber-400 shadow-[0_0_12px_#F59E0B]",
      headerBg: "from-amber-500/15 via-amber-500/5 to-transparent",
      icon: AlertTriangle
    },
    ROJO: {
      label: "Agotado - Requiere Reposición",
      sublabel: "Solicitud urgente para puesto",
      badgeClass: "bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse",
      glowClass: "shadow-[0_0_30px_rgba(244,63,94,0.3)] border-rose-500/50 ring-2 ring-rose-500/30",
      dotClass: "bg-rose-500 shadow-[0_0_14px_#F43F5E]",
      headerBg: "from-rose-500/20 via-rose-500/5 to-transparent",
      icon: ShieldAlert
    }
  }[estado] || {
    label: "Activo",
    sublabel: "",
    badgeClass: "bg-muted text-muted-foreground border-border",
    glowClass: "border-border",
    dotClass: "bg-gray-400",
    headerBg: "from-card to-transparent",
    icon: Package
  };

  const StatusIcon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className={`relative flex flex-col justify-between overflow-hidden rounded-2xl bg-card/90 backdrop-blur-xl border transition-all duration-300 hover:shadow-xl ${config.glowClass}`}
    >
      {/* Luz ambiental en la parte superior según el semáforo */}
      <div className={`absolute top-0 inset-x-0 h-28 bg-gradient-to-b ${config.headerBg} pointer-events-none`} />

      {/* Contenido Principal */}
      <div className="relative p-5 z-10 flex flex-col flex-1">
        {/* Cabecera de la tarjeta: Nombre de barbero (en vista admin) + Badge semáforo */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-col">
            {!isBarberView && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#DFB755] dark:text-[#E8C466] mb-1">
                <User className="w-3.5 h-3.5" />
                <span>{item.barbero_nombre || "Barbero"}</span>
                {item.barbero_especialidad && (
                  <span className="text-[10px] text-muted-foreground font-normal">
                    • {item.barbero_especialidad}
                  </span>
                )}
              </div>
            )}
            <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug tracking-tight">
              {item.insumo_nombre || "Insumo de Estación"}
            </h3>
            <span className="text-[11px] font-medium text-muted-foreground mt-0.5">
              {item.insumo_categoria || "Consumible"} • {item.unidad_medida || "Unidad"}
            </span>
          </div>

          {/* Badge del Semáforo */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shrink-0 ${config.badgeClass}`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${config.dotClass}`} />
            <span>{config.label}</span>
          </div>
        </div>

        {/* Indicadores clave (Días activo + Stock en bodega) */}
        <div className="grid grid-cols-2 gap-2 my-3 p-3 rounded-xl bg-background/60 border border-border/50 text-xs">
          {/* Contador de Días desde última reposición */}
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#E8C466]" /> Duración Ciclo
            </span>
            <span className="font-extrabold text-foreground mt-1">{daysText}</span>
            <span className="text-[10px] text-muted-foreground">
              {item.fecha_ultima_reposicion
                ? new Date(item.fecha_ultima_reposicion).toLocaleDateString("es-CO", {
                    day: "2-digit",
                    month: "short"
                  })
                : "Sin registro"}
            </span>
          </div>

          {/* Estado de Stock en Bodega General */}
          <div className="flex flex-col border-l border-border/40 pl-3">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1">
              <Package className="w-3 h-3 text-cyan-400" /> Stock Almacén
            </span>
            <span
              className={`font-extrabold mt-1 ${
                hasWarehouseStock ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {hasWarehouseStock ? `${bodegaStock} disponibles` : "Agotado en Bodega"}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {hasWarehouseStock ? "Listo para reposición" : "Requiere compra urgente"}
            </span>
          </div>
        </div>

        {/* Notas o estado descriptivo */}
        {item.notas && (
          <p className="text-[11px] text-muted-foreground italic line-clamp-2 mb-3 bg-muted/20 px-2.5 py-1.5 rounded-lg border border-border/30">
            "{item.notas}"
          </p>
        )}
      </div>

      {/* Botones de Acción (Pie de tarjeta) */}
      <div className="relative p-4 pt-0 z-10">
        {isBarberView ? (
          /* =======================================================
             VISTA DEL BARBERO: ACCIONES RÁPIDAS DE 1 CLIC
             ======================================================= */
          <div className="flex flex-col gap-2">
            {estado === "VERDE" && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => onUpdateStatus(idEstacion, "AMARILLO")}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Queda poco</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => onUpdateStatus(idEstacion, "ROJO")}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Pedir reposición</span>
                </button>
              </div>
            )}

            {estado === "AMARILLO" && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-[11px] text-amber-400 font-semibold px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Aviso enviado a administración
                  </span>
                </div>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => onUpdateStatus(idEstacion, "ROJO")}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold shadow-md shadow-rose-900/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Se agotó completamente (Pedir reposición urgente)</span>
                </button>
              </div>
            )}

            {estado === "ROJO" && (
              <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-center">
                <span className="text-xs font-extrabold text-rose-300 flex items-center justify-center gap-1.5">
                  <Flame className="w-4 h-4 animate-bounce text-rose-400" />
                  Reposición solicitada a bodega
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Esperando que la administración o almacén apruebe y entregue tu nuevo insumo.
                </span>
              </div>
            )}
          </div>
        ) : (
          /* =======================================================
             VISTA DEL ADMINISTRADOR: APROBAR REPOSICIÓN Y ACCIONES
             ======================================================= */
          <div className="flex items-center gap-2">
            {/* Botón Principal: Aprobar Reposición */}
            <button
              type="button"
              disabled={isSubmitting || !hasWarehouseStock}
              onClick={() => onApproveRestock(item)}
              title={
                !hasWarehouseStock
                  ? "Sin stock en bodega general. Registre una compra de proveedor primero."
                  : "Descuenta 1 unidad de bodega general y restablece semáforo a VERDE"
              }
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer active:scale-95 disabled:cursor-not-allowed ${
                estado === "ROJO" || estado === "AMARILLO"
                  ? hasWarehouseStock
                    ? "bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black shadow-lg shadow-[#DDAE41]/25 ring-1 ring-amber-400"
                    : "bg-muted/50 text-muted-foreground border border-border opacity-60"
                  : "bg-secondary hover:bg-secondary/80 text-foreground border border-border/60"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{estado === "VERDE" ? "Reponer de nuevo" : "Aprobar Reposición"}</span>
            </button>

            {/* Retirar de estación */}
            {onRemove && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => onRemove(idEstacion)}
                title="Retirar insumo de la estación de trabajo"
                className="p-2.5 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 transition-all cursor-pointer active:scale-90"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
