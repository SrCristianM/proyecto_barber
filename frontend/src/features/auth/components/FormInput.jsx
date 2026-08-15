export default function FormInput({ id, name, label, type = "text", value, onChange, placeholder }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-foreground mb-2">
        {label}
      </label>
      <input
        id={id}
        name={name ?? id}
        type={type}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
        placeholder={placeholder}
        required
      />
    </div>
  );
}