import { Play, Pause, ExternalLink, Volume2, VolumeX, Music2 } from "lucide-react";
import { motion } from "motion/react";
import { useSalonAudio } from "../context/SalonAudioContext";

export default function SalonAmbienceWidget() {
  const {
    isPlaying,
    isLoading,
    volume,
    isMuted,
    togglePlayback,
    setVolume,
    toggleMute
  } = useSalonAudio();

  return (
    <div className="rounded-3xl bg-card border border-border/80 p-5 sm:p-6 shadow-sm relative overflow-hidden flex flex-col justify-between gap-4">
      {/* Fondo con brillo vinilo */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#DFB755]/10 to-transparent rounded-bl-full pointer-events-none" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`p-2 rounded-xl transition-colors ${
              isPlaying ? "bg-[#DFB755]/20 text-[#DFB755]" : "bg-muted text-muted-foreground"
            }`}
          >
            <Music2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#DFB755] block">
              Ambientación Sonora
            </span>
            <h4 className="text-xs sm:text-sm font-black text-foreground">
              Música en Vivo del Salón
            </h4>
          </div>
        </div>

        {/* Ecualizador animado (sólo se mueve si está sonando) */}
        <div className="flex items-end gap-1 h-5 px-2">
          {[40, 85, 55, 100, 70, 45].map((h, i) => (
            <motion.span
              key={i}
              className={`w-1 rounded-full transition-colors ${
                isPlaying ? "bg-[#DFB755]" : "bg-muted-foreground/30"
              }`}
              animate={
                isPlaying
                  ? { height: [`${h * 0.25}%`, `${h}%`, `${h * 0.35}%`] }
                  : { height: "15%" }
              }
              transition={{
                duration: 0.5 + i * 0.12,
                repeat: isPlaying ? Infinity : 0,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>

      {/* Disco Vinilo y Detalle de Canción */}
      <div className="flex items-center gap-4 p-3 rounded-2xl bg-muted/40 border border-border">
        {/* Disco de vinilo giratorio */}
        <div className="relative w-12 h-12 shrink-0">
          <motion.div
            className="w-full h-full rounded-full bg-zinc-900 border border-zinc-700 shadow-md flex items-center justify-center relative overflow-hidden"
            animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 3.5, repeat: isPlaying ? Infinity : 0, ease: "linear" }}
          >
            {/* Surcos del disco */}
            <div className="absolute inset-1 rounded-full border border-zinc-800" />
            <div className="absolute inset-2 rounded-full border border-zinc-700/50" />
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                isPlaying ? "bg-[#DFB755]" : "bg-zinc-600"
              }`}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-black" />
            </div>
          </motion.div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full transition-all ${
                isPlaying
                  ? "bg-emerald-500 animate-pulse ring-2 ring-emerald-500/30"
                  : "bg-muted-foreground/40"
              }`}
            />
            <p className="text-xs font-black text-foreground truncate">
              Barber Chillhop & Smooth Jazz
            </p>
          </div>
          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
            {isPlaying
              ? "Transmitiendo en vivo sin interrupciones"
              : "Pausado (haz clic en play para escuchar)"}
          </p>
        </div>

        {/* Botón Play/Pause de ambiente */}
        <button
          type="button"
          onClick={togglePlayback}
          disabled={isLoading}
          className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 cursor-pointer transition-all shadow-xs ${
            isPlaying
              ? "bg-amber-500/15 border-amber-500/40 text-[#DFB755]"
              : "bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] border-transparent text-black"
          }`}
          title={isPlaying ? "Pausar música del salón" : "Reproducir música del salón"}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>
      </div>

      {/* Control de Volumen y Enlace a Spotify */}
      <div className="flex items-center justify-between pt-1 text-xs gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMute}
            className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            title={isMuted ? "Activar sonido" : "Silenciar"}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-destructive" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#DFB755]" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-[#DFB755]"
            title="Volumen"
          />
        </div>

        <a
          href="https://open.spotify.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold text-[#DDAE41] dark:text-[#E8C466] hover:underline flex items-center gap-1 shrink-0"
        >
          <span>Abrir en Spotify</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
