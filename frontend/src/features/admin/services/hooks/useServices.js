import { useState } from "react";

const mockServices = [
  { id: 1, name: "Corte Clásico", category: "Cortes", description: "Corte tradicional con detalles", duration: 30, price: 15000, status: "Activo", createdAt: "2026-01-15" },
  { id: 2, name: "Corte + Barba", category: "Paquetes", description: "Corte completo con afeitado de barba", duration: 45, price: 25000, status: "Activo", createdAt: "2026-02-20" },
  { id: 3, name: "Afeitado Premium", category: "Barba", description: "Afeitado con productos premium", duration: 35, price: 20000, status: "Activo", createdAt: "2026-03-10" },
  { id: 4, name: "Diseño y Color", category: "Especiales", description: "Diseño de peinado con coloreante", duration: 60, price: 30000, status: "Activo", createdAt: "2026-04-05" },
  { id: 5, name: "Corte Niño", category: "Cortes", description: "Corte especial para niños", duration: 20, price: 12000, status: "Inactivo", createdAt: "2026-05-12" }
];

export const availableCategories = ["Cortes", "Barba", "Paquetes", "Especiales"];

const emptyForm = { name: "", category: "Cortes", description: "", duration: 30, price: 0 };

export function useServices() {
  const [services, setServices] = useState(mockServices);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const filteredServices = services
    .filter(
      (service) =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const valA = (a[sortField] ?? "").toString().toLowerCase();
      const valB = (b[sortField] ?? "").toString().toLowerCase();
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const resetForm = () => setFormData(emptyForm);

  const handleCreate = () => {
    const newService = {
      id: Math.max(...services.map((s) => s.id), 0) + 1,
      name: formData.name,
      category: formData.category,
      description: formData.description,
      duration: formData.duration,
      price: formData.price,
      status: "Activo",
      createdAt: new Date().toISOString().split("T")[0]
    };
    setServices([...services, newService]);
    setShowCreateModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedService) return;
    setServices(
      services.map((service) =>
        service.id === selectedService.id
          ? {
              ...service,
              name: formData.name,
              category: formData.category,
              description: formData.description,
              duration: formData.duration,
              price: formData.price
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
    setServices(services.filter((service) => service.id !== selectedService.id));
    setShowDeleteModal(false);
    setSelectedService(null);
  };

  const toggleStatus = (serviceId) => {
    setServices(
      services.map((service) =>
        service.id === serviceId ? { ...service, status: service.status === "Activo" ? "Inactivo" : "Activo" } : service
      )
    );
  };

  const openEditModal = (service) => {
    setSelectedService(service);
    setFormData({
      name: service.name,
      category: service.category,
      description: service.description,
      duration: service.duration,
      price: service.price
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

  return {
    services,
    searchTerm,
    setSearchTerm,
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
    selectedService,
    setSelectedService,
    resetForm,
    handleCreate,
    handleEdit,
    handleDelete,
    toggleStatus,
    openEditModal,
    openDetailModal,
    openDeleteModal
  };
}
