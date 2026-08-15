import { useState } from "react";

const mockProducts = [
  { id: 1, name: "Gel para Cabello", category: "Estilizado", stock: 25, minStock: 10, price: 15000, status: "Disponible", description: "Gel profesional para peinado" },
  { id: 2, name: "Cera Modeladora", category: "Estilizado", stock: 8, minStock: 10, price: 18000, status: "Stock Bajo", description: "Cera de alta fijación" },
  { id: 3, name: "Shampoo Premium", category: "Cuidado", stock: 15, minStock: 10, price: 22000, status: "Disponible", description: "Shampoo nutritivo premium" },
  { id: 4, name: "Aceite para Barba", category: "Barba", stock: 2, minStock: 10, price: 25000, status: "Stock Bajo", description: "Aceite nutritivo para barba" },
  { id: 5, name: "Navaja Profesional", category: "Herramientas", stock: 0, minStock: 5, price: 45000, status: "Agotado", description: "Navaja de acero inoxidable" },
  { id: 6, name: "Tijeras Profesionales", category: "Herramientas", stock: 12, minStock: 5, price: 65000, status: "Disponible", description: "Tijeras de corte profesional" },
  { id: 7, name: "Peine de Carbono", category: "Herramientas", stock: 30, minStock: 15, price: 8000, status: "Disponible", description: "Peine antiestático" },
  { id: 8, name: "Bálsamo para Barba", category: "Barba", stock: 18, minStock: 10, price: 20000, status: "Disponible", description: "Bálsamo hidratante" }
];

export const categories = ["Estilizado", "Cuidado", "Barba", "Herramientas"];

const emptyForm = { name: "", category: "Estilizado", stock: 0, minStock: 10, price: 0, description: "" };

const getStatusFromStock = (stock, minStock) => {
  if (stock === 0) return "Agotado";
  if (stock < minStock) return "Stock Bajo";
  return "Disponible";
};

export function useProducts() {
  const [products, setProducts] = useState(mockProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [formData, setFormData] = useState(emptyForm);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const filteredProducts = products
    .filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let valA, valB;
      if (sortField === "stock" || sortField === "price") {
        valA = a[sortField];
        valB = b[sortField];
      } else {
        valA = (a[sortField] ?? "").toString().toLowerCase();
        valB = (b[sortField] ?? "").toString().toLowerCase();
      }
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const lowStockCount = products.filter((p) => p.stock < p.minStock).length;

  const resetForm = () => setFormData(emptyForm);

  const handleCreate = () => {
    const newProduct = {
      id: Math.max(...products.map((p) => p.id)) + 1,
      name: formData.name,
      category: formData.category,
      stock: formData.stock,
      minStock: formData.minStock,
      price: formData.price,
      status: getStatusFromStock(formData.stock, formData.minStock),
      description: formData.description
    };
    setProducts([...products, newProduct]);
    setShowCreateModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedProduct) return;
    setProducts(
      products.map((product) =>
        product.id === selectedProduct.id
          ? {
              ...product,
              name: formData.name,
              category: formData.category,
              stock: formData.stock,
              minStock: formData.minStock,
              price: formData.price,
              description: formData.description,
              status: getStatusFromStock(formData.stock, formData.minStock)
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
    setProducts(products.filter((product) => product.id !== selectedProduct.id));
    setShowDeleteModal(false);
    setSelectedProduct(null);
  };

  const handleExport = () => {
    const headers = ["ID", "Nombre", "Categoría", "Stock", "Stock Mínimo", "Precio", "Estado"];
    const csvContent = [
      headers.join(","),
      ...filteredProducts.map(
        (p) => `${p.id},"${p.name}","${p.category}",${p.stock},${p.minStock},${p.price},"${p.status}"`
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
      name: product.name,
      category: product.category,
      stock: product.stock,
      minStock: product.minStock,
      price: product.price,
      description: product.description || ""
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
    handleExport,
    openEditModal,
    openDetailModal,
    openDeleteModal
  };
}
