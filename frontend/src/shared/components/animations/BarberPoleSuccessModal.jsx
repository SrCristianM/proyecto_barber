import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import {
  Calendar,
  Clock,
  User,
  Scissors,
  CheckCircle2,
  X,
  Sparkles,
  QrCode
} from "lucide-react";
import { playBarberBellSound } from "../../utils/barberAudioEffects";

export default function BarberPoleSuccessModal({
  isOpen,
  onClose,
  appointmentData = null
}) {
  const [phase, setPhase] = useState("pole"); // 'pole' | 'ticket'

  useEffect(() => {
    // Garantizar siempre que el scroll del body esté 100% libre y desbloqueado
    document.body.style.overflow = "";

    if (isOpen) {
      setPhase("pole");

      // 1. Sonido de campana de barbería y confeti al 1.0s
      const timerSound = setTimeout(() => {
        playBarberBellSound();
        try {
          confetti({
            particleCount: 75,
            spread: 75,
            origin: { x: 0.5, y: 0.45 },
            colors: ["#DFB755", "#E8C466", "#DDAE41", "#FFFFFF"],
            scalar: 1.1,
            zIndex: 100010
          });
        } catch (e) {}
      }, 1000);

      // 2. Transición a Ticket Digital al 1.8s
      const timerTicket = setTimeout(() => {
        setPhase("ticket");
      }, 1800);

      return () => {
        document.body.style.overflow = "";
        clearTimeout(timerSound);
        clearTimeout(timerTicket);
      };
    }
  }, [isOpen]);

  // Si se desmonta, asegurar siempre que el scroll quede libre
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!isOpen || typeof document === "undefined") return null;

  const data = appointmentData || {
    id_cita: 104,
    cliente_nombre: "Cliente VIP",
    barbero_nombre: "Carlos Rodríguez",
    servicio_nombre: "Corte Clásico & Fade + Perfilado",
    fecha: "2026-10-24",
    hora: "10:30 AM",
    precio: 35000
  };

  const modalContent = (
    <AnimatePresence>
      {/* Telón sutil y luminoso: bg-black/15, sin oscurecer de golpe la pantalla */}
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/15 backdrop-blur-[2px] transition-all">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className={`relative w-full max-w-sm sm:max-w-md transition-all duration-300 text-center ${
            phase === "pole"
              ? "bg-transparent border-0 shadow-none p-4"
              : "rounded-3xl bg-card border border-border/40 shadow-2xl p-6"
          }`}
        >
          {/* Botón cerrar sólo visible en el ticket */}
          {phase === "ticket" && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer z-10"
              title="Cerrar comprobante"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* FASE 1: BARBER POLE GIRATORIO ORGÁNICO SIN BORDES NI RECUADRO PESADO */}
          {phase === "pole" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.75 }}
              transition={{ duration: 0.3 }}
              className="py-6 flex flex-col items-center justify-center relative"
            >
              {/* Halo de luz dorada suave */}
              <div
                className="absolute inset-0 w-64 h-64 mx-auto my-auto rounded-full pointer-events-none blur-3xl opacity-35"
                style={{
                  background:
                    "radial-gradient(circle, rgba(223, 183, 85, 0.5) 0%, transparent 70%)"
                }}
              />

              {/* Esfera superior del poste */}
              <div className="w-11 h-11 rounded-full bg-gradient-to-b from-[#FFF5C0] via-[#E8C466] to-[#9E731E] shadow-lg shadow-[#DFB755]/40 flex items-center justify-center -mb-2 z-10 border border-[#FFF5C0]/60">
                <Sparkles className="w-5 h-5 text-black" />
              </div>

              {/* Cilindro de luz con espirales rotatorias */}
              <div className="relative w-24 h-48 rounded-2xl overflow-hidden bg-black shadow-xl shadow-[#DFB755]/30 flex items-center justify-center border-2 border-[#E8C466]/80">
                <div
                  className="absolute inset-0 w-full h-[250%]"
                  style={{
                    background:
                      "repeating-linear-gradient(45deg, #DFB755 0px, #DFB755 20px, #FFFFFF 20px, #FFFFFF 40px, #18181B 40px, #18181B 60px)",
                    animation: "barberPoleSpin 1.8s linear infinite"
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-black/50 pointer-events-none" />
              </div>

              {/* Base inferior del poste */}
              <div className="w-14 h-4 rounded-b-xl bg-gradient-to-b from-[#E8C466] to-[#8C6415] shadow-md -mt-1 border border-[#FFF5C0]/40" />

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md text-[#FFF2B2] text-xs font-black shadow-lg border border-white/10"
              >
                <Sparkles className="w-4 h-4 text-[#DFB755] animate-pulse" />
                <span>Confirmando tu Turno de Barbería...</span>
              </motion.div>
            </motion.div>
          )}

          {/* FASE 2: TICKET DIGITAL LIMPIO (SIN RECUADROS INTERNOS OSCUROS) */}
          {phase === "ticket" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              className="space-y-4"
            >
              {/* Badge de confirmación */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-500 text-xs font-black">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>¡CITA CONFIRMADA EXITOSAMENTE!</span>
              </div>

              <h3 className="text-xl font-black text-foreground">
                Tu Turno en el Sillón
              </h3>

              {/* Contenedor del Ticket limpio sobre el fondo blanco/card nativo */}
              <div className="p-3 text-left space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                      Servicio Seleccionado
                    </span>
                    <h4 className="text-sm font-black text-[#DFB755] flex items-center gap-1.5 mt-0.5">
                      <Scissors className="w-3.5 h-3.5" />
                      {data.servicio_nombre}
                    </h4>
                  </div>
                  <div className="p-2 rounded-xl bg-muted/60 text-muted-foreground shrink-0 shadow-xs">
                    <QrCode className="w-5 h-5 text-foreground" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                  <div>
                    <span className="text-[10px] text-muted-foreground block flex items-center gap-1">
                      <User className="w-3 h-3 text-[#DFB755]" /> Barbero:
                    </span>
                    <span className="font-bold text-foreground truncate block">
                      {data.barbero_nombre}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-muted-foreground block flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#DFB755]" /> Fecha y Hora:
                    </span>
                    <span className="font-bold text-foreground block">
                      {data.fecha} • {data.hora}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">Valor del Servicio:</span>
                  <span className="text-base font-black text-foreground">
                    ${Number(data.precio || 0).toLocaleString("es-CO")}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black font-black text-xs shadow-md shadow-[#DDAE41]/25 transition-all cursor-pointer"
              >
                Listo, Entendido
              </button>
            </motion.div>
          )}

          <style>{`
            @keyframes barberPoleSpin {
              0% { transform: translateY(0); }
              100% { transform: translateY(-50%); }
            }
          `}</style>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
