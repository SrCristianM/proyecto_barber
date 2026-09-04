import { forwardRef } from "react";
import FormFieldError from "./FormFieldError";

/**
 * Componente NumericInput que restringe la entrada estrictamente a caracteres numéricos.
 * - Bloquea letras, signos especiales y caracteres como 'e', 'E', '+', etc.
 * - Soporta enteros o decimales según 'allowDecimals' o 'allowDecimal'.
 * - Sanitiza texto pegado desde el portapapeles y respeta 'maxLength'.
 * - Renderiza opcionalmente label y FormFieldError si son provistos.
 */
const NumericInput = forwardRef(function NumericInput(
  {
    label,
    error,
    required = false,
    value,
    onChange,
    allowDecimals = false,
    allowDecimal = false,
    min = 0,
    max,
    step = 1,
    placeholder = "0",
    className = "",
    disabled = false,
    prefix = null,
    suffix = null,
    maxLength,
    onKeyDown,
    onPaste,
    ...props
  },
  ref
) {
  const decimalsAllowed = Boolean(allowDecimals || allowDecimal);
  const handleKeyDown = (e) => {
    // Permitir teclas de navegación y control
    const allowedNavigationKeys = [
      "Backspace",
      "Delete",
      "Tab",
      "Escape",
      "Enter",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End"
    ];

    if (allowedNavigationKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
      onKeyDown?.(e);
      return;
    }

    // Permitir un solo punto decimal si decimalsAllowed es true
    if (decimalsAllowed && (e.key === "." || e.key === ",")) {
      const currentVal = String(value || "");
      if (currentVal.includes(".") || currentVal.includes(",")) {
        e.preventDefault();
        return;
      }
      onKeyDown?.(e);
      return;
    }

    // Bloquear cualquier carácter que no sea un dígito 0-9
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      return;
    }

    onKeyDown?.(e);
  };

  const handleChange = (e) => {
    let inputVal = e.target.value;

    // Normalizar comas a puntos si se permiten decimales
    if (decimalsAllowed) {
      inputVal = inputVal.replace(",", ".");
    }

    // Filtrar caracteres no permitidos
    const regex = decimalsAllowed ? /[^0-9.]/g : /[^0-9]/g;
    let cleanVal = inputVal.replace(regex, "");

    // Asegurar un solo punto decimal
    if (decimalsAllowed && cleanVal.split(".").length > 2) {
      const parts = cleanVal.split(".");
      cleanVal = `${parts[0]}.${parts.slice(1).join("")}`;
    }

    // Respetar maxLength si aplica
    if (maxLength && cleanVal.length > maxLength) {
      cleanVal = cleanVal.slice(0, maxLength);
    }

    // Respetar límites numéricos si aplica
    if (cleanVal !== "") {
      const num = Number(cleanVal);
      if (!isNaN(num)) {
        if (max !== undefined && num > max) cleanVal = String(max);
      }
    }

    onChange?.(cleanVal);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const regex = decimalsAllowed ? /[^0-9.]/g : /[^0-9]/g;
    let cleanText = pastedText.replace(regex, "");
    if (maxLength && cleanText.length > maxLength) {
      cleanText = cleanText.slice(0, maxLength);
    }
    if (cleanText) {
      onChange?.(cleanText);
    }
    onPaste?.(e);
  };

  const inputElement = (
    <div className="relative flex items-center w-full">
      {prefix && (
        <span className="absolute left-3.5 text-xs sm:text-sm font-semibold text-muted-foreground pointer-events-none select-none">
          {prefix}
        </span>
      )}
      <input
        ref={ref}
        type="text"
        inputMode={decimalsAllowed ? "decimal" : "numeric"}
        value={value ?? ""}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        className={`w-full px-3.5 py-2.5 bg-input-background border rounded-xl focus:outline-none text-foreground text-xs sm:text-sm transition-all ${
          error
            ? "border-destructive focus:ring-2 focus:ring-destructive/30"
            : "border-input focus:ring-2 focus:ring-primary"
        } ${prefix ? "pl-8" : ""} ${suffix ? "pr-10" : ""} ${className}`}
        {...props}
      />
      {suffix && (
        <span className="absolute right-3.5 text-xs text-muted-foreground pointer-events-none select-none">
          {suffix}
        </span>
      )}
    </div>
  );

  if (label || error) {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {label} {required && <span className="text-destructive">*</span>}
          </label>
        )}
        {inputElement}
        <FormFieldError error={error} />
      </div>
    );
  }

  return inputElement;
});

export default NumericInput;
