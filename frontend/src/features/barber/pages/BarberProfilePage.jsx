import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  Award,
  ShieldCheck,
  Clock,
  Scissors,
  CalendarCheck2,
  Edit3,
  Save,
  X,
  ArrowLeft,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import {
  getCurrentBarberProfile,
  getBarberAppointments,
  getBarberWeeklySchedule,
  updateCurrentBarberPhoto,
  updateCurrentBarberProfileData
} from "../services/barberStorageService";
import { useDataSync, SYNC_ENTITIES } from "../../../shared/services/dataSyncService";
import AvatarImageUploader from "../../admin/shared/components/AvatarImageUploader";
import FormFieldError from "../../admin/shared/components/FormFieldError";

export default function BarberProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [scheduleInfo, setScheduleInfo] = useState(null);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);

  // Modo edición de datos personales
  const [isEditingData, setIsEditingData] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    documento: "",
    especialidad: ""
  });
  const [errors, setErrors] = useState({});
  const [isSavingData, setIsSavingData] = useState(false);

  const loadProfileData = useCallback(() => {
    try {
      const current = getCurrentBarberProfile();
      setProfile(current);

      if (current) {
        setFormData({
          nombre: current.nombre || "",
          apellido: current.apellido || "",
          telefono: current.telefono || "",
          documento: current.documento || "",
          especialidad: current.especialidad || "Corte Clásico & Fade"
        });
      }

      const apts = getBarberAppointments();
      setAppointmentsCount(Array.isArray(apts) ? apts.length : 0);

      const sched = getBarberWeeklySchedule();
      setScheduleInfo(sched);
    } catch (err) {
      console.error("[BarberProfile] Error cargando perfil:", err);
    }
  }, []);

  useEffect(() => {
    loadProfileData();

    const handleProfileSync = () => {
      loadProfileData();
    };
    window.addEventListener("barber_profile_updated", handleProfileSync);
    window.addEventListener("auth_user_updated", handleProfileSync);
    return () => {
      window.removeEventListener("barber_profile_updated", handleProfileSync);
      window.removeEventListener("auth_user_updated", handleProfileSync);
    };
  }, [loadProfileData]);

  useDataSync([SYNC_ENTITIES.BARBERS, SYNC_ENTITIES.USERS], loadProfileData);

  const displayName = profile
    ? `${profile.nombre || ""} ${profile.apellido || ""}`.trim() || "Barbero"
    : "Barbero";

  const userInitials = profile
    ? `${(profile.nombre || "B").charAt(0)}${(profile.apellido || "").charAt(0)}`.toUpperCase()
    : "BR";

  // Cálculo a prueba de fallos de los días laborales
  const diasLaboralesCount = (() => {
    if (Array.isArray(scheduleInfo?.diasLaborales)) {
      return scheduleInfo.diasLaborales.length;
    }
    if (Array.isArray(scheduleInfo?.dias)) {
      return scheduleInfo.dias.filter((d) => !d.descanso).length;
    }
    return 6; // fallback estándar (Lunes a Sábado)
  })();

  const handlePhotoChange = async (newPhotoUrl) => {
    setIsSavingPhoto(true);
    try {
      const result = await updateCurrentBarberPhoto(newPhotoUrl);

      if (result.success) {
        setProfile((prev) => ({
          ...prev,
          imagen_url: result.imagen_url,
          avatar_url: result.imagen_url
        }));

        if (!result.imagen_url) {
          toast.success("Foto eliminada correctamente. Cambios actualizados en todo el sistema.");
        } else {
          toast.success("Foto de perfil actualizada exitosamente.");
        }
      } else {
        toast.error("No se pudo actualizar la foto de perfil.");
      }
    } catch (err) {
      console.error("[BarberProfile] Error actualizando foto:", err);
      toast.error("Ocurrió un error al guardar la foto de perfil.");
    } finally {
      setIsSavingPhoto(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.nombre.trim()) errs.nombre = "El nombre es obligatorio.";
    if (!formData.apellido.trim()) errs.apellido = "El apellido es obligatorio.";

    if (formData.telefono && formData.telefono.trim()) {
      const cleanPhone = formData.telefono.replace(/\D/g, "");
      if (cleanPhone.length < 7) {
        errs.telefono = "El teléfono debe tener al menos 7 dígitos.";
      }
    }

    if (formData.documento && formData.documento.trim()) {
      const cleanDoc = formData.documento.trim();
      if (cleanDoc.length < 5 || cleanDoc.length > 20) {
        errs.documento = "El documento debe tener entre 5 y 20 caracteres.";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveData = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSavingData(true);
    try {
      const result = await updateCurrentBarberProfileData({
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        documento: formData.documento ? formData.documento.trim() : null,
        telefono: formData.telefono ? formData.telefono.trim() : null,
        especialidad: formData.especialidad.trim() || profile?.especialidad
      });

      if (result.success) {
        setProfile((prev) => ({
          ...prev,
          nombre: formData.nombre.trim(),
          apellido: formData.apellido.trim(),
          telefono: formData.telefono ? formData.telefono.trim() : "",
          documento: formData.documento ? formData.documento.trim() : "",
          especialidad: formData.especialidad.trim() || prev?.especialidad
        }));

        setIsEditingData(false);
        toast.success("Datos de perfil actualizados con éxito en todo el sistema.");
      } else {
        toast.error("No se pudo actualizar los datos del perfil.");
      }
    } catch (err) {
      console.error("[BarberProfile] Error guardando datos:", err);
      toast.error("Ocurrió un error al guardar los cambios.");
    } finally {
      setIsSavingData(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* BARRA SUPERIOR CON RETORNO */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate("/barbero")}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-border bg-card/60 hover:bg-accent text-xs font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al Inicio</span>
        </button>

        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#DFB755]" />
          Portal de Operación Barber
        </span>
      </div>

      {/* HEADER DE PERFIL */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card/90 to-card/50 border border-[#C9A24A]/30 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-[#DFB755]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          {/* Avatar Grande: Imagen Real o Monograma */}
          <div className="relative shrink-0">
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
            <div
              className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-emerald-500 text-white shadow-md border-2 border-background"
              title="Cuenta Activa y Verificada"
            >
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
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                {profile?.correo || "barbero@tuturnobarber.com"}
              </span>
              <span>•</span>
              <span className="text-[#DFB755] font-semibold">
                {profile?.especialidad || "Corte Clásico & Fade"}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN CAMBIAR FOTO DE PERFIL */}
      <div className="rounded-3xl bg-card border border-border p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground">
              Fotografía Profesional
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Esta fotografía será visible para los clientes en la reserva de citas y catálogo.
            </p>
          </div>
          {profile?.imagen_url && (
            <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Foto Asignada
            </span>
          )}
        </div>

        <AvatarImageUploader
          value={profile?.imagen_url || ""}
          onChange={handlePhotoChange}
          label="Sube tu fotografía profesional en formato JPG, PNG o WEBP"
        />

        {isSavingPhoto && (
          <p className="text-xs text-[#DFB755] font-semibold mt-3 animate-pulse flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#DFB755] animate-ping" />
            Guardando fotografía en la base de datos...
          </p>
        )}
      </div>

      {/* ESTADÍSTICAS RÁPIDAS DEL BARBERO */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <CalendarCheck2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-foreground">{appointmentsCount}</div>
            <div className="text-xs text-muted-foreground font-medium">Citas Registradas</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-[#DFB755]/15 flex items-center justify-center text-[#DFB755] shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-foreground flex items-center gap-1">
              <span>5.0</span>
              <span className="text-sm text-[#DFB755]">★</span>
            </div>
            <div className="text-xs text-muted-foreground font-medium">Calificación Promedio</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-foreground">
              {diasLaboralesCount > 0 ? `${diasLaboralesCount} días/sem` : "Lunes a Sábado"}
            </div>
            <div className="text-xs text-muted-foreground font-medium">Jornada Laboral</div>
          </div>
        </div>
      </div>

      {/* INFORMACIÓN DE IDENTIFICACIÓN Y CONTACTO */}
      <div className="rounded-3xl bg-card border border-border p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground">
              Datos de Contacto y Seguridad
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Información registrada en el sistema de gestión y turnos.
            </p>
          </div>

          {!isEditingData ? (
            <button
              type="button"
              onClick={() => setIsEditingData(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#DFB755]/15 hover:bg-[#DFB755]/25 text-[#DFB755] border border-[#DFB755]/30 text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar Datos</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsEditingData(false);
                setErrors({});
                if (profile) {
                  setFormData({
                    nombre: profile.nombre || "",
                    apellido: profile.apellido || "",
                    telefono: profile.telefono || "",
                    documento: profile.documento || "",
                    especialidad: profile.especialidad || "Corte Clásico & Fade"
                  });
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:bg-muted text-xs font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancelar</span>
            </button>
          )}
        </div>

        {!isEditingData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-secondary/30 border border-border">
              <span className="text-[11px] font-bold uppercase text-muted-foreground block mb-1">
                Nombre Completo
              </span>
              <span className="text-sm font-semibold text-foreground">{displayName}</span>
            </div>

            <div className="p-4 rounded-xl bg-secondary/30 border border-border">
              <span className="text-[11px] font-bold uppercase text-muted-foreground block mb-1">
                Correo Electrónico
              </span>
              <span className="text-sm font-semibold text-foreground">
                {profile?.correo || "No registrado"}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-secondary/30 border border-border">
              <span className="text-[11px] font-bold uppercase text-muted-foreground block mb-1">
                Teléfono Móvil
              </span>
              <span className="text-sm font-semibold text-foreground">
                {profile?.telefono || "+57 300 000 0000"}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-secondary/30 border border-border">
              <span className="text-[11px] font-bold uppercase text-muted-foreground block mb-1">
                Documento de Identidad
              </span>
              <span className="text-sm font-semibold text-foreground">
                {profile?.documento || "1000000003"}
              </span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveData} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Nombre <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange("nombre", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#DFB755]/50"
                  placeholder="Nombre"
                />
                <FormFieldError message={errors.nombre} />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Apellido <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.apellido}
                  onChange={(e) => handleInputChange("apellido", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#DFB755]/50"
                  placeholder="Apellido"
                />
                <FormFieldError message={errors.apellido} />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Teléfono Móvil
                </label>
                <input
                  type="text"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange("telefono", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#DFB755]/50"
                  placeholder="Ej: +57 300 123 4567"
                />
                <FormFieldError message={errors.telefono} />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Documento de Identidad
                </label>
                <input
                  type="text"
                  value={formData.documento}
                  onChange={(e) => handleInputChange("documento", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#DFB755]/50"
                  placeholder="Ej: 1000000003"
                />
                <FormFieldError message={errors.documento} />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-foreground block mb-1">
                  Especialidad Profesional
                </label>
                <input
                  type="text"
                  value={formData.especialidad}
                  onChange={(e) => handleInputChange("especialidad", e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#DFB755]/50"
                  placeholder="Ej: Corte Clásico & Fade, Barba Spa"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  setIsEditingData(false);
                  setErrors({});
                }}
                className="px-4 py-2 rounded-xl border border-border hover:bg-muted text-xs font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSavingData}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#FFE082] via-[#E8C466] to-[#DDAE41] hover:brightness-105 text-black font-extrabold text-xs shadow-md shadow-[#DDAE41]/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingData ? "Guardando..." : "Guardar Cambios"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
