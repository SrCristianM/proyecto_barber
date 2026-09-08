import { useState, useEffect } from "react";

const FALLBACK_SERVICE_IMAGES = {
  Cortes: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&auto=format&fit=crop&q=80",
  Barba: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80",
  Paquetes: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop&q=80",
  Especiales: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&auto=format&fit=crop&q=80",
  default: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80"
};

const FALLBACK_PRODUCT_IMAGES = {
  Estilizado: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80",
  Cuidado: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&auto=format&fit=crop&q=80",
  Barba: "https://images.unsplash.com/photo-1621607512214-68297480165e?w=600&auto=format&fit=crop&q=80",
  Herramientas: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&auto=format&fit=crop&q=80",
  default: "https://images.unsplash.com/photo-1598452963314-b09f397a5c48?w=600&auto=format&fit=crop&q=80"
};

export default function ClientImage({
  src,
  alt = "Imagen de barbería",
  fallbackSrc,
  type = "service", // 'service' | 'product' | 'barber'
  category = "",
  className = "w-full h-full object-cover",
  ...props
}) {
  const getInitialSrc = () => {
    if (
      src &&
      typeof src === "string" &&
      src.trim() !== "" &&
      !src.includes("placeholder") &&
      !src.includes("photo-1608248597359-00f72365851d") &&
      !src.includes("photo-1517832606589-7629c3395909")
    ) {
      return src;
    }
    if (fallbackSrc) return fallbackSrc;
    if (type === "product") {
      return FALLBACK_PRODUCT_IMAGES[category] || FALLBACK_PRODUCT_IMAGES.default;
    }
    return FALLBACK_SERVICE_IMAGES[category] || FALLBACK_SERVICE_IMAGES.default;
  };

  const [imgSrc, setImgSrc] = useState(getInitialSrc);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(getInitialSrc());
    setHasError(false);
  }, [src, category, type]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      const fallback =
        type === "product"
          ? FALLBACK_PRODUCT_IMAGES[category] || FALLBACK_PRODUCT_IMAGES.default
          : FALLBACK_SERVICE_IMAGES[category] || FALLBACK_SERVICE_IMAGES.default;

      if (fallback === imgSrc) {
        setImgSrc(
          type === "product"
            ? FALLBACK_PRODUCT_IMAGES.default
            : FALLBACK_SERVICE_IMAGES.default
        );
      } else {
        setImgSrc(fallback);
      }
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={handleError}
      className={className}
      loading="lazy"
      {...props}
    />
  );
}
