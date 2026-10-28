import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  Scissors,
  UserCheck,
  Clock,
  Coins,
  ShieldCheck,
  ChevronRight,
  Sparkle,
  Compass
} from "lucide-react";
import Modal from "../../admin/shared/components/Modal";
import ClientImage from "./ClientImage";
import { useNavigate } from "react-router";
import {
  getClientServices,
  getClientBarbers,
  syncCatalogsFromApi
} from "../services/clientStorageService";

// Opciones morfológicas de rostro
const FACE_OPTIONS = [
  {
    id: "round",
    label: "Rostro Redondo",
    shortLabel: "Redondo",
    desc: "Largo y ancho similares, mejillas suaves y mandíbula redondeada sin ángulos marcados.",
    idealGoal: "Alargar visualmente el rostro y crear ángulos verticales reduciendo el volumen lateral."
  },
  {
    id: "square",
    label: "Rostro Cuadrado",
    shortLabel: "Cuadrado",
    desc: "Mandíbula angulosa y marcada, frente amplia y pómulos en línea recta. Rasgos fuertes y masculinos.",
    idealGoal: "Enfatizar la estructura ósea con degradados limpios o suavizar con textura superior."
  },
  {
    id: "oval",
    label: "Rostro Ovalado",
    shortLabel: "Ovalado",
    desc: "Proporciones simétricas y equilibradas; frente ligeramente más amplia que la barbilla.",
    idealGoal: "Aprovechar la versatilidad natural con cortes clásicos peinados hacia atrás o estilos modernos."
  },
  {
    id: "diamond",
    label: "Rostro Diamante / Alargado",
    shortLabel: "Diamante",
    desc: "Pómulos amplios y prominentes con frente y barbilla más estrechas o rostro alargado.",
    idealGoal: "Aportar anchura al mentón con barba, conservar densidad en los laterales y evitar altura excesiva."
  }
];

// Opciones de textura de cabello
const HAIR_OPTIONS = [
  { id: "straight", label: "Lacio / Grueso", desc: "Fácil de direccionar hacia atrás o laterales con pomada o cera de fijación." },
  { id: "wavy", label: "Ondulado con Textura", desc: "Excelente para estilos con textura y degradados con movimiento natural." },
  { id: "curly", label: "Rizado / Con volumen", desc: "Ideal para degradados a máquina y definición superior con peine o difusor." },
  { id: "fine", label: "Fino o con Entradas", desc: "Favorece cortes cortos texturizados para máxima sensación de densidad y cuerpo." }
];

// Opciones de estilo u objetivo de imagen (sin forzar elección de servicio)
const STYLE_GOAL_OPTIONS = [
  {
    id: "urban",
    label: "Urbano & Skin Fade",
    desc: "Degradado limpio a piel, moderno, fresco y con líneas nítidas.",
    categoryMatch: "Cortes"
  },
  {
    id: "executive",
    label: "Ejecutivo Elegante",
    desc: "Líneas limpias, porte profesional, sobriedad y raya definida.",
    categoryMatch: "Cortes"
  },
  {
    id: "beard",
    label: "Barba Protagonista",
    desc: "Perfilado milimétrico y armonización completa de corte con barba.",
    categoryMatch: "Combos"
  },
  {
    id: "avantgarde",
    label: "Vanguardia & Diseño",
    desc: "Textura desfilada, diseño de líneas o cambio de look especial.",
    categoryMatch: "Tratamientos"
  }
];

// RECOMENDACIONES ESPECÍFICAS POR CADA FORMA DE ROSTRO
const FACE_RECOMMENDATIONS_CONFIG = {
  round: {
    faceTitle: "Rostro Redondo",
    morphologySummary: "Tu rostro tiene curvas suaves y proporciones similares de ancho y largo. El corte ideal debe crear líneas verticales que alarguen visualmente el perfil y reduzcan el volumen de las mejillas.",
    styles: [
      {
        id: "high_fade_crop",
        title: "High Skin Fade & Crop Texturizado",
        tag: "Máxima Estilización",
        targetCategory: "Cortes",
        defaultServiceId: 1,
        goalMatch: ["urban", "executive"],
        imagen: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&auto=format&fit=crop&q=80",
        whyBest: "Al degradar a piel en los laterales altos (High Fade) se elimina el ancho de las mejillas. La textura con elevación en la coronilla alarga inmediatamente tus facciones.",
        tips: [
          "Pide la línea frontal (cerquillo) recta y definida para contrastar con las curvas del rostro.",
          "Estiliza con cera mate o polvo voluminizador para mantener la elevación todo el día."
        ]
      },
      {
        id: "fade_angular_beard",
        title: "Fade Alto con Barba Angular en 'V'",
        tag: "Alargamiento Óptico",
        targetCategory: "Combos",
        defaultServiceId: 2,
        goalMatch: ["beard"],
        imagen: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop&q=80",
        whyBest: "Una barba esculpida en forma de 'V' añade longitud y ángulo al mentón, transformando una silueta circular en una estructura angular y masculina.",
        tips: [
          "Mantén los laterales de la barba muy bajos para no ensanchar las mejillas.",
          "Concentra la longitud y el peinado hacia la punta de la barbilla."
        ]
      },
      {
        id: "geometric_beard_sculpt",
        title: "Afeitado Spa & Perfilado Geométrico",
        tag: "Contorno Nítido",
        targetCategory: "Barba",
        defaultServiceId: 3,
        goalMatch: ["avantgarde"],
        imagen: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80",
        whyBest: "Líneas de afeitado diagonales y limpias en mejillas y cuello que generan sombras estratégicas para disimular la papada y afinar el contorno.",
        tips: [
          "Toalla térmica caliente para abrir poros antes del afeitado a navaja libre.",
          "Aplica loción astringente sin alcohol para cerrar poros e hidratar la piel."
        ]
      }
    ]
  },
  square: {
    faceTitle: "Rostro Cuadrado",
    morphologySummary: "Mandíbula marcada, frente ancha y pómulos fuertes. Tienes una de las estructuras más contundentes y fotogénicas. El corte ideal potencia la fuerza de tus rasgos sin sobrecargar las sienes.",
    styles: [
      {
        id: "executive_side_part",
        title: "Executive Side Part & Mid Fade",
        tag: "Elegancia Estructurada",
        targetCategory: "Cortes",
        defaultServiceId: 1,
        goalMatch: ["executive", "urban"],
        imagen: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&auto=format&fit=crop&q=80",
        whyBest: "La raya lateral limpia y el degradado medio acompañan de forma armónica la rectitud de tu mandíbula, proyectando porte ejecutivo y formalidad.",
        tips: [
          "Marca la raya lateral milimétricamente con tijera o navaja para máxima nitidez.",
          "Usa pomada con fijación media y brillo moderado para un peinado firme."
        ]
      },
      {
        id: "square_sculpted_beard",
        title: "Barba Cuadrada Esculpida & Fade Pulido",
        tag: "Poder & Masculinidad",
        targetCategory: "Combos",
        defaultServiceId: 2,
        goalMatch: ["beard"],
        imagen: "https://images.unsplash.com/photo-1517832606589-7629c3395909?w=600&auto=format&fit=crop&q=80",
        whyBest: "Sincroniza el ángulo natural de tu mandíbula con un perfilado recto en el mentón y degradado limpio que conecta la patilla con la barba.",
        tips: [
          "El perfilado del cuello debe culminar exactamente dos dedos sobre la nuez de Adán.",
          "Aplica aceite para barba después de la ducha para mantener el vello dócil y brillante."
        ]
      },
      {
        id: "crop_design_modern",
        title: "Texturizado Desfilado & Diseño de Vanguardia",
        tag: "Impacto Moderno",
        targetCategory: "Tratamientos",
        defaultServiceId: 4,
        goalMatch: ["avantgarde"],
        imagen: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&auto=format&fit=crop&q=80",
        whyBest: "Un flequillo corto despuntado y textura superior suavizan la rigidez de la frente sin restarle fuerza al mentón.",
        tips: [
          "El polvo texturizador es ideal para lograr ese movimiento natural sin brillo.",
          "Retoque cada 15 a 20 días para conservar el contraste del fade lateral."
        ]
      }
    ]
  },
  oval: {
    faceTitle: "Rostro Ovalado",
    morphologySummary: "Proporciones armónicas y equilibradas con frente ligeramente más amplia que la barbilla. Es el rostro más versátil; el objetivo es potenciar tu simetría sin alargar excesivamente la silueta.",
    styles: [
      {
        id: "pompadour_low_fade",
        title: "Pompadour Clásico / Slick Back con Low Fade",
        tag: "Simetría Clásica",
        targetCategory: "Cortes",
        defaultServiceId: 1,
        goalMatch: ["executive", "urban"],
        imagen: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&auto=format&fit=crop&q=80",
        whyBest: "El volumen peinado hacia atrás aprovecha la frente despejada, resaltando tus rasgos sin deformar las proporciones naturales de tu cabeza.",
        tips: [
          "Seca con cepillo redondo desde la raíz para ganar elevación natural sin apelmazar.",
          "El degradado bajo (Low Fade) conserva suficiente densidad lateral para un marco perfecto."
        ]
      },
      {
        id: "tailored_beard_cut",
        title: "Corte a Tijera & Barba Sombreada de 3 Días",
        tag: "Armonía Total",
        targetCategory: "Combos",
        defaultServiceId: 2,
        goalMatch: ["beard"],
        imagen: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop&q=80",
        whyBest: "Aporta un toque masculino maduro y desenfadado sin recargar ni competir con la simetría natural de tu mentón.",
        tips: [
          "Mantén el contorno del cuello y pómulos afeitado al ras para conservar la limpieza visual.",
          "Cepilla el vello facial a diario con cerdas de jabalí."
        ]
      },
      {
        id: "avantgarde_color_art",
        title: "Corte de Tendencia, Matiz & Color Platinado",
        tag: "Estilo & Vanguardia",
        targetCategory: "Tratamientos",
        defaultServiceId: 4,
        goalMatch: ["avantgarde"],
        imagen: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&auto=format&fit=crop&q=80",
        whyBest: "Tu rostro ovalado es el lienzo perfecto para cualquier estilo arriesgado, diseño o coloración sin riesgo de distorsionar tus proporciones.",
        tips: [
          "Usa champú sin sulfatos para mantener la vitalidad del color por semanas.",
          "Aplica mascarilla capilar nutritiva semanal para proteger la hebra capilar."
        ]
      }
    ]
  },
  diamond: {
    faceTitle: "Rostro Diamante / Alargado",
    morphologySummary: "Pómulos marcados y anchos con frente y barbilla más estrechas o alargadas. El corte ideal busca aportar anchura a la mandíbula, conservar densidad en los laterales y evitar altura excesiva arriba.",
    styles: [
      {
        id: "mid_taper_balance",
        title: "Mid Taper Fade con Caída y Textura Media",
        tag: "Equilibrio Horizontal",
        targetCategory: "Cortes",
        defaultServiceId: 1,
        goalMatch: ["urban", "executive"],
        imagen: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&auto=format&fit=crop&q=80",
        whyBest: "A diferencia del Skin Fade alto, el Taper Fade conserva densidad sobre las orejas y sienes, lo que suaviza visualmente los pómulos anchos y equilibra el contorno.",
        tips: [
          "Evita los tupés excesivamente altos en la coronilla que puedan alargar más tu rostro.",
          "Estiliza con los dedos usando crema modeladora para un acabado con movimiento suave."
        ]
      },
      {
        id: "dense_full_beard",
        title: "Corte Clásico & Barba Completa Estructurada",
        tag: "Volumen en Mandíbula",
        targetCategory: "Combos",
        defaultServiceId: 2,
        goalMatch: ["beard"],
        imagen: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop&q=80",
        whyBest: "Una barba con buena densidad en la mandíbula y mentón 'rellena' la parte inferior del rostro, creando una simetría visual mucho más proporcionada y masculina.",
        tips: [
          "Da volumen a los costados de la barba y mantén el mentón recortado en línea recta.",
          "Aplica bálsamo fijador para disciplinar los vellos rebeldes."
        ]
      },
      {
        id: "spa_shave_soft_lines",
        title: "Ritual de Afeitado Spa & Perfilado Curvo",
        tag: "Líneas Suaves",
        targetCategory: "Barba",
        defaultServiceId: 3,
        goalMatch: ["avantgarde"],
        imagen: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80",
        whyBest: "El afeitado con toalla caliente y perfilado con suaves transiciones curvas atenúa los ángulos punzantes del mentón para un porte mucho más refinado.",
        tips: [
          "Exfoliación térmica con aceites esenciales para calmar y revitalizar la dermis.",
          "Usa protector solar facial diario para prevenir resequedad e irritación."
        ]
      }
    ]
  }
};

// Fallback de servicios reales si el storage está inicializándose
const FALLBACK_REAL_SERVICES = [
  {
    id_servicio: 1,
    nombre: "Corte Clásico",
    categoria: "Cortes",
    duracion_minutos: 30,
    precio: 15000,
    imagen_url: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&auto=format&fit=crop&q=80"
  },
  {
    id_servicio: 2,
    nombre: "Corte + Barba",
    categoria: "Combos",
    duracion_minutos: 45,
    precio: 25000,
    imagen_url: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop&q=80"
  },
  {
    id_servicio: 3,
    nombre: "Afeitado Premium",
    categoria: "Barba",
    duracion_minutos: 35,
    precio: 20000,
    imagen_url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80"
  },
  {
    id_servicio: 4,
    nombre: "Diseño y Color",
    categoria: "Tratamientos",
    duracion_minutos: 60,
    precio: 30000,
    imagen_url: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&auto=format&fit=crop&q=80"
  }
];

export default function StyleQuizModal({ onClose }) {
  const navigate = useNavigate();

  // Catálogos reales del salón
  const [services, setServices] = useState(() => {
    const s = getClientServices();
    return s && s.length > 0 ? s : FALLBACK_REAL_SERVICES;
  });
  const [barbers, setBarbers] = useState(() => getClientBarbers());

  // Estados del cuestionario
  const [currentStep, setCurrentStep] = useState(0); // 0: Rostro, 1: Cabello, 2: Objetivo de Estilo
  const [answers, setAnswers] = useState({ face: null, hair: null, goal: null });

  // Estado de resultados
  const [selectedFaceKey, setSelectedFaceKey] = useState(null); // 'round' | 'square' | 'oval' | 'diamond'
  const [selectedStyleIndex, setSelectedStyleIndex] = useState(0);

  // Sincronizar catálogo real desde backend
  useEffect(() => {
    syncCatalogsFromApi().then(() => {
      const realSrvs = getClientServices();
      if (realSrvs && realSrvs.length > 0) setServices(realSrvs);
      const realBarbers = getClientBarbers();
      if (realBarbers && realBarbers.length > 0) setBarbers(realBarbers);
    });
  }, []);

  const quizSteps = [
    {
      id: "face",
      title: "¿Cuál es la forma de tu rostro?",
      subtitle: "La morfología ósea es la clave para definir qué corte equilibrará tus proporciones.",
      options: FACE_OPTIONS
    },
    {
      id: "hair",
      title: "¿Cómo describirías tu tipo de cabello?",
      subtitle: "Cada textura requiere técnicas de tijera, máquina y productos de fijación específicos.",
      options: HAIR_OPTIONS
    },
    {
      id: "goal",
      title: "¿Qué estilo o vibra deseas proyectar?",
      subtitle: "Selecciona el enfoque que mejor complementa tu estilo de vida y personalidad.",
      options: STYLE_GOAL_OPTIONS
    }
  ];

  const handleSelectOption = (stepId, value) => {
    const updated = { ...answers, [stepId]: value };
    setAnswers(updated);

    if (currentStep < quizSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Fin del cuestionario: establecer rostro seleccionado
      const finalFace = updated.face || "round";
      setSelectedFaceKey(finalFace);

      // Preseleccionar el estilo de ese rostro que mejor encaje con su objetivo (goal)
      const faceCfg = FACE_RECOMMENDATIONS_CONFIG[finalFace];
      let bestIdx = 0;
      if (faceCfg && updated.goal) {
        const found = faceCfg.styles.findIndex((s) => s.goalMatch.includes(updated.goal));
        if (found !== -1) bestIdx = found;
      }
      setSelectedStyleIndex(bestIdx);
    }
  };

  const handleRestart = () => {
    setAnswers({ face: null, hair: null, goal: null });
    setSelectedFaceKey(null);
    setSelectedStyleIndex(0);
    setCurrentStep(0);
  };

  // Configuración del rostro actualmente visualizado
  const currentFaceConfig = useMemo(() => {
    if (!selectedFaceKey) return null;
    return FACE_RECOMMENDATIONS_CONFIG[selectedFaceKey] || FACE_RECOMMENDATIONS_CONFIG.round;
  }, [selectedFaceKey]);

  // Estilo activo dentro de las recomendaciones de este rostro
  const activeStyle = useMemo(() => {
    if (!currentFaceConfig) return null;
    return currentFaceConfig.styles[selectedStyleIndex] || currentFaceConfig.styles[0];
  }, [currentFaceConfig, selectedStyleIndex]);

  // Vincular inteligentemente con un SERVICIO REAL existente en el salón
  const matchedRealService = useMemo(() => {
    if (!activeStyle) return services[0] || FALLBACK_REAL_SERVICES[0];

    const targetCat = (activeStyle.targetCategory || "").toLowerCase();

    // 1. Buscar servicio activo cuya categoría coincida
    let match = services.find((s) => (s.categoria || "").toLowerCase().includes(targetCat));

    // 2. Si no coincide la categoría, buscar por id sugerido
    if (!match) {
      match = services.find((s) => s.id_servicio === activeStyle.defaultServiceId);
    }

    // 3. Fallback a primer servicio activo
    return match || services[0] || FALLBACK_REAL_SERVICES[0];
  }, [activeStyle, services]);

  // Selección del BARBERO REAL especialista en el estilo/servicio
  const recommendedBarber = useMemo(() => {
    const activeBarbers = (barbers || []).filter((b) => b.estado === 1);
    if (activeBarbers.length === 0) {
      return {
        id_barbero: 1,
        nombre: "Carlos",
        apellido: "Rodríguez",
        especialidad: "Corte Clásico & Fade",
        badge: "Master Fade",
        rating: 0,
        calificacion: 0,
        reviewsCount: 0,
        total_calificaciones: 0
      };
    }

    if (!matchedRealService) return activeBarbers[0];

    const sName = (matchedRealService.nombre || "").toLowerCase();
    const sCat = (matchedRealService.categoria || "").toLowerCase();

    const specialized = activeBarbers.find((b) => {
      const esp = (b.especialidad || "").toLowerCase();
      if (sCat.includes("color") || sName.includes("color") || sName.includes("diseño")) {
        return esp.includes("color") || esp.includes("diseño");
      }
      if (sCat.includes("barba") || sName.includes("barba") || sName.includes("afeitado")) {
        return esp.includes("barba") || esp.includes("navaja") || esp.includes("spa");
      }
      if (sName.includes("fade") || sCat.includes("corte")) {
        return esp.includes("fade") || esp.includes("corte") || esp.includes("clásico");
      }
      return false;
    });

    return specialized || activeBarbers[0];
  }, [barbers, matchedRealService]);

  const handleBookSelected = () => {
    if (!matchedRealService) return;
    onClose();
    const query = new URLSearchParams({
      servicio: matchedRealService.id_servicio,
      barbero: recommendedBarber.id_barbero,
      estilo: activeStyle?.title || ""
    });
    navigate(`/portal/agendar?${query.toString()}`);
  };

  const isCompleted = selectedFaceKey !== null && currentFaceConfig !== null;
  const stepData = quizSteps[currentStep] || quizSteps[0];

  return (
    <Modal
      title="Asistente de Estilo Personalizado"
      onClose={onClose}
      maxWidthClass="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Cabecera con indicador de progreso */}
        {!isCompleted && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold uppercase tracking-wider text-[#DFB755]">
                Paso {currentStep + 1} de {quizSteps.length}
              </span>
              <span className="text-muted-foreground font-semibold">
                {Math.round(((currentStep + 1) / quizSteps.length) * 100)}% Completado
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#E8C466] to-[#DDAE41]"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / quizSteps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* PANTALLA DE PREGUNTAS (ROSTRO, CABELLO, VIBRA) */}
        <AnimatePresence mode="wait">
          {!isCompleted ? (
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
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold text-sm text-foreground group-hover:text-[#DFB755] transition-colors">
                          {opt.label}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-[#DFB755] shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                        {opt.desc}
                      </p>
                      {opt.idealGoal && (
                        <p className="text-[11px] text-[#DFB755] mt-2 font-medium">
                          ✦ Objetivo: {opt.idealGoal}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            /* PANTALLA DE RECOMENDACIONES EXCLUSIVAS POR FORMA DE ROSTRO */
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
              className="space-y-5"
            >
              {/* Badge y Selector de Rostro para exploración interactiva */}
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Recomendaciones para {currentFaceConfig.faceTitle}</span>
                  </div>

                  <span className="text-[11px] font-semibold text-muted-foreground">
                    ✦ Explora otras formas de rostro:
                  </span>
                </div>

                {/* Botones para alternar entre rostros */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {FACE_OPTIONS.map((f) => {
                    const isCurrent = f.id === selectedFaceKey;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          setSelectedFaceKey(f.id);
                          setSelectedStyleIndex(0);
                        }}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border text-center ${
                          isCurrent
                            ? "bg-[#DFB755] text-black border-[#DFB755] shadow-sm font-extrabold"
                            : "bg-muted/40 border-border text-foreground hover:bg-muted hover:border-[#DFB755]/40"
                        }`}
                      >
                        {f.shortLabel}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Diagnóstico morfológico */}
              <div className="p-3.5 rounded-xl bg-[#DFB755]/10 border border-[#DFB755]/30 text-xs text-foreground leading-relaxed">
                <span className="font-extrabold text-[#DFB755] block mb-0.5">
                  ✦ Diagnóstico de Morfología Facial ({currentFaceConfig.faceTitle}):
                </span>
                {currentFaceConfig.morphologySummary}
              </div>

              {/* Selector de estilos recomendados para ESTE rostro */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                  Estilos recomendados para tu estructura facial:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {currentFaceConfig.styles.map((style, idx) => {
                    const isSelected = idx === selectedStyleIndex;
                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setSelectedStyleIndex(idx)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "bg-[#DFB755]/15 border-[#DFB755] ring-2 ring-[#DFB755]/30 shadow-md"
                            : "bg-card border-border hover:border-[#DFB755]/40 hover:bg-muted/30"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#DFB755]/20 text-[#DFB755]">
                            {style.tag}
                          </span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#DFB755]" />}
                        </div>
                        <p className="text-xs font-extrabold text-foreground line-clamp-2">
                          {style.title}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* TARJETA DETALLADA DEL ESTILO SELECCIONADO */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center p-4 rounded-2xl bg-card border border-border shadow-xs">
                {/* Imagen del estilo */}
                <div className="md:col-span-5 h-56 rounded-2xl overflow-hidden bg-muted relative shadow-sm">
                  <ClientImage
                    src={activeStyle?.imagen}
                    alt={activeStyle?.title}
                    type="service"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase bg-[#DFB755] text-black shadow-sm">
                    {activeStyle?.tag}
                  </div>

                  {/* Servicio real asociado en la barbería */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 p-2 rounded-xl bg-black/80 backdrop-blur-md text-white text-[11px] flex items-center justify-between font-bold">
                    <span className="text-[#DFB755] truncate max-w-[120px]">
                      {matchedRealService?.nombre}
                    </span>
                    <span className="text-emerald-400">
                      ${Number(matchedRealService?.precio || 0).toLocaleString("es-CO")} COP
                    </span>
                  </div>
                </div>

                {/* Explicación y Barbero Recomendado REAL */}
                <div className="md:col-span-7 space-y-3">
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-foreground">
                      {activeStyle?.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                      <strong className="text-foreground">¿Por qué favorece tu rostro? </strong>
                      {activeStyle?.whyBest}
                    </p>
                  </div>

                  {/* Servicio Oficial en Catálogo */}
                  <div className="flex items-center gap-3 text-xs bg-muted/30 p-2.5 rounded-xl border border-border">
                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                      <Scissors className="w-3.5 h-3.5 text-[#DFB755]" />
                      <span>Servicio en salón: <strong>{matchedRealService?.nombre}</strong></span>
                    </div>
                    <span className="text-muted-foreground">•</span>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{matchedRealService?.duracion_minutos} min</span>
                    </div>
                  </div>

                  {/* Barbero Real Especialista */}
                  <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-foreground font-bold">
                        <UserCheck className="w-4 h-4 text-[#DFB755]" />
                        <span>
                          Barbero especialista:{" "}
                          <strong className="text-[#DFB755]">
                            {recommendedBarber.nombre} {recommendedBarber.apellido || ""}
                          </strong>
                        </span>
                      </div>
                      {recommendedBarber.badge && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-[#DFB755]/15 text-[#DFB755]">
                          {recommendedBarber.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {recommendedBarber.especialidad
                        ? `Especialista certificado en ${recommendedBarber.especialidad}.`
                        : "Barbero profesional oficial de nuestro salón."}
                    </p>
                  </div>

                  {/* Consejos del Maestro Barbero */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Consejos del Maestro Barbero:
                    </span>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {activeStyle?.tips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-[#DFB755] font-bold">•</span>
                          <span>{tip}</span>
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
                  onClick={handleBookSelected}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black font-extrabold text-xs shadow-md shadow-[#DDAE41]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Scissors className="w-4 h-4 text-black" />
                  <span>AGENDAR ESTE ESTILO</span>
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
