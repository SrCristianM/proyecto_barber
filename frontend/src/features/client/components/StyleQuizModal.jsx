import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ArrowRight, CheckCircle2, RotateCcw, Scissors, UserCheck, Award } from "lucide-react";
import Modal from "../../admin/shared/components/Modal";
import ClientImage from "./ClientImage";
import { useNavigate } from "react-router";

const QUIZ_STEPS = [
  {
    id: "face",
    title: "¿Cuál es la forma de tu rostro?",
    subtitle: "Esto nos permite equilibrar proporciones y resaltar tus mejores rasgos.",
    options: [
      { id: "oval", label: "Ovalado", desc: "Proporciones equilibradas, apto para la mayoría de estilos." },
      { id: "square", label: "Cuadrado", desc: "Mandíbula marcada y frente ancha, ideal para laterales bajos y volumen." },
      { id: "diamond", label: "Diamante / Alargado", desc: "Pómulos prominentes, favorable para texturas medias." },
      { id: "round", label: "Redondo", desc: "Mejillas suaves, perfecto para fades altos que estilicen el perfil." }
    ]
  },
  {
    id: "hair",
    title: "¿Cómo describirías tu tipo de cabello?",
    subtitle: "Cada textura requiere técnicas de tijera y navaja específicas.",
    options: [
      { id: "straight", label: "Lacio / Grueso", desc: "Fácil de peinar hacia atrás o a los lados con pomada." },
      { id: "wavy", label: "Ondulado con Textura", desc: "Excelente para estilos despeinados con cera mate." },
      { id: "curly", label: "Rizado / Con volumen", desc: "Ideal para cortes degradados (Fade) con control superior." },
      { id: "fine", label: "Fino o con Entradas", desc: "Favorece cortes cortos texturizados (French Crop) para densidad." }
    ]
  },
  {
    id: "vibe",
    title: "¿Qué estilo o vibra estás buscando?",
    subtitle: "El toque final que mejor representa tu personalidad.",
    options: [
      { id: "executive", label: "Ejecutivo Elegante", desc: "Línea lateral limpia, sobriedad y porte corporativo." },
      { id: "urban", label: "Urbano & Skin Fade", desc: "Degradado a piel limpia, moderno, atrevido y marcado." },
      { id: "beard", label: "Barba Protagonista", desc: "Afeitado clásico a navaja libre con hidratación profunda." },
      { id: "vip", label: "Experiencia Completa VIP", desc: "Corte, diseño de barba y mascarilla purificante." }
    ]
  }
];

const RECOMMENDATIONS = {
  executive: {
    title: "Executive Side Part & Low Fade",
    servicioId: 1,
    barberoNombre: "Carlos Rodríguez",
    categoria: "Corte",
    imagen: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=600&auto=format&fit=crop&q=80",
    desc: "Un clásico atemporal pulido a máquina y tijera con raya lateral definida. Ideal para proyectar confianza, elegancia y profesionalismo.",
    tips: ["Aplica pomada con fijación media y brillo moderado.", "Retoque cada 2 a 3 semanas para conservar la línea perfecta."]
  },
  urban: {
    title: "Mid Skin Fade Texturizado",
    servicioId: 1,
    barberoNombre: "Miguel Ángel",
    categoria: "Corte",
    imagen: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&auto=format&fit=crop&q=80",
    desc: "Degradado quirúrgico a piel en los laterales con capas texturizadas arriba. El estilo más solicitado por su versatilidad y frescura.",
    tips: ["Usa polvo voluminizador o cera mate para textura natural.", "Excelente para climas cálidos y estilos informales."]
  },
  beard: {
    title: "Barba Esculpida & Toalla Caliente Spa",
    servicioId: 2,
    barberoNombre: "Javier Torres",
    categoria: "Barba",
    imagen: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80",
    desc: "Perfilado milimétrico con navaja libre, exfoliación térmica y aceites esenciales que hidratan y fortalecen el vello facial.",
    tips: ["Peina diariamente con cepillo de cerdas de jabalí.", "Aplica 3 gotas de aceite para barba después de la ducha."]
  },
  vip: {
    title: "Combo VIP: Fade + Barba + Mascarilla",
    servicioId: 1,
    paqueteId: 1,
    barberoNombre: "Carlos Rodríguez",
    categoria: "Combos",
    imagen: "https://images.unsplash.com/photo-1517832606589-7629c3395909?w=600&auto=format&fit=crop&q=80",
    desc: "La experiencia completa de barbería tradicional: transformación de cabello y barba con tratamiento purificante facial.",
    tips: ["Permite 60 minutos de desconexión y relajación.", "Incluye bebida prémium de cortesía."]
  }
};

export default function StyleQuizModal({ onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({ face: null, hair: null, vibe: null });
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const handleSelectOption = (key, value) => {
    const updated = { ...answers, [key]: value };
    setAnswers(updated);

    if (currentStep < QUIZ_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Calcular recomendación
      const vibe = updated.vibe || "urban";
      setResult(RECOMMENDATIONS[vibe] || RECOMMENDATIONS.urban);
    }
  };

  const handleRestart = () => {
    setAnswers({ face: null, hair: null, vibe: null });
    setCurrentStep(0);
    setResult(null);
  };

  const handleBookLook = () => {
    if (!result) return;
    onClose();
    const query = new URLSearchParams({
      servicio: result.servicioId,
      look: result.title,
      barberoRecomendado: result.barberoNombre
    });
    navigate(`/portal/agendar?${query.toString()}`);
  };

  const stepData = QUIZ_STEPS[currentStep];

  return (
    <Modal
      title="Asistente de Estilo Personalizado"
      onClose={onClose}
      maxWidthClass="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Cabecera con indicador de progreso */}
        {!result && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold uppercase tracking-wider text-[#DFB755]">
                Paso {currentStep + 1} de {QUIZ_STEPS.length}
              </span>
              <span className="text-muted-foreground font-semibold">
                {Math.round(((currentStep + 1) / QUIZ_STEPS.length) * 100)}% Completado
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#E8C466] to-[#DDAE41]"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / QUIZ_STEPS.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* PANTALLA DE PREGUNTAS */}
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key={stepData.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-lg sm:text-xl font-black text-foreground">
                  {stepData.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {stepData.subtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {stepData.options.map((opt) => {
                  const isSelected = answers[stepData.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(stepData.id, opt.id)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer group ${
                        isSelected
                          ? "bg-[#DFB755]/15 border-[#DFB755] ring-2 ring-[#DFB755]/30 shadow-md"
                          : "bg-card border-border hover:border-[#DFB755]/50 hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-foreground group-hover:text-[#DFB755] transition-colors">
                          {opt.label}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#DFB755]" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                        {opt.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            /* PANTALLA DE RESULTADO */
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
              className="space-y-5"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tu Match de Estilo Perfecto</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                {/* Imagen del look */}
                <div className="md:col-span-5 h-56 rounded-2xl overflow-hidden bg-muted relative shadow-md">
                  <ClientImage
                    src={result.imagen}
                    alt={result.title}
                    type="service"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase bg-[#DFB755] text-black">
                    {result.categoria}
                  </div>
                </div>

                {/* Detalles y Barbero Recomendado */}
                <div className="md:col-span-7 space-y-3">
                  <h3 className="text-xl font-black text-foreground">
                    {result.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {result.desc}
                  </p>

                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 text-foreground font-bold">
                      <UserCheck className="w-4 h-4 text-[#DFB755]" />
                      <span>Barbero recomendado: <strong className="text-[#DFB755]">{result.barberoNombre}</strong></span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Especialista certificado en este tipo de textura y estructura facial.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Consejos del Maestro Barbero:
                    </span>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {result.tips.map((t, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-[#DFB755] font-bold">•</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-border hover:bg-muted text-xs font-bold text-foreground transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Repetir Test</span>
                </button>

                <button
                  type="button"
                  onClick={handleBookLook}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black font-extrabold text-xs shadow-md shadow-[#DDAE41]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Scissors className="w-4 h-4 text-black" />
                  <span>AGENDAR CON ESTE ESTILO</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}
