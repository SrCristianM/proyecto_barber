import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  Scissors,
  ArrowLeft,
  Mail,
  MailCheck,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Timer,
  Check,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import AuthCard from "../components/AuthCard";
import AuthHeader from "../components/AuthHeader";
import FormInput from "../components/FormInput";
import PasswordInput from "../components/PasswordInput";
import AuthButton from "../components/AuthButton";
import FormFieldError from "../../admin/shared/components/FormFieldError";
import {
  validateForgotPasswordForm,
  validateResetPasswordForm
} from "../validations/authValidation";
import {
  requestPasswordReset,
  confirmPasswordReset
} from "../services/authService";

/**
 * Calcula nivel de fortaleza de contraseña en tiempo real
 */
function getPasswordStrength(password) {
  if (!password) return { score: 0, label: "Vacía", color: "bg-neutral-800", text: "text-[#8E8E93]" };
  let points = 0;
  if (password.length >= 8) points++;
  if (/[A-Z]/.test(password)) points++;
  if (/[a-z]/.test(password)) points++;
  if (/[0-9]/.test(password)) points++;
  if (/[^A-Za-z0-9]/.test(password)) points++;

  if (points <= 2) {
    return { score: 1, label: "Débil", color: "bg-red-500", text: "text-red-400" };
  }
  if (points === 3 || points === 4) {
    return { score: 2, label: "Media", color: "bg-amber-500", text: "text-amber-400" };
  }
  return { score: 3, label: "Fuerte & Segura", color: "bg-emerald-500", text: "text-emerald-400" };
}

export default function ForgotPassword() {
  const [step, setStep] = useState("request"); // "request" | "verify" | "success"
  const [correo, setCorreo] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [errors, setErrors] = useState({});
  const [hasErrorShake, setHasErrorShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const [demoCode, setDemoCode] = useState(null);

  const navigate = useNavigate();

  // Temporizador para reenvío de código (60 segundos)
  useEffect(() => {
    let timer;
    if (step === "verify" && cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, cooldown]);

  const triggerShake = () => {
    setHasErrorShake(true);
    setTimeout(() => setHasErrorShake(false), 500);
  };

  // Paso 1: Solicitar código a correo
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    const result = validateForgotPasswordForm({ correo });
    if (!result.isValid) {
      setErrors(result.errors);
      triggerShake();
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await requestPasswordReset(correo);
      if (!res.success) {
        setLoading(false);
        setErrors({ correo: res.error });
        triggerShake();
        toast.error(res.error);
        return;
      }

      setLoading(false);
      toast.success("Código de verificación enviado exitosamente");
      if (res.data?.codigo_demo) {
        setDemoCode(res.data.codigo_demo);
      }
      setCooldown(60);
      setStep("verify");
    } catch (err) {
      setLoading(false);
      setErrors({ correo: "Ocurrió un error inesperado. Por favor intenta de nuevo." });
      triggerShake();
    }
  };

  // Paso 2: Verificar código y cambiar contraseña
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    const result = validateResetPasswordForm({
      codigo,
      nuevaContrasena,
      confirmarContrasena
    });

    if (!result.isValid) {
      setErrors(result.errors);
      triggerShake();
      toast.error("Por favor completa los campos correctamente.");
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await confirmPasswordReset(correo, codigo, nuevaContrasena);
      if (!res.success) {
        setLoading(false);
        setErrors({ codigo: res.error });
        triggerShake();
        toast.error(res.error);
        return;
      }

      setLoading(false);
      toast.success("¡Contraseña actualizada exitosamente!");
      setStep("success");
    } catch (err) {
      setLoading(false);
      setErrors({ general: "Error al actualizar la contraseña." });
      triggerShake();
    }
  };

  // Reenviar código
  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    try {
      const res = await requestPasswordReset(correo);
      if (res.success) {
        toast.success("Nuevo código enviado a tu correo.");
        setCooldown(60);
        if (res.data?.codigo_demo) {
          setDemoCode(res.data.codigo_demo);
        }
      } else {
        toast.error(res.error || "No se pudo reenviar el código.");
      }
    } catch (e) {
      toast.error("Error al comunicarse con el servidor.");
    } finally {
      setResending(false);
    }
  };

  const strength = getPasswordStrength(nuevaContrasena);

  // -------------------------------------------------------------
  // PASO 3: ÉXITO TOTAL (CONTRASEÑA RESTABLECIDA)
  // -------------------------------------------------------------
  if (step === "success") {
    return (
      <AuthCard>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center py-6"
        >
          {/* Badge animado de éxito */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <motion.div
              animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-full h-full rounded-2xl bg-gradient-to-br from-[#C9A24A]/25 to-emerald-500/20 border border-[#C9A24A]/50 flex items-center justify-center text-[#C9A24A] shadow-[0_0_35px_rgba(201,162,74,0.35)]"
            >
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </motion.div>
            <motion.span
              animate={{ scale: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              className="absolute -top-1 -right-1 flex h-4 w-4"
            >
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C9A24A] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-[#E0B85C]"></span>
            </motion.span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
            ¡Contraseña <span className="text-gold-gradient">Restablecida</span>!
          </h2>
          <p className="text-[#A0A0A0] text-xs sm:text-sm leading-relaxed mb-6 max-w-sm mx-auto">
            La contraseña para tu cuenta <span className="font-bold text-[#C9A24A]">{correo}</span> ha sido actualizada con éxito en el sistema.
          </p>

          <div className="p-4 rounded-xl bg-black/60 border border-white/10 text-left mb-8 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Protección y acceso garantizado</span>
            </div>
            <p className="text-[0.72rem] text-[#8E8E93] leading-relaxed">
              Tus nuevas credenciales ya se encuentran sincronizadas tanto en la plataforma web como en la aplicación móvil.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/login", { state: { emailPreload: correo } })}
            className="w-full py-3.5 px-6 rounded-xl bg-[#C9A24A] text-black font-black text-xs sm:text-sm tracking-wider hover:bg-[#E0B85C] transition-all shadow-[0_0_25px_rgba(201,162,74,0.35)] hover:shadow-[0_0_35px_rgba(201,162,74,0.6)] cursor-pointer"
          >
            INICIAR SESIÓN CON MI NUEVA CONTRASEÑA
          </button>
        </motion.div>
      </AuthCard>
    );
  }

  // -------------------------------------------------------------
  // PASO 2: VERIFICAR CÓDIGO Y DEFINIR NUEVA CONTRASEÑA
  // -------------------------------------------------------------
  if (step === "verify") {
    return (
      <AuthCard>
        <button
          type="button"
          onClick={() => {
            setStep("request");
            setCodigo("");
            setErrors({});
          }}
          className="inline-flex items-center gap-2 text-[#C9A24A] hover:text-[#E0B85C] mb-6 text-xs font-bold tracking-wider transition-colors cursor-pointer group"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>Cambiar correo electrónico</span>
        </button>

        <AuthHeader subtitle="Ingresa el código de 6 dígitos que enviamos a tu bandeja y define tu nueva contraseña" />

        {/* Tarjeta resumen del correo receptor */}
        <div className="mb-6 p-3.5 rounded-xl bg-[#181818] border border-[#C9A24A]/30 flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-[#C9A24A]/15 border border-[#C9A24A]/40 flex items-center justify-center text-[#C9A24A] shrink-0">
              <MailCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[0.68rem] uppercase font-bold text-[#8E8E93] tracking-wider">Código enviado a</p>
              <p className="text-xs sm:text-sm font-bold text-white truncate">{correo}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setStep("request");
              setCodigo("");
              setErrors({});
            }}
            className="text-[0.72rem] text-[#C9A24A] hover:underline font-semibold shrink-0 cursor-pointer"
          >
            Editar
          </button>
        </div>

        <motion.form
          animate={hasErrorShake ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
          onSubmit={handleResetSubmit}
          className="space-y-4"
          noValidate
        >
          {/* Campo de Código de 6 dígitos */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="codigo" className="block text-xs font-semibold text-[#CCCCCC] uppercase tracking-wider">
                Código de Verificación <span className="text-red-400">*</span>
              </label>
              <span className="text-[0.68rem] text-[#C9A24A] font-medium flex items-center gap-1">
                <Timer className="w-3 h-3" /> Válido 15 min
              </span>
            </div>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 pointer-events-none text-[#C9A24A]">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                id="codigo"
                name="codigo"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={codigo}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setCodigo(cleaned);
                  if (errors.codigo) setErrors((prev) => ({ ...prev, codigo: null }));
                }}
                className={`w-full py-3.5 pl-11 pr-4 bg-[#181818] border rounded-xl focus:outline-none text-center text-lg sm:text-xl font-mono tracking-[0.45em] sm:tracking-[0.6em] text-[#C9A24A] font-black placeholder:text-[#555] placeholder:tracking-normal transition-all duration-200 ${
                  errors.codigo
                    ? "border-red-500/80 focus:border-red-500 focus:ring-2 focus:ring-red-500/30"
                    : "border-white/10 hover:border-white/20 focus:border-[#C9A24A] focus:ring-2 focus:ring-[#C9A24A]/30"
                }`}
                placeholder="000000"
                autoComplete="one-time-code"
                autoFocus
              />
            </div>
            <FormFieldError error={errors.codigo} />
          </div>

          {/* Campo Nueva Contraseña */}
          <div className="space-y-1.5">
            <PasswordInput
              id="nuevaContrasena"
              name="nuevaContrasena"
              label="Nueva Contraseña"
              value={nuevaContrasena}
              onChange={(e) => {
                setNuevaContrasena(e.target.value);
                if (errors.nuevaContrasena) {
                  setErrors((prev) => ({ ...prev, nuevaContrasena: null }));
                }
              }}
              placeholder="Mínimo 8 caracteres"
              error={errors.nuevaContrasena}
              required
            />

            {/* Medidor de fortaleza de contraseña */}
            {nuevaContrasena && (
              <div className="pt-1 space-y-1.5">
                <div className="flex items-center justify-between text-[0.68rem]">
                  <span className="text-[#8E8E93]">Fortaleza de la contraseña:</span>
                  <span className={`font-bold ${strength.text}`}>{strength.label}</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 h-1.5 rounded-full overflow-hidden bg-neutral-800">
                  <div className={`h-full transition-all duration-300 ${strength.score >= 1 ? strength.color : "bg-neutral-800"}`} />
                  <div className={`h-full transition-all duration-300 ${strength.score >= 2 ? strength.color : "bg-neutral-800"}`} />
                  <div className={`h-full transition-all duration-300 ${strength.score >= 3 ? strength.color : "bg-neutral-800"}`} />
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1 text-[0.65rem] text-[#8E8E93]">
                  <div className={`flex items-center gap-1 ${nuevaContrasena.length >= 8 ? "text-emerald-400 font-semibold" : ""}`}>
                    <Check className="w-2.5 h-2.5" /> Mín. 8 caracteres
                  </div>
                  <div className={`flex items-center gap-1 ${/[A-Z]/.test(nuevaContrasena) ? "text-emerald-400 font-semibold" : ""}`}>
                    <Check className="w-2.5 h-2.5" /> 1 mayúscula
                  </div>
                  <div className={`flex items-center gap-1 ${/[a-z]/.test(nuevaContrasena) ? "text-emerald-400 font-semibold" : ""}`}>
                    <Check className="w-2.5 h-2.5" /> 1 minúscula
                  </div>
                  <div className={`flex items-center gap-1 ${/[0-9]/.test(nuevaContrasena) ? "text-emerald-400 font-semibold" : ""}`}>
                    <Check className="w-2.5 h-2.5" /> 1 número
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Campo Confirmar Contraseña */}
          <PasswordInput
            id="confirmarContrasena"
            name="confirmarContrasena"
            label="Confirmar Nueva Contraseña"
            value={confirmarContrasena}
            onChange={(e) => {
              setConfirmarContrasena(e.target.value);
              if (errors.confirmarContrasena) {
                setErrors((prev) => ({ ...prev, confirmarContrasena: null }));
              }
            }}
            placeholder="Repite tu nueva contraseña"
            error={errors.confirmarContrasena}
            required
          />

          {errors.general && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}

          {/* Sección de reenvío con temporizador */}
          <div className="pt-1 flex items-center justify-between text-xs text-[#8E8E93]">
            <span>¿No recibiste el correo?</span>
            {cooldown > 0 ? (
              <span className="font-medium text-[#C9A24A]">Reenviar en {cooldown}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-[#C9A24A] hover:underline font-bold inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className={`w-3 h-3 ${resending ? "animate-spin" : ""}`} />
                {resending ? "Enviando..." : "Reenviar código"}
              </button>
            )}
          </div>

          <div className="pt-2">
            <AuthButton loading={loading}>
              {loading ? "ACTUALIZANDO CONTRASEÑA..." : "RESTABLECER CONTRASEÑA"}
            </AuthButton>
          </div>
        </motion.form>
      </AuthCard>
    );
  }

  // -------------------------------------------------------------
  // PASO 1: SOLICITAR CÓDIGO (FORMULARIO DE CORREO)
  // -------------------------------------------------------------
  return (
    <AuthCard>
      <Link
        to="/login"
        className="inline-flex items-center gap-2 text-[#C9A24A] hover:text-[#E0B85C] mb-6 text-xs font-bold tracking-wider transition-colors group"
      >
        <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
        <span>Volver al inicio de sesión</span>
      </Link>

      <AuthHeader subtitle="Ingresa el correo electrónico de tu cuenta para recibir un código de verificación de 6 dígitos" />

      <motion.form
        animate={hasErrorShake ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
        transition={{ duration: 0.4 }}
        onSubmit={handleRequestSubmit}
        className="space-y-4"
        noValidate
      >
        <FormInput
          id="correo"
          name="correo"
          label="Correo Electrónico Registrado"
          type="email"
          value={correo}
          onChange={(e) => {
            setCorreo(e.target.value);
            if (errors.correo) setErrors((prev) => ({ ...prev, correo: null }));
          }}
          placeholder="ejemplo@correo.com"
          error={errors.correo}
          required
          autoFocus
        />

        <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 text-left space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#C9A24A]">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Envío seguro e instantáneo</span>
          </div>
          <p className="text-[0.72rem] text-[#8E8E93] leading-relaxed">
            Te enviaremos un código de seguridad de 6 dígitos con vigencia de 15 minutos directamente a tu bandeja de entrada o spam.
          </p>
        </div>

        <div className="pt-2">
          <AuthButton loading={loading}>
            {loading ? "ENVIANDO CÓDIGO..." : "ENVIAR CÓDIGO DE VERIFICACIÓN"}
          </AuthButton>
        </div>
      </motion.form>
    </AuthCard>
  );
}