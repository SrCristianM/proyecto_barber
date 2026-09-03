import { useState } from "react";
import { Link } from "react-router";
import { Scissors, ArrowLeft, MailCheck, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import AuthCard from "../components/AuthCard";
import AuthHeader from "../components/AuthHeader";
import FormInput from "../components/FormInput";
import AuthButton from "../components/AuthButton";
import { validateForgotPasswordForm } from "../validations/authValidation";
import { findUserByEmail } from "../services/authService";

export default function ForgotPassword() {
  const [correo, setCorreo] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = validateForgotPasswordForm({ correo });
    if (!result.isValid) {
      setError(result.errors.correo);
      return;
    }

    const user = findUserByEmail(correo);
    if (!user) {
      setError("No existe ninguna cuenta registrada con este correo electrónico.");
      return;
    }

    setError(null);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 500);
  };

  if (submitted) {
    return (
      <AuthCard>
        <div className="text-center py-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-16 h-16 bg-[#C9A24A]/20 border border-[#C9A24A] rounded-full flex items-center justify-center mx-auto mb-6 text-[#C9A24A]"
          >
            <MailCheck className="h-8 w-8" />
          </motion.div>

          <h2 className="text-2xl font-black text-white mb-2">Correo Enviado</h2>
          <p className="text-[#A0A0A0] text-xs sm:text-sm leading-relaxed mb-6">
            Hemos enviado un enlace de recuperación a <span className="font-bold text-[#C9A24A]">{correo}</span>
          </p>

          <p className="text-[0.75rem] text-[#7A7A7A] mb-8 leading-relaxed">
            Revisa tu bandeja de entrada o carpeta de spam y sigue las instrucciones para crear tu nueva contraseña.
          </p>

          <Link
            to="/login"
            className="w-full py-3.5 px-6 rounded-xl bg-[#C9A24A] text-black font-extrabold text-xs tracking-wider inline-block hover:bg-[#E0B85C] transition-all shadow-[0_0_20px_rgba(201,162,74,0.3)]"
          >
            VOLVER AL INICIO DE SESIÓN
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <Link
        to="/login"
        className="inline-flex items-center gap-2 text-[#C9A24A] hover:text-[#E0B85C] hover:underline mb-6 text-xs font-bold tracking-wider transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Volver al inicio de sesión</span>
      </Link>

      <AuthHeader subtitle="Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña" />

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormInput
          id="correo"
          name="correo"
          label="Correo Electrónico"
          type="email"
          value={correo}
          onChange={(e) => {
            setCorreo(e.target.value);
            if (error) setError(null);
          }}
          placeholder="correo@ejemplo.com"
          error={error}
          required
        />

        <div className="pt-2">
          <AuthButton loading={loading}>
            {loading ? "ENVIANDO ENLACE..." : "ENVIAR ENLACE DE RECUPERACIÓN"}
          </AuthButton>
        </div>
      </form>
    </AuthCard>
  );
}