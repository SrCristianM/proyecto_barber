import { useState } from "react";
import { CATEGORIAS_PRODUCTO } from "../../../../shared/types/database";

const emptyForm = { nombre: "", estado: 1 };

export function useProductCategories() {
  const [categories, setCategories] = useState(
    // Clonamos los objetos para que el estado sea independiente
    CATEGORIAS_PRODUCTO.map((c) => ({ ...c }))
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "active" | "inactive"
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const filteredCategories = categories.filter((c) => {
    const matchesSearch = c.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && c.estado === 1) ||
      (statusFilter === "inactive" && c.estado === 0);
    return matchesSearch && matchesStatus;
  });

  const resetForm = () => setFormData(emptyForm);

  const handleCreate = () => {
    const next = {
      id_categoria_producto: Math.max(...categories.map((c) => c.id_categoria_producto), 0) + 1,
      nombre: formData.nombre.trim(),
      estado: 1
    };
    setCategories([...categories, next]);
    setShowCreateModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedCategory) return;
    setCategories(
      categories.map((c) =>
        c.id_categoria_producto === selectedCategory.id_categoria_producto
          ? { ...c, nombre: formData.nombre.trim() }
          : c
      )
    );
    setShowEditModal(false);
    setSelectedCategory(null);
    resetForm();
  };

  const toggleStatus = (id) => {
    setCategories(
      categories.map((c) =>
        c.id_categoria_producto === id ? { ...c, estado: c.estado === 1 ? 0 : 1 } : c
      )
    );
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
    selectedCategory,
    setSelectedCategory,
    resetForm,
    handleCreate,
    handleEdit,
    toggleStatus,
    openEditModal,
    openDeactivateModal
  };
}
