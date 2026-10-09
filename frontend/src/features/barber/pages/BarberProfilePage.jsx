import { useState, useEffect } from "react";
import { toast } from "sonner";
import { User, Mail, Phone, Award, ShieldCheck, Clock, Scissors, CalendarCheck2, IdCard, Camera, Upload, Save } from "lucide-react";
import { getCurrentBarberProfile, getBarberAppointments, getBarberWeeklySchedule } from "../services/barberStorageService";
import { updateUserProfile } from "../../auth/services/authService";
import AvatarImageUploader from "../../admin/shared/components/AvatarImageUploader";

export default function BarberProfilePage() {
  const [profile, setProfile] = useState(null);
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [scheduleInfo, setScheduleInfo] = useState(null);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);

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

  const handlePhotoChange = async (newPhotoUrl) => {
    setIsSavingPhoto(true);
    try {
      const result = await updateUserProfile({
        nombre: profile.nombre,
        apellido: profile.apellido,
        documento: profile.documento,
        telefono: profile.telefono,
        imagen_url: newPhotoUrl || null,
        avatar_url: newPhotoUrl || null
      });

      if (result.success) {
        setProfile((prev) => ({
          ...prev,
          imagen_url: newPhotoUrl || null,
          avatar_url: newPhotoUrl || null
        }));
        toast.success("Foto de perfil actualizada exitosamente en la base de datos.");
      } else {
        toast.error(result.error || "No se pudo actualizar la foto de perfil.");
      }
    } catch (err) {
      toast.error("Ocurrió un error al guardar la foto de perfil.");
    } finally {
      setIsSavingPhoto(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* HEADER DE PERFIL */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card/90 to-card/50 border border-[#C9A24A]/30 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-[#DFB755]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          {/* Avatar Grande: Imagen Real de BD o Monograma si no existe foto */}
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-[#FFE082] via-[#E8C466] to-[#DDAE41] p-1 shadow-lg shadow-[#DDAE41]/30 overflow-hidden">
              {profile?.imagen_url ? (
                <img
                  src={profile.imagen_url}
                  alt={displayName}
                  className="w-full h-full rounded-[22px] object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-[22px] bg-background flex items-center justify-center text-2xl sm:text-3xl font-black text-[#DFB755]">
                  {userInitials}
                </div>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-emerald-500 text-white shadow-md border-2 border-background" title="Cuenta Activa">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="flex-1 space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#C9A24A]/20 text-[#FFE082] border border-[#C9A24A]/40 mb-1">
              <Scissors className="w-3 h-3 text-[#FFE082]" />
              <span>Rol Profesional: Barbero Especialista</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              {displayName}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-2">
              <span>{profile?.correo || "barbero@tuturnobarber.com"}</span>
              <span>•</span>
              <span className="text-[#DFB755] font-semibold">{profile?.especialidad || "Corte Clásico & Fade"}</span>
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN CAMBIAR FOTO DE PERFIL (CONECTADO A BACKEND Y BASE DE DATOS) */}
      <div className="rounded-3xl bg-card border border-border p-6 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground border-b border-border pb-2 mb-4">
          Foto de Perfil del Barbero
        </h3>
        <AvatarImageUploader
          value={profile?.imagen_url || ""}
          onChange={handlePhotoChange}
          label="Sube tu fotografía profesional para mostrar a los clientes en catálogo y citas"
        />
        {isSavingPhoto && (
          <p className="text-xs text-[#DFB755] font-semibold mt-2 animate-pulse">
            Guardando foto en el servidor y base de datos...
          </p>
        )}
      </div>

      {/* ESTADÍSTICAS RÁPIDAS DEL BARBERO */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <CalendarCheck2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-foreground">{appointmentsCount}</div>
            <div className="text-xs text-muted-foreground font-medium">Citas Registradas</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#DFB755]/15 flex items-center justify-center text-[#DFB755] shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-foreground">0.0</div>
            <div className="text-xs text-muted-foreground font-medium">Calificación Promedio</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-foreground">
              {scheduleInfo ? `${scheduleInfo.diasLaborales.length} días/sem` : "Lunes a Sábado"}
            </div>
            <div className="text-xs text-muted-foreground font-medium">Jornada Laboral</div>
          </div>
        </div>
      </div>

      {/* INFORMACIÓN DE IDENTIFICACIÓN Y CONTACTO */}
      <div className="rounded-3xl bg-card border border-border p-6 sm:p-8 space-y-4 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
          Datos de Contacto y Seguridad
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-secondary/30 border border-border">
            <span className="text-[11px] font-bold uppercase text-muted-foreground block mb-1">Nombre Completo</span>
            <span className="text-sm font-semibold text-foreground">{displayName}</span>
          </div>

          <div className="p-4 rounded-xl bg-secondary/30 border border-border">
            <span className="text-[11px] font-bold uppercase text-muted-foreground block mb-1">Correo Electrónico</span>
            <span className="text-sm font-semibold text-foreground">{profile?.correo || "No registrado"}</span>
          </div>

          <div className="p-4 rounded-xl bg-secondary/30 border border-border">
            <span className="text-[11px] font-bold uppercase text-muted-foreground block mb-1">Teléfono Móvil</span>
            <span className="text-sm font-semibold text-foreground">{profile?.telefono || "+57 300 000 0000"}</span>
          </div>

          <div className="p-4 rounded-xl bg-secondary/30 border border-border">
            <span className="text-[11px] font-bold uppercase text-muted-foreground block mb-1">Documento de Identidad</span>
            <span className="text-sm font-semibold text-foreground">{profile?.documento || "1000000003"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
