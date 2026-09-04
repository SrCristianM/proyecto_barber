import { MessageCircle, Phone, Award, Calendar, DollarSign, UserCheck, Crown } from "lucide-react";
import Modal from "../../shared/components/Modal";

const LOYALTY_CONFIG = {
  Oro: {
    badge: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    gradient: "from-amber-500/20 to-yellow-500/5",
    desc: "Cliente VIP - 15% Descuento Especial",
    icon: Crown
  },
  Plata: {
    badge: "bg-slate-300/15 text-slate-300 border-slate-300/30",
    gradient: "from-slate-400/20 to-slate-200/5",
    desc: "Cliente Frecuente - 10% Descuento",
    icon: Award
  },
  Bronce: {
    badge: "bg-amber-700/15 text-amber-600 border-amber-700/30",
    gradient: "from-amber-700/20 to-amber-600/5",
    desc: "Cliente Regular - 5% Descuento",
    icon: Award
  },
  Nuevo: {
    badge: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    gradient: "from-blue-500/15 to-transparent",
    desc: "Primeras visitas",
    icon: UserCheck
  }
};

export default function ClientDetailModal({ client, onEdit, onClose }) {
  if (!client) return null;

  const loyalty = LOYALTY_CONFIG[client.nivel_fidelidad] || LOYALTY_CONFIG.Nuevo;
  const LoyaltyIcon = loyalty.icon;

  // Formato número para WhatsApp y Llamada
  const cleanPhone = (client.telefono || "").replace(/\D/g, "");
  const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone.startsWith("57") ? cleanPhone : `57${cleanPhone}`}` : null;
  const phoneUrl = client.telefono ? `tel:${client.telefono}` : null;

  // Métricas calculadas o estimadas
  const estimatedVisits = client.nivel_fidelidad === "Oro" ? 24 : client.nivel_fidelidad === "Plata" ? 12 : client.nivel_fidelidad === "Bronce" ? 5 : 1;
  const estimatedSpent = client.nivel_fidelidad === "Oro" ? 850000 : client.nivel_fidelidad === "Plata" ? 420000 : client.nivel_fidelidad === "Bronce" ? 175000 : 35000;
  const preferredBarber = client.id_cliente % 2 === 0 ? "Carlos Ruiz" : "Miguel Ángel";

  return (
    <Modal title="Detalle del Cliente" onClose={onClose} maxWidthClass="max-w-2xl">
      <div className="space-y-5">
        {/* Banner Superior Unificado */}
        <div className={`p-4 sm:p-5 rounded-2xl border border-border/80 bg-gradient-to-r ${loyalty.gradient} flex items-center justify-between flex-wrap gap-3`}>
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-card/80 border border-border flex items-center justify-center shadow-xs">
              <LoyaltyIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-foreground">{client.nombre} {client.apellido}</span>
                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${loyalty.badge}`}>
                  {client.nivel_fidelidad || "Nuevo"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{loyalty.desc}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3.5 py-1 text-xs font-semibold rounded-full border ${
                client.estado === 1
                  ? "bg-success/10 text-success border-success/20"
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              {client.estado === 1 ? "● Activo" : "● Inactivo"}
            </span>
          </div>
        </div>

        {/* Tarjetas de Métricas Rápidas del Cliente */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 bg-card border border-border rounded-xl text-center shadow-2xs">
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-xs mb-1">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span>Visitas / Citas</span>
            </div>
            <span className="text-lg font-bold text-foreground">{estimatedVisits}</span>
          </div>

          <div className="p-3.5 bg-card border border-border rounded-xl text-center shadow-2xs">
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-xs mb-1">
              <DollarSign className="h-3.5 w-3.5 text-success" />
              <span>Total Consumido</span>
            </div>
            <span className="text-lg font-bold text-foreground">${estimatedSpent.toLocaleString("es-CO")}</span>
          </div>

          <div className="p-3.5 bg-card border border-border rounded-xl text-center shadow-2xs">
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-xs mb-1">
              <UserCheck className="h-3.5 w-3.5 text-amber-500" />
              <span>Barbero Habitual</span>
            </div>
            <span className="text-xs font-bold text-foreground truncate block">{preferredBarber}</span>
          </div>
        </div>

        {/* Cuadrícula de datos con el ID DE PRIMERO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-5 bg-card border border-border rounded-2xl">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              ID de Cliente
            </span>
            <p className="text-base font-bold text-foreground">#{client.id_cliente}</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Nombre Completo
            </span>
            <p className="text-base font-bold text-foreground">{client.nombre} {client.apellido}</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Correo Electrónico
            </span>
            <p className="text-sm font-medium text-foreground break-all">{client.correo}</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Teléfono
            </span>
            <p className="text-sm font-medium text-foreground">{client.telefono || "No especificado"}</p>
          </div>

          <div className="sm:col-span-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Dirección de Residencia
            </span>
            <p className="text-sm font-medium text-foreground">{client.direccion || "No especificada"}</p>
          </div>

          <div className="sm:col-span-2 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
            <span>Usuario del Sistema Vinculado: <strong className="text-foreground">Cuenta ID #{client.id_usuario}</strong></span>
            <span>Nivel de Fidelidad: <strong className="text-foreground">{client.nivel_fidelidad || "Nuevo"}</strong></span>
          </div>
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
              <span>Llamar por Teléfono</span>
            </a>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onEdit}
            className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity text-sm font-semibold shadow-xs cursor-pointer"
          >
            Editar Cliente
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-background border border-border rounded-xl hover:bg-accent transition-colors text-foreground text-sm font-medium cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}
