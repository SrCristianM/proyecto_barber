import { useState } from "react";
import { CATEGORIAS_SERVICIO } from "../../../../shared/types/database";

const mockServices = [
  { id_servicio: 1, nombre: "Corte Clásico", id_categoria_servicio: 1, precio: 15000, duracion_minutos: 30, imagen_url: "", estado: 1 },
  { id_servicio: 2, nombre: "Corte + Barba", id_categoria_servicio: 3, precio: 25000, duracion_minutos: 45, imagen_url: "", estado: 1 },
  { id_servicio: 3, nombre: "Afeitado Premium", id_categoria_servicio: 2, precio: 20000, duracion_minutos: 35, imagen_url: "", estado: 1 },
  { id_servicio: 4, nombre: "Diseño y Color", id_categoria_servicio: 4, precio: 30000, duracion_minutos: 60, imagen_url: "", estado: 1 },
  { id_servicio: 5, nombre: "Corte Niño", id_categoria_servicio: 1, precio: 12000, duracion_minutos: 20, imagen_url: "", estado: 0 }
];

export const availableCategories = CATEGORIAS_SERVICIO;

const emptyForm = {
  nombre: "",
  id_categoria_servicio: 1,
  precio: 0,
  duracion_minutos: 30,
  imagen_url: ""
};

export function useServices() {
  const [services, setServices] = useState(mockServices);
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

  const getCategoryName = (id_cat) => {
    const c = CATEGORIAS_SERVICIO.find((cat) => cat.id_categoria_servicio === Number(id_cat));
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

  const handleCreate = () => {
    const newService = {
      id_servicio: Math.max(...services.map((s) => s.id_servicio), 0) + 1,
      nombre: formData.nombre.trim(),
      id_categoria_servicio: Number(formData.id_categoria_servicio),
      precio: Number(formData.precio),
      duracion_minutos: Number(formData.duracion_minutos),
      imagen_url: formData.imagen_url || null,
      estado: 1
    };
    setServices([...services, newService]);
    setShowCreateModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedService) return;
    setServices(
      services.map((service) =>
        service.id_servicio === selectedService.id_servicio
          ? {
              ...service,
              nombre: formData.nombre.trim(),
              id_categoria_servicio: Number(formData.id_categoria_servicio),
              precio: Number(formData.precio),
              duracion_minutos: Number(formData.duracion_minutos),
              imagen_url: formData.imagen_url || null
            }
          : service
      )
    );
    setShowEditModal(false);
    setSelectedService(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!selectedService) return;
    setServices(services.filter((service) => service.id_servicio !== selectedService.id_servicio));
    setShowDeleteModal(false);
    setSelectedService(null);
  };

  const toggleStatus = (serviceId) => {
    setServices(
      services.map((service) =>
        service.id_servicio === serviceId ? { ...service, estado: service.estado === 1 ? 0 : 1 } : service
      )
    );
  };

  const handleExport = () => {
    const headers = ["ID", "Nombre", "Categoría", "Precio", "Duración (min)", "Estado"];
    const csvContent = [
      headers.join(","),
      ...filteredServices.map((s) =>
        [
          s.id_servicio,
          `"${s.nombre}"`,
          `"${getCategoryName(s.id_categoria_servicio)}"`,
          s.precio,
          s.duracion_minutos,
          `"${s.estado === 1 ? 'Activo' : 'Inactivo'}"`
        ].join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `servicios_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
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
      imagen_url: service.imagen_url || ""
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
    getCategoryName
  };
}
