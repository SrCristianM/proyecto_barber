import { useState } from "react";
import { Link, useNavigate } from "react-router";
import AuthCard from "../components/AuthCard";
import AuthHeader from "../components/AuthHeader";
import FormInput from "../components/FormInput";
import PasswordInput from "../components/PasswordInput";
import AuthButton from "../components/AuthButton";
import { validateLoginForm } from "../validations/authValidation";

export default function Login({ onLogin }) {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = validateLoginForm({ correo, contrasena });
    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    onLogin();
    navigate("/dashboard");
  };

  return (
    <AuthCard>
      <AuthHeader subtitle="Inicia sesión en tu cuenta" />

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-primary border-input rounded focus:ring-primary cursor-pointer"
            />
            <span className="text-sm text-foreground">Recordarme</span>
          </label>
          <Link to="/forgot-password" className="text-sm text-primary hover:underline font-medium">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <AuthButton>Iniciar Sesión</AuthButton>
      </form>

      <div className="mt-6 text-center">
        <span className="text-muted-foreground text-sm">¿No tienes cuenta? </span>
        <Link to="/register" className="text-primary hover:underline font-medium text-sm">
          Regístrate aquí
        </Link>
      </div>
    </AuthCard>
  );
}