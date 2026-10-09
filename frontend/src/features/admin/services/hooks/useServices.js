import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { CATEGORIAS_SERVICIO } from "../../../../shared/types/database";
import { exportToStyledExcel } from "../../../../shared/utils/excelExporter";
import {
  getServices,
  getServiceCategories,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus
} from "../services/servicesService";
import {
  notifyDataChange,
  useDataSync,
  SYNC_ENTITIES
} from "../../../../shared/services/dataSyncService";

let liveCategories = [...CATEGORIAS_SERVICIO];

export const availableCategories = new Proxy([], {
  get(target, prop) {
    const val = liveCategories[prop];
    if (typeof val === "function") return val.bind(liveCategories);
    return val;
  }
});

const emptyForm = {
  nombre: "",
  id_categoria_servicio: 1,
  precio: 0,
  duracion_minutos: 30,
  imagen_url: "",
  estado: 1
};

export function useServices() {
  const [services, setServices] = useState([]);
  const [categoriesList, setCategoriesList] = useState(liveCategories);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | '1' | '0'
  const [categoryFilter, setCategoryFilter] = useState("all"); // 'all' | id_categoria
  const [sortField, setSortField] = useState("nombre");
  const [sortDir, setSortDir] = useState("asc");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getServiceCategories();
      if (Array.isArray(data)) {
        liveCategories = data;
        setCategoriesList(data);
      }
    } catch (err) {
      console.warn("[Services] Usando categorías por fallback:", err.message);
    }
  }, []);

  const fetchServicesList = useCallback(async () => {
    try {
      const data = await getServices();
      if (Array.isArray(data)) {
        setServices(data);
        try { localStorage.setItem("barber_services_db", JSON.stringify(data)); } catch (_) {}
      }
    } catch (err) {
      console.warn("[Services] Usando servicios locales por fallback:", err.message);
    }
  }, []);

  useEffect(() => {
    fetchServicesList();
    fetchCategories();
  }, [fetchServicesList, fetchCategories]);

  useDataSync([SYNC_ENTITIES.SERVICES], fetchServicesList);
  useDataSync([SYNC_ENTITIES.SERVICE_CATEGORIES], fetchCategories);

  const getCategoryName = (id_cat) => {
    const c = categoriesList.find((cat) => cat.id_categoria_servicio === Number(id_cat));
    return c ? c.nombre : "Sin Categoría";
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const filteredServices = services
    .filter((service) => {
      const search = searchTerm.toLowerCase().trim();
      const catName = getCategoryName(service.id_categoria_servicio).toLowerCase();
      const matchesSearch =
        search === "" ||
        service.nombre.toLowerCase().includes(search) ||
        catName.includes(search);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "1" && service.estado === 1) ||
        (statusFilter === "0" && service.estado === 0);

      const matchesCategory =
        categoryFilter === "all" || String(service.id_categoria_servicio) === String(categoryFilter);

      return matchesSearch && matchesStatus && matchesCategory;
    })
    .sort((a, b) => {
      if (sortField === "precio" || sortField === "duracion_minutos") {
        return sortDir === "asc" ? a[sortField] - b[sortField] : b[sortField] - a[sortField];
      }
      const valA = (a[sortField] ?? "").toString().toLowerCase();
      const valB = (b[sortField] ?? "").toString().toLowerCase();
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all" || categoryFilter !== "all";

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("all");
  };

  const resetForm = () => setFormData(emptyForm);

  const handleCreate = async () => {
    const payload = {
      nombre: formData.nombre.trim(),
      id_categoria_servicio: Number(formData.id_categoria_servicio),
      precio: Number(formData.precio),
      duracion_minutos: Number(formData.duracion_minutos),
      imagen_url: formData.imagen_url || null
    };

    try {
      const res = await createService(payload);
      const newService = {
        ...payload,
        id_servicio: res?.id_servicio || Math.max(...services.map((s) => s.id_servicio), 0) + 1,
        estado: 1
      };
      setServices((prev) => {
        const next = [newService, ...prev];
        try { localStorage.setItem("barber_services_db", JSON.stringify(next)); } catch (_) {}
        return next;
      });
      setShowCreateModal(false);
      resetForm();
      notifyDataChange(SYNC_ENTITIES.SERVICES, newService);
      toast.success("Servicio creado exitosamente.");
    } catch (err) {
      toast.error(err.message || "Error al crear el servicio.");
    }
  };

  const handleEdit = async () => {
    if (!selectedService) return;
    const payload = {
      nombre: formData.nombre.trim(),
      id_categoria_servicio: Number(formData.id_categoria_servicio),
      precio: Number(formData.precio),
      duracion_minutos: Number(formData.duracion_minutos),
      imagen_url: formData.imagen_url || null
    };

    try {
      await updateService(selectedService.id_servicio, payload);
      setServices((prev) => {
        const next = prev.map((service) =>
          service.id_servicio === selectedService.id_servicio
            ? { ...service, ...payload }
            : service
        );
        try { localStorage.setItem("barber_services_db", JSON.stringify(next)); } catch (_) {}
        return next;
      });
      setShowEditModal(false);
      setSelectedService(null);
      resetForm();
      notifyDataChange(SYNC_ENTITIES.SERVICES, { id_servicio: selectedService.id_servicio, ...payload });
      toast.success("Servicio actualizado correctamente.");
    } catch (err) {
      toast.error(err.message || "Error al actualizar el servicio.");
    }
  };

  const handleDelete = async () => {
    if (!selectedService) return;
    try {
      await deleteService(selectedService.id_servicio);
      setServices((prev) => {
        const next = prev.filter((service) => service.id_servicio !== selectedService.id_servicio);
        try { localStorage.setItem("barber_services_db", JSON.stringify(next)); } catch (_) {}
        return next;
      });
      setShowDeleteModal(false);
      const deletedId = selectedService.id_servicio;
      setSelectedService(null);
      notifyDataChange(SYNC_ENTITIES.SERVICES, { id_servicio: deletedId, deleted: true });
      toast.success("Servicio eliminado con éxito.");
    } catch (err) {
      toast.error(err.message || "Error al eliminar el servicio.");
    }
  };

  const toggleStatus = async (serviceId) => {
    try {
      await toggleServiceStatus(serviceId);
      setServices((prev) => {
        const next = prev.map((service) =>
          service.id_servicio === serviceId ? { ...service, estado: service.estado === 1 ? 0 : 1 } : service
        );
        try { localStorage.setItem("barber_services_db", JSON.stringify(next)); } catch (_) {}
        return next;
      });
      notifyDataChange(SYNC_ENTITIES.SERVICES, { id_servicio: serviceId, toggled: true });
      toast.success("Estado del servicio actualizado.");
    } catch (err) {
      toast.error(err.message || "Error al cambiar estado del servicio.");
    }
  };

  const handleExport = () => {
    exportToStyledExcel({
      title: "CATÁLOGO OFICIAL DE SERVICIOS",
      subtitle: `Exportado el ${new Date().toLocaleDateString("es-CO")} - Tu Turno Barber ERP`,
      filename: `servicios_${new Date().toISOString().split("T")[0]}.xls`,
      columns: [
        { header: "ID", key: "id_servicio", width: 10, type: "number" },
        { header: "Nombre del Servicio", key: "nombre", width: 30 },
        { header: "Categoría", key: "categoria", width: 22 },
        { header: "Duración (min)", key: "duracion_minutos", width: 16, type: "number" },
        { header: "Precio", key: "precio", width: 18, type: "currency" },
        { header: "Estado", key: "estado_nombre", width: 14 }
      ],
      data: filteredServices.map((s) => ({
        ...s,
        categoria: getCategoryName(s.id_categoria_servicio),
        duracion_minutos: Number(s.duracion_minutos),
        precio: Number(s.precio),
        estado_nombre: s.estado === 1 ? "Activo" : "Inactivo"
      }))
    });
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (service) => {
    setSelectedService(service);
    setFormData({
      nombre: service.nombre,
      id_categoria_servicio: service.id_categoria_servicio,
      precio: service.precio,
      duracion_minutos: service.duracion_minutos,
      imagen_url: service.imagen_url || "",
      estado: service.estado !== undefined ? service.estado : 1
    });
    setShowEditModal(true);
  };

  const openDetailModal = (service) => {
    setSelectedService(service);
    setShowDetailModal(true);
  };

  const openDeleteModal = (service) => {
    setSelectedService(service);
    setShowDeleteModal(true);
  };

  const openDeactivateModal = (service) => {
    setSelectedService(service);
    setShowDeactivateModal(true);
  };

  return {
    services,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    hasActiveFilters,
    resetFilters,
    sortField,
    sortDir,
    handleSort,
    filteredServices,
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
    showDeactivateModal,
    setShowDeactivateModal,
    selectedService,
    setSelectedService,
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
    openDeactivateModal,
    getCategoryName,
    categories: categoriesList,
    availableCategories: categoriesList
  };
}
