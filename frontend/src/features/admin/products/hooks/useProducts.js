import { useState } from "react";
import { CATEGORIAS_PRODUCTO } from "../../../../shared/types/database";

const mockProducts = [
  { id_producto: 1, nombre: "Gel para Cabello", id_categoria_producto: 1, stock: 25, precio: 15000, imagen_url: "", estado: 1 },
  { id_producto: 2, nombre: "Cera Modeladora", id_categoria_producto: 1, stock: 8, precio: 18000, imagen_url: "", estado: 1 },
  { id_producto: 3, nombre: "Shampoo Premium", id_categoria_producto: 2, stock: 15, precio: 22000, imagen_url: "", estado: 1 },
  { id_producto: 4, nombre: "Aceite para Barba", id_categoria_producto: 3, stock: 2, precio: 25000, imagen_url: "", estado: 1 },
  { id_producto: 5, nombre: "Navaja Profesional", id_categoria_producto: 4, stock: 0, precio: 45000, imagen_url: "", estado: 0 },
  { id_producto: 6, nombre: "Tijeras Profesionales", id_categoria_producto: 4, stock: 12, precio: 65000, imagen_url: "", estado: 1 },
  { id_producto: 7, nombre: "Peine de Carbono", id_categoria_producto: 4, stock: 30, precio: 8000, imagen_url: "", estado: 1 },
  { id_producto: 8, nombre: "Bálsamo para Barba", id_categoria_producto: 3, stock: 18, precio: 20000, imagen_url: "", estado: 1 }
];

export const categories = CATEGORIAS_PRODUCTO;

const emptyForm = {
  nombre: "",
  id_categoria_producto: 1,
  stock: 0,
  precio: 0,
  imagen_url: ""
};

export function useProducts() {
  const [products, setProducts] = useState(mockProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("nombre");
  const [sortDir, setSortDir] = useState("asc");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
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
      const catName = getCategoryName(product.id_categoria_producto);
      return (
        product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        catName.toLowerCase().includes(searchTerm.toLowerCase())
      );
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

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const lowStockCount = products.filter((p) => p.stock <= 5).length;

  const resetForm = () => setFormData(emptyForm);

  const handleCreate = () => {
    const newProduct = {
      id_producto: Math.max(...products.map((p) => p.id_producto), 0) + 1,
      nombre: formData.nombre,
      id_categoria_producto: Number(formData.id_categoria_producto),
      stock: Number(formData.stock),
      precio: Number(formData.precio),
      imagen_url: formData.imagen_url || null,
      estado: 1
    };
    setProducts([...products, newProduct]);
    setShowCreateModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedProduct) return;
    setProducts(
      products.map((product) =>
        product.id_producto === selectedProduct.id_producto
          ? {
              ...product,
              nombre: formData.nombre,
              id_categoria_producto: Number(formData.id_categoria_producto),
              stock: Number(formData.stock),
              precio: Number(formData.precio),
              imagen_url: formData.imagen_url || null
            }
          : product
      )
    );
    setShowEditModal(false);
    setSelectedProduct(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!selectedProduct) return;
    setProducts(products.filter((product) => product.id_producto !== selectedProduct.id_producto));
    setShowDeleteModal(false);
    setSelectedProduct(null);
  };

  const toggleStatus = (productId) => {
    setProducts(
      products.map((product) =>
        product.id_producto === productId ? { ...product, estado: product.estado === 1 ? 0 : 1 } : product
      )
    );
  };

  const handleExport = () => {
    const headers = ["ID", "Nombre", "Categoría", "Stock", "Precio", "Estado"];
    const csvContent = [
      headers.join(","),
      ...filteredProducts.map(
        (p) => `${p.id_producto},"${p.nombre}","${getCategoryName(p.id_categoria_producto)}",${p.stock},${p.precio},"${p.estado === 1 ? "Activo" : "Inactivo"}"`
      )
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `productos_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
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

  const onSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return {
    searchTerm,
    onSearchChange,
    sortField,
    sortDir,
    handleSort,
    paginatedProducts,
    filteredProducts,
    totalPages,
    currentPage,
    setCurrentPage,
    itemsPerPage,
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
