/**
 * Icono Premium de Tijeras de Barbería Profesional (Barber Shears).
 * Diseñado específicamente con las proporciones auténticas de tijeras de barbero:
 * - Anillos ergonómicos para los dedos.
 * - Gancho apoyadedos curvado japonés (finger tang).
 * - Tornillo de ajuste de tensión central (pivot screw).
 * - Hojas afiladas con bisel cóncavo y puntas de precisión.
 */
export default function BarberScissorsIcon({
  className = "w-6 h-6",
  strokeWidth = 1.8,
  ...props
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Anillo de dedo izquierdo */}
      <circle cx="6" cy="18" r="2.8" />

      {/* Anillo de dedo derecho */}
      <circle cx="18" cy="18" r="2.8" />

      {/* Apoyadedos curvado ergonómico de barbero (Finger Tang / Rest) */}
      <path
        d="M20.2 16.6 C 21.8 15.6, 22.8 17.2, 22.2 19 C 21.6 20.4, 20.2 20.8, 19.4 19.8"
        strokeWidth={strokeWidth}
      />

      {/* Vástago izquierdo hacia pivote */}
      <path
        d="M8 15.8 C 9 14.5, 10.2 13, 11.2 11.5"
        strokeWidth={strokeWidth}
      />

      {/* Vástago derecho hacia pivote */}
      <path
        d="M16 15.8 C 15 14.5, 13.8 13, 12.8 11.5"
        strokeWidth={strokeWidth}
      />

      {/* Hoja 1: cruzando hacia arriba a la derecha con bisel cóncavo */}
      <path
        d="M11.2 11.5 L19.8 2.5 C 18.2 5.8, 16.5 8.6, 12.6 11.5 Z"
        fill="currentColor"
        fillOpacity="0.18"
        strokeWidth={strokeWidth}
      />

      {/* Hoja 2: cruzando hacia arriba a la izquierda con bisel cóncavo */}
      <path
        d="M12.8 11.5 L4.2 2.5 C 5.8 5.8, 7.5 8.6, 11.4 11.5 Z"
        fill="currentColor"
        fillOpacity="0.18"
        strokeWidth={strokeWidth}
      />

      {/* Tornillo central de ajuste de tensión (Pivot Screw) */}
      <circle
        cx="12"
        cy="11.5"
        r="1.3"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}
