import { useState } from "react";
import { Link, useNavigate } from "react-router";
import AuthCard from "../components/AuthCard";
import AuthHeader from "../components/AuthHeader";
import FormInput from "../components/FormInput";
import PasswordInput from "../components/PasswordInput";
import AuthButton from "../components/AuthButton";

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }
    navigate("/login");
  };

  return (
    <AuthCard wide>
      <AuthHeader subtitle="Crea tu cuenta nueva" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput id="firstName" name="firstName" label="Nombre" value={formData.firstName} onChange={handleChange} placeholder="Juan" />
          <FormInput id="lastName" name="lastName" label="Apellido" value={formData.lastName} onChange={handleChange} placeholder="Pérez" />
        </div>

        <FormInput id="phone" name="phone" label="Teléfono" type="tel" value={formData.phone} onChange={handleChange} placeholder="+57 300 123 4567" />

        <FormInput id="email" name="email" label="Correo Electrónico" type="email" value={formData.email} onChange={handleChange} placeholder="correo@ejemplo.com" />

        <PasswordInput id="password" name="password" label="Contraseña" value={formData.password} onChange={handleChange} />

        <PasswordInput id="confirmPassword" name="confirmPassword" label="Confirmar Contraseña" value={formData.confirmPassword} onChange={handleChange} />

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