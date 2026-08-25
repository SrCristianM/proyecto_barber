import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
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
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium cursor-pointer shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Agendar Cita
        </motion.button>
      </div>

      {/* Controles: vista + navegación de fecha */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Toggle vista con píldora deslizante */}
        <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1 shadow-2xs">
          <button
            onClick={() => setView("calendar")}
            className={`relative px-4 py-1.5 rounded-md text-sm transition-colors cursor-pointer ${
              view === "calendar"
                ? "text-primary-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground font-medium"
            }`}
          >
            {view === "calendar" && (
              <motion.div
                layoutId="appointmentsViewTab"
                className="absolute inset-0 bg-primary rounded-md shadow-xs z-0"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative z-10">Calendario</span>
          </button>
          <button
            onClick={() => setView("list")}
            className={`relative px-4 py-1.5 rounded-md text-sm transition-colors cursor-pointer ${
              view === "list"
                ? "text-primary-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground font-medium"
            }`}
          >
            {view === "list" && (
              <motion.div
                layoutId="appointmentsViewTab"
                className="absolute inset-0 bg-primary rounded-md shadow-xs z-0"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative z-10">Lista</span>
          </button>
        </div>

        {/* Navegación de fecha */}
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={goToPrevDay}
            className="p-2 hover:bg-accent rounded-lg border border-border transition-colors cursor-pointer"
            title="Día anterior"
          >
            <ChevronLeft className="h-4 w-4 text-foreground" />
          </motion.button>

          <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg min-w-[220px] justify-center shadow-2xs">
            <CalendarIcon className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-medium text-foreground capitalize">
              {formatDateDisplay(selectedDate)}
            </span>
          </div>

          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={goToNextDay}
            className="p-2 hover:bg-accent rounded-lg border border-border transition-colors cursor-pointer"
            title="Día siguiente"
          >
            <ChevronRight className="h-4 w-4 text-foreground" />
          </motion.button>

          {!isToday && (
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={goToToday}
              className="px-3 py-2 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors border border-primary/20 cursor-pointer"
            >
              Hoy
            </motion.button>
          )}
        </div>
      </div>

      {/* Vistas animadas */}
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
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
        </motion.div>
      </AnimatePresence>

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
