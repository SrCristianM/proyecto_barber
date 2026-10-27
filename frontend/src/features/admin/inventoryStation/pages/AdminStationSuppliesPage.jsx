import { useState, useMemo } from "react";
import { useSearchParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Boxes,
  Package,
  Layers,
  AlertTriangle,
  Plus,
  Truck,
  TrendingUp,
  History,
  Search,
  Filter,
  User,
  CheckCircle2,
  RefreshCw,
  Building2,
  DollarSign,
  LayoutGrid,
  Table2,
  MessageCircle,
  FileSpreadsheet,
  Eye,
  Ban
} from "lucide-react";
import { useStationSupplies } from "../hooks/useStationSupplies";
import BarberStationCard from "../components/BarberStationCard";
import StationSuppliesTableView from "../components/StationSuppliesTableView";
import StationItemCard from "../components/StationItemCard";
import WarehouseStockTable from "../components/WarehouseStockTable";
import RestockConfirmModal from "../components/RestockConfirmModal";
import StockEntryModal from "../components/StockEntryModal";
import AssignStationItemModal from "../components/AssignStationItemModal";
import WarehouseItemModal from "../components/WarehouseItemModal";
import StationMetricsView from "../components/StationMetricsView";
import SuppliesPage from "../../supplies/pages/SuppliesPage";
import WhatsAppOrderModal from "../components/WhatsAppOrderModal";
import StockEntryDetailsModal from "../components/StockEntryDetailsModal";
import CancelStockEntryModal from "../components/CancelStockEntryModal";
import WarehouseMovementsHistoryView from "../components/WarehouseMovementsHistoryView";
import WarehouseMovementDetailsModal from "../components/WarehouseMovementDetailsModal";
import { VintageSprayRestockEffect, WarehouseAuditStampEffect } from "../../../../shared/components/animations";
import { fireGoldenConfetti } from "../../../../shared/utils/confettiHelper";
import { exportToStyledExcel } from "../../../../shared/utils/excelExporter";


export default function AdminStationSuppliesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const validTabs = ["stations", "warehouse", "entries", "supplies", "metrics"];
  const [activeTab, setActiveTabState] = useState(
    validTabs.includes(tabFromUrl) ? tabFromUrl : "stations"
  );

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("tab", tab);
      return next;
    }, { replace: true });
  };

  const {
    stations,
    urgentAlerts,
    warehouseItems,
    lowStockWarehouseItems,
    suppliers,
    barbers,
    metrics,
    history,
    stockEntries,
    warehouseMovements,
    loading,
    isSubmitting,
    refresh,

    // Filtros
    barberFilter,
    setBarberFilter,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,

    // Modales
    showAssignModal,
    setShowAssignModal,
    showStockEntryModal,
    setShowStockEntryModal,
    showWarehouseModal,
    setShowWarehouseModal,
    showRestockConfirmModal,
    setShowRestockConfirmModal,
    selectedStationItem,
    setSelectedStationItem,
    selectedWarehouseItem,
    setSelectedWarehouseItem,

    // Acciones
    handleUpdateStatus,
    handleApproveRestock,
    handleAssignItem,
    handleRemoveStationItem,
    handleRegisterStockEntry,
    handleCancelStockEntry,
    handleSaveWarehouseItem,
    handleDeleteWarehouseItem
  } = useStationSupplies();

  const [viewMode, setViewMode] = useState("cards"); // 'cards' (1 tarjeta por barbero) | 'table' (tabla detallada)
  const [preselectedBarberId, setPreselectedBarberId] = useState(null);
  const [showWhatsAppOrderModal, setShowWhatsAppOrderModal] = useState(false);
  const [selectedStockEntryForDetails, setSelectedStockEntryForDetails] = useState(null);
  const [selectedStockEntryForCancel, setSelectedStockEntryForCancel] = useState(null);
  const [warehouseSubTab, setWarehouseSubTab] = useState("inventory"); // 'inventory' | 'movements'
  const [selectedMovementInsumoId, setSelectedMovementInsumoId] = useState("all");
  const [selectedMovementForDetails, setSelectedMovementForDetails] = useState(null);
  const [sprayEffectData, setSprayEffectData] = useState(null);
  const [auditStampData, setAuditStampData] = useState(null);

  // Lista unificada de todos los barberos registrados en el sistema
  const allBarbers = useMemo(() => {
    const map = new Map();

    // 1. Barberos registrados oficialmente desde la API / BD
    (barbers || []).forEach((b) => {
      const bId = Number(b.id_barbero);
      map.set(bId, {
        id_barbero: bId,
        nombre: b.nombre && b.apellido ? `${b.nombre} ${b.apellido}`.trim() : (b.nombre || `Barbero ${bId}`),
        especialidad: b.especialidad || "Estación de Trabajo",
        foto: b.foto || b.imagen_url || null,
        correo: b.correo || ""
      });
    });

    // 2. Barberos que ya tienen asignaciones en estaciones
    (stations || []).forEach((s) => {
      const bId = Number(s.id_barbero || s.barbero_id);
      if (bId && !map.has(bId)) {
        map.set(bId, {
          id_barbero: bId,
          nombre: s.barbero_nombre || `Barbero ${bId}`,
          especialidad: s.barbero_especialidad || "Estación de Trabajo",
          foto: null,
          correo: ""
        });
      }
    });

    return Array.from(map.values());
  }, [barbers, stations]);

  // Agrupación de insumos por barbero: EXACTAMENTE UNA TARJETA POR BARBERO
  const barberStations = useMemo(() => {
    // Si hay un filtro específico de barbero seleccionado, limitamos a ese barbero
    const targetBarbers = barberFilter !== "all"
      ? allBarbers.filter((b) => Number(b.id_barbero) === Number(barberFilter))
      : allBarbers;

    return targetBarbers
      .map((b) => {
        const bId = Number(b.id_barbero);
        const bItems = stations.filter(
          (s) => Number(s.id_barbero || s.barbero_id) === bId
        );
        return {
          ...b,
          items: bItems
        };
      })
      .filter((b) => {
        // Filtrar por semáforo si está seleccionado
        if (statusFilter !== "all") {
          return b.items.some((i) => i.estado_semaforo === statusFilter);
        }
        // Filtrar por búsqueda si hay texto ingresado
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          const matchBarber = (b.nombre || "").toLowerCase().includes(term);
          const matchInsumo = b.items.some((i) =>
            (i.insumo_nombre || "").toLowerCase().includes(term)
          );
          if (!matchBarber && !matchInsumo) return false;
        }
        return true;
      });
  }, [allBarbers, stations, barberFilter, statusFilter, searchTerm]);

  // Manejador del botón "Aprobar Reposición"
  const handleOpenRestockModal = (stationItem, qty = null) => {
    setSelectedStationItem(qty ? { ...stationItem, requestedQty: qty } : stationItem);
    setShowRestockConfirmModal(true);
  };

  // Manejador de "Reponer Todo" o selección múltiple para un barbero específico
  const handleApproveAllRestocks = async (barber, urgentItems) => {
    if (!urgentItems || urgentItems.length === 0) return;
    try {
      // 1. Validar existencias de todos los insumos solicitados
      const outOfStock = urgentItems.filter((item) => {
        const match = item.notas?.match(/(?:solicitud de reposición:\s*|cantidad:\s*)(\d+)/i) || item.notas?.match(/(\d+)\s*unidad/i);
        const qty = match ? Math.max(1, parseInt(match[1], 10)) : 1;
        return Number(item.stock_actual || 0) < qty;
      });

      if (outOfStock.length > 0) {
        toast.error(
          `Stock insuficiente en almacén para: ${outOfStock.map((i) => i.insumo_nombre).join(", ")}. Por favor cargue mercancía.`
        );
        return;
      }

      // 2. Ejecutar aprobación secuencial de cada insumo solicitado
      for (const item of urgentItems) {
        const match = item.notas?.match(/(?:solicitud de reposición:\s*|cantidad:\s*)(\d+)/i) || item.notas?.match(/(\d+)\s*unidad/i);
        const qty = match ? Math.max(1, parseInt(match[1], 10)) : 1;
        await handleApproveRestock(item, qty, `Despacho de reposición aprobado para ${barber.nombre}`);
      }

      setSprayEffectData({ barberName: barber.nombre, itemCount: urgentItems.length });
      fireGoldenConfetti();
      toast.success(
        `¡Reposición Completada! Se despacharon ${urgentItems.length} insumos a la estación de ${barber.nombre}.`
      );
    } catch (err) {
      toast.error(err.message || "Error al procesar la reposición total");
    }
  };

  const handleExportStations = () => {
    if (!stations || stations.length === 0) {
      toast.error("No hay insumos asignados en las estaciones para exportar.");
      return;
    }

    exportToStyledExcel({
      title: "ESTADO DE INSUMOS ASIGNADOS A PUESTOS DE TRABAJO",
      subtitle: `Monitoreo de semáforos y reposición de barberos | Exportado el ${new Date().toLocaleDateString("es-CO")} - Tu Turno Barber ERP`,
      sheetName: "Insumos en Puestos",
      filename: "insumos_puestos_trabajo",
      columns: [
        { header: "ID Asignación", key: "id", type: "code", width: 90, align: "center" },
        { header: "Barbero", key: "barbero_nombre", width: 180 },
        { header: "Estación / Puesto", key: "puesto_nombre", width: 140, align: "center" },
        { header: "Insumo / Producto", key: "insumo_nombre", width: 190 },
        { header: "Semáforo", key: "estado_semaforo", type: "status", width: 120, align: "center" },
        { header: "Fecha Asignación", key: "fecha_asignacion", type: "date", width: 125, align: "center" },
        { header: "Días en Uso", key: "dias_en_uso", type: "number", width: 100, align: "center" },
        { header: "Notas / Observaciones", key: "notas", width: 220 }
      ],
      data: stations.map((s) => ({
        id: `#${s.id_estacion_insumo}`,
        barbero_nombre: s.barbero_nombre || "Sin asignar",
        puesto_nombre: `Estación #${s.id_barbero || "—"}`,
        insumo_nombre: s.insumo_nombre || "Insumo General",
        estado_semaforo: s.estado_semaforo || "VERDE",
        fecha_asignacion: s.fecha_asignacion ? new Date(s.fecha_asignacion).toLocaleDateString("es-CO") : "—",
        dias_en_uso: s.fecha_asignacion ? Math.max(0, Math.floor((new Date() - new Date(s.fecha_asignacion)) / (1000 * 60 * 60 * 24))) : 0,
        notas: s.notas || "En uso normal"
      }))
    });

    toast.success("Insumos de estaciones exportados a Excel");
  };

  const handleExportStockEntries = () => {
    if (!stockEntries || stockEntries.length === 0) {
      toast.error("No hay registros de cargas de mercancía para exportar.");
      return;
    }

    exportToStyledExcel({
      title: "HISTORIAL DE CARGAS DE MERCANCÍA A BODEGA",
      subtitle: `Registro de ingresos de insumos desde proveedores | Exportado el ${new Date().toLocaleDateString("es-CO")} - Tu Turno Barber ERP`,
      sheetName: "Cargas Mercancía",
      filename: "cargas_mercancia_insumos",
      columns: [
        { header: "ID Entrada", key: "id_entrada", type: "code", width: 95, align: "center" },
        { header: "Fecha y Hora", key: "fecha", type: "date", width: 150, align: "center" },
        { header: "Insumo", key: "insumo_nombre", width: 200 },
        { header: "Proveedor", key: "proveedor_nombre", width: 180 },
        { header: "Cantidad Ingresada", key: "cantidad_ingresada", type: "number", width: 135, align: "right" },
        { header: "Unidad", key: "unidad_medida", width: 110, align: "center" },
        { header: "Costo Unitario", key: "costo_unitario", type: "currency", width: 130, align: "right" },
        { header: "Total Inversión", key: "total_inversion", type: "currency", width: 140, align: "right" },
        { header: "Estado", key: "estado_texto", width: 110, align: "center" },
        { header: "Observaciones", key: "observaciones", width: 220 },
        { header: "Fecha Anulación", key: "fecha_anulacion", width: 150, align: "center" },
        { header: "Motivo Anulación", key: "motivo_anulacion", width: 250 }
      ],
      data: stockEntries.map((e) => ({
        id_entrada: `#ENT-${String(e.id_entrada).padStart(4, "0")}`,
        fecha: new Date(e.fecha_ingreso).toLocaleString("es-CO", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }),
        insumo_nombre: e.insumo_nombre,
        proveedor_nombre: e.proveedor_nombre || "General",
        cantidad_ingresada: Number(e.cantidad_ingresada || 0),
        unidad_medida: e.unidad_medida || "Unidad",
        costo_unitario: Number(e.costo_unitario || 0),
        total_inversion: Number(e.cantidad_ingresada || 0) * Number(e.costo_unitario || 0),
        estado_texto: Number(e.estado) === 0 ? "ANULADA" : "ACTIVA",
        observaciones: e.observaciones || "Ingreso a bodega",
        fecha_anulacion: e.fecha_anulacion
          ? new Date(e.fecha_anulacion).toLocaleString("es-CO", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })
          : "N/A",
        motivo_anulacion: e.motivo_anulacion || "N/A"
      }))
    });

    toast.success("Historial de cargas de mercancía exportado a Excel");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Encabezado del Módulo */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#DFB755] dark:text-[#E8C466] uppercase tracking-wider mb-1">
            <Boxes className="w-4 h-4" /> Módulo de Abastecimiento
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Módulo de Abastecimiento
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
            Control integral de insumos: puestos de trabajo y semáforos, bodega central, entradas de mercancía y vales de despacho a barberos.
          </p>
        </div>

        {/* Acciones Rápidas Globales */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => refresh()}
            title="Refrescar datos en vivo"
            className="p-2.5 rounded-xl border border-border/80 bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => setShowWhatsAppOrderModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer shadow-xs"
            title="Generar orden de compra y enviar por WhatsApp al proveedor"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Pedido a Proveedor</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedWarehouseItem(null);
              setShowStockEntryModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-all cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            <span>Cargar Mercancía</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAssignModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-white text-xs font-black shadow-lg shadow-[#DDAE41]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Asignar a Estación</span>
          </button>
        </div>
      </div>

      {/* Alerta Destacada si hay insumos en ROJO o AMARILLO */}
      {urgentAlerts.length > 0 && activeTab === "stations" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
        >
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <h4 className="text-sm font-extrabold text-foreground">
                {urgentAlerts.length} Insumos requieren atención inmediata en estaciones
              </h4>
              <p className="text-xs text-muted-foreground">
                Hay puestos con insumos agotados o por agotarse esperando reposición de bodega.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStatusFilter("ROJO")}
            className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all cursor-pointer self-start sm:self-auto"
          >
            Ver Solo Urgentes ({urgentAlerts.filter((a) => a.estado_semaforo === "ROJO").length})
          </button>
        </motion.div>
      )}

      {/* Pestañas de Navegación del Módulo */}
      <div className="flex items-center gap-1.5 border-b border-border/60 overflow-x-auto pb-1 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("stations")}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold rounded-t-xl transition-all cursor-pointer shrink-0 border-b-2 ${activeTab === "stations"
            ? "border-[#E8C466] text-[#E8C466] bg-card/60"
            : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
        >
          <Layers className="w-4 h-4" />
          <span>Puestos y Semáforos</span>
          {urgentAlerts.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
              {urgentAlerts.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("warehouse")}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold rounded-t-xl transition-all cursor-pointer shrink-0 border-b-2 ${activeTab === "warehouse"
            ? "border-[#E8C466] text-[#E8C466] bg-card/60"
            : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
        >
          <Package className="w-4 h-4" />
          <span>Bodega Central</span>
          {lowStockWarehouseItems.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-black">
              {lowStockWarehouseItems.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("entries")}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold rounded-t-xl transition-all cursor-pointer shrink-0 border-b-2 ${activeTab === "entries"
            ? "border-[#E8C466] text-[#E8C466] bg-card/60"
            : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
        >
          <Truck className="w-4 h-4" />
          <span>Entradas de Mercancía ({stockEntries.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("supplies")}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold rounded-t-xl transition-all cursor-pointer shrink-0 border-b-2 ${activeTab === "supplies"
            ? "border-[#E8C466] text-[#E8C466] bg-card/60"
            : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Vales de Despacho</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("metrics")}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold rounded-t-xl transition-all cursor-pointer shrink-0 border-b-2 ${activeTab === "metrics"
            ? "border-[#E8C466] text-[#E8C466] bg-card/60"
            : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Métricas y Consumo</span>
        </button>
      </div>

      {/* CONTENIDO DE LA PESTAÑA: ESTACIONES Y SEMÁFOROS */}
      {activeTab === "stations" && (
        <div className="space-y-5">
          {/* Barra de Filtros: Barbero, Estado, Búsqueda y Selector de Modo de Vista */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-card/60 p-4 rounded-2xl border border-border/40 shadow-sm backdrop-blur-md">
            <div className="flex flex-1 flex-wrap items-center gap-2.5">
              {/* Filtro de Barbero */}
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#E8C466]" />
                <select
                  value={barberFilter}
                  onChange={(e) => setBarberFilter(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-card border border-border/40 hover:border-[#DFB755]/50 focus:border-[#DFB755] text-xs text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-[#DFB755]/30 transition-colors shadow-none cursor-pointer"
                >
                  <option value="all">Todos los barberos ({allBarbers.length})</option>
                  {allBarbers.map((b) => (
                    <option key={b.id_barbero} value={b.id_barbero}>
                      {b.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro de Semáforo */}
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-card border border-border/40 hover:border-[#DFB755]/50 focus:border-[#DFB755] text-xs text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-[#DFB755]/30 transition-colors shadow-none cursor-pointer"
                >
                  <option value="all">Todos los estados</option>
                  <option value="ROJO">🔴 Solo ROJO (Agotados / Reposición)</option>
                  <option value="AMARILLO">🟡 Solo AMARILLO (Por agotarse)</option>
                  <option value="VERDE">🟢 Solo VERDE (Llenos / Óptimos)</option>
                </select>
              </div>

              {/* Búsqueda por texto */}
              <div className="relative flex-1 min-w-[180px] max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar insumo o barbero..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-card border border-border/40 hover:border-[#DFB755]/50 focus:border-[#DFB755] text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#DFB755]/30 transition-colors shadow-none"
                />
              </div>
            </div>

            {/* Selector de Modo de Vista (Tarjetas por Barbero vs Tabla) + Contador */}
            <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-border/30">
              <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
                {viewMode === "cards" ? (
                  <>Mostrando <strong className="text-foreground">{barberStations.length}</strong> puestos de barbero</>
                ) : (
                  <>Mostrando <strong className="text-foreground">{stations.length}</strong> insumos en puestos</>
                )}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportStations}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/40 bg-card hover:bg-muted text-foreground text-xs font-semibold transition-colors cursor-pointer"
                  title="Exportar listado de insumos asignados a puestos de trabajo"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#DFB755]" />
                  <span className="hidden sm:inline">Exportar Excel</span>
                </button>

                <div className="flex items-center gap-1 p-1 rounded-xl bg-card border border-border/40 shadow-none">
                  <button
                    type="button"
                    onClick={() => setViewMode("cards")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${viewMode === "cards"
                      ? "bg-gradient-to-r from-[#E8C466] to-[#DDAE41] text-black shadow-sm font-black"
                      : "text-muted-foreground hover:text-foreground"
                      }`}
                    title="Una tarjeta por barbero con resumen de semáforos y solicitudes"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Tarjetas</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode("table")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${viewMode === "table"
                      ? "bg-gradient-to-r from-[#E8C466] to-[#DDAE41] text-black shadow-sm font-black"
                      : "text-muted-foreground hover:text-foreground"
                      }`}
                    title="Vista de tabla con todos los insumos y detalles"
                  >
                    <Table2 className="w-3.5 h-3.5" />
                    <span>Tabla</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* MODO VISTA: TARJETAS (1 SOLA TARJETA POR BARBERO) */}
          {viewMode === "cards" && (
            <>
              {barberStations.length > 0 ? (
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
                  <AnimatePresence>
                    {barberStations.map((barber) => (
                      <BarberStationCard
                        key={barber.id_barbero}
                        barber={barber}
                        onApproveRestock={handleOpenRestockModal}
                        onApproveAllRestocks={handleApproveAllRestocks}
                        onApproveMultipleRestocks={handleApproveAllRestocks}
                        onRemoveItem={handleRemoveStationItem}
                        onAssignItemToBarber={(barberId) => {
                          setPreselectedBarberId(barberId);
                          setShowAssignModal(true);
                        }}
                        isSubmitting={isSubmitting}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card/30">
                  <Boxes className="w-10 h-10 mx-auto text-muted-foreground/60 mb-3" />
                  <h3 className="text-sm font-bold text-foreground">No se encontraron barberos ni puestos</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    No hay barberos o insumos que coincidan con los filtros aplicados.
                  </p>
                </div>
              )}
            </>
          )}

          {/* MODO VISTA: TABLA DETALLADA DE INSUMOS */}
          {viewMode === "table" && (
            <StationSuppliesTableView
              stations={stations}
              onApproveRestock={handleOpenRestockModal}
              onRemoveItem={handleRemoveStationItem}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      )}

      {/* CONTENIDO DE LA PESTAÑA: BODEGA GENERAL */}
      {activeTab === "warehouse" && (
        <div className="space-y-4">
          {/* Sub-navegación dentro de Bodega General */}
          <div className="flex items-center justify-between flex-wrap gap-3 pb-1 border-b border-border/40">
            <div className="flex items-center gap-2 p-1 rounded-2xl bg-card/60 border border-border/60">
              <button
                type="button"
                onClick={() => setWarehouseSubTab("inventory")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  warehouseSubTab === "inventory"
                    ? "bg-[#DFB755] text-black shadow-md shadow-[#DFB755]/20 font-black"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Existencias y Catálogo ({warehouseItems.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setWarehouseSubTab("movements");
                  setSelectedMovementInsumoId("all");
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  warehouseSubTab === "movements"
                    ? "bg-[#DFB755] text-black shadow-md shadow-[#DFB755]/20 font-black"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Historial de Ajustes ({warehouseMovements.length})</span>
              </button>
            </div>

            <div className="text-xs text-muted-foreground font-medium">
              {warehouseSubTab === "inventory"
                ? "Catálogo de insumos y existencias en tiempo real"
                : "Auditoría completa de cargos y descargos manuales"}
            </div>
          </div>

          {warehouseSubTab === "inventory" ? (
            <WarehouseStockTable
              warehouseItems={warehouseItems}
              onOpenStockEntry={(item) => {
                setSelectedWarehouseItem(item);
                setShowStockEntryModal(true);
              }}
              onEditItem={(item) => {
                setSelectedWarehouseItem(item);
                setShowWarehouseModal(true);
              }}
              onViewMovements={(item) => {
                setSelectedMovementInsumoId(item.id_insumo);
                setWarehouseSubTab("movements");
              }}
              onDeleteItem={handleDeleteWarehouseItem}
              onNewItem={() => {
                setSelectedWarehouseItem(null);
                setShowWarehouseModal(true);
              }}
              isSubmitting={isSubmitting}
            />
          ) : (
            <WarehouseMovementsHistoryView
              movements={warehouseMovements}
              warehouseItems={warehouseItems}
              initialInsumoId={selectedMovementInsumoId}
              onSelectMovement={(m) => setSelectedMovementForDetails(m)}
            />
          )}
        </div>
      )}

      {/* CONTENIDO DE LA PESTAÑA: ENTRADAS DE MERCANCÍA */}
      {activeTab === "entries" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-card/60 p-4 rounded-2xl border border-border/60">
            <div>
              <h3 className="text-sm font-black text-foreground">Historial de Cargas de Mercancía</h3>
              <p className="text-xs text-muted-foreground">Registro de compras ingresadas desde proveedores al almacén general.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportStockEntries}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-card hover:bg-muted text-foreground border border-border/60 text-xs font-semibold transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#DFB755]" />
                <span>Exportar Excel</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedWarehouseItem(null);
                  setShowStockEntryModal(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-all cursor-pointer"
              >
                <Truck className="w-4 h-4" />
                <span>Registrar Nueva Carga</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card/80 backdrop-blur-md shadow-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border/80 bg-muted/40 text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                  <th className="py-3 px-4 whitespace-nowrap">Fecha de Ingreso</th>
                  <th className="py-3 px-4 min-w-[160px]">Insumo</th>
                  <th className="py-3 px-4 min-w-[120px]">Proveedor</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">Cantidad Ingresada</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Costo Unitario</th>
                  <th className="py-3 px-4 min-w-[150px]">Observaciones</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">Estado</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {stockEntries.length > 0 ? (
                  stockEntries.map((entry) => {
                    const isAnulada = Number(entry.estado) === 0;

                    return (
                      <tr
                        key={entry.id_entrada}
                        className={`transition-colors ${
                          isAnulada
                            ? "bg-rose-500/[0.03] hover:bg-rose-500/[0.07]"
                            : "hover:bg-muted/30"
                        }`}
                      >
                        <td className="py-3 px-4 text-muted-foreground font-medium whitespace-nowrap">
                          {new Date(entry.fecha_ingreso).toLocaleString("es-CO", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </td>
                        <td className="py-3 px-4 font-bold text-foreground">
                          {entry.insumo_nombre}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                          {entry.proveedor_nombre}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="inline-flex items-center justify-center">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap shadow-xs transition-colors ${
                                isAnulada
                                  ? "bg-rose-500/10 text-rose-400 border-rose-500/25"
                                  : "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
                              }`}
                              title={`${entry.cantidad_ingresada} ${entry.unidad_medida || "unidades"}`}
                            >
                              <span className={`font-black ${isAnulada ? "line-through text-rose-300" : "text-cyan-300"}`}>
                                +{entry.cantidad_ingresada}
                              </span>
                              <span className={`text-[11px] font-medium opacity-90 ${isAnulada ? "line-through text-rose-400/80" : "text-cyan-400"}`}>
                                {entry.unidad_medida || "unidades"}
                              </span>
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-emerald-400 whitespace-nowrap">
                          ${Number(entry.costo_unitario || 0).toLocaleString("es-CO")}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground italic text-[11px] max-w-xs truncate">
                          {entry.observaciones || "Ingreso registrado"}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                              isAnulada
                                ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                                : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            }`}
                          >
                            {isAnulada ? (
                              <>
                                <Ban className="w-2.5 h-2.5" />
                                Anulada
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                Activa
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Ver Detalles */}
                            <button
                              type="button"
                              onClick={() => setSelectedStockEntryForDetails(entry)}
                              className="p-1.5 rounded-lg bg-card hover:bg-muted text-muted-foreground hover:text-cyan-400 border border-border/60 hover:border-cyan-500/30 transition-all cursor-pointer shadow-xs"
                              title="Ver detalles completos de la entrada"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Anular Entrada */}
                            <button
                              type="button"
                              disabled={isAnulada}
                              onClick={() => setSelectedStockEntryForCancel(entry)}
                              className={`p-1.5 rounded-lg border transition-all shadow-xs ${
                                isAnulada
                                  ? "opacity-30 cursor-not-allowed border-border/40 text-muted-foreground bg-transparent"
                                  : "bg-card hover:bg-rose-500/15 text-muted-foreground hover:text-rose-400 border-border/60 hover:border-rose-500/40 cursor-pointer"
                              }`}
                              title={isAnulada ? "Esta entrada ya está anulada" : "Anular entrada de mercancía"}
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      No hay registros de entradas de mercancía aún.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* CONTENIDO DE LA PESTAÑA: VALES DE DESPACHO */}
      {activeTab === "supplies" && (
        <SuppliesPage embedded={true} />
      )}

      {/* CONTENIDO DE LA PESTAÑA: MÉTRICAS Y RENDIMIENTO */}
      {activeTab === "metrics" && (
        <StationMetricsView
          metrics={metrics}
          history={history}
          stations={stations}
          barbers={allBarbers}
          onRefresh={refresh}
        />
      )}

      {/* MODALES DEL SISTEMA */}
      <RestockConfirmModal
        isOpen={showRestockConfirmModal}
        onClose={() => {
          setShowRestockConfirmModal(false);
          setSelectedStationItem(null);
        }}
        stationItem={selectedStationItem}
        onConfirm={async (item, qty, notas) => {
          const res = await handleApproveRestock(item, qty, notas);
          setSprayEffectData({
            barberName: item?.barbero_nombre || "Barbero",
            itemCount: qty || 1
          });
          return res;
        }}
        isSubmitting={isSubmitting}
      />

      <StockEntryModal
        isOpen={showStockEntryModal}
        onClose={() => {
          setShowStockEntryModal(false);
          setSelectedWarehouseItem(null);
        }}
        warehouseItems={warehouseItems}
        suppliers={suppliers}
        selectedItem={selectedWarehouseItem}
        onSave={handleRegisterStockEntry}
        isSubmitting={isSubmitting}
      />

      <AssignStationItemModal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setPreselectedBarberId(null);
        }}
        warehouseItems={warehouseItems}
        barbers={allBarbers}
        initialBarberId={preselectedBarberId}
        onSave={async (payload) => {
          await handleAssignItem(payload);
          setPreselectedBarberId(null);
        }}
        isSubmitting={isSubmitting}
      />

      <WarehouseItemModal
        isOpen={showWarehouseModal}
        onClose={() => {
          setShowWarehouseModal(false);
          setSelectedWarehouseItem(null);
        }}
        item={selectedWarehouseItem}
        suppliers={suppliers}
        onSave={async (payload) => {
          const ok = await handleSaveWarehouseItem(payload);
          if (ok && payload.tipo_movimiento) {
            setAuditStampData({
              ...payload,
              stock_anterior: selectedWarehouseItem?.stock_actual ?? 0,
              unidad_medida: selectedWarehouseItem?.unidad_medida || "uds",
              categoria: payload.categoria || selectedWarehouseItem?.categoria,
              proveedor_nombre: suppliers.find((s) => s.id_proveedor === Number(payload.id_proveedor))?.nombre || "Proveedor",
              costo_unitario: payload.costo_unitario || selectedWarehouseItem?.costo_unitario
            });
          }
        }}
        isSubmitting={isSubmitting}
      />

      {/* MODAL PEDIDO A PROVEEDOR POR WHATSAPP */}
      <WhatsAppOrderModal
        isOpen={showWhatsAppOrderModal}
        onClose={() => setShowWhatsAppOrderModal(false)}
        warehouseItems={warehouseItems}
        suppliers={suppliers}
        lowStockItems={lowStockWarehouseItems}
      />

      {/* MODAL DETALLES DE ENTRADA DE MERCANCÍA */}
      <StockEntryDetailsModal
        isOpen={!!selectedStockEntryForDetails}
        onClose={() => setSelectedStockEntryForDetails(null)}
        entry={selectedStockEntryForDetails}
        onOpenCancel={(entry) => setSelectedStockEntryForCancel(entry)}
      />

      {/* MODAL ANULAR ENTRADA DE MERCANCÍA */}
      <CancelStockEntryModal
        isOpen={!!selectedStockEntryForCancel}
        onClose={() => setSelectedStockEntryForCancel(null)}
        entry={selectedStockEntryForCancel}
        onConfirm={async (idEntrada, motivo) => {
          await handleCancelStockEntry(idEntrada, motivo);
          setSelectedStockEntryForCancel(null);
        }}
        isSubmitting={isSubmitting}
      />

      {/* MODAL DETALLES DE AJUSTE / MOVIMIENTO DE BODEGA */}
      <WarehouseMovementDetailsModal
        isOpen={!!selectedMovementForDetails}
        onClose={() => setSelectedMovementForDetails(null)}
        movement={selectedMovementForDetails}
      />

      {/* ANIMACIÓN: ATOMIZADOR VINTAGE PARA REPOSICIONES */}
      <VintageSprayRestockEffect
        isOpen={!!sprayEffectData}
        onClose={() => setSprayEffectData(null)}
        barberName={sprayEffectData?.barberName}
        itemCount={sprayEffectData?.itemCount}
      />

      {/* ANIMACIÓN: SELLO DE AUDITORÍA PARA AJUSTES DE BODEGA */}
      <WarehouseAuditStampEffect
        isOpen={!!auditStampData}
        onClose={() => setAuditStampData(null)}
        data={auditStampData}
      />
    </div>
  );
}

