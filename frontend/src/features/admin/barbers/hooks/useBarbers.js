import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { exportToStyledExcel } from "../../../../shared/utils/excelExporter";
import {
  getBarbers,
  createBarber,
  updateBarber,
  deleteBarber,
  toggleBarberStatus
} from "../services/barbersService";
import { notifyDataChange, useDataSync, SYNC_ENTITIES } from "../../../../shared/services/dataSyncService";

const mockBarbers = [
  {
    id_barbero: 1,
    id_usuario: 4,
    nombre: "Carlos",
    apellido: "Rodríguez",
    correo: "barbero@tuturnobarber.com",
    telefono: "+57 302 345 6789",
    especialidad: "Corte Clásico & Fade",
    imagen_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    estado: 1
  }
];

export const availableSpecialties = [
  "Corte Clásico",
  "Diseño y Color",
  "Barba Premium",
  "Corte Moderno",
  "Barbería Completa",
  "Afeitado Tradicional"
];

const emptyForm = {
  nombre: "",
  apellido: "",
  tipo_documento: "CC",
  documento: "",
  correo: "",
  telefono: "",
  especialidad: "Corte Clásico",
  imagen_url: "",
  id_usuario: null,
  estado: 1
};

export function useBarbers() {
  const [barbers, setBarbers] = useState(mockBarbers);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | '1' | '0'
  const [sortField, setSortField] = useState("nombre");
  const [sortDir, setSortDir] = useState("asc");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const filteredBarbers = barbers
    .filter((barber) => {
      const fullName = `${barber.nombre} ${barber.apellido}`.toLowerCase();
      const search = searchTerm.toLowerCase().trim();
      const matchesSearch =
        search === "" ||
        fullName.includes(search) ||
        (barber.documento || "").toLowerCase().includes(search) ||
        barber.correo.toLowerCase().includes(search) ||
        (barber.telefono || "").includes(search) ||
        (barber.especialidad || "").toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "1" && barber.estado === 1) ||
        (statusFilter === "0" && barber.estado === 0);

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

  const fetchBarbersList = useCallback(async () => {
    try {
      const data = await getBarbers();
      if (Array.isArray(data)) {
        setBarbers(data);
        try { localStorage.setItem("barber_barbers_db", JSON.stringify(data)); } catch (_) {}
      }
    } catch (err) {
      console.warn("[Barbers] Usando barberos locales por fallback:", err.message);
    }
  }, []);

  useEffect(() => {
    fetchBarbersList();
  }, [fetchBarbersList]);

  useDataSync([SYNC_ENTITIES.BARBERS, SYNC_ENTITIES.USERS], fetchBarbersList);

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  const resetForm = () => setFormData(emptyForm);

  const handleCreate = async () => {
    const payload = {
      nombre: formData.nombre.trim(),
      apellido: formData.apellido.trim(),
      tipo_documento: formData.tipo_documento || "CC",
      documento: formData.documento ? formData.documento.trim() : null,
      correo: formData.correo.trim(),
      telefono: formData.telefono ? formData.telefono.trim() : null,
      especialidad: formData.especialidad,
      imagen_url: formData.imagen_url || null,
      estado: formData.estado !== undefined ? Number(formData.estado) : 1
    };

    try {
      const created = await createBarber(payload);
      const newBarber = {
        ...payload,
        id_barbero: created?.id_barbero || Math.max(...barbers.map((b) => b.id_barbero), 0) + 1,
        id_usuario: created?.id_usuario || Math.max(...barbers.map((b) => b.id_usuario), 10) + 1
      };
      setBarbers((prev) => {
        const next = [newBarber, ...prev];
        try { localStorage.setItem("barber_barbers_db", JSON.stringify(next)); } catch (_) {}
        return next;
      });
      setShowCreateModal(false);
      resetForm();
      notifyDataChange(SYNC_ENTITIES.BARBERS);
      notifyDataChange(SYNC_ENTITIES.USERS);
      toast.success("Barbero registrado exitosamente.");
    } catch (err) {
      toast.error(err.message || "Error al registrar el barbero.");
    }
  };

  const handleEdit = async () => {
    if (!selectedBarber) return;
    const payload = {
      nombre: formData.nombre.trim(),
      apellido: formData.apellido.trim(),
      tipo_documento: formData.tipo_documento || "CC",
      documento: formData.documento ? formData.documento.trim() : null,
      correo: formData.correo.trim(),
      telefono: formData.telefono ? formData.telefono.trim() : null,
      especialidad: formData.especialidad,
      imagen_url: formData.imagen_url || null,
      estado: formData.estado !== undefined ? Number(formData.estado) : selectedBarber.estado
    };

    try {
      await updateBarber(selectedBarber.id_barbero, payload);
      setBarbers((prev) => {
        const next = prev.map((barber) =>
          barber.id_barbero === selectedBarber.id_barbero
            ? { ...barber, ...payload }
            : barber
        );
        try { localStorage.setItem("barber_barbers_db", JSON.stringify(next)); } catch (_) {}
        return next;
      });
      setShowEditModal(false);
      setSelectedBarber(null);
      resetForm();
      notifyDataChange(SYNC_ENTITIES.BARBERS);
      notifyDataChange(SYNC_ENTITIES.USERS);
      toast.success("Perfil de barbero actualizado correctamente.");
    } catch (err) {
      toast.error(err.message || "Error al actualizar el barbero.");
    }
  };

  const handleDelete = async () => {
    if (!selectedBarber) return;
    try {
      await deleteBarber(selectedBarber.id_barbero);
      setBarbers((prev) => {
        const next = prev.filter((barber) => barber.id_barbero !== selectedBarber.id_barbero);
        try { localStorage.setItem("barber_barbers_db", JSON.stringify(next)); } catch (_) {}
        return next;
      });
      try {
        const rawUsers = localStorage.getItem("barber_users_db");
        if (rawUsers) {
          const parsed = JSON.parse(rawUsers);
          const filteredUsers = parsed.filter(
            (u) =>
              (!selectedBarber.id_usuario || Number(u.id_usuario) !== Number(selectedBarber.id_usuario)) &&
              (!selectedBarber.correo || u.correo?.toLowerCase() !== selectedBarber.correo.toLowerCase())
          );
          localStorage.setItem("barber_users_db", JSON.stringify(filteredUsers));
        }
      } catch {}
      setShowDeleteModal(false);
      setSelectedBarber(null);
      notifyDataChange(SYNC_ENTITIES.BARBERS);
      notifyDataChange(SYNC_ENTITIES.USERS);
      toast.success("Barbero eliminado.");
    } catch (err) {
      toast.error(err.message || "Error al eliminar el barbero.");
    }
  };

  const toggleStatus = async (barberId) => {
    try {
      await toggleBarberStatus(barberId);
      setBarbers((prev) => {
        const next = prev.map((barber) =>
          barber.id_barbero === barberId ? { ...barber, estado: barber.estado === 1 ? 0 : 1 } : barber
        );
        try { localStorage.setItem("barber_barbers_db", JSON.stringify(next)); } catch (_) {}
        return next;
      });
      notifyDataChange(SYNC_ENTITIES.BARBERS);
      toast.success("Estado del barbero actualizado.");
    } catch (err) {
      toast.error(err.message || "Error al cambiar estado del barbero.");
    }
  };

  const handleExport = () => {
    exportToStyledExcel({
      filename: "reporte_barberos",
      sheetName: "Barberos",
      title: "Directorio de Barberos y Profesionales",
      subtitle: "Equipo técnico de estilistas y barbería",
      columns: [
        { header: "ID", key: "id_barbero", type: "number", width: 60, align: "center" },
        { header: "Documento", key: "documento", width: 120 },
        { header: "Nombre", key: "nombre", width: 120 },
        { header: "Apellido", key: "apellido", width: 120 },
        { header: "Correo Electrónico", key: "correo", width: 180 },
        { header: "Teléfono de Contacto", key: "telefono", width: 130, align: "center" },
        { header: "Especialidades", key: "especialidad", width: 220 },
        { header: "Estado", key: "estadoLabel", type: "status", width: 90, align: "center" }
      ],
      data: filteredBarbers.map((b) => ({
        ...b,
        documento: b.documento || "—",
        especialidad: b.especialidades ? b.especialidades.join(", ") : b.especialidad || "General",
        estadoLabel: b.estado === 1 ? "Activo" : "Inactivo"
      }))
    });
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (barber) => {
    setSelectedBarber(barber);
    const espList = Array.isArray(barber.especialidades)
      ? barber.especialidades
      : barber.especialidad
      ? barber.especialidad.split(",").map((s) => s.trim()).filter(Boolean)
      : ["Corte Clásico"];

    setFormData({
      nombre: barber.nombre || "",
      apellido: barber.apellido || "",
      tipo_documento: barber.tipo_documento || "CC",
      documento: barber.documento || "",
      correo: barber.correo || "",
      telefono: barber.telefono || "",
      especialidad: espList.join(", "),
      especialidades: espList,
      imagen_url: barber.imagen_url || "",
      id_usuario: barber.id_usuario,
      estado: barber.estado !== undefined ? barber.estado : 1
    });
    setShowEditModal(true);
  };

  const openDetailModal = (barber) => {
    setSelectedBarber(barber);
    setShowDetailModal(true);
  };

  const openDeleteModal = (barber) => {
    setSelectedBarber(barber);
    setShowDeleteModal(true);
  };

  const openDeactivateModal = (barber) => {
    setSelectedBarber(barber);
    setShowDeactivateModal(true);
  };

  return {
    barbers,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    hasActiveFilters,
    resetFilters,
    sortField,
    sortDir,
    handleSort,
    filteredBarbers,
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
    selectedBarber,
    setSelectedBarber,
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
    openDeactivateModal
  };
}
