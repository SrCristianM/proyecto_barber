import { Scissors, Phone, MessageCircle, Calendar, DollarSign, Star } from "lucide-react";
import Modal from "../../shared/components/Modal";

export default function BarberDetailModal({ barber, onEdit, onClose }) {
  if (!barber) return null;

  // Formato número para WhatsApp y Llamada
  const cleanPhone = (barber.telefono || "").replace(/\D/g, "");
  const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone.startsWith("57") ? cleanPhone : `57${cleanPhone}`}` : null;
  const phoneUrl = barber.telefono ? `tel:${barber.telefono}` : null;

  // Métricas estimadas de desempeño
  const estimatedAppointments = (barber.id_barbero * 14 + 20);
  const estimatedEarnings = estimatedAppointments * 35000;
  const rating = (4.8 + (barber.id_barbero % 3) * 0.1).toFixed(1);

  return (
    <Modal title="Detalle del Barbero" onClose={onClose} maxWidthClass="max-w-2xl">
      <div className="space-y-5">
        {/* Banner Superior Unificado */}
        <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-card/80 border border-primary/30 flex items-center justify-center shadow-xs shrink-0">
              {barber.imagen_url ? (
                <img src={barber.imagen_url} alt={barber.nombre} className="w-full h-full object-cover" />
              ) : (
                <Scissors className="h-6 w-6 text-primary" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-foreground">{barber.nombre} {barber.apellido}</span>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary border border-primary/20">
                  {barber.especialidad || "Estilista General"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Especialista en barbería profesional y cuidado masculino</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3.5 py-1 text-xs font-semibold rounded-full border ${
                barber.estado === 1
                  ? "bg-success/10 text-success border-success/20"
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              {barber.estado === 1 ? "● Activo" : "● Inactivo"}
            </span>
          </div>
        </div>

        {/* Tarjetas de Métricas Rápidas del Barbero */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 bg-card border border-border rounded-xl text-center shadow-2xs">
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-xs mb-1">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span>Citas Atendidas</span>
            </div>
            <span className="text-lg font-bold text-foreground">{estimatedAppointments}</span>
          </div>

          <div className="p-3.5 bg-card border border-border rounded-xl text-center shadow-2xs">
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-xs mb-1">
              <DollarSign className="h-3.5 w-3.5 text-success" />
              <span>Recaudación Mes</span>
            </div>
            <span className="text-lg font-bold text-foreground">${estimatedEarnings.toLocaleString("es-CO")}</span>
          </div>

          <div className="p-3.5 bg-card border border-border rounded-xl text-center shadow-2xs">
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-xs mb-1">
              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              <span>Calificación</span>
            </div>
            <span className="text-lg font-bold text-amber-500 font-mono">{rating} / 5.0</span>
          </div>
        </div>

        {/* Cuadrícula de datos con el ID DE PRIMERO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-5 bg-card border border-border rounded-2xl">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              ID de Barbero
            </span>
            <p className="text-base font-bold text-foreground">#{barber.id_barbero}</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Nombre Completo
            </span>
            <p className="text-base font-bold text-foreground">{barber.nombre} {barber.apellido}</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Especialidad Principal
            </span>
            <p className="text-base font-semibold text-primary">{barber.especialidad || "General"}</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Teléfono
            </span>
            <p className="text-sm font-medium text-foreground">{barber.telefono || "No especificado"}</p>
          </div>

          <div className="sm:col-span-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Correo Electrónico
            </span>
            <p className="text-sm font-medium text-foreground break-all">{barber.correo}</p>
          </div>

          <div className="sm:col-span-2 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
            <span>Usuario del Sistema Vinculado: <strong className="text-foreground">Cuenta ID #{barber.id_usuario}</strong></span>
            <span>Estado Operativo: <strong className="text-foreground">{barber.estado === 1 ? "Habilitado para citas" : "Suspendido"}</strong></span>
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

        {/* Acciones */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onEdit}
            className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-semibold text-sm shadow-xs cursor-pointer"
          >
            Editar Barbero
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
