import { motion } from "motion/react";

export default function AuthButton({ children, loading = false, disabled = false }) {
  return (
    <motion.button
      type="submit"
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      style={{
        backgroundColor: "#C9A24A",
        color: "#0D0D0D",
        letterSpacing: "0.1em",
      }}
      className="relative group overflow-hidden w-full py-3.5 px-6 rounded-xl font-black text-xs sm:text-sm tracking-wider shadow-[0_0_25px_rgba(201,162,74,0.35)] hover:shadow-[0_0_35px_rgba(201,162,74,0.6)] transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {/* Shimmer light sweep */}
      <span className="absolute inset-0 w-1/2 h-full bg-white/25 transform -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-700 ease-out pointer-events-none" />

      <span className="relative z-10 font-black">{children}</span>
    </motion.button>
  );
}