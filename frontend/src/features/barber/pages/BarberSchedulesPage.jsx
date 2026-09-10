import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Clock,
  Calendar,
  CheckCircle2,
  Coffee,
  AlertCircle,
  FileText,
  ShieldCheck,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { getBarberWeeklySchedule } from "../services/barberStorageService";

export default function BarberSchedulesPage() {
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = getBarberWeeklySchedule();
    setScheduleData(data);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        <Clock className="w-8 h-8 animate-spin mx-auto text-[#DFB755] mb-2" />
        <p className="text-sm font-bold">Cargando tus horarios...</p>
      </div>
    );
  }

  if (!scheduleData || !scheduleData.dias || scheduleData.dias.length === 0) {
    return (
      <div className="p-12 text-center rounded-3xl bg-card border border-dashed border-border space-y-3">
        <Clock className="w-10 h-10 mx-auto text-muted-foreground" />
        <h3 className="text-base font-bold text-foreground">No tienes horarios disponibles para mostrar.</h3>
        <p className="text-xs text-muted-foreground">
          Comunícate con la administración si tu turno laboral aún no ha sido configurado en el sistema.
        </p>
      </div>
    );
  }

  const workingDaysCount = scheduleData.dias.filter((d) => !d.descanso).length;
  const restDaysCount = scheduleData.dias.filter((d) => d.descanso).length;

  return (
    <div className="space-y-6">
      {/* HEADER DE MIS HORARIOS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Mis Horarios de Atención
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#DFB755]/15 text-[#DFB755] border border-[#DFB755]/30">
              Consulta Oficial
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Revisa tus turnos laborales asignados por la administración y tus días de descanso.
          </p>
        </div>

        {/* CTA para solicitar novedades */}
        <Link
          to="/barbero/novedades"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black font-extrabold text-xs shadow-md shadow-[#DDAE41]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          <span>Solicitar Cambio de Turno</span>
        </Link>
      </div>

      {/* TARJETAS DE VIGENCIA Y RESUMEN SEMANAL */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
            Período de Vigencia
          </span>
          <p className="text-base font-black text-foreground">
            {scheduleData.vigenciaInicio} — {scheduleData.vigenciaFin}
          </p>
          <p className="text-[11px] text-emerald-500 font-bold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Horario Vigente
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
            Jornadas de Atención
          </span>
          <p className="text-2xl font-black text-[#DFB755]">
            {workingDaysCount} <span className="text-xs font-bold text-muted-foreground">días / semana</span>
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Disponibilidad en salón
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
            Días de Descanso
          </span>
          <p className="text-2xl font-black text-foreground">
            {restDaysCount} <span className="text-xs font-bold text-muted-foreground">días / semana</span>
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Receso asignado
          </p>
        </div>
      </div>

      {/* CUADRÍCULA VISUAL SEMANAL (LUNES A DOMINGO) */}
      <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-lg">
        <div className="p-5 border-b border-border bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#DFB755]" />
            <h2 className="text-sm sm:text-base font-black text-foreground tracking-tight">
              Distribución Semanal de Turnos
            </h2>
          </div>
          <span className="text-xs font-bold text-muted-foreground">
            {scheduleData.barberoNombre}
          </span>
        </div>

        <div className="divide-y divide-border/60">
          {scheduleData.dias.map((d) => (
            <div
              key={d.dia}
              className={`p-4 sm:p-5 flex items-center justify-between transition-colors ${
                d.descanso
                  ? "bg-accent/20 hover:bg-accent/30"
                  : "bg-card hover:bg-accent/40"
              }`}
            >
              {/* Nombre del día */}
              <div className="flex items-center gap-4 w-40 sm:w-48 shrink-0">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                    d.descanso
                      ? "bg-muted text-muted-foreground border border-border"
                      : "bg-[#DFB755]/15 text-[#DFB755] border border-[#DFB755]/30"
                  }`}
                >
                  {d.descanso ? <Coffee className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-sm sm:text-base font-black text-foreground">{d.dia}</p>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                    {d.descanso ? "Receso" : "Jornada Laboral"}
                  </span>
                </div>
              </div>

              {/* Franja Horaria / Estado */}
              <div className="flex-1 px-4 text-center sm:text-left">
                {d.descanso ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground border border-border">
                    <Coffee className="w-3.5 h-3.5" />
                    DESCANSO
                  </span>
                ) : (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-[#DFB755]/10 text-foreground border border-[#DFB755]/30">
                    <Clock className="w-3.5 h-3.5 text-[#DFB755]" />
                    <span>{d.horaInicio} AM — {d.horaFin} PM</span>
                  </div>
                )}
              </div>

              {/* Tag lateral */}
              <div className="shrink-0 hidden sm:block">
                {d.descanso ? (
                  <span className="text-xs font-medium text-muted-foreground">
                    No agendable
                  </span>
                ) : (
                  <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Turno Activo
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TARJETA DE INFORMACIÓN Y POLÍTICAS DEL SALÓN */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-card via-card to-accent/30 border border-border/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-2xl bg-[#DFB755]/15 text-[#DFB755] shrink-0 border border-[#DFB755]/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-foreground">
              Políticas de Horarios y Disponibilidad
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-xl">
              Los horarios son administrados centralmente para garantizar la cobertura del salón. 
              Si requieres un permiso, cambio de turno con otro barbero o notificar una ausencia, 
              utiliza el módulo de <strong>Novedades</strong> con antelación mínima de 24 horas.
            </p>
          </div>
        </div>

        <Link
          to="/barbero/novedades"
          className="px-4 py-2.5 rounded-xl border border-[#DFB755]/40 hover:bg-[#DFB755]/10 text-[#DFB755] font-bold text-xs transition-all shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Ir a Novedades</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
