import { useState, useEffect } from "react";
import { toast } from "sonner";
import { User, Mail, Phone, MapPin, Award, Lock, Save, CheckCircle2, ShieldCheck } from "lucide-react";
import { getCurrentClientProfile, updateClientProfile } from "../services/clientStorageService";
import FormFieldError from "../../admin/shared/components/FormFieldError";
import NumericInput from "../../admin/shared/components/NumericInput";

export default function ClientProfilePage() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    direccion: "",
    contrasenaActual: "",
    nuevaContrasena: "",
    confirmarContrasena: ""
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const current = getCurrentClientProfile();
    if (current) {
      setProfile(current);
      setFormData({
        nombre: current.nombre || "",
        apellido: current.apellido || "",
        correo: current.correo || "",
        telefono: current.telefono || "",
        direccion: current.direccion || "",
        contrasenaActual: "",
        nuevaContrasena: "",
        confirmarContrasena: ""
      });
    }
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.nombre.trim()) errs.nombre = "El nombre es obligatorio.";
    if (!formData.apellido.trim()) errs.apellido = "El apellido es obligatorio.";

    if (formData.telefono) {
      const cleanPhone = formData.telefono.replace(/\D/g, "");
      if (cleanPhone.length < 10) {
        errs.telefono = "El teléfono debe contener al menos 10 dígitos numéricos.";
      }
    }

    if (formData.nuevaContrasena) {
      if (formData.nuevaContrasena.length < 8) {
        errs.nuevaContrasena = "La nueva contraseña debe tener al menos 8 caracteres.";
      }
      if (formData.nuevaContrasena !== formData.confirmarContrasena) {
        errs.confirmarContrasena = "Las contraseñas no coinciden.";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Por favor revisa los campos señalados.");
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      const res = updateClientProfile(formData);
      setIsSaving(false);
      if (res.success) {
        setProfile(res.profile);
        setFormData((prev) => ({
          ...prev,
          contrasenaActual: "",
          nuevaContrasena: "",
          confirmarContrasena: ""
        }));
        toast.success("¡Tu perfil ha sido actualizado con éxito!");
      } else {
        toast.error(res.error || "No se pudo actualizar el perfil.");
      }
    }, 400);
  };

  const loyaltyTier = profile?.nivel_fidelidad || "Nuevo";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* CABECERA */}
      <div className="border-b border-border pb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-[#C9A24A]">Datos de Cuenta</span>
        <h1 className="text-2xl sm:text-3xl font-black text-foreground">Mi Perfil</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Gestiona tu información de contacto, dirección y credenciales de acceso al portal.
        </p>
      </div>

      {/* TARJETA RESUMEN DE FIDELIDAD */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-card via-card to-[#C9A24A]/10 border border-[#C9A24A]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#C9A24A]/20 border border-[#C9A24A]/40 flex items-center justify-center text-xl font-black text-[#C9A24A]">
            {profile?.nombre ? profile.nombre.charAt(0) : "C"}
          </div>
          <div>
            <h2 className="text-lg font-black text-foreground">
              {profile?.nombre} {profile?.apellido}
            </h2>
            <p className="text-xs text-muted-foreground">{profile?.correo}</p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#C9A24A]/20 border border-[#C9A24A]/40 text-xs font-extrabold text-[#C9A24A] self-start sm:self-auto">
          <Award className="w-4 h-4" />
          <span>Nivel {loyaltyTier}</span>
        </div>
      </div>

      {/* FORMULARIO DE EDICIÓN */}
      <form onSubmit={handleSubmit} className="rounded-3xl bg-card border border-border p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
            Información Personal
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                Nombre <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-input-background border text-foreground text-sm focus:outline-none ${
                  errors.nombre ? "border-destructive focus:ring-2 focus:ring-destructive/30" : "border-input focus:ring-2 focus:ring-[#C9A24A]"
                }`}
                placeholder="Pedro"
              />
              <FormFieldError error={errors.nombre} />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                Apellido <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.apellido}
                onChange={(e) => handleChange("apellido", e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-input-background border text-foreground text-sm focus:outline-none ${
                  errors.apellido ? "border-destructive focus:ring-2 focus:ring-destructive/30" : "border-input focus:ring-2 focus:ring-[#C9A24A]"
                }`}
                placeholder="López"
              />
              <FormFieldError error={errors.apellido} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Correo Electrónico (Registrado)
              </label>
              <input
                type="email"
                disabled
                value={formData.correo}
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted/50 border border-input text-muted-foreground text-sm cursor-not-allowed"
              />
              <span className="text-[11px] text-muted-foreground mt-1 block">
                Para cambiar tu correo contacta con administración.
              </span>
            </div>

            <div>
              <NumericInput
                label="Teléfono de Contacto"
                value={formData.telefono}
                onChange={(val) => handleChange("telefono", val)}
                error={errors.telefono}
                placeholder="3001234567"
                maxLength={12}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
              Dirección de Residencia (opcional)
            </label>
            <input
              type="text"
              value={formData.direccion}
              onChange={(e) => handleChange("direccion", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-input-background border border-input text-foreground text-sm focus:ring-2 focus:ring-[#C9A24A]"
              placeholder="Calle 10 # 5-20"
            />
          </div>
        </div>

        {/* CAMBIO DE CONTRASEÑA */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#C9A24A]" />
            <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground">
              Cambiar Contraseña (Opcional)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                Nueva Contraseña
              </label>
              <input
                type="password"
                value={formData.nuevaContrasena}
                onChange={(e) => handleChange("nuevaContrasena", e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-input-background border text-foreground text-sm focus:outline-none ${
                  errors.nuevaContrasena ? "border-destructive focus:ring-2 focus:ring-destructive/30" : "border-input focus:ring-2 focus:ring-[#C9A24A]"
                }`}
              />
              <FormFieldError error={errors.nuevaContrasena} />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                Confirmar Nueva Contraseña
              </label>
              <input
                type="password"
                value={formData.confirmarContrasena}
                onChange={(e) => handleChange("confirmarContrasena", e.target.value)}
                placeholder="Repite la nueva contraseña"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-input-background border text-foreground text-sm focus:outline-none ${
                  errors.confirmarContrasena ? "border-destructive focus:ring-2 focus:ring-destructive/30" : "border-input focus:ring-2 focus:ring-[#C9A24A]"
                }`}
              />
              <FormFieldError error={errors.confirmarContrasena} />
            </div>
          </div>
        </div>

        {/* BOTÓN GUARDAR */}
        <div className="pt-4 border-t border-border flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-xl bg-[#C9A24A] hover:bg-[#d8b056] text-black font-extrabold text-xs shadow-md shadow-[#C9A24A]/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Guardando..." : "GUARDAR CAMBIOS"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
