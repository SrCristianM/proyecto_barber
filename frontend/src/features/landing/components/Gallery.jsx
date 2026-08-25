import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ZoomIn } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const GALLERY_IMAGES = [
  { src: "https://images.unsplash.com/photo-1593702275687-f8b402bf1fb5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000", alt: "Corte moderno con fade" },
  { src: "https://images.unsplash.com/photo-1647140655214-e4a2d914971f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000", alt: "Corte clásico con tijeras" },
  { src: "https://images.unsplash.com/photo-1672642150228-3fcd5826ec26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000", alt: "Estilo contemporáneo" },
];

export default function Gallery() {
  const [selectedImg, setSelectedImg] = useState(null);

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {GALLERY_IMAGES.map((img, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedImg(img)}
              className="relative overflow-hidden group h-72 md:h-80 cursor-pointer rounded-lg border border-[#222222] hover:border-[#C9A24A]/50 transition-colors"
            >
              <ImageWithFallback
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
              >
                <div className="flex items-center justify-between">
                  <span style={{ color: "#C9A24A", letterSpacing: "0.16em", fontSize: "0.72rem" }} className="font-bold">
                    AMPLIAR FOTO
                  </span>
                  <ZoomIn className="w-4 h-4 text-[#C9A24A]" />
                </div>
                <p className="text-xs text-white/80 mt-1 font-light">{img.alt}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImg(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[85vh] rounded-xl overflow-hidden border border-[#C9A24A]/40 shadow-2xl bg-black"
            >
              <button
                onClick={() => setSelectedImg(null)}
                className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black text-white rounded-full transition-colors z-10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={selectedImg.src}
                alt={selectedImg.alt}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              <div className="p-4 bg-[#151515] border-t border-[#222222]">
                <p className="text-sm font-medium text-white">{selectedImg.alt}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}