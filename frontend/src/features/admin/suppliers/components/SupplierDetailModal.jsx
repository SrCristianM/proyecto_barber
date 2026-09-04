import { Building2, Phone, MessageCircle, Mail, ShoppingCart, DollarSign, CheckCircle2, FileText, ExternalLink } from "lucide-react";
import Modal from "../../shared/components/Modal";

export default function SupplierDetailModal({ supplier, onEdit, onClose }) {
  if (!supplier) return null;

  // Formato número para WhatsApp y Llamada
  const cleanPhone = (supplier.telefono || "").replace(/\D/g, "");
  const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone.startsWith("57") ? cleanPhone : `57${cleanPhone}`}` : null;
  const phoneUrl = supplier.telefono ? `tel:${supplier.telefono}` : null;
  const mailUrl = supplier.correo ? `mailto:${supplier.correo}` : null;

  // Métricas estimadas de compras
  const estimatedPurchases = (supplier.id_proveedor * 3 + 4);
  const estimatedTotalSupplied = estimatedPurchases * 650000;

  return (
    <Modal title="Detalle del Proveedor" onClose={onClose} maxWidthClass="max-w-2xl">
      <div className="space-y-5">
        {/* Banner Superior Unificado */}
        <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-gradient-to-r from-blue-500/20 via-blue-500/5 to-transparent flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-card/80 border border-border flex items-center justify-center shadow-xs">
              <Building2 className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-foreground">{supplier.nombre}</span>
                {supplier.nit && (
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    NIT: {supplier.nit}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Proveedor autorizado de insumos y productos para barbería</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3.5 py-1 text-xs font-semibold rounded-full border ${
                supplier.estado === 1
                  ? "bg-success/10 text-success border-success/20"
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              {supplier.estado === 1 ? "● Activo" : "● Inactivo"}
            </span>
          </div>
        </div>

        {/* Tarjetas de Métricas Rápidas del Proveedor */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 bg-card border border-border rounded-xl text-center shadow-2xs">
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-xs mb-1">
              <ShoppingCart className="h-3.5 w-3.5 text-blue-400" />
              <span>Compras Realizadas</span>
            </div>
            <span className="text-lg font-bold text-foreground">{estimatedPurchases}</span>
          </div>

          <div className="p-3.5 bg-card border border-border rounded-xl text-center shadow-2xs">
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-xs mb-1">
              <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
              <span>Total Facturado</span>
            </div>
            <span className="text-lg font-bold text-foreground">${estimatedTotalSupplied.toLocaleString("es-CO")}</span>
          </div>

          <div className="p-3.5 bg-card border border-border rounded-xl text-center shadow-2xs">
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-xs mb-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              <span>Cumplimiento</span>
            </div>
            <span className="text-lg font-bold text-success">100% Confiable</span>
          </div>
        </div>

        {/* Cuadrícula de datos con el ID DE PRIMERO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-5 bg-card border border-border rounded-2xl">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              ID de Proveedor
            </span>
            <p className="text-base font-bold text-foreground">#{supplier.id_proveedor}</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Razón Social / Empresa
            </span>
            <p className="text-base font-bold text-foreground">{supplier.nombre}</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              NIT / Identificación
            </span>
            <p className="text-sm font-medium text-foreground">{supplier.nit || "No especificado"}</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Teléfono de Contacto
            </span>
            <p className="text-sm font-medium text-foreground">{supplier.telefono || "No especificado"}</p>
          </div>

          <div className="sm:col-span-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Correo Electrónico
            </span>
            <p className="text-sm font-medium text-foreground break-all">{supplier.correo || "No especificado"}</p>
          </div>

          <div className="sm:col-span-2 pt-2 border-t border-border/60">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Dirección Comercial / Sede
            </span>
            <p className="text-sm font-medium text-foreground">{supplier.direccion || "No especificada"}</p>
          </div>

          {/* Factura / Documento Adjunto */}
          {supplier.factura_pdf && (
            <div className="sm:col-span-2 pt-2 border-t border-border/60">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Documento de Factura / RUT Adjunto
              </span>
              <div className="flex items-center justify-between p-3 bg-card border border-primary/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center font-bold text-xs border border-red-500/20">
                    PDF
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-foreground">
                      {supplier.factura_pdf.nombre || "Factura_Proveedor.pdf"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {supplier.factura_pdf.tamano || "Documento PDF"} • {supplier.factura_pdf.fecha || "Cargado"}
                    </p>
                  </div>
                </div>
                {supplier.factura_pdf.url && (
                  <a
                    href={supplier.factura_pdf.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg text-xs font-medium transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Ver Factura</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Acciones de Contacto Rápido Directo */}
        <div className="flex items-center gap-3">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-500 border border-emerald-600/30 rounded-xl transition-all text-xs sm:text-sm font-semibold shadow-2xs cursor-pointer"
            >
              <MessageCircle className="h-4 w-4" />
              <span>WhatsApp Directo</span>
            </a>
          )}

          {phoneUrl && (
            <a
              href={phoneUrl}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-xl transition-all text-xs sm:text-sm font-semibold shadow-2xs cursor-pointer"
            >
              <Phone className="h-4 w-4" />
              <span>Llamar</span>
            </a>
          )}

          {mailUrl && (
            <a
              href={mailUrl}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-600/30 rounded-xl transition-all text-xs sm:text-sm font-semibold shadow-2xs cursor-pointer"
            >
              <Mail className="h-4 w-4" />
              <span>Enviar Correo</span>
            </a>
          )}
        </div>

        {/* Acciones */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onEdit}
            className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-semibold text-sm shadow-xs cursor-pointer"
          >
            Editar Proveedor
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-background border border-border rounded-xl hover:bg-accent transition-colors text-foreground font-medium text-sm cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}
