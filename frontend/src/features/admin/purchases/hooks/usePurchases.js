import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { exportToStyledExcel } from "../../../../shared/utils/excelExporter";
import { ESTADOS_COMPRA } from "../../../../shared/types/database";
import {
  getPurchases,
  createPurchase,
  cancelPurchase,
  deletePurchase
} from "../services/purchasesService";
import { getSuppliers } from "../../suppliers/services/suppliersService";
import { getProducts } from "../../products/services/productsService";
import { getCurrentUser } from "../../../auth/services/authService";
import { notifyDataChange, useDataSync, SYNC_ENTITIES } from "../../../../shared/services/dataSyncService";
import { getLocalDateString } from "../../../../shared/utils/dateUtils";

// Mantenemos constantes exportadas vacías por retrocompatibilidad segura
export const availableSuppliers = [];
export const availableProducts = [];
export const availableUsers = [];

export const getSupplierObject = (id_proveedor, purchaseObj = null, suppliersList = []) => {
  const found = suppliersList.find((s) => s.id_proveedor === Number(id_proveedor));
  if (found) return found;
  return {
    id_proveedor: Number(id_proveedor),
    nombre: purchaseObj?.proveedor_nombre || (id_proveedor ? `Proveedor #${id_proveedor}` : "Proveedor"),
    nit: purchaseObj?.proveedor_nit || "—",
    telefono: purchaseObj?.proveedor_telefono || "",
    correo: "",
    direccion: "",
    ciudad: ""
  };
};

export const getUserObject = (id_usuario, purchaseObj = null) => {
  const currentUser = getCurrentUser();
  if (purchaseObj?.usuario_nombre) {
    return {
      id_usuario: Number(id_usuario),
      nombre: purchaseObj.usuario_nombre,
      cargo: "Usuario del Sistema"
    };
  }
  if (currentUser && Number(currentUser.id_usuario) === Number(id_usuario)) {
    return {
      id_usuario: Number(id_usuario),
      nombre: `${currentUser.nombre} ${currentUser.apellido || ""}`.trim(),
      cargo: "Sesión Activa"
    };
  }
  return {
    id_usuario: Number(id_usuario),
    nombre: id_usuario ? `Usuario #${id_usuario}` : "Administrador Principal",
    cargo: "Administrador del Sistema ERP"
  };
};

export const purchaseStatuses = ESTADOS_COMPRA;

const emptyForm = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const localDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
  const currentUser = getCurrentUser();

  return {
    id_proveedor: "",
    id_usuario: currentUser?.id_usuario || 1,
    fecha: localDateTime,
    estado: "Registrada",
    detalles: [],
    total: 0,
    factura_pdf: null
  };
};

export function usePurchases() {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'Registrada' | 'Anulada'
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'cards'
  const [sortField, setSortField] = useState("fecha");
  const [sortDir, setSortDir] = useState("desc");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [formData, setFormData] = useState(emptyForm());

  const loadCatalogData = useCallback(async () => {
    setIsLoadingCatalog(true);
    try {
      const [supRes, prodRes] = await Promise.allSettled([
        getSuppliers(),
        getProducts()
      ]);
      if (supRes.status === "fulfilled" && Array.isArray(supRes.value)) {
        setSuppliers(supRes.value);
      }
      if (prodRes.status === "fulfilled" && Array.isArray(prodRes.value)) {
        setProducts(prodRes.value);
      }
    } catch (err) {
      console.warn("[Purchases] Error cargando proveedores y productos:", err);
    } finally {
      setIsLoadingCatalog(false);
    }
  }, []);

  const getSupplierName = useCallback((id_proveedor, purchaseObj = null) => {
    if (purchaseObj?.proveedor_nombre) return purchaseObj.proveedor_nombre;
    const found = suppliers.find((s) => s.id_proveedor === Number(id_proveedor));
    return found?.nombre || (id_proveedor ? `Proveedor #${id_proveedor}` : "Proveedor Desconocido");
  }, [suppliers]);

  const getSupplierNit = useCallback((id_proveedor, purchaseObj = null) => {
    if (purchaseObj?.proveedor_nit) return purchaseObj.proveedor_nit;
    const found = suppliers.find((s) => s.id_proveedor === Number(id_proveedor));
    return found?.nit || "—";
  }, [suppliers]);

  const getUserName = useCallback((id_usuario, purchaseObj = null) => {
    if (purchaseObj?.usuario_nombre) return purchaseObj.usuario_nombre;
    const currentUser = getCurrentUser();
    if (currentUser && Number(currentUser.id_usuario) === Number(id_usuario)) {
      return `${currentUser.nombre} ${currentUser.apellido || ""}`.trim();
    }
    return id_usuario ? `Usuario #${id_usuario}` : "Usuario Desconocido";
  }, []);

  const getProductName = useCallback((id_producto, detailObj = null) => {
    if (detailObj?.producto_nombre) return detailObj.producto_nombre;
    if (detailObj?.nombre_producto) return detailObj.nombre_producto;
    const found = products.find((p) => p.id_producto === Number(id_producto));
    return found?.nombre || (id_producto ? `Producto #${id_producto}` : "Producto");
  }, [products]);

  const getResolvedSupplierObject = useCallback((id_proveedor, purchaseObj = null) => {
    return getSupplierObject(id_proveedor, purchaseObj, suppliers);
  }, [suppliers]);

  const getResolvedUserObject = useCallback((id_usuario, purchaseObj = null) => {
    return getUserObject(id_usuario, purchaseObj);
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const filteredPurchases = purchases
    .filter((purchase) => {
      const search = searchTerm.toLowerCase().trim();
      const supName = getSupplierName(purchase.id_proveedor, purchase).toLowerCase();
      const uName = getUserName(purchase.id_usuario, purchase).toLowerCase();
      const idStr = (purchase.id_compra || "").toString();
      const estadoStr = (purchase.estado || "").toLowerCase();

      const matchesSearch =
        search === "" ||
        supName.includes(search) ||
        uName.includes(search) ||
        idStr.includes(search) ||
        estadoStr.includes(search);

      const matchesStatus = statusFilter === "all" || purchase.estado === statusFilter;
      const matchesSupplier = supplierFilter === "all" || String(purchase.id_proveedor) === String(supplierFilter);

      let matchesDate = true;
      if (startDate) {
        matchesDate = matchesDate && (purchase.fecha || "").substring(0, 10) >= startDate;
      }
      if (endDate) {
        matchesDate = matchesDate && (purchase.fecha || "").substring(0, 10) <= endDate;
      }

      return matchesSearch && matchesStatus && matchesSupplier && matchesDate;
    })
    .sort((a, b) => {
      if (sortField === "total") {
        return sortDir === "asc" ? Number(a.total) - Number(b.total) : Number(b.total) - Number(a.total);
      }
      const valA = (a[sortField] ?? "").toString().toLowerCase();
      const valB = (b[sortField] ?? "").toString().toLowerCase();
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const hasActiveFilters =
    searchTerm !== "" ||
    statusFilter !== "all" ||
    supplierFilter !== "all" ||
    startDate !== "" ||
    endDate !== "";

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSupplierFilter("all");
    setStartDate("");
    setEndDate("");
  };

  const resetForm = () => setFormData(emptyForm());

  // Manejo dinámico de líneas de productos en el formulario
  const addProductRow = (id_producto, cantidad = 1, precio_unitario = null) => {
    const prod = products.find((p) => p.id_producto === Number(id_producto)) || products[0];
    if (!prod) {
      toast.error("Selecciona un producto válido registrado.");
      return;
    }
    const unitPrice = precio_unitario !== null ? Number(precio_unitario) : Number(prod.precio || prod.precio_sugerido || 0);
    const qty = Math.max(1, Number(cantidad) || 1);
    const subtotal = qty * unitPrice;

    const newRow = {
      id_producto: prod.id_producto,
      cantidad: qty,
      precio_unitario: unitPrice,
      subtotal: subtotal,
      nombre_producto: prod.nombre,
      producto_nombre: prod.nombre
    };

    const newDetalles = [...formData.detalles, newRow];
    const newTotal = newDetalles.reduce((sum, item) => sum + Number(item.subtotal), 0);

    setFormData({
      ...formData,
      detalles: newDetalles,
      total: newTotal
    });
  };

  const updateProductRow = (index, field, value) => {
    const newDetalles = [...formData.detalles];
    const item = { ...newDetalles[index] };

    if (field === "id_producto") {
      const prod = products.find((p) => p.id_producto === Number(value));
      item.id_producto = Number(value);
      item.nombre_producto = prod ? prod.nombre : "Producto";
      item.producto_nombre = prod ? prod.nombre : "Producto";
      if (!item.precio_unitario && prod) {
        item.precio_unitario = Number(prod.precio || prod.precio_sugerido || 0);
      }
    } else if (field === "cantidad") {
      item.cantidad = Math.max(1, parseInt(value, 10) || 1);
    } else if (field === "precio_unitario") {
      item.precio_unitario = Math.max(0, parseFloat(value) || 0);
    }

    item.subtotal = Number(item.cantidad) * Number(item.precio_unitario);
    newDetalles[index] = item;

    const newTotal = newDetalles.reduce((sum, d) => sum + Number(d.subtotal), 0);

    setFormData({
      ...formData,
      detalles: newDetalles,
      total: newTotal
    });
  };

  const removeProductRow = (index) => {
    const newDetalles = formData.detalles.filter((_, i) => i !== index);
    const newTotal = newDetalles.reduce((sum, d) => sum + Number(d.subtotal), 0);
    setFormData({
      ...formData,
      detalles: newDetalles,
      total: newTotal
    });
  };

  const fetchPurchasesList = useCallback(async () => {
    try {
      const data = await getPurchases();
      if (Array.isArray(data)) {
        setPurchases(data);
      }
    } catch (err) {
      console.warn("[Purchases] Usando compras locales por fallback:", err.message);
    }
  }, []);

  useEffect(() => {
    loadCatalogData();
    fetchPurchasesList();
  }, [loadCatalogData, fetchPurchasesList]);

  useDataSync([SYNC_ENTITIES.SUPPLIERS, SYNC_ENTITIES.PRODUCTS], loadCatalogData);
  useDataSync([SYNC_ENTITIES.PURCHASES], fetchPurchasesList);

  const handleCreate = async () => {
    if (!formData.id_proveedor || Number(formData.id_proveedor) <= 0) {
      toast.error("Debes seleccionar un proveedor registrado en el sistema.");
      return;
    }
    if (!formData.detalles || formData.detalles.length === 0) {
      toast.error("Debes agregar al menos un producto a la compra.");
      return;
    }

    const formattedFecha = formData.fecha.includes(" ")
      ? formData.fecha
      : `${formData.fecha.replace("T", " ")}:00`;

    const payload = {
      id_proveedor: Number(formData.id_proveedor),
      detalles: formData.detalles.map((d) => ({
        id_producto: Number(d.id_producto),
        cantidad: Number(d.cantidad),
        precio_unitario: Number(d.precio_unitario)
      }))
    };

    try {
      const created = await createPurchase(payload);
      const supplier = suppliers.find((s) => s.id_proveedor === Number(formData.id_proveedor));
      const currentUser = getCurrentUser();
      const nextCompraId = created?.id_compra || Math.max(...purchases.map((p) => p.id_compra), 0) + 1;
      const newPurchase = {
        id_compra: nextCompraId,
        id_proveedor: Number(formData.id_proveedor),
        proveedor_nombre: supplier?.nombre || created?.proveedor_nombre || `Proveedor #${formData.id_proveedor}`,
        proveedor_nit: supplier?.nit || created?.proveedor_nit || "",
        id_usuario: Number(formData.id_usuario || currentUser?.id_usuario || 1),
        usuario_nombre: currentUser ? `${currentUser.nombre} ${currentUser.apellido || ""}`.trim() : "Administrador",
        fecha: created?.fecha || formattedFecha,
        total: Number(formData.total),
        estado: "Registrada",
        factura_pdf: formData.factura_pdf || null,
        detalles: formData.detalles.map((d, index) => ({
          id_detalle_compra: nextCompraId * 100 + index + 1,
          id_compra: nextCompraId,
          id_producto: Number(d.id_producto),
          cantidad: Number(d.cantidad),
          precio_unitario: Number(d.precio_unitario),
          subtotal: Number(d.subtotal),
          nombre_producto: d.nombre_producto || getProductName(d.id_producto),
          producto_nombre: d.nombre_producto || getProductName(d.id_producto)
        }))
      };

      setPurchases([newPurchase, ...purchases]);
      setShowCreateModal(false);
      resetForm();
      notifyDataChange(SYNC_ENTITIES.PURCHASES);
      notifyDataChange(SYNC_ENTITIES.PRODUCTS);
      toast.success("Compra registrada y stock actualizado exitosamente.");
      return newPurchase;
    } catch (err) {
      toast.error(err.message || "Error al registrar la compra.");
    }
  };

  const handleEdit = () => {
    if (!selectedPurchase) return;
    const formattedFecha = formData.fecha.includes(" ")
      ? formData.fecha
      : `${formData.fecha.replace("T", " ")}:00`;

    const supplier = suppliers.find((s) => s.id_proveedor === Number(formData.id_proveedor));

    setPurchases(
      purchases.map((purchase) =>
        purchase.id_compra === selectedPurchase.id_compra
          ? {
            ...purchase,
            id_proveedor: Number(formData.id_proveedor),
            proveedor_nombre: supplier?.nombre || purchase.proveedor_nombre,
            proveedor_nit: supplier?.nit || purchase.proveedor_nit,
            id_usuario: Number(formData.id_usuario),
            fecha: formattedFecha,
            total: Number(formData.total),
            estado: formData.estado,
            factura_pdf: formData.factura_pdf !== undefined ? formData.factura_pdf : (selectedPurchase.factura_pdf || null),
            detalles: formData.detalles.map((d, index) => ({
              id_detalle_compra: d.id_detalle_compra || selectedPurchase.id_compra * 100 + index + 1,
              id_compra: selectedPurchase.id_compra,
              id_producto: Number(d.id_producto),
              cantidad: Number(d.cantidad),
              precio_unitario: Number(d.precio_unitario),
              subtotal: Number(d.subtotal),
              nombre_producto: d.nombre_producto || getProductName(d.id_producto),
              producto_nombre: d.producto_nombre || getProductName(d.id_producto)
            }))
          }
          : purchase
      )
    );
    setShowEditModal(false);
    setSelectedPurchase(null);
    resetForm();
    notifyDataChange(SYNC_ENTITIES.PURCHASES);
    toast.success("Compra actualizada correctamente.");
  };

  const handleDelete = async () => {
    if (!selectedPurchase) return;
    try {
      await deletePurchase(selectedPurchase.id_compra);
      setPurchases(purchases.filter((p) => p.id_compra !== selectedPurchase.id_compra));
      setShowDeleteModal(false);
      setSelectedPurchase(null);
      notifyDataChange(SYNC_ENTITIES.PURCHASES);
      notifyDataChange(SYNC_ENTITIES.PRODUCTS);
      toast.success("Compra eliminada correctamente.");
    } catch (err) {
      toast.error(err.message || "Error al eliminar la compra.");
    }
  };

  const toggleStatus = async (compraId) => {
    try {
      const targetPurchase = purchases.find((p) => p.id_compra === compraId);
      if (targetPurchase?.estado === "Registrada") {
        await cancelPurchase(compraId);
      }
      setPurchases((prev) =>
        prev.map((p) =>
          p.id_compra === compraId
            ? { ...p, estado: p.estado === "Registrada" ? "Anulada" : "Registrada" }
            : p
        )
      );
      notifyDataChange(SYNC_ENTITIES.PURCHASES);
      notifyDataChange(SYNC_ENTITIES.PRODUCTS);
      toast.success("Estado de la orden de compra actualizado.");
    } catch (err) {
      toast.error(err.message || "Error al actualizar estado de la compra.");
    }
  };

  const handleExport = () => {
    exportToStyledExcel({
      filename: "reporte_compras",
      sheetName: "Compras",
      title: "Registro de Facturas y Órdenes de Compra",
      subtitle: "Adquisiciones de inventario a proveedores",
      columns: [
        { header: "ID Compra", key: "id_compra", type: "number", width: 70, align: "center" },
        { header: "Fecha Emisión", key: "fecha", width: 130, align: "center" },
        { header: "Proveedor", key: "proveedorNombre", width: 200 },
        { header: "NIT / Identificación", key: "proveedorNit", width: 130, align: "center" },
        { header: "Usuario Responsable", key: "usuarioNombre", width: 140 },
        { header: "Total Compra", key: "total", type: "currency", width: 120 },
        { header: "Estado", key: "estado", type: "status", width: 100, align: "center" },
        { header: "Detalle de Artículos", key: "articulosTexto", width: 280 }
      ],
      data: filteredPurchases.map((p) => {
        const itemNames = (p.detalles || [])
          .map((d) => `${d.nombre_producto || getProductName(d.id_producto, d)} (x${d.cantidad} a $${d.precio_unitario})`)
          .join("; ");
        return {
          ...p,
          proveedorNombre: getSupplierName(p.id_proveedor, p),
          proveedorNit: getSupplierNit(p.id_proveedor, p),
          usuarioNombre: getUserName(p.id_usuario, p),
          articulosTexto: itemNames
        };
      })
    });
  };

  const openCreateModal = () => {
    loadCatalogData();
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (purchase) => {
    loadCatalogData();
    setSelectedPurchase(purchase);
    const rawFecha = purchase.fecha ? String(purchase.fecha) : "";
    const safeFecha = rawFecha.includes(" ")
      ? rawFecha.replace(" ", "T").substring(0, 16)
      : rawFecha.includes("T")
      ? rawFecha.substring(0, 16)
      : new Date().toISOString().substring(0, 16);

    setFormData({
      id_proveedor: purchase.id_proveedor,
      id_usuario: purchase.id_usuario,
      fecha: safeFecha,
      estado: purchase.estado,
      detalles: (purchase.detalles || []).map((d) => ({
        id_detalle_compra: d.id_detalle_compra,
        id_producto: d.id_producto,
        cantidad: d.cantidad,
        precio_unitario: d.precio_unitario,
        subtotal: d.subtotal,
        nombre_producto: d.nombre_producto || d.producto_nombre || getProductName(d.id_producto),
        producto_nombre: d.producto_nombre || d.nombre_producto || getProductName(d.id_producto)
      })),
      total: purchase.total,
      factura_pdf: purchase.factura_pdf || null
    });
    setShowEditModal(true);
  };

  const openDetailModal = (purchase) => {
    setSelectedPurchase(purchase);
    setShowDetailModal(true);
  };

  const openDeleteModal = (purchase) => {
    setSelectedPurchase(purchase);
    setShowDeleteModal(true);
  };

  const openCancelModal = (purchase) => {
    setSelectedPurchase(purchase);
    setShowCancelModal(true);
  };

  // Stats
  const activePurchases = purchases.filter((p) => p.estado === "Registrada");
  const todayStr = getLocalDateString();
  const totalToday = activePurchases
    .filter((p) => (p.fecha || "").startsWith(todayStr))
    .reduce((sum, p) => sum + Number(p.total), 0);
  const totalMonth = activePurchases.reduce((sum, p) => sum + Number(p.total), 0);
  const averagePurchase = activePurchases.length ? Math.round(totalMonth / activePurchases.length) : 0;
  const countRegistradas = activePurchases.length;
  const countAnuladas = purchases.filter((p) => p.estado === "Anulada").length;

  return {
    purchases,
    suppliers,
    products,
    isLoadingCatalog,
    loadCatalogData,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    supplierFilter,
    setSupplierFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    hasActiveFilters,
    resetFilters,
    viewMode,
    setViewMode,
    sortField,
    sortDir,
    handleSort,
    filteredPurchases,
    totalToday,
    totalMonth,
    averagePurchase,
    countRegistradas,
    countAnuladas,
    formData,
    setFormData,
    addProductRow,
    updateProductRow,
    removeProductRow,
    showCreateModal,
    setShowCreateModal,
    showEditModal,
    setShowEditModal,
    showDetailModal,
    setShowDetailModal,
    showDeleteModal,
    setShowDeleteModal,
    showCancelModal,
    setShowCancelModal,
    selectedPurchase,
    setSelectedPurchase,
    resetForm,
    handleCreate,
    handleEdit,
    handleDelete,
    toggleStatus,
    handleExport,
    openCreateModal,
    openEditModal,
    openDetailModal,
    openDeleteModal,
    openCancelModal,
    getSupplierName,
    getSupplierNit,
    getUserName,
    getUserObject: getResolvedUserObject,
    getProductName,
    getSupplierObject: getResolvedSupplierObject
  };
}
