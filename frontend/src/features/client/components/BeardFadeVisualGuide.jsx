import { useState } from "react";
import { Link } from "react-router";
import { Scissors, Sparkles, Check, ChevronRight, Filter, Info } from "lucide-react";
import ClientImage from "./ClientImage";
import BarberScissorsIcon from "../../../shared/ui/BarberScissorsIcon";

export default function BeardFadeVisualGuide() {
  const [activeTab, setActiveTab] = useState("fade"); // 'fade' | 'beard'
  const [selectedFaceShape, setSelectedFaceShape] = useState("all");

  const faceShapes = [
    { id: "all", label: "Todas las Formas" },
    { id: "oval", label: "Rostro Ovalado" },
    { id: "square", label: "Rostro Cuadrado" },
    { id: "round", label: "Rostro Redondo" }
  ];

  const fadeStyles = [
    {
      id: "mid-fade",
      title: "Mid Skin Fade Texturizado",
      subtitle: "El corte más solicitado",
      faceShapes: ["oval", "square"],
      faceLabel: "Ovalado / Cuadrado",
      mantenimiento: "Cada 12-15 días",
      descripcion: "Degradado a media altura que fusiona la piel limpia con textura superior flexible.",
      productoRecomendado: "Cera Mate Arcilla Premium",
      imagen: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "low-fade",
      title: "Low Fade Clásico Ejecutivo",
      subtitle: "Sutil, formal y elegante",
      faceShapes: ["oval", "round"],
      faceLabel: "Ovalado / Redondo",
      mantenimiento: "Cada 20 días",
      descripcion: "Degradado bajo que inicia justo encima de la oreja, ideal para entornos corporativos.",
      productoRecomendado: "Pomada Clásica Brillo Medio",
      imagen: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "high-crop",
      title: "High Fade con French Crop",
      subtitle: "Urbano, audaz y moderno",
      faceShapes: ["round", "square"],
      faceLabel: "Redondo / Cuadrado",
      mantenimiento: "Cada 10-12 días",
      descripcion: "Transición muy alta y limpia con flequillo corto texturizado hacia adelante.",
      productoRecomendado: "Polvo Voluminizador Texturizante",
      imagen: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "taper-fade",
      title: "Taper Fade Blowout",
      subtitle: "Versátil y atemporal",
      faceShapes: ["all", "oval", "square", "round"],
      faceLabel: "Todo tipo de rostro",
      mantenimiento: "Cada 15-18 días",
      descripcion: "Degradado focalizado únicamente en patillas y nuca baja, conservando masa lateral.",
      productoRecomendado: "Tónico Capilar Refrescante",
      imagen: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=600&auto=format&fit=crop&q=80"
    }
  ];

  const beardStyles = [
    {
      id: "beard-sculpted",
      title: "Barba Completa Esculpida",
      subtitle: "Densidad, fuerza y presencia",
      faceShapes: ["oval", "round"],
      faceLabel: "Ovalado / Redondo",
      mantenimiento: "Cada 10 días",
      descripcion: "Líneas de mejilla geométricas ultra nítidas con base cuadrada que estiliza la mandíbula.",
      productoRecomendado: "Aceite Hidratante de Argán",
      imagen: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "beard-stubble",
      title: "Stubble de 3 Días (Sombra Elegante)",
      subtitle: "Despreocupado pero pulido",
      faceShapes: ["square", "oval"],
      faceLabel: "Cuadrado / Ovalado",
      mantenimiento: "Cada 3-5 días",
      descripcion: "Longitud de 1.5 a 3 mm con cuello perfilado y pómulos limpios con navaja.",
      productoRecomendado: "Bálsamo Calmante Aftershave",
      imagen: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "beard-fade",
      title: "Barba con Fade Invertido",
      subtitle: "Conexión perfecta con el cabello",
      faceShapes: ["all", "round", "oval"],
      faceLabel: "Todo tipo de rostro",
      mantenimiento: "Cada 12 días",
      descripcion: "El vello facial se degrada suavemente desde las patillas hasta densificarse en el mentón.",
      productoRecomendado: "Bálsamo Acondicionador Mate",
      imagen: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "beard-vandyke",
      title: "Perfilado Perilla & Bigote (Van Dyke)",
      subtitle: "Personalidad distinguida",
      faceShapes: ["square", "oval"],
      faceLabel: "Cuadrado / Ovalado",
      mantenimiento: "Semanal",
      descripcion: "Bigote marcado y perilla central desconectada, con mejillas totalmente afeitadas.",
      productoRecomendado: "Gel de Afeitar Transparente",
      imagen: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80"
    }
  ];

  const currentList = activeTab === "fade" ? fadeStyles : beardStyles;
  const filteredList = currentList.filter(
    (item) => selectedFaceShape === "all" || item.faceShapes.includes(selectedFaceShape)
  );

  return (
    <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-sm space-y-6 p-6 sm:p-8">
      {/* CABECERA DE LA GUÍA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#DFB755] dark:text-[#E8C466]">
              Guía de Estilo & Visagismo
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#DFB755]/15 text-[#DFB755] border border-[#DFB755]/30">
              Interactivo
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground mt-1">
            Selector Visual de Fades & Barbas
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Encuentra la combinación de degradado y vello facial que mejor potencia los rasgos de tu rostro.
          </p>
        </div>

        {/* SWITCH TABS (FADE VS BARBA) */}
        <div className="flex items-center p-1 rounded-2xl bg-muted/60 border border-border self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("fade")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "fade"
                ? "bg-gradient-to-r from-[#DFB755] to-[#DDAE41] text-black shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BarberScissorsIcon className="w-3.5 h-3.5" />
            <span>Degradados (Fade)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("beard")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "beard"
                ? "bg-gradient-to-r from-[#DFB755] to-[#DDAE41] text-black shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Estilos de Barba</span>
          </button>
        </div>
      </div>

      {/* FILTROS DE FORMA DE ROSTRO */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-bold text-muted-foreground flex items-center gap-1 shrink-0 mr-1">
          <Filter className="w-3.5 h-3.5 text-[#DFB755]" />
          Filtrar por rostro:
        </span>
        {faceShapes.map((shape) => (
          <button
            key={shape.id}
            type="button"
            onClick={() => setSelectedFaceShape(shape.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedFaceShape === shape.id
                ? "bg-foreground text-background shadow-xs"
                : "bg-muted/40 hover:bg-muted text-muted-foreground border border-border"
            }`}
          >
            {shape.label}
          </button>
        ))}
      </div>

      {/* GRID DE ESTILOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredList.map((item) => (
          <div
            key={item.id}
            className="group rounded-2xl bg-card border border-border hover:border-[#DFB755]/50 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Imagen */}
              <div className="relative h-44 w-full overflow-hidden bg-muted">
                <ClientImage
                  src={item.imagen}
                  alt={item.title}
                  type="service"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-black/80 text-white backdrop-blur-sm border border-white/10">
                    {item.faceLabel}
                  </span>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-4 space-y-2">
                <div>
                  <h4 className="text-sm font-black text-foreground group-hover:text-[#DDAE41] transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-[#DFB755] font-bold mt-0.5">{item.subtitle}</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.descripcion}
                </p>
              </div>
            </div>

            {/* Pie con producto y agendar */}
            <div className="p-4 pt-3 border-t border-border bg-muted/10 space-y-2.5">
              <div className="text-[11px] text-muted-foreground">
                <span className="font-bold text-foreground block">Mantenimiento:</span>
                {item.mantenimiento}
              </div>

              <div className="text-[11px] text-muted-foreground border-t border-border/50 pt-2">
                <span className="font-bold text-foreground block">Fijación recomendada:</span>
                <span className="text-[#DDAE41] font-semibold">{item.productoRecomendado}</span>
              </div>

              <Link
                to="/portal/agendar"
                className="w-full py-2 rounded-xl bg-muted hover:bg-accent text-foreground text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Pedir este corte</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
