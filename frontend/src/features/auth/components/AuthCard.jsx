import { Link } from "react-router";
import { motion } from "motion/react";
import { Scissors, ArrowLeft, Star, Award, ShieldCheck } from "lucide-react";
import { ImageWithFallback } from "../../landing/components/figma/ImageWithFallback";

const AUTH_BG_IMG = "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200";

export default function AuthCard({ children, wide = false }) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden selection:bg-[#C9A24A] selection:text-black">
      {/* Background ambient glow */}
      <div className="ambient-glow-gold w-[550px] h-[550px] -top-24 -left-24 opacity-25" />
      <div className="ambient-glow-gold w-[550px] h-[550px] -bottom-24 -right-24 opacity-20" />

      {/* Main Split-Screen Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
        className={`w-full ${
          wide ? "max-w-5xl" : "max-w-4xl"
        } rounded-3xl overflow-hidden bg-[#121212]/90 backdrop-blur-2xl border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.9)] grid grid-cols-1 lg:grid-cols-12 relative z-10`}
      >
        {/* Left Side: Cinema Branding & Atmosphere (5 cols) */}
        <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-8 overflow-hidden bg-black">
          {/* Background Photo with Dark Gradient Overlay */}
          <ImageWithFallback
            src={AUTH_BG_IMG}
            alt="Interior y estilo de barbería Tu Turno"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "brightness(0.35) contrast(1.1)" }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/30 pointer-events-none" />

          {/* Top Back Link & Brand */}
          <div className="relative z-10">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-xs text-[#B5B5B5] hover:text-[#C9A24A] hover:border-[#C9A24A]/50 transition-all duration-300 group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              <span>Volver a la página principal</span>
            </Link>

            <div className="flex items-center gap-2.5 mt-8">
              <div className="w-8 h-8 rounded-lg bg-[#C9A24A]/20 border border-[#C9A24A] flex items-center justify-center">
                <Scissors className="w-4 h-4 text-[#C9A24A]" />
              </div>
              <div className="leading-tight">
                <div style={{ color: "#C9A24A", letterSpacing: "0.18em", fontSize: "0.82rem" }} className="font-bold">
                  TU TURNO
                </div>
                <div style={{ color: "#8E8E93", letterSpacing: "0.28em", fontSize: "0.58rem" }} className="font-medium">
                  BARBERÍA
                </div>
              </div>
            </div>
          </div>

          {/* Middle Quote */}
          <div className="relative z-10 my-auto py-6">
            <p className="text-white text-lg font-bold leading-snug tracking-wide">
              "El arte del estilo clásico, la <span className="text-gold-gradient">precisión moderna</span>."
            </p>
            <p className="text-[#8E8E93] text-xs mt-2">
              Accede a tu cuenta para gestionar tus turnos, historial de visitas y beneficios del Club VIP.
            </p>
          </div>

          {/* Bottom Floating Badge */}
          <div className="relative z-10 p-4 rounded-xl bg-black/75 backdrop-blur-xl border border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#C9A24A]/20 flex items-center justify-center text-[#C9A24A] flex-shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1 text-[#C9A24A] text-xs font-bold">
                <Star className="w-3 h-3 fill-[#C9A24A]" />
                <span>4.9 / 5.0 en Reseñas</span>
              </div>
              <p className="text-[0.65rem] text-[#8E8E93]">+3,500 clientes satisfechos</p>
            </div>
          </div>
        </div>

        {/* Right Side: Form Content (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center relative">
          {/* Mobile Back Button */}
          <div className="lg:hidden mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-[#8E8E93] hover:text-[#C9A24A] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver al inicio</span>
            </Link>
          </div>

          {children}
        </div>
      </motion.div>
    </div>
  );
}