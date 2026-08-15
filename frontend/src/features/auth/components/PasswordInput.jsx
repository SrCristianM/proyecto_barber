import { Eye, EyeOff } from "lucide-react";
import { usePasswordVisibility } from "../hooks/usePasswordVisibility";

export default function PasswordInput({ id, name, label, value, onChange, placeholder = "••••••••" }) {
  const { visible, toggle } = usePasswordVisibility();

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-foreground mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name ?? id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground pr-10"
          placeholder={placeholder}
          required
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}