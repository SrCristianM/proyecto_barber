import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { CATEGORIAS_PRODUCTO } from "../../../../shared/types/database";
import { exportToStyledExcel } from "../../../../shared/utils/excelExporter";
import {
  getProducts,
  getProductCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus
} from "../services/productsService";
import {
  notifyDataChange,
  useDataSync,
  SYNC_ENTITIES
} from "../../../../shared/services/dataSyncService";

let liveCategories = [...CATEGORIAS_PRODUCTO];

export const categories = new Proxy([], {
  get(target, prop) {
    const val = liveCategories[prop];
    if (typeof val === "function") return val.bind(liveCategories);
    return val;
  }
});

const emptyForm = {
  nombre: "",
  id_categoria_producto: 1,
  stock: 0,
  precio: 0,
  imagen_url: "",
  estado: 1
};

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState(liveCategories);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | '1' | '0'
  const [categoryFilter, setCategoryFilter] = useState("all"); // 'all' | id_categoria
  const [viewMode, setViewMode] = useState("cards"); // 'cards' | 'table'
  const [sortField, setSortField] = useState("nombre");
  const [sortDir, setSortDir] = useState("asc");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getProductCategories();
      if (Array.isArray(data)) {
        liveCategories = data;
        setCategoriesList(data);
      }
    } catch (err) {
      console.warn("[Products] Usando categorías por fallback:", err.message);
    }
  }, []);

  const fetchProductsList = useCallback(async () => {
    try {
      const data = await getProducts();
      if (Array.isArray(data)) {
        setProducts(data);
        try { localStorage.setItem("barber_products_db", JSON.stringify(data)); } catch (_) {}
      }
    } catch (err) {
      console.warn("[Products] Usando datos de respaldo local:", err.message);
    }
  }, []);

  useEffect(() => {
    fetchProductsList();
    fetchCategories();
  }, [fetchProductsList, fetchCategories]);

  useDataSync([SYNC_ENTITIES.PRODUCTS], fetchProductsList);
  useDataSync([SYNC_ENTITIES.PRODUCT_CATEGORIES], fetchCategories);

  const getCategoryName = (id_cat) => {
    const c = categoriesList.find((cat) => cat.id_categoria_producto === Number(id_cat));
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

  const filteredProducts = products
    .filter((product) => {
      const search = searchTerm.toLowerCase().trim();
      const matchesSearch =
        search === "" ||
        product.nombre.toLowerCase().includes(search) ||
        getCategoryName(product.id_categoria_producto).toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "1" && product.estado === 1) ||
        (statusFilter === "0" && product.estado === 0);

      const matchesCategory =
        categoryFilter === "all" || String(product.id_categoria_producto) === String(categoryFilter);

      return matchesSearch && matchesStatus && matchesCategory;
    })
    .sort((a, b) => {
      if (sortField === "stock" || sortField === "precio") {
        return sortDir === "asc" ? a[sortField] - b[sortField] : b[sortField] - a[sortField];
      }
      const valA = (a[sortField] ?? "").toString().toLowerCase();
      const valB = (b[sortField] ?? "").toString().toLowerCase();
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const lowStockCount = products.filter((p) => p.stock <= 5).length;
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
      id_categoria_producto: Number(formData.id_categoria_producto),
      stock: Number(formData.stock),
      precio: Number(formData.precio),
      imagen_url: formData.imagen_url || null,
      estado: 1
    };

    try {
      const created = await createProduct(payload);
      const newProduct = {
        ...payload,
        id_producto: created?.id_producto || Math.max(...products.map((p) => p.id_producto), 0) + 1
      };
      setProducts((prev) => {
        const next = [newProduct, ...prev];
        try { localStorage.setItem("barber_products_db", JSON.stringify(next)); } catch (_) {}
        return next;
      });
      setShowCreateModal(false);
      resetForm();
      notifyDataChange(SYNC_ENTITIES.PRODUCTS, newProduct);
      toast.success("Producto creado exitosamente en el catálogo.");
    } catch (err) {
      toast.error(err.message || "Error al crear el producto.");
    }
  };

  const handleEdit = async () => {
    if (!selectedProduct) return;
    const payload = {
      nombre: formData.nombre.trim(),
      id_categoria_producto: Number(formData.id_categoria_producto),
      stock: Number(formData.stock),
      precio: Number(formData.precio),
      imagen_url: formData.imagen_url || null
    };

    try {
      await updateProduct(selectedProduct.id_producto, payload);
      setProducts((prev) => {
        const next = prev.map((product) =>
          product.id_producto === selectedProduct.id_producto
            ? { ...product, ...payload }
            : product
        );
        try { localStorage.setItem("barber_products_db", JSON.stringify(next)); } catch (_) {}
        return next;
      });
      setShowEditModal(false);
      setSelectedProduct(null);
      resetForm();
      notifyDataChange(SYNC_ENTITIES.PRODUCTS, { id_producto: selectedProduct.id_producto, ...payload });
      toast.success("Producto actualizado correctamente.");
    } catch (err) {
      toast.error(err.message || "Error al actualizar el producto.");
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    try {
      await deleteProduct(selectedProduct.id_producto);
      setProducts((prev) => {
        const next = prev.filter((product) => product.id_producto !== selectedProduct.id_producto);
        try { localStorage.setItem("barber_products_db", JSON.stringify(next)); } catch (_) {}
        return next;
      });
      setShowDeleteModal(false);
      const deletedId = selectedProduct.id_producto;
      setSelectedProduct(null);
      notifyDataChange(SYNC_ENTITIES.PRODUCTS, { deleted: true, id_producto: deletedId });
      toast.success("Producto eliminado del catálogo.");
    } catch (err) {
      toast.error(err.message || "Error al eliminar el producto.");
    }
  };

  const toggleStatus = async (productId) => {
    try {
      await toggleProductStatus(productId);
      setProducts((prev) => {
        const next = prev.map((product) =>
          product.id_producto === productId ? { ...product, estado: product.estado === 1 ? 0 : 1 } : product
        );
        try { localStorage.setItem("barber_products_db", JSON.stringify(next)); } catch (_) {}
        return next;
      });
      notifyDataChange(SYNC_ENTITIES.PRODUCTS, { toggled: true, id_producto: productId });
      toast.success("Estado del producto actualizado.");
    } catch (err) {
      toast.error(err.message || "Error al cambiar estado del producto.");
    }
  };

  const handleExport = () => {
    exportToStyledExcel({
      title: "CATÁLOGO OFICIAL DE PRODUCTOS E INVENTARIO",
      subtitle: `Exportado el ${new Date().toLocaleDateString("es-CO")} - Tu Turno Barber ERP`,
      filename: `productos_${new Date().toISOString().split("T")[0]}.xls`,
      columns: [
        { header: "ID", key: "id_producto", width: 10, type: "number" },
        { header: "Nombre del Producto", key: "nombre", width: 30 },
        { header: "Categoría", key: "categoria", width: 22 },
        { header: "Stock Disponible", key: "stock", width: 16, type: "number" },
        { header: "Precio Unitario", key: "precio", width: 18, type: "currency" },
        { header: "Estado", key: "estado_nombre", width: 14 }
      ],
      data: filteredProducts.map((p) => ({
        ...p,
        categoria: getCategoryName(p.id_categoria_producto),
        stock: Number(p.stock),
        precio: Number(p.precio),
        estado_nombre: p.estado === 1 ? "Activo" : "Inactivo"
      }))
    });
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setFormData({
      nombre: product.nombre,
      id_categoria_producto: product.id_categoria_producto,
      stock: product.stock,
      precio: product.precio,
      imagen_url: product.imagen_url || "",
      estado: product.estado !== undefined ? product.estado : 1
    });
    setShowEditModal(true);
  };

  const openDetailModal = (product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  const openDeleteModal = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  return {
    products,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    hasActiveFilters,
    resetFilters,
    viewMode,
    setViewMode,
    sortField,
    sortDir,
    handleSort,
    filteredProducts,
    lowStockCount,
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
    selectedProduct,
    setSelectedProduct,
    resetForm,
    handleCreate,
    handleEdit,
    handleDelete,
    toggleStatus,
    handleExport,
    openEditModal,
    openDetailModal,
    openDeleteModal,
    getCategoryName,
    categories: categoriesList
  };
}
