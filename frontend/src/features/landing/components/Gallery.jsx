import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ZoomIn, ChevronLeft, ChevronRight, Sparkles, Filter } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const GALLERY_CATEGORIES = [
  { id: "all", label: "TODOS" },
  { id: "fade", label: "FADES & DEGRADADOS" },
  { id: "classic", label: "CLÁSICOS & TIJERA" },
  { id: "beard", label: "DISEÑO DE BARBA" },
];

const GALLERY_IMAGES = [
  {
    id: 1,
    category: "fade",
    src: "https://images.unsplash.com/photo-1593702275687-f8b402bf1fb5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000",
    title: "High Skin Fade con Textura",
    barber: "Carlos Mendoza",
    tag: "Tendencia",
  },
  {
    id: 2,
    category: "classic",
    src: "https://images.unsplash.com/photo-1647140655214-e4a2d914971f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000",
    title: "Corte Ejecutivo Clásico a Tijera",
    barber: "Mateo Gómez",
    tag: "Elegante",
  },
  {
    id: 3,
    category: "beard",
    src: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000",
    title: "Perfilado de Barba & Pompadour",
    barber: "David Silva",
    tag: "Ritual Completo",
  },
  {
    id: 4,
    category: "fade",
    src: "https://images.unsplash.com/photo-1672642150228-3fcd5826ec26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000",
    title: "Mid Taper Fade con Flequillo Texturizado",
    barber: "Carlos Mendoza",
    tag: "Urbano",
  },
  {
    id: 5,
    category: "classic",
    src: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000",
    title: "Precisión Milimétrica en Corte",
    barber: "Mateo Gómez",
    tag: "Maestría",
  },
  {
    id: 6,
    category: "beard",
    src: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000",
    title: "Afeitado Tradicional & Toalla Caliente",
    barber: "David Silva",
    tag: "Experiencia VIP",
  },
];

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedIdx, setSelectedIdx] = useState(null);

  const filteredImages =
    activeCategory === "all"
      ? GALLERY_IMAGES
      : GALLERY_IMAGES.filter((img) => img.category === activeCategory);

  const handlePrev = (e) => {
    e.stopPropagation();
    if (selectedIdx === null) return;
    setSelectedIdx((prev) => (prev > 0 ? prev - 1 : filteredImages.length - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (selectedIdx === null) return;
    setSelectedIdx((prev) => (prev < filteredImages.length - 1 ? prev + 1 : 0));
  };

  const currentImage = selectedIdx !== null ? filteredImages[selectedIdx] : null;

  return (
    <section id="galeria" className="py-24 bg-[#0A0A0A] relative overflow-hidden">
      {/* Background Glow */}
      <div className="ambient-glow-gold w-[450px] h-[450px] top-1/4 -right-20 opacity-20" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header & Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-[2px] bg-[#C9A24A]" />
              <span className="text-[#C9A24A] text-xs font-bold tracking-[0.25em] uppercase">
                PORTFOLIO & RESULTADOS
              </span>
            </div>
            <h2 className="text-white text-3xl sm:text-4xl font-extrabold tracking-tight">
              Estilos que <span className="text-gold-gradient">hablan por sí solos</span>
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2 p-1.5 bg-[#141414] rounded-xl border border-white/5">
            {GALLERY_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setSelectedIdx(null);
                }}
                className={`relative px-4 py-2 text-xs font-bold tracking-wider rounded-lg transition-all duration-300 ${
                  activeCategory === cat.id
                    ? "text-[#0D0D0D] font-extrabold shadow-md"
                    : "text-[#8E8E93] hover:text-white hover:bg-white/5"
                }`}
              >
                {activeCategory === cat.id && (
                  <motion.div
                    layoutId="gallery-category-pill"
                    className="absolute inset-0 bg-[#C9A24A] rounded-lg"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredImages.map((img, i) => (
              <motion.div
                key={img.id}
                layout
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.4 }}
                whileHover={{ y: -6 }}
                onClick={() => setSelectedIdx(i)}
                className="relative overflow-hidden group h-80 rounded-2xl cursor-pointer border border-white/10 hover:border-[#C9A24A]/70 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_40px_rgba(201,162,74,0.2)] bg-[#141414]"
              >
                <ImageWithFallback
                  src={img.src}
                  alt={img.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                />

                {/* Always-visible top tag */}
                <div className="absolute top-4 left-4 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[#C9A24A] text-[0.65rem] font-bold tracking-wider uppercase z-10">
                  {img.tag}
                </div>

                {/* Hover Details Card */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 bg-gradient-to-t from-black/95 via-black/50 to-transparent">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#C9A24A] text-[0.7rem] font-extrabold tracking-[0.16em] uppercase flex items-center gap-1.5">
                      <ZoomIn className="w-4 h-4" /> VER DETALLES
                    </span>
                    <span className="text-[0.7rem] text-[#8E8E93]">Por {img.barber}</span>
                  </div>
                  <h3 className="text-white text-sm font-bold leading-snug">{img.title}</h3>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Lightbox Modal with Navigation Controls */}
      <AnimatePresence>
        {currentImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedIdx(null)}
            className="fixed inset-0 z-50 bg-black/92 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full max-h-[90vh] rounded-2xl overflow-hidden border border-[#C9A24A]/40 shadow-[0_0_50px_rgba(201,162,74,0.3)] bg-[#111111] flex flex-col"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedIdx(null)}
                className="absolute top-4 right-4 p-2 bg-black/70 hover:bg-[#C9A24A] text-white hover:text-black rounded-full transition-colors z-20 cursor-pointer shadow-lg"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Prev / Next Nav Buttons */}
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-[#C9A24A] text-white hover:text-black transition-colors z-20 shadow-lg"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-[#C9A24A] text-white hover:text-black transition-colors z-20 shadow-lg"
                aria-label="Siguiente"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Lightbox Image */}
              <div className="relative flex-1 bg-black flex items-center justify-center min-h-[350px] max-h-[68vh] overflow-hidden">
                <img
                  src={currentImage.src}
                  alt={currentImage.title}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Lightbox Caption Footer */}
              <div className="p-5 bg-[#161616] border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[#C9A24A] text-xs font-bold uppercase tracking-wider block mb-1">
                    {currentImage.tag} • Realizado por {currentImage.barber}
                  </span>
                  <h4 className="text-white text-base font-bold">{currentImage.title}</h4>
                </div>

                <div className="text-xs text-[#8E8E93] font-medium">
                  {selectedIdx + 1} de {filteredImages.length}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}