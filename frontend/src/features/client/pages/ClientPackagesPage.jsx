import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { Check, ArrowRight, Info, Scissors, Tag, Clock } from "lucide-react";
import ClientStarIcon from "../components/ClientStarIcon";
import { getClientPackages } from "../services/clientStorageService";
import Modal from "../../admin/shared/components/Modal";

export default function ClientPackagesPage() {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const navigate = useNavigate();

  const packages = useMemo(() => getClientPackages(), []);

  return (
    <div className="space-y-6">
      {/* CABECERA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#C9A24A]">Combos y Promociones</span>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">Paquetes Exclusivos</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Ahorra más combinando tus servicios favoritos en una sola cita con descuentos especiales.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/portal/agendar")}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A24A] to-[#B08A33] hover:from-[#d8b056] hover:to-[#C9A24A] text-black font-extrabold text-xs shadow-md shadow-[#C9A24A]/20 transition-all flex items-center gap-2 self-start md:self-auto cursor-pointer"
        >
          <ClientStarIcon className="w-4 h-4 text-black" />
          <span>AGENDAR CON PAQUETE</span>
        </button>
      </div>

      {/* GRID DE PAQUETES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id_paquete}
            className="relative rounded-3xl bg-card border border-border hover:border-[#C9A24A]/60 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between p-6 group"
          >
            {/* Tag Descuento Flotante */}
            <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-[#C9A24A] text-black shadow-md shadow-[#C9A24A]/30">
              <Tag className="w-3.5 h-3.5" />
              <span>{pkg.descuento_porcentaje}% OFF</span>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C9A24A]/20 via-[#C9A24A]/10 to-[#C9A24A]/5 text-[#C9A24A] border border-[#C9A24A]/40 flex items-center justify-center shadow-sm shadow-[#C9A24A]/10 group-hover:scale-105 group-hover:border-[#C9A24A] group-hover:shadow-md transition-all duration-300">
                <ClientStarIcon className="w-6 h-6 text-[#C9A24A]" />
              </div>

              <div>
                <h3 className="text-xl font-black text-foreground group-hover:text-[#C9A24A] transition-colors">
                  {pkg.nombre}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {pkg.descripcion}
                </p>
              </div>

              {/* Servicios Incluidos */}
              <div className="space-y-2 pt-2 border-t border-border">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Servicios Incluidos ({pkg.servicios.length})
                </span>
                <div className="space-y-1.5">
                  {pkg.servicios.map((svc) => (
                    <div
                      key={svc.id_servicio}
                      className="flex items-center justify-between text-xs p-2 rounded-xl bg-muted/40 border border-border"
                    >
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#C9A24A]" />
                        {svc.nombre}
                      </span>
                      <span className="text-muted-foreground font-mono">
                        ${Number(svc.precio).toLocaleString("es-CO")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Duración estimada */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-4 h-4 text-[#C9A24A]" />
                <span>Duración estimada: <strong>{pkg.duracionTotal} minutos</strong></span>
              </div>
            </div>

            {/* Precios y Botón Seleccionar */}
            <div className="mt-6 pt-4 border-t border-border flex flex-col gap-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-muted-foreground line-through block">
                    Precio normal: ${Number(pkg.precioOriginal).toLocaleString("es-CO")}
                  </span>
                  <span className="text-2xl font-black text-[#C9A24A]">
                    ${Number(pkg.precioFinal).toLocaleString("es-CO")}
                  </span>
                </div>

                <span className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                  Ahorras ${Number(pkg.ahorro).toLocaleString("es-CO")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedPackage(pkg)}
                  className="py-2.5 px-3 rounded-xl border border-border hover:bg-accent text-foreground text-xs font-bold transition-colors text-center cursor-pointer"
                >
                  Ver Detalles
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`/portal/agendar?paquete=${pkg.id_paquete}`)}
                  className="py-2.5 px-3 rounded-xl bg-[#C9A24A] hover:bg-[#d8b056] text-black font-extrabold text-xs shadow-md shadow-[#C9A24A]/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Seleccionar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DETALLE DE PAQUETE */}
      {selectedPackage && (
        <Modal title={selectedPackage.nombre} onClose={() => setSelectedPackage(null)} maxWidthClass="max-w-md">
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#C9A24A]/15 to-transparent border border-[#C9A24A]/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#C9A24A] uppercase tracking-wider">
                  Descuento Aplicado: {selectedPackage.descuento_porcentaje}%
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-500">
                  Ahorro: ${Number(selectedPackage.ahorro).toLocaleString("es-CO")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {selectedPackage.descripcion}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Servicios del Combo
              </span>
              <div className="space-y-1.5">
                {selectedPackage.servicios.map((s) => (
                  <div key={s.id_servicio} className="p-2.5 rounded-xl bg-muted/40 border border-border flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-foreground">{s.nombre}</p>
                      <p className="text-[11px] text-muted-foreground">{s.duracion_minutos} minutos</p>
                    </div>
                    <span className="font-bold text-foreground">${Number(s.precio).toLocaleString("es-CO")}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border flex justify-between items-center text-xs">
              <span className="font-semibold text-muted-foreground">Total Final con Descuento:</span>
              <span className="text-lg font-black text-[#C9A24A]">
                ${Number(selectedPackage.precioFinal).toLocaleString("es-CO")}
              </span>
            </div>

            <div className="pt-3 border-t border-border flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedPackage(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-accent cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = selectedPackage.id_paquete;
                  setSelectedPackage(null);
                  navigate(`/portal/agendar?paquete=${id}`);
                }}
                className="px-5 py-2 rounded-xl bg-[#C9A24A] text-black font-extrabold text-xs hover:bg-[#d8b056] cursor-pointer flex items-center gap-1.5"
              >
                <span>Agendar con este Paquete</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
