import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import {
  getAllStations,
  getWarehouseItems,
  getStationSuppliers,
  getPerformanceMetrics,
  getRestockHistory,
  approveRestock,
  updateStationItemStatus,
  assignStationItem,
  removeStationItem,
  createWarehouseItem,
  updateWarehouseItem,
  deleteWarehouseItem,
  registerStockEntry,
  getStockEntries,
  cancelStockEntry,
  getWarehouseMovements
} from "../services/stationService.js";

import { useDataSync, SYNC_ENTITIES } from "../../../../shared/services/dataSyncService";

import { getBarbers } from "../../barbers/services/barbersService.js";

export function useStationSupplies(initialBarberId = "all") {
  const [stations, setStations] = useState([]);
  const [warehouseItems, setWarehouseItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [history, setHistory] = useState([]);
  const [stockEntries, setStockEntries] = useState([]);
  const [warehouseMovements, setWarehouseMovements] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Filtros
  const [barberFilter, setBarberFilter] = useState(initialBarberId);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modales
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStockEntryModal, setShowStockEntryModal] = useState(false);
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const [showRestockConfirmModal, setShowRestockConfirmModal] = useState(false);
  const [selectedStationItem, setSelectedStationItem] = useState(null);
  const [selectedWarehouseItem, setSelectedWarehouseItem] = useState(null);

  // Carga general de datos con tolerancia a fallos
  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [stationsRes, warehouseRes, suppliersRes, metricsRes, histRes, entriesRes, barbersRes, movementsRes] = await Promise.all([
        getAllStations({ barberId: barberFilter, status: statusFilter, search: searchTerm }).catch((e) => {
          console.warn("Error cargando estaciones:", e);
          return [];
        }),
        getWarehouseItems({ categoria: categoryFilter }).catch((e) => {
          console.warn("Error cargando bodega:", e);
          return [];
        }),
        getStationSuppliers().catch(() => []),
        getPerformanceMetrics(barberFilter !== "all" ? barberFilter : null).catch(() => null),
        getRestockHistory({ barberId: barberFilter }).catch(() => []),
        getStockEntries({ limit: 50 }).catch(() => []),
        getBarbers().catch(() => []),
        getWarehouseMovements({ limit: 150 }).catch(() => [])
      ]);

      setStations(Array.isArray(stationsRes) ? stationsRes : stationsRes?.data || []);
      setWarehouseItems(Array.isArray(warehouseRes) ? warehouseRes : warehouseRes?.data || []);
      setSuppliers(Array.isArray(suppliersRes) ? suppliersRes : suppliersRes?.data || []);
      setMetrics(metricsRes?.data || metricsRes || null);
      setHistory(Array.isArray(histRes) ? histRes : histRes?.data || []);
      setStockEntries(Array.isArray(entriesRes) ? entriesRes : entriesRes?.data || []);
      setBarbers(Array.isArray(barbersRes) ? barbersRes : barbersRes?.data || []);
      setWarehouseMovements(Array.isArray(movementsRes) ? movementsRes : movementsRes?.data || []);
    } catch (err) {
      console.error("Error al cargar datos del módulo de estaciones y bodega:", err);
      setError(err.message || "Error al sincronizar datos");
    } finally {
      setLoading(false);
    }
  }, [barberFilter, statusFilter, searchTerm, categoryFilter]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Sincronización reactiva en tiempo real ante eventos globales
  useDataSync([SYNC_ENTITIES.STATION_SUPPLIES, SYNC_ENTITIES.WAREHOUSE_ITEMS, SYNC_ENTITIES.SUPPLIERS], () => {
    loadAllData();
  });

  // ==========================================
  // ACCIONES SEMÁFORO Y REPOSICIÓN
  // ==========================================
  const handleUpdateStatus = async (idEstacionInsumo, nuevoEstado, notas = "") => {
    try {
      setIsSubmitting(true);
      await updateStationItemStatus(idEstacionInsumo, nuevoEstado, notas);
      toast.success(`Estado actualizado a ${nuevoEstado}`);
      await loadAllData();
      return true;
    } catch (err) {
      toast.error(err.message || "No se pudo actualizar el estado del semáforo");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveRestock = async (stationItem, cantidad = 1, observaciones = "") => {
    try {
      setIsSubmitting(true);
      const res = await approveRestock(
        stationItem.id_estacion_insumo || stationItem.id_estacion_item,
        cantidad,
        observaciones
      );
      toast.success(
        `¡Reposición Aprobada! Stock descontado de bodega y semáforo reiniciado a VERDE para ${stationItem.barbero_nombre || "el barbero"}.`
      );
      setShowRestockConfirmModal(false);
      setSelectedStationItem(null);
      await loadAllData();
      return res;
    } catch (err) {
      toast.error(err.message || "Error al aprobar la reposición en bodega");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignItem = async (payload) => {
    try {
      setIsSubmitting(true);
      await assignStationItem(payload);
      toast.success("Insumo asignado exitosamente a la estación del barbero");
      setShowAssignModal(false);
      await loadAllData();
      return true;
    } catch (err) {
      toast.error(err.message || "No se pudo asignar el insumo a la estación");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveStationItem = async (idEstacionInsumo) => {
    try {
      setIsSubmitting(true);
      await removeStationItem(idEstacionInsumo);
      toast.success("Insumo retirado de la estación");
      await loadAllData();
      return true;
    } catch (err) {
      toast.error(err.message || "Error al retirar el insumo");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // ACCIONES BODEGA Y ENTRADAS DE PROVEEDOR
  // ==========================================
  const handleRegisterStockEntry = async (entryData) => {
    try {
      setIsSubmitting(true);
      const res = await registerStockEntry(entryData);
      toast.success(`Entrada registrada. Stock en bodega incrementado correctamente (+${entryData.cantidad_ingresada})`);
      setShowStockEntryModal(false);
      await loadAllData();
      return res;
    } catch (err) {
      toast.error(err.message || "Error al ingresar mercancía del proveedor");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveWarehouseItem = async (itemData) => {
    try {
      setIsSubmitting(true);
      if (itemData.id_insumo) {
        await updateWarehouseItem(itemData.id_insumo, itemData);
        toast.success("Insumo de bodega actualizado exitosamente");
      } else {
        await createWarehouseItem(itemData);
        toast.success("Nuevo insumo agregado al catálogo de bodega general");
      }
      setShowWarehouseModal(false);
      setSelectedWarehouseItem(null);
      await loadAllData();
      return true;
    } catch (err) {
      toast.error(err.message || "Error al guardar insumo en bodega");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWarehouseItem = async (idInsumo) => {
    try {
      setIsSubmitting(true);
      await deleteWarehouseItem(idInsumo);
      toast.success("Insumo retirado del inventario de bodega");
      await loadAllData();
      return true;
    } catch (err) {
      toast.error(err.message || "Error al eliminar insumo");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Listas ordenadas y filtradas
  const priorityStationItems = useMemo(() => {
    return [...stations].sort((a, b) => {
      const priority = { ROJO: 0, AMARILLO: 1, VERDE: 2 };
      const diff = (priority[a.estado_semaforo] ?? 3) - (priority[b.estado_semaforo] ?? 3);
      if (diff !== 0) return diff;
      return (b.dias_en_estacion || b.dias_en_uso || 0) - (a.dias_en_estacion || a.dias_en_uso || 0);
    });
  }, [stations]);

  const urgentAlerts = useMemo(() => {
    return stations.filter((s) => s.estado_semaforo === "ROJO" || s.estado_semaforo === "AMARILLO");
  }, [stations]);

  const lowStockWarehouseItems = useMemo(() => {
    return warehouseItems.filter((w) => Number(w.stock_actual) <= Number(w.stock_minimo));
  }, [warehouseItems]);

  const handleCancelStockEntry = async (idEntrada, motivo) => {
    try {
      setIsSubmitting(true);
      const res = await cancelStockEntry(idEntrada, motivo);
      toast.success("Entrada de mercancía anulada correctamente. Stock revertido en bodega general.");
      await loadAllData();
      return res;
    } catch (err) {
      toast.error(err.message || "Error al anular la entrada de mercancía");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    stations: priorityStationItems,
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
    error,
    refresh: loadAllData,

    // Filtros
    barberFilter,
    setBarberFilter,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,

    // Modales y selección
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

    // Métodos ejecutables
    handleUpdateStatus,
    handleApproveRestock,
    handleAssignItem,
    handleRemoveStationItem,
    handleRegisterStockEntry,
    handleCancelStockEntry,
    handleSaveWarehouseItem,
    handleDeleteWarehouseItem
  };

}
