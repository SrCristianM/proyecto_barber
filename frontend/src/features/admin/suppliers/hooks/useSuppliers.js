import { useState, useEffect } from "react";
import { toast } from "sonner";
import { exportToStyledExcel } from "../../../../shared/utils/excelExporter";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  toggleSupplierStatus
} from "../services/suppliersService";

const mockSuppliers = [];

const emptyForm = {
  nombre: "",
  nit: "",
  telefono: "",
  correo: "",
  direccion: "",
  estado: 1,
  factura_pdf: null
};

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
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

  useEffect(() => {
    getSuppliers()
      .then((data) => {
        if (Array.isArray(data)) {
          setSuppliers(data);
        }
      })
      .catch((err) => {
        console.warn("[Suppliers] Usando proveedores locales por fallback:", err.message);
      });
  }, []);

  const resetForm = () => setFormData(emptyForm);

  const handleCreate = async () => {
    const payload = {
      nombre: formData.nombre.trim(),
      nit: formData.nit ? formData.nit.trim() : null,
      telefono: formData.telefono ? formData.telefono.trim() : null,
      correo: formData.correo ? formData.correo.trim() : null,
      direccion: formData.direccion ? formData.direccion.trim() : null,
      estado: formData.estado !== undefined ? Number(formData.estado) : 1,
      factura_pdf: formData.factura_pdf || null
    };

    try {
      const created = await createSupplier(payload);
      const newSupplier = {
        ...payload,
        id_proveedor: created?.id_proveedor || Math.max(...suppliers.map((s) => s.id_proveedor), 0) + 1
      };
      setSuppliers((prev) => [newSupplier, ...prev]);
      setShowCreateModal(false);
      resetForm();
      toast.success("Proveedor registrado exitosamente.");
      return newSupplier;
    } catch (err) {
      toast.error(err.message || "Error al registrar el proveedor.");
    }
  };

  const handleEdit = async () => {
    if (!selectedSupplier) return;
    const payload = {
      nombre: formData.nombre.trim(),
      nit: formData.nit ? formData.nit.trim() : null,
      telefono: formData.telefono ? formData.telefono.trim() : null,
      correo: formData.correo ? formData.correo.trim() : null,
      direccion: formData.direccion ? formData.direccion.trim() : null,
      estado: formData.estado !== undefined ? Number(formData.estado) : selectedSupplier.estado,
      factura_pdf: formData.factura_pdf !== undefined ? formData.factura_pdf : selectedSupplier.factura_pdf
    };

    try {
      await updateSupplier(selectedSupplier.id_proveedor, payload);
      setSuppliers((prev) =>
        prev.map((sup) =>
          sup.id_proveedor === selectedSupplier.id_proveedor
            ? { ...sup, ...payload }
            : sup
        )
      );
      setShowEditModal(false);
      setSelectedSupplier(null);
      resetForm();
      toast.success("Proveedor actualizado correctamente.");
    } catch (err) {
      toast.error(err.message || "Error al actualizar el proveedor.");
    }
  };

  const handleDelete = async () => {
    if (!selectedSupplier) return;
    try {
      await deleteSupplier(selectedSupplier.id_proveedor);
      setSuppliers((prev) => prev.filter((sup) => sup.id_proveedor !== selectedSupplier.id_proveedor));
      setShowDeleteModal(false);
      setSelectedSupplier(null);
      toast.success("Proveedor eliminado.");
    } catch (err) {
      toast.error(err.message || "Error al eliminar el proveedor.");
    }
  };

  const toggleStatus = async (supplierId) => {
    try {
      await toggleSupplierStatus(supplierId);
      setSuppliers((prev) =>
        prev.map((sup) =>
          sup.id_proveedor === supplierId
            ? { ...sup, estado: sup.estado === 1 ? 0 : 1 }
            : sup
        )
      );
      toast.success("Estado del proveedor modificado.");
    } catch (err) {
      toast.error(err.message || "Error al modificar estado del proveedor.");
    }
  };

  const handleExport = () => {
    exportToStyledExcel({
      title: "REPORTE OFICIAL DE PROVEEDORES",
      subtitle: `Exportado el ${new Date().toLocaleDateString("es-CO")} - Tu Turno Barber ERP`,
      filename: `proveedores_${new Date().toISOString().split("T")[0]}.xls`,
      columns: [
        { header: "ID", key: "id_proveedor", width: 10, type: "number" },
        { header: "Proveedor / Razón Social", key: "nombre", width: 34 },
        { header: "NIT / Documento", key: "nit", width: 20 },
        { header: "Teléfono", key: "telefono", width: 18 },
        { header: "Correo Electrónico", key: "correo", width: 28 },
        { header: "Dirección", key: "direccion", width: 32 },
        { header: "Factura PDF", key: "tiene_pdf", width: 16 },
        { header: "Estado", key: "estado_nombre", width: 14 }
      ],
      data: filteredSuppliers.map((s) => ({
        ...s,
        nit: s.nit || "—",
        telefono: s.telefono || "—",
        correo: s.correo || "—",
        direccion: s.direccion || "—",
        tiene_pdf: s.factura_pdf ? "Sí (Adjunto)" : "Sin archivo",
        estado_nombre: s.estado === 1 ? "Activo" : "Inactivo"
      }))
    });
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
      estado: supplier.estado ?? 1,
      factura_pdf: supplier.factura_pdf || null
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
