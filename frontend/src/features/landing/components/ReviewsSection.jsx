import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, CheckCircle, Quote, MessageSquare, ThumbsUp } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const REVIEWS = [
  {
    id: 1,
    name: "Alejandro Restrepo",
    time: "Hace 2 días",
    rating: 5,
    service: "Corte Tradicional & Fade",
    barber: "Carlos Mendoza",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    comment:
      "La mejor barbería a la que he ido. Carlos tiene una precisión quirúrgica para los degradados. Además el café de bienvenida y la toalla caliente son un detalle de 10 estrellas.",
  },
  {
    id: 2,
    name: "Sebastián Morales",
    time: "Hace 1 semana",
    rating: 5,
    service: "Perfilado y Ritual de Barba",
    barber: "Mateo Gómez",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    comment:
      "Llegué con la barba muy descuidada y Mateo la transformó por completo. Cero irritación gracias al tratamiento de vapor y navajas nuevas. Totalmente recomendado.",
  },
  {
    id: 3,
    name: "Daniel Valencia",
    time: "Hace 2 semanas",
    rating: 5,
    service: "Combo VIP Tu Turno",
    barber: "David Silva",
    avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    comment:
      "El agendamiento en la web fue súper rápido y me atendieron exacto a la hora reservada. La experiencia completa con masaje capilar vale cada centavo.",
  },
  {
    id: 4,
    name: "Felipe Orozco",
    time: "Hace 3 semanas",
    rating: 5,
    service: "Corte Ejecutivo a Tijera",
    barber: "Carlos Mendoza",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    comment:
      "Ambiente impecable, música selecta y trato de primer nivel. No cambio de barbería por nada del mundo.",
  },
];

export default function ReviewsSection() {
  return (
    <section className="py-24 bg-[#0D0D0D] relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="ambient-glow-gold w-[500px] h-[500px] top-1/3 right-0 opacity-15" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-[2px] bg-[#C9A24A]" />
              <span className="text-[#C9A24A] text-xs font-bold tracking-[0.25em] uppercase">
                TESTIMONIOS VERIFICADOS
              </span>
            </div>
            <h2 className="text-white text-3xl sm:text-4xl font-extrabold tracking-tight">
              Lo que opinan nuestros <span className="text-gold-gradient">clientes</span>
            </h2>
          </div>

          {/* Google rating overview badge */}
          <div className="flex items-center gap-4 p-3.5 px-5 rounded-2xl bg-[#141414] border border-[#C9A24A]/30 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-[#C9A24A]/20 flex items-center justify-center text-[#C9A24A] font-black text-sm">
              G
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-white font-extrabold text-sm">4.9 / 5.0</span>
                <div className="flex text-[#C9A24A]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#C9A24A]" />
                  ))}
                </div>
              </div>
              <p className="text-[#8E8E93] text-[0.68rem]">Basado en más de 500 reseñas en Google</p>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {REVIEWS.map((rev, i) => (
            <motion.div
              key={rev.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              whileHover={{ y: -6 }}
              className="p-6 rounded-2xl bg-[#141414] border border-white/10 hover:border-[#C9A24A]/50 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col justify-between group"
            >
              <div>
                {/* Header: Stars & Quote */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-1 text-[#C9A24A]">
                    {[...Array(rev.rating)].map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 fill-[#C9A24A]" />
                    ))}
                  </div>
                  <Quote className="w-5 h-5 text-[#C9A24A]/40 group-hover:text-[#C9A24A] transition-colors" />
                </div>

                {/* Comment */}
                <p className="text-[#C0C0C0] text-xs leading-relaxed italic mb-6">
                  "{rev.comment}"
                </p>
              </div>

              {/* Client Info & Service */}
              <div className="pt-4 border-t border-white/5 flex items-center gap-3">
                <ImageWithFallback
                  src={rev.avatar}
                  alt={rev.name}
                  className="w-10 h-10 rounded-full object-cover border border-[#C9A24A]/40 flex-shrink-0"
                />
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1">
                    <h4 className="text-white text-xs font-bold truncate">{rev.name}</h4>
                    <CheckCircle className="w-3 h-3 text-[#C9A24A] flex-shrink-0" />
                  </div>
                  <p className="text-[#7A7A7A] text-[0.65rem] truncate">{rev.service}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
