import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import {
  Activity,
  Clock,
  Users,
  Scissors,
  Sparkles,
  ChevronRight,
  CircleDot,
  UserCheck
} from "lucide-react";
import {
  getLiveBarbersStatus,
  syncCatalogsFromApi
} from "../services/clientStorageService";
import { useDataSync, SYNC_ENTITIES } from "../../../shared/services/dataSyncService";

export default function SalonLiveRadar({ compact = false }) {
  const [isOpen, setIsOpen] = useState(true);
  const [currentTimeStr, setCurrentTimeStr] = useState("");
  const [radarData, setRadarData] = useState(() => getLiveBarbersStatus());

  const updateRadar = useCallback(() => {
    const status = getLiveBarbersStatus();
    setRadarData(status);

    const now = new Date();
    const hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const day = now.getDay(); // 0 = Domingo

    // Horario de atención: Lunes a Sábado 9am - 8pm, Domingos 10am - 4pm
    const openHour = day === 0 ? 10 : 9;
    const closeHour = day === 0 ? 16 : 20;

    const currentlyOpen = hours >= openHour && hours < closeHour;
    setIsOpen(currentlyOpen);
    setCurrentTimeStr(`${hours % 12 || 12}:${minutes} ${hours >= 12 ? "PM" : "AM"}`);
  }, []);

  useEffect(() => {
    updateRadar();
    syncCatalogsFromApi()
      .then(() => updateRadar())
      .catch(() => updateRadar());

    // Actualización cada 15 segundos para reflejar movimientos en tiempo real
    const interval = setInterval(updateRadar, 15000);
    return () => clearInterval(interval);
  }, [updateRadar]);

  // Sincronización reactiva con cambios de citas, barberos u horarios
  useDataSync(
    [
      SYNC_ENTITIES.BARBERS,
      SYNC_ENTITIES.APPOINTMENTS,
      SYNC_ENTITIES.SCHEDULES
    ],
    updateRadar
  );

  // Escuchar eventos globales de sincronización
  useEffect(() => {
    const handleSync = () => updateRadar();
    window.addEventListener("barber_data_sync", handleSync);
    window.addEventListener("barber_profile_updated", handleSync);
    window.addEventListener("auth_user_updated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("barber_data_sync", handleSync);
      window.removeEventListener("barber_profile_updated", handleSync);
      window.removeEventListener("auth_user_updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [updateRadar]);

  // VISTA COMPACTA (PILL EN NAVBAR SUPERIOR)
  if (compact) {
    const barberText =
      radarData.totalBarbers === 1
        ? "1 barbero en silla"
        : `${radarData.totalBarbers} barberos en silla`;

    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/90 border border-border/80 shadow-xs text-[11px] backdrop-blur-md">
        <span className="relative flex h-2 w-2">
          {isOpen && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isOpen ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-amber-500"
            }`}
          />
        </span>
        <span className="font-bold text-foreground">
          {isOpen ? "Salón Abierto" : "Cerrado"}
        </span>
        <span className="text-muted-foreground hidden lg:inline">•</span>
        <span className="text-muted-foreground hidden lg:inline">
          {isOpen ? barberText : "Abre 9:00 AM"}
        </span>
      </div>
    );
  }

  // VISTA COMPLETA (RADAR PRINCIPAL EN CLIENT DASHBOARD)
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card/90 to-background border border-[#DFB755]/30 p-5 sm:p-6 shadow-xl">
      {/* Luz neón ambiental dorada */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#DFB755]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* Ícono de pulso radar */}
            <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-[#DFB755]/15 border border-[#DFB755]/30 text-[#DFB755] shrink-0">
              <Activity className="w-6 h-6 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#DFB755]">
                  Radar de Salón en Vivo
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                  {isOpen ? "Abierto Hoy" : "Cerrado"}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-foreground mt-0.5">
                {isOpen ? "Atendiendo en tiempo real" : "Horario fuera de servicio"}
              </h3>
            </div>
          </div>

          {/* Métricas en vivo reales */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-muted/40 border border-border">
              <Users className="w-4 h-4 text-[#DFB755]" />
              <div>
                <span className="text-[10px] text-muted-foreground block">Barberos Activos</span>
                <span className="font-black text-foreground">
                  {radarData.freeBarbers > 0
                    ? `${radarData.freeBarbers} de ${radarData.totalBarbers} Disponibles`
                    : `${radarData.totalBarbers} en servicio`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-muted/40 border border-border">
              <Clock className="w-4 h-4 text-[#DFB755]" />
              <div>
                <span className="text-[10px] text-muted-foreground block">Espera Estimada</span>
                <span className="font-black text-foreground">{radarData.estimatedWaitTime}</span>
              </div>
            </div>

            <Link
              to="/portal/agendar"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black font-extrabold text-xs shadow-md shadow-[#DDAE41]/20 transition-all hover:scale-105 active:scale-95 ml-auto sm:ml-0"
            >
              <span>Tomar Turno</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* TIRA DE MOVIMIENTOS DE LOS BARBEROS EN TIEMPO REAL */}
        {isOpen && radarData.barbers.length > 0 && (
          <div className="pt-3.5 border-t border-border/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <CircleDot className="w-3 h-3 text-emerald-500 animate-pulse" />
                Movimientos de barberos en tiempo real:
              </span>
              <span className="text-[10px] text-muted-foreground font-semibold">
                {radarData.freeBarbers} de {radarData.totalBarbers} libres para atención inmediata
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {radarData.barbers.map((b) => (
                <div
                  key={b.id_barbero}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-muted/20 border border-border/70 hover:border-[#DFB755]/40 transition-all text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-9 h-9 rounded-xl overflow-hidden bg-muted border border-border flex items-center justify-center font-bold text-[#DFB755]">
                        {b.imagen_url ? (
                          <img
                            src={b.imagen_url}
                            alt={b.nombre}
                            width="36"
                            height="36"
                            decoding="async"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{b.nombre[0]}</span>
                        )}
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card ${
                          b.isBusy ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        title={b.isBusy ? "En atención" : "En silla disponible"}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-extrabold text-foreground truncate">
                          {b.nombre} {b.apellido || ""}
                        </p>
                        {b.badge && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-[#DFB755]/15 text-[#DFB755] hidden sm:inline">
                            {b.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] truncate">
                        {b.isBusy ? (
                          <span className="text-amber-500 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping shrink-0" />
                            {b.movementDescription}
                          </span>
                        ) : (
                          <span className="text-emerald-500 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            {b.statusText}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/portal/agendar?barbero=${b.id_barbero}`}
                    className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold bg-[#DFB755]/15 hover:bg-[#DFB755] text-[#DFB755] hover:text-black transition-colors shrink-0 flex items-center gap-1 ml-2 cursor-pointer"
                  >
                    <span>Turno</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
