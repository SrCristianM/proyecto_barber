import { AlertCircle } from "lucide-react";

export default function FormFieldError({ error }) {
  if (!error) return null;

  return (
    <p className="flex items-center gap-1.5 text-xs text-destructive mt-1.5 font-medium animate-in fade-in-50 duration-200">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      <span>{error}</span>
    </p>
  );
}
