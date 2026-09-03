import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { motion } from "motion/react";
import AuthCard from "../components/AuthCard";
import AuthHeader from "../components/AuthHeader";
import FormInput from "../components/FormInput";
import PasswordInput from "../components/PasswordInput";
import AuthButton from "../components/AuthButton";
import { validateRegisterForm } from "../validations/authValidation";
import { registerUser } from "../services/authService";

export default function Register() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    correo: "",
    contrasena: "",
    confirmarContrasena: "",
  });
  const [errors, setErrors] = useState({});
  const [hasErrorShake, setHasErrorShake] = useState(false);
  const [loading, setLoading] = useState(false);
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
      setHasErrorShake(true);
      setTimeout(() => setHasErrorShake(false), 500);
      toast.error("Por favor corrige los campos indicados en el formulario.");
      return;
    }

    setErrors({});
    setLoading(true);

    setTimeout(() => {
      const regResult = registerUser(formData);
      if (!regResult.success) {
        setLoading(false);
        setErrors({ correo: regResult.error });
        setHasErrorShake(true);
        setTimeout(() => setHasErrorShake(false), 500);
        toast.error(regResult.error);
        return;
      }

      toast.success("¡Registro exitoso! Ya puedes iniciar sesión con tu cuenta.");
      navigate("/login");
    }, 500);
  };

  return (
    <AuthCard wide>
      <AuthHeader subtitle="Crea tu cuenta y empieza a disfrutar de beneficios exclusivos" />

      <motion.form
        onSubmit={handleSubmit}
        animate={hasErrorShake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="space-y-4"
        noValidate
      >
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

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

        <div className="pt-3">
          <AuthButton loading={loading}>
            {loading ? "CREANDO CUENTA..." : "REGISTRARME"}
          </AuthButton>
        </div>
      </motion.form>

      <div className="mt-8 pt-6 border-t border-white/10 text-center">
        <span className="text-[#8E8E93] text-xs">¿Ya tienes cuenta? </span>
        <Link to="/login" className="text-[#C9A24A] hover:text-[#E0B85C] hover:underline font-bold text-xs ml-1 transition-colors">
          Inicia sesión aquí
        </Link>
      </div>
    </AuthCard>
  );
}