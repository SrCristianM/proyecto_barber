import { useState } from "react";

// Datos mock de paquetes basados en el typedef PaqueteServicio del database.js
const mockPackages = [
  { id_paquete: 1, nombre: "Paquete Básico", descuento_porcentaje: 10, estado: 1, servicios: ["Corte Clásico", "Afeitado Premium"] },
  { id_paquete: 2, nombre: "Paquete Premium", descuento_porcentaje: 20, estado: 1, servicios: ["Corte + Barba", "Diseño y Color"] },
  { id_paquete: 3, nombre: "Paquete Especial", descuento_porcentaje: 15, estado: 0, servicios: ["Corte Clásico", "Corte + Barba"] }
];

const emptyForm = { nombre: "", descuento_porcentaje: 0, estado: 1 };

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

  const handleCreate = () => {
    const next = {
      id_paquete: Math.max(...packages.map((p) => p.id_paquete), 0) + 1,
      nombre: formData.nombre,
      descuento_porcentaje: Number(formData.descuento_porcentaje),
      estado: 1,
      servicios: []
    };
    setPackages([...packages, next]);
    setShowCreateModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedPackage) return;
    setPackages(packages.map((p) =>
      p.id_paquete === selectedPackage.id_paquete
        ? { ...p, nombre: formData.nombre, descuento_porcentaje: Number(formData.descuento_porcentaje) }
        : p
    ));
    setShowEditModal(false);
    setSelectedPackage(null);
    resetForm();
  };

  const toggleStatus = (id) => {
    setPackages(packages.map((p) =>
      p.id_paquete === id ? { ...p, estado: p.estado === 1 ? 0 : 1 } : p
    ));
  };

  const openEditModal = (pkg) => {
    setSelectedPackage(pkg);
    setFormData({ nombre: pkg.nombre, descuento_porcentaje: pkg.descuento_porcentaje, estado: pkg.estado });
    setShowEditModal(true);
  };

  const openDeactivateModal = (pkg) => {
    setSelectedPackage(pkg);
    setShowDeactivateModal(true);
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
    openDeactivateModal
  };
}
