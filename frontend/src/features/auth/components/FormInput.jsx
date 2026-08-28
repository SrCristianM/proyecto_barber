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
  required = false
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-foreground mb-1.5">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <input
        id={id}
        name={name ?? id}
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full px-3.5 py-2.5 bg-input-background border rounded-xl focus:outline-none text-foreground text-sm transition-all ${
          error
            ? "border-destructive focus:ring-2 focus:ring-destructive/30"
            : "border-input focus:ring-2 focus:ring-primary"
        }`}
        placeholder={placeholder}
      />
      <FormFieldError error={error} />
    </div>
  );
}