import { useState } from "react";

const mockSuppliers = [
  {
    id_proveedor: 1,
    nombre: "Distribuidora Barber Pro Colombia",
    nit: "901234567-1",
    telefono: "+57 310 987 6543",
    correo: "ventas@barberpro.com.co",
    direccion: "Carrera 43A # 18-50, Medellín",
    estado: 1
  },
  {
    id_proveedor: 2,
    nombre: "Cosméticos & Cuidado Capilar S.A.S.",
    nit: "900876543-2",
    telefono: "+57 320 456 7890",
    correo: "contacto@cosmeticoscapilar.com",
    direccion: "Calle 100 # 19-61, Bogotá",
    estado: 1
  },
  {
    id_proveedor: 3,
    nombre: "Herramientas & Barber Supplies",
    nit: "800345678-9",
    telefono: "+57 315 678 1234",
    correo: "pedidos@barbersupplies.co",
    direccion: "Av. Roosevelt # 34-12, Cali",
    estado: 1
  },
  {
    id_proveedor: 4,
    nombre: "Insumos y Lociones del Valle",
    nit: "901567890-4",
    telefono: "+57 318 234 5678",
    correo: "insumosvalle@gmail.com",
    direccion: "Calle 26 # 6N-45, Palmira",
    estado: 1
  },
  {
    id_proveedor: 5,
    nombre: "Navajas & Acero Premium Ltd",
    nit: "900654321-7",
    telefono: "+57 300 789 0123",
    correo: "info@acerosbarber.com",
    direccion: "Calle 12 # 4-80, Bucaramanga",
    estado: 0
  }
];

const emptyForm = {
  nombre: "",
  nit: "",
  telefono: "",
  correo: "",
  direccion: "",
  estado: 1
};

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState(mockSuppliers);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | '1' | '0'
  const [viewMode, setViewMode] = useState("cards"); // 'cards' | 'table'
  const [sortField, setSortField] = useState("nombre");
  const [sortDir, setSortDir] = useState("asc");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const filteredSuppliers = suppliers
    .filter((sup) => {
      const search = searchTerm.toLowerCase().trim();
      const matchesSearch =
        search === "" ||
        sup.nombre.toLowerCase().includes(search) ||
        (sup.nit || "").toLowerCase().includes(search) ||
        (sup.telefono || "").toLowerCase().includes(search) ||
        (sup.correo || "").toLowerCase().includes(search) ||
        (sup.direccion || "").toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "1" && sup.estado === 1) ||
        (statusFilter === "0" && sup.estado === 0);

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const valA = (a[sortField] ?? "").toString().toLowerCase();
      const valB = (b[sortField] ?? "").toString().toLowerCase();
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all";

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  const resetForm = () => setFormData(emptyForm);

  const handleCreate = () => {
    const nextId = Math.max(...suppliers.map((s) => s.id_proveedor), 0) + 1;
    const newSupplier = {
      id_proveedor: nextId,
      nombre: formData.nombre.trim(),
      nit: formData.nit ? formData.nit.trim() : null,
      telefono: formData.telefono ? formData.telefono.trim() : null,
      correo: formData.correo ? formData.correo.trim() : null,
      direccion: formData.direccion ? formData.direccion.trim() : null,
      estado: formData.estado !== undefined ? Number(formData.estado) : 1
    };

    setSuppliers([newSupplier, ...suppliers]);
    setShowCreateModal(false);
    resetForm();
    return newSupplier;
  };

  const handleEdit = () => {
    if (!selectedSupplier) return;
    setSuppliers(
      suppliers.map((sup) =>
        sup.id_proveedor === selectedSupplier.id_proveedor
          ? {
              ...sup,
              nombre: formData.nombre.trim(),
              nit: formData.nit ? formData.nit.trim() : null,
              telefono: formData.telefono ? formData.telefono.trim() : null,
              correo: formData.correo ? formData.correo.trim() : null,
              direccion: formData.direccion ? formData.direccion.trim() : null,
              estado: formData.estado !== undefined ? Number(formData.estado) : sup.estado
            }
          : sup
      )
    );
    setShowEditModal(false);
    setSelectedSupplier(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!selectedSupplier) return;
    setSuppliers(suppliers.filter((sup) => sup.id_proveedor !== selectedSupplier.id_proveedor));
    setShowDeleteModal(false);
    setSelectedSupplier(null);
  };

  const toggleStatus = (supplierId) => {
    setSuppliers(
      suppliers.map((sup) =>
        sup.id_proveedor === supplierId
          ? { ...sup, estado: sup.estado === 1 ? 0 : 1 }
          : sup
      )
    );
  };

  const handleExport = () => {
    const headers = ["ID", "Nombre", "NIT", "Teléfono", "Correo", "Dirección", "Estado"];
    const csvContent = [
      headers.join(","),
      ...filteredSuppliers.map((s) =>
        [
          s.id_proveedor,
          `"${s.nombre}"`,
          `"${s.nit || ''}"`,
          `"${s.telefono || ''}"`,
          `"${s.correo || ''}"`,
          `"${s.direccion || ''}"`,
          `"${s.estado === 1 ? 'Activo' : 'Inactivo'}"`
        ].join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `proveedores_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      nombre: supplier.nombre || "",
      nit: supplier.nit || "",
      telefono: supplier.telefono || "",
      correo: supplier.correo || "",
      direccion: supplier.direccion || "",
      estado: supplier.estado ?? 1
    });
    setShowEditModal(true);
  };

  const openDetailModal = (supplier) => {
    setSelectedSupplier(supplier);
    setShowDetailModal(true);
  };

  const openDeleteModal = (supplier) => {
    setSelectedSupplier(supplier);
    setShowDeleteModal(true);
  };

  const openDeactivateModal = (supplier) => {
    setSelectedSupplier(supplier);
    setShowDeactivateModal(true);
  };

  const stats = {
    total: suppliers.length,
    activos: suppliers.filter((s) => s.estado === 1).length,
    inactivos: suppliers.filter((s) => s.estado === 0).length
  };

  return {
    suppliers,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    hasActiveFilters,
    resetFilters,
    viewMode,
    setViewMode,
    sortField,
    sortDir,
    handleSort,
    filteredSuppliers,
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
    showDeactivateModal,
    setShowDeactivateModal,
    selectedSupplier,
    setSelectedSupplier,
    resetForm,
    handleCreate,
    handleEdit,
    handleDelete,
    toggleStatus,
    handleExport,
    openCreateModal,
    openEditModal,
    openDetailModal,
    openDeleteModal,
    openDeactivateModal,
    stats
  };
}
