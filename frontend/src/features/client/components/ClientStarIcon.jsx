/**
 * @file ClientStarIcon.jsx
 * Componente visual de estrella de diseño moderno, elegante y biselado (3D Faceted Luxury Star).
 * Diseñado exclusivamente para la interfaz del cliente de "Tu Turno Barber".
 * Reemplaza los destellos genéricos tipo "fairy sparkles" por un emblema de estrella refinado,
 * armónico con la estética dorada y masculina de la barbería.
 */

export default function ClientStarIcon({
  className = "w-5 h-5",
  variant = "faceted",
  ...props
}) {
  if (variant === "solid") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
        {...props}
      >
        <path d="M12 2.2L14.47 8.6L21.32 8.97L15.99 13.3L17.76 19.93L12 16.2L6.24 19.93L8.01 13.3L2.68 8.97L9.53 8.6Z" />
      </svg>
    );
  }

  // Variante Facetada 3D por defecto (Efecto metálico con relieves de luces y sombras)
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Facetas Iluminadas (Highlights) */}
      <path
        d="M 12 2.2 L 12 12 L 14.47 8.6 Z"
        fill="currentColor"
        fillOpacity="1"
      />
      <path
        d="M 21.32 8.97 L 12 12 L 15.99 13.3 Z"
        fill="currentColor"
        fillOpacity="1"
      />
      <path
        d="M 17.76 19.93 L 12 12 L 12 16.2 Z"
        fill="currentColor"
        fillOpacity="1"
      />
      <path
        d="M 6.24 19.93 L 12 12 L 8.01 13.3 Z"
        fill="currentColor"
        fillOpacity="1"
      />
      <path
        d="M 2.68 8.97 L 12 12 L 9.53 8.6 Z"
        fill="currentColor"
        fillOpacity="1"
      />

      {/* Facetas en Sombra (Bevel Shadows para profundidad tridimensional) */}
      <path
        d="M 14.47 8.6 L 12 12 L 21.32 8.97 Z"
        fill="currentColor"
        fillOpacity="0.52"
      />
      <path
        d="M 15.99 13.3 L 12 12 L 17.76 19.93 Z"
        fill="currentColor"
        fillOpacity="0.52"
      />
      <path
        d="M 12 16.2 L 12 12 L 6.24 19.93 Z"
        fill="currentColor"
        fillOpacity="0.52"
      />
      <path
        d="M 8.01 13.3 L 12 12 L 2.68 8.97 Z"
        fill="currentColor"
        fillOpacity="0.52"
      />
      <path
        d="M 9.53 8.6 L 12 12 L 12 2.2 Z"
        fill="currentColor"
        fillOpacity="0.52"
      />

      {/* Contorno nítido de precisión */}
      <path
        d="M 12 2.2 L 14.47 8.6 L 21.32 8.97 L 15.99 13.3 L 17.76 19.93 L 12 16.2 L 6.24 19.93 L 8.01 13.3 L 2.68 8.97 L 9.53 8.6 Z"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeLinejoin="round"
        fill="none"
        strokeOpacity="0.85"
      />
    </svg>
  );
}
