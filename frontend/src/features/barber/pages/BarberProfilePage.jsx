import { useState, useEffect } from "react";
import { User, Mail, Phone, Award, ShieldCheck, Clock, Scissors, CalendarCheck2 } from "lucide-react";
import { getCurrentBarberProfile, getBarberAppointments, getBarberWeeklySchedule } from "../services/barberStorageService";

export default function BarberProfilePage() {
  const [profile, setProfile] = useState(null);
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [scheduleInfo, setScheduleInfo] = useState(null);

  useEffect(() => {
    const current = getCurrentBarberProfile();
    setProfile(current);

    const apts = getBarberAppointments();
    setAppointmentsCount(apts.length);

    const sched = getBarberWeeklySchedule();
    setScheduleInfo(sched);
  }, []);

  const displayName = profile ? `${profile.nombre} ${profile.apellido || ""}`.trim() : "Barbero";
  const userInitials = profile
    ? `${(profile.nombre || "B").charAt(0)}${(profile.apellido || "").charAt(0)}`.toUpperCase()
    : "BR";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* HEADER DE PERFIL */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card/90 to-card/50 border border-[#C9A24A]/30 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-[#DFB755]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          {/* Avatar Grande */}
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-[#FFE082] via-[#E8C466] to-[#DDAE41] p-1 shadow-lg shadow-[#DDAE41]/30">
              <div className="w-full h-full rounded-[22px] bg-background flex items-center justify-center text-2xl sm:text-3xl font-black text-[#DFB755]">
                {userInitials}
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center text-white" title="Activo">
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Información Principal */}
          <div className="space-y-1.5 flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-[#DFB755]/15 text-[#DFB755] border border-[#DFB755]/30">
              <Award className="w-3.5 h-3.5" />
              <span>Barbero Profesional Verificado</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              {displayName}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-3">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-[#DFB755]" />
                {profile?.correo}
              </span>
              {profile?.telefono && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#DFB755]" />
                  {profile?.telefono}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* DETALLES PROFESIONALES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información del Puesto */}
        <div className="p-6 rounded-3xl bg-card border border-border space-y-4 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-border/80">
            <Scissors className="w-4 h-4 text-[#DFB755]" />
            <h2 className="text-sm font-black text-foreground uppercase tracking-wider">
              Información de Especialidad
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-muted-foreground font-bold block">Especialidad Principal:</span>
              <p className="text-base font-extrabold text-foreground mt-0.5">
                {profile?.especialidad || "Corte Clásico & Fade"}
              </p>
            </div>

            <div>
              <span className="text-muted-foreground font-bold block">Estado en Barbería:</span>
              <p className="text-xs font-bold text-emerald-500 mt-0.5 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Activo y Habilitado para Agenda
              </p>
            </div>

            <div>
              <span className="text-muted-foreground font-bold block">Total Citas Asignadas:</span>
              <p className="text-base font-black text-[#DFB755] mt-0.5">
                {appointmentsCount} citas registradas
              </p>
            </div>
          </div>
        </div>

        {/* Turno y Horario de Atención */}
        <div className="p-6 rounded-3xl bg-card border border-border space-y-4 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-border/80">
            <Clock className="w-4 h-4 text-[#DFB755]" />
            <h2 className="text-sm font-black text-foreground uppercase tracking-wider">
              Horario de Operación
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-muted-foreground font-bold block">Vigencia Actual:</span>
              <p className="text-sm font-bold text-foreground mt-0.5">
                {scheduleInfo?.vigenciaInicio || "01/01/2026"} — {scheduleInfo?.vigenciaFin || "31/12/2026"}
              </p>
            </div>

            <div>
              <span className="text-muted-foreground font-bold block">Jornada Diaria Habitual:</span>
              <p className="text-sm font-black text-[#DFB755] mt-0.5">
                08:00 AM — 06:00 PM
              </p>
            </div>

            <div className="p-3 rounded-xl bg-accent/40 border border-border/60 text-[11px] text-muted-foreground">
              Para modificaciones de horarios o solicitud de días de descanso, acude al módulo de{" "}
              <strong className="text-foreground">Novedades</strong>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
