import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  getPackages,
  createPackage,
  updatePackage,
  deletePackage,
  togglePackageStatus
} from "../services/packagesService";
import { getServices } from "../services/servicesService";

// Catálogo de servicios disponibles para componer paquetes
export let availableServicesList = [];

const emptyForm = {
  nombre: "",
  descuento_porcentaje: 0,
  estado: 1,
  servicios_ids: []
};

export function useServicePackages() {
  const [packages, setPackages] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [searchTerm, setSearchTerm] = useState("");

  const loadPackagesData = async () => {
    try {
      const [pkgsData, srvsData] = await Promise.allSettled([
        getPackages(),
        getServices()
      ]);

      if (pkgsData.status === "fulfilled" && Array.isArray(pkgsData.value)) {
        setPackages(pkgsData.value);
      }

      if (srvsData.status === "fulfilled" && Array.isArray(srvsData.value)) {
        setServicesList(srvsData.value);
        availableServicesList = srvsData.value;
      }
    } catch (err) {
      console.warn("[Packages] Error al cargar paquetes o servicios:", err.message);
    }
  };

  useEffect(() => {
    loadPackagesData();
  }, []);

  const filteredPackages = packages.filter((p) =>
    (p.nombre || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => setFormData(emptyForm);

  const toggleServiceInForm = (id_servicio) => {
    const current = formData.servicios_ids || [];
    const next = current.includes(id_servicio)
      ? current.filter((id) => id !== id_servicio)
      : [...current, id_servicio];
    setFormData({ ...formData, servicios_ids: next });
  };

  const handleCreate = async () => {
    const payload = {
      nombre: formData.nombre.trim(),
      descuento_porcentaje: Number(formData.descuento_porcentaje) || 0,
      servicios_ids: formData.servicios_ids || []
    };

    try {
      const created = await createPackage(payload);
      const newPkg = {
        ...payload,
        id_paquete: created?.id_paquete || Math.max(...packages.map((p) => p.id_paquete || 0), 0) + 1,
        estado: 1
      };
      setPackages((prev) => [newPkg, ...prev]);
      setShowCreateModal(false);
      resetForm();
      toast.success("Paquete de servicios creado exitosamente.");
    } catch (err) {
      toast.error(err.message || "Error al crear el paquete de servicios.");
    }
  };

  const handleEdit = async () => {
    if (!selectedPackage) return;
    const payload = {
      nombre: formData.nombre.trim(),
      descuento_porcentaje: Number(formData.descuento_porcentaje) || 0,
      servicios_ids: formData.servicios_ids || []
    };

    try {
      await updatePackage(selectedPackage.id_paquete, payload);
      setPackages((prev) =>
        prev.map((p) =>
          p.id_paquete === selectedPackage.id_paquete
            ? { ...p, ...payload }
            : p
        )
      );
      setShowEditModal(false);
      setSelectedPackage(null);
      resetForm();
      toast.success("Paquete actualizado correctamente.");
    } catch (err) {
      toast.error(err.message || "Error al actualizar el paquete.");
    }
  };

  const toggleStatus = async (id) => {
    try {
      await togglePackageStatus(id);
      setPackages((prev) =>
        prev.map((p) =>
          p.id_paquete === id ? { ...p, estado: p.estado === 1 ? 0 : 1 } : p
        )
      );
      setShowDeactivateModal(false);
      toast.success("Estado del paquete actualizado.");
    } catch (err) {
      toast.error(err.message || "Error al cambiar estado del paquete.");
    }
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
    const list = servicesList.length > 0 ? servicesList : availableServicesList;
    return servicios_ids
      .map((id) => list.find((s) => s.id_servicio === id)?.nombre)
      .filter(Boolean);
  };

  const handleDelete = async (pkgId) => {
    try {
      await deletePackage(pkgId);
      setPackages((prev) => prev.filter((p) => p.id_paquete !== pkgId));
      toast.success("Paquete eliminado correctamente.");
    } catch (err) {
      toast.error(err.message || "Error al eliminar el paquete.");
    }
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
    handleDelete,
    toggleStatus,
    openEditModal,
    openDeactivateModal,
    toggleServiceInForm,
    getServiceNames,
    availableServicesList: servicesList.length > 0 ? servicesList : availableServicesList
  };
}
