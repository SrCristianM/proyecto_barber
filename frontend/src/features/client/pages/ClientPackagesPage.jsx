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
          <span className="text-xs font-bold uppercase tracking-wider text-[#DFB755] dark:text-[#E8C466]">Combos y Promociones</span>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">Paquetes Exclusivos</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Ahorra más combinando tus servicios favoritos en una sola cita con descuentos especiales.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/portal/agendar")}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black font-extrabold text-xs shadow-md shadow-[#DDAE41]/25 transition-all flex items-center gap-2 self-start md:self-auto cursor-pointer"
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
            className="relative rounded-3xl bg-card border border-border hover:border-[#DFB755]/60 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between p-6 group"
          >
            {/* Tag Descuento Flotante */}
            <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-[#E8C466] to-[#DDAE41] text-black shadow-md shadow-[#DDAE41]/25">
              <Tag className="w-3.5 h-3.5" />
              <span>{pkg.descuento_porcentaje}% OFF</span>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#DFB755]/25 via-[#DFB755]/10 to-transparent text-[#DFB755] dark:text-[#E8C466] border border-[#DFB755]/40 flex items-center justify-center shadow-sm shadow-[#DFB755]/15 group-hover:scale-105 group-hover:border-[#DFB755] group-hover:shadow-md transition-all duration-300">
                <ClientStarIcon className="w-6 h-6 text-[#DFB755] dark:text-[#E8C466]" />
              </div>

              <div>
                <h3 className="text-xl font-black text-foreground group-hover:text-[#DFB755] transition-colors">
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
                        <Check className="w-3.5 h-3.5 text-[#DFB755]" />
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
                <Clock className="w-4 h-4 text-[#DFB755]" />
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
                  <span className="text-2xl font-black text-[#DDAE41] dark:text-[#E8C466]">
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
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black font-extrabold text-xs shadow-md shadow-[#DDAE41]/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
        <Modal title={selectedPackage.nombre} onClose={() => setSelectedPackage(null)} maxWidthClass="max-w-lg">
          <div className="space-y-5">
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#DFB755]/20 via-[#DFB755]/10 to-transparent border border-[#DFB755]/30">
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-[#DFB755] dark:text-[#E8C466] uppercase tracking-wider">
                  Descuento: {selectedPackage.descuento_porcentaje}%
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-500">
                  Ahorro: ${Number(selectedPackage.ahorro).toLocaleString("es-CO")}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                {selectedPackage.descripcion}
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Servicios Incluidos en el Combo
              </span>
              <div className="space-y-2">
                {selectedPackage.servicios.map((s) => (
                  <div key={s.id_servicio} className="p-3.5 rounded-xl bg-muted/40 border border-border flex justify-between items-center text-sm">
                    <div>
                      <p className="font-bold text-foreground">{s.nombre}</p>
                      <p className="text-xs text-muted-foreground">{s.duracion_minutos} minutos de atención</p>
                    </div>
                    <span className="font-bold text-foreground">${Number(s.precio).toLocaleString("es-CO")}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-muted/40 border border-border flex justify-between items-center">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground block">Precio Final Combo</span>
                <span className="text-xs text-emerald-500 font-medium">Incluye todos los servicios</span>
              </div>
              <span className="text-2xl font-black text-[#DDAE41] dark:text-[#E8C466]">
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
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black font-extrabold text-xs cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#DDAE41]/20 transition-all"
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
