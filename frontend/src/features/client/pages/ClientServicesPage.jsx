import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { Scissors, Clock, Search, Filter, Info, ArrowRight, Check } from "lucide-react";
import { getClientServices } from "../services/clientStorageService";
import Modal from "../../admin/shared/components/Modal";

export default function ClientServicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedService, setSelectedService] = useState(null);
  const navigate = useNavigate();

  const services = useMemo(() => getClientServices(), []);

  const categories = useMemo(() => {
    const cats = ["all"];
    services.forEach((s) => {
      const catName = s.categoria || "General";
      if (!cats.includes(catName)) cats.push(catName);
    });
    return cats;
  }, [services]);

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesSearch =
        searchTerm === "" ||
        s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.descripcion && s.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));

      const catName = s.categoria || "General";
      const matchesCategory = selectedCategory === "all" || catName === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [services, searchTerm, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* CABECERA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#C9A24A]">Catálogo Oficial</span>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">Nuestros Servicios</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Explora nuestros cortes, tratamientos de barba y diseños de alta precisión.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/portal/agendar")}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A24A] to-[#B08A33] hover:from-[#d8b056] hover:to-[#C9A24A] text-black font-extrabold text-xs shadow-md shadow-[#C9A24A]/20 transition-all flex items-center gap-2 self-start md:self-auto cursor-pointer"
        >
          <Scissors className="w-4 h-4" />
          <span>IR A AGENDAR CITA</span>
        </button>
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Buscador */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por corte, barba, estilo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A24A]"
          />
        </div>

        {/* Categorías Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#C9A24A] text-black shadow-sm"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {cat === "all" ? "Todos los Servicios" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* GRID DE SERVICIOS */}
      {filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((svc) => (
            <div
              key={svc.id_servicio}
              className="group rounded-3xl bg-card border border-border hover:border-[#C9A24A]/50 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Imagen de Servicio */}
                <div className="relative h-48 w-full overflow-hidden bg-muted">
                  {svc.imagen_url ? (
                    <img
                      src={svc.imagen_url}
                      alt={svc.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#C9A24A]/10 text-[#C9A24A]">
                      <Scissors className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                  {/* Badge Categoría & Duración */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-black/70 text-white backdrop-blur-sm border border-white/10">
                      {svc.categoria || "Servicio"}
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-black/80 text-white backdrop-blur-sm">
                    <Clock className="w-3.5 h-3.5 text-[#C9A24A]" />
                    <span>{svc.duracion_minutos} min</span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5 space-y-2">
                  <h3 className="text-lg font-black text-foreground group-hover:text-[#C9A24A] transition-colors">
                    {svc.nombre}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {svc.descripcion || "Servicio especializado con protocolo completo de higiene y acabado profesional."}
                  </p>
                </div>
              </div>

              {/* Pie de la card con precio y botón de agendar */}
              <div className="p-5 pt-3 border-t border-border flex items-center justify-between bg-muted/10">
                <div>
                  <span className="text-[10px] font-bold uppercase text-muted-foreground block">Precio</span>
                  <span className="text-xl font-black text-[#C9A24A]">
                    ${Number(svc.precio).toLocaleString("es-CO")}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedService(svc)}
                    className="p-2.5 rounded-xl border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title="Ver detalles completos"
                  >
                    <Info className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(`/portal/agendar?servicio=${svc.id_servicio}`)}
                    className="px-4 py-2.5 rounded-xl bg-[#C9A24A] hover:bg-[#d8b056] text-black font-extrabold text-xs shadow-md shadow-[#C9A24A]/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Agendar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-3xl border border-border p-8">
          <Scissors className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-bold text-foreground">No encontramos servicios</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Intenta cambiar el término de búsqueda o selecciona otra categoría.
          </p>
        </div>
      )}

      {/* MODAL DETALLE DE SERVICIO */}
      {selectedService && (
        <Modal title={selectedService.nombre} onClose={() => setSelectedService(null)} maxWidthClass="max-w-md">
          <div className="space-y-4">
            {selectedService.imagen_url && (
              <div className="h-44 rounded-2xl overflow-hidden bg-muted">
                <img src={selectedService.imagen_url} alt={selectedService.nombre} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Categoría:</span>
                <span className="font-bold text-foreground">{selectedService.categoria || "General"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duración Estimada:</span>
                <span className="font-bold text-foreground">{selectedService.duracion_minutos} minutos</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="text-muted-foreground">Precio Oficial:</span>
                <span className="text-base font-black text-[#C9A24A]">
                  ${Number(selectedService.precio).toLocaleString("es-CO")}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Descripción
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {selectedService.descripcion || "Servicio profesional diseñado para el cuidado y estilo masculino."}
              </p>
            </div>

            <div className="pt-3 border-t border-border flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedService(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-accent cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = selectedService.id_servicio;
                  setSelectedService(null);
                  navigate(`/portal/agendar?servicio=${id}`);
                }}
                className="px-5 py-2 rounded-xl bg-[#C9A24A] text-black font-extrabold text-xs hover:bg-[#d8b056] cursor-pointer flex items-center gap-1.5"
              >
                <span>Reservar este Servicio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
