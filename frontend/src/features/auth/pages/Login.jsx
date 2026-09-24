import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { motion } from "motion/react";
import AuthCard from "../components/AuthCard";
import AuthHeader from "../components/AuthHeader";
import FormInput from "../components/FormInput";
import PasswordInput from "../components/PasswordInput";
import AuthButton from "../components/AuthButton";
import { validateLoginForm } from "../validations/authValidation";
import { loginWithCredentials, setCurrentUser, getStoredUsers, DEMO_CREDENTIALS } from "../services/authService";

export default function Login({ onLogin }) {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [hasErrorShake, setHasErrorShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeRoleName, setActiveRoleName] = useState(null);
  const navigate = useNavigate();

  const handleSelectDemo = async (demo, directLogin = false) => {
    setCorreo(demo.email);
    setContrasena(demo.password);
    setActiveRoleName(demo.role);
    setErrors({});

    if (!directLogin) {
      toast.info(`Credenciales de ${demo.role} cargadas: ${demo.email}`);
      return;
    }

    setLoading(true);
    const authResult = await loginWithCredentials(demo.email, demo.password);
    setLoading(false);

    if (authResult.success) {
      toast.success(`¡Bienvenido, ${authResult.user.nombre} (${demo.role})!`);
      if (onLogin) onLogin(authResult.user);
      navigate(demo.path, { replace: true });
    } else {
      toast.error(authResult.error || "No se pudo iniciar sesión automática.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 1. Validación de formato de campos
    const result = validateLoginForm({ correo, contrasena });
    if (!result.isValid) {
      setErrors(result.errors);
      setHasErrorShake(true);
      setTimeout(() => setHasErrorShake(false), 500);
      return;
    }
    
    setErrors({});
    setLoading(true);

    // 2. Validación estricta contra base de datos de usuarios
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
      if (Number(authResult.user.id_rol) === 4) {
        targetPath = "/portal";
      } else if (Number(authResult.user.id_rol) === 3) {
        targetPath = "/barbero";
      }
      navigate(targetPath, { replace: true });
    }, 400);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const authResult = await loginWithCredentials("cristianmazo957@gmail.com", "Admin123*");
    setLoading(false);
    if (authResult.success) {
      toast.success(`¡Bienvenido, ${authResult.user.nombre}!`);
      if (onLogin) onLogin(authResult.user);
      navigate("/dashboard", { replace: true });
    } else {
      const users = getStoredUsers();
      const adminUser = users.find((u) => u.correo.toLowerCase() === "cristianmazo957@gmail.com") || users[0];
      setCurrentUser(adminUser);
      toast.success(`¡Bienvenido, ${adminUser.nombre}!`);
      if (onLogin) onLogin(adminUser);
      navigate("/dashboard", { replace: true });
    }
  };

  return (
    <AuthCard>
      <AuthHeader subtitle="Ingresa tus credenciales para acceder a tu cuenta" />

      {/* Selector de Acceso Rápido por Rol (Admin, Recepcionista, Barbero, Cliente) */}
      <div className="mb-6 p-3 rounded-2xl bg-white/[0.03] border border-white/10 shadow-inner">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[0.7rem] font-bold text-[#E8C466] uppercase tracking-wider flex items-center gap-1.5">
            <span>✨</span> Cuentas de Acceso por Rol
          </span>
          <span className="text-[0.62rem] text-[#8E8E93] bg-white/5 px-2 py-0.5 rounded-full">
            Web & Móvil
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_CREDENTIALS.map((demo) => {
            const isSelected = activeRoleName === demo.role || correo === demo.email;
            return (
              <button
                key={demo.role}
                type="button"
                onClick={() => handleSelectDemo(demo, false)}
                className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer group relative ${
                  isSelected
                    ? "bg-[#C9A24A]/15 border-[#C9A24A] shadow-md shadow-[#C9A24A]/10"
                    : "bg-black/40 hover:bg-[#C9A24A]/10 border-white/5 hover:border-[#C9A24A]/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white group-hover:text-[#E8C466] transition-colors flex items-center gap-1">
                    {demo.role === "Administrador" && "👑"}
                    {demo.role === "Recepcionista" && "📋"}
                    {demo.role === "Barbero" && "✂️"}
                    {demo.role === "Cliente" && "👤"}
                    {demo.role}
                  </span>
                  <span className="text-[0.58rem] px-1.5 py-0.5 rounded bg-white/5 text-[#A0A0A0] font-semibold">
                    Rol {demo.id_rol}
                  </span>
                </div>
                <div className="text-[0.65rem] text-[#8E8E93] truncate mt-1">
                  {demo.email}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Google Quick Access */}
      <motion.button
        type="button"
        onClick={handleGoogleLogin}
        whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#C9A24A]/50 text-white text-xs font-bold tracking-wider flex items-center justify-center gap-3 transition-all mb-6 cursor-pointer"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
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
        <span>CONTINUAR CON GOOGLE</span>
      </motion.button>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-[1px] bg-white/10" />
        <span className="text-[0.68rem] text-[#666666] font-bold uppercase tracking-widest">o con tu correo</span>
        <div className="flex-1 h-[1px] bg-white/10" />
      </div>

      <motion.form
        onSubmit={handleSubmit}
        animate={hasErrorShake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="space-y-4"
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

        {/* Remember me & Forgot password */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded bg-[#181818] border-white/20 text-[#C9A24A] focus:ring-[#C9A24A] cursor-pointer accent-[#C9A24A]"
            />
            <span className="text-xs text-[#A0A0A0] hover:text-white transition-colors">Recordarme</span>
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

      {/* Register switch link */}
      <div className="mt-8 pt-6 border-t border-white/10 text-center">
        <span className="text-[#8E8E93] text-xs">¿Aún no tienes una cuenta? </span>
        <Link
          to="/register"
          className="text-[#C9A24A] hover:text-[#E0B85C] hover:underline font-bold text-xs ml-1 transition-colors"
        >
          Regístrate aquí
        </Link>
      </div>
    </AuthCard>
  );
}