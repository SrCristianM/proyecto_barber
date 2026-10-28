import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { Scissors, ArrowLeft, Star, Award, ShieldCheck, Sparkles, Activity } from "lucide-react";
import { ImageWithFallback } from "../../landing/components/figma/ImageWithFallback";
import BarberScissorsIcon from "../../../shared/ui/BarberScissorsIcon";

const AUTH_BG_IMG = "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200";

export default function AuthCard({ children, wide = false }) {
  // 1. Seguimiento del cursor en toda la ventana para iluminación ambiental fluida
  const [windowMouse, setWindowMouse] = useState({ x: 600, y: 400 });
  const [cardMouse, setCardMouse] = useState({ x: 300, y: 250 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      setWindowMouse({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleGlobalMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleGlobalMouseMove);
  }, []);

  const handleCardMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCardMouse({ x, y });
    setIsHovered(true);

    // Inclinación 3D sutil (máximo +-2.5 grados para ultra elegancia)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = -((y - centerY) / centerY) * 2.5;
    const rotateY = ((x - centerX) / centerX) * 2.5;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleCardMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden selection:bg-[#C9A24A] selection:text-black">
      {/* ============================================================== */}
      {/* 1. SPOTLIGHT DINÁMICO ULTRA-VIBRANTE CON EL CURSOR (VIEWPORT) */}
      {/* ============================================================== */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(850px circle at ${windowMouse.x}px ${windowMouse.y}px, rgba(201, 162, 74, 0.16), transparent 75%)`,
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-500"
        style={{
          background: `radial-gradient(350px circle at ${windowMouse.x}px ${windowMouse.y}px, rgba(232, 196, 102, 0.09), transparent 60%)`,
        }}
      />

      {/* Orbes de luz ambiental dorada en suave movimiento senoidal */}
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.15, 0.32, 0.15],
          x: [0, 30, -25, 0],
          y: [0, -30, 25, 0],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="ambient-glow-gold w-[650px] h-[650px] -top-36 -left-36 fixed pointer-events-none blur-[130px]"
      />
      <motion.div
        animate={{
          scale: [1.2, 0.95, 1.2],
          opacity: [0.12, 0.28, 0.12],
          x: [0, -35, 30, 0],
          y: [0, 35, -30, 0],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="ambient-glow-gold w-[650px] h-[650px] -bottom-36 -right-36 fixed pointer-events-none blur-[130px]"
      />

      {/* Partículas de destellos dorados en suspensión continua */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: ["105vh", "-10vh"],
              x: [0, (i % 2 === 0 ? 20 : -20), 0],
              opacity: [0, 0.7, 0],
              scale: [0.7, 1.3, 0.7],
            }}
            transition={{
              duration: 9 + i * 2.5,
              repeat: Infinity,
              delay: i * 1.8,
              ease: "linear",
            }}
            className="absolute rounded-full bg-gradient-to-t from-[#C9A24A] to-[#FFE082] blur-[0.8px]"
            style={{
              left: `${10 + i * 11}%`,
              width: `${3 + (i % 3)}px`,
              height: `${3 + (i % 3)}px`,
            }}
          />
        ))}

        {/* Siluetas de tijeras barber orbitando en el fondo con micro-rotación */}
        <motion.div
          animate={{
            y: [0, -25, 0],
            rotate: [0, 15, 0],
            opacity: [0.03, 0.08, 0.03],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-12 text-[#C9A24A] pointer-events-none"
        >
          <Scissors className="w-20 h-20" />
        </motion.div>
        <motion.div
          animate={{
            y: [0, 30, 0],
            rotate: [0, -18, 0],
            opacity: [0.03, 0.07, 0.03],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/4 right-12 text-[#C9A24A] pointer-events-none"
        >
          <BarberScissorsIcon className="w-24 h-24" />
        </motion.div>
      </div>

      {/* ============================================================== */}
      {/* CONTENEDOR PRINCIPAL CON EFECTO 3D TILT Y SPOTLIGHT DIRECTO   */}
      {/* ============================================================== */}
      <motion.div
        ref={cardRef}
        onMouseMove={handleCardMouseMove}
        onMouseLeave={handleCardMouseLeave}
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
          rotateX: tilt.x,
          rotateY: tilt.y,
        }}
        transition={{
          opacity: { duration: 0.5 },
          scale: { duration: 0.5 },
          y: { duration: 0.5 },
          rotateX: { type: "spring", stiffness: 220, damping: 22 },
          rotateY: { type: "spring", stiffness: 220, damping: 22 },
        }}
        style={{ transformStyle: "preserve-3d" }}
        className={`w-full ${wide ? "max-w-5xl" : "max-w-4xl"
          } rounded-3xl overflow-hidden bg-[#121212]/92 backdrop-blur-2xl border border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.95)] grid grid-cols-1 lg:grid-cols-12 relative z-10 group`}
      >
        {/* ============================================================== */}
        {/* 2. SPOTLIGHT SOBRE LA SUPERFICIE DE LA TARJETA (AL CURSOR)     */}
        {/* ============================================================== */}
        <div
          className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-200 rounded-3xl overflow-hidden"
          style={{
            background: `radial-gradient(420px circle at ${cardMouse.x}px ${cardMouse.y}px, rgba(232, 196, 102, 0.14), transparent 65%)`,
            opacity: isHovered ? 1 : 0.4,
          }}
        />

        {/* Borde láser perimetral con suave giro continuo a 360° */}
        <div className="absolute inset-0 rounded-3xl pointer-events-none overflow-hidden z-0">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 14, ease: "linear" }}
            className="absolute -inset-[150%] bg-[conic-gradient(from_0deg,transparent_0_310deg,rgba(201,162,74,0.45)_360deg)] pointer-events-none opacity-45"
          />
        </div>

        {/* Panel Izquierdo: Atmósfera Cinematográfica (5 columnas) */}
        <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-8 overflow-hidden bg-black z-10">
          {/* Foto con paneo lento continuo */}
          <motion.div
            animate={{ scale: [1, 1.07, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            <ImageWithFallback
              src={AUTH_BG_IMG}
              alt="Interior y estilo de barbería Tu Turno"
              className="w-full h-full object-cover"
              style={{ filter: "brightness(0.35) contrast(1.15)" }}
            />
          </motion.div>

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30 pointer-events-none" />

          {/* Enlace superior a la página principal */}
          <div className="relative z-10">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-xs text-[#B5B5B5] hover:text-[#C9A24A] hover:border-[#C9A24A]/50 transition-all duration-300 group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              <span>Volver a la página principal</span>
            </Link>

            <div className="flex items-center gap-3 mt-8">
              <motion.div
                animate={{ rotate: [0, 4, -4, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative overflow-hidden rounded-xl border border-[#C9A24A]/35 bg-black/70 p-0.5 shadow-md shadow-[#C9A24A]/10 shrink-0"
              >
                <img
                  src="/logo.png"
                  alt="Tu Turno Barber"
                  className="h-10 w-auto object-contain"
                />
              </motion.div>
              <div className="leading-tight">
                <div style={{ color: "#C9A24A", letterSpacing: "0.18em", fontSize: "0.85rem" }} className="font-bold">
                  TU TURNO
                </div>
                <div style={{ color: "#8E8E93", letterSpacing: "0.28em", fontSize: "0.58rem" }} className="font-medium">
                  BARBERÍA
                </div>
              </div>
            </div>
          </div>

          {/* Frase central */}
          <div className="relative z-10 my-auto py-6">
            <motion.p
              animate={{ opacity: [0.92, 1, 0.92] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="text-white text-lg font-bold leading-snug tracking-wide"
            >
              "El arte del estilo clásico, la <span className="text-gold-gradient">precisión moderna</span>."
            </motion.p>
            <p className="text-[#8E8E93] text-xs mt-2">
              Accede a tu cuenta para gestionar tus turnos, historial de visitas y beneficios del Club VIP.
            </p>
          </div>

          {/* Badge inferior flotante con micro-levitación y estado de conexión */}
          <div className="relative z-10 space-y-2">
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="p-3.5 rounded-xl bg-black/75 backdrop-blur-xl border border-white/10 flex items-center gap-3 shadow-lg"
            >
              <div className="w-8 h-8 rounded-lg bg-[#C9A24A]/20 flex items-center justify-center text-[#C9A24A] shrink-0">
                <Award className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="flex items-center gap-1 text-[#C9A24A] text-xs font-bold">
                  <Star className="w-3 h-3 fill-[#C9A24A]" />
                  <span>4.9 / 5.0 en Reseñas</span>
                </div>
                <p className="text-[0.62rem] text-[#8E8E93]">+3,500 citas atendidas</p>
              </div>
            </motion.div>

            {/* Pill indicador de sistema conectado */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 border border-white/5 text-[0.65rem] text-[#8E8E93]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Servidor & Base de Datos Conectados</span>
            </div>
          </div>
        </div>

        {/* Panel Derecho: Contenido del Formulario (7 columnas) */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center relative z-20 bg-[#121212]/95">
          {/* Botón de regreso móvil */}
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
