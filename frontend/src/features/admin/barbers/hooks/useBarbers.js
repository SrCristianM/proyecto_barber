import { useState } from "react";

const mockBarbers = [
  { id: 1, name: "Carlos Rodríguez", email: "carlos@example.com", phone: "+57 300 123 4567", specialty: "Corte Clásico", status: "Activo", createdAt: "2026-01-15" },
  { id: 2, name: "Miguel Ángel", email: "miguel@example.com", phone: "+57 301 234 5678", specialty: "Diseño y Color", status: "Activo", createdAt: "2026-02-20" },
  { id: 3, name: "Javier Torres", email: "javier@example.com", phone: "+57 302 345 6789", specialty: "Barba Premium", status: "Activo", createdAt: "2026-03-10" },
  { id: 4, name: "Luis Martínez", email: "luis@example.com", phone: "+57 303 456 7890", specialty: "Corte Moderno", status: "Inactivo", createdAt: "2026-04-05" }
];

export const availableSpecialties = ["Corte Clásico", "Diseño y Color", "Barba Premium", "Corte Moderno", "Barbería Completa"];

const emptyForm = { name: "", email: "", phone: "", specialty: "Corte Clásico" };

export function useBarbers() {
  const [barbers, setBarbers] = useState(mockBarbers);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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
    .filter(
      (barber) =>
        barber.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        barber.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const valA = (a[sortField] ?? "").toString().toLowerCase();
      const valB = (b[sortField] ?? "").toString().toLowerCase();
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const resetForm = () => setFormData(emptyForm);

  const handleCreate = () => {
    const newBarber = {
      id: Math.max(...barbers.map((b) => b.id)) + 1,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      specialty: formData.specialty,
      status: "Activo",
      createdAt: new Date().toISOString().split("T")[0]
    };
    setBarbers([...barbers, newBarber]);
    setShowCreateModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedBarber) return;
    setBarbers(
      barbers.map((barber) =>
        barber.id === selectedBarber.id
          ? { ...barber, name: formData.name, email: formData.email, phone: formData.phone, specialty: formData.specialty }
          : barber
      )
    );
    setShowEditModal(false);
    setSelectedBarber(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!selectedBarber) return;
    setBarbers(barbers.filter((barber) => barber.id !== selectedBarber.id));
    setShowDeleteModal(false);
    setSelectedBarber(null);
  };

  const toggleStatus = (barberId) => {
    setBarbers(
      barbers.map((barber) =>
        barber.id === barberId ? { ...barber, status: barber.status === "Activo" ? "Inactivo" : "Activo" } : barber
      )
    );
  };

  const openEditModal = (barber) => {
    setSelectedBarber(barber);
    setFormData({ name: barber.name, email: barber.email, phone: barber.phone || "", specialty: barber.specialty });
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
    selectedBarber,
    setSelectedBarber,
    resetForm,
    handleCreate,
    handleEdit,
    handleDelete,
    toggleStatus,
    openEditModal,
    openDetailModal,
    openDeleteModal
  };
}
