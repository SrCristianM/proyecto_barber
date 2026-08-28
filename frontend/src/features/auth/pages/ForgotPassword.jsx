import { useState } from "react";
import { Link } from "react-router";
import { Scissors, ArrowLeft } from "lucide-react";
import AuthCard from "../components/AuthCard";
import FormInput from "../components/FormInput";
import AuthButton from "../components/AuthButton";
import { validateForgotPasswordForm } from "../validations/authValidation";

export default function ForgotPassword() {
  const [correo, setCorreo] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = validateForgotPasswordForm({ correo });
    if (!result.isValid) {
      setError(result.errors.correo);
      return;
    }
    setError(null);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <AuthCard>
        <div className="text-center">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Scissors className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Correo Enviado</h2>
            <p className="text-muted-foreground text-sm">
              Hemos enviado un enlace de recuperación a <span className="font-semibold text-foreground">{correo}</span>
            </p>
          </div>

          <p className="text-xs text-muted-foreground mb-6">
            Por favor revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
          </p>

          <Link
            to="/login"
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-semibold inline-block text-sm"
          >
            Volver al Inicio de Sesión
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <Link to="/login" className="inline-flex items-center gap-2 text-primary hover:underline mb-6 text-sm font-medium">
        <ArrowLeft className="h-4 w-4" />
        Volver al inicio
      </Link>

      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Scissors className="h-9 w-9 text-primary" />
          <span className="text-2xl font-bold text-foreground">Tu Turno Barber</span>
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-1">Recuperar Contraseña</h2>
        <p className="text-muted-foreground text-center text-xs">
          Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña
        </p>
      </div>

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

        <AuthButton>Enviar Enlace de Recuperación</AuthButton>
      </form>
    </AuthCard>
  );
}