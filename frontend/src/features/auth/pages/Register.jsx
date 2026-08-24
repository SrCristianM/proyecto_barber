import { useState } from "react";
import { Link, useNavigate } from "react-router";
import AuthCard from "../components/AuthCard";
import AuthHeader from "../components/AuthHeader";
import FormInput from "../components/FormInput";
import PasswordInput from "../components/PasswordInput";
import AuthButton from "../components/AuthButton";

export default function Register() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    correo: "",
    contrasena: "",
    confirmarContrasena: ""
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.contrasena !== formData.confirmarContrasena) {
      alert("Las contraseñas no coinciden");
      return;
    }
    // Usuario se registra con id_rol = 4 (Cliente) y estado = 1 (Activo)
    navigate("/login");
  };

  return (
    <AuthCard wide>
      <AuthHeader subtitle="Crea tu cuenta nueva" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            id="nombre"
            name="nombre"
            label="Nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Juan"
            required
          />
          <FormInput
            id="apellido"
            name="apellido"
            label="Apellido"
            value={formData.apellido}
            onChange={handleChange}
            placeholder="Pérez"
            required
          />
        </div>

        <FormInput
          id="telefono"
          name="telefono"
          label="Teléfono"
          type="tel"
          value={formData.telefono}
          onChange={handleChange}
          placeholder="+57 300 123 4567"
        />

        <FormInput
          id="correo"
          name="correo"
          label="Correo Electrónico"
          type="email"
          value={formData.correo}
          onChange={handleChange}
          placeholder="correo@ejemplo.com"
          required
        />

        <PasswordInput
          id="contrasena"
          name="contrasena"
          label="Contraseña"
          value={formData.contrasena}
          onChange={handleChange}
          required
        />

        <PasswordInput
          id="confirmarContrasena"
          name="confirmarContrasena"
          label="Confirmar Contraseña"
          value={formData.confirmarContrasena}
          onChange={handleChange}
          required
        />

        <AuthButton>Registrarse</AuthButton>
      </form>

      <div className="mt-6 text-center">
        <span className="text-muted-foreground">¿Ya tienes cuenta? </span>
        <Link to="/login" className="text-primary hover:underline font-medium">
          Inicia sesión aquí
        </Link>
      </div>
    </AuthCard>
  );
}