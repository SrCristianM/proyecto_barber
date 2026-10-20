import { useState, useEffect, useCallback, useMemo } from "react";
import { getSupplies, createSupply, cancelSupply, getSuppliesMetrics } from "../services/suppliesService.js";
import { getCurrentUser } from "../../../auth/services/authService.js";

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
      const stored = localStorage.getItem("barber_products_db");
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

      if (suppliesRes && Array.isArray(suppliesRes.data)) {
        setSupplies(suppliesRes.data);
        try {
          localStorage.setItem("barber_supplies_db", JSON.stringify(suppliesRes.data));
        } catch {}
      }

      // 2. Cargar barberos si no están en memoria
      fetch("/api/barbers")
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json && Array.isArray(json.data)) {
            setBarbers(json.data);
            try {
              localStorage.setItem("barber_barbers_db", JSON.stringify(json.data));
            } catch {}
          }
        })
        .catch(() => {});

      // 3. Cargar catálogo de productos/insumos
      fetch("/api/products")
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json && Array.isArray(json.data)) {
            setProducts(json.data);
            try {
              localStorage.setItem("barber_products_db", JSON.stringify(json.data));
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
      if (res && res.data) {
        setMetrics(res.data);
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
    const qty = Number(quantity) || 1;
    const unitPrice = Number(product.precio ?? product.precio_unitario ?? 0);
    const availableStock = Number(product.stock ?? 999);

    setFormData((prev) => {
      const existingIdx = prev.detalles.findIndex((d) => d.id_producto === product.id_producto);
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
          id_producto: product.id_producto,
          nombre: product.nombre,
          presentacion: product.presentacion || "",
          marca: product.marca || "",
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

  // Mutación: Crear Abastecimiento
  const handleCreateSupply = async () => {
    try {
      setLoading(true);
      const res = await createSupply(formData);
      if (res && res.data) {
        setSupplies((prev) => [res.data, ...prev]);

        // Actualizar stock local de los productos para reflejo inmediato en UI
        setProducts((prevProds) =>
          prevProds.map((prod) => {
            const used = formData.detalles.find((d) => d.id_producto === prod.id_producto);
            if (used) {
              return { ...prod, stock: Math.max(0, (prod.stock || 0) - used.cantidad) };
            }
            return prod;
          })
        );

        resetForm();
        setShowCreateModal(false);
        fetchMetrics(metricsPeriod, metricsBarber);
        return res.data;
      }
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mutación: Anular Abastecimiento
  const handleCancelSupply = async (id) => {
    try {
      setLoading(true);
      const targetId = id || selectedSupply?.id_abastecimiento;
      const res = await cancelSupply(targetId);
      if (res && res.data) {
        setSupplies((prev) =>
          prev.map((item) => (item.id_abastecimiento === targetId ? res.data : item))
        );

        // Restaurar stock en UI
        if (selectedSupply && selectedSupply.detalles) {
          setProducts((prevProds) =>
            prevProds.map((prod) => {
              const restored = selectedSupply.detalles.find((d) => d.id_producto === prod.id_producto);
              if (restored) {
                return { ...prod, stock: (prod.stock || 0) + Number(restored.cantidad) };
              }
              return prod;
            })
          );
        }

        setShowCancelModal(false);
        setSelectedSupply(null);
        fetchMetrics(metricsPeriod, metricsBarber);
        return res.data;
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
      monthCost += Number(s.total_estimado || 0);
      const bName = s.barbero_nombre || "Barbero";
      barberCounts[bName] = (barberCounts[bName] || 0) + 1;

      (s.detalles || []).forEach((d) => {
        monthUnits += Number(d.cantidad || 0);
      });
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
