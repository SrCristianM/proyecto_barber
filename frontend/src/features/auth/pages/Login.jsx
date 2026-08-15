import { useState } from "react";
import { Link, useNavigate } from "react-router";
import AuthCard from "../components/AuthCard";
import AuthHeader from "../components/AuthHeader";
import FormInput from "../components/FormInput";
import PasswordInput from "../components/PasswordInput";
import AuthButton from "../components/AuthButton";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin();
    navigate("/dashboard");
  };

  return (
    <AuthCard>
      <AuthHeader subtitle="Inicia sesión en tu cuenta" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          id="email"
          label="Correo Electrónico"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="correo@ejemplo.com"
        />

        <PasswordInput
          id="password"
          label="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-primary border-input rounded focus:ring-primary"
            />
            <span className="text-sm text-foreground">Recordarme</span>
          </label>
          <Link to="/forgot-password" className="text-sm text-primary hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <AuthButton>Iniciar Sesión</AuthButton>
      </form>

      <div className="mt-6 text-center">
        <span className="text-muted-foreground">¿No tienes cuenta? </span>
        <Link to="/register" className="text-primary hover:underline font-medium">
          Regístrate aquí
        </Link>
      </div>
    </AuthCard>
  );
}