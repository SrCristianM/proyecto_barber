import { useState, useEffect, useCallback, useMemo } from "react";
import { getSupplies, createSupply, cancelSupply, getSuppliesMetrics } from "../services/suppliesService.js";
import { apiRequest } from "../../../../shared/api/apiClient.js";
import { getCurrentUser } from "../../../auth/services/authService.js";
import { notifyDataChange, useDataSync, SYNC_ENTITIES } from "../../../../shared/services/dataSyncService";
import { dispatchNotificationUpdate } from "../../../../shared/services/notificationService";

export function useSupplies() {
  const [supplies, setSupplies] = useState(() => {
    try {
      const stored = localStorage.getItem("barber_supplies_db");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [barbers, setBarbers] = useState(() => {
    try {
      const stored = localStorage.getItem("barber_barbers_db");
      return stored ? JSON.parse(stored) : [
        { id_barbero: 1, id_usuario: 4, nombre: "Carlos", apellido: "Rodríguez", especialidad: "Corte Clásico & Fade" }
      ];
    } catch {
      return [];
    }
  });

  const [products, setProducts] = useState(() => {
    try {
      const stored = localStorage.getItem("barber_warehouse_supplies_cache");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [barberFilter, setBarberFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortField, setSortField] = useState("fecha");
  const [sortDir, setSortDir] = useState("desc");
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'cards'

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedSupply, setSelectedSupply] = useState(null);

  // Formulario de despacho
  const currentUser = useMemo(() => getCurrentUser() || { id_usuario: 1, nombre: "Admin", apellido: "Barber" }, []);
  const initialFormData = useMemo(() => ({
    id_barbero: "",
    id_usuario: currentUser.id_usuario,
    observaciones: "",
    detalles: []
  }), [currentUser]);

  const [formData, setFormData] = useState(initialFormData);

  // Métricas avanzadas para la pestaña de Análisis y Dashboard
  const [metrics, setMetrics] = useState(null);
  const [metricsPeriod, setMetricsPeriod] = useState("week"); // 'week' | 'month' | 'all'
  const [metricsBarber, setMetricsBarber] = useState("all");
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  // Carga inicial y sondeo
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Cargar abastecimientos
      const suppliesRes = await getSupplies({
        barberId: barberFilter,
        status: statusFilter,
        startDate,
        endDate
      });

      const suppliesList = Array.isArray(suppliesRes)
        ? suppliesRes
        : (Array.isArray(suppliesRes?.data) ? suppliesRes.data : []);

      setSupplies(suppliesList);
      try {
        localStorage.setItem("barber_supplies_db", JSON.stringify(suppliesList));
      } catch {}

      // 2. Cargar barberos si no están en memoria
      apiRequest("/api/barbers")
        .then((data) => {
          const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
          if (list.length > 0) {
            setBarbers(list);
            try {
              localStorage.setItem("barber_barbers_db", JSON.stringify(list));
            } catch {}
          }
        })
        .catch(() => {});

      // 3. Cargar catálogo EXCLUSIVO de insumos de bodega general (insumo_bodega)
      apiRequest("/api/inventory-stations/warehouse")
        .then((data) => {
          const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
          if (list && list.length > 0) {
            const mapped = list.map((item) => ({
              ...item,
              id_producto: item.id_insumo,
              id_insumo: item.id_insumo,
              nombre: item.nombre,
              presentacion: item.unidad_medida || item.categoria || "",
              categoria: item.categoria || "Insumo",
              stock: Number(item.stock_actual ?? 0),
              stock_actual: Number(item.stock_actual ?? 0),
              precio: Number(item.costo_unitario ?? 0),
              costo_unitario: Number(item.costo_unitario ?? 0),
              unidad_medida: item.unidad_medida || "Unidad",
              estado: item.estado ?? 1
            }));
            setProducts(mapped);
            try {
              localStorage.setItem("barber_warehouse_supplies_cache", JSON.stringify(mapped));
            } catch {}
          }
        })
        .catch(() => {});
    } catch (err) {
      setError(err.message || "Error al cargar abastecimientos");
    } finally {
      setLoading(false);
    }
  }, [barberFilter, statusFilter, startDate, endDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Cargar métricas
  const fetchMetrics = useCallback(async (period = metricsPeriod, barberId = metricsBarber) => {
    try {
      setLoadingMetrics(true);
      const res = await getSuppliesMetrics({ period, barberId });
      const metricsData = (res && typeof res === "object" && "data" in res) ? res.data : res;
      if (metricsData) {
        setMetrics(metricsData);
      }
    } catch {
      // Ignorar fallback
    } finally {
      setLoadingMetrics(false);
    }
  }, [metricsPeriod, metricsBarber]);

  useEffect(() => {
    fetchMetrics(metricsPeriod, metricsBarber);
  }, [fetchMetrics, metricsPeriod, metricsBarber]);

  // Helpers de Carrito / Detalle de Insumos
  const addItemToSupply = (product, quantity = 1) => {
    if (!product) return;
    const rawId = product.id_insumo || product.id_producto;
    const qty = Number(quantity) || 1;
    const unitPrice = Number(product.costo_unitario ?? product.precio ?? product.precio_unitario ?? 0);
    const availableStock = Number(product.stock_actual ?? product.stock ?? 999);

    setFormData((prev) => {
      const existingIdx = prev.detalles.findIndex(
        (d) => Number(d.id_producto) === Number(rawId) || Number(d.id_insumo) === Number(rawId)
      );
      let updated = [...prev.detalles];

      if (existingIdx >= 0) {
        const currentQty = updated[existingIdx].cantidad;
        const newQty = Math.min(currentQty + qty, availableStock);
        updated[existingIdx] = {
          ...updated[existingIdx],
          cantidad: newQty,
          subtotal: newQty * unitPrice
        };
      } else {
        const initialQty = Math.min(qty, availableStock);
        updated.push({
          id_producto: rawId,
          id_insumo: rawId,
          nombre: product.nombre,
          presentacion: product.unidad_medida || product.presentacion || "",
          unidad_medida: product.unidad_medida || "Unidad",
          categoria: product.categoria || "Insumo",
          marca: product.categoria || product.marca || "Bodega",
          stockMax: availableStock,
          precio_unitario: unitPrice,
          cantidad: initialQty,
          subtotal: initialQty * unitPrice
        });
      }

      return { ...prev, detalles: updated };
    });
  };

  const updateItemQuantity = (idProducto, newQty) => {
    const qty = Math.max(1, Number(newQty) || 1);
    setFormData((prev) => {
      const updated = prev.detalles.map((item) => {
        if (item.id_producto === idProducto) {
          const clampedQty = item.stockMax !== undefined ? Math.min(qty, item.stockMax) : qty;
          return {
            ...item,
            cantidad: clampedQty,
            subtotal: clampedQty * item.precio_unitario
          };
        }
        return item;
      });
      return { ...prev, detalles: updated };
    });
  };

  const removeItemFromSupply = (idProducto) => {
    setFormData((prev) => ({
      ...prev,
      detalles: prev.detalles.filter((d) => d.id_producto !== idProducto)
    }));
  };

  const resetForm = () => {
    setFormData({
      id_barbero: "",
      id_usuario: currentUser.id_usuario,
      observaciones: "",
      detalles: []
    });
  };

  // Recarga automática de insumos de bodega cuando se modifiquen desde cualquier módulo
  const reloadProducts = useCallback(async () => {
    try {
      const data = await apiRequest("/api/inventory-stations/warehouse");
      const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      if (list && list.length > 0) {
        const mapped = list.map((item) => ({
          ...item,
          id_producto: item.id_insumo,
          id_insumo: item.id_insumo,
          nombre: item.nombre,
          presentacion: item.unidad_medida || item.categoria || "",
          categoria: item.categoria || "Insumo",
          stock: Number(item.stock_actual ?? 0),
          stock_actual: Number(item.stock_actual ?? 0),
          precio: Number(item.costo_unitario ?? 0),
          costo_unitario: Number(item.costo_unitario ?? 0),
          unidad_medida: item.unidad_medida || "Unidad",
          estado: item.estado ?? 1
        }));
        setProducts(mapped);
        try {
          localStorage.setItem("barber_warehouse_supplies_cache", JSON.stringify(mapped));
        } catch {}
      }
    } catch {}
  }, []);

  // Sincronización en tiempo real: al aprobar reposiciones o registrar despachos, recargar vales, métricas y bodega
  useDataSync([SYNC_ENTITIES.SUPPLIES, SYNC_ENTITIES.STATION_SUPPLIES, SYNC_ENTITIES.WAREHOUSE_ITEMS], () => {
    loadData();
    fetchMetrics(metricsPeriod, metricsBarber);
    reloadProducts();
  });

  // Mutación: Crear Abastecimiento (Descontar stock en todo el proyecto)
  const handleCreateSupply = async () => {
    try {
      setLoading(true);
      const res = await createSupply(formData);
      const newSupply = (res && typeof res === "object" && "data" in res) ? res.data : res;
      if (newSupply && (newSupply.id_abastecimiento || newSupply.id)) {
        setSupplies((prev) => [newSupply, ...prev]);

        // Guardar lista actualizada en localStorage
        try {
          const rawStored = localStorage.getItem("barber_supplies_db");
          const currentList = rawStored ? JSON.parse(rawStored) : supplies;
          localStorage.setItem(
            "barber_supplies_db",
            JSON.stringify([newSupply, ...currentList.filter((s) => s.id_abastecimiento !== newSupply.id_abastecimiento)])
          );
        } catch {}

        // 1. Descontar inmediatamente en memoria y en localStorage para reflejo instantáneo
        let updatedProds = [];
        try {
          const rawStored = localStorage.getItem("barber_products_db");
          const currentList = rawStored ? JSON.parse(rawStored) : products;
          updatedProds = currentList.map((prod) => {
            const used = (formData.detalles || []).find((d) => Number(d.id_producto) === Number(prod.id_producto));
            if (used) {
              const currentStock = Number(prod.stock ?? 0);
              const deduct = Number(used.cantidad ?? 0);
              return { ...prod, stock: Math.max(0, currentStock - deduct) };
            }
            return prod;
          });
          setProducts(updatedProds);
          localStorage.setItem("barber_products_db", JSON.stringify(updatedProds));
        } catch {
          updatedProds = products.map((prod) => {
            const used = (formData.detalles || []).find((d) => Number(d.id_producto) === Number(prod.id_producto));
            if (used) {
              return { ...prod, stock: Math.max(0, Number(prod.stock || 0) - Number(used.cantidad)) };
            }
            return prod;
          });
          setProducts(updatedProds);
        }

        // 2. Traer la versión definitiva desde la bodega general
        reloadProducts();

        // 3. Notificar a todos los módulos que escuchan cambios en insumos, estaciones y bodega general
        notifyDataChange(SYNC_ENTITIES.SUPPLIES, newSupply);
        notifyDataChange(SYNC_ENTITIES.STATION_SUPPLIES, newSupply);
        notifyDataChange(SYNC_ENTITIES.WAREHOUSE_ITEMS, newSupply);
        notifyDataChange(SYNC_ENTITIES.PRODUCTS, { source: "supplies_dispatch", supply: newSupply });
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new CustomEvent("barber_products_updated", { detail: updatedProds }));
        dispatchNotificationUpdate();

        resetForm();
        setShowCreateModal(false);
        fetchMetrics(metricsPeriod, metricsBarber);
        return newSupply;
      }
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mutación: Anular Abastecimiento (Restituir stock en todo el proyecto)
  const handleCancelSupply = async (id) => {
    try {
      setLoading(true);
      const targetId = id || selectedSupply?.id_abastecimiento;
      const res = await cancelSupply(targetId);
      const cancelledSupply = (res && typeof res === "object" && "data" in res) ? res.data : res;
      if (cancelledSupply) {
        setSupplies((prev) =>
          prev.map((item) => (item.id_abastecimiento === targetId ? cancelledSupply : item))
        );

        // Actualizar en localStorage
        try {
          const rawStored = localStorage.getItem("barber_supplies_db");
          if (rawStored) {
            const list = JSON.parse(rawStored).map((item) =>
              item.id_abastecimiento === targetId ? cancelledSupply : item
            );
            localStorage.setItem("barber_supplies_db", JSON.stringify(list));
          }
        } catch {}

        // 1. Restituir stock en memoria y en localStorage
        let updatedProds = [];
        const supplyToRestore = selectedSupply || cancelledSupply;
        if (supplyToRestore && supplyToRestore.detalles) {
          try {
            const rawStored = localStorage.getItem("barber_products_db");
            const currentList = rawStored ? JSON.parse(rawStored) : products;
            updatedProds = currentList.map((prod) => {
              const restored = supplyToRestore.detalles.find((d) => Number(d.id_producto) === Number(prod.id_producto));
              if (restored) {
                return { ...prod, stock: Number(prod.stock || 0) + Number(restored.cantidad || 0) };
              }
              return prod;
            });
            setProducts(updatedProds);
            localStorage.setItem("barber_products_db", JSON.stringify(updatedProds));
          } catch {
            updatedProds = products.map((prod) => {
              const restored = supplyToRestore.detalles.find((d) => Number(d.id_producto) === Number(prod.id_producto));
              if (restored) {
                return { ...prod, stock: Number(prod.stock || 0) + Number(restored.cantidad || 0) };
              }
              return prod;
            });
            setProducts(updatedProds);
          }
        }

        // 2. Refrescar catálogo con la bodega general
        reloadProducts();

        // 3. Notificar a todo el sistema la restitución de inventario
        notifyDataChange(SYNC_ENTITIES.SUPPLIES, cancelledSupply);
        notifyDataChange(SYNC_ENTITIES.STATION_SUPPLIES, cancelledSupply);
        notifyDataChange(SYNC_ENTITIES.WAREHOUSE_ITEMS, cancelledSupply);
        notifyDataChange(SYNC_ENTITIES.PRODUCTS, { source: "supplies_cancel", supply: cancelledSupply });
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new CustomEvent("barber_products_updated", { detail: updatedProds }));
        dispatchNotificationUpdate();

        setShowCancelModal(false);
        setSelectedSupply(null);
        fetchMetrics(metricsPeriod, metricsBarber);
        return cancelledSupply;
      }
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Ordenamiento
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const hasActiveFilters = Boolean(
    searchTerm || statusFilter !== "all" || barberFilter !== "all" || startDate || endDate
  );

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setBarberFilter("all");
    setStartDate("");
    setEndDate("");
  };

  // Filtrado y ordenamiento de lista
  const filteredSupplies = useMemo(() => {
    return supplies
      .filter((item) => {
        const s = searchTerm.toLowerCase().trim();
        const barberName = (item.barbero_nombre || "").toLowerCase();
        const userName = (item.usuario_nombre || "").toLowerCase();
        const obs = (item.observaciones || "").toLowerCase();
        const itemNames = (item.detalles || []).map((d) => (d.producto_nombre || "").toLowerCase()).join(" ");

        const matchesSearch =
          !s ||
          barberName.includes(s) ||
          userName.includes(s) ||
          obs.includes(s) ||
          itemNames.includes(s) ||
          String(item.id_abastecimiento).includes(s);

        const matchesStatus = statusFilter === "all" || item.estado === statusFilter;
        const matchesBarber = barberFilter === "all" || String(item.id_barbero) === String(barberFilter);

        const itemDate = item.fecha ? item.fecha.substring(0, 10) : "";
        const matchesStart = !startDate || itemDate >= startDate;
        const matchesEnd = !endDate || itemDate <= endDate;

        return matchesSearch && matchesStatus && matchesBarber && matchesStart && matchesEnd;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();
        if (valA < valB) return sortDir === "asc" ? -1 : 1;
        if (valA > valB) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
  }, [supplies, searchTerm, statusFilter, barberFilter, startDate, endDate, sortField, sortDir]);

  // Métricas rápidas del módulo
  const quickStats = useMemo(() => {
    const activeList = supplies.filter((s) => s.estado !== "Anulado");
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const thirtyDaysStr = thirtyDaysAgo.toISOString().split("T")[0];

    const monthList = activeList.filter((s) => (s.fecha ? s.fecha.substring(0, 10) >= thirtyDaysStr : true));

    let monthUnits = 0;
    let monthCost = 0;
    const barberCounts = {};

    monthList.forEach((s) => {
      let supplyCost = Number(s.total_estimado || 0);
      let supplyUnits = 0;

      if (Array.isArray(s.detalles) && s.detalles.length > 0) {
        s.detalles.forEach((d) => {
          const q = Number(d.cantidad || 0);
          supplyUnits += q;
          if (supplyCost === 0) {
            const unitPrice = Number(d.precio_unitario || 0) > 0 ? Number(d.precio_unitario) : 15000;
            supplyCost += Number(d.subtotal || (q * unitPrice));
          }
        });
      } else if (Number(s.cantidad || s.total_articulos || 0) > 0) {
        supplyUnits += Number(s.cantidad || s.total_articulos || 0);
      }

      monthCost += supplyCost;
      monthUnits += supplyUnits;

      const bName = s.barbero_nombre || "Barbero";
      barberCounts[bName] = (barberCounts[bName] || 0) + 1;
    });

    let topBarber = "—";
    let maxDispatches = 0;
    Object.entries(barberCounts).forEach(([name, count]) => {
      if (count > maxDispatches) {
        maxDispatches = count;
        topBarber = `${name} (${count} despachos)`;
      }
    });

    return {
      monthUnits,
      monthCost,
      monthDispatches: monthList.length,
      topBarber
    };
  }, [supplies]);

  return {
    supplies,
    filteredSupplies,
    barbers,
    products,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    barberFilter,
    setBarberFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    sortField,
    sortDir,
    handleSort,
    viewMode,
    setViewMode,
    hasActiveFilters,
    resetFilters,
    formData,
    setFormData,
    addItemToSupply,
    updateItemQuantity,
    removeItemFromSupply,
    resetForm,
    showCreateModal,
    setShowCreateModal,
    showDetailModal,
    setShowDetailModal,
    showCancelModal,
    setShowCancelModal,
    selectedSupply,
    setSelectedSupply,
    handleCreateSupply,
    handleCancelSupply,
    quickStats,
    // Métricas analíticas
    metrics,
    metricsPeriod,
    setMetricsPeriod,
    metricsBarber,
    setMetricsBarber,
    fetchMetrics,
    loadingMetrics,
    loadData
  };
}

export default useSupplies;
