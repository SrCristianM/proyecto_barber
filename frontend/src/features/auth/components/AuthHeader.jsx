import { Scissors } from "lucide-react";
import { motion } from "motion/react";

export default function AuthHeader({ subtitle }) {
  return (
    <div className="flex flex-col items-center text-center mb-8">
      {/* Animated Brand Logo */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        className="relative overflow-hidden rounded-2xl border border-[#C9A24A]/35 bg-black/70 p-1 mb-4 shadow-[0_0_25px_rgba(201,162,74,0.2)] cursor-pointer"
      >
        <img
          src="/logo.png"
          alt="Tu Turno Barber"
          className="h-16 w-auto object-contain"
        />
      </motion.div>

      <h1 className="text-2xl font-black tracking-tight text-white mb-1">
        Tu Turno <span className="text-gold-gradient">Barbería</span>
      </h1>
      
      <p className="text-xs sm:text-sm text-[#8E8E93] font-normal">
        {subtitle}
      </p>
    </div>
  );
}