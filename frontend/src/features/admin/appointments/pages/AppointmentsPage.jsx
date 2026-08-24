import { Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useAppointments } from "../hooks/useAppointments";
import AppointmentsCalendarView from "../components/AppointmentsCalendarView";
import AppointmentsListView from "../components/AppointmentsListView";
import AppointmentFormModal from "../components/AppointmentFormModal";

export default function AppointmentsPage() {
  const {
    appointments,
    view,
    setView,
    timeSlots,
    barbers,
    clients,
    services,
    getAppointmentForSlot,
    getClientName,
    getBarberName,
    getServiceInfo,
    showFormModal,
    setShowFormModal,
    selectedAppointment,
    setSelectedAppointment,
    formData,
    setFormData,
    resetForm,
    handleCreate,
    handleEdit,
    openCreateModal,
    openEditModal
  } = useAppointments();

  const onHandleCreate = () => {
    handleCreate();
    toast.success("Cita agendada correctamente");
  };

  const onHandleEdit = () => {
    handleEdit();
    toast.success("Cita actualizada correctamente");
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Citas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gestiona las citas de la barbería</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Agendar Cita
        </button>
      </div>

      {/* Controles de vista y navegación */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 bg-card border border-border rounded-lg p-1">
          <button
            onClick={() => setView("calendar")}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
              view === "calendar" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent"
            }`}
          >
            Calendario
          </button>
          <button
            onClick={() => setView("list")}
            className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
              view === "list" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent"
            }`}
          >
            Lista
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-accent rounded-lg border border-border transition-colors">
            <ChevronLeft className="h-4 w-4 text-foreground" />
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg">
            <CalendarIcon className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Lunes, 2 Jun 2026</span>
          </div>
          <button className="p-2 hover:bg-accent rounded-lg border border-border transition-colors">
            <ChevronRight className="h-4 w-4 text-foreground" />
          </button>
        </div>
      </div>

      {/* Vistas */}
      {view === "calendar" ? (
        <AppointmentsCalendarView
          timeSlots={timeSlots}
          barbers={barbers}
          getAppointmentForSlot={getAppointmentForSlot}
          getClientName={getClientName}
          getServiceInfo={getServiceInfo}
        />
      ) : (
        <AppointmentsListView
          appointments={appointments}
          getClientName={getClientName}
          getBarberName={getBarberName}
          getServiceInfo={getServiceInfo}
          onEdit={openEditModal}
        />
      )}

      {/* Modal Agendar / Editar Cita */}
      {showFormModal && (
        <AppointmentFormModal
          mode={selectedAppointment ? "edit" : "create"}
          formData={formData}
          setFormData={setFormData}
          clients={clients}
          barbers={barbers}
          services={services}
          onSubmit={selectedAppointment ? onHandleEdit : onHandleCreate}
          onClose={() => {
            setShowFormModal(false);
            setSelectedAppointment(null);
            resetForm();
          }}
        />
      )}
    </div>
  );
}
