import { motion } from "motion/react";
import { ShoppingBag, Check, Star } from "lucide-react";
import { Link } from "react-router";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const PRODUCTS = [
  {
    id: 1,
    name: "Pomada Fijadora Mate Gold",
    category: "Estilizado Capilar",
    price: "$35.000",
    badge: "TOP VENTAS",
    rating: 4.9,
    desc: "Fijación fuerte y acabado natural sin brillo ni residuos. Fácil de retirar con agua.",
    image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=500",
  },
  {
    id: 2,
    name: "Aceite de Argán & Jojoba para Barba",
    category: "Cuidado de Barba",
    price: "$42.000",
    badge: "100% ORGÁNICO",
    rating: 5.0,
    desc: "Hidratación profunda, suavidad extrema y brillo sutil con fragancia amaderada de cedro.",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=500",
  },
  {
    id: 3,
    name: "Polvo Texturizante Voluminizador",
    category: "Efecto Textura",
    price: "$30.000",
    badge: "TENDENCIA",
    rating: 4.8,
    desc: "Aporta volumen instantáneo y fijación flexible ideal para peinados modernos con textura.",
    image: "https://images.unsplash.com/photo-1583209814683-c023dd293cc6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=500",
  },
  {
    id: 4,
    name: "Tónico Aftershave de Eucalipto",
    category: "Post Afeitado",
    price: "$28.000",
    badge: "REFRESCANTE",
    rating: 4.9,
    desc: "Calma la piel inmediatamente después del afeitado, previene la irritación y cierra poros.",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=500",
  },
];

export default function ProductsShowcase() {
  return (
    <section className="py-24 bg-[#0A0A0A] relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="ambient-glow-gold w-[450px] h-[450px] bottom-0 -left-20 opacity-20" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-[2px] bg-[#C9A24A]" />
              <span className="text-[#C9A24A] text-xs font-bold tracking-[0.25em] uppercase">
                PRODUCTOS PROFESIONALES
              </span>
            </div>
            <h2 className="text-white text-3xl sm:text-4xl font-extrabold tracking-tight">
              Grooming Essentials <span className="text-gold-gradient">de Autor</span>
            </h2>
          </div>

          <p className="text-[#8E8E93] text-xs sm:text-sm max-w-md">
            Lleva la calidad de la barbería a tu rutina diaria con nuestras fórmulas premium recomendadas por nuestros master barbers.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRODUCTS.map((prod, i) => (
            <motion.div
              key={prod.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              whileHover={{ y: -8 }}
              className="bg-[#141414] rounded-2xl overflow-hidden border border-white/10 hover:border-[#C9A24A]/60 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_40px_rgba(201,162,74,0.18)] flex flex-col justify-between group"
            >
              {/* Product Image */}
              <div className="relative h-60 overflow-hidden bg-black flex items-center justify-center p-4">
                <ImageWithFallback
                  src={prod.image}
                  alt={prod.name}
                  className="w-full h-full object-cover rounded-xl transform group-hover:scale-108 transition-transform duration-700 ease-out"
                />

                {/* Badge */}
                <div className="absolute top-4 left-4 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-[#C9A24A]/40 text-[#C9A24A] text-[0.65rem] font-bold tracking-wider uppercase">
                  {prod.badge}
                </div>

                <div className="absolute bottom-4 right-4 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/10 flex items-center gap-1 text-xs text-[#C9A24A] font-bold">
                  <Star className="w-3 h-3 fill-[#C9A24A]" />
                  <span>{prod.rating}</span>
                </div>
              </div>

              {/* Product Details */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[#7A7A7A] text-[0.68rem] font-semibold uppercase tracking-wider block mb-1">
                    {prod.category}
                  </span>
                  <h3 className="text-white text-base font-bold mb-2 group-hover:text-[#D4AF37] transition-colors">
                    {prod.name}
                  </h3>
                  <p className="text-[#8E8E93] text-xs leading-relaxed mb-4">
                    {prod.desc}
                  </p>
                </div>

                <div>
                  <div className="text-xl font-extrabold text-[#C9A24A] mb-4">
                    {prod.price}
                  </div>

                  <Link
                    to="/login"
                    className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-[#C9A24A] text-white hover:text-black border border-white/10 hover:border-[#C9A24A] font-bold text-xs tracking-wider flex items-center justify-center gap-2 transition-all duration-300"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>SOLICITAR EN MI VISITA</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
