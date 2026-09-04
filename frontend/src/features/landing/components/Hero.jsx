import { useState, useRef } from "react";
import { Link } from "react-router";
import { Scissors, ChevronRight, Star, Clock, Users, Award, ArrowDown } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const HERO_IMG = "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

export default function Hero() {
  const cardRef = useRef(null);

  // 3D Parallax Tilt effect using Motion Springs
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [7, -7]), { stiffness: 200, damping: 25 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-7, 7]), { stiffness: 200, damping: 25 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.14,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.25, 1, 0.5, 1] },
    },
  };

  return (
    <section className="pt-24 lg:pt-28 min-h-screen flex flex-col justify-center relative overflow-hidden bg-[#0D0D0D]">
      {/* Ambient background glows */}
      <div
        className="ambient-glow-gold w-[500px] h-[500px] -top-32 -left-32"
        style={{ opacity: 0.5 }}
      />
      <div
        className="ambient-glow-gold w-[600px] h-[600px] top-1/4 -right-40"
        style={{ opacity: 0.35 }}
      />

      {/* Subtle Background Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(#C9A24A 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full py-12 lg:py-16 relative z-10">

        {/* Left column: Text & CTA */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-7 order-2 lg:order-1 flex flex-col justify-center"
        >
          {/* Live Status Badge */}
          <motion.div variants={itemVariants} className="inline-flex items-center gap-3 mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181818] border border-[#C9A24A]/30 shadow-[0_0_15px_rgba(201,162,74,0.12)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[0.68rem] tracking-[0.2em] font-semibold text-[#D4AF37] uppercase">
                MÁS QUE UN CORTE • ABIERTO HOY
              </span>
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1 variants={itemVariants} className="leading-[1.08] tracking-tight">
            <span
              className="block text-white"
              style={{
                fontSize: "clamp(2.4rem, 5vw, 4.2rem)",
                fontWeight: 900,
                letterSpacing: "-0.02em",
              }}
            >
              UNA EXPERIENCIA
            </span>
            <span
              className="block text-gold-gradient"
              style={{
                fontSize: "clamp(2.4rem, 5vw, 4.2rem)",
                fontWeight: 900,
                letterSpacing: "-0.02em",
                textShadow: "0 0 35px rgba(201,162,74,0.3)",
              }}
            >
              A TU ESTILO
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="mt-6 mb-8 text-[#A6A6A6] text-sm sm:text-base leading-relaxed max-w-lg font-normal"
          >
            En <span className="text-white font-medium">Tu Turno Barbería</span> combinamos pasión, precisión clásica y técnicas de vanguardia para ofrecerte un servicio de primer nivel. Tu presencia merece nuestra maestría.
          </motion.p>

          {/* CTA Button and Live Turn Info */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-5 mb-10">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/login"
                style={{
                  backgroundColor: "#C9A24A",
                  color: "#0D0D0D",
                  letterSpacing: "0.12em",
                }}
                className="relative group overflow-hidden inline-flex items-center gap-3 px-8 py-4 font-black text-xs sm:text-sm tracking-wider shadow-[0_0_25px_rgba(201,162,74,0.35)] hover:shadow-[0_0_35px_rgba(201,162,74,0.6)] transition-all duration-300"
              >
                {/* Button shine animation */}
                <span className="absolute inset-0 w-1/2 h-full bg-white/25 transform -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-700 ease-out" />

                <span className="relative z-10 flex items-center gap-2">
                  RESERVAR CITA
                  <ChevronRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Link>
            </motion.div>

            <div className="flex items-center gap-2.5 text-xs text-[#8E8E93] bg-[#141414]/70 px-4 py-3 rounded-lg border border-white/5">
              <Clock className="w-4 h-4 text-[#C9A24A]" />
              <span>Turnos desde <b>Hoy 15:00</b></span>
            </div>
          </motion.div>

          {/* Social Proof / Stats Grid */}
          <motion.div
            variants={itemVariants}
            className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 max-w-lg"
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-1 text-white font-extrabold text-lg sm:text-xl">
                <span>4.9</span>
                <Star className="w-4 h-4 fill-[#C9A24A] text-[#C9A24A]" />
              </div>
              <span className="text-[#7A7A7A] text-[0.72rem] tracking-wider uppercase font-medium">
                +500 Reseñas
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-white font-extrabold text-lg sm:text-xl">
                +3,500
              </span>
              <span className="text-[#7A7A7A] text-[0.72rem] tracking-wider uppercase font-medium">
                Cortes Listos
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-white font-extrabold text-lg sm:text-xl">
                5+
              </span>
              <span className="text-[#7A7A7A] text-[0.72rem] tracking-wider uppercase font-medium">
                Barberos Top
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right column: Image with 3D Parallax & Floating Elements */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.25, 1, 0.5, 1] }}
          className="lg:col-span-5 order-1 lg:order-2 relative"
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ perspective: 1200 }}
        >
          <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="relative h-[420px] sm:h-[500px] lg:h-[560px] w-full rounded-2xl overflow-visible transition-transform duration-200 ease-out"
          >
            {/* Image Container with Gold Border Accent */}
            <div className="relative w-full h-full rounded-xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.9)] border border-white/10 group">
              <ImageWithFallback
                src={HERO_IMG}
                alt="Barbero profesional realizando un corte premium"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                style={{ filter: "brightness(0.85) contrast(1.08)" }}
              />

              {/* Gradient Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

              {/* Decorative Gold Top Accent Line */}
              <div
                style={{
                  backgroundColor: "#C9A24A",
                  top: 0,
                  right: 0,
                  width: "4px",
                  height: "65%",
                }}
                className="absolute shadow-[0_0_12px_#C9A24A]"
              />
            </div>

            {/* Floating Gold Scissors Icon Box */}
            <motion.div
              style={{
                backgroundColor: "#C9A24A",
                transform: "translateZ(50px)",
              }}
              whileHover={{ scale: 1.1, rotate: 6 }}
              className="absolute -bottom-6 -left-4 sm:-left-6 hidden sm:flex w-20 h-20 lg:w-24 lg:h-24 items-center justify-center rounded-xl shadow-[0_15px_35px_rgba(201,162,74,0.45)] cursor-pointer group animate-float-slow z-20"
            >
              <Scissors className="w-9 h-9 lg:w-10 lg:h-10 text-black group-hover:rotate-45 transition-transform duration-300" />
            </motion.div>

            {/* Floating Glassmorphism Social Proof Card */}
            <motion.div
              style={{ transform: "translateZ(40px)" }}
              className="absolute top-8 -right-4 sm:-right-6 glass-gold-card p-3.5 sm:p-4 rounded-xl flex items-center gap-3 z-20 animate-float-reverse shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
            >
              <div className="w-10 h-10 rounded-full bg-[#C9A24A]/20 border border-[#C9A24A] flex items-center justify-center">
                <Award className="w-5 h-5 text-[#C9A24A]" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1 text-[#C9A24A] font-bold text-xs">
                  <Star className="w-3.5 h-3.5 fill-[#C9A24A]" />
                  <Star className="w-3.5 h-3.5 fill-[#C9A24A]" />
                  <Star className="w-3.5 h-3.5 fill-[#C9A24A]" />
                  <Star className="w-3.5 h-3.5 fill-[#C9A24A]" />
                  <Star className="w-3.5 h-3.5 fill-[#C9A24A]" />
                </div>
                <p className="text-white text-[0.76rem] font-semibold mt-0.5">
                  Calidad 5 Estrellas
                </p>
                <p className="text-[#8E8E93] text-[0.65rem]">
                  Garantía de Satisfacción
                </p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Down Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="w-full flex flex-col items-center justify-center pb-6 z-10"
      >
        <a
          href="#servicios"
          className="flex flex-col items-center gap-2 text-[#7A7A7A] hover:text-[#C9A24A] transition-colors group cursor-pointer"
        >
          <span className="text-[0.65rem] tracking-[0.25em] uppercase font-semibold">
            Descubrir Servicios
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1 group-hover:border-[#C9A24A]"
          >
            <div className="w-1 h-2 rounded-full bg-[#C9A24A]" />
          </motion.div>
        </a>
      </motion.div>
    </section>
  );
}