import { Scissors } from "lucide-react";
import { motion } from "motion/react";

export default function AuthHeader({ subtitle }) {
  return (
    <div className="flex flex-col items-center text-center mb-8">
      {/* Animated Scissors Icon */}
      <motion.div
        whileHover={{ rotate: 25, scale: 1.1 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        className="w-12 h-12 rounded-2xl bg-[#C9A24A]/10 border border-[#C9A24A]/30 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(201,162,74,0.15)] cursor-pointer"
      >
        <Scissors className="w-6 h-6 text-[#C9A24A]" />
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