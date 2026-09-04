import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router";
import { Scissors, Clock, Check, ChevronRight, Crown } from "lucide-react";

const CATEGORIES = [
  { id: "all", label: "TODOS" },
  { id: "hair", label: "CORTE DE CABELLO" },
  { id: "beard", label: "BARBA Y AFEITADO" },
  { id: "vip", label: "COMBOS & VIP" },
];

const SERVICES = [
  {
    id: 1,
    category: "hair",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.5l3 3-3 3M16.5 3.5l-3 3 3 3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 20h18" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v5" />
      </svg>
    ),
    title: "CORTE TRADICIONAL & FADE",
    price: "$25.000",
    duration: "40 min",
    badge: "MÁS POPULAR",
    desc: "Cortes modernos degradados (Skin Fade, Taper, Low Fade) o clásicos adaptados a tu estilo.",
    features: ["Asesoramiento de visagismo", "Lavado con shampoo premium", "Peinado con cera mate o pomada"],
  },
  {
    id: 2,
    category: "beard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8 2 5 5.5 5 9c0 2.5 1 4.5 3 6l1 5h6l1-5c2-1.5 3-3.5 3-6 0-3.5-3-7-7-7z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15h6" />
      </svg>
    ),
    title: "PERFILADO Y RITUAL DE BARBA",
    price: "$18.000",
    duration: "30 min",
    badge: null,
    desc: "Definición milimétrica con navaja clásica, toalla caliente y aceites esenciales hidratantes.",
    features: ["Vapor ozonizado y toalla caliente", "Perfilado a navaja descartable", "Bálsamo nutritivo aromático"],
  },
  {
    id: 3,
    category: "vip",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8">
        <rect x="3" y="6" width="18" height="3" rx="1" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 9v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 9V6a4 4 0 0 1 8 0v3" />
      </svg>
    ),
    title: "COMBO COMPLETO VIP TU TURNO",
    price: "$38.000",
    duration: "65 min",
    badge: "EXPERIENCIA TOTAL",
    desc: "La experiencia definitiva: Corte de autor + Arreglo de barba completo + Masaje capilar.",
    features: ["Corte personalizado completo", "Ritual de barba con toalla caliente", "Bebida de cortesía + Exfoliación"],
  },
  {
    id: 4,
    category: "hair",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15M14.25 3.104c.251.023.501.05.75.082M19.8 15a2.25 2.25 0 0 1 0 3.182M4.2 15a2.25 2.25 0 0 0 0 3.182" />
      </svg>
    ),
    title: "TRATAMIENTO CAPILAR & MASCARILLA",
    price: "$22.000",
    duration: "35 min",
    badge: null,
    desc: "Recuperación intensiva, hidratación profunda y limpieza de impurezas con carbón activado.",
    features: ["Exfoliación suave de cuero cabelludo", "Mascarilla hidratante profunda", "Masaje estimulante relajante"],
  },
];

export default function Services() {
  const [activeTab, setActiveTab] = useState("all");

  const filteredServices =
    activeTab === "all"
      ? SERVICES
      : SERVICES.filter((service) => service.category === activeTab);

  return (
    <section id="servicios" className="py-24 bg-[#0A0A0A] relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="ambient-glow-gold w-[450px] h-[450px] top-1/3 -left-32 opacity-25" />
      <div className="ambient-glow-gold w-[500px] h-[500px] bottom-10 -right-32 opacity-20" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-[2px] bg-[#C9A24A]" />
              <span className="text-[#C9A24A] text-xs font-bold tracking-[0.25em] uppercase">
                CATÁLOGO DE SERVICIOS
              </span>
            </div>
            <h2 className="text-white text-3xl sm:text-4xl font-extrabold tracking-tight">
              Estilo, precisión y <span className="text-gold-gradient">excelencia</span>
            </h2>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-2 p-1.5 bg-[#141414] rounded-xl border border-white/5">
            {CATEGORIES.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2 text-xs font-bold tracking-wider rounded-lg transition-all duration-300 ${
                  activeTab === tab.id
                    ? "text-[#0D0D0D] font-extrabold shadow-md"
                    : "text-[#8E8E93] hover:text-white hover:bg-white/5"
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="service-tab-pill"
                    className="absolute inset-0 bg-[#C9A24A] rounded-lg"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredServices.map((s) => (
              <motion.div
                key={s.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                whileHover={{ y: -8 }}
                className="group relative bg-[#131313] hover:bg-[#181818] border border-white/10 hover:border-[#C9A24A]/60 rounded-2xl p-7 flex flex-col justify-between transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_40px_rgba(201,162,74,0.18)]"
              >
                {/* Gold Top Light Bar */}
                <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-[#C9A24A] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div>
                  {/* Top row: Icon & Badge / Duration */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-14 h-14 rounded-xl bg-[#C9A24A]/10 border border-[#C9A24A]/30 flex items-center justify-center text-[#C9A24A] group-hover:bg-[#C9A24A] group-hover:text-black group-hover:scale-110 transition-all duration-300">
                      {s.icon}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {s.badge && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#C9A24A]/20 border border-[#C9A24A]/50 text-[#C9A24A] text-[0.62rem] font-black tracking-widest uppercase">
                          {s.badge}
                        </span>
                      )}
                      <div className="flex items-center gap-1 text-[0.72rem] text-[#8E8E93] font-medium">
                        <Clock className="w-3.5 h-3.5 text-[#C9A24A]" />
                        <span>{s.duration}</span>
                      </div>
                    </div>
                  </div>

                  {/* Title & Price */}
                  <h3 className="text-white text-base font-bold tracking-wider mb-2 group-hover:text-[#D4AF37] transition-colors">
                    {s.title}
                  </h3>
                  
                  <div className="text-xl font-extrabold text-[#C9A24A] mb-3">
                    {s.price}
                  </div>

                  <p className="text-[#999999] text-xs leading-relaxed mb-6">
                    {s.desc}
                  </p>

                  {/* Features checklist */}
                  <ul className="space-y-2 mb-6 border-t border-white/5 pt-4">
                    {s.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[0.75rem] text-[#B5B5B5]">
                        <Check className="w-3.5 h-3.5 text-[#C9A24A] flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Direct Action Button */}
                <Link
                  to="/login"
                  className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-[#C9A24A] text-white hover:text-black border border-white/10 hover:border-[#C9A24A] font-bold text-xs tracking-wider flex items-center justify-center gap-2 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(201,162,74,0.3)]"
                >
                  <span>AGENDAR ESTE SERVICIO</span>
                  <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Bottom Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-14 p-6 rounded-2xl bg-gradient-to-r from-[#181818] via-[#1F1B12] to-[#181818] border border-[#C9A24A]/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_15px_35px_rgba(0,0,0,0.6)]"
        >
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-xl bg-[#C9A24A]/20 border border-[#C9A24A] flex items-center justify-center flex-shrink-0">
              <Crown className="w-6 h-6 text-[#C9A24A]" />
            </div>
            <div>
              <h4 className="text-white font-bold text-base">¿Tienes un evento especial o requerimiento personalizado?</h4>
              <p className="text-[#8E8E93] text-xs mt-0.5">Ofrecemos paquetes para novios, eventos empresariales y atención personalizada.</p>
            </div>
          </div>

          <Link
            to="/login"
            className="flex-shrink-0 px-6 py-3 rounded-lg bg-[#C9A24A] text-[#0D0D0D] font-bold text-xs tracking-wider hover:bg-[#E0B85C] transition-colors shadow-[0_0_20px_rgba(201,162,74,0.3)]"
          >
            CONSULTAR SERVICIOS VIP
          </Link>
        </motion.div>
      </div>
    </section>
  );
}