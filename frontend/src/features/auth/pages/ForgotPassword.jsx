import { useState } from "react";
import { Link } from "react-router";
import { Scissors, ArrowLeft } from "lucide-react";
import AuthCard from "../components/AuthCard";
import FormInput from "../components/FormInput";
import AuthButton from "../components/AuthButton";

export default function ForgotPassword() {
  const [correo, setCorreo] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
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
            <p className="text-muted-foreground">
              Hemos enviado un enlace de recuperación a <span className="font-medium text-foreground">{correo}</span>
            </p>
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            Por favor revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
          </p>

          <Link to="/login" className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium inline-block">
            Volver al Inicio de Sesión
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <Link to="/login" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
        <ArrowLeft className="h-4 w-4" />
        Volver al inicio
      </Link>

      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Scissors className="h-10 w-10 text-primary" />
          <span className="text-2xl font-bold text-foreground">Tu Turno Barber</span>
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Recuperar Contraseña</h2>
        <p className="text-muted-foreground text-center">
          Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          id="correo"
          name="correo"
          label="Correo Electrónico"
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          placeholder="correo@ejemplo.com"
          required
        />

        <AuthButton>Enviar Enlace de Recuperación</AuthButton>
      </form>
    </AuthCard>
  );
}