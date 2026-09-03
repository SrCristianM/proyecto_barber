import { useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { Scissors, User, Calendar, Search, Sparkles, Clock, CheckCircle2 } from "lucide-react";

export default function QuickBookingBar() {
  const [service, setService] = useState("Corte Tradicional & Fade");
  const [barber, setBarber] = useState("Cualquier Barbero");
  const [date, setDate] = useState("Hoy");

  return (
    <div className="relative z-20 max-w-6xl mx-auto px-6 -mt-8 sm:-mt-12 mb-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="glass-gold-card p-4 sm:p-6 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] border border-[#C9A24A]/30 bg-[#121212]/90 backdrop-blur-2xl"
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[0.68rem] font-bold text-[#C9A24A] uppercase tracking-[0.2em]">
            RESERVA DIRECTA EN 3 PASOS
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Selector 1: Servicio */}
          <div className="bg-[#181818] border border-white/10 rounded-xl p-3 flex flex-col justify-center hover:border-[#C9A24A]/50 transition-colors">
            <label className="text-[0.65rem] font-bold text-[#8E8E93] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-[#C9A24A]" />
              Servicio
            </label>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer w-full"
            >
              <option value="Corte Tradicional & Fade">Corte Tradicional & Fade ($25.000)</option>
              <option value="Perfilado de Barba">Perfilado de Barba ($18.000)</option>
              <option value="Combo VIP Tu Turno">Combo VIP Tu Turno ($38.000)</option>
              <option value="Tratamiento Capilar">Tratamiento Capilar ($22.000)</option>
            </select>
          </div>

          {/* Selector 2: Barbero */}
          <div className="bg-[#181818] border border-white/10 rounded-xl p-3 flex flex-col justify-center hover:border-[#C9A24A]/50 transition-colors">
            <label className="text-[0.65rem] font-bold text-[#8E8E93] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#C9A24A]" />
              Barbero
            </label>
            <select
              value={barber}
              onChange={(e) => setBarber(e.target.value)}
              className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer w-full"
            >
              <option value="Cualquier Barbero">Cualquier Profesional</option>
              <option value="Carlos 'Blade' Mendoza">Carlos "Blade" Mendoza (Master)</option>
              <option value="Mateo Gómez">Mateo Gómez (Barba & Clásico)</option>
              <option value="David Silva">David Silva (Contemporáneo)</option>
            </select>
          </div>

          {/* Selector 3: Fecha */}
          <div className="bg-[#181818] border border-white/10 rounded-xl p-3 flex flex-col justify-center hover:border-[#C9A24A]/50 transition-colors">
            <label className="text-[0.65rem] font-bold text-[#8E8E93] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#C9A24A]" />
              Fecha
            </label>
            <select
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer w-full"
            >
              <option value="Hoy">Hoy (Turnos rápidos)</option>
              <option value="Mañana">Mañana</option>
              <option value="Esta Semana">Esta Semana</option>
            </select>
          </div>

          {/* CTA Button */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center">
            <Link
              to="/login"
              style={{ backgroundColor: "#C9A24A", color: "#0D0D0D" }}
              className="w-full h-full min-h-[50px] rounded-xl font-extrabold text-xs tracking-wider flex items-center justify-center gap-2 px-6 shadow-[0_0_20px_rgba(201,162,74,0.35)] hover:bg-[#E0B85C] transition-all"
            >
              <Search className="w-4 h-4" />
              <span>COMPROBAR TURNOS</span>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
