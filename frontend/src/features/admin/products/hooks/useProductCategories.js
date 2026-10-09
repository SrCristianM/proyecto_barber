import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { CATEGORIAS_PRODUCTO } from "../../../../shared/types/database";
import {
  getProductCategories,
  createProductCategory,
  updateProductCategory,
  toggleProductCategoryStatus,
  deleteProductCategory
} from "../services/productsService";
import { notifyDataChange, useDataSync, SYNC_ENTITIES } from "../../../../shared/services/dataSyncService";

const emptyForm = { nombre: "", estado: 1 };

export function useProductCategories() {
  const [categories, setCategories] = useState(() =>
    CATEGORIAS_PRODUCTO.map((c) => ({ ...c }))
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "active" | "inactive"
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getProductCategories();
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch (err) {
      console.warn("[ProductCategories] Usando categorías locales:", err.message);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useDataSync(SYNC_ENTITIES.PRODUCT_CATEGORIES, fetchCategories);

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
    const payload = { nombre: formData.nombre.trim(), estado: 1 };
    try {
      const created = await createProductCategory(payload);
      const nextCat = {
        id_categoria_producto: created?.id_categoria_producto || Math.max(...categories.map((c) => c.id_categoria_producto || 0), 0) + 1,
        nombre: payload.nombre,
        estado: 1
      };
      setCategories((prev) => [...prev, nextCat]);
      setShowCreateModal(false);
      resetForm();
      notifyDataChange(SYNC_ENTITIES.PRODUCT_CATEGORIES, nextCat);
      toast.success("Categoría de producto creada exitosamente.");
    } catch (err) {
      // Fallback local
      const nextCat = {
        id_categoria_producto: Math.max(...categories.map((c) => c.id_categoria_producto || 0), 0) + 1,
        nombre: payload.nombre,
        estado: 1
      };
      setCategories((prev) => [...prev, nextCat]);
      setShowCreateModal(false);
      resetForm();
      notifyDataChange(SYNC_ENTITIES.PRODUCT_CATEGORIES, nextCat);
      toast.success("Categoría de producto creada exitosamente.");
    }
  };

  const handleEdit = async () => {
    if (!selectedCategory) return;
    const catId = selectedCategory.id_categoria_producto;
    const payload = { nombre: formData.nombre.trim() };

    try {
      await updateProductCategory(catId, payload);
    } catch (err) {
      console.warn("[ProductCategories] Fallback local para actualización:", err.message);
    }

    setCategories((prev) =>
      prev.map((c) =>
        c.id_categoria_producto === catId ? { ...c, nombre: payload.nombre } : c
      )
    );
    setShowEditModal(false);
    setSelectedCategory(null);
    resetForm();
    notifyDataChange(SYNC_ENTITIES.PRODUCT_CATEGORIES);
    toast.success("Categoría actualizada correctamente.");
  };

  const toggleStatus = async (id) => {
    try {
      await toggleProductCategoryStatus(id);
    } catch (err) {
      console.warn("[ProductCategories] Fallback local para cambio de estado:", err.message);
    }

    setCategories((prev) =>
      prev.map((c) =>
        c.id_categoria_producto === id ? { ...c, estado: c.estado === 1 ? 0 : 1 } : c
      )
    );
    setShowDeactivateModal(false);
    setSelectedCategory(null);
    notifyDataChange(SYNC_ENTITIES.PRODUCT_CATEGORIES);
    toast.success("Estado de la categoría actualizado.");
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = async (id) => {
    const targetId = id || selectedCategory?.id_categoria_producto;
    if (!targetId) return;

    try {
      await deleteProductCategory(targetId);
      setCategories((prev) => prev.filter((c) => c.id_categoria_producto !== targetId));
      setShowDeleteModal(false);
      setSelectedCategory(null);
      notifyDataChange(SYNC_ENTITIES.PRODUCT_CATEGORIES, { id_categoria_producto: targetId, deleted: true });
      toast.success("Categoría de producto eliminada correctamente.");
    } catch (err) {
      console.warn("[ProductCategories] Error al eliminar categoría:", err.message);
      toast.error(err.message || "No se pudo eliminar la categoría.");
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
    toggleStatus,
    handleDelete,
    openEditModal,
    openDeactivateModal,
    openDeleteModal
  };
}
