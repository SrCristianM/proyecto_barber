import { Eye, EyeOff } from "lucide-react";
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
  required = false
}) {
  const { visible, toggle } = usePasswordVisibility();

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-foreground mb-1.5">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name ?? id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          className={`w-full px-3.5 py-2.5 bg-input-background border rounded-xl focus:outline-none text-foreground text-sm pr-10 transition-all ${
            error
              ? "border-destructive focus:ring-2 focus:ring-destructive/30"
              : "border-input focus:ring-2 focus:ring-primary"
          }`}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      <FormFieldError error={error} />
    </div>
  );
}