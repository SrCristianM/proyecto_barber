import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { useAppointments } from "../hooks/useAppointments";
import AppointmentsCalendarView from "../components/AppointmentsCalendarView";
import AppointmentsListView from "../components/AppointmentsListView";
import AppointmentFormModal from "../components/AppointmentFormModal";

export default function AppointmentsPage() {
  const {
    appointmentsForDate,
    view,
    setView,
    selectedDate,
    isToday,
    goToPrevDay,
    goToNextDay,
    goToToday,
    formatDateDisplay,
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
    openCreateFromSlot,
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

      {/* Controles: vista + navegación de fecha */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Toggle vista */}
        <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
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

        {/* Navegación de fecha */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevDay}
            className="p-2 hover:bg-accent rounded-lg border border-border transition-colors"
            title="Día anterior"
          >
            <ChevronLeft className="h-4 w-4 text-foreground" />
          </button>

          <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg min-w-[220px] justify-center">
            <CalendarIcon className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-medium text-foreground capitalize">
              {formatDateDisplay(selectedDate)}
            </span>
          </div>

          <button
            onClick={goToNextDay}
            className="p-2 hover:bg-accent rounded-lg border border-border transition-colors"
            title="Día siguiente"
          >
            <ChevronRight className="h-4 w-4 text-foreground" />
          </button>

          {!isToday && (
            <button
              onClick={goToToday}
              className="px-3 py-2 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors border border-primary/20"
            >
              Hoy
            </button>
          )}
        </div>
      </div>

      {/* Vista calendario */}
      {view === "calendar" ? (
        <AppointmentsCalendarView
          timeSlots={timeSlots}
          barbers={barbers}
          selectedDate={selectedDate}
          getAppointmentForSlot={getAppointmentForSlot}
          getClientName={getClientName}
          getServiceInfo={getServiceInfo}
          onSlotClick={(barber, time) => openCreateFromSlot(barber, time)}
          onAppointmentClick={(apt) => openEditModal(apt)}
        />
      ) : (
        <AppointmentsListView
          appointments={appointmentsForDate}
          getClientName={getClientName}
          getBarberName={getBarberName}
          getServiceInfo={getServiceInfo}
          onEdit={openEditModal}
        />
      )}

      {/* Modal Crear / Editar Cita */}
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
