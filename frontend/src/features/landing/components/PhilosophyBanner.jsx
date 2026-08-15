import { ImageWithFallback } from "./figma/ImageWithFallback";

const BANNER_IMG = "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

export default function PhilosophyBanner() {
  return (
    <section className="relative py-28 overflow-hidden">
      <ImageWithFallback
        src={BANNER_IMG}
        alt="Interior de barbería clásica"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "brightness(0.22)" }}
      />
      <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
        <div>
          <div className="flex items-center gap-4 mb-5">
            <div style={{ backgroundColor: "#C9A24A", height: "1px" }} className="w-10 flex-shrink-0" />
            <span style={{ color: "#C9A24A", letterSpacing: "0.22em", fontSize: "0.68rem" }}>NUESTRA FILOSOFÍA</span>
          </div>
          <h2 style={{ color: "#FFFFFF", fontSize: "clamp(1.5rem, 2.8vw, 2.2rem)", fontWeight: 700, lineHeight: 1.25 }}>
            Pasión por la tradición, <span style={{ color: "#C9A24A" }}>compromiso con tu estilo</span>
          </h2>
        </div>
        <div>
          <p style={{ color: "#B5B5B5", fontSize: "0.88rem", lineHeight: 1.85 }} className="mb-8">
            Llevamos más de 5 años perfeccionando el arte de la barbería. Cada corte es una obra de arte, cada cliente una historia. Combinamos técnicas tradicionales con tendencias modernas para darte el mejor resultado posible.
          </p>
          <a href="#" style={{ backgroundColor: "#C9A24A", color: "#0D0D0D", letterSpacing: "0.1em", fontSize: "0.76rem" }} className="inline-block px-7 py-3.5 font-bold hover:bg-[#E0B85C] transition-colors duration-200">
            CONOCE NUESTRA HISTORIA
          </a>
        </div>
      </div>
    </section>
  );
}