import { useState } from "react";
import { ESTADOS_VENTA } from "../../../../shared/types/database";

const mockClientsList = [
  { id_cliente: 1, nombre: "Juan Pérez" },
  { id_cliente: 2, nombre: "María García" },
  { id_cliente: 3, nombre: "Pedro López" },
  { id_cliente: 4, nombre: "Ana Torres" },
  { id_cliente: 5, nombre: "Carlos Ruiz" },
  { id_cliente: 6, nombre: "Roberto Sánchez" },
  { id_cliente: 7, nombre: "Laura Martínez" },
  { id_cliente: 8, nombre: "Diego Fernández" }
];

const mockUsersList = [
  { id_usuario: 1, nombre: "Admin Principal" },
  { id_usuario: 2, nombre: "Recepcionista 1" },
  { id_usuario: 3, nombre: "Carlos Rodríguez" }
];

export const catalogItems = [
  { id_item: "s_1", tipo_item: "Servicio", id_servicio: 1, id_producto: null, nombre: "Corte Clásico", precio_unitario: 15000 },
  { id_item: "s_2", tipo_item: "Servicio", id_servicio: 2, id_producto: null, nombre: "Corte + Barba", precio_unitario: 25000 },
  { id_item: "s_3", tipo_item: "Servicio", id_servicio: 3, id_producto: null, nombre: "Afeitado Premium", precio_unitario: 20000 },
  { id_item: "s_4", tipo_item: "Servicio", id_servicio: 4, id_producto: null, nombre: "Diseño y Color", precio_unitario: 30000 },
  { id_item: "p_1", tipo_item: "Producto", id_servicio: null, id_producto: 1, nombre: "Gel para Cabello", precio_unitario: 15000 },
  { id_item: "p_2", tipo_item: "Producto", id_servicio: null, id_producto: 2, nombre: "Cera Modeladora", precio_unitario: 18000 },
  { id_item: "p_3", tipo_item: "Producto", id_servicio: null, id_producto: 3, nombre: "Shampoo Premium", precio_unitario: 22000 },
  { id_item: "p_4", tipo_item: "Producto", id_servicio: null, id_producto: 4, nombre: "Aceite para Barba", precio_unitario: 25000 }
];

const mockSales = [
  {
    id_venta: 1,
    id_cliente: 1,
    id_usuario: 1,
    id_cita: 1,
    fecha: "2026-06-02 09:30:00",
    total: 30000,
    estado: "Activa",
    detalles: [
      { id_venta_detalle: 1, id_venta: 1, tipo_item: "Servicio", id_producto: null, id_servicio: 1, cantidad: 1, precio_unitario: 15000, subtotal: 15000, nombre: "Corte Clásico" },
      { id_venta_detalle: 2, id_venta: 1, tipo_item: "Producto", id_producto: 1, id_servicio: null, cantidad: 1, precio_unitario: 15000, subtotal: 15000, nombre: "Gel para Cabello" }
    ]
  },
  {
    id_venta: 2,
    id_cliente: 2,
    id_usuario: 2,
    id_cita: 2,
    fecha: "2026-06-02 10:15:00",
    total: 25000,
    estado: "Activa",
    detalles: [
      { id_venta_detalle: 3, id_venta: 2, tipo_item: "Servicio", id_producto: null, id_servicio: 2, cantidad: 1, precio_unitario: 25000, subtotal: 25000, nombre: "Corte + Barba" }
    ]
  },
  {
    id_venta: 3,
    id_cliente: 3,
    id_usuario: 1,
    id_cita: 3,
    fecha: "2026-06-02 11:00:00",
    total: 45000,
    estado: "Activa",
    detalles: [
      { id_venta_detalle: 4, id_venta: 3, tipo_item: "Servicio", id_producto: null, id_servicio: 3, cantidad: 1, precio_unitario: 20000, subtotal: 20000, nombre: "Afeitado Premium" },
      { id_venta_detalle: 5, id_venta: 3, tipo_item: "Producto", id_producto: 4, id_servicio: null, cantidad: 1, precio_unitario: 25000, subtotal: 25000, nombre: "Aceite para Barba" }
    ]
  },
  {
    id_venta: 4,
    id_cliente: 4,
    id_usuario: 2,
    id_cita: null,
    fecha: "2026-06-01 16:30:00",
    total: 30000,
    estado: "Activa",
    detalles: [
      { id_venta_detalle: 6, id_venta: 4, tipo_item: "Servicio", id_producto: null, id_servicio: 4, cantidad: 1, precio_unitario: 30000, subtotal: 30000, nombre: "Diseño y Color" }
    ]
  },
  {
    id_venta: 5,
    id_cliente: 5,
    id_usuario: 1,
    id_cita: null,
    fecha: "2026-06-01 14:00:00",
    total: 37000,
    estado: "Activa",
    detalles: [
      { id_venta_detalle: 7, id_venta: 5, tipo_item: "Servicio", id_producto: null, id_servicio: 1, cantidad: 1, precio_unitario: 15000, subtotal: 15000, nombre: "Corte Clásico" },
      { id_venta_detalle: 8, id_venta: 5, tipo_item: "Producto", id_producto: 3, id_servicio: null, cantidad: 1, precio_unitario: 22000, subtotal: 22000, nombre: "Shampoo Premium" }
    ]
  },
  {
    id_venta: 6,
    id_cliente: 6,
    id_usuario: 1,
    id_cita: null,
    fecha: "2026-05-31 15:45:00",
    total: 43000,
    estado: "Anulada",
    detalles: [
      { id_venta_detalle: 9, id_venta: 6, tipo_item: "Servicio", id_producto: null, id_servicio: 2, cantidad: 1, precio_unitario: 25000, subtotal: 25000, nombre: "Corte + Barba" },
      { id_venta_detalle: 10, id_venta: 6, tipo_item: "Producto", id_producto: 2, id_servicio: null, cantidad: 1, precio_unitario: 18000, subtotal: 18000, nombre: "Cera Modeladora" }
    ]
  }
];

export const clients = mockClientsList;
export const users = mockUsersList;
export const saleStatuses = ESTADOS_VENTA;

const emptyForm = () => ({
  id_cliente: 1,
  id_usuario: 1,
  id_cita: null,
  fecha: new Date().toISOString().substring(0, 16),
  estado: "Activa",
  selectedItemIds: ["s_1"],
  detalles: [
    { tipo_item: "Servicio", id_servicio: 1, id_producto: null, cantidad: 1, precio_unitario: 15000, subtotal: 15000, nombre: "Corte Clásico" }
  ],
  total: 15000
});

export function useSales() {
  const [sales, setSales] = useState(mockSales);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'Activa' | 'Anulada'
  const [clientFilter, setClientFilter] = useState("all"); // 'all' | id_cliente
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'cards'
  const [sortField, setSortField] = useState("fecha");
  const [sortDir, setSortDir] = useState("desc");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [formData, setFormData] = useState(emptyForm());

  const getClientName = (id_cliente) => {
    return mockClientsList.find((c) => c.id_cliente === Number(id_cliente))?.nombre || "Cliente Desconocido";
  };

  const getUserName = (id_usuario) => {
    return mockUsersList.find((u) => u.id_usuario === Number(id_usuario))?.nombre || "Usuario Desconocido";
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const filteredSales = sales
    .filter((sale) => {
      const clientName = getClientName(sale.id_cliente);
      const userName = getUserName(sale.id_usuario);
      const search = searchTerm.toLowerCase().trim();
      const matchesSearch =
        search === "" ||
        clientName.toLowerCase().includes(search) ||
        userName.toLowerCase().includes(search) ||
        sale.estado.toLowerCase().includes(search) ||
        sale.id_venta.toString().includes(search);

      const matchesStatus =
        statusFilter === "all" || sale.estado === statusFilter;

      const matchesClient =
        clientFilter === "all" || String(sale.id_cliente) === String(clientFilter);

      let matchesDate = true;
      if (startDate) {
        matchesDate = matchesDate && sale.fecha.split(" ")[0] >= startDate;
      }
      if (endDate) {
        matchesDate = matchesDate && sale.fecha.split(" ")[0] <= endDate;
      }

      return matchesSearch && matchesStatus && matchesClient && matchesDate;
    })
    .sort((a, b) => {
      if (sortField === "total") {
        return sortDir === "asc" ? a.total - b.total : b.total - a.total;
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
    clientFilter !== "all" ||
    startDate !== "" ||
    endDate !== "";

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setClientFilter("all");
    setStartDate("");
    setEndDate("");
  };

  const activeSales = sales.filter((s) => s.estado === "Activa");
  const todayStr = new Date().toISOString().split("T")[0];
  const totalToday = activeSales
    .filter((sale) => sale.fecha.startsWith(todayStr))
    .reduce((sum, sale) => sum + Number(sale.total), 0);
  const totalMonth = activeSales.reduce((sum, sale) => sum + Number(sale.total), 0);
  const averageTicket = activeSales.length ? Math.round(totalMonth / activeSales.length) : 0;

  const resetForm = () => setFormData(emptyForm());

  const toggleCatalogItem = (item) => {
    const isSelected = formData.selectedItemIds.includes(item.id_item);
    let updatedSelectedIds;
    let updatedDetalles;

    if (isSelected) {
      updatedSelectedIds = formData.selectedItemIds.filter((id) => id !== item.id_item);
      updatedDetalles = formData.detalles.filter(
        (d) =>
          !(
            (item.tipo_item === "Servicio" && d.id_servicio === item.id_servicio) ||
            (item.tipo_item === "Producto" && d.id_producto === item.id_producto)
          )
      );
    } else {
      updatedSelectedIds = [...formData.selectedItemIds, item.id_item];
      const newDetalle = {
        tipo_item: item.tipo_item,
        id_servicio: item.id_servicio,
        id_producto: item.id_producto,
        cantidad: 1,
        precio_unitario: item.precio_unitario,
        subtotal: item.precio_unitario,
        nombre: item.nombre
      };
      updatedDetalles = [...formData.detalles, newDetalle];
    }

    const calculatedTotal = updatedDetalles.reduce((sum, d) => sum + d.subtotal, 0);

    setFormData({
      ...formData,
      selectedItemIds: updatedSelectedIds,
      detalles: updatedDetalles,
      total: calculatedTotal
    });
  };

  const handleCreate = () => {
    const nextVentaId = Math.max(...sales.map((s) => s.id_venta), 0) + 1;
    const formattedFecha = formData.fecha.includes(" ")
      ? formData.fecha
      : `${formData.fecha.replace("T", " ")}:00`;

    const newSale = {
      id_venta: nextVentaId,
      id_cliente: Number(formData.id_cliente),
      id_usuario: Number(formData.id_usuario),
      id_cita: formData.id_cita ? Number(formData.id_cita) : null,
      fecha: formattedFecha,
      total: formData.total,
      estado: formData.estado || "Activa",
      detalles: formData.detalles.map((d, index) => ({
        id_venta_detalle: nextVentaId * 10 + index + 1,
        id_venta: nextVentaId,
        tipo_item: d.tipo_item,
        id_producto: d.id_producto,
        id_servicio: d.id_servicio,
        cantidad: d.cantidad || 1,
        precio_unitario: d.precio_unitario,
        subtotal: d.subtotal,
        nombre: d.nombre
      }))
    };
    setSales([newSale, ...sales]);
    setShowCreateModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedSale) return;
    const formattedFecha = formData.fecha.includes(" ")
      ? formData.fecha
      : `${formData.fecha.replace("T", " ")}:00`;

    setSales(
      sales.map((sale) =>
        sale.id_venta === selectedSale.id_venta
          ? {
              ...sale,
              id_cliente: Number(formData.id_cliente),
              id_usuario: Number(formData.id_usuario),
              id_cita: formData.id_cita ? Number(formData.id_cita) : null,
              fecha: formattedFecha,
              total: formData.total,
              estado: formData.estado,
              detalles: formData.detalles.map((d, index) => ({
                id_venta_detalle: d.id_venta_detalle || sale.id_venta * 10 + index + 1,
                id_venta: sale.id_venta,
                tipo_item: d.tipo_item,
                id_producto: d.id_producto,
                id_servicio: d.id_servicio,
                cantidad: d.cantidad || 1,
                precio_unitario: d.precio_unitario,
                subtotal: d.subtotal,
                nombre: d.nombre
              }))
            }
          : sale
      )
    );
    setShowEditModal(false);
    setSelectedSale(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!selectedSale) return;
    setSales(sales.filter((sale) => sale.id_venta !== selectedSale.id_venta));
    setShowDeleteModal(false);
    setSelectedSale(null);
  };

  const toggleStatus = (saleId) => {
    setSales(
      sales.map((sale) =>
        sale.id_venta === saleId
          ? { ...sale, estado: sale.estado === "Activa" ? "Anulada" : "Activa" }
          : sale
      )
    );
  };

  const handleExport = () => {
    const headers = ["ID Venta", "Fecha", "Cliente", "Usuario", "Total", "Estado", "Artículos"];
    const csvContent = [
      headers.join(","),
      ...filteredSales.map((s) => {
        const itemNames = (s.detalles || []).map((d) => `${d.nombre} (x${d.cantidad})`).join("; ");
        return `${s.id_venta},"${s.fecha}","${getClientName(s.id_cliente)}","${getUserName(s.id_usuario)}",${s.total},"${s.estado}","${itemNames}"`;
      })
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ventas_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const openEditModal = (sale) => {
    setSelectedSale(sale);
    const selectedIds = (sale.detalles || []).map((d) =>
      d.tipo_item === "Servicio" ? `s_${d.id_servicio}` : `p_${d.id_producto}`
    );

    setFormData({
      id_cliente: sale.id_cliente,
      id_usuario: sale.id_usuario,
      id_cita: sale.id_cita || null,
      fecha: sale.fecha.replace(" ", "T").substring(0, 16),
      estado: sale.estado,
      selectedItemIds: selectedIds,
      detalles: [...(sale.detalles || [])],
      total: sale.total
    });
    setShowEditModal(true);
  };

  const openDetailModal = (sale) => {
    setSelectedSale(sale);
    setShowDetailModal(true);
  };

  const openDeleteModal = (sale) => {
    setSelectedSale(sale);
    setShowDeleteModal(true);
  };

  return {
    sales,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    clientFilter,
    setClientFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    viewMode,
    setViewMode,
    hasActiveFilters,
    resetFilters,
    sortField,
    sortDir,
    handleSort,
    filteredSales,
    totalToday,
    totalMonth,
    averageTicket,
    formData,
    setFormData,
    showCreateModal,
    setShowCreateModal,
    showEditModal,
    setShowEditModal,
    showDetailModal,
    setShowDetailModal,
    showDeleteModal,
    setShowDeleteModal,
    selectedSale,
    setSelectedSale,
    resetForm,
    handleCreate,
    handleEdit,
    handleDelete,
    handleExport,
    openEditModal,
    openDetailModal,
    openDeleteModal,
    toggleCatalogItem,
    toggleStatus,
    getClientName,
    getUserName
  };
}
