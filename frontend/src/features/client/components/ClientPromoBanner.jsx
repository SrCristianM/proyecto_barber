import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  ShoppingBag,
  Share2,
  Copy,
  Check,
  Gift,
  Coffee,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Tag,
  Flame,
  Percent,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

const PROMOS = [
  {
    id: "grooming",
    tag: "Oferta del Mes",
    badgeColor: "from-amber-500/20 to-amber-600/10 text-amber-500 border-amber-500/30",
    icon: ShoppingBag,
    title: "Línea de Grooming & Cera Mate",
    subtitle: "25% OFF en productos de peinado y cuidado de barba",
    description:
      "Mantén el acabado impecable de barbería en tu rutina diaria. Aplica el cupón exclusivo en tu carrito o retíralo directamente en silla con tu barbero.",
    code: "GENTLEMAN25",
    discountText: "-25% DTO",
    ctaText: "Explorar Productos",
    ctaLink: "/portal/productos",
    ctaIcon: ShoppingBag,
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80",
    highlightTag: "⭐ Más Vendido"
  },
  {
    id: "referral",
    tag: "Programa de Referidos",
    badgeColor: "from-emerald-500/20 to-emerald-600/10 text-emerald-500 border-emerald-500/30",
    icon: Gift,
    title: "Invita a un Amigo y Gana un Corte",
    subtitle: "Tu amigo recibe $15.000 COP y tú ganas 1 servicio gratis",
    description:
      "Comparte tu código personal. Cuando tu recomendado complete su primera cita de corte o barba, recibirás un corte de cortesía en tu membresía VIP.",
    code: "TURNO-VIP92",
    discountText: "$15.000 REGALO",
    ctaText: "Compartir por WhatsApp",
    isWhatsApp: true,
    shareUrl: "https://wa.me/?text=" + encodeURIComponent("¡Ey bro! Te regalo $15.000 de descuento en tu primer corte en Tu Turno Barber Club usando mi código VIP: TURNO-VIP92. Agenda aquí: https://tuturnobarber.com/portal/agendar"),
    ctaIcon: Share2,
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&auto=format&fit=crop&q=80",
    highlightTag: "🤝 1 Amigo = 1 Corte"
  },
  {
    id: "lounge",
    tag: "Beneficio en Salón",
    badgeColor: "from-purple-500/20 to-purple-600/10 text-purple-500 border-purple-500/30",
    icon: Coffee,
    title: "Experiencia Barber Lounge VIP",
    subtitle: "Bebida de cortesía incluida en todas tus reservas",
    description:
      "Disfruta de café espresso de especialidad recién molido o cerveza artesanal helada mientras te relajas en nuestra sala de espera premium.",
    code: "EXPERIENCIA-VIP",
    discountText: "CORTESÍA 100%",
    ctaText: "Reservar mi Turno",
    ctaLink: "/portal/agendar",
    ctaIcon: ArrowRight,
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80",
    highlightTag: "☕ Café & Cerveza Free"
  }
];

export default function ClientPromoBanner() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();

  const activePromo = PROMOS[currentIdx];

  // Auto-rotar cada 7 segundos si el usuario no tiene el puntero encima
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % PROMOS.length);
      setCopiedCode(false);
    }, 7000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const handleCopyCode = useCallback((code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast.success(`¡Código ${code} copiado al portapapeles!`, {
      description: "Pégalo en tu compra de productos o menciónaselo a tu barbero."
    });
    setTimeout(() => setCopiedCode(false), 3000);
  }, []);

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % PROMOS.length);
    setCopiedCode(false);
  };

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev - 1 + PROMOS.length) % PROMOS.length);
    setCopiedCode(false);
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative rounded-3xl bg-card border border-border/80 p-5 sm:p-6 shadow-sm overflow-hidden flex flex-col justify-between transition-all hover:border-[#DFB755]/50 group"
    >
      {/* Resplandor ambiental de fondo */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#DFB755]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER: TÍTULO, BADGE PUBLICITARIO Y PESTAÑAS */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#DFB755]/15 text-[#DFB755] border border-[#DFB755]/25 shrink-0">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#DFB755]">
                Espacio Publicitario & Beneficios VIP
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Vigente
              </span>
            </div>
            <h3 className="text-sm font-black text-foreground">
              Promociones Exclusivas de Temporada
            </h3>
          </div>
        </div>

        {/* SELECTOR DE PROMOS EN PÍLDORAS */}
        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-2xl border border-border/60 self-start sm:self-auto">
          {PROMOS.map((p, idx) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setCurrentIdx(idx);
                setCopiedCode(false);
              }}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${
                currentIdx === idx
                  ? "bg-gradient-to-r from-[#E8C466] to-[#DDAE41] text-black shadow-xs font-black"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/60"
              }`}
            >
              {p.tag}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL ANIMADO */}
      <div className="relative z-10 py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePromo.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
          >
            {/* IMAGEN / BANNER VISUAL (4 columnas) */}
            <div className="md:col-span-4 relative rounded-2xl overflow-hidden aspect-[16/10] md:aspect-auto md:h-44 border border-border/80 shadow-inner group/img">
              <img
                src={activePromo.image}
                alt={activePromo.title}
                className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

              {/* Tag flotante */}
              <div className="absolute top-2.5 left-2.5">
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wide bg-black/75 text-[#DFB755] border border-[#DFB755]/40 backdrop-blur-md">
                  {activePromo.highlightTag}
                </span>
              </div>

              {/* Descuento destacado */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white">
                <span className="text-xs font-black tracking-tight text-amber-300 drop-shadow-md">
                  {activePromo.discountText}
                </span>
                <span className="text-[10px] font-bold text-neutral-300">
                  Código: {activePromo.code}
                </span>
              </div>
            </div>

            {/* DETALLES DE LA PROMOCIÓN & ACCIONES (8 columnas) */}
            <div className="md:col-span-8 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border bg-gradient-to-r ${activePromo.badgeColor}`}>
                    {activePromo.tag}
                  </span>
                  <span className="text-[11px] font-bold text-muted-foreground">
                    Exclusivo para miembros
                  </span>
                </div>

                <h4 className="text-base sm:text-lg font-black text-foreground mt-1">
                  {activePromo.title}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                  {activePromo.description}
                </p>
              </div>

              {/* CAJA DE CUPÓN Y BOTONES DE ACCIÓN */}
              <div className="pt-1 flex flex-wrap items-center gap-2.5">
                {/* Botón / Pastilla de Código */}
                <button
                  type="button"
                  onClick={() => handleCopyCode(activePromo.code)}
                  className="px-3 py-2 rounded-xl bg-muted/60 hover:bg-muted border border-dashed border-[#DFB755]/50 hover:border-[#DFB755] text-foreground text-xs font-black transition-all flex items-center gap-2 cursor-pointer group/btn"
                  title="Hacer clic para copiar código"
                >
                  <Tag className="w-3.5 h-3.5 text-[#DFB755]" />
                  <span className="tracking-wider">{activePromo.code}</span>
                  {copiedCode ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-muted-foreground group-hover/btn:text-foreground" />
                  )}
                </button>

                {/* Botón de Acción Principal */}
                {activePromo.isWhatsApp ? (
                  <a
                    href={activePromo.shareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-black shadow-xs hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{activePromo.ctaText}</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate(activePromo.ctaLink)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black text-xs font-black shadow-xs hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <activePromo.ctaIcon className="w-3.5 h-3.5" />
                    <span>{activePromo.ctaText}</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* FOOTER DEL BANNER: PUNTOS INDICADORES Y FLECHAS DE NAVEGACIÓN */}
      <div className="relative z-10 pt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          {PROMOS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setCurrentIdx(i);
                setCopiedCode(false);
              }}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                currentIdx === i
                  ? "w-6 bg-[#DFB755]"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
              }`}
              aria-label={`Ir a la promoción ${i + 1}`}
            />
          ))}
          <span className="text-[10px] text-muted-foreground ml-2 hidden sm:inline">
            Promoción {currentIdx + 1} de {PROMOS.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrev}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Promoción anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Promoción siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
