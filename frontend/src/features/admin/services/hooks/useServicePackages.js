import { useState } from "react";

// Catálogo de servicios disponibles para componer paquetes (paquete_servicio_detalle)
export const availableServicesList = [
  { id_servicio: 1, nombre: "Corte Clásico", precio: 15000, duracion_minutos: 30 },
  { id_servicio: 2, nombre: "Corte + Barba", precio: 25000, duracion_minutos: 45 },
  { id_servicio: 3, nombre: "Afeitado Premium", precio: 20000, duracion_minutos: 35 },
  { id_servicio: 4, nombre: "Diseño y Color", precio: 30000, duracion_minutos: 60 },
  { id_servicio: 5, nombre: "Corte Niño", precio: 12000, duracion_minutos: 20 }
];

// Datos mock de paquetes basados en la tabla `paquete_servicio` y puente `paquete_servicio_detalle`
const mockPackages = [
  {
    id_paquete: 1,
    nombre: "Paquete Básico",
    descuento_porcentaje: 10,
    estado: 1,
    servicios_ids: [1, 3]
  },
  {
    id_paquete: 2,
    nombre: "Paquete Premium",
    descuento_porcentaje: 20,
    estado: 1,
    servicios_ids: [2, 4]
  },
  {
    id_paquete: 3,
    nombre: "Paquete Especial",
    descuento_porcentaje: 15,
    estado: 0,
    servicios_ids: [1, 2]
  }
];

const emptyForm = {
  nombre: "",
  descuento_porcentaje: 0,
  estado: 1,
  servicios_ids: [1, 2]
};

export function useServicePackages() {
  const [packages, setPackages] = useState(mockPackages);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPackages = packages.filter((p) =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => setFormData(emptyForm);

  const toggleServiceInForm = (id_servicio) => {
    const current = formData.servicios_ids || [];
    const next = current.includes(id_servicio)
      ? current.filter((id) => id !== id_servicio)
      : [...current, id_servicio];
    setFormData({ ...formData, servicios_ids: next });
  };

  const handleCreate = () => {
    const next = {
      id_paquete: Math.max(...packages.map((p) => p.id_paquete), 0) + 1,
      nombre: formData.nombre,
      descuento_porcentaje: Number(formData.descuento_porcentaje) || 0,
      estado: 1,
      servicios_ids: formData.servicios_ids || []
    };
    setPackages([...packages, next]);
    setShowCreateModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedPackage) return;
    setPackages(
      packages.map((p) =>
        p.id_paquete === selectedPackage.id_paquete
          ? {
              ...p,
              nombre: formData.nombre,
              descuento_porcentaje: Number(formData.descuento_porcentaje) || 0,
              servicios_ids: formData.servicios_ids || []
            }
          : p
      )
    );
    setShowEditModal(false);
    setSelectedPackage(null);
    resetForm();
  };

  const toggleStatus = (id) => {
    setPackages(
      packages.map((p) =>
        p.id_paquete === id ? { ...p, estado: p.estado === 1 ? 0 : 1 } : p
      )
    );
  };

  const openEditModal = (pkg) => {
    setSelectedPackage(pkg);
    setFormData({
      nombre: pkg.nombre,
      descuento_porcentaje: pkg.descuento_porcentaje,
      estado: pkg.estado,
      servicios_ids: pkg.servicios_ids || []
    });
    setShowEditModal(true);
  };

  const openDeactivateModal = (pkg) => {
    setSelectedPackage(pkg);
    setShowDeactivateModal(true);
  };

  const getServiceNames = (servicios_ids = []) => {
    return servicios_ids
      .map((id) => availableServicesList.find((s) => s.id_servicio === id)?.nombre)
      .filter(Boolean);
  };

  return {
    packages,
    filteredPackages,
    searchTerm,
    setSearchTerm,
    formData,
    setFormData,
    showCreateModal,
    setShowCreateModal,
    showEditModal,
    setShowEditModal,
    showDeactivateModal,
    setShowDeactivateModal,
    selectedPackage,
    setSelectedPackage,
    resetForm,
    handleCreate,
    handleEdit,
    toggleStatus,
    openEditModal,
    openDeactivateModal,
    toggleServiceInForm,
    getServiceNames,
    availableServicesList
  };
}
