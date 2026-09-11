import { useState, useEffect } from "react";
import { useLocation } from "react-router";
import { toast } from "sonner";
import {
  AlertCircle,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  XCircle,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  FileText,
  MessageSquare
} from "lucide-react";
import SearchableSelect from "../../admin/shared/components/SearchableSelect";
import Modal from "../../admin/shared/components/Modal";
import ConfirmModal from "../../admin/shared/components/ConfirmModal";
import {
  getCurrentBarberProfile,
  getBarberNovelties,
  createBarberNovelty,
  updateBarberNovelty,
  cancelBarberNovelty,
  getBarberAppointments
} from "../services/barberStorageService";

const NOVELTY_TYPES = [
  "Solicitud de cancelación de cita",
  "Cambio de turno",
  "Permiso",
  "Ausencia",
  "Otro"
];

const emptyFormData = {
  tipo: "Solicitud de cancelación de cita",
  fecha: new Date().toISOString().split("T")[0],
  cita_relacionada: "Ninguna",
  motivo: "",
  descripcion: ""
};

export default function BarberNoveltiesPage() {
  const [novelties, setNovelties] = useState([]);
  const [barber, setBarber] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedNovelty, setSelectedNovelty] = useState(null);

  // Form State
  const [formData, setFormData] = useState(emptyFormData);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    loadData();

    if (location.state?.fromAppointment) {
      const apt = location.state.fromAppointment;
      setFormData({
        tipo: "Solicitud de cancelación de cita",
        fecha: apt.fecha || new Date().toISOString().split("T")[0],
        cita_relacionada: apt.label || `Cita #${apt.id_cita}`,
        motivo: `Solicitud de cancelación para Cita #${apt.id_cita}`,
        descripcion: `Solicito la cancelación o reasignación de la Cita #${apt.id_cita} debido a: `
      });
      setShowCreateModal(true);
      toast.info(`Formulario preparado para Cita #${apt.id_cita}`);
    }
  }, [location.state]);

  const loadData = () => {
    const profile = getCurrentBarberProfile();
    setBarber(profile);
    const data = getBarberNovelties();
    setNovelties(data);
    const apts = getBarberAppointments();
    setAppointments(apts);
  };

  // Opciones de citas para el select de "Cita Relacionada"
  const appointmentOptions = [
    { value: "Ninguna", label: "Ninguna / No aplica a cita específica" },
    ...appointments.map((a) => ({
      value: `Cita #${a.id_cita} - ${a.cliente_nombre} (${a.fecha} ${a.hora})`,
      label: `Cita #${a.id_cita} — ${a.cliente_nombre} (${a.fecha} ${a.hora})`,
      subtitle: `${a.paquete_nombre || a.servicio_nombre} • ${a.estado}`
    }))
  ];

  const typeOptions = [
    { value: "all", label: "Todos los tipos" },
    ...NOVELTY_TYPES.map((t) => ({ value: t, label: t }))
  ];

  const statusOptions = [
    { value: "all", label: "Todos los estados" },
    { value: "Pendiente", label: "Pendiente" },
    { value: "Aprobada", label: "Aprobada" },
    { value: "Rechazada", label: "Rechazada" },
    { value: "Cancelada", label: "Cancelada" }
  ];

  // Filtrado de novedades
  const filteredNovelties = novelties.filter((nov) => {
    const search = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !search ||
      (nov.motivo || "").toLowerCase().includes(search) ||
      (nov.descripcion || "").toLowerCase().includes(search) ||
      (nov.tipo || "").toLowerCase().includes(search) ||
      (nov.cita_relacionada || "").toLowerCase().includes(search);

    const matchesStatus = statusFilter === "all" || nov.estado === statusFilter;
    const matchesType = typeFilter === "all" || nov.tipo === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const validateForm = () => {
    const errors = {};
    if (!formData.tipo) errors.tipo = "Selecciona el tipo de novedad.";
    if (!formData.fecha) errors.fecha = "Indica la fecha de la novedad.";
    if (!formData.motivo || formData.motivo.trim().length < 3) {
      errors.motivo = "El motivo debe tener al menos 3 caracteres.";
    }
    if (!formData.descripcion || formData.descripcion.trim().length < 5) {
      errors.descripcion = "Describe detalladamente la solicitud (mínimo 5 caracteres).";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenCreate = () => {
    setFormData(emptyFormData);
    setFormErrors({});
    setShowCreateModal(true);
  };

  const handleOpenEdit = (novelty) => {
    setSelectedNovelty(novelty);
    setFormData({
      tipo: novelty.tipo,
      fecha: novelty.fecha,
      cita_relacionada: novelty.cita_relacionada || "Ninguna",
      motivo: novelty.motivo || "",
      descripcion: novelty.descripcion || ""
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleOpenDetail = (novelty) => {
    setSelectedNovelty(novelty);
    setShowDetailModal(true);
  };

  const handleOpenCancel = (novelty) => {
    setSelectedNovelty(novelty);
    setShowCancelModal(true);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Por favor completa los campos requeridos.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = createBarberNovelty(formData);
      setLoading(false);
      if (res.success) {
        toast.success("¡Solicitud de novedad enviada a administración con éxito!");
        setShowCreateModal(false);
        loadData();
      } else {
        toast.error("Ocurrió un error al registrar la solicitud.");
      }
    }, 250);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Por favor completa los campos requeridos.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = updateBarberNovelty(selectedNovelty.id_novedad, formData);
      setLoading(false);
      if (res.success) {
        toast.success("Solicitud de novedad actualizada correctamente.");
        setShowEditModal(false);
        loadData();
      } else {
        toast.error(res.error || "No se pudo actualizar la novedad.");
      }
    }, 250);
  };

  const handleConfirmCancel = () => {
    if (!selectedNovelty) return;
    const res = cancelBarberNovelty(selectedNovelty.id_novedad);
    if (res.success) {
      toast.success("Solicitud cancelada satisfactoriamente.");
      loadData();
    } else {
      toast.error(res.error || "No se pudo cancelar la solicitud.");
    }
  };

  const getStatusBadge = (estado) => {
    switch (estado) {
      case "Pendiente":
        return "bg-amber-500/15 text-amber-500 border-amber-500/30";
      case "Aprobada":
        return "bg-emerald-500/15 text-emerald-500 border-emerald-500/30";
      case "Rechazada":
        return "bg-destructive/15 text-destructive border-destructive/30";
      case "Cancelada":
        return "bg-muted text-muted-foreground border-border";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER DEL MÓDULO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Solicitudes de Novedades de Horario
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#DFB755]/15 text-[#DFB755] border border-[#DFB755]/30">
              Operativo
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Gestiona solicitudes de cancelación de citas, permisos, cambios de turno o justificación de ausencias.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black font-extrabold text-xs shadow-md shadow-[#DDAE41]/25 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Solicitud</span>
        </button>
      </div>

      {/* FILTROS CON SEARCHABLE SELECT */}
      <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Búsqueda por texto */}
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por motivo o descripción..."
              className="w-full pl-9 pr-3 py-2 bg-input-background border border-input rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Filtro por Tipo con SearchableSelect */}
          <div>
            <SearchableSelect
              value={typeFilter}
              onChange={(val) => setTypeFilter(val || "all")}
              options={typeOptions}
              placeholder="Filtrar por tipo..."
              searchable={false}
              size="md"
            />
          </div>

          {/* Filtro por Estado con SearchableSelect */}
          <div>
            <SearchableSelect
              value={statusFilter}
              onChange={(val) => setStatusFilter(val || "all")}
              options={statusOptions}
              placeholder="Filtrar por estado..."
              searchable={false}
              size="md"
            />
          </div>
        </div>
      </div>

      {/* LISTADO DE NOVEDADES */}
      <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-lg">
        <div className="p-4 sm:p-5 border-b border-border bg-muted/20 flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            Solicitudes Registradas ({filteredNovelties.length})
          </span>
          <span className="text-xs font-bold text-muted-foreground">
            Barbero: {barber?.nombre} {barber?.apellido}
          </span>
        </div>

        {filteredNovelties.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-muted/40 text-muted-foreground mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-base font-bold text-foreground">No tienes solicitudes de novedades.</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Cuando requieras cancelar una cita asignada o solicitar un cambio de turno, créala desde el botón superior.
            </p>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent hover:bg-[#DFB755]/20 text-foreground hover:text-[#DFB755] font-bold text-xs transition-colors cursor-pointer border border-border"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Crear mi primera solicitud</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {filteredNovelties.map((nov) => {
              const isPending = nov.estado === "Pendiente";

              return (
                <div
                  key={nov.id_novedad}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-accent/40 transition-colors"
                >
                  {/* Bloque Izquierdo: ID, Tipo y Motivo */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-widest text-[#DFB755] bg-[#DFB755]/10 px-2 py-0.5 rounded-md border border-[#DFB755]/20">
                        #{nov.id_novedad}
                      </span>
                      <span className="text-xs sm:text-sm font-black text-foreground">
                        {nov.tipo}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getStatusBadge(nov.estado)}`}>
                        {nov.estado}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-foreground truncate">
                      {nov.motivo}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#DFB755]" />
                        Fecha: <strong>{nov.fecha}</strong>
                      </span>
                      {nov.cita_relacionada && nov.cita_relacionada !== "Ninguna" && (
                        <span className="flex items-center gap-1 truncate max-w-xs">
                          <Clock className="w-3 h-3 text-[#DFB755]" />
                          <span className="truncate">{nov.cita_relacionada}</span>
                        </span>
                      )}
                      <span className="text-muted-foreground/60 hidden sm:inline">•</span>
                      <span className="hidden sm:inline">Solicitado el {nov.fecha_registro?.split(" ")[0]}</span>
                    </div>
                  </div>

                  {/* Acciones según el estado */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Botón Ver Detalle (Siempre disponible) */}
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(nov)}
                      className="px-3 py-2 rounded-xl bg-accent hover:bg-[#DFB755]/20 text-foreground hover:text-[#DFB755] border border-border text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Ver detalle completo"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Detalle</span>
                    </button>

                    {/* Botón Editar Solicitud (Solo si está Pendiente) */}
                    {isPending && (
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(nov)}
                        className="px-3 py-2 rounded-xl bg-accent hover:bg-accent/80 text-foreground border border-border text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Editar solicitud"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-amber-500" />
                        <span>Editar</span>
                      </button>
                    )}

                    {/* Botón Cancelar Solicitud (Solo si está Pendiente) */}
                    {isPending && (
                      <button
                        type="button"
                        onClick={() => handleOpenCancel(nov)}
                        className="px-3 py-2 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Cancelar solicitud"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancelar</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL CREAR SOLICITUD */}
      {showCreateModal && (
        <Modal
          title="Nueva Solicitud de Novedad"
          onClose={() => setShowCreateModal(false)}
          maxWidthClass="max-w-lg"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <SearchableSelect
                label="Tipo de Novedad"
                value={formData.tipo}
                onChange={(val) => setFormData((prev) => ({ ...prev, tipo: val }))}
                options={NOVELTY_TYPES.map((t) => ({ value: t, label: t }))}
                placeholder="Seleccionar tipo..."
                searchable={false}
                required
                error={formErrors.tipo}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Fecha de la Novedad <span className="text-destructive">*</span>
                </label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fecha: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl bg-input-background border border-input text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary"
                  required
                />
                {formErrors.fecha && (
                  <span className="text-[11px] text-destructive mt-1 block">{formErrors.fecha}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Barbero Solicitante
                </label>
                <input
                  type="text"
                  value={`${barber?.nombre} ${barber?.apellido}`}
                  disabled
                  className="w-full px-3.5 py-2 rounded-xl bg-muted/40 border border-border text-xs sm:text-sm text-muted-foreground cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <SearchableSelect
                label="Horario / Cita Relacionada (Opcional)"
                value={formData.cita_relacionada}
                onChange={(val) => setFormData((prev) => ({ ...prev, cita_relacionada: val || "Ninguna" }))}
                options={appointmentOptions}
                placeholder="Seleccionar cita si aplica..."
                searchable={true}
                searchPlaceholder="Escribe para buscar cita..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Motivo <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.motivo}
                onChange={(e) => setFormData((prev) => ({ ...prev, motivo: e.target.value }))}
                placeholder="Ej: Cita médica imprevista, mantenimiento de estación..."
                className="w-full px-3.5 py-2 rounded-xl bg-input-background border border-input text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary"
                required
              />
              {formErrors.motivo && (
                <span className="text-[11px] text-destructive mt-1 block">{formErrors.motivo}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Descripción Detallada <span className="text-destructive">*</span>
              </label>
              <textarea
                rows={3}
                value={formData.descripcion}
                onChange={(e) => setFormData((prev) => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Explica los detalles de la solicitud para conocimiento de la administración..."
                className="w-full px-3.5 py-2 rounded-xl bg-input-background border border-input text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary"
                required
              />
              {formErrors.descripcion && (
                <span className="text-[11px] text-destructive mt-1 block">{formErrors.descripcion}</span>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2.5 rounded-xl border border-border hover:bg-accent text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black font-black text-xs shadow-md shadow-[#DDAE41]/25 transition-all cursor-pointer"
              >
                {loading ? "ENVIANDO..." : "ENVIAR SOLICITUD"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL EDITAR SOLICITUD (SOLO SI ESTÁ PENDIENTE) */}
      {showEditModal && selectedNovelty && (
        <Modal
          title={`Editar Solicitud #${selectedNovelty.id_novedad}`}
          onClose={() => setShowEditModal(false)}
          maxWidthClass="max-w-lg"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <SearchableSelect
                label="Tipo de Novedad"
                value={formData.tipo}
                onChange={(val) => setFormData((prev) => ({ ...prev, tipo: val }))}
                options={NOVELTY_TYPES.map((t) => ({ value: t, label: t }))}
                searchable={false}
                required
                error={formErrors.tipo}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Fecha de la Novedad <span className="text-destructive">*</span>
              </label>
              <input
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData((prev) => ({ ...prev, fecha: e.target.value }))}
                className="w-full px-3.5 py-2 rounded-xl bg-input-background border border-input text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <SearchableSelect
                label="Horario / Cita Relacionada (Opcional)"
                value={formData.cita_relacionada}
                onChange={(val) => setFormData((prev) => ({ ...prev, cita_relacionada: val || "Ninguna" }))}
                options={appointmentOptions}
                searchable={true}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Motivo <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.motivo}
                onChange={(e) => setFormData((prev) => ({ ...prev, motivo: e.target.value }))}
                className="w-full px-3.5 py-2 rounded-xl bg-input-background border border-input text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Descripción Detallada <span className="text-destructive">*</span>
              </label>
              <textarea
                rows={3}
                value={formData.descripcion}
                onChange={(e) => setFormData((prev) => ({ ...prev, descripcion: e.target.value }))}
                className="w-full px-3.5 py-2 rounded-xl bg-input-background border border-input text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2.5 rounded-xl border border-border hover:bg-accent text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black font-black text-xs shadow-md shadow-[#DDAE41]/25 transition-all cursor-pointer"
              >
                {loading ? "GUARDANDO..." : "GUARDAR CAMBIOS"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL DETALLE DE NOVEDAD */}
      {showDetailModal && selectedNovelty && (
        <Modal
          title={`Detalle de Solicitud #${selectedNovelty.id_novedad}`}
          onClose={() => setShowDetailModal(false)}
          maxWidthClass="max-w-lg"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Estado</span>
                <p className="text-sm font-extrabold text-foreground mt-0.5">{selectedNovelty.estado}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-black border ${getStatusBadge(selectedNovelty.estado)}`}>
                {selectedNovelty.estado}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-accent/30 border border-border space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-muted-foreground font-bold block">Barbero Solicitante:</span>
                  <p className="font-extrabold text-foreground">{barber?.nombre} {barber?.apellido}</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-bold block">Tipo de Novedad:</span>
                  <p className="font-extrabold text-foreground">{selectedNovelty.tipo}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
                <div>
                  <span className="text-muted-foreground font-bold block">Fecha Aplicable:</span>
                  <p className="font-extrabold text-foreground">{selectedNovelty.fecha}</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-bold block">Fecha de Registro:</span>
                  <p className="font-extrabold text-foreground">{selectedNovelty.fecha_registro}</p>
                </div>
              </div>

              {selectedNovelty.cita_relacionada && selectedNovelty.cita_relacionada !== "Ninguna" && (
                <div className="pt-2 border-t border-border/60">
                  <span className="text-muted-foreground font-bold block">Cita Relacionada:</span>
                  <p className="font-extrabold text-foreground">{selectedNovelty.cita_relacionada}</p>
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border space-y-2 text-xs">
              <div>
                <span className="text-muted-foreground font-bold block">Motivo:</span>
                <p className="font-black text-sm text-foreground mt-0.5">{selectedNovelty.motivo}</p>
              </div>
              <div className="pt-2 border-t border-border/60">
                <span className="text-muted-foreground font-bold block">Descripción:</span>
                <p className="text-muted-foreground mt-1 whitespace-pre-wrap leading-relaxed">
                  {selectedNovelty.descripcion}
                </p>
              </div>
            </div>

            {/* LÍNEA DE TIEMPO / TIMELINE DE ESTADO */}
            <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#DFB755]" />
                Seguimiento del Estado
              </span>
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                {/* Paso 1: Registrada */}
                <div className="relative">
                  <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-emerald-500 text-black flex items-center justify-center text-[10px] font-black ring-4 ring-card">
                    ✓
                  </span>
                  <div>
                    <p className="text-xs font-black text-foreground">Solicitud Registrada</p>
                    <p className="text-[11px] text-muted-foreground">{selectedNovelty.fecha_registro} — Registrada por ti en el sistema</p>
                  </div>
                </div>

                {/* Paso 2: En Revisión */}
                <div className="relative">
                  <span className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ring-4 ring-card ${selectedNovelty.estado === "Pendiente"
                      ? "bg-[#DFB755] text-black animate-pulse"
                      : selectedNovelty.estado === "Cancelada"
                        ? "bg-muted text-muted-foreground"
                        : "bg-emerald-500 text-black"
                    }`}>
                    {selectedNovelty.estado === "Pendiente" ? "•" : "✓"}
                  </span>
                  <div>
                    <p className="text-xs font-black text-foreground">
                      {selectedNovelty.estado === "Cancelada" ? "Revisión Detenida" : "En Revisión Administrativa"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {selectedNovelty.estado === "Pendiente"
                        ? "En bandeja de entrada para evaluación del Administrador"
                        : selectedNovelty.estado === "Cancelada"
                          ? "Cancelaste esta solicitud antes de su resolución"
                          : "Evaluada por el equipo administrativo"}
                    </p>
                  </div>
                </div>

                {/* Paso 3: Resolución */}
                <div className="relative">
                  <span className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ring-4 ring-card ${selectedNovelty.estado === "Aprobada"
                      ? "bg-emerald-500 text-black"
                      : selectedNovelty.estado === "Rechazada"
                        ? "bg-destructive text-white"
                        : selectedNovelty.estado === "Cancelada"
                          ? "bg-muted-foreground text-card"
                          : "bg-muted text-muted-foreground"
                    }`}>
                    {selectedNovelty.estado === "Aprobada" ? "✓" : selectedNovelty.estado === "Rechazada" || selectedNovelty.estado === "Cancelada" ? "✕" : "○"}
                  </span>
                  <div>
                    <p className="text-xs font-black text-foreground">
                      {selectedNovelty.estado === "Aprobada" && "Solicitud Aprobada"}
                      {selectedNovelty.estado === "Rechazada" && "Solicitud Rechazada"}
                      {selectedNovelty.estado === "Cancelada" && "Solicitud Cancelada"}
                      {selectedNovelty.estado === "Pendiente" && "Resolución Final Pendiente"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {selectedNovelty.estado === "Pendiente"
                        ? "Pendiente de dictamen por la administración."
                        : selectedNovelty.respuesta_admin
                          ? selectedNovelty.respuesta_admin
                          : `Estado actual: ${selectedNovelty.estado}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {selectedNovelty.respuesta_admin && (
              <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-xs">
                <span className="font-bold text-foreground flex items-center gap-1.5 mb-1">
                  <MessageSquare className="w-3.5 h-3.5 text-[#DFB755]" />
                  Respuesta de Administración:
                </span>
                <p className="text-muted-foreground italic">{selectedNovelty.respuesta_admin}</p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="px-5 py-2 rounded-xl bg-accent hover:bg-accent/80 text-foreground font-bold text-xs transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* CONFIRMACIÓN DE CANCELACIÓN */}
      {showCancelModal && selectedNovelty && (
        <ConfirmModal
          title={`¿Cancelar Solicitud #${selectedNovelty.id_novedad}?`}
          description="Esta solicitud quedará marcada como Cancelada por el barbero y ya no será procesada por la administración."
          confirmLabel="Sí, Cancelar Solicitud"
          onConfirm={handleConfirmCancel}
          onClose={() => setShowCancelModal(false)}
          variant="warning"
        />
      )}
    </div>
  );
}
