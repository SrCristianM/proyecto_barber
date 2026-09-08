import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Clock, ArrowRight, Eye, Check, Scissors, Tag } from "lucide-react";
import BarberScissorsIcon from "../../../shared/ui/BarberScissorsIcon";
import Modal from "../../admin/shared/components/Modal";
import ClientImage from "./ClientImage";
import { getClientLookbook } from "../services/clientStorageService";

export default function LookbookSection() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [activeLook, setActiveLook] = useState(null);
  const navigate = useNavigate();

  const looks = getClientLookbook();
  const categories = ["Todos", "Corte", "Barba", "Combos"];

  const filteredLooks =
    selectedCategory === "Todos"
      ? looks
      : looks.filter((l) => l.categoria === selectedCategory);

  const handleSelectLook = (look) => {
    setActiveLook(null);
    navigate(`/portal/agendar?servicio=${look.servicioId}&look=${encodeURIComponent(look.titulo)}`);
  };

  return (
    <div className="space-y-5">
      {/* Header con filtros */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-[#DFB755]/15 text-[#DFB755] border border-[#DFB755]/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tendencias 2026</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            Lookbook & Galería de Estilos
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Inspírate con los cortes y arreglos más solicitados y aparta tu turno con el estilo exacto que deseas.
          </p>
        </div>

        {/* Filtros de categoría */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-gradient-to-r from-[#E8C466] to-[#DDAE41] text-black shadow-sm shadow-[#DDAE41]/25"
                  : "bg-card border border-border hover:border-[#DFB755]/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de estilos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredLooks.map((look) => (
          <motion.div
            key={look.id}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="group rounded-3xl bg-card border border-border/80 hover:border-[#DFB755]/50 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
          >
            <div>
              {/* Imagen con overlay interactivo */}
              <div className="relative h-48 w-full overflow-hidden bg-muted">
                <ClientImage
                  src={look.imagen}
                  alt={look.titulo}
                  type="service"
                  category={look.categoria}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-[#DFB755] text-black shadow-md">
                  {look.categoria}
                </span>

                <span className="absolute top-3 right-3 px-2 py-1 rounded-lg text-[10px] font-bold bg-black/70 text-white backdrop-blur-sm flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#DFB755]" />
                  {look.tiempoEstimado}
                </span>

                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-sm font-extrabold text-white line-clamp-1 drop-shadow-md">
                    {look.titulo}
                  </h3>
                  <span className="text-[10px] text-zinc-300 flex items-center gap-1">
                    Tipo: {look.tipoCabello}
                  </span>
                </div>
              </div>

              {/* Descripción y Etiquetas */}
              <div className="p-4 space-y-3">
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {look.descripcion}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {look.etiquetas?.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-muted/60 text-[10px] font-semibold text-muted-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="p-4 pt-0 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveLook(look)}
                className="flex-1 py-2 px-3 rounded-xl bg-accent text-accent-foreground hover:bg-accent/80 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Ver Detalle</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectLook(look)}
                className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black text-xs font-black shadow-xs hover:shadow transition-all cursor-pointer flex items-center gap-1"
                title="Quiero este Look para mi próxima cita"
              >
                <span>Quiero este</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal Detalle Look */}
      {activeLook && (
        <Modal
          title="Detalle del Estilo de Barbería"
          onClose={() => setActiveLook(null)}
          maxWidthClass="max-w-xl"
        >
          <div className="space-y-5">
            <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-muted">
              <ClientImage
                src={activeLook.imagen}
                alt={activeLook.titulo}
                type="service"
                category={activeLook.categoria}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-[#DFB755] text-black mb-1.5 inline-block">
                  {activeLook.categoria}
                </span>
                <h3 className="text-xl font-black">{activeLook.titulo}</h3>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Descripción & Recomendación del Barbero
              </h4>
              <p className="text-sm text-foreground leading-relaxed">
                {activeLook.descripcion}
              </p>

              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-muted/30 border border-border">
                <div>
                  <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                    Tipo de Cabello Recomendado
                  </span>
                  <span className="text-xs font-extrabold text-foreground">
                    {activeLook.tipoCabello}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                    Tiempo de Ejecución
                  </span>
                  <span className="text-xs font-extrabold text-foreground">
                    {activeLook.tiempoEstimado}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setActiveLook(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:bg-accent cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => handleSelectLook(activeLook)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black font-extrabold text-xs shadow-md shadow-[#DDAE41]/25 flex items-center gap-2 cursor-pointer"
              >
                <BarberScissorsIcon className="w-4 h-4 text-black" strokeWidth={2} />
                <span>Agendar con este Look</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
