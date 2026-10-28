import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Clock,
  User,
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Activity,
  History,
  Flame,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  BarChart3,
  Layers,
  FileSpreadsheet,
  Download
} from "lucide-react";
import { toast } from "sonner";
import RollingNumber from "../../../../shared/components/RollingNumber";
import { exportToStyledExcel } from "../../../../shared/utils/excelExporter";
import { fireGoldenConfetti } from "../../../../shared/utils/confettiHelper";

export default function StationMetricsView({
  metrics,
  history = [],
  stations = [],
  barbers = [],
  onRefresh
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'alert' | 'optimal'
  const [expandedBarberIds, setExpandedBarberIds] = useState(new Set());

  // Cálculo reactivo en tiempo real del semáforo general basado en las estaciones activas
  const resumen = useMemo(() => {
    if (stations && stations.length > 0) {
      let rojo = 0;
      let amarillo = 0;
      let verde = 0;
      stations.forEach((s) => {
        if (s.estado_semaforo === "ROJO") rojo++;
        else if (s.estado_semaforo === "AMARILLO") amarillo++;
        else if (s.estado_semaforo === "VERDE") verde++;
      });
      return {
        rojo,
        amarillo,
        verde,
        totalAsignaciones: stations.length,
        alertasActivas: rojo + amarillo
      };
    }
    return (
      metrics?.resumenSemaforo || {
        rojo: 0,
        amarillo: 0,
        verde: 0,
        totalAsignaciones: 0,
        alertasActivas: 0
      }
    );
  }, [stations, metrics]);

  const resumenBodega = metrics?.resumenBodega || { totalInsumos: 0, stockBajoCount: 0 };

  // =========================================================================
  // CÁLCULO DE PROMEDIOS EN TIEMPO REAL: EXACTAMENTE 1 TARJETA POR BARBERO
  // (100% DATOS REALES: CERO ESTIMACIONES FALSAS O VALORES HARDCODEADOS)
  // =========================================================================
  const barberMetricsList = useMemo(() => {
    // 1. Mapa maestro para consolidar a TODOS los barberos registrados del sistema
    const barberMap = new Map();

    // Incorporar todos los barberos registrados (presentes y futuros)
    (barbers || []).forEach((barb) => {
      const bId = Number(barb.id_barbero);
      if (bId) {
        barberMap.set(bId, {
          id_barbero: bId,
          barbero_nombre: barb.nombre ? `${barb.nombre} ${barb.apellido || ""}`.trim() : "Barbero",
          barbero_correo: barb.correo || "",
          barbero_especialidad: barb.especialidad || "Barbero Profesional",
          barbero_foto: barb.foto || barb.imagen_url || null,
          promedioDiasGlobal: 0,
          diasActualPromedio: 0,
          totalInsumosAsignados: 0,
          totalReposicionesCompletadas: 0,
          conteoVerde: 0,
          conteoAmarillo: 0,
          conteoRojo: 0,
          estadoGlobal: "VACIO",
          insumos: []
        });
      }
    });

    // Incorporar desde stations si algún barbero no estuviera en la lista general
    (stations || []).forEach((s) => {
      const bId = Number(s.id_barbero || s.barbero_id);
      if (bId && !barberMap.has(bId)) {
        barberMap.set(bId, {
          id_barbero: bId,
          barbero_nombre: s.barbero_nombre || "Barbero",
          barbero_correo: s.barbero_correo || "",
          barbero_especialidad: s.barbero_especialidad || "Barbero Profesional",
          barbero_foto: s.barbero_foto || null,
          promedioDiasGlobal: 0,
          diasActualPromedio: 0,
          totalInsumosAsignados: 0,
          totalReposicionesCompletadas: 0,
          conteoVerde: 0,
          conteoAmarillo: 0,
          conteoRojo: 0,
          estadoGlobal: "VACIO",
          insumos: []
        });
      }
    });

    // Incorporar del backend si hubiera alguno adicional
    const backendPromedios = metrics?.promediosPorBarbero || [];
    backendPromedios.forEach((b) => {
      const bId = Number(b.id_barbero);
      if (bId && !barberMap.has(bId)) {
        barberMap.set(bId, { ...b });
      }
    });

    // 2. Calcular métricas en tiempo real 100% auténticas
    const result = Array.from(barberMap.values()).map((barber) => {
      const bId = Number(barber.id_barbero);

      // Insumos asignados a este barbero actualmente en estaciones
      const currentStations = (stations || []).filter(
        (s) => Number(s.id_barbero || s.barbero_id) === bId
      );

      // Historial de reposiciones completadas por este barbero
      const barberHistory = (history || []).filter(
        (h) => Number(h.id_barbero || h.barbero_id) === bId
      );

      // Si el barbero no tiene insumos ni reposiciones registradas:
      if (currentStations.length === 0 && barberHistory.length === 0) {
        return {
          id_barbero: bId,
          barbero_nombre: barber.barbero_nombre,
          barbero_correo: barber.barbero_correo,
          barbero_especialidad: barber.barbero_especialidad,
          barbero_foto: barber.barbero_foto,
          promedioDiasGlobal: 0,
          diasActualPromedio: 0,
          totalInsumosAsignados: 0,
          totalReposicionesCompletadas: 0,
          conteoVerde: 0,
          conteoAmarillo: 0,
          conteoRojo: 0,
          estadoGlobal: "VACIO",
          insumos: []
        };
      }

      // Insumos asignados con métricas reales
      const insumos = currentStations.map((station) => {
        const insumoId = Number(station.id_insumo || station.insumo_id);
        const itemHistory = barberHistory.filter(
          (h) =>
            Number(h.id_insumo || h.insumo_id) === insumoId &&
            Number(h.dias_duracion_anterior) > 0
        );
        const itemDurations = itemHistory.map((h) => Number(h.dias_duracion_anterior));
        const currentDays = Number(
          station.dias_en_estacion !== undefined
            ? station.dias_en_estacion
            : station.dias_en_uso || 0
        );

        let avgDuration = 0;
        if (itemDurations.length > 0) {
          avgDuration = Math.round(itemDurations.reduce((a, b) => a + b, 0) / itemDurations.length);
        } else {
          // Si no tiene historial propio, buscar si otros barberos han repuesto este insumo
          const shopHistory = (history || []).filter(
            (h) =>
              Number(h.id_insumo || h.insumo_id) === insumoId &&
              Number(h.dias_duracion_anterior) > 0
          );
          if (shopHistory.length > 0) {
            avgDuration = Math.round(
              shopHistory.reduce((a, h) => a + Number(h.dias_duracion_anterior), 0) / shopHistory.length
            );
          } else {
            avgDuration = 0; // Primer ciclo en curso, sin historial previo
          }
        }

        const diff = avgDuration > 0 ? currentDays - avgDuration : 0;
        const isOver = avgDuration > 0 ? diff > 0 : false;
        const pct = avgDuration > 0
          ? Math.min(100, Math.round((currentDays / avgDuration) * 100))
          : (currentDays > 0 ? 50 : 0);

        return {
          id_insumo: insumoId,
          id_estacion_insumo: station.id_estacion_insumo || station.id_estacion_item,
          insumo_nombre: station.insumo_nombre,
          insumo_categoria: station.insumo_categoria || "Consumible",
          unidad_medida: station.unidad_medida || "Unidad",
          estado_semaforo: station.estado_semaforo || "VERDE",
          stock_actual: Number(station.stock_actual || 0),
          promedioDiasDuracion: avgDuration,
          diasActualEnUso: currentDays,
          diffFromAvg: diff,
          isOverAvg: isOver,
          totalReposiciones: itemHistory.length,
          porcentajeCiclo: pct
        };
      });

      // Duraciones válidas de historial global de este barbero
      const validHistoryDurations = barberHistory
        .map((h) => Number(h.dias_duracion_anterior))
        .filter((d) => d > 0);

      let globalAvg = 0;
      if (validHistoryDurations.length > 0) {
        globalAvg = Math.round(
          validHistoryDurations.reduce((a, b) => a + b, 0) / validHistoryDurations.length
        );
      } else {
        const validItemAvgs = insumos.map((i) => i.promedioDiasDuracion).filter((d) => d > 0);
        if (validItemAvgs.length > 0) {
          globalAvg = Math.round(validItemAvgs.reduce((a, b) => a + b, 0) / validItemAvgs.length);
        } else {
          globalAvg = 0;
        }
      }

      const avgCurrentDays =
        insumos.length > 0
          ? Math.round(insumos.reduce((a, i) => a + i.diasActualEnUso, 0) / insumos.length)
          : 0;

      const verde = insumos.filter((i) => i.estado_semaforo === "VERDE").length;
      const amarillo = insumos.filter((i) => i.estado_semaforo === "AMARILLO").length;
      const rojo = insumos.filter((i) => i.estado_semaforo === "ROJO").length;

      const globalState =
        insumos.length === 0
          ? "VACIO"
          : rojo > 0
          ? "ROJO"
          : amarillo > 0
          ? "AMARILLO"
          : "VERDE";

      return {
        id_barbero: bId,
        barbero_nombre: barber.barbero_nombre,
        barbero_correo: barber.barbero_correo,
        barbero_especialidad: barber.barbero_especialidad,
        barbero_foto: barber.barbero_foto,
        promedioDiasGlobal: globalAvg,
        diasActualPromedio: avgCurrentDays,
        totalInsumosAsignados: insumos.length,
        totalReposicionesCompletadas: barberHistory.length,
        conteoVerde: verde,
        conteoAmarillo: amarillo,
        conteoRojo: rojo,
        estadoGlobal: globalState,
        insumos
      };
    });

    return result;
  }, [metrics, stations, history, barbers]);

  // Filtrado de las tarjetas por búsqueda o estado
  const filteredBarbers = useMemo(() => {
    return barberMetricsList.filter((b) => {
      // Filtro por estado
      if (statusFilter === "alert" && b.estadoGlobal !== "ROJO" && b.estadoGlobal !== "AMARILLO") {
        return false;
      }
      if (statusFilter === "optimal" && b.estadoGlobal !== "VERDE") {
        return false;
      }

      // Filtro por texto
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const matchName = (b.barbero_nombre || "").toLowerCase().includes(term);
        const matchSpecialty = (b.barbero_especialidad || "").toLowerCase().includes(term);
        const matchInsumo = b.insumos.some((i) =>
          (i.insumo_nombre || "").toLowerCase().includes(term)
        );
        if (!matchName && !matchSpecialty && !matchInsumo) return false;
      }

      return true;
    });
  }, [barberMetricsList, searchTerm, statusFilter]);

  // Toggle para expandir/contraer lista de insumos de un barbero
  const toggleBarberExpanded = (bId) => {
    setExpandedBarberIds((prev) => {
      const next = new Set(prev);
      if (next.has(bId)) {
        next.delete(bId);
      } else {
        next.add(bId);
      }
      return next;
    });
  };

  const [showExportMenu, setShowExportMenu] = useState(false);

  // 1. Exportación Detallada: Rendimiento por Insumo y Barbero
  const handleExportFullDetail = () => {
    if (!filteredBarbers || filteredBarbers.length === 0) {
      toast.error("No hay datos de rendimiento para exportar.");
      return;
    }

    const rows = [];
    filteredBarbers.forEach((barber) => {
      if (barber.insumos && barber.insumos.length > 0) {
        barber.insumos.forEach((item) => {
          const diffText =
            item.promedioDiasDuracion > 0
              ? item.diffFromAvg === 0
                ? "Exacto al promedio"
                : item.diffFromAvg > 0
                ? `+${item.diffFromAvg} días sobre promedio`
                : `${item.diffFromAvg} días bajo promedio`
              : "Sin historial previo";

          let diagnostico = "En ciclo óptimo";
          if (item.estado_semaforo === "ROJO") diagnostico = "Agotado - Requiere reposición";
          else if (item.estado_semaforo === "AMARILLO") diagnostico = "Aviso preventivo - Por agotarse";
          else if (item.promedioDiasDuracion === 0) diagnostico = "Primer ciclo de uso";

          rows.push({
            barbero_nombre: barber.barbero_nombre || "Barbero",
            barbero_especialidad: barber.barbero_especialidad || "General",
            insumo_nombre: item.insumo_nombre || "Insumo",
            insumo_categoria: item.insumo_categoria || "Consumible",
            cantidad_en_puesto: Number(item.cantidad_asignada !== undefined ? item.cantidad_asignada : (item.cantidad_actual !== undefined ? item.cantidad_actual : 1)),
            unidad_medida: item.unidad_medida || "uds",
            estado_semaforo: item.estado_semaforo || "VERDE",
            dias_actual_uso: Number(item.diasActualEnUso || 0),
            duracion_promedio: Number(item.promedioDiasDuracion || 0),
            desviacion_promedio: diffText,
            reposiciones_completadas: Number(item.totalReposiciones || 0),
            stock_bodega: Number(item.stock_actual || 0),
            diagnostico
          });
        });
      } else {
        rows.push({
          barbero_nombre: barber.barbero_nombre || "Barbero",
          barbero_especialidad: barber.barbero_especialidad || "General",
          insumo_nombre: "(Sin insumos asignados)",
          insumo_categoria: "—",
          cantidad_en_puesto: 0,
          unidad_medida: "—",
          estado_semaforo: "VACIO",
          dias_actual_uso: 0,
          duracion_promedio: 0,
          desviacion_promedio: "—",
          reposiciones_completadas: Number(barber.totalReposicionesCompletadas || 0),
          stock_bodega: 0,
          diagnostico: "Puesto sin consumibles activos"
        });
      }
    });

    exportToStyledExcel({
      title: "REPORTE DETALLADO DE RENDIMIENTO Y CONSUMO DE INSUMOS",
      subtitle: `Auditoría de ciclos y rendimiento por estación | Exportado el ${new Date().toLocaleDateString("es-CO")} - Tu Turno Barber ERP`,
      sheetName: "Rendimiento por Insumo",
      filename: "rendimiento_insumos_barberos",
      columns: [
        { header: "Barbero", key: "barbero_nombre", width: 180 },
        { header: "Especialidad", key: "barbero_especialidad", width: 160 },
        { header: "Insumo / Producto", key: "insumo_nombre", width: 220 },
        { header: "Categoría", key: "insumo_categoria", width: 140 },
        { header: "Cant. en Puesto", key: "cantidad_en_puesto", type: "number", width: 120, align: "center" },
        { header: "Unidad", key: "unidad_medida", width: 100, align: "center" },
        { header: "Semáforo", key: "estado_semaforo", type: "status", width: 110, align: "center" },
        { header: "Días Ciclo Actual", key: "dias_actual_uso", type: "number", width: 125, align: "center" },
        { header: "Promedio Histórico (días)", key: "duracion_promedio", type: "number", width: 155, align: "center" },
        { header: "Desviación vs Promedio", key: "desviacion_promedio", width: 170, align: "center" },
        { header: "Ciclos Medidos", key: "reposiciones_completadas", type: "number", width: 110, align: "center" },
        { header: "Stock en Bodega", key: "stock_bodega", type: "number", width: 120, align: "right" },
        { header: "Diagnóstico", key: "diagnostico", width: 210 }
      ],
      data: rows
    });

    fireGoldenConfetti();
    toast.success("Detalle completo de rendimiento exportado a Excel exitosamente");
    setShowExportMenu(false);
  };

  // 2. Exportación Ejecutiva: Consolidado por Barbero
  const handleExportSummary = () => {
    if (!filteredBarbers || filteredBarbers.length === 0) {
      toast.error("No hay datos de barberos para exportar.");
      return;
    }

    const rows = filteredBarbers.map((b) => ({
      barbero_nombre: b.barbero_nombre || "Barbero",
      barbero_especialidad: b.barbero_especialidad || "General",
      barbero_correo: b.barbero_correo || "—",
      duracion_promedio_global: Number(b.promedioDiasGlobal || 0),
      dias_actual_promedio: Number(b.diasActualPromedio || 0),
      total_insumos: Number(b.totalInsumosAsignados || 0),
      reposiciones_totales: Number(b.totalReposicionesCompletadas || 0),
      insumos_llenos: Number(b.conteoVerde || 0),
      insumos_aviso: Number(b.conteoAmarillo || 0),
      insumos_agotados: Number(b.conteoRojo || 0),
      estado_global: b.estadoGlobal || "VERDE"
    }));

    exportToStyledExcel({
      title: "CONSOLIDADO EJECUTIVO DE RENDIMIENTO POR BARBERO",
      subtitle: `Resumen de ciclos, insumos activos y semáforos por estación | Exportado el ${new Date().toLocaleDateString("es-CO")} - Tu Turno Barber ERP`,
      sheetName: "Resumen Barberos",
      filename: "resumen_ejecutivo_rendimiento_barberos",
      columns: [
        { header: "Barbero", key: "barbero_nombre", width: 180 },
        { header: "Especialidad", key: "barbero_especialidad", width: 160 },
        { header: "Correo", key: "barbero_correo", width: 190 },
        { header: "Duración Promedio (días)", key: "duracion_promedio_global", type: "number", width: 155, align: "center" },
        { header: "Ciclo Actual Promedio (días)", key: "dias_actual_promedio", type: "number", width: 165, align: "center" },
        { header: "Insumos Asignados", key: "total_insumos", type: "number", width: 130, align: "center" },
        { header: "Reposiciones Totales", key: "reposiciones_totales", type: "number", width: 140, align: "center" },
        { header: "Llenos (Verde)", key: "insumos_llenos", type: "number", width: 110, align: "center" },
        { header: "Por Agotarse (Amarillo)", key: "insumos_aviso", type: "number", width: 145, align: "center" },
        { header: "Agotados (Rojo)", key: "insumos_agotados", type: "number", width: 120, align: "center" },
        { header: "Estado Estación", key: "estado_global", type: "status", width: 130, align: "center" }
      ],
      data: rows
    });

    fireGoldenConfetti();
    toast.success("Resumen consolidado de barberos exportado a Excel");
    setShowExportMenu(false);
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          1. TARJETAS KPI SUPERIORES (RESUMEN GLOBAL)
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Alertas Activas en Estaciones */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className="p-5 rounded-2xl bg-card border border-rose-500/30 bg-gradient-to-br from-rose-500/10 via-card to-card shadow-sm cursor-default"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Alertas Estaciones
            </span>
            <span className="p-2 rounded-xl bg-rose-500/15 text-rose-500 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </span>
          </div>
          <div className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-2">
            <RollingNumber value={resumen.alertasActivas} />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 font-medium">
            <strong className="text-rose-600 dark:text-rose-400 font-bold">{resumen.rojo}</strong> agotados •{" "}
            <strong className="text-amber-600 dark:text-amber-400 font-bold">{resumen.amarillo}</strong> por agotarse
          </p>
        </motion.div>

        {/* KPI 2: Estaciones Óptimas (Verde) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          className="p-5 rounded-2xl bg-card border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-card to-card shadow-sm cursor-default"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Estaciones Óptimas
            </span>
            <span className="p-2 rounded-xl bg-emerald-500/15 text-emerald-500 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            <RollingNumber value={resumen.verde} />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 font-medium">
            Insumos con nivel óptimo en servicio
          </p>
        </motion.div>

        {/* KPI 3: Stock en Almacén / Bajo Mínimo */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="p-5 rounded-2xl bg-card border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-card to-card shadow-sm cursor-default"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Insumos en Bodega
            </span>
            <span className="p-2 rounded-xl bg-cyan-500/15 text-cyan-500 dark:text-cyan-400">
              <Package className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl font-black text-cyan-600 dark:text-cyan-400 mt-2">
            <RollingNumber value={resumenBodega.totalInsumos} />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 font-medium">
            {resumenBodega.stockBajoCount > 0 ? (
              <span className="text-amber-600 dark:text-amber-400 font-bold">
                ⚠️ {resumenBodega.stockBajoCount} productos en nivel mínimo
              </span>
            ) : (
              "Todos con stock suficiente"
            )}
          </p>
        </motion.div>

        {/* KPI 4: Total Reposiciones Realizadas */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ duration: 0.2, delay: 0.15 }}
          className="p-5 rounded-2xl bg-card border border-[#E8C466]/30 bg-gradient-to-br from-[#E8C466]/10 via-card to-card shadow-sm cursor-default"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Ciclos Registrados
            </span>
            <span className="p-2 rounded-xl bg-[#E8C466]/15 text-[#B38E36] dark:text-[#E8C466]">
              <History className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl font-black text-[#B38E36] dark:text-[#E8C466] mt-2">
            <RollingNumber value={history.length} />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 font-medium">
            Historial de reposiciones y duración medida
          </p>
        </motion.div>
      </div>

      {/* =========================================================================
          2. SECCIÓN PRINCIPAL: PROMEDIO DE DURACIÓN CONSOLIDADO POR BARBERO
             (EXACTAMENTE 1 TARJETA POR BARBERO CON TODOS SUS INSUMOS Y MÉTRICAS)
          ========================================================================= */}
      <div className="rounded-3xl border border-border/70 bg-card/80 backdrop-blur-md p-6 shadow-xl space-y-6">
        {/* Cabecera y Filtros de la Sección */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-5">
          <div>
            <h3 className="text-lg font-black text-foreground flex items-center gap-2 tracking-tight">
              <TrendingUp className="w-5 h-5 text-[#E8C466]" />
              Promedios de Rendimiento y Duración por Barbero
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Consolidado de cada barbero: duración promedio calculada en tiempo real de cuánto le rinden los insumos y estado de ciclo actual.
            </p>
          </div>

          {/* Barra de Filtros y Búsqueda */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Buscador */}
            <div className="relative min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar barbero o insumo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-card border border-border/50 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-[#DFB755] transition-colors"
              />
            </div>

            {/* Filtro por Estado */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-card border border-border/50 text-xs text-foreground font-semibold focus:outline-none focus:border-[#DFB755] cursor-pointer"
              >
                <option value="all">Todos los barberos</option>
                <option value="alert">⚠️ Con Alertas Activas</option>
                <option value="optimal">🟢 100% Óptimos</option>
              </select>
            </div>

            {/* Menú de Exportación a Excel */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                title="Opciones de exportación a Excel"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-card hover:bg-muted text-foreground border border-border/60 hover:border-[#DFB755]/50 text-xs font-semibold transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#DFB755]" />
                <span>Exportar</span>
                <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${showExportMenu ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {showExportMenu && (
                  <>
                    {/* Backdrop transparente para cerrar al hacer clic afuera */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowExportMenu(false)}
                    />

                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl p-2 z-50 space-y-1"
                    >
                      <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40">
                        Opciones de Exportación
                      </div>

                      <button
                        type="button"
                        onClick={handleExportFullDetail}
                        className="w-full flex items-start gap-2.5 p-2 rounded-xl hover:bg-muted/80 text-left transition-colors cursor-pointer group"
                      >
                        <div className="p-1.5 rounded-lg bg-[#DFB755]/15 text-[#B38E36] dark:text-[#E8C466] shrink-0 mt-0.5">
                          <Download className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-foreground group-hover:text-[#B38E36] dark:group-hover:text-[#E8C466] transition-colors">
                            Detalle por Insumo (Completo)
                          </div>
                          <div className="text-[10.5px] text-muted-foreground leading-tight mt-0.5">
                            Cada producto con días de uso, duración promedio y bodega.
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={handleExportSummary}
                        className="w-full flex items-start gap-2.5 p-2 rounded-xl hover:bg-muted/80 text-left transition-colors cursor-pointer group"
                      >
                        <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            Resumen por Barbero (Consolidado)
                          </div>
                          <div className="text-[10.5px] text-muted-foreground leading-tight mt-0.5">
                            Promedios generales, total de insumos y estado de semáforos.
                          </div>
                        </div>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                title="Actualizar métricas en tiempo real"
                className="p-2 rounded-xl border border-border/60 bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* =========================================================================
            GRILLA DE TARJETAS: 1 SOLA TARJETA POR BARBERO
            ========================================================================= */}
        {filteredBarbers.length > 0 ? (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.08 }
              }
            }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {filteredBarbers.map((barber) => {
              const bId = barber.id_barbero;
              const isExpanded = expandedBarberIds.has(bId);
              const insumos = barber.insumos || [];

              // Configuración de estilo según el semáforo global del barbero
              const cardStatusStyle = {
                ROJO: {
                  badge: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 glow-pulse-red",
                  glow: "border-rose-500/40 shadow-md shadow-rose-500/10",
                  dot: "bg-rose-500 shadow-[0_0_10px_#F43F5E] glow-pulse-red",
                  headerBg: "from-rose-500/15 via-rose-500/5 to-transparent",
                  label: "Requiere Reposición",
                  icon: Flame
                },
                AMARILLO: {
                  badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 glow-pulse-amber",
                  glow: "border-amber-500/40 shadow-md shadow-amber-500/10",
                  dot: "bg-amber-400 shadow-[0_0_10px_#F59E0B] glow-pulse-amber",
                  headerBg: "from-amber-500/15 via-amber-500/5 to-transparent",
                  label: "Alerta Preventiva",
                  icon: AlertTriangle
                },
                VERDE: {
                  badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
                  glow: "border-emerald-500/30 shadow-md shadow-emerald-500/5",
                  dot: "bg-emerald-500 shadow-[0_0_8px_#10B981] glow-pulse-green",
                  headerBg: "from-emerald-500/10 via-emerald-500/5 to-transparent",
                  label: "Consumo Óptimo",
                  icon: CheckCircle2
                },
                VACIO: {
                  badge: "bg-muted text-muted-foreground border-border/40",
                  glow: "border-border/50",
                  dot: "bg-gray-400",
                  headerBg: "from-card to-transparent",
                  label: "Sin Insumos",
                  icon: Layers
                }
              }[barber.estadoGlobal] || {
                badge: "bg-muted text-muted-foreground border-border/40",
                glow: "border-border/50",
                dot: "bg-gray-400",
                headerBg: "from-card to-transparent",
                label: "Estación Regular",
                icon: CheckCircle2
              };

              const StatusIcon = cardStatusStyle.icon;

              // Mostrar los primeros 3 insumos por defecto si hay muchos; expandir si el usuario lo desea
              const visibleInsumos = isExpanded ? insumos : insumos.slice(0, 3);
              const hasMoreInsumos = insumos.length > 3;

              return (
                <motion.div
                  key={bId}
                  layout
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    show: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ y: -4, scale: 1.008 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className={`gold-metallic-card relative overflow-hidden rounded-3xl backdrop-blur-xl border transition-all duration-300 ${cardStatusStyle.glow} flex flex-col justify-between`}
                >
                  {/* Gradiente superior */}
                  <div
                    className={`absolute top-0 inset-x-0 h-28 bg-gradient-to-b ${cardStatusStyle.headerBg} pointer-events-none`}
                  />

                  <div className="relative p-5 sm:p-6 z-10 space-y-5">
                    {/* CABECERA DEL BARBERO */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#DFB755] to-[#B38E36] p-0.5 shadow-md flex items-center justify-center">
                            {barber.barbero_foto ? (
                              <img
                                src={barber.barbero_foto}
                                alt={barber.barbero_nombre}
                                className="w-full h-full object-cover rounded-[14px]"
                              />
                            ) : (
                              <div className="w-full h-full rounded-[14px] bg-card flex items-center justify-center text-sm font-black text-[#B38E36] dark:text-[#E8C466]">
                                {barber.barbero_nombre
                                  ? barber.barbero_nombre.substring(0, 2).toUpperCase()
                                  : "B"}
                              </div>
                            )}
                          </div>
                          <span
                            className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-card ${cardStatusStyle.dot}`}
                          />
                        </div>

                        {/* Nombre y Especialidad */}
                        <div className="min-w-0">
                          <h4 className="text-base font-black text-foreground truncate">
                            {barber.barbero_nombre}
                          </h4>
                          <p className="text-xs text-muted-foreground truncate">
                            <span className="text-[#B38E36] dark:text-[#E8C466] font-bold">
                              {barber.barbero_especialidad}
                            </span>
                            {barber.barbero_correo && <span> • {barber.barbero_correo}</span>}
                          </p>
                        </div>
                      </div>

                      {/* Badge Estado Global */}
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black border shrink-0 ${cardStatusStyle.badge}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span>{cardStatusStyle.label}</span>
                      </div>
                    </div>

                    {/* =========================================================================
                        PANEL DE MÉTRICAS CLAVE EN TIEMPO REAL CON CONTADORES DINÁMICOS
                        ========================================================================= */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-2.5 rounded-2xl bg-muted/40 dark:bg-neutral-900/40 border border-border/60 text-center">
                      {/* 1. Promedio General de Duración */}
                      <div className="p-2.5 rounded-xl bg-card/90 dark:bg-neutral-900/50 border border-border/60 hover:border-[#DFB755]/40 transition-colors flex flex-col justify-center shadow-2xs group">
                        <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                          <motion.div
                            whileHover={{ rotate: 360, scale: 1.25 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="inline-flex cursor-pointer"
                          >
                            <Clock className="w-3.5 h-3.5 text-[#E8C466]" />
                          </motion.div>
                          <span>Duración Prom.</span>
                        </div>
                        <div className="text-xl font-black text-[#B38E36] dark:text-[#E8C466] flex items-center justify-center gap-1">
                          <RollingNumber value={barber.promedioDiasGlobal} />
                          <span className="text-xs font-bold text-muted-foreground">días</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                          {barber.totalInsumosAsignados === 0
                            ? "Sin insumos"
                            : barber.totalReposicionesCompletadas > 0
                            ? "Rendimiento medido"
                            : barber.promedioDiasGlobal > 0
                            ? "Estimado barbería"
                            : "1er ciclo en curso"}
                        </span>
                      </div>

                      {/* 2. Días Promedio en Uso Activo con Pulso ECG */}
                      <div className="p-2.5 rounded-xl bg-card/90 dark:bg-neutral-900/50 border border-border/60 hover:border-cyan-500/40 transition-colors flex flex-col justify-center shadow-2xs">
                        <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                          <span className="relative flex items-center justify-center">
                            <Activity className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
                            {barber.totalInsumosAsignados > 0 && (
                              <span className="absolute w-2 h-2 rounded-full bg-cyan-400 animate-ping opacity-60" />
                            )}
                          </span>
                          <span>Uso Activo</span>
                        </div>
                        <div className="text-xl font-black text-cyan-600 dark:text-cyan-400 flex items-center justify-center gap-1">
                          <RollingNumber value={barber.diasActualPromedio} />
                          <span className="text-xs font-bold text-muted-foreground">días</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                          {barber.totalInsumosAsignados > 0 ? "Ciclo en curso" : "Sin puesto activo"}
                        </span>
                      </div>

                      {/* 3. Insumos Asignados */}
                      <div className="p-2.5 rounded-xl bg-card/90 dark:bg-neutral-900/50 border border-border/60 hover:border-emerald-500/40 transition-colors flex flex-col justify-center shadow-2xs">
                        <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                          <Package className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                          <span>Insumos</span>
                        </div>
                        <div className="text-xl font-black text-foreground">
                          <RollingNumber value={barber.totalInsumosAsignados} />
                        </div>
                        <div className="flex items-center justify-center gap-1 text-[10px] font-black mt-1">
                          {barber.totalInsumosAsignados > 0 ? (
                            <>
                              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-0.5" title="Insumos Verdes">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 glow-pulse-green" />
                                {barber.conteoVerde}
                              </span>
                              <span className="px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-0.5" title="Insumos Amarillos">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 glow-pulse-amber" />
                                {barber.conteoAmarillo}
                              </span>
                              <span className="px-1.5 py-0.5 rounded-md bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 flex items-center gap-0.5" title="Insumos Rojos">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 glow-pulse-red" />
                                {barber.conteoRojo}
                              </span>
                            </>
                          ) : (
                            <span className="text-[10px] text-muted-foreground font-semibold">
                              Sin insumos
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 4. Total Reposiciones Completadas */}
                      <div className="p-2.5 rounded-xl bg-card/90 dark:bg-neutral-900/50 border border-border/60 hover:border-purple-500/40 transition-colors flex flex-col justify-center shadow-2xs">
                        <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                          <History className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
                          <span>Reposiciones</span>
                        </div>
                        <div className="text-xl font-black text-purple-600 dark:text-purple-400">
                          <RollingNumber value={barber.totalReposicionesCompletadas} />
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                          {barber.totalReposicionesCompletadas === 1
                            ? "1 ciclo medido"
                            : `${barber.totalReposicionesCompletadas} ciclos medidos`}
                        </span>
                      </div>
                    </div>

                    {/* =========================================================================
                        DESGLOSE DE INSUMOS DE ESTE BARBERO CON BARRAS LÍQUIDAS DINÁMICAS
                        ========================================================================= */}
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-foreground flex items-center gap-1.5">
                          <BarChart3 className="w-3.5 h-3.5 text-[#E8C466]" />
                          <span>Insumos Asignados y Rendimiento Individual</span>
                        </span>
                        <span className="text-[11px] text-muted-foreground font-medium">
                          {insumos.length} {insumos.length === 1 ? "producto" : "productos"}
                        </span>
                      </div>

                      {insumos.length > 0 ? (
                        <div className="space-y-2.5">
                          <motion.div
                            variants={{
                              hidden: { opacity: 0 },
                              show: {
                                opacity: 1,
                                transition: { staggerChildren: 0.06 }
                              }
                            }}
                            initial="hidden"
                            animate="show"
                            className="space-y-2.5"
                          >
                            {visibleInsumos.map((item) => {
                              const isOver = item.isOverAvg;
                              const diff = Math.abs(item.diffFromAvg);
                              const remaining = Math.max(0, item.promedioDiasDuracion - item.diasActualEnUso);

                              const dotClass = {
                                ROJO: "bg-rose-500 glow-pulse-red",
                                AMARILLO: "bg-amber-400 glow-pulse-amber",
                                VERDE: "bg-emerald-500 glow-pulse-green"
                              }[item.estado_semaforo] || "bg-gray-400";

                              const barGradient = (item.estado_semaforo === "ROJO" || isOver)
                                ? "from-rose-500 via-rose-400 to-red-600 shadow-[0_0_10px_rgba(244,63,94,0.6)]"
                                : (item.estado_semaforo === "AMARILLO" || item.porcentajeCiclo >= 80)
                                ? "from-amber-500 via-[#E8C466] to-amber-600 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                                : "from-emerald-500 via-teal-400 to-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.4)]";

                              return (
                                <motion.div
                                  key={item.id_insumo}
                                  variants={{
                                    hidden: { opacity: 0, y: 8 },
                                    show: { opacity: 1, y: 0 }
                                  }}
                                  transition={{ duration: 0.2 }}
                                  className="p-3 rounded-2xl bg-card/90 dark:bg-neutral-900/60 border border-border/80 hover:border-[#DFB755]/50 transition-colors space-y-2 shadow-2xs"
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                                    <div className="flex items-center gap-2 min-w-0 flex-wrap">
                                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotClass}`} />
                                      <span className="text-xs font-bold text-foreground truncate">
                                        {item.insumo_nombre}
                                      </span>
                                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-muted font-semibold text-muted-foreground">
                                        {item.insumo_categoria}
                                      </span>
                                    </div>

                                    {/* Métrica: Promedio vs Actual */}
                                    <div className="flex items-center gap-2 text-xs self-start sm:self-auto shrink-0 font-medium">
                                      <span className="text-muted-foreground">
                                        Promedio:{" "}
                                        <strong className="text-[#B38E36] dark:text-[#E8C466]">
                                          {item.promedioDiasDuracion > 0 ? `${item.promedioDiasDuracion}d` : "En medición"}
                                        </strong>
                                      </span>
                                      <span>•</span>
                                      <span className="text-muted-foreground">
                                        Lleva:{" "}
                                        <strong className="text-foreground">
                                          {item.diasActualEnUso}d
                                        </strong>
                                      </span>
                                    </div>
                                  </div>

                                  {/* Barra de Progreso del Ciclo con Flujo Líquido y Shimmer */}
                                  <div className="space-y-1">
                                    <div className="relative w-full h-2 rounded-full bg-neutral-200/80 dark:bg-black/50 border border-neutral-300 dark:border-white/10 p-[1px] overflow-hidden backdrop-blur-xs">
                                      {/* Reflejo brillante de cristal superior */}
                                      <div className="absolute top-0 left-0 right-0 h-[40%] bg-gradient-to-b from-white/40 to-transparent rounded-t-full pointer-events-none z-10" />

                                      {/* Líquido animado con gradiente fluido continuo */}
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, item.porcentajeCiclo)}%` }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                        className={`h-full rounded-full bg-gradient-to-r ${barGradient} animate-liquid-flow relative overflow-hidden transition-all`}
                                      >
                                        {/* Rayo de luz en barrido constante */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent w-full pointer-events-none animate-liquid-shimmer" />
                                      </motion.div>
                                    </div>

                                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                      <span>
                                        {item.totalReposiciones > 0
                                          ? `${item.totalReposiciones} reposiciones históricas`
                                          : "Primer ciclo de uso registrado"}
                                      </span>
                                      <span
                                        className={`font-black ${
                                          isOver
                                            ? "text-rose-600 dark:text-rose-400 animate-pulse"
                                            : item.estado_semaforo === "ROJO"
                                            ? "text-rose-600 dark:text-rose-400"
                                            : item.estado_semaforo === "AMARILLO"
                                            ? "text-amber-600 dark:text-amber-400"
                                            : "text-emerald-600 dark:text-emerald-400"
                                        }`}
                                      >
                                        {isOver
                                          ? `Superó promedio (+${diff}d)`
                                          : item.estado_semaforo === "ROJO"
                                          ? "Agotado en puesto"
                                          : item.estado_semaforo === "AMARILLO"
                                          ? "Alerta por agotarse"
                                          : item.promedioDiasDuracion > 0
                                          ? `En ciclo normal (~${remaining}d restantes)`
                                          : "Ciclo inicial en progreso"}
                                      </span>
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </motion.div>

                          {/* Botón para expandir/contraer cuando hay más de 3 insumos (ideal para 20+ productos) */}
                          {hasMoreInsumos && (
                            <button
                              type="button"
                              onClick={() => toggleBarberExpanded(bId)}
                              className="w-full py-2 px-3 rounded-xl bg-card border border-border/50 hover:bg-muted text-xs font-bold text-[#B38E36] dark:text-[#E8C466] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="w-3.5 h-3.5" />
                                  <span>Mostrar menos insumos</span>
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-3.5 h-3.5" />
                                  <span>Ver todos los {insumos.length} insumos de este barbero</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="p-5 text-center rounded-2xl border border-dashed border-border/60 bg-background/40">
                          <p className="text-xs text-muted-foreground">
                            Este barbero aún no tiene insumos asignados a su puesto.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="py-14 text-center rounded-3xl border border-dashed border-border bg-card/40 space-y-2">
            <Package className="w-10 h-10 mx-auto text-muted-foreground/50" />
            <h4 className="text-sm font-bold text-foreground">
              No se encontraron barberos con los filtros seleccionados
            </h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Intenta cambiar los términos de búsqueda o el filtro de semáforo para ver las métricas.
            </p>
          </div>
        )}
      </div>

      {/* =========================================================================
          3. HISTORIAL RECIENTE DE REPOSICIONES APROBADAS (BITÁCORA)
          ========================================================================= */}
      <div className="rounded-3xl border border-border/70 bg-card/80 backdrop-blur-md p-6 shadow-xl space-y-4">
        <h3 className="text-base font-black text-foreground flex items-center gap-2">
          <History className="w-5 h-5 text-cyan-400" />
          Bitácora de Reposiciones Aprobadas
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                <th className="py-2.5 px-3">Fecha Reposición</th>
                <th className="py-2.5 px-3">Barbero</th>
                <th className="py-2.5 px-3">Insumo Entregado</th>
                <th className="py-2.5 px-3 text-center">Cant.</th>
                <th className="py-2.5 px-3 text-center">Duración Ciclo Previo</th>
                <th className="py-2.5 px-3">Observaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {history.length > 0 ? (
                history.slice(0, 10).map((h) => (
                  <tr key={h.id_historial} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-muted-foreground">
                      {new Date(h.fecha_reposicion).toLocaleString("es-CO", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-foreground">
                      {h.barbero_nombre}
                    </td>
                    <td className="py-2.5 px-3 text-foreground font-semibold">
                      {h.insumo_nombre}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-cyan-400">
                      {h.cantidad_entregada} {h.unidad_medida || ""}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full font-black text-amber-300 bg-amber-500/15 border border-amber-500/30">
                        {h.dias_duracion_anterior} días
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground italic text-[11px]">
                      {h.observaciones || "Reposición regular"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-muted-foreground">
                    Sin registros históricos aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
