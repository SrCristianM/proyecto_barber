import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  getPackages,
  createPackage,
  updatePackage,
  deletePackage,
  togglePackageStatus
} from "../services/packagesService";
import { getServices } from "../services/servicesService";
import {
  notifyDataChange,
  useDataSync,
  SYNC_ENTITIES
} from "../../../../shared/services/dataSyncService";

// Catálogo de servicios por defecto para componer paquetes
export const availableServicesList = [
  { id_servicio: 1, nombre: "Corte Clásico", precio: 15000, duracion_minutos: 30 },
  { id_servicio: 2, nombre: "Corte + Barba", precio: 25000, duracion_minutos: 45 },
  { id_servicio: 3, nombre: "Afeitado Premium", precio: 20000, duracion_minutos: 35 },
  { id_servicio: 4, nombre: "Diseño y Color", precio: 30000, duracion_minutos: 60 },
  { id_servicio: 5, nombre: "Corte Niño", precio: 12000, duracion_minutos: 20 }
];

// Paquetes predeterminados (tabla paquete_servicio y puente paquete_servicio_detalle)
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
  const [servicesList, setServicesList] = useState(availableServicesList);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadPackagesData = useCallback(async () => {
    try {
      const [pkgsData, srvsData] = await Promise.allSettled([
        getPackages(),
        getServices()
      ]);

      if (pkgsData.status === "fulfilled" && Array.isArray(pkgsData.value)) {
        setPackages(pkgsData.value);
        try {
          localStorage.setItem("barber_packages_db", JSON.stringify(pkgsData.value));
        } catch (_) {}
      }

      if (srvsData.status === "fulfilled" && Array.isArray(srvsData.value) && srvsData.value.length > 0) {
        setServicesList(srvsData.value);
      }
    } catch (err) {
      console.warn("[Packages] Error al sincronizar paquetes o servicios:", err.message);
    }
  }, []);

  useEffect(() => {
    loadPackagesData();
  }, [loadPackagesData]);

  useDataSync([SYNC_ENTITIES.SERVICES, SYNC_ENTITIES.PACKAGES], loadPackagesData);

  const filteredPackages = packages.filter((p) => {
    const matchesSearch = (p.nombre || "").toLowerCase().includes(searchTerm.toLowerCase().trim());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && p.estado === 1) ||
      (statusFilter === "inactive" && p.estado === 0);
    return matchesSearch && matchesStatus;
  });

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

    let newPkg;
    try {
      const created = await createPackage(payload);
      const nextId = created?.id_paquete || Math.max(...packages.map((p) => p.id_paquete || 0), 0) + 1;
      newPkg = {
        ...payload,
        id_paquete: nextId,
        estado: 1
      };
      setPackages((prev) => {
        const next = [newPkg, ...prev];
        try { localStorage.setItem("barber_packages_db", JSON.stringify(next)); } catch (_) {}
        return next;
      });
      setShowCreateModal(false);
      resetForm();
      notifyDataChange(SYNC_ENTITIES.PACKAGES, newPkg);
      toast.success("Paquete de servicios creado exitosamente.");
    } catch (err) {
      const nextId = Math.max(...packages.map((p) => p.id_paquete || 0), 0) + 1;
      newPkg = {
        ...payload,
        id_paquete: nextId,
        estado: 1
      };
      setPackages((prev) => {
        const next = [newPkg, ...prev];
        try { localStorage.setItem("barber_packages_db", JSON.stringify(next)); } catch (_) {}
        return next;
      });
      setShowCreateModal(false);
      resetForm();
      notifyDataChange(SYNC_ENTITIES.PACKAGES, newPkg);
      toast.success("Paquete de servicios creado exitosamente.");
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
    } catch (err) {
      console.warn("[Packages] Fallback local para actualización:", err.message);
    }

    setPackages((prev) => {
      const next = prev.map((p) =>
        p.id_paquete === selectedPackage.id_paquete
          ? { ...p, ...payload }
          : p
      );
      try { localStorage.setItem("barber_packages_db", JSON.stringify(next)); } catch (_) {}
      return next;
    });
    setShowEditModal(false);
    setSelectedPackage(null);
    resetForm();
    notifyDataChange(SYNC_ENTITIES.PACKAGES, { id_paquete: selectedPackage.id_paquete, ...payload });
    toast.success("Paquete actualizado correctamente.");
  };

  const toggleStatus = async (id) => {
    try {
      await togglePackageStatus(id);
    } catch (err) {
      console.warn("[Packages] Fallback local para cambio de estado:", err.message);
    }

    setPackages((prev) => {
      const next = prev.map((p) =>
        p.id_paquete === id ? { ...p, estado: p.estado === 1 ? 0 : 1 } : p
      );
      try { localStorage.setItem("barber_packages_db", JSON.stringify(next)); } catch (_) {}
      return next;
    });
    setShowDeactivateModal(false);
    notifyDataChange(SYNC_ENTITIES.PACKAGES, { id_paquete: id, toggled: true });
    toast.success("Estado del paquete actualizado.");
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
    const list = servicesList && servicesList.length > 0 ? servicesList : availableServicesList;
    return (servicios_ids || [])
      .map((id) => list.find((s) => s.id_servicio === Number(id))?.nombre)
      .filter(Boolean);
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const openDeleteModal = (pkg) => {
    setSelectedPackage(pkg);
    setShowDeleteModal(true);
  };

  const handleDelete = async (pkgId) => {
    const targetId = pkgId || selectedPackage?.id_paquete;
    if (!targetId) return;

    try {
      await deletePackage(targetId);
      setPackages((prev) => {
        const next = prev.filter((p) => p.id_paquete !== targetId);
        try { localStorage.setItem("barber_packages_db", JSON.stringify(next)); } catch (_) {}
        return next;
      });
      setShowDeleteModal(false);
      setSelectedPackage(null);
      notifyDataChange(SYNC_ENTITIES.PACKAGES, { id_paquete: targetId, deleted: true });
      toast.success("Paquete de servicios eliminado correctamente.");
    } catch (err) {
      console.warn("[Packages] Error al eliminar paquete:", err.message);
      toast.error(err.message || "No se pudo eliminar el paquete.");
      setShowDeleteModal(false);
      setSelectedPackage(null);
    }
  };

  return {
    packages,
    filteredPackages,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    formData,
    setFormData,
    showCreateModal,
    setShowCreateModal,
    showEditModal,
    setShowEditModal,
    showDeactivateModal,
    setShowDeactivateModal,
    showDeleteModal,
    setShowDeleteModal,
    selectedPackage,
    setSelectedPackage,
    resetForm,
    handleCreate,
    handleEdit,
    handleDelete,
    toggleStatus,
    openEditModal,
    openDeactivateModal,
    openDeleteModal,
    toggleServiceInForm,
    getServiceNames,
    availableServicesList: servicesList && servicesList.length > 0 ? servicesList : availableServicesList
  };
}
