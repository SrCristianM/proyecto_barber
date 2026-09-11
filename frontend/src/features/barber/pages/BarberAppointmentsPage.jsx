import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import {
  Scissors,
  Search,
  Filter,
  Eye,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Package,
  FileText,
  Sparkles
} from "lucide-react";
import SearchableSelect from "../../admin/shared/components/SearchableSelect";
import Modal from "../../admin/shared/components/Modal";
import {
  getBarberAppointments,
  getCurrentBarberProfile,
  completeBarberAppointment
} from "../services/barberStorageService";

const getLoyaltyBadge = (tier) => {
  switch (tier) {
    case "Oro":
      return "bg-gradient-to-r from-amber-500/20 via-yellow-400/30 to-amber-500/20 text-amber-400 border-amber-500/40 animate-metallic-shimmer shadow-xs";
    case "Plata":
      return "bg-gradient-to-r from-slate-400/20 via-slate-200/30 to-slate-400/20 text-slate-300 border-slate-400/40 animate-metallic-shimmer shadow-xs";
    case "Bronce":
      return "bg-gradient-to-r from-amber-700/20 via-amber-600/30 to-amber-700/20 text-amber-600 border-amber-700/40 animate-metallic-shimmer shadow-xs";
    default:
      return "bg-primary/15 text-primary border-primary/30";
  }
};

export default function BarberAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [barber, setBarber] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = () => {
    setLoading(true);
    const profile = getCurrentBarberProfile();
    setBarber(profile);
    const data = getBarberAppointments();
    setAppointments(data);
    setLoading(false);
  };

  const handleCompleteAppointment = (id_cita) => {
    const res = completeBarberAppointment(id_cita);
    if (res.success) {
      confetti({
        particleCount: 85,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#DFB755", "#E8C466", "#DDAE41", "#FFFFFF", "#10B981"]
      });
      toast.success(`¡Cita #${id_cita} marcada como Completada!`, {
        description: "Servicio registrado correctamente."
      });
      loadAppointments();
      setSelectedAppointment(null);
    } else {
      toast.error(res.error || "No se pudo actualizar la cita.");
    }
  };

  const handleRequestCancellation = (apt) => {
    navigate("/barbero/novedades", {
      state: {
        fromAppointment: {
          id_cita: apt.id_cita,
          fecha: apt.fecha,
          label: `Cita #${apt.id_cita} - ${apt.cliente_nombre} (${apt.fecha} ${apt.hora})`
        }
      }
    });
  };

  const statusOptions = [
    { value: "all", label: "Todas las citas" },
    { value: "Programada", label: "Programadas / Pendientes" },
    { value: "Completada", label: "Completadas" },
    { value: "Cancelada", label: "Canceladas" }
  ];

  // Filtrado
  const filteredAppointments = appointments.filter((apt) => {
    const search = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !search ||
      (apt.cliente_nombre || "").toLowerCase().includes(search) ||
      (apt.servicio_nombre || "").toLowerCase().includes(search) ||
      (apt.paquete_nombre || "").toLowerCase().includes(search) ||
      String(apt.id_cita).includes(search);

    const matchesStatus =
      statusFilter === "all" ||
      apt.estado.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (estado) => {
    switch (estado) {
      case "Programada":
        return "bg-[#DFB755]/15 text-[#DFB755] border-[#DFB755]/30";
      case "Completada":
        return "bg-emerald-500/15 text-emerald-500 border-emerald-500/30";
      case "Cancelada":
        return "bg-destructive/15 text-destructive border-destructive/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER DE MÓDULO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Mis Citas Asignadas
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#DFB755]/15 text-[#DFB755] border border-[#DFB755]/30">
              Listado
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Consulta el historial y las próximas atenciones asignadas exclusivamente a ti.
          </p>
        </div>

        <Link
          to="/barbero/agenda"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black font-extrabold text-xs shadow-md shadow-[#DDAE41]/25 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Calendar className="w-4 h-4" />
          <span>Ver en Calendario</span>
        </Link>
      </div>

      {/* FILTROS CON SEARCHABLE SELECT */}
      <div className="p-4 rounded-2xl bg-card border border-border">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Búsqueda */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente, servicio o número de cita (#101)..."
              className="w-full pl-9 pr-3 py-2 bg-input-background border border-input rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Filtro Estado */}
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

      {/* LISTADO / TABLA RESPONSIVE DE CITAS */}
      <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-lg">
        <div className="p-4 sm:p-5 border-b border-border bg-muted/20 flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            Citas Encontradas ({filteredAppointments.length})
          </span>
          <span className="text-xs font-bold text-muted-foreground">
            {barber?.nombre} {barber?.apellido}
          </span>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-muted/40 text-muted-foreground mx-auto flex items-center justify-center">
              <Scissors className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-base font-bold text-foreground">No tienes citas programadas.</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No se encontraron citas con los filtros especificados o aún no tienes atenciones asignadas para este criterio.
            </p>
            <Link
              to="/barbero/agenda"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent hover:bg-[#DFB755]/20 text-foreground hover:text-[#DFB755] font-bold text-xs transition-colors cursor-pointer border border-border mt-2"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Ver agenda diaria</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/80 bg-muted/10 text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                  <th className="py-3.5 px-4 sm:px-6">Cita</th>
                  <th className="py-3.5 px-4 sm:px-6">Cliente</th>
                  <th className="py-3.5 px-4 sm:px-6">Fecha & Hora</th>
                  <th className="py-3.5 px-4 sm:px-6">Servicio</th>
                  <th className="py-3.5 px-4 sm:px-6">Paquete</th>
                  <th className="py-3.5 px-4 sm:px-6">Estado</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs sm:text-sm">
                {filteredAppointments.map((apt) => (
                  <tr key={apt.id_cita} className="hover:bg-accent/40 transition-colors">
                    {/* Cita */}
                    <td className="py-4 px-4 sm:px-6 font-black text-foreground font-mono">
                      #{apt.id_cita}
                    </td>

                    {/* Cliente */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#DFB755]/15 text-[#DFB755] flex items-center justify-center font-bold text-xs shrink-0">
                          {apt.cliente_nombre.charAt(0)}
                        </div>
                        <div>
                          <span className="font-extrabold text-foreground truncate max-w-[140px] block">
                            {apt.cliente_nombre}
                          </span>
                          {apt.cliente_fidelidad && (
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-black border mt-0.5 ${getLoyaltyBadge(apt.cliente_fidelidad)}`}>
                              <Sparkles className="w-2 h-2" />
                              {apt.cliente_fidelidad}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Fecha & Hora */}
                    <td className="py-4 px-4 sm:px-6">
                      <span className="font-bold text-foreground block">{apt.fecha}</span>
                      <span className="text-[11px] text-muted-foreground font-mono">{apt.hora}</span>
                    </td>

                    {/* Servicio */}
                    <td className="py-4 px-4 sm:px-6">
                      <span className="font-medium text-foreground truncate max-w-[160px] block">
                        {apt.servicio_nombre}
                      </span>
                    </td>

                    {/* Paquete */}
                    <td className="py-4 px-4 sm:px-6">
                      {apt.paquete_nombre ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#DFB755]/15 text-[#DFB755] border border-[#DFB755]/30">
                          <Package className="w-3 h-3" />
                          {apt.paquete_nombre}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>

                    {/* Estado */}
                    <td className="py-4 px-4 sm:px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getStatusBadge(apt.estado)}`}>
                        {apt.estado}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {apt.estado === "Programada" && (
                          <button
                            type="button"
                            onClick={() => handleCompleteAppointment(apt.id_cita)}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                            title="Marcar como atendida"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span className="hidden xl:inline">Atendida</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedAppointment(apt)}
                          className="px-3 py-1.5 rounded-xl bg-accent hover:bg-[#DFB755]/20 text-foreground hover:text-[#DFB755] border border-border text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                          title="Ver detalle de cita"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detalle</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DETALLE DE CITA */}
      {selectedAppointment && (
        <Modal
          title={`Detalle de Cita #${selectedAppointment.id_cita}`}
          onClose={() => setSelectedAppointment(null)}
          maxWidthClass="max-w-lg"
        >
          <div className="space-y-4">
            {/* Cabecera */}
            <div className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Estado Actual</span>
                <p className="text-sm font-extrabold text-foreground mt-0.5">{selectedAppointment.estado}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-black border ${getStatusBadge(selectedAppointment.estado)}`}>
                {selectedAppointment.estado}
              </span>
            </div>

            {/* Datos del Cliente */}
            <div className="p-4 rounded-2xl bg-accent/30 border border-border space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#DFB755]" />
                  <span>Información del Cliente</span>
                </h4>
                {selectedAppointment.cliente_fidelidad && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border flex items-center gap-1 ${getLoyaltyBadge(selectedAppointment.cliente_fidelidad)}`}>
                    <Sparkles className="w-2.5 h-2.5" />
                    Nivel {selectedAppointment.cliente_fidelidad}
                  </span>
                )}
              </div>
              <p className="text-sm font-black text-foreground">{selectedAppointment.cliente_nombre}</p>
              <div className="grid grid-cols-2 gap-2 text-muted-foreground pt-1">
                {selectedAppointment.cliente_telefono && (
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#DFB755]" />
                    <span>{selectedAppointment.cliente_telefono}</span>
                  </p>
                )}
                {selectedAppointment.cliente_correo && (
                  <p className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-[#DFB755]" />
                    <span className="truncate">{selectedAppointment.cliente_correo}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Datos del Servicio / Paquete */}
            <div className="p-4 rounded-2xl bg-card border border-border space-y-3 text-xs">
              <h4 className="font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-[#DFB755]" />
                <span>Servicio & Programación</span>
              </h4>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-foreground">
                    {selectedAppointment.servicio_nombre}
                  </p>
                  {selectedAppointment.paquete_nombre && (
                    <span className="text-[11px] font-bold text-[#DFB755] block">
                      Incluido en paquete: {selectedAppointment.paquete_nombre}
                    </span>
                  )}
                </div>
                <span className="text-sm font-extrabold text-[#DFB755]">
                  ${Number(selectedAppointment.precio || selectedAppointment.servicio_precio || 0).toLocaleString("es-CO")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
                <div>
                  <span className="text-muted-foreground font-bold">Fecha:</span>
                  <p className="font-extrabold text-foreground">{selectedAppointment.fecha}</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-bold">Hora:</span>
                  <p className="font-extrabold text-foreground">{selectedAppointment.hora}</p>
                </div>
              </div>

              {selectedAppointment.notas && (
                <div className="p-3 rounded-xl bg-accent/40 border border-border/60">
                  <span className="font-bold text-muted-foreground block mb-0.5">Notas del Cliente:</span>
                  <p className="text-foreground italic">{selectedAppointment.notas}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {selectedAppointment.estado === "Programada" && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleCompleteAppointment(selectedAppointment.id_cita)}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Marcar Atendida</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRequestCancellation(selectedAppointment)}
                      className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Solicitar Cancelación</span>
                    </button>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="px-5 py-2 rounded-xl bg-accent hover:bg-accent/80 text-foreground font-bold text-xs transition-colors cursor-pointer ml-auto"
              >
                Cerrar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
