import { Lock, Eye, EyeOff } from "lucide-react";
import { usePasswordVisibility } from "../hooks/usePasswordVisibility";
import FormFieldError from "../../admin/shared/components/FormFieldError";

export default function PasswordInput({
  id,
  name,
  label,
  value,
  onChange,
  placeholder = "••••••••",
  error,
  required = false,
}) {
  const { visible, toggle } = usePasswordVisibility();

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold text-[#CCCCCC] uppercase tracking-wider">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative flex items-center">
        <div className="absolute left-3.5 pointer-events-none text-[#8E8E93]">
          <Lock className="w-4 h-4" />
        </div>
        <input
          id={id}
          name={name ?? id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          className={`w-full py-3 pl-10 pr-11 bg-[#181818] border rounded-xl focus:outline-none text-white text-xs sm:text-sm placeholder:text-[#555555] transition-all duration-200 ${
            error
              ? "border-red-500/80 focus:border-red-500 focus:ring-2 focus:ring-red-500/30"
              : "border-white/10 hover:border-white/20 focus:border-[#C9A24A] focus:ring-2 focus:ring-[#C9A24A]/30"
          }`}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute right-3.5 p-1 text-[#8E8E93] hover:text-[#C9A24A] transition-colors cursor-pointer"
          aria-label={visible ? "Ocultar contraseña" : "Ver contraseña"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      <FormFieldError error={error} />
    </div>
  );
}