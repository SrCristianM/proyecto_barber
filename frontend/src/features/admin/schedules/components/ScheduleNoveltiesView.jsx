import { useState } from "react";
import { Plus, Search, Check, X, Edit, Trash2, Calendar, User, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Modal from "../../shared/components/Modal";
import ConfirmModal from "../../shared/components/ConfirmModal";
import FormFieldError from "../../shared/components/FormFieldError";
import { useScheduleNovelties, NOVELTY_TYPES } from "../hooks/useScheduleNovelties";
import { validateNoveltyForm } from "../validations/scheduleValidation";
import { ESTADOS_NOVEDAD } from "../../../../shared/types/database";

const STATUS_BADGES = {
  Pendiente: "bg-warning/10 text-warning border-warning/20",
  Aprobado: "bg-success/10 text-success border-success/20",
  Rechazado: "bg-destructive/10 text-destructive border-destructive/20"
};

const TYPE_BADGES = {
  Ausencia: "bg-destructive/10 text-destructive",
  "Cambio de turno": "bg-primary/10 text-primary",
  Permiso: "bg-blue-500/10 text-blue-500",
  Otro: "bg-purple-500/10 text-purple-500"
};

export default function ScheduleNoveltiesView() {
  const {
    filteredNovelties = [],
    barbers = [],
    noveltyTypes = NOVELTY_TYPES,
    noveltyStatuses = ESTADOS_NOVEDAD,
    searchTerm = "",
    setSearchTerm,
    statusFilter = "all",
    setStatusFilter,
    typeFilter = "all",
    setTypeFilter,
    formData = {},
    setFormData,
    showCreateModal,
    setShowCreateModal,
    showEditModal,
    setShowEditModal,
    showDeleteModal,
    setShowDeleteModal,
    selectedNovelty,
    setSelectedNovelty,
    resetForm,
    handleCreate,
    handleEdit,
    handleDelete,
    changeStatus,
    openCreateModal,
    openEditModal,
    openDeleteModal,
    getBarberName,
    stats = { total: 0, pendientes: 0, aprobadas: 0, rechazadas: 0 }
  } = useScheduleNovelties();

  const [formErrors, setFormErrors] = useState({});

  const onHandleCreate = () => {
    const result = validateNoveltyForm(formData);
    if (!result.isValid) {
      setFormErrors(result.errors);
      return;
    }
    setFormErrors({});
    handleCreate();
    toast.success("Novedad de horario registrada correctamente");
  };

  const onHandleEdit = () => {
    const result = validateNoveltyForm(formData);
    if (!result.isValid) {
      setFormErrors(result.errors);
      return;
    }
    setFormErrors({});
    handleEdit();
    toast.success("Novedad de horario actualizada correctamente");
  };

  const onHandleDelete = () => {
    handleDelete();
    toast.success("Novedad eliminada correctamente");
  };

  const onChangeStatus = (id, newStatus) => {
    changeStatus(id, newStatus);
    toast.success(`Novedad marcada como "${newStatus}"`);
  };

  return (
    <div className="space-y-5">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Novedades", value: stats?.total ?? 0, color: "text-foreground", icon: Clock },
          { label: "Pendientes", value: stats?.pendientes ?? 0, color: "text-warning", icon: AlertCircle },
          { label: "Aprobadas", value: stats?.aprobadas ?? 0, color: "text-success", icon: Check },
          { label: "Rechazadas", value: stats?.rechazadas ?? 0, color: "text-destructive", icon: X }
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="gold-card p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
              <h3 className={`text-2xl font-extrabold mt-1 ${color}`}>{value}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center border border-border/40">
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div className="flex flex-wrap items-center gap-3 flex-1 w-full sm:w-auto">
            {/* Buscador */}
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar barbero, motivo o tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
              />
            </div>

            {/* Filtro por estado */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
            >
              <option value="all">Todos los estados</option>
              {noveltyStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Filtro por tipo */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
            >
              <option value="all">Todos los tipos</option>
              {noveltyTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium shrink-0 cursor-pointer shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Registrar Novedad
          </button>
        </div>

        {/* Lista de novedades */}
        {filteredNovelties.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No se encontraron novedades registradas con los filtros seleccionados
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider bg-muted/30">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Barbero</th>
                  <th className="py-3.5 px-4 font-bold">Tipo</th>
                  <th className="py-3.5 px-4 font-bold">Fecha Novedad</th>
                  <th className="py-3.5 px-4 font-bold">Motivo / Descripción</th>
                  <th className="py-3.5 px-4 font-bold">Estado</th>
                  <th className="py-3.5 px-4 text-right font-bold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredNovelties.map((nov) => {
                  const barberName = getBarberName(nov.id_barbero) || "Barbero";
                  const initialLetter = barberName ? barberName.charAt(0).toUpperCase() : "B";
                  const regDate = nov.fecha_registro ? String(nov.fecha_registro).substring(0, 10) : nov.fecha;

                  return (
                    <tr key={nov.id_novedad} className="hover:bg-accent/40 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0 border border-primary/20">
                            {initialLetter}
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-sm">{barberName}</p>
                            <p className="text-xs text-muted-foreground">Reg: {regDate}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${TYPE_BADGES[nov.tipo] || "bg-muted text-foreground"}`}>
                          {nov.tipo}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-mono text-sm font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {nov.fecha}
                        </div>
                      </td>
                      <td className="py-4 px-4 max-w-sm">
                        <p className="text-sm text-foreground leading-relaxed line-clamp-2">{nov.descripcion}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${STATUS_BADGES[nov.estado] || "bg-muted text-muted-foreground"}`}>
                          {nov.estado}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {nov.estado === "Pendiente" && (
                            <>
                              <button
                                type="button"
                                onClick={() => onChangeStatus(nov.id_novedad, "Aprobado")}
                                className="p-1.5 hover:bg-success/10 text-success rounded-lg transition-colors cursor-pointer"
                                title="Aprobar novedad"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onChangeStatus(nov.id_novedad, "Rechazado")}
                                className="p-1.5 hover:bg-destructive/10 text-destructive rounded-lg transition-colors cursor-pointer"
                                title="Rechazar novedad"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => openEditModal(nov)}
                            className="p-1.5 hover:bg-accent text-primary rounded-lg transition-colors cursor-pointer"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeleteModal(nov)}
                            className="p-1.5 hover:bg-destructive/10 text-destructive rounded-lg transition-colors cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Crear */}
      {showCreateModal && (
        <Modal
          title="Registrar Novedad de Horario"
          onClose={() => { setShowCreateModal(false); resetForm(); setFormErrors({}); }}
          maxWidthClass="max-w-2xl"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onHandleCreate();
            }}
            className="space-y-5"
            noValidate
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Barbero <span className="text-destructive">*</span>
                </label>
                <select
                  name="id_barbero"
                  id="id_barbero"
                  value={formData.id_barbero || 1}
                  onChange={(e) => {
                    setFormData({ ...formData, id_barbero: Number(e.target.value) });
                    if (formErrors.id_barbero) setFormErrors((prev) => ({ ...prev, id_barbero: null }));
                  }}
                  className={`w-full px-4 py-2.5 bg-input-background border rounded-xl focus:outline-none text-foreground text-sm transition-all ${
                    formErrors.id_barbero
                      ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                      : "border-input focus:ring-2 focus:ring-primary"
                  }`}
                  autoFocus
                >
                  {barbers.map((b) => (
                    <option key={b.id_barbero} value={b.id_barbero}>
                      {b.nombre}
                    </option>
                  ))}
                </select>
                <FormFieldError error={formErrors.id_barbero} />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Tipo de Novedad <span className="text-destructive">*</span>
                </label>
                <select
                  name="tipo"
                  id="tipo"
                  value={formData.tipo || "Permiso"}
                  onChange={(e) => {
                    setFormData({ ...formData, tipo: e.target.value });
                    if (formErrors.tipo) setFormErrors((prev) => ({ ...prev, tipo: null }));
                  }}
                  className={`w-full px-4 py-2.5 bg-input-background border rounded-xl focus:outline-none text-foreground text-sm transition-all ${
                    formErrors.tipo
                      ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                      : "border-input focus:ring-2 focus:ring-primary"
                  }`}
                >
                  {noveltyTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <FormFieldError error={formErrors.tipo} />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Fecha de la Novedad <span className="text-destructive">*</span>
                </label>
                <input
                  type="date"
                  name="fecha"
                  id="fecha"
                  value={formData.fecha || ""}
                  onChange={(e) => {
                    setFormData({ ...formData, fecha: e.target.value });
                    if (formErrors.fecha) setFormErrors((prev) => ({ ...prev, fecha: null }));
                  }}
                  className={`w-full px-4 py-2.5 bg-input-background border rounded-xl focus:outline-none text-foreground text-sm transition-all ${
                    formErrors.fecha
                      ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                      : "border-input focus:ring-2 focus:ring-primary"
                  }`}
                />
                <FormFieldError error={formErrors.fecha} />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Descripción / Motivo <span className="text-destructive">*</span>
                </label>
                <textarea
                  rows={3}
                  name="descripcion"
                  id="descripcion"
                  maxLength={255}
                  value={formData.descripcion || ""}
                  onChange={(e) => {
                    setFormData({ ...formData, descripcion: e.target.value });
                    if (formErrors.descripcion) setFormErrors((prev) => ({ ...prev, descripcion: null }));
                  }}
                  placeholder="Describe el motivo del permiso, ausencia o cambio de turno..."
                  className={`w-full px-4 py-2.5 bg-input-background border rounded-xl focus:outline-none text-foreground text-sm resize-none transition-all ${
                    formErrors.descripcion
                      ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                      : "border-input focus:ring-2 focus:ring-primary"
                  }`}
                />
                <FormFieldError error={formErrors.descripcion} />
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-border">
              <button
                type="submit"
                className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-semibold text-sm shadow-xs cursor-pointer"
              >
                Registrar Novedad
              </button>
              <button
                type="button"
                onClick={() => { setShowCreateModal(false); resetForm(); setFormErrors({}); }}
                className="flex-1 py-3 border border-border rounded-xl hover:bg-accent transition-colors text-foreground font-medium text-sm cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Editar */}
      {showEditModal && selectedNovelty && (
        <Modal
          title="Editar Novedad de Horario"
          onClose={() => { setShowEditModal(false); setSelectedNovelty(null); resetForm(); setFormErrors({}); }}
          maxWidthClass="max-w-2xl"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onHandleEdit();
            }}
            className="space-y-5"
            noValidate
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Barbero <span className="text-destructive">*</span>
                </label>
                <select
                  name="id_barbero"
                  id="id_barbero"
                  value={formData.id_barbero}
                  onChange={(e) => {
                    setFormData({ ...formData, id_barbero: Number(e.target.value) });
                    if (formErrors.id_barbero) setFormErrors((prev) => ({ ...prev, id_barbero: null }));
                  }}
                  className={`w-full px-4 py-2.5 bg-input-background border rounded-xl focus:outline-none text-foreground text-sm transition-all ${
                    formErrors.id_barbero
                      ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                      : "border-input focus:ring-2 focus:ring-primary"
                  }`}
                  autoFocus
                >
                  {barbers.map((b) => (
                    <option key={b.id_barbero} value={b.id_barbero}>
                      {b.nombre}
                    </option>
                  ))}
                </select>
                <FormFieldError error={formErrors.id_barbero} />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Tipo de Novedad <span className="text-destructive">*</span>
                </label>
                <select
                  name="tipo"
                  id="tipo"
                  value={formData.tipo}
                  onChange={(e) => {
                    setFormData({ ...formData, tipo: e.target.value });
                    if (formErrors.tipo) setFormErrors((prev) => ({ ...prev, tipo: null }));
                  }}
                  className={`w-full px-4 py-2.5 bg-input-background border rounded-xl focus:outline-none text-foreground text-sm transition-all ${
                    formErrors.tipo
                      ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                      : "border-input focus:ring-2 focus:ring-primary"
                  }`}
                >
                  {noveltyTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <FormFieldError error={formErrors.tipo} />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Fecha de la Novedad <span className="text-destructive">*</span>
                </label>
                <input
                  type="date"
                  name="fecha"
                  id="fecha"
                  value={formData.fecha || ""}
                  onChange={(e) => {
                    setFormData({ ...formData, fecha: e.target.value });
                    if (formErrors.fecha) setFormErrors((prev) => ({ ...prev, fecha: null }));
                  }}
                  className={`w-full px-4 py-2.5 bg-input-background border rounded-xl focus:outline-none text-foreground text-sm transition-all ${
                    formErrors.fecha
                      ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                      : "border-input focus:ring-2 focus:ring-primary"
                  }`}
                />
                <FormFieldError error={formErrors.fecha} />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Estado de la Solicitud
                </label>
                <select
                  name="estado"
                  id="estado"
                  value={formData.estado || "Pendiente"}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  className="w-full px-4 py-2.5 bg-input-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
                >
                  {noveltyStatuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Descripción / Motivo <span className="text-destructive">*</span>
                </label>
                <textarea
                  rows={3}
                  name="descripcion"
                  id="descripcion"
                  maxLength={255}
                  value={formData.descripcion || ""}
                  onChange={(e) => {
                    setFormData({ ...formData, descripcion: e.target.value });
                    if (formErrors.descripcion) setFormErrors((prev) => ({ ...prev, descripcion: null }));
                  }}
                  placeholder="Describe el motivo del permiso, ausencia o cambio de turno..."
                  className={`w-full px-4 py-2.5 bg-input-background border rounded-xl focus:outline-none text-foreground text-sm resize-none transition-all ${
                    formErrors.descripcion
                      ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                      : "border-input focus:ring-2 focus:ring-primary"
                  }`}
                />
                <FormFieldError error={formErrors.descripcion} />
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-border">
              <button
                type="submit"
                className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-semibold text-sm shadow-xs cursor-pointer"
              >
                Guardar Cambios
              </button>
              <button
                type="button"
                onClick={() => { setShowEditModal(false); setSelectedNovelty(null); resetForm(); setFormErrors({}); }}
                className="flex-1 py-3 border border-border rounded-xl hover:bg-accent transition-colors text-foreground font-medium text-sm cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Eliminar */}
      {showDeleteModal && selectedNovelty && (
        <ConfirmModal
          variant="delete"
          title="¿Eliminar esta novedad?"
          description={`Se eliminará la novedad de "${getBarberName(selectedNovelty.id_barbero)}" (${selectedNovelty.tipo} para el ${selectedNovelty.fecha}).`}
          confirmLabel="Eliminar"
          onConfirm={onHandleDelete}
          onClose={() => { setShowDeleteModal(false); setSelectedNovelty(null); }}
        />
      )}
    </div>
  );
}
