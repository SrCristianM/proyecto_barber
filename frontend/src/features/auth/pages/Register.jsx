import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import AuthCard from "../components/AuthCard";
import AuthHeader from "../components/AuthHeader";
import FormInput from "../components/FormInput";
import PasswordInput from "../components/PasswordInput";
import AuthButton from "../components/AuthButton";
import { validateRegisterForm } from "../validations/authValidation";

export default function Register() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    correo: "",
    contrasena: "",
    confirmarContrasena: ""
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = validateRegisterForm(formData);
    if (!result.isValid) {
      setErrors(result.errors);
      toast.error("Por favor corrige los campos indicados en el formulario.");
      return;
    }

    setErrors({});
    toast.success("¡Registro exitoso! Ya puedes iniciar sesión con tu cuenta.");
    navigate("/login");
  };

  return (
    <AuthCard wide>
      <AuthHeader subtitle="Crea tu cuenta nueva" />

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            id="nombre"
            name="nombre"
            label="Nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Juan"
            error={errors.nombre}
            required
          />
          <FormInput
            id="apellido"
            name="apellido"
            label="Apellido"
            value={formData.apellido}
            onChange={handleChange}
            placeholder="Pérez"
            error={errors.apellido}
            required
          />
        </div>

        <FormInput
          id="correo"
          name="correo"
          label="Correo Electrónico"
          type="email"
          value={formData.correo}
          onChange={handleChange}
          placeholder="correo@ejemplo.com"
          error={errors.correo}
          required
        />

        <FormInput
          id="telefono"
          name="telefono"
          label="Teléfono"
          type="tel"
          value={formData.telefono}
          onChange={handleChange}
          placeholder="+57 300 123 4567"
          error={errors.telefono}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PasswordInput
            id="contrasena"
            name="contrasena"
            label="Contraseña"
            value={formData.contrasena}
            onChange={handleChange}
            error={errors.contrasena}
            placeholder="Mín. 8 car., Mayús, Núm"
            required
          />

          <PasswordInput
            id="confirmarContrasena"
            name="confirmarContrasena"
            label="Confirmar Contraseña"
            value={formData.confirmarContrasena}
            onChange={handleChange}
            error={errors.confirmarContrasena}
            required
          />
        </div>

        <AuthButton>Registrarse</AuthButton>
      </form>

      <div className="mt-6 text-center">
        <span className="text-muted-foreground text-sm">¿Ya tienes cuenta? </span>
        <Link to="/login" className="text-primary hover:underline font-medium text-sm">
          Inicia sesión aquí
        </Link>
      </div>
    </AuthCard>
  );
}