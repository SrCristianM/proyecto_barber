import { motion } from "motion/react";
import { Link } from "react-router";
import { Star, Scissors, Clock, ShieldCheck, ChevronRight, CalendarCheck } from "lucide-react";

const STATS = [
  {
    icon: <Star className="w-7 h-7 text-[#C9A24A]" />,
    value: "4.9 / 5",
    label: "Valoración Media en Reseñas",
    desc: "+500 opiniones de clientes verificados",
  },
  {
    icon: <Scissors className="w-7 h-7 text-[#C9A24A]" />,
    value: "+3,500",
    label: "Cortes & Servicios Realizados",
    desc: "Clientes recurrentes satisfechos",
  },
  {
    icon: <Clock className="w-7 h-7 text-[#C9A24A]" />,
    value: "5+ Años",
    label: "De Trayectoria & Maestría",
    desc: "Cuidado profesional continuo",
  },
  {
    icon: <ShieldCheck className="w-7 h-7 text-[#C9A24A]" />,
    value: "100%",
    label: "Garantía de Satisfacción",
    desc: "Asesoramiento y precisión asegurada",
  },
];

export default function Stats() {
  return (
    <section className="py-20 bg-[#0E0E0E] relative overflow-hidden border-t border-b border-white/5">
      {/* Ambient background glows */}
      <div className="ambient-glow-gold w-[400px] h-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-15" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {STATS.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="p-7 rounded-2xl bg-[#141414] border border-white/10 hover:border-[#C9A24A]/50 transition-all duration-300 flex flex-col items-center text-center shadow-[0_10px_25px_rgba(0,0,0,0.5)] group"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#C9A24A]/10 border border-[#C9A24A]/30 flex items-center justify-center mb-4 group-hover:bg-[#C9A24A] group-hover:text-black group-hover:scale-110 transition-all duration-300">
                {stat.icon}
              </div>
              <span className="text-white text-3xl font-black tracking-tight mb-1 group-hover:text-[#D4AF37] transition-colors">
                {stat.value}
              </span>
              <span className="text-[#C9A24A] text-xs font-bold uppercase tracking-wider mb-2">
                {stat.label}
              </span>
              <span className="text-[#7A7A7A] text-[0.72rem] leading-relaxed font-normal">
                {stat.desc}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Big VIP Booking Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl overflow-hidden p-8 sm:p-12 bg-gradient-to-br from-[#1A1A1A] via-[#15130D] to-[#1A1A1A] border border-[#C9A24A]/40 shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-center max-w-4xl mx-auto"
        >
          {/* Subtle gold line on top */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#C9A24A] to-transparent" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C9A24A]/15 border border-[#C9A24A]/40 text-[#C9A24A] text-xs font-bold tracking-widest uppercase mb-4">
            <CalendarCheck className="w-4 h-4" /> AGENDA ONLINE EN 1 MINUTO
          </div>

          <h3 className="text-white text-2xl sm:text-4xl font-extrabold tracking-tight mb-4">
            ¿Listo para llevar tu imagen al <span className="text-gold-gradient">siguiente nivel</span>?
          </h3>

          <p className="text-[#A0A0A0] text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
            Elige a tu barbero favorito, el servicio ideal y el horario que mejor te convenga con nuestro sistema de reservas sin esperas.
          </p>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }} className="inline-block">
            <Link
              to="/login"
              style={{
                backgroundColor: "#C9A24A",
                color: "#0D0D0D",
                letterSpacing: "0.12em",
              }}
              className="relative group overflow-hidden inline-flex items-center gap-3 px-10 py-4 font-black text-xs sm:text-sm tracking-wider shadow-[0_0_30px_rgba(201,162,74,0.4)] hover:shadow-[0_0_40px_rgba(201,162,74,0.7)] transition-all duration-300"
            >
              <span className="absolute inset-0 w-1/2 h-full bg-white/25 transform -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-700 ease-out" />
              <span className="relative z-10 flex items-center gap-2">
                RESERVAR CITA AHORA
                <ChevronRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}