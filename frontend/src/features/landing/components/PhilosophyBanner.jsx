import { motion } from "motion/react";
import { ShieldCheck, Sparkles, Clock, Wine, Scissors, Award } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Link } from "react-router";

const BANNER_IMG = "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

const PILLARS = [
  {
    icon: <ShieldCheck className="w-6 h-6 text-[#C9A24A]" />,
    title: "Esterilización Grado Médico",
    desc: "Herramientas 100% esterilizadas y navajas descartables individuales para tu total seguridad y tranquilidad.",
  },
  {
    icon: <Wine className="w-6 h-6 text-[#C9A24A]" />,
    title: "Hospitalidad & Confort VIP",
    desc: "Disfruta de una bebida de cortesía, café de especialidad y un ambiente relajante con toallas calientes aromatizadas.",
  },
  {
    icon: <Clock className="w-6 h-6 text-[#C9A24A]" />,
    title: "Puntualidad Garantizada",
    desc: "Tu tiempo es valioso. Con nuestro sistema de turnos online, te atendemos puntualmente sin demoras.",
  },
];

export default function PhilosophyBanner() {
  return (
    <section id="nosotros" className="relative py-28 overflow-hidden bg-[#0D0D0D]">
      {/* Background Image with Deep Overlay */}
      <ImageWithFallback
        src={BANNER_IMG}
        alt="Interior de barbería clásica y elegante"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "brightness(0.18) contrast(1.15)" }}
      />

      {/* Decorative Gold Ambient Radial Glow */}
      <div className="ambient-glow-gold w-[600px] h-[600px] -top-24 -left-20 opacity-20" />
      <div className="ambient-glow-gold w-[600px] h-[600px] bottom-0 right-0 opacity-25" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        
        {/* Top Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-[2px] bg-[#C9A24A]" />
              <span className="text-[#C9A24A] text-xs font-bold tracking-[0.25em] uppercase">
                NUESTRA FILOSOFÍA
              </span>
            </div>
            <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15]">
              Pasión por la tradición,{" "}
              <span className="text-gold-gradient">compromiso con tu estilo</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 flex flex-col justify-between"
          >
            <p className="text-[#B5B5B5] text-sm sm:text-base leading-relaxed mb-6 font-normal">
              Llevamos más de 5 años elevando el estándar de la barbería clásica. Para nosotros, cada corte es una escultura milimétrica y cada visita, una experiencia de renovación personal.
            </p>

            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#C9A24A] text-[#0D0D0D] font-bold text-xs tracking-wider shadow-[0_0_20px_rgba(201,162,74,0.3)] hover:bg-[#E0B85C] transition-all duration-300"
              >
                <span>RESERVAR MI TURNO</span>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PILLARS.map((pillar, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              whileHover={{ y: -6 }}
              className="p-8 rounded-2xl bg-[#121212]/80 backdrop-blur-xl border border-white/10 hover:border-[#C9A24A]/50 transition-all duration-300 shadow-[0_15px_30px_rgba(0,0,0,0.6)] group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#C9A24A]/10 border border-[#C9A24A]/30 flex items-center justify-center mb-6 group-hover:bg-[#C9A24A] group-hover:text-black transition-colors duration-300">
                {pillar.icon}
              </div>
              <h3 className="text-white text-lg font-bold mb-3 tracking-wide group-hover:text-[#D4AF37] transition-colors">
                {pillar.title}
              </h3>
              <p className="text-[#9E9E9E] text-xs leading-relaxed">
                {pillar.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}