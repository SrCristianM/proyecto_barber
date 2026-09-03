import { User, Phone, MessageCircle, Mail, ShieldCheck, Calendar, Lock } from "lucide-react";
import Modal from "../../shared/components/Modal";
import { ROLES } from "../../../../shared/types/database";

export default function UserDetailModal({ user, onEdit, onClose }) {
  if (!user) return null;
  const roleName = ROLES.find((r) => r.id_rol === Number(user.id_rol))?.nombre_rol || "Sin Rol";

  // Formato número para WhatsApp y Llamada
  const cleanPhone = (user.telefono || "").replace(/\D/g, "");
  const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone.startsWith("57") ? cleanPhone : `57${cleanPhone}`}` : null;
  const phoneUrl = user.telefono ? `tel:${user.telefono}` : null;
  const mailUrl = user.correo ? `mailto:${user.correo}` : null;

  return (
    <Modal title="Detalle del Usuario" onClose={onClose} maxWidthClass="max-w-2xl">
      <div className="space-y-5">
        {/* Banner Superior Unificado */}
        <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-gradient-to-r from-emerald-500/20 via-emerald-500/5 to-transparent flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-card/80 border border-border flex items-center justify-center shadow-xs">
              <User className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-foreground">{user.nombre} {user.apellido}</span>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary border border-primary/20">
                  Rol: {roleName}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Cuenta con privilegios asignados para gestión de la plataforma</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3.5 py-1 text-xs font-semibold rounded-full border ${
                user.estado === 1
                  ? "bg-success/10 text-success border-success/20"
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              {user.estado === 1 ? "● Activo" : "● Inactivo"}
            </span>
          </div>
        </div>

        {/* Tarjetas de Métricas Rápidas del Usuario */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 bg-card border border-border rounded-xl text-center shadow-2xs">
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-xs mb-1">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              <span>Rol del Sistema</span>
            </div>
            <span className="text-sm font-bold text-foreground truncate block">{roleName}</span>
          </div>

          <div className="p-3.5 bg-card border border-border rounded-xl text-center shadow-2xs">
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-xs mb-1">
              <Lock className="h-3.5 w-3.5 text-emerald-500" />
              <span>Seguridad</span>
            </div>
            <span className="text-sm font-bold text-emerald-500">Acceso Válido</span>
          </div>

          <div className="p-3.5 bg-card border border-border rounded-xl text-center shadow-2xs">
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-xs mb-1">
              <Calendar className="h-3.5 w-3.5 text-amber-500" />
              <span>Registrado</span>
            </div>
            <span className="text-xs font-bold text-foreground truncate block">{user.fecha_registro?.split(" ")[0] || "Reciente"}</span>
          </div>
        </div>

        {/* Cuadrícula de datos con el ID DE PRIMERO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-5 bg-card border border-border rounded-2xl">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              ID de Usuario
            </span>
            <p className="text-base font-bold text-foreground">#{user.id_usuario}</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Nombre Completo
            </span>
            <p className="text-base font-bold text-foreground">{user.nombre} {user.apellido}</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Rol Asignado
            </span>
            <p className="text-base font-semibold text-primary">{roleName}</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Teléfono
            </span>
            <p className="text-sm font-medium text-foreground">{user.telefono || "No especificado"}</p>
          </div>

          <div className="sm:col-span-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Correo Electrónico
            </span>
            <p className="text-sm font-medium text-foreground break-all">{user.correo}</p>
          </div>

          <div className="sm:col-span-2 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
            <span>Fecha de Registro: <strong className="text-foreground">{user.fecha_registro}</strong></span>
            <span>Estado: <strong className="text-foreground">{user.estado === 1 ? "Activo" : "Inactivo"}</strong></span>
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

        {/* Botones de acción */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onEdit}
            className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity text-sm font-semibold shadow-xs cursor-pointer"
          >
            Editar Usuario
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
