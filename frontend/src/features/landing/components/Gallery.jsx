import { ImageWithFallback } from "./figma/ImageWithFallback";

const GALLERY_IMAGES = [
  { src: "https://images.unsplash.com/photo-1593702275687-f8b402bf1fb5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600", alt: "Corte moderno con fade" },
  { src: "https://images.unsplash.com/photo-1647140655214-e4a2d914971f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600", alt: "Corte clásico con tijeras" },
  { src: "https://images.unsplash.com/photo-1672642150228-3fcd5826ec26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600", alt: "Estilo contemporáneo" },
];

export default function Gallery() {
  return (
    <section style={{ backgroundColor: "#0D0D0D" }} className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-3">
            <div style={{ backgroundColor: "#C9A24A", height: "1px" }} className="w-10" />
            <span style={{ color: "#C9A24A", letterSpacing: "0.22em", fontSize: "0.68rem" }}>PORTFOLIO</span>
            <div style={{ backgroundColor: "#C9A24A", height: "1px" }} className="w-10" />
          </div>
          <h2 style={{ color: "#FFFFFF", fontSize: "clamp(1.5rem, 2.5vw, 2rem)", fontWeight: 700 }}>
            Estilos que hablan por sí solos
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
          {GALLERY_IMAGES.map((img, i) => (
            <div key={i} className="relative overflow-hidden group h-72 md:h-80 cursor-pointer">
              <ImageWithFallback
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)" }}
              >
                <span style={{ color: "#C9A24A", letterSpacing: "0.16em", fontSize: "0.72rem" }} className="font-bold">
                  VER MÁS
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}