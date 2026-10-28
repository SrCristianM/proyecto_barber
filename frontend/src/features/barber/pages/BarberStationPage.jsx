import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Boxes,
  Package,
  Layers,
  AlertTriangle,
  Flame,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Info,
  Clock,
  ShieldCheck,
  CheckSquare,
  Square,
  Minus,
  Plus,
  Send,
  Search,
  Filter,
  ShieldAlert,
  Check,
  ShoppingCart,
  History,
  FileSpreadsheet
} from "lucide-react";
import {
  getMyStation,
  updateStationItemStatus,
  requestRestockBatch,
  getRestockHistory
} from "../../admin/inventoryStation/services/stationService";
import { useDataSync, notifyDataChange, SYNC_ENTITIES } from "../../../shared/services/dataSyncService";
import { createNotification, dispatchNotificationUpdate } from "../../../shared/services/notificationService";
import { getCurrentUser } from "../../auth/services/authService";
import { exportToStyledExcel } from "../../../shared/utils/excelExporter";

// Helper para extraer cantidad solicitada de notas
function parseRequestedQty(notas) {
  if (!notas) return 1;
  const match = notas.match(/(?:solicitud de reposición:\s*|cantidad:\s*)(\d+)/i) ||
                notas.match(/(\d+)\s*unidad/i);
  return match && match[1] ? Math.max(1, parseInt(match[1], 10)) : 1;
}

function parseBarberCustomNote(notas) {
  if (!notas) return "";
  const match = notas.match(/\|\s*Nota:\s*(.*)$/i) || notas.match(/-\s*(.*)$/i);
  if (match && match[1]) {
    return match[1].trim();
  }
  if (!notas.toLowerCase().includes("solicitud de reposición")) {
    return notas;
  }
  return "";
}

export default function BarberStationPage() {
  const [activeTab, setActiveTab] = useState("station"); // 'station' | 'requests'
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Historial de Reposiciones Recibidas
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Estados de Selección y Cantidades para Reposición por Checkbox
  const [selectedIds, setSelectedIds] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [generalNotes, setGeneralNotes] = useState("");

  // Estados para la pestaña de Mi Inventario y Control de Estado
  const [stationQuantities, setStationQuantities] = useState({});
  const [stationStatuses, setStationStatuses] = useState({});
  const [stationNotes, setStationNotes] = useState({});
  const [updatingItemId, setUpdatingItemId] = useState(null);

  // Filtros de visualización
  const [statusFilter, setStatusFilter] = useState("ALL"); // 'ALL' | 'VERDE' | 'AMARILLO' | 'ROJO'
  const [searchTerm, setSearchTerm] = useState("");

  const loadStationData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMyStation();
      const list = Array.isArray(res) ? res : res?.data || [];
      setItems(list);

      // Inicializar cantidades de reposición y stock físico en estación
      setQuantities((prev) => {
        const next = { ...prev };
        list.forEach((item) => {
          const id = item.id_estacion_insumo || item.id_estacion_item;
          if (!next[id]) {
            next[id] = 1;
          }
        });
        return next;
      });

      setStationQuantities((prev) => {
        const next = { ...prev };
        list.forEach((item) => {
          const id = item.id_estacion_insumo || item.id_estacion_item;
          next[id] = item.cantidad_asignada !== undefined ? item.cantidad_asignada : (item.cantidad_actual !== undefined ? item.cantidad_actual : 1);
        });
        return next;
      });

      setStationStatuses((prev) => {
        const next = { ...prev };
        list.forEach((item) => {
          const id = item.id_estacion_insumo || item.id_estacion_item;
          next[id] = item.estado_semaforo || "VERDE";
        });
        return next;
      });
    } catch (err) {
      console.error("Error al cargar insumos de estación:", err);
      toast.error("No se pudieron cargar los insumos de tu estación.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadHistoryData = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const res = await getRestockHistory();
      const list = Array.isArray(res) ? res : res?.data || [];
      const user = getCurrentUser();
      const bId = user?.id_barbero || user?.id_usuario;
      const myHist = list.filter((h) => !bId || Number(h.id_barbero || h.barbero_id) === Number(bId));
      setHistory(myHist.length > 0 ? myHist : list);
    } catch (err) {
      console.warn("Error cargando historial de reposiciones:", err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadStationData();
    loadHistoryData();
  }, [loadStationData, loadHistoryData]);

  // Sincronización en vivo ante aprobaciones de bodega o cambios de puesto
  useDataSync([SYNC_ENTITIES.STATION_SUPPLIES, SYNC_ENTITIES.WAREHOUSE_ITEMS, SYNC_ENTITIES.SUPPLIES], () => {
    loadStationData();
    loadHistoryData();
  });

  // Filtrado de insumos
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const id = item.id_estacion_insumo || item.id_estacion_item;
      const matchesStatus =
        statusFilter === "ALL" || item.estado_semaforo === statusFilter;
      const matchesSearch =
        !searchTerm ||
        (item.insumo_nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.insumo_categoria || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [items, statusFilter, searchTerm]);

  // Contadores generales del semáforo
  const countRojo = items.filter((i) => i.estado_semaforo === "ROJO").length;
  const countAmarillo = items.filter((i) => i.estado_semaforo === "AMARILLO").length;
  const countVerde = items.filter((i) => i.estado_semaforo === "VERDE").length;

  // Solicitudes activas de este barbero (ROJO o AMARILLO)
  const activeRequests = useMemo(() => {
    return items.filter(
      (i) => i.estado_semaforo === "ROJO" || i.estado_semaforo === "AMARILLO"
    );
  }, [items]);

  // Manejadores de Checkboxes
  const isAllSelected =
    filteredItems.length > 0 &&
    filteredItems.every((item) =>
      selectedIds.includes(item.id_estacion_insumo || item.id_estacion_item)
    );

  const toggleSelectAll = () => {
    if (isAllSelected) {
      // Deseleccionar los visibles
      const visibleIds = new Set(
        filteredItems.map((i) => i.id_estacion_insumo || i.id_estacion_item)
      );
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.has(id)));
    } else {
      // Seleccionar todos los visibles
      const visibleIds = filteredItems.map(
        (i) => i.id_estacion_insumo || i.id_estacion_item
      );
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const toggleSelectItem = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Atajo rápido: seleccionar todos los insumos agotados o por agotarse
  const handleSelectUrgent = () => {
    const urgentIds = items
      .filter((i) => i.estado_semaforo === "ROJO" || i.estado_semaforo === "AMARILLO")
      .map((i) => i.id_estacion_insumo || i.id_estacion_item);

    setSelectedIds(urgentIds);
    if (urgentIds.length > 0) {
      toast.info(`${urgentIds.length} insumos urgentes seleccionados para reposición.`);
    } else {
      toast.success("¡Excelente! No tienes insumos en estado crítico en este momento.");
    }
  };

  // Manejo de cantidades
  const handleQuantityChange = (id, newQty, maxStock = 99) => {
    const qty = Math.max(1, Math.min(newQty, maxStock > 0 ? maxStock : 99));
    setQuantities((prev) => ({
      ...prev,
      [id]: qty
    }));
  };

  // Insumos seleccionados actualmente
  const selectedItems = useMemo(() => {
    return items.filter((i) =>
      selectedIds.includes(i.id_estacion_insumo || i.id_estacion_item)
    );
  }, [items, selectedIds]);

  const totalUnitsToRestock = useMemo(() => {
    return selectedItems.reduce((acc, item) => {
      const id = item.id_estacion_insumo || item.id_estacion_item;
      return acc + (quantities[id] || 1);
    }, 0);
  }, [selectedItems, quantities]);

  // Actualización individual de semáforo
  const handleUpdateStatus = async (idEstacionInsumo, nuevoEstado, notas = "") => {
    try {
      setIsSubmitting(true);
      const targetItem = items.find(
        (i) => (i.id_estacion_insumo || i.id_estacion_item) === idEstacionInsumo
      );
      const currentQty = stationQuantities[idEstacionInsumo] !== undefined
        ? stationQuantities[idEstacionInsumo]
        : (targetItem?.cantidad_asignada !== undefined ? targetItem.cantidad_asignada : (nuevoEstado === "ROJO" ? 0 : 1));

      await updateStationItemStatus(idEstacionInsumo, nuevoEstado, notas, currentQty);
      notifyDataChange(SYNC_ENTITIES.STATION_SUPPLIES, { id: idEstacionInsumo, status: nuevoEstado, cantidad: currentQty });

      const insumoNombre = targetItem?.insumo_nombre || "Insumo de estación";
      const user = getCurrentUser();
      const barberoNombre = user?.nombre
        ? `${user.nombre} ${user.apellido || ""}`.trim()
        : targetItem?.barbero_nombre || "Barbero";

      if (nuevoEstado === "AMARILLO") {
        toast.warning(`Alerta enviada: Notificaste que te queda poco ${insumoNombre}.`, {
          description: `La administración ya puede ver que tienes ${currentQty} ${targetItem?.unidad_medida || "uds"} en puesto.`
        });

        createNotification({
          type: "stock",
          title: `🟡 Alerta Preventiva: ${insumoNombre}`,
          description: `${barberoNombre} reporta que le queda poco ${insumoNombre} (${currentQty} ${targetItem?.unidad_medida || "uds"} en puesto).`,
          route: "/dashboard/abastecimiento",
          targetRole: [1, 2]
        });
      } else if (nuevoEstado === "ROJO") {
        toast.error("¡Reposición solicitada a bodega!", {
          description: `Se generó una solicitud prioritaria de insumo agotado (0 en puesto).`
        });

        createNotification({
          type: "stock_alert",
          title: `🔴 Solicitud de Reposición: ${insumoNombre}`,
          description: `${barberoNombre} solicita reposición urgente de ${insumoNombre} (Agotado en puesto: ${currentQty} ${targetItem?.unidad_medida || "uds"}).`,
          route: "/dashboard/abastecimiento",
          targetRole: [1, 2]
        });
      }

      dispatchNotificationUpdate();
      await loadStationData();
    } catch (err) {
      toast.error(err.message || "Error al actualizar el estado de tu estación.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejo de Cantidad y Estado en la Pestaña "Mi Inventario en Puesto"
  const handleStationQtyChange = (id, newQty) => {
    const qty = Math.max(0, Math.min(newQty, 999));
    setStationQuantities((prev) => ({
      ...prev,
      [id]: qty
    }));
  };

  const handleStationStatusSelect = (id, status) => {
    setStationStatuses((prev) => ({
      ...prev,
      [id]: status
    }));
  };

  const handleSaveStationInventory = async (item) => {
    const id = item.id_estacion_insumo || item.id_estacion_item;
    const newStatus = stationStatuses[id] || item.estado_semaforo || "VERDE";
    const newQty = stationQuantities[id] !== undefined ? stationQuantities[id] : (item.cantidad_asignada !== undefined ? item.cantidad_asignada : 1);
    const note = stationNotes[id] || "";

    try {
      setUpdatingItemId(id);
      await updateStationItemStatus(id, newStatus, note, newQty);
      notifyDataChange(SYNC_ENTITIES.STATION_SUPPLIES, { id, status: newStatus, cantidad: newQty });

      const user = getCurrentUser();
      const barberoNombre = user?.nombre
        ? `${user.nombre} ${user.apellido || ""}`.trim()
        : item.barbero_nombre || "Barbero";

      const statusLabels = {
        VERDE: "Lleno",
        AMARILLO: "Por acabarse",
        ROJO: "Agotado"
      };

      const statusIcons = {
        VERDE: "🟢",
        AMARILLO: "🟡",
        ROJO: "🔴"
      };

      createNotification({
        type: newStatus === "ROJO" ? "stock_alert" : "stock",
        title: `${statusIcons[newStatus] || "📦"} Puesto de ${barberoNombre}: ${item.insumo_nombre}`,
        description: `${barberoNombre} actualizó ${item.insumo_nombre}: Estado '${statusLabels[newStatus] || newStatus}' (${newQty} ${item.unidad_medida || "un."} en puesto).${note ? ` Observación: "${note}"` : ""}`,
        route: "/dashboard/abastecimiento",
        targetRole: [1, 2]
      });

      dispatchNotificationUpdate();

      if (newStatus === "VERDE") {
        toast.success(`Insumo actualizado: Lleno (${newQty} ${item.unidad_medida || "un."})`, {
          description: "La administración recibió tu reporte con la cantidad en puesto."
        });
      } else if (newStatus === "AMARILLO") {
        toast.warning(`Aviso enviado: Por acabarse (${newQty} ${item.unidad_medida || "un."})`, {
          description: "Se notificó preventivamente al administrador con tu cantidad física restante."
        });
      } else {
        toast.error(`Aviso urgente enviado: Agotado (${newQty} en puesto)`, {
          description: "Se generó una alerta prioritaria de insumo agotado para bodega."
        });
      }

      await loadStationData();
    } catch (err) {
      toast.error(err.message || "Error al actualizar el insumo.");
    } finally {
      setUpdatingItemId(null);
    }
  };

  // Enviar Petición de Reposición por Checkbox en Lote
  const handleSubmitBatchRestock = async () => {
    if (selectedItems.length === 0) {
      toast.warning("Selecciona al menos un insumo con el checkbox para solicitar reposición.");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = selectedItems.map((item) => {
        const id = item.id_estacion_insumo || item.id_estacion_item;
        return {
          id_estacion_insumo: id,
          cantidad: quantities[id] || 1,
          notas: `Solicita ${quantities[id] || 1} unidad(es)`
        };
      });

      await requestRestockBatch(payload, generalNotes);

      // Construir resumen para la notificación administrativa
      const user = getCurrentUser();
      const barberoNombre = user?.nombre
        ? `${user.nombre} ${user.apellido || ""}`.trim()
        : selectedItems[0]?.barbero_nombre || "Barbero";

      const summaryList = selectedItems
        .map((i) => {
          const id = i.id_estacion_insumo || i.id_estacion_item;
          return `${quantities[id] || 1}x ${i.insumo_nombre}`;
        })
        .join(", ");

      createNotification({
        type: "stock_alert",
        title: `🔴 Solicitud de Reposición (${selectedItems.length} insumos)`,
        description: `${barberoNombre} solicita reposición para su puesto: ${summaryList}.${
          generalNotes ? ` Observaciones: "${generalNotes}"` : ""
        }`,
        route: "/dashboard/abastecimiento",
        targetRole: [1, 2]
      });

      toast.success(
        `¡Solicitud de reposición enviada a bodega (${selectedItems.length} insumos, ${totalUnitsToRestock} unidades)!`,
        {
          description: "La administración recibió tu aviso y preparará la entrega desde almacén."
        }
      );

      // Limpiar selección y notas
      setSelectedIds([]);
      setGeneralNotes("");
      await loadStationData();
    } catch (err) {
      console.error("Error al enviar solicitud de reposición:", err);
      toast.error(err.message || "No se pudo enviar la solicitud de reposición.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportExcel = () => {
    if (activeTab === "station") {
      if (!filteredItems || filteredItems.length === 0) {
        toast.error("No hay insumos en tu puesto para exportar.");
        return;
      }

      exportToStyledExcel({
        title: "INVENTARIO DE INSUMOS EN MI PUESTO DE TRABAJO",
        subtitle: `Estación del Barbero | Exportado el ${new Date().toLocaleDateString("es-CO")} - Tu Turno Barber ERP`,
        sheetName: "Insumos Puesto",
        filename: "mis_insumos_puesto",
        columns: [
          { header: "ID", key: "id", type: "code", width: 75, align: "center" },
          { header: "Insumo / Producto", key: "insumo_nombre", width: 200 },
          { header: "Categoría", key: "categoria", width: 140 },
          { header: "Nivel de Consumo", key: "estado_semaforo", type: "status", width: 130, align: "center" },
          { header: "Fecha Asignación", key: "fecha_asignacion", type: "date", width: 125, align: "center" },
          { header: "Días en Uso", key: "dias_en_uso", type: "number", width: 100, align: "center" },
          { header: "Notas / Observaciones", key: "notas", width: 220 }
        ],
        data: filteredItems.map((item) => ({
          id: `#${item.id_estacion_insumo || item.id_estacion_item}`,
          insumo_nombre: item.insumo_nombre,
          categoria: item.insumo_categoria || item.categoria || "Consumible",
          estado_semaforo: item.estado_semaforo || "VERDE",
          fecha_asignacion: item.fecha_asignacion ? new Date(item.fecha_asignacion).toLocaleDateString("es-CO") : "—",
          dias_en_uso: item.fecha_asignacion ? Math.max(0, Math.floor((new Date() - new Date(item.fecha_asignacion)) / (1000 * 60 * 60 * 24))) : 0,
          notas: item.notas || "En uso normal"
        }))
      });

      toast.success("Insumos de tu puesto exportados a Excel");
    } else {
      if (!history || history.length === 0) {
        toast.error("No hay historial de reposiciones para exportar.");
        return;
      }

      exportToStyledExcel({
        title: "HISTORIAL DE REPOSICIONES Y DESPACHOS RECIBIDOS",
        subtitle: `Entregas de Insumos al Puesto | Exportado el ${new Date().toLocaleDateString("es-CO")} - Tu Turno Barber ERP`,
        sheetName: "Historial Reposiciones",
        filename: "historial_reposiciones_puesto",
        columns: [
          { header: "ID Entrega", key: "id", type: "code", width: 90, align: "center" },
          { header: "Fecha", key: "fecha", type: "date", width: 140, align: "center" },
          { header: "Insumo Entregado", key: "insumo_nombre", width: 200 },
          { header: "Cantidad", key: "cantidad", type: "number", width: 110, align: "right" },
          { header: "Unidad", key: "unidad_medida", width: 110, align: "center" },
          { header: "Estado", key: "estado", type: "status", width: 120, align: "center" },
          { header: "Observaciones", key: "observaciones", width: 240 }
        ],
        data: history.map((h) => ({
          id: `#REP-${h.id_reposicion || h.id || "0"}`,
          fecha: h.fecha_entrega ? new Date(h.fecha_entrega).toLocaleString("es-CO") : "—",
          insumo_nombre: h.insumo_nombre || "Insumo",
          cantidad: Number(h.cantidad_entregada || h.cantidad || 1),
          unidad_medida: h.unidad_medida || "Unidad",
          estado: h.estado || "Entregado",
          observaciones: h.observaciones || "Reposición completada"
        }))
      });

      toast.success("Historial de reposiciones exportado a Excel");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-16">
      {/* Cabecera del Portal Barbero */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#DFB755] dark:text-[#E8C466] uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Mi Puesto de Trabajo
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Mis Insumos y Consumibles
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
            Controla tus productos de uso diario en tiempo real con el semáforo inteligente. Marca con el checkbox los insumos que necesitas y solicita reposición a bodega en una sola pestaña.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-card border border-[#DFB755]/40 text-xs font-bold text-foreground hover:bg-muted/40 hover:text-[#DFB755] transition-all cursor-pointer shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#DFB755]" />
            <span>Exportar Excel</span>
          </button>

          <button
            type="button"
            onClick={() => loadStationData()}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border text-xs font-bold text-foreground hover:bg-muted/40 transition-all cursor-pointer shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Pestañas de Navegación del Módulo Mi Puesto */}
      <div className="flex items-center gap-2 border-b border-border/40 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("station")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "station"
              ? "bg-[#DFB755] text-black shadow-md font-black"
              : "text-muted-foreground hover:text-foreground hover:bg-card/40"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Insumos y Reposición</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            activeTab === "station" ? "bg-black/20 text-black" : "bg-muted text-muted-foreground"
          }`}>
            {items.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("my-inventory")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "my-inventory"
              ? "bg-[#DFB755] text-black shadow-md font-black"
              : "text-muted-foreground hover:text-foreground hover:bg-card/40"
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Mi Inventario y Estado</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            activeTab === "my-inventory" ? "bg-black/20 text-black" : "bg-muted text-muted-foreground"
          }`}>
            {items.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("requests");
            loadHistoryData();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "requests"
              ? "bg-[#DFB755] text-black shadow-md font-black"
              : "text-muted-foreground hover:text-foreground hover:bg-card/40"
          }`}
        >
          <History className="w-4 h-4" />
          <span>Historial y Solicitudes Activas</span>
          {activeRequests.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === "requests" ? "bg-rose-600 text-white" : "bg-rose-500/20 text-rose-400"
            } animate-pulse`}>
              {activeRequests.length} activas
            </span>
          )}
        </button>
      </div>

      {/* ========================================================
          PESTAÑA 1: INSUMOS DEL PUESTO Y SOLICITUD POR CHECKBOX
          ======================================================== */}
      {activeTab === "station" && (
        <div className="space-y-6">
          {/* Barra Informativa de Estado del Semáforo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <button
              type="button"
              onClick={() => setStatusFilter(statusFilter === "VERDE" ? "ALL" : "VERDE")}
              className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                statusFilter === "VERDE"
                  ? "bg-emerald-500/20 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  : "bg-card/70 border-border/40 hover:border-emerald-500/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_#10B981]" />
                <div>
                  <div className="text-xs font-black text-emerald-400">
                    {countVerde} Llenos / Óptimos
                  </div>
                  <div className="text-[11px] text-muted-foreground">En uso activo</div>
                </div>
              </div>
              {statusFilter === "VERDE" && (
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-md">
                  Filtro Activo
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter(statusFilter === "AMARILLO" ? "ALL" : "AMARILLO")}
              className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                statusFilter === "AMARILLO"
                  ? "bg-amber-500/20 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                  : "bg-card/70 border-border/40 hover:border-amber-500/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_10px_#F59E0B]" />
                <div>
                  <div className="text-xs font-black text-amber-400">
                    {countAmarillo} Por agotarse
                  </div>
                  <div className="text-[11px] text-muted-foreground">Aviso preventivo</div>
                </div>
              </div>
              {statusFilter === "AMARILLO" && (
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-md">
                  Filtro Activo
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter(statusFilter === "ROJO" ? "ALL" : "ROJO")}
              className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                statusFilter === "ROJO"
                  ? "bg-rose-500/20 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                  : "bg-card/70 border-border/40 hover:border-rose-500/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_#F43F5E] animate-pulse" />
                <div>
                  <div className="text-xs font-black text-rose-400">
                    {countRojo} Agotados
                  </div>
                  <div className="text-[11px] text-muted-foreground">En reposición</div>
                </div>
              </div>
              {statusFilter === "ROJO" && (
                <span className="text-[10px] font-bold text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded-md">
                  Filtro Activo
                </span>
              )}
            </button>
          </div>

          {/* Barra de Filtros, Búsqueda y Acciones Rápidas (Sin líneas negras) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card/60 p-3.5 rounded-2xl border border-border/40 backdrop-blur-md shadow-sm">
            <div className="flex flex-1 flex-wrap items-center gap-2.5">
              {/* Búsqueda por texto */}
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar insumo o categoría..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-card border border-border/40 hover:border-[#DFB755]/50 focus:border-[#DFB755] text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#DFB755]/30 transition-colors shadow-none"
                />
              </div>

              {/* Filtro de Semáforo */}
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-card border border-border/40 hover:border-[#DFB755]/50 focus:border-[#DFB755] text-xs text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-[#DFB755]/30 transition-colors shadow-none cursor-pointer"
                >
                  <option value="ALL">Todos los estados</option>
                  <option value="ROJO">🔴 Solo Agotados</option>
                  <option value="AMARILLO">🟡 Solo Por agotarse</option>
                  <option value="VERDE">🟢 Solo Llenos</option>
                </select>
              </div>
            </div>

            {/* Atajos Rápidos de Selección */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={handleSelectUrgent}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Seleccionar Urgentes ({countRojo + countAmarillo})</span>
              </button>

              {selectedIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="px-2.5 py-1.5 rounded-xl bg-muted/40 hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                >
                  Limpiar Selección
                </button>
              )}
            </div>
          </div>

      {/* TABLA DE INSUMOS DE LA ESTACIÓN (Reemplaza las tarjetas) */}
      <div className="overflow-hidden rounded-2xl bg-card/80 border border-border/70 shadow-xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider font-extrabold">
                {/* Checkbox Maestro */}
                <th className="py-3.5 px-4 w-12 text-center">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    title={isAllSelected ? "Deseleccionar todos" : "Seleccionar todos"}
                    className="p-1 rounded-md hover:bg-muted transition-colors cursor-pointer text-foreground"
                  >
                    {isAllSelected ? (
                      <CheckSquare className="w-4 h-4 text-[#DFB755]" />
                    ) : (
                      <Square className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-4">Insumo / Producto</th>
                <th className="py-3.5 px-4 text-center">En mi Puesto</th>
                <th className="py-3.5 px-4">Semáforo</th>
                <th className="py-3.5 px-4">Duración en Puesto</th>
                <th className="py-3.5 px-4">Stock en Bodega</th>
                <th className="py-3.5 px-4 w-40 text-center">Cantidad a Reponer</th>
                <th className="py-3.5 px-4 text-right">Acción Rápida</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-muted-foreground">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#DFB755]" />
                    <span>Cargando insumos de tu estación...</span>
                  </td>
                </tr>
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const id = item.id_estacion_insumo || item.id_estacion_item;
                  const isSelected = selectedIds.includes(id);
                  const days =
                    item.dias_en_estacion !== undefined
                      ? item.dias_en_estacion
                      : item.dias_en_uso || 0;
                  const bodegaStock = Number(item.stock_actual || 0);
                  const hasStock = bodegaStock > 0;
                  const currentQty = quantities[id] || 1;

                  // Configuración de estilo del semáforo
                  const semaforoConfig = {
                    VERDE: {
                      label: "Lleno (En uso)",
                      badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
                      dotClass: "bg-emerald-500 shadow-[0_0_8px_#10B981]"
                    },
                    AMARILLO: {
                      label: "Queda poco",
                      badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse",
                      dotClass: "bg-amber-400 shadow-[0_0_8px_#F59E0B]"
                    },
                    ROJO: {
                      label: "Agotado (En reposición)",
                      badgeClass: "bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse",
                      dotClass: "bg-rose-500 shadow-[0_0_8px_#F43F5E]"
                    }
                  }[item.estado_semaforo] || {
                    label: "Activo",
                    badgeClass: "bg-muted text-muted-foreground border-border",
                    dotClass: "bg-gray-400"
                  };

                  return (
                    <tr
                      key={id}
                      className={`transition-colors duration-150 ${
                        isSelected
                          ? "bg-[#DFB755]/10 border-l-4 border-l-[#DFB755]"
                          : "hover:bg-muted/30"
                      }`}
                    >
                      {/* Checkbox de fila */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => toggleSelectItem(id)}
                          className="p-1 rounded-md hover:bg-muted transition-colors cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#DFB755]" />
                          ) : (
                            <Square className="w-4 h-4 text-muted-foreground" />
                          )}
                        </button>
                      </td>

                      {/* Insumo / Categoría (Solo nombres, sin notas) */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-foreground text-sm">
                            {item.insumo_nombre || "Insumo"}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {item.insumo_categoria || "Consumible"} •{" "}
                            {item.unidad_medida || "Unidad"}
                          </span>
                        </div>
                      </td>

                      {/* En mi Puesto (Cantidad Actual en Estación) */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card border border-[#DFB755]/40 text-xs font-black text-foreground shadow-xs">
                            <Package className="w-3.5 h-3.5 text-[#DFB755]" />
                            {item.cantidad_asignada !== undefined ? item.cantidad_asignada : (item.cantidad_actual || 1)} {item.unidad_medida || "un."}
                          </span>
                          <span className="text-[10px] text-muted-foreground mt-0.5">En uso actual</span>
                        </div>
                      </td>

                      {/* Semáforo */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${semaforoConfig.badgeClass}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${semaforoConfig.dotClass}`} />
                          <span>{semaforoConfig.label}</span>
                        </div>
                      </td>

                      {/* Duración */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#DFB755]" />
                            {days === 0
                              ? "Entregado hoy"
                              : days === 1
                              ? "Hace 1 día"
                              : `Hace ${days} días`}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {item.fecha_ultima_reposicion
                              ? new Date(item.fecha_ultima_reposicion).toLocaleDateString("es-CO", {
                                  day: "2-digit",
                                  month: "short"
                                })
                              : "Sin fecha"}
                          </span>
                        </div>
                      </td>

                      {/* Stock Bodega */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span
                            className={`font-black ${
                              hasStock ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {hasStock ? `${bodegaStock} disponibles` : "Agotado en bodega"}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {hasStock ? "Listo para despacho" : "Esperando compras"}
                          </span>
                        </div>
                      </td>

                      {/* Cantidad a Reponer */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        <div className="inline-flex items-center gap-1 bg-background/80 border border-border p-1 rounded-xl shadow-inner">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(id, currentQty - 1, bodegaStock)}
                            disabled={currentQty <= 1}
                            className="w-6 h-6 flex items-center justify-center rounded-lg bg-muted/60 hover:bg-muted text-foreground disabled:opacity-30 transition-all cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={bodegaStock > 0 ? bodegaStock : 99}
                            value={currentQty}
                            onChange={(e) =>
                              handleQuantityChange(id, parseInt(e.target.value) || 1, bodegaStock)
                            }
                            className="w-10 text-center font-black text-xs bg-transparent text-foreground focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(id, currentQty + 1, bodegaStock)}
                            disabled={hasStock && currentQty >= bodegaStock}
                            className="w-6 h-6 flex items-center justify-center rounded-lg bg-muted/60 hover:bg-muted text-foreground disabled:opacity-30 transition-all cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Acciones Rápidas */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {item.estado_semaforo === "ROJO" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 font-bold text-[11px]">
                            <Flame className="w-3 h-3 text-rose-400 animate-bounce" />
                            Esperando entrega
                          </span>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            {item.estado_semaforo === "VERDE" && (
                              <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => handleUpdateStatus(id, "AMARILLO")}
                                title="Avisar que te queda la mitad o poco insumo"
                                className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-bold text-[11px] transition-all cursor-pointer"
                              >
                                🟡 Queda poco
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                if (!isSelected) toggleSelectItem(id);
                              }}
                              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-[#DFB755] text-black"
                                  : "bg-secondary hover:bg-secondary/80 text-foreground border border-border"
                              }`}
                            >
                              {isSelected ? "Seleccionado ✓" : "Reponer"}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-muted-foreground">
                    <Boxes className="w-10 h-10 mx-auto mb-2 text-muted-foreground/60" />
                    <p className="font-bold text-foreground">No se encontraron insumos</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Intenta cambiando el filtro de búsqueda o semáforo.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          PANEL DE REPOSICIÓN EN UNA SOLA PESTAÑA (SE ACTIVA AL MARCAR CHECKBOX)
          Muestra toda la información: qué va a reponer, cuáles insumos y qué cantidad
          ========================================================================= */}
      <AnimatePresence>
        {selectedItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-5 rounded-3xl bg-gradient-to-r from-card via-card/95 to-card border-2 border-[#DFB755]/50 shadow-2xl space-y-4"
          >
            {/* Encabezado del Panel */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-2xl bg-[#DFB755]/20 text-[#DFB755] border border-[#DFB755]/30">
                  <ShoppingCart className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-foreground">
                    Resumen de Reposición para tu Puesto
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Revisa los insumos y las cantidades que vas a solicitar a bodega en esta entrega:
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="px-3 py-1 rounded-full bg-[#DFB755]/15 text-[#DFB755] border border-[#DFB755]/30 text-xs font-black">
                  {selectedItems.length} insumos ({totalUnitsToRestock} unidades totales)
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="text-xs text-muted-foreground hover:text-foreground underline cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>

            {/* Chips de Insumos Seleccionados con sus Cantidades */}
            <div className="flex flex-wrap gap-2.5">
              {selectedItems.map((item) => {
                const id = item.id_estacion_insumo || item.id_estacion_item;
                const qty = quantities[id] || 1;
                const hasStock = Number(item.stock_actual || 0) >= qty;

                return (
                  <div
                    key={id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background/80 border border-border text-xs font-bold shadow-sm"
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_#F43F5E]" />
                    <span className="px-1.5 py-0.5 rounded-md bg-[#DFB755]/20 text-[#DFB755] font-black">
                      {qty}x
                    </span>
                    <span className="text-foreground">{item.insumo_nombre}</span>
                    <span
                      className={`text-[10px] ${
                        hasStock ? "text-emerald-400" : "text-rose-400 font-bold"
                      }`}
                    >
                      ({item.stock_actual || 0} en bodega)
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Campo Opcional de Observaciones y Botón de Envío */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 pt-2">
              <input
                type="text"
                placeholder="Observación opcional para el encargado de bodega (ej. Urgente para turno tarde, traer a estación 1)..."
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#DFB755]"
              />

              <button
                type="button"
                disabled={isSubmitting || selectedItems.length === 0}
                onClick={handleSubmitBatchRestock}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black text-xs font-black shadow-lg shadow-[#DDAE41]/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Enviando Solicitud...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>
                      Solicitar Reposición ({selectedItems.length} insumos • {totalUnitsToRestock} uds)
                    </span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guía Rápida Informativa */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-r from-[#DFB755]/10 via-card to-card border border-[#DFB755]/25 text-xs text-foreground">
            <Info className="w-5 h-5 text-[#DFB755] dark:text-[#E8C466] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-extrabold text-[#DFB755] dark:text-[#E8C466]">
                ¿Cómo solicitar reposición a bodega?
              </p>
              <p className="text-muted-foreground leading-relaxed text-[11px]">
                1. <strong>Marca con el checkbox</strong> cada insumo que necesites reponer.<br />
                2. Ajusta la <strong>cantidad deseada</strong> de cada uno con los botones <strong>(-)</strong> y <strong>(+)</strong>.<br />
                3. En el panel inferior que aparece en esta misma pestaña, confirma el resumen y haz clic en <strong>"Solicitar Reposición"</strong>. Bodega recibirá tu pedido inmediatamente para despacharlo.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          PESTAÑA 2: MI INVENTARIO Y ESTADO (AVISAR AL ADMINISTRADOR)
          ======================================================== */}
      {activeTab === "my-inventory" && (
        <div className="space-y-6">
          {/* Banner de Estado General del Puesto */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-card via-card/95 to-card border border-[#DFB755]/30 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <span className="p-3 rounded-2xl bg-[#DFB755]/15 text-[#DFB755] border border-[#DFB755]/30 shrink-0 mt-0.5">
                  <Boxes className="w-6 h-6" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-foreground">
                      Control de Inventario y Estado de mi Puesto
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" /> Tiempo Real
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                    Mantén actualizado tu inventario físico y avisa al administrador cómo va tu puesto. Puedes cambiar el estado a <strong>Lleno</strong>, <strong>Por acabarse</strong> o <strong>Agotado</strong> y ajustar la cantidad exacta que tienes en tu mesa de trabajo.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto">
                <button
                  type="button"
                  onClick={() => loadStationData()}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-background border border-border text-xs font-bold text-foreground hover:bg-muted/40 transition-all cursor-pointer shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  <span>Sincronizar</span>
                </button>
              </div>
            </div>

            {/* KPIs de Estado */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-border/40">
              <div className="p-3 rounded-xl bg-background/60 border border-border/60">
                <span className="text-[11px] text-muted-foreground font-semibold block">Total Insumos</span>
                <span className="text-xl font-black text-foreground">{items.length}</span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">En tu estación</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Llenos
                </span>
                <span className="text-xl font-black text-emerald-400">{countVerde}</span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">Óptimos para trabajar</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <span className="text-[11px] text-amber-300 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> Por acabarse
                </span>
                <span className="text-xl font-black text-amber-300">{countAmarillo}</span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">Aviso preventivo</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
                <span className="text-[11px] text-rose-300 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Agotados
                </span>
                <span className="text-xl font-black text-rose-300">{countRojo}</span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">Requiere reposición</span>
              </div>
            </div>
          </div>

          {/* Barra de Filtro y Búsqueda */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar insumo por nombre o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#DFB755]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {["ALL", "VERDE", "AMARILLO", "ROJO"].map((st) => {
                const labels = { ALL: "Todos", VERDE: "🟢 Llenos", AMARILLO: "🟡 Por acabarse", ROJO: "🔴 Agotados" };
                const isSelected = statusFilter === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? "bg-[#DFB755] text-black font-black shadow-xs"
                        : "bg-card border border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {labels[st]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid de Insumos para Actualización de Inventario */}
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center bg-card rounded-2xl border border-border text-muted-foreground">
              <Boxes className="w-10 h-10 mx-auto mb-2 text-muted-foreground/60" />
              <p className="font-bold text-foreground">No se encontraron insumos</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Intenta ajustando el término de búsqueda o filtro.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredItems.map((item) => {
                const id = item.id_estacion_insumo || item.id_estacion_item;
                const currentQty = stationQuantities[id] !== undefined ? stationQuantities[id] : (item.cantidad_asignada !== undefined ? item.cantidad_asignada : (item.cantidad_actual || 1));
                const currentStatus = stationStatuses[id] || item.estado_semaforo || "VERDE";
                const isUpdating = updatingItemId === id;
                const days = item.dias_en_estacion !== undefined ? item.dias_en_estacion : (item.dias_en_uso || 0);

                const semaforoConfig = {
                  VERDE: {
                    label: "Lleno (En uso)",
                    badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
                    dotClass: "bg-emerald-500 shadow-[0_0_8px_#10B981]"
                  },
                  AMARILLO: {
                    label: "Por acabarse (Queda poco)",
                    badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/40",
                    dotClass: "bg-amber-400 shadow-[0_0_8px_#F59E0B]"
                  },
                  ROJO: {
                    label: "Agotado (Sin existencias)",
                    badgeClass: "bg-rose-500/20 text-rose-300 border-rose-500/50",
                    dotClass: "bg-rose-500 shadow-[0_0_8px_#F43F5E]"
                  }
                }[currentStatus] || {
                  label: "Lleno",
                  badgeClass: "bg-muted text-muted-foreground border-border",
                  dotClass: "bg-gray-400"
                };

                return (
                  <div
                    key={id}
                    className="p-5 rounded-2xl bg-card border border-border/70 hover:border-[#DFB755]/40 transition-all shadow-xs space-y-4"
                  >
                    {/* Encabezado del Insumo */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#DFB755]">
                            {item.insumo_categoria || "Consumible"}
                          </span>
                          <span className="text-[10px] text-muted-foreground">•</span>
                          <span className="text-[11px] text-muted-foreground font-medium">
                            {item.unidad_medida || "Unidad"}
                          </span>
                        </div>
                        <h4 className="text-base font-black text-foreground mt-0.5">
                          {item.insumo_nombre}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#DFB755]" />
                            {days === 0 ? "Repuesto hoy" : `En uso hace ${days} días`}
                          </span>
                          <span>•</span>
                          <span>Bodega central: <strong className="text-foreground">{item.stock_actual || 0} disponibles</strong></span>
                        </div>
                      </div>

                      {/* Badge Estado Actual */}
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span className="text-[11px] text-muted-foreground">Estado reportado:</span>
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${semaforoConfig.badgeClass}`}>
                          <span className={`w-2 h-2 rounded-full ${semaforoConfig.dotClass}`} />
                          <span>{semaforoConfig.label}</span>
                        </div>
                      </div>
                    </div>

                    {/* Controles de Cantidad y Selección de Estado */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                      {/* Cantidad Física Actual (5 cols) */}
                      <div className="md:col-span-5 space-y-1.5">
                        <label className="block text-xs font-bold text-foreground">
                          Cantidad física que tengo actualmente en puesto:
                        </label>
                        <div className="flex items-center gap-2.5">
                          <div className="inline-flex items-center gap-1 bg-background border border-border p-1 rounded-xl shadow-inner">
                            <button
                              type="button"
                              onClick={() => handleStationQtyChange(id, currentQty - 1)}
                              disabled={currentQty <= 0}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-muted/60 hover:bg-muted text-foreground disabled:opacity-30 transition-all cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <input
                              type="number"
                              min="0"
                              max="999"
                              value={currentQty}
                              onChange={(e) => handleStationQtyChange(id, parseInt(e.target.value) || 0)}
                              className="w-14 text-center font-black text-sm bg-transparent text-foreground focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleStationQtyChange(id, currentQty + 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-muted/60 hover:bg-muted text-foreground transition-all cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="text-xs font-black text-foreground">
                            {item.unidad_medida || "unidades"}
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground block">
                          {currentQty === 0
                            ? "Marcado sin existencias en puesto (0)."
                            : `Tienes ${currentQty} ${item.unidad_medida || "unidades"} físicas.`}
                        </span>
                      </div>

                      {/* Selector de Estado: Lleno - Por acabarse - Agotado (7 cols) */}
                      <div className="md:col-span-7 space-y-1.5">
                        <label className="block text-xs font-bold text-foreground">
                          Reportar estado al Administrador:
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {/* 1. Lleno */}
                          <button
                            type="button"
                            onClick={() => {
                              handleStationStatusSelect(id, "VERDE");
                              if (currentQty === 0) handleStationQtyChange(id, 1);
                            }}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                              currentStatus === "VERDE"
                                ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-black shadow-[0_0_12px_rgba(16,185,129,0.25)] ring-2 ring-emerald-500/50"
                                : "bg-background/60 border-border hover:bg-muted/40 text-muted-foreground"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 text-xs font-black">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10B981]" />
                              Lleno
                            </div>
                            <span className="text-[10px] opacity-80 mt-1">En uso óptimo</span>
                          </button>

                          {/* 2. Por acabarse */}
                          <button
                            type="button"
                            onClick={() => handleStationStatusSelect(id, "AMARILLO")}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                              currentStatus === "AMARILLO"
                                ? "bg-amber-500/20 border-amber-500 text-amber-300 font-black shadow-[0_0_12px_rgba(245,158,11,0.25)] ring-2 ring-amber-500/50 animate-pulse"
                                : "bg-background/60 border-border hover:bg-muted/40 text-muted-foreground"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 text-xs font-black">
                              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#F59E0B]" />
                              Por acabarse
                            </div>
                            <span className="text-[10px] opacity-80 mt-1">Queda poco</span>
                          </button>

                          {/* 3. Agotado */}
                          <button
                            type="button"
                            onClick={() => {
                              handleStationStatusSelect(id, "ROJO");
                              handleStationQtyChange(id, 0);
                            }}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                              currentStatus === "ROJO"
                                ? "bg-rose-500/20 border-rose-500 text-rose-300 font-black shadow-[0_0_12px_rgba(244,63,94,0.25)] ring-2 ring-rose-500/50 animate-pulse"
                                : "bg-background/60 border-border hover:bg-muted/40 text-muted-foreground"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 text-xs font-black">
                              <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_#F43F5E]" />
                              Agotado
                            </div>
                            <span className="text-[10px] opacity-80 mt-1">Necesita reposición</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Observación y Botón de Envío */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2 border-t border-border/40">
                      <input
                        type="text"
                        placeholder="Nota u observación para el administrador (ej: frasco averiado, queda menos de 1/3)..."
                        value={stationNotes[id] || ""}
                        onChange={(e) => setStationNotes((prev) => ({ ...prev, [id]: e.target.value }))}
                        className="flex-1 px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#DFB755]"
                      />

                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleSaveStationInventory(item)}
                        className="px-4 py-2.5 rounded-xl bg-[#DFB755] hover:bg-[#DFB755]/90 text-black font-extrabold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                      >
                        {isUpdating ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Guardando...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Actualizar y Avisar al Admin</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          PESTAÑA 3: HISTORIAL Y SOLICITUDES ACTIVAS
          ======================================================== */}
      {activeTab === "requests" && (
        <div className="space-y-6">
          {/* Métricas rápidas de solicitudes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-2xl bg-card/70 border border-border/40 flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground font-semibold">Solicitudes Activas</span>
                <div className="text-2xl font-black text-foreground mt-0.5">
                  {activeRequests.length}
                </div>
                <span className="text-[11px] text-rose-400 font-bold">
                  {activeRequests.filter((r) => r.estado_semaforo === "ROJO").length} Agotados •{" "}
                  {activeRequests.filter((r) => r.estado_semaforo === "AMARILLO").length} Por agotarse
                </span>
              </div>
              <span className="p-3 rounded-xl bg-rose-500/15 text-rose-400">
                <Flame className="w-5 h-5" />
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-card/70 border border-border/40 flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground font-semibold">Reposiciones Recibidas</span>
                <div className="text-2xl font-black text-[#DFB755] mt-0.5">
                  {history.length}
                </div>
                <span className="text-[11px] text-muted-foreground">
                  Entregas registradas en historial
                </span>
              </div>
              <span className="p-3 rounded-xl bg-[#DFB755]/15 text-[#DFB755]">
                <Package className="w-5 h-5" />
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-card/70 border border-border/40 flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground font-semibold">Sincronización</span>
                <div className="text-xs font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]" />
                  En línea con Bodega
                </div>
                <button
                  type="button"
                  onClick={loadHistoryData}
                  disabled={loadingHistory}
                  className="mt-2 text-[11px] text-[#DFB755] hover:underline flex items-center gap-1 font-bold cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingHistory ? "animate-spin" : ""}`} />
                  Actualizar Datos
                </button>
              </div>
              <span className="p-3 rounded-xl bg-emerald-500/15 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </span>
            </div>
          </div>

          {/* SECCIÓN 1: SOLICITUDES ACTIVAS ACTUALMENTE */}
          <div className="overflow-hidden rounded-2xl bg-card/80 border border-border/40 shadow-xl backdrop-blur-md">
            <div className="p-4 sm:p-5 border-b border-border/40 flex items-center justify-between gap-3 bg-muted/20">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-rose-500/15 text-rose-400">
                  <Flame className="w-5 h-5 animate-pulse" />
                </span>
                <div>
                  <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                    Solicitudes Activas de Reposición
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-400">
                      {activeRequests.length} en espera
                    </span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Insumos de tu puesto que has marcado en semáforo amarillo o rojo y están pendientes de despacho por bodega.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5">
              {activeRequests.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
                  <p className="font-extrabold text-foreground text-sm">
                    ¡No tienes solicitudes activas pendientes!
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                    Todos los insumos de tu puesto de trabajo se encuentran actualmente en nivel óptimo (verde). Cuando necesites insumos, selecciónalos en la pestaña "Insumos de mi Puesto".
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/40 bg-muted/30 text-muted-foreground uppercase text-[10px] tracking-wider font-extrabold">
                        <th className="py-3 px-4">Insumo</th>
                        <th className="py-3 px-4">Estado Semáforo</th>
                        <th className="py-3 px-4 text-center">Cantidad Solicitada</th>
                        <th className="py-3 px-4">Stock en Bodega</th>
                        <th className="py-3 px-4">Nota / Mensaje</th>
                        <th className="py-3 px-4 text-right">Estado del Trámite</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {activeRequests.map((item) => {
                        const id = item.id_estacion_insumo || item.id_estacion_item;
                        const reqQty = parseRequestedQty(item.notas);
                        const customNote = parseBarberCustomNote(item.notas);
                        const bodegaStock = Number(item.stock_actual || 0);
                        const isRojo = item.estado_semaforo === "ROJO";

                        return (
                          <tr key={id} className="hover:bg-muted/20 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="font-extrabold text-foreground text-sm">
                                {item.insumo_nombre}
                              </div>
                              <div className="text-[11px] text-muted-foreground">
                                {item.insumo_categoria || "Consumible"} • {item.unidad_medida || "Unidad"}
                              </div>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                                  isRojo
                                    ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                                    : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                }`}
                              >
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    isRojo ? "bg-rose-500 shadow-[0_0_8px_#F43F5E]" : "bg-amber-400"
                                  }`}
                                />
                                <span>{isRojo ? "Agotado (Rojo)" : "Queda Poco (Amarillo)"}</span>
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              <span className="inline-flex items-center px-3 py-1 rounded-xl bg-[#DFB755]/15 border border-[#DFB755]/30 text-[#DFB755] font-black text-xs">
                                {reqQty} {item.unidad_medida || "unidad(es)"}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span
                                className={`font-bold ${
                                  bodegaStock > 0 ? "text-emerald-400" : "text-rose-400"
                                }`}
                              >
                                {bodegaStock > 0
                                  ? `${bodegaStock} disponibles`
                                  : "0 (Sin stock en bodega)"}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 max-w-xs">
                              {customNote ? (
                                <span className="text-xs text-foreground italic bg-muted/40 px-2.5 py-1 rounded-lg inline-block border border-border/30">
                                  💬 "{customNote}"
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  Sin notas adicionales
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[11px] font-bold">
                                <Clock className="w-3.5 h-3.5 animate-spin" />
                                Esperando Despacho
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* SECCIÓN 2: HISTORIAL DE REPOSICIONES RECIBIDAS */}
          <div className="overflow-hidden rounded-2xl bg-card/80 border border-border/40 shadow-xl backdrop-blur-md">
            <div className="p-4 sm:p-5 border-b border-border/40 flex items-center justify-between gap-3 bg-muted/20">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-[#DFB755]/15 text-[#DFB755]">
                  <History className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-black text-foreground">
                    Historial de Reposiciones Recibidas
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Registro de todas las entregas que se han completado y despachado a tu estación de trabajo.
                  </p>
                </div>
              </div>

              <span className="text-xs text-muted-foreground font-semibold">
                Total: {history.length} entregas
              </span>
            </div>

            <div className="p-4 sm:p-5">
              {loadingHistory ? (
                <div className="py-12 text-center text-muted-foreground">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#DFB755]" />
                  <span>Cargando historial de entregas...</span>
                </div>
              ) : history.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground">
                  <Boxes className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="font-bold text-foreground">No hay reposiciones en el historial</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    A medida que bodega o el administrador aprueben tus solicitudes de insumos, aparecerán registradas aquí.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/40 bg-muted/30 text-muted-foreground uppercase text-[10px] tracking-wider font-extrabold">
                        <th className="py-3 px-4">Fecha y Hora</th>
                        <th className="py-3 px-4">Insumo Entregado</th>
                        <th className="py-3 px-4 text-center">Cantidad Recibida</th>
                        <th className="py-3 px-4">Duración Anterior</th>
                        <th className="py-3 px-4">Observaciones / Detalles</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {history.map((record) => {
                        const recDate = record.fecha_reposicion
                          ? new Date(record.fecha_reposicion).toLocaleString("es-CO", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })
                          : "Fecha no disponible";

                        return (
                          <tr
                            key={record.id_historial || `${record.id_insumo}-${record.fecha_reposicion}`}
                            className="hover:bg-muted/20 transition-colors"
                          >
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="font-bold text-foreground flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-[#DFB755]" />
                                {recDate}
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="font-extrabold text-foreground text-sm">
                                {record.insumo_nombre || "Insumo"}
                              </div>
                              <div className="text-[11px] text-muted-foreground">
                                {record.insumo_categoria || "Consumible"}
                              </div>
                            </td>

                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              <span className="inline-flex items-center px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-black text-xs">
                                +{record.cantidad_entregada || 1} {record.unidad_medida || "uds"}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="text-xs text-foreground font-semibold">
                                {record.dias_duracion_anterior !== null &&
                                record.dias_duracion_anterior !== undefined
                                  ? `${record.dias_duracion_anterior} días de duración`
                                  : "Entrega Inicial"}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 max-w-sm">
                              <span className="text-xs text-muted-foreground">
                                {record.observaciones || "Reposición aprobada por administración"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
