import { Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useAppointments } from "../hooks/useAppointments";
import AppointmentsCalendarView from "../components/AppointmentsCalendarView";
import AppointmentsListView from "../components/AppointmentsListView";

export default function AppointmentsPage() {
  const {
    appointments,
    view,
    setView,
    timeSlots,
    barbers,
    getAppointmentForSlot,
    getClientName,
    getBarberName,
    getServiceInfo
  } = useAppointments();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Citas</h1>
          <p className="text-muted-foreground">Gestiona las citas de la barbería</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
          <Plus className="h-5 w-5" />
          Nueva Cita
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-1">
          <button
            onClick={() => setView("calendar")}
            className={`px-4 py-2 rounded transition-colors ${
              view === "calendar" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent"
            }`}
          >
            Calendario
          </button>
          <button
            onClick={() => setView("list")}
            className={`px-4 py-2 rounded transition-colors ${
              view === "list" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent"
            }`}
          >
            Lista
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-accent rounded-lg border border-border">
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <span className="font-medium text-foreground">Lunes, 2 Jun 2026</span>
          </div>
          <button className="p-2 hover:bg-accent rounded-lg border border-border">
            <ChevronRight className="h-5 w-5 text-foreground" />
          </button>
        </div>
      </div>

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
        />
      )}
    </div>
  );
}
