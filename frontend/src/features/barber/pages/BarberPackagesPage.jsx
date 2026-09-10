import { useState, useEffect } from "react";
import { Package, Eye, Sparkles, Check, Clock, Tag, Search } from "lucide-react";
import Modal from "../../admin/shared/components/Modal";
import { getBarberPackages } from "../services/barberStorageService";

export default function BarberPackagesPage() {
  const [packages, setPackages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = getBarberPackages();
    setPackages(data);
    setLoading(false);
  }, []);

  const filteredPackages = packages.filter((pkg) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    const matchName = pkg.nombre.toLowerCase().includes(q);
    const matchDesc = (pkg.descripcion || "").toLowerCase().includes(q);
    const matchServices = (pkg.servicios || []).some((s) => s.nombre.toLowerCase().includes(q));
    return matchName || matchDesc || matchServices;
  });

  return (
    <div className="space-y-6">
      {/* HEADER DE MÓDULO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Paquetes de Servicios
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#DFB755]/15 text-[#DFB755] border border-[#DFB755]/30">
              Catálogo Oficial
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Consulta los paquetes de servicios vigentes para conocer los combos que los clientes pueden agendar contigo.
          </p>
        </div>
      </div>

      {/* BUSCADOR DE PAQUETES */}
      <div className="p-4 rounded-2xl bg-card border border-border">
        <div className="relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre de paquete o servicio incluido (ej. Corte, Barba, Spa)..."
            className="w-full pl-9 pr-4 py-2 bg-input-background border border-input rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* ESTADO VACÍO */}
      {packages.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-card border border-dashed border-border space-y-3">
          <Package className="w-10 h-10 mx-auto text-muted-foreground" />
          <h3 className="text-base font-bold text-foreground">No hay paquetes disponibles.</h3>
          <p className="text-xs text-muted-foreground">
            Actualmente no hay paquetes activos configurados en el sistema por la administración.
          </p>
        </div>
      ) : filteredPackages.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-card border border-dashed border-border space-y-3">
          <Search className="w-8 h-8 mx-auto text-muted-foreground" />
          <h3 className="text-base font-bold text-foreground">No se encontraron paquetes</h3>
          <p className="text-xs text-muted-foreground">
            No coincide ningún combo con el término "{searchTerm}". Intenta buscar con otra palabra clave.
          </p>
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            className="px-4 py-2 rounded-xl bg-accent hover:bg-accent/80 text-foreground text-xs font-bold transition-colors cursor-pointer"
          >
            Limpiar búsqueda
          </button>
        </div>
      ) : (
        /* GRID DE PAQUETES (CARDS ELEGANTES DE SOLO LECTURA) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => (
            <div
              key={pkg.id_paquete}
              className="rounded-3xl bg-card border border-border/80 overflow-hidden shadow-md hover:shadow-xl hover:border-[#DFB755]/50 transition-all flex flex-col group"
            >
              {/* Imagen del paquete con badges */}
              <div className="relative h-48 w-full overflow-hidden bg-muted">
                <img
                  src={pkg.imagen_url}
                  alt={pkg.nombre}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-[#E8C466] to-[#DDAE41] text-black shadow-md shadow-[#DDAE41]/30 flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    -{pkg.descuento_porcentaje}% OFF
                  </span>
                </div>

                <div className="absolute bottom-3 left-4 right-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#DFB755]">
                    Combo Especial
                  </span>
                  <h3 className="text-lg font-black text-white leading-tight drop-shadow-sm">
                    {pkg.nombre}
                  </h3>
                </div>
              </div>

              {/* Cuerpo de la Card */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {pkg.descripcion}
                </p>

                {/* Servicios incluidos resumidos */}
                <div className="space-y-1.5 pt-2 border-t border-border/60">
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                    Servicios Incluidos ({pkg.servicios?.length || 0}):
                  </span>
                  <div className="space-y-1">
                    {(pkg.servicios || []).map((s) => (
                      <div key={s.id_servicio} className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                        <Check className="w-3.5 h-3.5 text-[#DFB755] shrink-0" />
                        <span className="truncate">{s.nombre}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Precios y Botón Ver Detalle */}
                <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-muted-foreground line-through block">
                      ${pkg.precioBase.toLocaleString("es-CO")}
                    </span>
                    <span className="text-lg font-black text-[#DFB755]">
                      ${pkg.precioFinal.toLocaleString("es-CO")}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedPackage(pkg)}
                    className="px-4 py-2 rounded-xl bg-accent hover:bg-[#DFB755]/20 text-foreground hover:text-[#DFB755] border border-border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver Detalle</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DETALLE DE PAQUETE (SOLO LECTURA) */}
      {selectedPackage && (
        <Modal
          title={`Detalle de Paquete: ${selectedPackage.nombre}`}
          onClose={() => setSelectedPackage(null)}
          maxWidthClass="max-w-lg"
        >
          <div className="space-y-4">
            {/* Imagen banner */}
            <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-muted">
              <img
                src={selectedPackage.imagen_url}
                alt={selectedPackage.nombre}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-[#E8C466] to-[#DDAE41] text-black shadow-md">
                  Ahorro del {selectedPackage.descuento_porcentaje}%
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-black text-foreground">{selectedPackage.nombre}</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {selectedPackage.descripcion}
              </p>
            </div>

            {/* Servicios incluidos con desglose */}
            <div className="p-4 rounded-2xl bg-accent/30 border border-border space-y-2.5">
              <span className="text-xs font-black uppercase tracking-wider text-muted-foreground block">
                Servicios del Paquete
              </span>
              <div className="divide-y divide-border/60">
                {(selectedPackage.servicios || []).map((s) => (
                  <div key={s.id_servicio} className="py-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#DFB755]" />
                      <span className="font-bold text-foreground">{s.nombre}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {s.duracion_minutos || 30} min
                      </span>
                      <span className="font-semibold text-foreground">
                        ${(s.precio || 0).toLocaleString("es-CO")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumen de precios y duración */}
            <div className="p-4 rounded-2xl bg-card border border-border grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Precio Base</span>
                <p className="text-xs line-through text-muted-foreground mt-0.5">
                  ${selectedPackage.precioBase.toLocaleString("es-CO")}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Descuento</span>
                <p className="text-xs font-bold text-emerald-500 mt-0.5">
                  {selectedPackage.descuento_porcentaje}%
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#DFB755] uppercase">Precio Final</span>
                <p className="text-base font-black text-[#DFB755]">
                  ${selectedPackage.precioFinal.toLocaleString("es-CO")}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>Duración estimada del paquete:</span>
              <strong className="text-foreground">{selectedPackage.duracion_minutos} minutos</strong>
            </div>

            {/* Botón de Cierre */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedPackage(null)}
                className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent/80 text-foreground font-bold text-xs transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
