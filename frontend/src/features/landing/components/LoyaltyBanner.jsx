import { motion } from "motion/react";
import { Crown, Gift, Flame, ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router";

export default function LoyaltyBanner() {
  return (
    <section className="py-24 bg-[#0D0D0D] relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="ambient-glow-gold w-[600px] h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Info (7 cols) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-[2px] bg-[#C9A24A]" />
              <span className="text-[#C9A24A] text-xs font-bold tracking-[0.25em] uppercase">
                PROGRAMA DE RECOMPENSAS
              </span>
            </div>

            <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Únete al <span className="text-gold-gradient">Club VIP Tu Turno</span>
            </h2>

            <p className="text-[#A0A0A0] text-sm sm:text-base leading-relaxed">
              Premia tu fidelidad. Cada visita a nuestra barbería suma puntos automáticos a tu perfil para canjear por cortes gratis, tratamientos y descuentos exclusivos.
            </p>

            {/* Perks list */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-[#151515] border border-white/10 flex flex-col justify-between">
                <div className="w-9 h-9 rounded-lg bg-[#C9A24A]/20 flex items-center justify-center text-[#C9A24A] mb-3">
                  <Flame className="w-5 h-5" />
                </div>
                <h4 className="text-white font-bold text-xs mb-1">Acumula Puntos</h4>
                <p className="text-[#7A7A7A] text-[0.7rem]">1 punto por cada servicio realizado.</p>
              </div>

              <div className="p-4 rounded-xl bg-[#151515] border border-white/10 flex flex-col justify-between">
                <div className="w-9 h-9 rounded-lg bg-[#C9A24A]/20 flex items-center justify-center text-[#C9A24A] mb-3">
                  <Gift className="w-5 h-5" />
                </div>
                <h4 className="text-white font-bold text-xs mb-1">5° Corte Gratis</h4>
                <p className="text-[#7A7A7A] text-[0.7rem]">O ritual de barba bonificado al 100%.</p>
              </div>

              <div className="p-4 rounded-xl bg-[#151515] border border-white/10 flex flex-col justify-between">
                <div className="w-9 h-9 rounded-lg bg-[#C9A24A]/20 flex items-center justify-center text-[#C9A24A] mb-3">
                  <Crown className="w-5 h-5" />
                </div>
                <h4 className="text-white font-bold text-xs mb-1">Cumpleaños VIP</h4>
                <p className="text-[#7A7A7A] text-[0.7rem]">Bebida premium y servicio de regalo.</p>
              </div>
            </div>

            <div className="pt-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#C9A24A] text-black font-extrabold text-xs tracking-wider rounded-xl shadow-[0_0_25px_rgba(201,162,74,0.35)] hover:bg-[#E0B85C] transition-all"
              >
                <span>CREAR MI CUENTA Y EMPEZAR A ACUMULAR</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          {/* Right Virtual Membership Card (5 cols) */}
          <motion.div
            initial={{ opacity: 0, x: 30, rotateY: 15 }}
            whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 flex justify-center"
          >
            <div className="relative w-full max-w-sm h-56 sm:h-64 rounded-2xl p-6 bg-gradient-to-br from-[#242424] via-[#16140E] to-[#0A0A0A] border border-[#C9A24A]/50 shadow-[0_20px_50px_rgba(201,162,74,0.3)] flex flex-col justify-between overflow-hidden group">
              {/* Shine beam overlay */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-gradient-to-br from-[#C9A24A]/30 to-transparent rounded-full filter blur-2xl pointer-events-none" />

              {/* Card Top */}
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#C9A24A]/20 border border-[#C9A24A] flex items-center justify-center">
                    <Crown className="w-4 h-4 text-[#C9A24A]" />
                  </div>
                  <div>
                    <div className="text-white font-black text-xs tracking-widest">TU TURNO</div>
                    <div className="text-[#C9A24A] text-[0.55rem] font-bold tracking-[0.2em]">VIP BLACK PASS</div>
                  </div>
                </div>
                <div className="w-10 h-7 rounded-md bg-gradient-to-r from-amber-200 to-amber-500 opacity-80 border border-amber-600/40" />
              </div>

              {/* Card Middle */}
              <div className="z-10 my-auto">
                <div className="text-[#7A7A7A] text-[0.65rem] tracking-widest uppercase">Número de Miembro</div>
                <div className="text-white font-mono text-sm sm:text-base tracking-[0.2em] font-semibold mt-0.5">
                  TT-7892 • GOLD TIER
                </div>
              </div>

              {/* Card Bottom */}
              <div className="flex items-end justify-between z-10 pt-2 border-t border-white/10">
                <div>
                  <div className="text-[#7A7A7A] text-[0.58rem] tracking-wider uppercase">Titular</div>
                  <div className="text-white text-xs font-bold">CLIENTE DISTINGUIDO</div>
                </div>
                <div className="text-right">
                  <div className="text-[#7A7A7A] text-[0.58rem] tracking-wider uppercase">Estado</div>
                  <div className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    ACTIVO
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
