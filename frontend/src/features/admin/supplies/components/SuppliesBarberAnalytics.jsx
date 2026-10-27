import { useState } from "react";
import {
  User,
  Calendar,
  Boxes,
  DollarSign,
  TrendingUp,
  Layers,
  PackageCheck,
  Award,
  Scissors,
  Sparkles,
  X,
  Gauge,
  Zap,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { motion } from "motion/react";
import SearchableSelect from "../../shared/components/SearchableSelect";
import RollingNumber from "../../../../shared/components/RollingNumber";

export default function SuppliesBarberAnalytics({
  metrics,
  barbers = [],
  period,
  onPeriodChange,
  selectedBarberId,
  onBarberChange,
  loading = false
}) {
  const {
    total_despachos = 0,
    total_articulos = 0,
    total_costo_estimado = 0,
    total_servicios_periodo = 0,
    costo_promedio_por_servicio = 0,
    insumos_promedio_por_servicio = 0,
    top_consumibles = [],
    por_barbero = [],
    despachos_recientes = []
  } = metrics || {};

  const selectedBarber = barbers.find((b) => String(b.id_barbero) === String(selectedBarberId));
  const currentBarberStats = por_barbero.find((b) => String(b.id_barbero) === String(selectedBarberId));
  const maxProductQty = top_consumibles.length > 0 ? top_consumibles[0].total_cantidad : 1;

  // Datos específicos del barbero o globales para rendimiento operativo
  const activeServicios = selectedBarberId === "all"
    ? total_servicios_periodo
    : (currentBarberStats?.servicios_realizados ?? 0);

  const activeCostoPorServicio = selectedBarberId === "all"
    ? costo_promedio_por_servicio
    : (currentBarberStats?.costo_por_servicio ?? 0);

  const activeInsumosPorServicio = selectedBarberId === "all"
    ? insumos_promedio_por_servicio
    : (currentBarberStats?.insumos_por_servicio ?? 0);

  const activeCalificacion = selectedBarberId === "all"
    ? (total_articulos > 0 ? "Consumo Global" : "Sin Registro")
    : (currentBarberStats?.calificacion_eficiencia || "Uso Estándar");

  // Opciones de barbero con subtítulo y descripción para SearchableSelect
  const barberOptions = [
    {
      value: "all",
      label: "Todos los Barberos (Consumo Global)",
      subtitle: "Consumo consolidado de todo el equipo de trabajo"
    },
    ...barbers.map((b) => ({
      value: String(b.id_barbero),
      label: `${b.nombre} ${b.apellido || ""}`.trim(),
      subtitle: b.especialidad || "Barbero Profesional"
    }))
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.07 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }
  };

  return (
    <div className="space-y-6">
      {/* Barra de Filtros Organizada en Recuadros */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border space-y-4 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          {/* Recuadro 1: Selector de Barbero */}
          <div className="lg:col-span-7 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-primary" />
                Barbero a Auditar
              </label>
              {selectedBarberId !== "all" && (
                <button
                  type="button"
                  onClick={() => onBarberChange("all")}
                  className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  Ver todos los barberos
                </button>
              )}
            </div>
            <SearchableSelect
              value={String(selectedBarberId)}
              onChange={(val) => onBarberChange(val)}
              options={barberOptions}
              placeholder="Seleccionar barbero a consultar..."
              searchPlaceholder="Buscar por nombre o especialidad..."
              icon={<User className="w-4 h-4 text-primary" />}
              size="md"
              searchable={true}
              className="w-full"
            />
          </div>

          {/* Recuadro 2: Ventana de Tiempo (Período) */}
          <div className="lg:col-span-5 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              Período de Análisis
            </label>
            <div className="flex items-center gap-1.5 p-1 bg-secondary/50 border border-border rounded-xl">
              <button
                type="button"
                onClick={() => onPeriodChange("week")}
                className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                  period === "week"
                    ? "bg-primary text-primary-foreground shadow-xs font-extrabold"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                }`}
              >
                Esta Semana
              </button>
              <button
                type="button"
                onClick={() => onPeriodChange("month")}
                className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                  period === "month"
                    ? "bg-primary text-primary-foreground shadow-xs font-extrabold"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                }`}
              >
                Este Mes
              </button>
              <button
                type="button"
                onClick={() => onPeriodChange("all")}
                className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                  period === "all"
                    ? "bg-primary text-primary-foreground shadow-xs font-extrabold"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                }`}
              >
                Histórico
              </button>
            </div>
          </div>
        </div>

        {/* Ficha Resumen del Barbero Seleccionado */}
        {selectedBarber && (
          <div className="pt-3 border-t border-border/60 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center font-bold text-primary text-sm shadow-2xs">
                💈
              </div>
              <div>
                <p className="text-xs sm:text-sm font-extrabold text-foreground flex items-center gap-2">
                  {selectedBarber.nombre} {selectedBarber.apellido || ""}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25">
                    {selectedBarber.especialidad || "Estilista"}
                  </span>
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Auditando insumos gastados durante los servicios realizados en {period === "week" ? "esta semana" : period === "month" ? "este mes" : "el histórico total"}.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1.5 rounded-xl bg-secondary border border-border text-foreground font-bold">
                {total_despachos} {total_despachos === 1 ? "despacho" : "despachos"}
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-500 font-bold font-mono">
                ${Number(total_costo_estimado).toLocaleString("es-CO")}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Tarjetas de Métricas del Barbero y Período Seleccionado con RollingNumber y Gold Metallic Card */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {/* Total Insumos */}
        <motion.div variants={itemVariants} className="gold-metallic-card p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Insumos Gastados
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-foreground">
              <RollingNumber value={total_articulos} suffix="un." />
            </h3>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              {selectedBarberId === "all"
                ? "Consumidos por todo el equipo"
                : `Gastados por ${selectedBarber ? selectedBarber.nombre : "el barbero"}`}
            </p>
          </div>
          <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 shrink-0">
            <Boxes className="w-6 h-6 text-primary" />
          </div>
        </motion.div>

        {/* Costo Operativo Estimado */}
        <motion.div variants={itemVariants} className="gold-metallic-card p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Costo Operativo Estimado
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-amber-500 font-mono">
              <RollingNumber value={total_costo_estimado} prefix="$" />
            </h3>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              Valorización de insumos usados en servicios
            </p>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 shrink-0">
            <DollarSign className="w-6 h-6 text-amber-500" />
          </div>
        </motion.div>

        {/* Despachos Realizados */}
        <motion.div variants={itemVariants} className="gold-metallic-card p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Despachos Realizados
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-500">
              <RollingNumber value={total_despachos} suffix="vales" />
            </h3>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              En el período ({period === "week" ? "Últimos 7 días" : period === "month" ? "Últimos 30 días" : "Histórico"})
            </p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shrink-0">
            <PackageCheck className="w-6 h-6 text-emerald-500" />
          </div>
        </motion.div>
      </motion.div>

      {/* =========================================================================
          NUEVA SECCIÓN (PROPUESTA 1.A): RENDIMIENTO OPERATIVO (SERVICIOS VS CONSUMO)
          ========================================================================= */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="show"
        className="p-5 sm:p-6 rounded-2xl bg-card border border-[#DFB755]/30 shadow-sm space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Gauge className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-black text-foreground">
                Rendimiento Operativo: Consumo de Insumos vs Servicios Realizados
              </h3>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                <Zap className="w-3 h-3" /> Métricas de Eficiencia
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Auditoría comparativa entre citas/servicios ejecutados y el material consumido por puesto.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-bold text-muted-foreground uppercase">Calificación:</span>
            <span
              className={`text-xs font-black px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${
                activeCalificacion.includes("Excelente")
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40 glow-pulse-green"
                  : activeCalificacion.includes("Revisar")
                  ? "bg-rose-500/15 text-rose-400 border-rose-500/40 glow-pulse-red"
                  : "bg-amber-500/15 text-amber-400 border-amber-500/40 glow-pulse-amber"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {activeCalificacion}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
          {/* Tarjeta 1: Servicios Atendidos */}
          <div className="p-4 rounded-xl bg-secondary/30 border border-border/70 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
              Servicios Atendidos
            </span>
            <p className="text-xl sm:text-2xl font-black text-foreground font-mono">
              <RollingNumber value={activeServicios} suffix="cortes/citas" />
            </p>
            <p className="text-[11px] text-muted-foreground">
              {activeServicios > 0
                ? "Total de atenciones registradas en el período"
                : "Aún no hay citas registradas en este período"}
            </p>
          </div>

          {/* Tarjeta 2: Costo Promedio por Servicio */}
          <div className="p-4 rounded-xl bg-secondary/30 border border-border/70 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
              Costo de Insumos por Servicio
            </span>
            <p className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
              <RollingNumber value={activeCostoPorServicio} prefix="$" suffix="/ serv." />
            </p>
            <p className="text-[11px] text-muted-foreground">
              Gasto en consumibles (cuchillas, gel, etc.) por cliente atendido
            </p>
          </div>

          {/* Tarjeta 3: Insumos Usados por Servicio */}
          <div className="p-4 rounded-xl bg-secondary/30 border border-border/70 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
              Tasa de Uso de Insumos
            </span>
            <p className="text-xl sm:text-2xl font-black text-foreground font-mono">
              <RollingNumber value={activeInsumosPorServicio} decimals={1} suffix="un. / serv." />
            </p>
            <p className="text-[11px] text-muted-foreground">
              Promedio de unidades gastadas por cada servicio completado
            </p>
          </div>
        </div>
      </motion.div>

      {/* Gráfica y Desglose de Consumo de Productos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ranking de Productos Más Gastados */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                Insumos Más Gastados en el Período
              </h3>
              <p className="text-xs text-muted-foreground">
                Consumo detallado por tipo de producto y consumible
              </p>
            </div>
            <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
              {top_consumibles.length} productos
            </span>
          </div>

          {top_consumibles.length > 0 ? (
            <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
              {top_consumibles.map((prod, index) => {
                const percent = Math.round((prod.total_cantidad / maxProductQty) * 100);
                return (
                  <div key={index} className="p-3 bg-secondary/30 rounded-xl border border-border/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-foreground flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-md bg-secondary text-primary font-bold text-[10px] flex items-center justify-center shrink-0">
                          #{index + 1}
                        </span>
                        {prod.nombre}
                      </span>
                      <span className="font-mono font-bold text-foreground">
                        {prod.total_cantidad} un.{" "}
                        <span className="text-muted-foreground font-normal">
                          (${Number(prod.total_costo).toLocaleString("es-CO")})
                        </span>
                      </span>
                    </div>

                    <div className="w-full bg-secondary rounded-full h-2 overflow-hidden border border-border/40">
                      <div
                        className="bg-gradient-to-r from-[#E8C466] to-[#DDAE41] h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center rounded-xl bg-secondary/10 border border-dashed border-border/60">
              <Boxes className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-xs font-semibold text-foreground">Sin consumo en este período</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                No hay vales de insumos registrados para el filtro actual.
              </p>
            </div>
          )}
        </div>

        {/* Comparativa por Barbero con Métricas de Eficiencia por Servicio */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Comparativa y Eficiencia por Barbero
              </h3>
              <p className="text-xs text-muted-foreground">
                Insumos utilizados y relación costo/servicio de cada profesional
              </p>
            </div>
          </div>

          {por_barbero.length > 0 ? (
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {por_barbero.map((barb, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-background border border-border rounded-xl flex items-center justify-between hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-xs">
                      💈
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{barb.nombre_barbero}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {barb.especialidad} · {barb.total_despachos} despachos
                        {barb.servicios_realizados > 0 && ` · ${barb.servicios_realizados} servicios`}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-foreground font-mono block">
                      {barb.total_articulos} un.
                    </span>
                    <span className="text-[11px] text-amber-500 font-mono font-bold">
                      ${Number(barb.total_costo).toLocaleString("es-CO")}
                    </span>
                    {barb.calificacion_eficiencia && (
                      <span className="block text-[9px] font-bold text-emerald-400 mt-0.5">
                        {barb.calificacion_eficiencia}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center rounded-xl bg-secondary/10 border border-dashed border-border/60">
              <User className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-xs font-semibold text-foreground">Sin comparativa disponible</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Registra abastecimientos para ver la comparativa entre los barberos.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
