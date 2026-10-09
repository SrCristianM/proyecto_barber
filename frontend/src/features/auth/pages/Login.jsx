import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  Plus,
  X,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Lock,
  Mail,
  Loader2,
  KeyRound,
  Trash2,
  MinusCircle,
  Laptop
} from "lucide-react";
import AuthCard from "../components/AuthCard";
import AuthHeader from "../components/AuthHeader";
import FormInput from "../components/FormInput";
import PasswordInput from "../components/PasswordInput";
import AuthButton from "../components/AuthButton";
import { validateLoginForm } from "../validations/authValidation";
import {
  loginWithCredentials,
  loginWithGoogle,
  getDeviceGoogleAccounts,
  removeDeviceGoogleAccount
} from "../services/authService";

export default function Login({ onLogin }) {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [hasErrorShake, setHasErrorShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [isAddingNewGoogleAccount, setIsAddingNewGoogleAccount] = useState(false);
  const [isRemovingGoogleAccount, setIsRemovingGoogleAccount] = useState(false);
  const [newGoogleEmail, setNewGoogleEmail] = useState("");

  // Cuentas personales de Google guardadas exclusivamente en este dispositivo
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  const navigate = useNavigate();

  // Carga las cuentas guardadas en este dispositivo al montar y al abrir el modal
  const fetchAccounts = () => {
    setLoadingAccounts(true);
    try {
      const deviceAccounts = getDeviceGoogleAccounts();
      setAccounts(deviceAccounts || []);
    } catch (e) {
      console.error("Error al cargar cuentas del dispositivo:", e);
    } finally {
      setLoadingAccounts(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleOpenGoogleModal = () => {
    setIsAddingNewGoogleAccount(false);
    setIsRemovingGoogleAccount(false);
    setNewGoogleEmail("");
    setShowGoogleModal(true);
    fetchAccounts();
  };

  const handleRemoveAccount = (e, email) => {
    if (e) e.stopPropagation();
    const updated = removeDeviceGoogleAccount(email);
    setAccounts(updated);
    toast.success("Cuenta retirada de este dispositivo.");
    if (updated.length === 0) {
      setIsRemovingGoogleAccount(false);
      setIsAddingNewGoogleAccount(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validación de campos
    const result = validateLoginForm({ correo, contrasena });
    if (!result.isValid) {
      setErrors(result.errors);
      setHasErrorShake(true);
      setTimeout(() => setHasErrorShake(false), 500);
      return;
    }

    setErrors({});
    setLoading(true);

    setTimeout(async () => {
      const authResult = await loginWithCredentials(correo, contrasena);

      if (!authResult.success) {
        setLoading(false);
        if (authResult.field === "correo") {
          setErrors({ correo: authResult.error });
        } else if (authResult.field === "contrasena") {
          setErrors({ contrasena: authResult.error });
        } else {
          toast.error(authResult.error);
        }
        setHasErrorShake(true);
        setTimeout(() => setHasErrorShake(false), 500);
        return;
      }

      toast.success(`¡Bienvenido, ${authResult.user.nombre}!`);
      if (onLogin) onLogin(authResult.user);

      let targetPath = "/dashboard";
      if (Number(authResult.user.id_rol) === 4 || Number(authResult.user.id_rol) === 2) {
        targetPath = "/portal";
      } else if (Number(authResult.user.id_rol) === 3) {
        targetPath = "/barbero";
      }
      navigate(targetPath, { replace: true });
    }, 400);
  };

  const handleSelectGoogleAccount = async (account) => {
    setGoogleLoading(true);
    setLoading(true);

    try {
      const email = account.email || account.correo;
      const result = await loginWithGoogle({
        email,
        name: account.nombre || account.name,
        avatarUrl: account.imagen_url || null,
      });

      setLoading(false);
      setGoogleLoading(false);

      if (!result.success) {
        toast.error(result.error || "No existe ninguna cuenta registrada con este correo de Google.");
        return;
      }

      setShowGoogleModal(false);
      setNewGoogleEmail("");
      setIsAddingNewGoogleAccount(false);

      const user = result.user;
      if (onLogin) onLogin(user);

      if (Number(user.id_rol) === 4) {
        toast.success(`¡Bienvenido de vuelta, ${user.nombre}!`);
        navigate("/portal", { replace: true });
      } else if (Number(user.id_rol) === 3) {
        toast.success(`¡Bienvenido, ${user.nombre}! (Panel de Barbero)`);
        navigate("/barbero", { replace: true });
      } else if (Number(user.id_rol) === 1) {
        toast.success(`¡Bienvenido, ${user.nombre}! (Administrador)`);
        navigate("/dashboard", { replace: true });
      } else {
        toast.success(`¡Bienvenido, ${user.nombre}!`);
        navigate("/portal", { replace: true });
      }
    } catch (err) {
      setLoading(false);
      setGoogleLoading(false);
      toast.error("Ocurrió un error al procesar el acceso con Google.");
    }
  };

  const handleAddNewGoogleAccount = (e) => {
    e.preventDefault();
    if (!newGoogleEmail.trim()) {
      toast.error("Por favor ingresa un correo de Google.");
      return;
    }
    const cleanEmail = newGoogleEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      toast.error("Por favor ingresa un formato de correo electrónico válido.");
      return;
    }

    handleSelectGoogleAccount({
      email: cleanEmail,
      nombre: cleanEmail.split("@")[0],
      imagen_url: null,
    });
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const getRoleBadgeStyle = (id_rol) => {
    const rolNum = Number(id_rol);
    if (rolNum === 1) return "bg-[#C9A24A]/20 text-[#FFE082] border-[#C9A24A]/40";
    if (rolNum === 2) return "bg-blue-500/20 text-blue-300 border-blue-500/40";
    if (rolNum === 3) return "bg-purple-500/20 text-purple-300 border-purple-500/40";
    return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
  };

  return (
    <>
      <AuthCard>
        {/* Encabezado con logo y micro-animación continua */}
        <div className="relative z-10">
          <AuthHeader subtitle="Ingresa tus credenciales para acceder a tu cuenta" />
        </div>

        {/* BOTÓN GOOGLE CON MICRO-ANIMACIÓN DE AURA Y SELECTOR DE CUENTAS */}
        <div className="relative z-10 mb-6">
          <motion.button
            type="button"
            onClick={handleOpenGoogleModal}
            whileHover={{ scale: 1.015, boxShadow: "0 0 28px rgba(201, 162, 74, 0.3)" }}
            whileTap={{ scale: 0.985 }}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-white/[0.08] via-white/[0.04] to-white/[0.08] border border-white/15 hover:border-[#C9A24A]/60 text-white text-xs font-black tracking-widest flex items-center justify-center gap-3 transition-all cursor-pointer relative overflow-hidden group shadow-lg"
          >
            {/* Brillo continuo que recorre el botón suavemente */}
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", repeatDelay: 1.5 }}
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12 pointer-events-none"
            />

            <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.32 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.68 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span className="group-hover:text-[#E8C466] transition-colors">CONTINUAR CON GOOGLE</span>
          </motion.button>
        </div>

        {/* DIVISOR CON HAZ DE LUZ DORADO EN MOVIMIENTO */}
        <div className="relative flex items-center gap-3 mb-6 z-10">
          <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent relative overflow-hidden">
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "linear" }}
              className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-[#C9A24A]/70 to-transparent"
            />
          </div>
          <span className="text-[0.68rem] text-[#8E8E93] font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#C9A24A]" />
            o con tu correo
          </span>
          <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent relative overflow-hidden">
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "linear", delay: 1.75 }}
              className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-[#C9A24A]/70 to-transparent"
            />
          </div>
        </div>

        {/* FORMULARIO DE ACCESO CON ANIMACIÓN DE ENTRADA Y AGITACIÓN EN ERROR */}
        <motion.form
          onSubmit={handleSubmit}
          animate={hasErrorShake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="space-y-4 relative z-10"
          noValidate
        >
          <FormInput
            id="correo"
            name="correo"
            label="Correo Electrónico"
            type="email"
            value={correo}
            onChange={(e) => {
              setCorreo(e.target.value);
              if (errors.correo) setErrors((prev) => ({ ...prev, correo: null }));
            }}
            placeholder="correo@ejemplo.com"
            error={errors.correo}
            required
          />

          <PasswordInput
            id="contrasena"
            name="contrasena"
            label="Contraseña"
            value={contrasena}
            onChange={(e) => {
              setContrasena(e.target.value);
              if (errors.contrasena) setErrors((prev) => ({ ...prev, contrasena: null }));
            }}
            error={errors.contrasena}
            required
          />

          {/* Recordarme y Olvidé contraseña */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded bg-[#181818] border-white/20 text-[#C9A24A] focus:ring-[#C9A24A] cursor-pointer accent-[#C9A24A]"
              />
              <span className="text-xs text-[#A0A0A0] group-hover:text-white transition-colors">Recordarme</span>
            </label>
            
            <Link
              to="/forgot-password"
              className="text-xs text-[#C9A24A] hover:text-[#E0B85C] hover:underline font-semibold transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <div className="pt-2">
            <AuthButton loading={loading}>
              {loading ? "INICIANDO SESIÓN..." : "INICIAR SESIÓN"}
            </AuthButton>
          </div>
        </motion.form>

        {/* Enlace para nuevo registro */}
        <div className="mt-8 pt-6 border-t border-white/10 text-center relative z-10">
          <span className="text-[#8E8E93] text-xs">¿Aún no tienes una cuenta? </span>
          <Link
            to="/register"
            className="text-[#C9A24A] hover:text-[#E0B85C] hover:underline font-bold text-xs ml-1 transition-colors"
          >
            Regístrate aquí
          </Link>
        </div>
      </AuthCard>

      {/* =================================================================== */}
      {/* =================================================================== */}
      {/* 2. SELECTOR DE CUENTAS DE GOOGLE (PESTAÑA OFICIAL DE GOOGLE OAUTH) */}
      {/* =================================================================== */}
      <AnimatePresence>
        {showGoogleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-2xl bg-[#131314] border border-[#303134] rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden text-[#e8eaed] relative flex flex-col"
              style={{ fontFamily: "'Google Sans', Roboto, -apple-system, sans-serif" }}
            >
              {/* Barra superior: [G] Acceder con Google + Cerrar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#303134]">
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.32 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.68 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-[#e8eaed]">Acceder con Google</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="p-1 rounded-full text-[#9aa0a6] hover:text-[#e8eaed] hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Barra de progreso Google cuando carga */}
              {googleLoading && (
                <div className="h-1 w-full bg-[#1e1f20] overflow-hidden">
                  <motion.div
                    className="h-full bg-[#8ab4f8]"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    style={{ width: "40%" }}
                  />
                </div>
              )}

              {/* Contenido en 2 columnas estilo oficial Google OAuth */}
              <div className="p-7 sm:p-9 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                {/* Columna Izquierda: Logo + Elige una cuenta + Destino */}
                <div className="md:col-span-5 flex flex-col justify-start">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-2.5 shadow-md">
                    <img
                      src="/logo.png"
                      alt="Tu Turno Barber"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentElement.innerHTML = '<span class="text-black font-black text-sm">TTB</span>';
                      }}
                    />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-normal text-[#e8eaed] mt-5 leading-tight">
                    {accounts.length > 0 && !isAddingNewGoogleAccount
                      ? isRemovingGoogleAccount
                        ? "Quitar una cuenta"
                        : "Elige una cuenta"
                      : "Acceder"}
                  </h2>
                  <p className="text-sm text-[#8ab4f8] mt-2 font-normal">
                    Ir a Tu Turno Barber
                  </p>
                </div>

                {/* Columna Derecha: Cuentas directas o formulario */}
                <div className="md:col-span-7 flex flex-col">
                  {accounts.length > 0 && !isAddingNewGoogleAccount ? (
                    <>
                      {/* Lista de Cuentas estilo Google */}
                      <div className="divide-y divide-[#303134] border-t border-b border-[#303134]">
                        {accounts.map((acc) => {
                          const isBarberGold = (acc.email || "").toLowerCase().includes("barbergoldenapp");
                          return (
                            <div
                              key={acc.email}
                              className="w-full py-3.5 px-2 flex items-center justify-between text-left hover:bg-white/[0.04] transition-colors group"
                            >
                              <button
                                type="button"
                                disabled={googleLoading || isRemovingGoogleAccount}
                                onClick={() => !isRemovingGoogleAccount && handleSelectGoogleAccount(acc)}
                                className="flex items-center gap-3.5 min-w-0 flex-1 text-left cursor-pointer disabled:cursor-default"
                              >
                                {/* Avatar */}
                                {isBarberGold ? (
                                  <div className="w-8 h-8 rounded-full bg-[#7b1fa2] text-white flex items-center justify-center text-sm font-medium shrink-0">
                                    b
                                  </div>
                                ) : acc.imagen_url ? (
                                  <img
                                    src={acc.imagen_url}
                                    alt={acc.nombre}
                                    className="w-8 h-8 rounded-full object-cover shrink-0"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-black border border-white/20 text-white flex items-center justify-center overflow-hidden shrink-0">
                                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white/90">
                                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                    </svg>
                                  </div>
                                )}

                                <div className="min-w-0">
                                  <div className="text-sm font-medium text-[#e8eaed] group-hover:text-white transition-colors truncate">
                                    {acc.nombre}
                                  </div>
                                  <div className="text-xs text-[#9aa0a6] truncate">
                                    {acc.email}
                                  </div>
                                </div>
                              </button>

                              {isRemovingGoogleAccount && (
                                <button
                                  type="button"
                                  onClick={(e) => handleRemoveAccount(e, acc.email)}
                                  title="Quitar esta cuenta de este dispositivo"
                                  className="p-1.5 rounded-full hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors ml-2 cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          );
                        })}

                        {!isRemovingGoogleAccount ? (
                          <>
                            {/* Fila: Usar otra cuenta */}
                            <button
                              type="button"
                              disabled={googleLoading}
                              onClick={() => setIsAddingNewGoogleAccount(true)}
                              className="w-full py-3.5 px-2 flex items-center gap-3.5 text-left hover:bg-white/[0.04] transition-colors cursor-pointer group"
                            >
                              <div className="w-8 h-8 rounded-full border border-[#5f6368] flex items-center justify-center text-[#9aa0a6] group-hover:text-[#e8eaed] group-hover:border-[#8ab4f8] transition-colors shrink-0">
                                <User className="w-4 h-4" />
                              </div>
                              <span className="text-sm font-medium text-[#e8eaed] group-hover:text-white transition-colors">
                                Usar otra cuenta
                              </span>
                            </button>

                            {/* Fila: Quitar una cuenta */}
                            <button
                              type="button"
                              disabled={googleLoading}
                              onClick={() => setIsRemovingGoogleAccount(true)}
                              className="w-full py-3 px-2 flex items-center gap-3.5 text-left hover:bg-white/[0.04] transition-colors cursor-pointer group"
                            >
                              <div className="w-8 h-8 rounded-full border border-[#5f6368] flex items-center justify-center text-[#9aa0a6] group-hover:text-[#e8eaed] transition-colors shrink-0">
                                <MinusCircle className="w-4 h-4" />
                              </div>
                              <span className="text-sm font-medium text-[#9aa0a6] group-hover:text-[#e8eaed] transition-colors">
                                Quitar una cuenta
                              </span>
                            </button>
                          </>
                        ) : (
                          <div className="py-3 px-2 flex items-center justify-between">
                            <span className="text-xs text-[#9aa0a6]">
                              Pulsa el icono de eliminar en la cuenta que deseas quitar.
                            </span>
                            <button
                              type="button"
                              onClick={() => setIsRemovingGoogleAccount(false)}
                              className="px-4 py-1.5 text-xs font-medium text-[#8ab4f8] hover:bg-[#8ab4f8]/10 rounded-full transition-colors cursor-pointer"
                            >
                              Listo
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Footer legal de Google */}
                      <p className="text-xs text-[#9aa0a6] mt-6 leading-relaxed">
                        Antes de usar Tu Turno Barber, revisa su{" "}
                        <span className="text-[#8ab4f8] hover:underline cursor-pointer">
                          Política de Privacidad
                        </span>{" "}
                        y{" "}
                        <span className="text-[#8ab4f8] hover:underline cursor-pointer">
                          Condiciones del Servicio
                        </span>
                        .
                      </p>
                    </>
                  ) : (
                    /* Formulario para ingresar otra cuenta de Google o si no hay cuentas en el dispositivo */
                    <form onSubmit={handleAddNewGoogleAccount} className="space-y-5">
                      <div className="space-y-1">
                        <label className="block text-xs text-[#9aa0a6] font-medium">
                          Correo electrónico o teléfono
                        </label>
                        <input
                          type="email"
                          value={newGoogleEmail}
                          onChange={(e) => setNewGoogleEmail(e.target.value)}
                          placeholder="ejemplo@gmail.com"
                          autoFocus
                          className="w-full px-3.5 py-3 text-sm rounded-lg bg-transparent border border-[#5f6368] text-[#e8eaed] placeholder-[#9aa0a6]/50 focus:outline-none focus:border-[#8ab4f8] focus:ring-1 focus:ring-[#8ab4f8] transition-all"
                          required
                        />
                      </div>

                      <div className="flex items-center justify-between pt-4">
                        {accounts.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingNewGoogleAccount(false);
                              setIsRemovingGoogleAccount(false);
                            }}
                            className="text-sm text-[#8ab4f8] hover:underline font-medium cursor-pointer"
                          >
                            Atrás
                          </button>
                        ) : (
                          <div />
                        )}
                        <button
                          type="submit"
                          disabled={googleLoading}
                          className="px-6 py-2.5 rounded-full bg-[#8ab4f8] text-[#001d35] font-medium text-sm hover:brightness-105 transition-all cursor-pointer flex items-center gap-2"
                        >
                          {googleLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Verificando...</span>
                            </>
                          ) : (
                            <span>Siguiente</span>
                          )}
                        </button>
                      </div>

                      <p className="text-xs text-[#9aa0a6] pt-3">
                        ¿No tienes una cuenta registrada en Tu Turno Barber?{" "}
                        <Link
                          to="/register"
                          onClick={() => setShowGoogleModal(false)}
                          className="text-[#8ab4f8] hover:underline font-medium"
                        >
                          Crear cuenta
                        </Link>
                      </p>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}


