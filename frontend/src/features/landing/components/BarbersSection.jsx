import { motion } from "motion/react";
import { Star, Scissors, Award, Calendar, ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const BARBERS = [
  {
    id: 1,
    name: "Carlos 'Blade' Mendoza",
    role: "Master Barber & Fundador",
    experience: "8 años de experiencia",
    specialty: "Skin Fade & Diseños Freestyle",
    rating: "5.0",
    cuts: "+2,400 cortes",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
  },
  {
    id: 2,
    name: "Mateo Gómez",
    role: "Especialista en Barba & Ritual Clásico",
    experience: "6 años de experiencia",
    specialty: "Perfilado a Navaja & Tratamientos",
    rating: "4.9",
    cuts: "+1,800 cortes",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
  },
  {
    id: 3,
    name: "David Silva",
    role: "Estilista Capilar Contemporáneo",
    experience: "5 años de experiencia",
    specialty: "Cortes Texturizados & Mullet Moderno",
    rating: "4.9",
    cuts: "+1,200 cortes",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
  },
];

export default function BarbersSection() {
  return (
    <section id="barberos" className="py-24 bg-[#0D0D0D] relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="ambient-glow-gold w-[400px] h-[400px] top-10 right-0 opacity-20" />
      <div className="ambient-glow-gold w-[450px] h-[450px] bottom-0 left-0 opacity-15" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-8 h-[2px] bg-[#C9A24A]" />
            <span className="text-[#C9A24A] text-xs font-bold tracking-[0.25em] uppercase">
              PROFESIONALES CERTIFICADOS
            </span>
            <div className="w-8 h-[2px] bg-[#C9A24A]" />
          </div>
          <h2 className="text-white text-3xl sm:text-4xl font-extrabold tracking-tight">
            Conoce a nuestros <span className="text-gold-gradient">Master Barbers</span>
          </h2>
          <p className="text-[#8E8E93] text-sm mt-4">
            Profesionales apasionados dedicados a brindarte un servicio impecable, asesoramiento de visagismo y el corte perfecto.
          </p>
        </div>

        {/* Barbers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {BARBERS.map((barber, index) => (
            <motion.div
              key={barber.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              whileHover={{ y: -8 }}
              className="group bg-[#141414] rounded-2xl overflow-hidden border border-white/10 hover:border-[#C9A24A]/60 transition-all duration-300 shadow-[0_15px_35px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_45px_rgba(201,162,74,0.18)] flex flex-col"
            >
              {/* Barber Image with Overlay */}
              <div className="relative h-80 overflow-hidden">
                <ImageWithFallback
                  src={barber.image}
                  alt={barber.name}
                  className="w-full h-full object-cover transform group-hover:scale-108 transition-transform duration-700 ease-out"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/30 to-transparent" />

                {/* Rating Badge */}
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-[#C9A24A]/40 flex items-center gap-1.5 shadow-lg">
                  <Star className="w-3.5 h-3.5 fill-[#C9A24A] text-[#C9A24A]" />
                  <span className="text-white text-xs font-bold">{barber.rating}</span>
                </div>

                {/* Experience Tag */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-[#C9A24A] text-black text-[0.68rem] font-extrabold uppercase tracking-wider">
                    {barber.cuts}
                  </span>
                </div>
              </div>

              {/* Barber Details */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-white text-lg font-bold group-hover:text-[#D4AF37] transition-colors">
                    {barber.name}
                  </h3>
                  <p className="text-[#C9A24A] text-xs font-medium tracking-wide mt-0.5 mb-3">
                    {barber.role}
                  </p>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 mb-5">
                    <span className="text-[0.68rem] uppercase tracking-wider text-[#7A7A7A] block mb-1 font-semibold">
                      Especialidad:
                    </span>
                    <span className="text-xs text-[#CCCCCC] font-medium">
                      {barber.specialty}
                    </span>
                  </div>
                </div>

                {/* Agendar button */}
                <Link
                  to="/login"
                  className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-[#C9A24A] text-white hover:text-black border border-white/10 hover:border-[#C9A24A] font-bold text-xs tracking-wider flex items-center justify-center gap-2 transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(201,162,74,0.3)]"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>AGENDAR CON ESTE BARBERO</span>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
