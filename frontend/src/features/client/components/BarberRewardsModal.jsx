import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Award,
  Sparkles,
  Coffee,
  Tag,
  Crown,
  CheckCircle2,
  Lock,
  Gift,
  ArrowRight,
  Info
} from "lucide-react";
import Modal from "../../admin/shared/components/Modal";
import {
  getClientRewards,
  claimClientReward,
  getClientLoyaltyDetails
} from "../services/clientStorageService";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export default function BarberRewardsModal({ onClose, onRewardClaimed }) {
  const [rewards, setRewards] = useState([]);
  const [loyalty, setLoyalty] = useState(null);

  const loadData = () => {
    setRewards(getClientRewards());
    setLoyalty(getClientLoyaltyDetails());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClaim = (reward) => {
    const res = claimClientReward(reward.id);
    if (res.success) {
      // Lanzar confeti dorado
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#DFB755", "#E8C466", "#DDAE41", "#FFFFFF"]
      });
      toast.success(`¡Recompensa "${reward.titulo}" canjeada con éxito!`);
      loadData();
      if (onRewardClaimed) onRewardClaimed();
    } else {
      toast.error(res.error);
    }
  };

  const getRewardIcon = (iconName) => {
    switch (iconName) {
      case "Coffee":
        return <Coffee className="w-5 h-5 text-amber-500" />;
      case "Sparkles":
        return <Sparkles className="w-5 h-5 text-[#DFB755]" />;
      case "Tag":
        return <Tag className="w-5 h-5 text-emerald-500" />;
      case "Crown":
        return <Crown className="w-5 h-5 text-purple-500" />;
      default:
        return <Gift className="w-5 h-5 text-[#DFB755]" />;
    }
  };

  const serviciosRealizados = loyalty?.serviciosRealizados ?? loyalty?.visitsCount ?? 0;
  const sellosCiclo = loyalty?.sellosCiclo ?? (serviciosRealizados % 5 === 0 && serviciosRealizados > 0 ? 5 : serviciosRealizados % 5);
  const cortesFaltantes = loyalty?.cortesFaltantes ?? (5 - sellosCiclo);

  return (
    <Modal
      title="Club VIP · Tarjeta de Fidelidad & Recompensas"
      onClose={onClose}
      maxWidthClass="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Banner de balance de servicios y sellos */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-card via-card/90 to-[#DFB755]/15 border border-[#DFB755]/30 p-5 sm:p-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#DFB755]/20 text-[#DFB755] border border-[#DFB755]/30">
                  Nivel {loyalty?.tier || "Plata"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {serviciosRealizados} {serviciosRealizados === 1 ? "corte completado" : "cortes completados"} en total
                </span>
              </div>
              <h3 className="text-2xl font-black text-foreground">
                Tus Cortes Acumulados: <span className="text-[#DFB755]">{serviciosRealizados}</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Cada 5 cortes completados obtienes un servicio o corte 100% gratis.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-background/80 border border-border/80 text-center shrink-0 min-w-[130px]">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Tarjeta Actual</span>
              <span className="text-base font-black text-[#DFB755]">{sellosCiclo} de 5 sellos</span>
              <span className="text-[10px] text-muted-foreground block">
                {cortesFaltantes === 0 ? "¡Corte Gratis listo!" : `Faltan ${cortesFaltantes} cortes`}
              </span>
            </div>
          </div>

          {/* Mini tira de sellos en el modal */}
          <div className="mt-4 pt-3 border-t border-border/60 grid grid-cols-5 gap-1.5">
            {[1, 2, 3, 4, 5].map((num) => {
              const isStamped = sellosCiclo >= num;
              const isReward = num === 5;
              return (
                <div
                  key={num}
                  className={`py-1.5 px-2 rounded-xl text-center border text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                    isStamped
                      ? isReward
                        ? "bg-[#DFB755]/30 border-[#DFB755] text-[#FFE082] shadow-xs font-black"
                        : "bg-[#DFB755]/15 border-[#DFB755]/50 text-[#DFB755]"
                      : isReward
                      ? "bg-muted/40 border-dashed border-[#DFB755]/40 text-muted-foreground"
                      : "bg-muted/30 border-dashed border-border text-muted-foreground/60"
                  }`}
                >
                  {isStamped ? (
                    <>
                      {isReward ? <Crown className="w-3.5 h-3.5 text-[#FFE082]" /> : <CheckCircle2 className="w-3 h-3 text-[#DFB755]" />}
                      <span>{isReward ? "¡Premio!" : `#${num}`}</span>
                    </>
                  ) : (
                    <span>{isReward ? "5° Gratis" : `#${num}`}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Lista de Recompensas */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-[#DFB755]" />
              Catálogo de Recompensas por Cortes
            </h4>
            <span className="text-xs text-muted-foreground">
              {rewards.filter((r) => r.canjeado).length} de {rewards.length} canjeados
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {rewards.map((rew) => {
              const isClaimed = rew.canjeado;
              const canAfford = serviciosRealizados >= (rew.serviciosRequeridos || 0);
              const faltan = (rew.serviciosRequeridos || 0) - serviciosRealizados;

              return (
                <div
                  key={rew.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    isClaimed
                      ? "bg-emerald-500/10 border-emerald-500/30"
                      : canAfford
                      ? "bg-card border-[#DFB755]/50 shadow-sm hover:shadow-md"
                      : "bg-card/50 border-border opacity-85"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-muted/60 border border-border/60">
                        {getRewardIcon(rew.icono)}
                      </div>
                      <span
                        className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                          isClaimed
                            ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                            : canAfford
                            ? "bg-[#DFB755]/20 text-[#DFB755] border border-[#DFB755]/40"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {rew.serviciosRequeridos} {rew.serviciosRequeridos === 1 ? "CORTE" : "CORTES"}
                      </span>
                    </div>

                    <div>
                      <h5 className="text-sm font-black text-foreground">{rew.titulo}</h5>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {rew.descripcion}
                      </p>
                    </div>
                  </div>

                  {/* Botón de acción */}
                  <div className="pt-2 border-t border-border/60">
                    {isClaimed ? (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Canjeado ({rew.fechaCanje})</span>
                      </div>
                    ) : canAfford ? (
                      <button
                        type="button"
                        onClick={() => handleClaim(rew)}
                        className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black font-extrabold text-xs shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-black" />
                        <span>Reclamar Recompensa</span>
                      </button>
                    ) : (
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                          Bloqueado
                        </span>
                        <span>Faltan {faltan} {faltan === 1 ? "corte" : "cortes"}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Nota informativa */}
        <div className="p-3.5 rounded-2xl bg-muted/40 border border-border flex items-start gap-2.5 text-xs text-muted-foreground">
          <Info className="w-4 h-4 text-[#DFB755] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Muestra la pantalla de tus beneficios canjeados al barbero o en la caja al momento de pagar tu visita para hacerlos efectivos de inmediato.
          </p>
        </div>
      </div>
    </Modal>
  );
}
