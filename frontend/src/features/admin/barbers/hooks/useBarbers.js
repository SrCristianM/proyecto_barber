import { useState } from "react";

const mockBarbers = [
  { id_barbero: 1, id_usuario: 3, nombre: "Carlos", apellido: "Rodríguez", correo: "carlos@example.com", telefono: "+57 300 123 4567", especialidad: "Corte Clásico", imagen_url: "", estado: 1 },
  { id_barbero: 2, id_usuario: 6, nombre: "Miguel", apellido: "Ángel", correo: "miguel@example.com", telefono: "+57 301 234 5678", especialidad: "Diseño y Color", imagen_url: "", estado: 1 },
  { id_barbero: 3, id_usuario: 7, nombre: "Javier", apellido: "Torres", correo: "javier@example.com", telefono: "+57 302 345 6789", especialidad: "Barba Premium", imagen_url: "", estado: 1 },
  { id_barbero: 4, id_usuario: 5, nombre: "Luis", apellido: "Martínez", correo: "luis@example.com", telefono: "+57 303 456 7890", especialidad: "Corte Moderno", imagen_url: "", estado: 0 }
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
  correo: "",
  telefono: "",
  especialidad: "Corte Clásico",
  imagen_url: "",
  id_usuario: null
};

export function useBarbers() {
  const [barbers, setBarbers] = useState(mockBarbers);
  const [searchTerm, setSearchTerm] = useState("");
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
      const search = searchTerm.toLowerCase();
      return (
        fullName.includes(search) ||
        barber.correo.toLowerCase().includes(search) ||
        (barber.especialidad || "").toLowerCase().includes(search)
      );
    })
    .sort((a, b) => {
      const valA = (a[sortField] ?? "").toString().toLowerCase();
      const valB = (b[sortField] ?? "").toString().toLowerCase();
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const resetForm = () => setFormData(emptyForm);

  const handleCreate = () => {
    const nextBarberId = Math.max(...barbers.map((b) => b.id_barbero), 0) + 1;
    const nextUserId = formData.id_usuario || Math.max(...barbers.map((b) => b.id_usuario), 10) + 1;

    const newBarber = {
      id_barbero: nextBarberId,
      id_usuario: nextUserId,
      nombre: formData.nombre.trim(),
      apellido: formData.apellido.trim(),
      correo: formData.correo.trim(),
      telefono: formData.telefono ? formData.telefono.trim() : null,
      especialidad: formData.especialidad,
      imagen_url: formData.imagen_url || null,
      estado: 1
    };
    setBarbers([...barbers, newBarber]);
    setShowCreateModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedBarber) return;
    setBarbers(
      barbers.map((barber) =>
        barber.id_barbero === selectedBarber.id_barbero
          ? {
              ...barber,
              nombre: formData.nombre.trim(),
              apellido: formData.apellido.trim(),
              correo: formData.correo.trim(),
              telefono: formData.telefono ? formData.telefono.trim() : null,
              especialidad: formData.especialidad,
              imagen_url: formData.imagen_url || null
            }
          : barber
      )
    );
    setShowEditModal(false);
    setSelectedBarber(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!selectedBarber) return;
    setBarbers(barbers.filter((barber) => barber.id_barbero !== selectedBarber.id_barbero));
    setShowDeleteModal(false);
    setSelectedBarber(null);
  };

  const toggleStatus = (barberId) => {
    setBarbers(
      barbers.map((barber) =>
        barber.id_barbero === barberId ? { ...barber, estado: barber.estado === 1 ? 0 : 1 } : barber
      )
    );
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (barber) => {
    setSelectedBarber(barber);
    setFormData({
      nombre: barber.nombre,
      apellido: barber.apellido,
      correo: barber.correo,
      telefono: barber.telefono || "",
      especialidad: barber.especialidad || "Corte Clásico",
      imagen_url: barber.imagen_url || "",
      id_usuario: barber.id_usuario
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
    openCreateModal,
    openEditModal,
    openDetailModal,
    openDeleteModal,
    openDeactivateModal
  };
}
