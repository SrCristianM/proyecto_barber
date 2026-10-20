import { useState } from "react";
import { User, Calendar, Boxes, DollarSign, TrendingUp, Layers, PackageCheck, Award } from "lucide-react";
import { motion } from "motion/react";

export default function SuppliesBarberAnalytics({
  metrics,
  barbers = [],
  period,
  onPeriodChange,
  selectedBarberId,
  onBarberChange,
  loading = false
}) {
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'comparison'

  const {
    total_despachos = 0,
    total_articulos = 0,
    total_costo_estimado = 0,
    top_consumibles = [],
    por_barbero = [],
    despachos_recientes = []
  } = metrics || {};

  const selectedBarber = barbers.find((b) => String(b.id_barbero) === String(selectedBarberId));
  const maxProductQty = top_consumibles.length > 0 ? top_consumibles[0].total_cantidad : 1;

  return (
    <div className="space-y-6">
      {/* Barra de Filtros Integrada */}
      <div className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between flex-wrap gap-4 shadow-xs">
        {/* Selector de Barbero */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Barbero:
            </span>
          </div>
          <select
            value={selectedBarberId}
            onChange={(e) => onBarberChange(e.target.value)}
            className="px-3.5 py-2 bg-secondary/60 border border-border rounded-xl text-xs sm:text-sm font-bold text-foreground focus:outline-hidden focus:border-primary transition-colors cursor-pointer"
          >
            <option value="all">💈 Todos los Barberos (Consumo Global)</option>
            {barbers.map((b) => (
              <option key={b.id_barbero} value={b.id_barbero}>
                {b.nombre} {b.apellido || ""} — {b.especialidad || "Barbero"}
              </option>
            ))}
          </select>
        </div>

        {/* Selector de Período (Semana / Mes / Histórico) */}
        <div className="flex items-center gap-1.5 p-1 bg-secondary/60 border border-border rounded-xl">
          <button
            type="button"
            onClick={() => onPeriodChange("week")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              period === "week"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Esta Semana
          </button>
          <button
            type="button"
            onClick={() => onPeriodChange("month")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              period === "month"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Este Mes
          </button>
          <button
            type="button"
            onClick={() => onPeriodChange("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              period === "all"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Histórico Total
          </button>
        </div>
      </div>

      {/* Tarjetas de Métricas del Barbero y Período Seleccionado */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Insumos */}
        <div className="gold-card p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Insumos Gastados
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-foreground">
              {Number(total_articulos).toLocaleString("es-CO")}{" "}
              <span className="text-sm font-medium text-muted-foreground">un.</span>
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
        </div>

        {/* Costo Operativo Estimado */}
        <div className="gold-card p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Costo Operativo Estimado
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-amber-500 font-mono">
              ${Number(total_costo_estimado).toLocaleString("es-CO")}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              Valorización de insumos usados en servicios
            </p>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 shrink-0">
            <DollarSign className="w-6 h-6 text-amber-500" />
          </div>
        </div>

        {/* Despachos Realizados */}
        <div className="gold-card p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Despachos Realizados
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-500">
              {total_despachos}{" "}
              <span className="text-sm font-medium text-muted-foreground">vales</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              En el período ({period === "week" ? "Últimos 7 días" : period === "month" ? "Últimos 30 días" : "Histórico"})
            </p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shrink-0">
            <PackageCheck className="w-6 h-6 text-emerald-500" />
          </div>
        </div>
      </div>

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

        {/* Comparativa por Barbero o Despachos Recientes */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Comparativa de Consumo por Barbero
              </h3>
              <p className="text-xs text-muted-foreground">
                Insumos utilizados por cada barbero en el período
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
