import { useState, useEffect } from "react";
import { toast } from "sonner";
import { CATEGORIAS_PRODUCTO } from "../../../../shared/types/database";
import { exportToStyledExcel } from "../../../../shared/utils/excelExporter";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus
} from "../services/productsService";

const mockProducts = [];

export const categories = CATEGORIAS_PRODUCTO;

const emptyForm = {
  nombre: "",
  id_categoria_producto: 1,
  stock: 0,
  precio: 0,
  imagen_url: ""
};

export function useProducts() {
  const [products, setProducts] = useState([]);
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

  const getCategoryName = (id_cat) => {
    const c = CATEGORIAS_PRODUCTO.find((cat) => cat.id_categoria_producto === Number(id_cat));
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

  useEffect(() => {
    getProducts()
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
        }
      })
      .catch((err) => {
        console.warn("[Products] Usando datos de respaldo local:", err.message);
      });
  }, []);

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
      setProducts((prev) => [newProduct, ...prev]);
      setShowCreateModal(false);
      resetForm();
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
      setProducts((prev) =>
        prev.map((product) =>
          product.id_producto === selectedProduct.id_producto
            ? { ...product, ...payload }
            : product
        )
      );
      setShowEditModal(false);
      setSelectedProduct(null);
      resetForm();
      toast.success("Producto actualizado correctamente.");
    } catch (err) {
      toast.error(err.message || "Error al actualizar el producto.");
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    try {
      await deleteProduct(selectedProduct.id_producto);
      setProducts((prev) => prev.filter((product) => product.id_producto !== selectedProduct.id_producto));
      setShowDeleteModal(false);
      setSelectedProduct(null);
      toast.success("Producto eliminado del catálogo.");
    } catch (err) {
      toast.error(err.message || "Error al eliminar el producto.");
    }
  };

  const toggleStatus = async (productId) => {
    try {
      await toggleProductStatus(productId);
      setProducts((prev) =>
        prev.map((product) =>
          product.id_producto === productId ? { ...product, estado: product.estado === 1 ? 0 : 1 } : product
        )
      );
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
      imagen_url: product.imagen_url || ""
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
    getCategoryName
  };
}
