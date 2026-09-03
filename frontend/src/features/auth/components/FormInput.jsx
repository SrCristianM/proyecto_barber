import { Mail, User, Phone, Tag } from "lucide-react";
import FormFieldError from "../../admin/shared/components/FormFieldError";

export default function FormInput({
  id,
  name,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  required = false,
  icon,
}) {
  const getIcon = () => {
    if (icon) return icon;
    if (type === "email" || id === "correo") return <Mail className="w-4 h-4 text-[#8E8E93]" />;
    if (id === "nombre" || id === "apellido") return <User className="w-4 h-4 text-[#8E8E93]" />;
    if (type === "tel" || id === "telefono") return <Phone className="w-4 h-4 text-[#8E8E93]" />;
    return null;
  };

  const inputIcon = getIcon();

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold text-[#CCCCCC] uppercase tracking-wider">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative flex items-center">
        {inputIcon && (
          <div className="absolute left-3.5 pointer-events-none transition-colors">
            {inputIcon}
          </div>
        )}
        <input
          id={id}
          name={name ?? id}
          type={type}
          value={value}
          onChange={onChange}
          className={`w-full py-3 bg-[#181818] border rounded-xl focus:outline-none text-white text-xs sm:text-sm placeholder:text-[#555555] transition-all duration-200 ${
            inputIcon ? "pl-10 pr-4" : "px-4"
          } ${
            error
              ? "border-red-500/80 focus:border-red-500 focus:ring-2 focus:ring-red-500/30"
              : "border-white/10 hover:border-white/20 focus:border-[#C9A24A] focus:ring-2 focus:ring-[#C9A24A]/30"
          }`}
          placeholder={placeholder}
        />
      </div>
      <FormFieldError error={error} />
    </div>
  );
}