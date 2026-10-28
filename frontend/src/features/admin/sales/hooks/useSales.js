import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { ESTADOS_VENTA } from "../../../../shared/types/database";
import { exportToStyledExcel } from "../../../../shared/utils/excelExporter";
import {
  getSales,
  createSale,
  cancelSale,
  deleteSale
} from "../services/salesService";
import { getClients } from "../../clients/services/clientsService";
import { getProducts } from "../../products/services/productsService";
import { getServices } from "../../services/services/servicesService";
import { getUsers } from "../../users/services/usersService";
import { getRealClients } from "../../appointments/hooks/useAppointments";
import {
  notifyDataChange,
  useDataSync,
  SYNC_ENTITIES
} from "../../../../shared/services/dataSyncService";
import { createNotification } from "../../../../shared/services/notificationService";

const initialCatalogItems = [
  { id_item: "s_1", tipo_item: "Servicio", id_servicio: 1, id_producto: null, nombre: "Corte Clásico", precio_unitario: 15000 },
  { id_item: "s_2", tipo_item: "Servicio", id_servicio: 2, id_producto: null, nombre: "Corte + Barba", precio_unitario: 25000 },
  { id_item: "s_3", tipo_item: "Servicio", id_servicio: 3, id_producto: null, nombre: "Afeitado Premium", precio_unitario: 20000 },
  { id_item: "s_4", tipo_item: "Servicio", id_servicio: 4, id_producto: null, nombre: "Diseño y Color", precio_unitario: 30000 },
  { id_item: "p_1", tipo_item: "Producto", id_servicio: null, id_producto: 1, nombre: "Gel para Cabello", precio_unitario: 15000 },
  { id_item: "p_2", tipo_item: "Producto", id_servicio: null, id_producto: 2, nombre: "Cera Modeladora", precio_unitario: 18000 },
  { id_item: "p_3", tipo_item: "Producto", id_servicio: null, id_producto: 3, nombre: "Shampoo Premium", precio_unitario: 22000 },
  { id_item: "p_4", tipo_item: "Producto", id_servicio: null, id_producto: 4, nombre: "Aceite para Barba", precio_unitario: 25000 }
];

let liveClients = [];
let liveUsers = [
  { id_usuario: 1, nombre: "Admin Principal" },
  { id_usuario: 2, nombre: "Recepcionista 1" },
  { id_usuario: 3, nombre: "Carlos Rodríguez" }
];
let liveCatalogItems = [...initialCatalogItems];

export const clients = new Proxy([], {
  get(target, prop) {
    const list = liveClients.length > 0 ? liveClients : getRealClients();
    const val = list[prop];
    if (typeof val === "function") return val.bind(list);
    return val;
  }
});

export const users = new Proxy([], {
  get(target, prop) {
    const val = liveUsers[prop];
    if (typeof val === "function") return val.bind(liveUsers);
    return val;
  }
});

export const catalogItems = new Proxy([], {
  get(target, prop) {
    const val = liveCatalogItems[prop];
    if (typeof val === "function") return val.bind(liveCatalogItems);
    return val;
  }
});

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
  const [sales, setSales] = useState([]);
  const [clientsList, setClientsList] = useState(() => liveClients.length > 0 ? liveClients : getRealClients());
  const [usersList, setUsersList] = useState(liveUsers);
  const [catalogList, setCatalogList] = useState(liveCatalogItems);
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

  const getClientName = (id_cliente, sale) => {
    if (sale?.cliente_nombre && sale.cliente_nombre.trim() !== "" && sale.cliente_nombre !== "Cliente") {
      return sale.cliente_nombre.trim();
    }
    const currentClients = clientsList.length > 0 ? clientsList : (liveClients.length > 0 ? liveClients : getRealClients());
    const found = currentClients.find(
      (c) =>
        Number(c.id_cliente) === Number(id_cliente) ||
        (sale?.id_usuario && Number(c.id_usuario) === Number(sale.id_usuario)) ||
        (sale?.cliente_correo && c.correo && c.correo.toLowerCase() === sale.cliente_correo.toLowerCase())
    );
    if (found) return found.nombre;
    return "Cliente Registrado";
  };

  const getUserName = (id_usuario) => {
    const u = usersList.find((usr) => Number(usr.id_usuario) === Number(id_usuario)) ||
      liveUsers.find((usr) => Number(usr.id_usuario) === Number(id_usuario));
    return u?.nombre || "Usuario Desconocido";
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
      const clientName = getClientName(sale.id_cliente, sale);
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
  const colombiaNowStr = new Date().toLocaleString("en-CA", { timeZone: "America/Bogota", hour12: false });
  const todayStr = colombiaNowStr.split(",")[0].trim();
  const totalToday = activeSales
    .filter((sale) => sale.fecha && sale.fecha.startsWith(todayStr))
    .reduce((sum, sale) => sum + Number(sale.total), 0);
  const totalMonth = activeSales.reduce((sum, sale) => sum + Number(sale.total), 0);
  const averageTicket = activeSales.length ? Math.round(totalMonth / activeSales.length) : 0;

  const resetForm = () => setFormData(emptyForm());

  const addItemToSale = (item, quantity = 1) => {
    const addQty = Math.max(1, parseInt(quantity, 10) || 1);
    const tipo = item.tipo_item || item.tipo || "Servicio";
    const precio = Number(item.precio_unitario ?? item.precio ?? 0);
    const idServ = item.id_servicio ?? (tipo === "Servicio" ? (item.id_item ?? item.id) : null);
    const idProd = item.id_producto ?? (tipo === "Producto" ? (item.id_item ?? item.id) : null);

    const existingIndex = formData.detalles.findIndex(
      (d) =>
        (tipo === "Servicio" && d.id_servicio === idServ) ||
        (tipo === "Producto" && d.id_producto === idProd)
    );

    let updatedDetalles;
    if (existingIndex >= 0) {
      updatedDetalles = [...formData.detalles];
      const newQty = (updatedDetalles[existingIndex].cantidad || 1) + addQty;
      updatedDetalles[existingIndex] = {
        ...updatedDetalles[existingIndex],
        cantidad: newQty,
        subtotal: newQty * Number(updatedDetalles[existingIndex].precio_unitario)
      };
    } else {
      const newDetalle = {
        tipo_item: tipo,
        id_servicio: idServ,
        id_producto: idProd,
        cantidad: addQty,
        precio_unitario: precio,
        subtotal: addQty * precio,
        nombre: item.nombre
      };
      updatedDetalles = [...formData.detalles, newDetalle];
    }

    const calculatedTotal = updatedDetalles.reduce((sum, d) => sum + Number(d.subtotal), 0);
    setFormData({
      ...formData,
      detalles: updatedDetalles,
      total: calculatedTotal
    });
  };

  const updateItemQuantity = (index, quantity) => {
    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    const updatedDetalles = [...formData.detalles];
    if (!updatedDetalles[index]) return;
    updatedDetalles[index] = {
      ...updatedDetalles[index],
      cantidad: qty,
      subtotal: qty * Number(updatedDetalles[index].precio_unitario)
    };
    const calculatedTotal = updatedDetalles.reduce((sum, d) => sum + Number(d.subtotal), 0);
    setFormData({
      ...formData,
      detalles: updatedDetalles,
      total: calculatedTotal
    });
  };

  const removeItemFromSale = (index) => {
    const updatedDetalles = formData.detalles.filter((_, idx) => idx !== index);
    const calculatedTotal = updatedDetalles.reduce((sum, d) => sum + Number(d.subtotal), 0);
    setFormData({
      ...formData,
      detalles: updatedDetalles,
      total: calculatedTotal
    });
  };

  const toggleCatalogItem = (item) => {
    addItemToSale(item);
  };

  const loadLocalSales = () => {
    try {
      const data = localStorage.getItem("barber_sales_db");
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          setSales(parsed);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
    setSales([]);
  };

  const fetchClients = useCallback(async () => {
    try {
      const data = await getClients();
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map((c) => ({
          id_cliente: Number(c.id_cliente),
          id_usuario: c.id_usuario,
          nombre: `${c.nombre} ${c.apellido || ""}`.trim() || "Cliente",
          correo: c.correo || "",
          telefono: c.telefono || "",
          documento: c.documento || ""
        }));
        liveClients = mapped;
        setClientsList(mapped);
      }
    } catch (err) {
      console.warn("[Sales] Error al obtener clientes para ventas:", err);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await getUsers();
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map((u) => ({
          id_usuario: Number(u.id_usuario),
          nombre: `${u.nombre} ${u.apellido || ""}`.trim(),
          correo: u.correo,
          id_rol: u.id_rol
        }));
        liveUsers = mapped;
        setUsersList(mapped);
      }
    } catch (err) {
      console.warn("[Sales] Error al obtener usuarios:", err);
    }
  }, []);

  const fetchCatalog = useCallback(async () => {
    try {
      const [prodsRes, servsRes] = await Promise.allSettled([
        getProducts(),
        getServices()
      ]);

      const items = [];
      if (servsRes.status === "fulfilled" && Array.isArray(servsRes.value)) {
        servsRes.value
          .filter((s) => s.estado === 1)
          .forEach((s) => {
            items.push({
              id_item: `s_${s.id_servicio}`,
              tipo_item: "Servicio",
              id_servicio: s.id_servicio,
              id_producto: null,
              nombre: s.nombre,
              precio_unitario: Number(s.precio) || 0
            });
          });
      }

      if (prodsRes.status === "fulfilled" && Array.isArray(prodsRes.value)) {
        prodsRes.value
          .filter((p) => p.estado === 1)
          .forEach((p) => {
            items.push({
              id_item: `p_${p.id_producto}`,
              tipo_item: "Producto",
              id_servicio: null,
              id_producto: p.id_producto,
              nombre: p.nombre,
              precio_unitario: Number(p.precio) || 0,
              stock: p.stock
            });
          });
      }

      if (items.length > 0) {
        liveCatalogItems = items;
        setCatalogList(items);
      }
    } catch (err) {
      console.warn("[Sales] Error sincronizando catálogo dinámico:", err);
    }
  }, []);

  const fetchFreshSales = useCallback(() => {
    getSales()
      .then((data) => {
        if (Array.isArray(data)) {
          setSales(data);
          try {
            localStorage.setItem("barber_sales_db", JSON.stringify(data));
          } catch {}
        } else {
          loadLocalSales();
        }
      })
      .catch((err) => {
        console.warn("[Sales] Usando ventas locales por fallback:", err.message);
        loadLocalSales();
      });
  }, []);

  useEffect(() => {
    fetchClients();
    fetchUsers();
    fetchCatalog();
    fetchFreshSales();

    const interval = setInterval(fetchFreshSales, 4000);
    const onFocus = () => {
      fetchClients();
      fetchCatalog();
      fetchFreshSales();
    };
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchClients, fetchUsers, fetchCatalog, fetchFreshSales]);

  useDataSync([SYNC_ENTITIES.CLIENTS, SYNC_ENTITIES.USERS], fetchClients);
  useDataSync([SYNC_ENTITIES.USERS], fetchUsers);
  useDataSync([SYNC_ENTITIES.PRODUCTS, SYNC_ENTITIES.SERVICES], fetchCatalog);
  useDataSync([SYNC_ENTITIES.SALES], fetchFreshSales);

  const handleCreate = async () => {
    const formattedFecha = formData.fecha.includes(" ")
      ? formData.fecha
      : `${formData.fecha.replace("T", " ")}:00`;

    const payload = {
      id_cliente: Number(formData.id_cliente),
      id_cita: formData.id_cita ? Number(formData.id_cita) : null,
      detalles: formData.detalles.map((d) => ({
        tipo_item: (d.tipo_item && d.tipo_item.toLowerCase() === "producto") ? "Producto" : "Servicio",
        id_producto: d.id_producto ? Number(d.id_producto) : null,
        id_servicio: d.id_servicio ? Number(d.id_servicio) : null,
        cantidad: Number(d.cantidad || 1),
        precio_unitario: Number(d.precio_unitario)
      }))
    };

    try {
      const created = await createSale(payload);
      const nextVentaId = created?.id_venta || Math.max(...sales.map((s) => s.id_venta), 0) + 1;
      const newSale = {
        id_venta: nextVentaId,
        id_cliente: Number(formData.id_cliente),
        id_usuario: Number(formData.id_usuario),
        id_cita: formData.id_cita ? Number(formData.id_cita) : null,
        fecha: formattedFecha,
        total: formData.total,
        estado: "Activa",
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
      setSales((prev) => [newSale, ...prev]);
      try {
        const local = JSON.parse(localStorage.getItem("barber_sales_db") || "[]");
        localStorage.setItem("barber_sales_db", JSON.stringify([newSale, ...local]));
      } catch {}

      // Descontar inventario de productos y alertar sobre stock crítico
      try {
        const rawProducts = localStorage.getItem("barber_products_db");
        if (rawProducts) {
          const prods = JSON.parse(rawProducts);
          formData.detalles.forEach((d) => {
            if (d.tipo_item === "Producto" && d.id_producto) {
              const pIdx = prods.findIndex((p) => Number(p.id_producto) === Number(d.id_producto));
              if (pIdx >= 0) {
                const curStock = Number(prods[pIdx].stock || 0);
                const newStock = Math.max(0, curStock - Number(d.cantidad || 1));
                prods[pIdx].stock = newStock;

                if (newStock <= 5) {
                  createNotification({
                    type: "stock",
                    title: "Alerta de Stock Crítico",
                    description: `El producto "${prods[pIdx].nombre}" cuenta con solo ${newStock} unidad(es) disponible(s).`,
                    route: "/dashboard/products",
                    targetRole: [1, 2]
                  });
                }
              }
            }
          });
          localStorage.setItem("barber_products_db", JSON.stringify(prods));
        }
      } catch (errStock) {
        console.warn("[useSales] Error actualizando stock:", errStock);
      }

      // Notificaciones de venta para Administración/Recepción y Cliente
      try {
        const clientName = getClientName(formData.id_cliente, newSale);
        const clientObj = clientsList.find((c) => Number(c.id_cliente) === Number(formData.id_cliente));

        createNotification({
          type: "sale",
          title: "Venta registrada",
          description: `Venta #${nextVentaId} por $${Number(formData.total).toLocaleString("es-CO")} registrada para ${clientName}.`,
          route: "/dashboard/sales",
          targetRole: [1, 2]
        });

        if (clientObj?.id_usuario) {
          createNotification({
            type: "sale",
            title: "¡Compra registrada con éxito!",
            description: `Tu comprobante de compra #${nextVentaId} por $${Number(formData.total).toLocaleString("es-CO")} está disponible.`,
            route: "/portal/mis-compras",
            targetRole: 4,
            targetUserId: clientObj.id_usuario
          });
        }
      } catch (errNotif) {
        console.warn("[useSales] Error despachando notificaciones de venta:", errNotif);
      }

      setShowCreateModal(false);
      resetForm();
      notifyDataChange(SYNC_ENTITIES.SALES, newSale);
      notifyDataChange(SYNC_ENTITIES.PRODUCTS);
      toast.success("Venta registrada y comprobante emitido exitosamente.");
    } catch (err) {
      toast.error(err.message || "Error al registrar la venta.");
    }
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
    toast.success("Venta actualizada correctamente.");
  };

  const handleDelete = async () => {
    if (!selectedSale) return;
    try {
      await deleteSale(selectedSale.id_venta);
      const updated = sales.filter((sale) => sale.id_venta !== selectedSale.id_venta);
      setSales(updated);
      try {
        localStorage.setItem("barber_sales_db", JSON.stringify(updated));
      } catch {}
      setShowDeleteModal(false);
      const deletedId = selectedSale.id_venta;
      setSelectedSale(null);
      notifyDataChange(SYNC_ENTITIES.SALES, { id_venta: deletedId, deleted: true });
      toast.success("Venta eliminada correctamente.");
    } catch (err) {
      toast.error(err.message || "Error al eliminar la venta.");
    }
  };

  const toggleStatus = async (saleId) => {
    try {
      const targetSale = sales.find((s) => s.id_venta === saleId);
      if (targetSale?.estado === "Activa") {
        await cancelSale(saleId);
      }
      setSales((prev) =>
        prev.map((sale) =>
          sale.id_venta === saleId
            ? { ...sale, estado: sale.estado === "Activa" ? "Anulada" : "Activa" }
            : sale
        )
      );
      notifyDataChange(SYNC_ENTITIES.SALES, { id_venta: saleId, toggled: true });
      notifyDataChange(SYNC_ENTITIES.PRODUCTS);
      toast.success("Estado de la venta actualizado en caja.");
    } catch (err) {
      toast.error(err.message || "Error al actualizar estado de la venta.");
    }
  };

  const handleExport = () => {
    exportToStyledExcel({
      title: "REPORTE OFICIAL DE FACTURACIÓN Y VENTAS",
      subtitle: `Exportado el ${new Date().toLocaleDateString("es-CO")} - Tu Turno Barber ERP`,
      filename: `ventas_caja_${new Date().toISOString().split("T")[0]}.xls`,
      columns: [
        { header: "ID Venta", key: "id_venta", width: 10, type: "number" },
        { header: "Fecha y Hora", key: "fecha", width: 20 },
        { header: "Cliente", key: "cliente_nombre", width: 26 },
        { header: "Cajero / Usuario", key: "usuario_nombre", width: 24 },
        { header: "Artículos Facturados", key: "articulos_str", width: 38 },
        { header: "Total Venta", key: "total_monto", width: 18, type: "currency" },
        { header: "Estado", key: "estado", width: 14 }
      ],
      data: filteredSales.map((s) => ({
        id_venta: s.id_venta,
        fecha: s.fecha,
        cliente_nombre: getClientName(s.id_cliente),
        usuario_nombre: getUserName(s.id_usuario),
        articulos_str: (s.detalles || []).map((d) => `${d.nombre} (x${d.cantidad})`).join("; ") || "Venta directa",
        total_monto: Number(s.total),
        estado: s.estado
      }))
    });
  };

  const openEditModal = (sale) => {
    setSelectedSale(sale);
    const selectedIds = (sale.detalles || []).map((d) => {
      const isServ = (d.tipo_item || d.tipo) === "Servicio";
      return isServ ? `s_${d.id_servicio ?? d.id}` : `p_${d.id_producto ?? d.id}`;
    });

    const rawFecha = sale.fecha ? String(sale.fecha) : "";
    const safeFecha = rawFecha.includes(" ")
      ? rawFecha.replace(" ", "T").substring(0, 16)
      : rawFecha.includes("T")
      ? rawFecha.substring(0, 16)
      : new Date().toISOString().substring(0, 16);

    setFormData({
      id_cliente: sale.id_cliente,
      id_usuario: sale.id_usuario,
      id_cita: sale.id_cita || null,
      fecha: safeFecha,
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
    addItemToSale,
    updateItemQuantity,
    removeItemFromSale,
    toggleStatus,
    getClientName,
    getUserName,
    clients: clientsList,
    users: usersList,
    catalogItems: catalogList,
    sales
  };
}
