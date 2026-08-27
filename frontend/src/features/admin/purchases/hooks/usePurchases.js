import { useState } from "react";
import { ESTADOS_COMPRA } from "../../../../shared/types/database";

export const availableSuppliers = [
  { id_proveedor: 1, nombre: "Distribuidora Barber Pro Colombia", nit: "901234567-1" },
  { id_proveedor: 2, nombre: "Cosméticos & Cuidado Capilar S.A.S.", nit: "900876543-2" },
  { id_proveedor: 3, nombre: "Herramientas & Barber Supplies", nit: "800345678-9" },
  { id_proveedor: 4, nombre: "Insumos y Lociones del Valle", nit: "901567890-4" },
  { id_proveedor: 5, nombre: "Navajas & Acero Premium Ltd", nit: "900654321-7" }
];

export const availableProducts = [
  { id_producto: 1, nombre: "Gel para Cabello", id_categoria_producto: 1, precio_sugerido: 10000 },
  { id_producto: 2, nombre: "Cera Modeladora", id_categoria_producto: 1, precio_sugerido: 12000 },
  { id_producto: 3, nombre: "Shampoo Premium", id_categoria_producto: 2, precio_sugerido: 14000 },
  { id_producto: 4, nombre: "Aceite para Barba", id_categoria_producto: 3, precio_sugerido: 16000 },
  { id_producto: 5, nombre: "Navaja Profesional", id_categoria_producto: 4, precio_sugerido: 28000 },
  { id_producto: 6, nombre: "Tijeras Profesionales", id_categoria_producto: 4, precio_sugerido: 42000 },
  { id_producto: 7, nombre: "Peine de Carbono", id_categoria_producto: 4, precio_sugerido: 4500 },
  { id_producto: 8, nombre: "Bálsamo para Barba", id_categoria_producto: 3, precio_sugerido: 13000 }
];

export const availableUsers = [
  { id_usuario: 1, nombre: "Admin Principal" },
  { id_usuario: 2, nombre: "Recepcionista 1" },
  { id_usuario: 3, nombre: "Carlos Rodríguez" }
];

export const purchaseStatuses = ESTADOS_COMPRA;

const mockPurchases = [
  {
    id_compra: 1,
    id_proveedor: 1,
    id_usuario: 1,
    fecha: "2026-06-02 08:30:00",
    total: 250000,
    estado: "Registrada",
    detalles: [
      { id_detalle_compra: 1, id_compra: 1, id_producto: 1, cantidad: 15, precio_unitario: 10000, subtotal: 150000, nombre_producto: "Gel para Cabello" },
      { id_detalle_compra: 2, id_compra: 1, id_producto: 2, cantidad: 8, precio_unitario: 12500, subtotal: 100000, nombre_producto: "Cera Modeladora" }
    ]
  },
  {
    id_compra: 2,
    id_proveedor: 3,
    id_usuario: 1,
    fecha: "2026-06-01 11:15:00",
    total: 420000,
    estado: "Registrada",
    detalles: [
      { id_detalle_compra: 3, id_compra: 2, id_producto: 5, cantidad: 5, precio_unitario: 28000, subtotal: 140000, nombre_producto: "Navaja Profesional" },
      { id_detalle_compra: 4, id_compra: 2, id_producto: 6, cantidad: 6, precio_unitario: 42000, subtotal: 252000, nombre_producto: "Tijeras Profesionales" },
      { id_detalle_compra: 5, id_compra: 2, id_producto: 7, cantidad: 6, precio_unitario: 4666.67, subtotal: 28000, nombre_producto: "Peine de Carbono" }
    ]
  },
  {
    id_compra: 3,
    id_proveedor: 2,
    id_usuario: 2,
    fecha: "2026-05-28 14:00:00",
    total: 310000,
    estado: "Registrada",
    detalles: [
      { id_detalle_compra: 6, id_compra: 3, id_producto: 3, cantidad: 12, precio_unitario: 15000, subtotal: 180000, nombre_producto: "Shampoo Premium" },
      { id_detalle_compra: 7, id_compra: 3, id_producto: 8, cantidad: 10, precio_unitario: 13000, subtotal: 130000, nombre_producto: "Bálsamo para Barba" }
    ]
  },
  {
    id_compra: 4,
    id_proveedor: 4,
    id_usuario: 1,
    fecha: "2026-05-20 16:45:00",
    total: 160000,
    estado: "Anulada",
    detalles: [
      { id_detalle_compra: 8, id_compra: 4, id_producto: 4, cantidad: 10, precio_unitario: 16000, subtotal: 160000, nombre_producto: "Aceite para Barba" }
    ]
  }
];

const emptyForm = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const localDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;

  return {
    id_proveedor: 1,
    id_usuario: 1,
    fecha: localDateTime,
    estado: "Registrada",
    detalles: [
      {
        id_producto: 1,
        cantidad: 1,
        precio_unitario: 10000,
        subtotal: 10000,
        nombre_producto: "Gel para Cabello"
      }
    ],
    total: 10000
  };
};

export function usePurchases() {
  const [purchases, setPurchases] = useState(mockPurchases);
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

  const getSupplierName = (id_proveedor) => {
    return availableSuppliers.find((s) => s.id_proveedor === Number(id_proveedor))?.nombre || "Proveedor Desconocido";
  };

  const getSupplierNit = (id_proveedor) => {
    return availableSuppliers.find((s) => s.id_proveedor === Number(id_proveedor))?.nit || "—";
  };

  const getUserName = (id_usuario) => {
    return availableUsers.find((u) => u.id_usuario === Number(id_usuario))?.nombre || "Usuario Desconocido";
  };

  const getProductName = (id_producto) => {
    return availableProducts.find((p) => p.id_producto === Number(id_producto))?.nombre || "Producto";
  };

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
      const supName = getSupplierName(purchase.id_proveedor).toLowerCase();
      const uName = getUserName(purchase.id_usuario).toLowerCase();
      const idStr = purchase.id_compra.toString();
      const estadoStr = purchase.estado.toLowerCase();

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
        matchesDate = matchesDate && purchase.fecha.substring(0, 10) >= startDate;
      }
      if (endDate) {
        matchesDate = matchesDate && purchase.fecha.substring(0, 10) <= endDate;
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
  const addProductRow = (id_producto = 1, cantidad = 1, precio_unitario = null) => {
    const prod = availableProducts.find((p) => p.id_producto === Number(id_producto)) || availableProducts[0];
    const unitPrice = precio_unitario !== null ? precio_unitario : prod.precio_sugerido;
    const subtotal = Number(cantidad) * Number(unitPrice);

    const newRow = {
      id_producto: prod.id_producto,
      cantidad: Number(cantidad),
      precio_unitario: Number(unitPrice),
      subtotal: subtotal,
      nombre_producto: prod.nombre
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
      const prod = availableProducts.find((p) => p.id_producto === Number(value));
      item.id_producto = Number(value);
      item.nombre_producto = prod ? prod.nombre : "Producto";
      if (!item.precio_unitario && prod) {
        item.precio_unitario = prod.precio_sugerido;
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

  const handleCreate = () => {
    const nextCompraId = Math.max(...purchases.map((p) => p.id_compra), 0) + 1;
    const formattedFecha = formData.fecha.includes(" ")
      ? formData.fecha
      : `${formData.fecha.replace("T", " ")}:00`;

    const newPurchase = {
      id_compra: nextCompraId,
      id_proveedor: Number(formData.id_proveedor),
      id_usuario: Number(formData.id_usuario),
      fecha: formattedFecha,
      total: Number(formData.total),
      estado: formData.estado || "Registrada",
      detalles: formData.detalles.map((d, index) => ({
        id_detalle_compra: nextCompraId * 100 + index + 1,
        id_compra: nextCompraId,
        id_producto: Number(d.id_producto),
        cantidad: Number(d.cantidad),
        precio_unitario: Number(d.precio_unitario),
        subtotal: Number(d.subtotal),
        nombre_producto: getProductName(d.id_producto)
      }))
    };

    setPurchases([newPurchase, ...purchases]);
    setShowCreateModal(false);
    resetForm();
    return newPurchase;
  };

  const handleEdit = () => {
    if (!selectedPurchase) return;
    const formattedFecha = formData.fecha.includes(" ")
      ? formData.fecha
      : `${formData.fecha.replace("T", " ")}:00`;

    setPurchases(
      purchases.map((purchase) =>
        purchase.id_compra === selectedPurchase.id_compra
          ? {
              ...purchase,
              id_proveedor: Number(formData.id_proveedor),
              id_usuario: Number(formData.id_usuario),
              fecha: formattedFecha,
              total: Number(formData.total),
              estado: formData.estado,
              detalles: formData.detalles.map((d, index) => ({
                id_detalle_compra: d.id_detalle_compra || selectedPurchase.id_compra * 100 + index + 1,
                id_compra: selectedPurchase.id_compra,
                id_producto: Number(d.id_producto),
                cantidad: Number(d.cantidad),
                precio_unitario: Number(d.precio_unitario),
                subtotal: Number(d.subtotal),
                nombre_producto: getProductName(d.id_producto)
              }))
            }
          : purchase
      )
    );
    setShowEditModal(false);
    setSelectedPurchase(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!selectedPurchase) return;
    setPurchases(purchases.filter((p) => p.id_compra !== selectedPurchase.id_compra));
    setShowDeleteModal(false);
    setSelectedPurchase(null);
  };

  const toggleStatus = (compraId) => {
    setPurchases(
      purchases.map((p) =>
        p.id_compra === compraId
          ? { ...p, estado: p.estado === "Registrada" ? "Anulada" : "Registrada" }
          : p
      )
    );
  };

  const handleExport = () => {
    const headers = ["ID Compra", "Fecha", "Proveedor", "NIT", "Usuario", "Total", "Estado", "Artículos"];
    const csvContent = [
      headers.join(","),
      ...filteredPurchases.map((p) => {
        const itemNames = (p.detalles || []).map((d) => `${d.nombre_producto || getProductName(d.id_producto)} (x${d.cantidad} a $${d.precio_unitario})`).join("; ");
        return [
          p.id_compra,
          `"${p.fecha}"`,
          `"${getSupplierName(p.id_proveedor)}"`,
          `"${getSupplierNit(p.id_proveedor)}"`,
          `"${getUserName(p.id_usuario)}"`,
          p.total,
          `"${p.estado}"`,
          `"${itemNames}"`
        ].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `compras_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (purchase) => {
    setSelectedPurchase(purchase);
    setFormData({
      id_proveedor: purchase.id_proveedor,
      id_usuario: purchase.id_usuario,
      fecha: purchase.fecha.replace(" ", "T").substring(0, 16),
      estado: purchase.estado,
      detalles: (purchase.detalles || []).map((d) => ({
        id_detalle_compra: d.id_detalle_compra,
        id_producto: d.id_producto,
        cantidad: d.cantidad,
        precio_unitario: d.precio_unitario,
        subtotal: d.subtotal,
        nombre_producto: d.nombre_producto || getProductName(d.id_producto)
      })),
      total: purchase.total
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
  const todayStr = new Date().toISOString().split("T")[0];
  const totalToday = activePurchases
    .filter((p) => p.fecha.startsWith(todayStr))
    .reduce((sum, p) => sum + Number(p.total), 0);
  const totalMonth = activePurchases.reduce((sum, p) => sum + Number(p.total), 0);
  const averagePurchase = activePurchases.length ? Math.round(totalMonth / activePurchases.length) : 0;
  const countRegistradas = activePurchases.length;
  const countAnuladas = purchases.filter((p) => p.estado === "Anulada").length;

  return {
    purchases,
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
    getProductName
  };
}
