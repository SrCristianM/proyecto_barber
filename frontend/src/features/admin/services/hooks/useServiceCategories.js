import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { CATEGORIAS_SERVICIO } from "../../../../shared/types/database";
import {
  getServiceCategories,
  createServiceCategory,
  updateServiceCategory,
  toggleServiceCategoryStatus,
  deleteServiceCategory
} from "../services/servicesService";
import {
  notifyDataChange,
  useDataSync,
  SYNC_ENTITIES
} from "../../../../shared/services/dataSyncService";

const emptyForm = { nombre: "", estado: 1 };

export function useServiceCategories() {
  const [categories, setCategories] = useState(() =>
    CATEGORIAS_SERVICIO.map((c) => ({ ...c }))
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getServiceCategories();
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch (err) {
      console.warn("[ServiceCategories] Usando categorías locales:", err.message);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useDataSync([SYNC_ENTITIES.SERVICE_CATEGORIES], fetchCategories);

  const filteredCategories = categories.filter((c) => {
    const matchesSearch = (c.nombre || "").toLowerCase().includes(searchTerm.toLowerCase().trim());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && c.estado === 1) ||
      (statusFilter === "inactive" && c.estado === 0);
    return matchesSearch && matchesStatus;
  });

  const resetForm = () => setFormData(emptyForm);

  const handleCreate = async () => {
    const payload = {
      nombre: formData.nombre.trim(),
      estado: 1
    };

    try {
      const created = await createServiceCategory(payload);
      const next = {
        ...payload,
        id_categoria_servicio: created?.id_categoria_servicio || Math.max(...categories.map((c) => c.id_categoria_servicio), 0) + 1
      };
      setCategories((prev) => [...prev, next]);
      setShowCreateModal(false);
      resetForm();
      notifyDataChange(SYNC_ENTITIES.SERVICE_CATEGORIES, next);
    } catch (err) {
      const next = {
        id_categoria_servicio: Math.max(...categories.map((c) => c.id_categoria_servicio), 0) + 1,
        ...payload
      };
      setCategories((prev) => [...prev, next]);
      setShowCreateModal(false);
      resetForm();
      notifyDataChange(SYNC_ENTITIES.SERVICE_CATEGORIES, next);
    }
  };

  const handleEdit = async () => {
    if (!selectedCategory) return;
    const payload = { nombre: formData.nombre.trim() };

    try {
      await updateServiceCategory(selectedCategory.id_categoria_servicio, payload);
    } catch (err) {
      console.warn("[ServiceCategories] Fallback local edición:", err.message);
    }

    setCategories((prev) =>
      prev.map((c) =>
        c.id_categoria_servicio === selectedCategory.id_categoria_servicio
          ? { ...c, nombre: payload.nombre }
          : c
      )
    );
    setShowEditModal(false);
    setSelectedCategory(null);
    resetForm();
    notifyDataChange(SYNC_ENTITIES.SERVICE_CATEGORIES, { id_categoria_servicio: selectedCategory.id_categoria_servicio, ...payload });
  };

  const toggleStatus = async (id) => {
    try {
      await toggleServiceCategoryStatus(id);
    } catch (err) {
      console.warn("[ServiceCategories] Fallback local toggle:", err.message);
    }

    setCategories((prev) =>
      prev.map((c) =>
        c.id_categoria_servicio === id ? { ...c, estado: c.estado === 1 ? 0 : 1 } : c
      )
    );
    notifyDataChange(SYNC_ENTITIES.SERVICE_CATEGORIES, { id_categoria_servicio: id, toggled: true });
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = async (id) => {
    const targetId = id || selectedCategory?.id_categoria_servicio;
    if (!targetId) return;

    try {
      await deleteServiceCategory(targetId);
      setCategories((prev) => prev.filter((c) => c.id_categoria_servicio !== targetId));
      setShowDeleteModal(false);
      setSelectedCategory(null);
      notifyDataChange(SYNC_ENTITIES.SERVICE_CATEGORIES, { id_categoria_servicio: targetId, deleted: true });
      toast.success("Categoría de servicio eliminada correctamente");
    } catch (err) {
      console.warn("[ServiceCategories] Error al eliminar categoría:", err.message);
      toast.error(err.message || "No se pudo eliminar la categoría");
      setShowDeleteModal(false);
      setSelectedCategory(null);
    }
  };

  const openEditModal = (cat) => {
    setSelectedCategory(cat);
    setFormData({ nombre: cat.nombre, estado: cat.estado });
    setShowEditModal(true);
  };

  const openDeactivateModal = (cat) => {
    setSelectedCategory(cat);
    setShowDeactivateModal(true);
  };

  const openDeleteModal = (cat) => {
    setSelectedCategory(cat);
    setShowDeleteModal(true);
  };

  return {
    categories,
    filteredCategories,
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
    selectedCategory,
    setSelectedCategory,
    resetForm,
    handleCreate,
    handleEdit,
    handleDelete,
    toggleStatus,
    openEditModal,
    openDeactivateModal,
    openDeleteModal
  };
}
