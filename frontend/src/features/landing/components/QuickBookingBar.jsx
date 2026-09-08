import { useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { Scissors, User, Calendar, Search, Clock, CheckCircle2 } from "lucide-react";
import SearchableSelect from "../../admin/shared/components/SearchableSelect";

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
          <div className="bg-[#181818] border border-white/10 rounded-xl p-2.5 flex flex-col justify-center hover:border-[#C9A24A]/50 transition-colors">
            <SearchableSelect
              label="Servicio"
              icon={<Scissors className="w-3.5 h-3.5 text-[#C9A24A]" />}
              value={service}
              onChange={setService}
              options={[
                "Corte Tradicional & Fade",
                "Perfilado de Barba",
                "Combo VIP Tu Turno",
                "Tratamiento Capilar"
              ]}
              searchable={false}
              size="sm"
              className="w-full"
            />
          </div>

          {/* Selector 2: Barbero */}
          <div className="bg-[#181818] border border-white/10 rounded-xl p-2.5 flex flex-col justify-center hover:border-[#C9A24A]/50 transition-colors">
            <SearchableSelect
              label="Barbero"
              icon={<User className="w-3.5 h-3.5 text-[#C9A24A]" />}
              value={barber}
              onChange={setBarber}
              options={[
                "Cualquier Profesional",
                'Carlos "Blade" Mendoza',
                "Mateo Gómez",
                "David Silva"
              ]}
              searchable={false}
              size="sm"
              className="w-full"
            />
          </div>

          {/* Selector 3: Fecha */}
          <div className="bg-[#181818] border border-white/10 rounded-xl p-2.5 flex flex-col justify-center hover:border-[#C9A24A]/50 transition-colors">
            <SearchableSelect
              label="Fecha"
              icon={<Calendar className="w-3.5 h-3.5 text-[#C9A24A]" />}
              value={date}
              onChange={setDate}
              options={[
                "Hoy (Turnos rápidos)",
                "Mañana",
                "Esta Semana"
              ]}
              searchable={false}
              size="sm"
              className="w-full"
            />
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
