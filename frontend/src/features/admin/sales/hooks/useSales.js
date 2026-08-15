import { useState } from "react";

const mockSales = [
  { id: 1, date: "2026-06-02", time: "09:30", client: "Juan Pérez", items: ["Corte Clásico", "Gel para Cabello"], total: 30000, payment: "Efectivo", barber: "Carlos", notes: "Cliente preferente" },
  { id: 2, date: "2026-06-02", time: "10:15", client: "María García", items: ["Corte + Barba"], total: 25000, payment: "Tarjeta", barber: "Miguel" },
  { id: 3, date: "2026-06-02", time: "11:00", client: "Pedro López", items: ["Afeitado Premium", "Aceite para Barba"], total: 45000, payment: "Transferencia", barber: "Javier" },
  { id: 4, date: "2026-06-01", time: "16:30", client: "Ana Torres", items: ["Diseño y Color"], total: 30000, payment: "Efectivo", barber: "Luis" },
  { id: 5, date: "2026-06-01", time: "14:00", client: "Carlos Ruiz", items: ["Corte Clásico", "Shampoo Premium"], total: 37000, payment: "Tarjeta", barber: "Carlos" },
  { id: 6, date: "2026-05-31", time: "15:45", client: "Roberto Sánchez", items: ["Corte + Barba", "Cera Modeladora"], total: 43000, payment: "Efectivo", barber: "Miguel" },
  { id: 7, date: "2026-05-31", time: "13:20", client: "Laura Martínez", items: ["Corte Moderno"], total: 20000, payment: "Transferencia", barber: "Javier" },
  { id: 8, date: "2026-05-30", time: "10:00", client: "Diego Fernández", items: ["Afeitado Premium"], total: 25000, payment: "Tarjeta", barber: "Luis" }
];

export const barbers = ["Carlos", "Miguel", "Javier", "Luis"];
export const paymentMethods = ["Efectivo", "Tarjeta", "Transferencia"];
export const availableItems = [
  "Corte Clásico",
  "Corte Moderno",
  "Corte + Barba",
  "Afeitado Premium",
  "Diseño y Color",
  "Gel para Cabello",
  "Cera Modeladora",
  "Shampoo Premium",
  "Aceite para Barba"
];

const emptyForm = () => ({
  date: new Date().toISOString().split("T")[0],
  time: "09:00",
  client: "",
  items: [],
  total: 0,
  payment: "Efectivo",
  barber: "Carlos",
  notes: ""
});

export function useSales() {
  const [sales, setSales] = useState(mockSales);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [formData, setFormData] = useState(emptyForm());

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const filteredSales = sales
    .filter(
      (sale) =>
        sale.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.barber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.payment.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let valA, valB;
      if (sortField === "total") {
        valA = a[sortField];
        valB = b[sortField];
      } else if (sortField === "date") {
        valA = `${a.date} ${a.time}`;
        valB = `${b.date} ${b.time}`;
      } else {
        valA = (a[sortField] ?? "").toString().toLowerCase();
        valB = (b[sortField] ?? "").toString().toLowerCase();
      }
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const paginatedSales = filteredSales.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalToday = sales
    .filter((sale) => sale.date === new Date().toISOString().split("T")[0])
    .reduce((sum, sale) => sum + sale.total, 0);
  const totalMonth = sales.reduce((sum, sale) => sum + sale.total, 0);
  const averageTicket = sales.length ? totalMonth / sales.length : 0;

  const resetForm = () => setFormData(emptyForm());

  const handleCreate = () => {
    const newSale = {
      id: Math.max(...sales.map((s) => s.id)) + 1,
      date: formData.date,
      time: formData.time,
      client: formData.client,
      items: formData.items,
      total: formData.total,
      payment: formData.payment,
      barber: formData.barber,
      notes: formData.notes
    };
    setSales([newSale, ...sales]);
    setShowCreateModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedSale) return;
    setSales(
      sales.map((sale) =>
        sale.id === selectedSale.id
          ? {
              ...sale,
              date: formData.date,
              time: formData.time,
              client: formData.client,
              items: formData.items,
              total: formData.total,
              payment: formData.payment,
              barber: formData.barber,
              notes: formData.notes
            }
          : sale
      )
    );
    setShowEditModal(false);
    setSelectedSale(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!selectedSale) return;
    setSales(sales.filter((sale) => sale.id !== selectedSale.id));
    setShowDeleteModal(false);
    setSelectedSale(null);
  };

  const handleExport = () => {
    const headers = ["ID", "Fecha", "Hora", "Cliente", "Artículos", "Total", "Método de Pago", "Barbero", "Notas"];
    const csvContent = [
      headers.join(","),
      ...filteredSales.map(
        (s) => `${s.id},"${s.date}","${s.time}","${s.client}","${s.items.join("; ")}",${s.total},"${s.payment}","${s.barber}","${s.notes || ""}"`
      )
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ventas_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const openEditModal = (sale) => {
    setSelectedSale(sale);
    setFormData({
      date: sale.date,
      time: sale.time,
      client: sale.client,
      items: [...sale.items],
      total: sale.total,
      payment: sale.payment,
      barber: sale.barber,
      notes: sale.notes || ""
    });
    setShowEditModal(true);
  };

  const openDetailModal = (sale) => {
    setSelectedSale(sale);
    setShowDetailModal(true);
  };

  const openDeleteModal = (sale) => {
    setSelectedSale(sale);
    setShowDeleteModal(true);
  };

  const toggleItem = (item) => {
    if (formData.items.includes(item)) {
      setFormData({ ...formData, items: formData.items.filter((i) => i !== item) });
    } else {
      setFormData({ ...formData, items: [...formData.items, item] });
    }
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
    paginatedSales,
    filteredSales,
    totalPages,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    totalToday,
    totalMonth,
    averageTicket,
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
    selectedSale,
    setSelectedSale,
    resetForm,
    handleCreate,
    handleEdit,
    handleDelete,
    handleExport,
    openEditModal,
    openDetailModal,
    openDeleteModal,
    toggleItem
  };
}
