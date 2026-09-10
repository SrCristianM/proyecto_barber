import { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  ExternalLink,
  Volume2,
  VolumeX,
  Music2,
  Radio,
  Check,
  Sparkles,
  SlidersHorizontal,
  Link as LinkIcon,
  Headphones
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useSalonAudio } from "../context/SalonAudioContext";
import SpotifyIcon from "../../../shared/ui/SpotifyIcon";
import Modal from "../../admin/shared/components/Modal";
import { toast } from "sonner";

// Helper para extraer ID de playlist de Spotify desde URL o URI
function extractSpotifyPlaylistId(input) {
  if (!input) return null;
  const trimmed = input.trim();
  const uriMatch = trimmed.match(/spotify:playlist:([a-zA-Z0-9]+)/);
  if (uriMatch) return uriMatch[1];
  const urlMatch = trimmed.match(/playlist\/([a-zA-Z0-9]+)/);
  if (urlMatch) return urlMatch[1];
  if (/^[a-zA-Z0-9]{22}$/.test(trimmed)) return trimmed;
  return null;
}

export default function SalonAmbienceWidget() {
  const {
    isPlaying,
    isLoading,
    volume,
    isMuted,
    soundSource,
    activePlaylistId,
    activePlaylistTitle,
    isSpotifyPlaying,
    isAudioActive,
    curatedPlaylists,
    setSoundSource,
    connectSpotifyPlaylist,
    registerSpotifyController,
    notifySpotifyPlaybackUpdate,
    togglePlayback,
    setVolume,
    toggleMute
  } = useSalonAudio();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customInputUrl, setCustomInputUrl] = useState("");

  const embedContainerRef = useRef(null);
  const controllerRef = useRef(null);

  // Inicializar Spotify IFrame API Controller para sincronizar la tarjeta con el botón
  useEffect(() => {
    if (soundSource !== "spotify") return;

    let isCancelled = false;

    const setupSpotifyController = (IFrameAPI) => {
      const container = embedContainerRef.current;
      if (!container || isCancelled) return;

      // Si ya tenemos un controller activo, solo cargar el nuevo URI si cambió
      if (controllerRef.current) {
        try {
          controllerRef.current.loadUri(`spotify:playlist:${activePlaylistId}`);
        } catch (e) {
          console.warn("Error cargando nuevo URI en controller:", e);
        }
        return;
      }

      // Crear elemento host para Spotify Iframe
      container.innerHTML = "";
      const hostDiv = document.createElement("div");
      container.appendChild(hostDiv);

      const options = {
        uri: `spotify:playlist:${activePlaylistId}`,
        width: "100%",
        height: 152
      };

      try {
        IFrameAPI.createController(hostDiv, options, (EmbedController) => {
          if (isCancelled) return;
          controllerRef.current = EmbedController;
          registerSpotifyController(EmbedController);

          // Escuchar eventos de reproducción directamente del widget de Spotify
          EmbedController.addListener("playback_update", (e) => {
            if (isCancelled) return;
            const isPaused = e.data.isPaused;
            notifySpotifyPlaybackUpdate(isPaused);
          });
        });
      } catch (err) {
        console.warn("Fallo al inicializar Spotify Iframe API Controller:", err);
      }
    };

    if (window.SpotifyIframeApi) {
      setupSpotifyController(window.SpotifyIframeApi);
    } else {
      const previousReady = window.onSpotifyIframeApiReady;
      window.onSpotifyIframeApiReady = (IFrameAPI) => {
        window.SpotifyIframeApi = IFrameAPI;
        if (previousReady) previousReady(IFrameAPI);
        if (!isCancelled) setupSpotifyController(IFrameAPI);
      };
    }

    return () => {
      isCancelled = true;
    };
  }, [soundSource, activePlaylistId]);

  const handleSelectPlaylist = (playlist) => {
    connectSpotifyPlaylist(playlist);
    setIsModalOpen(false);
  };

  const handleSaveCustomUrl = (e) => {
    e.preventDefault();
    const id = extractSpotifyPlaylistId(customInputUrl);
    if (!id) {
      toast.error("Enlace o ID de Spotify inválido", {
        description:
          "Pega un enlace del tipo https://open.spotify.com/playlist/... o un código URI."
      });
      return;
    }

    connectSpotifyPlaylist(id, "Mi Playlist Personal de Spotify");
    setCustomInputUrl("");
    setIsModalOpen(false);
  };

  const spotifyWebUrl = `https://open.spotify.com/playlist/${activePlaylistId}`;

  return (
    <div className="rounded-3xl bg-card border border-border/80 p-5 sm:p-6 shadow-sm relative overflow-hidden flex flex-col justify-between gap-4 group hover:border-[#DFB755]/40 transition-all">
      {/* Fondo con resplandor suave */}
      <div
        className={`absolute top-0 right-0 w-36 h-36 rounded-bl-full pointer-events-none transition-all duration-700 ${
          soundSource === "spotify"
            ? "bg-gradient-to-bl from-[#1DB954]/15 to-transparent"
            : "bg-gradient-to-bl from-[#DFB755]/10 to-transparent"
        }`}
      />

      {/* CABECERA: TÍTULO, SELECTOR DE FUENTE Y BADGE */}
      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <div
            className={`p-2 rounded-xl transition-colors ${
              soundSource === "spotify"
                ? "bg-[#1DB954]/15 text-[#1DB954]"
                : isPlaying
                ? "bg-[#DFB755]/20 text-[#DFB755]"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {soundSource === "spotify" ? (
              <SpotifyIcon className="w-4 h-4" />
            ) : (
              <Music2 className="w-4 h-4" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#DFB755] block">
                Ambientación Sonora
              </span>
              {soundSource === "spotify" && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-[#1DB954]/15 text-[#1DB954] border border-[#1DB954]/30">
                  Spotify Link
                </span>
              )}
            </div>
            <h4 className="text-xs sm:text-sm font-black text-foreground">
              Música en Vivo del Salón
            </h4>
          </div>
        </div>

        {/* SELECTOR DE MODO: RADIO VS SPOTIFY */}
        <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border/60">
          <button
            type="button"
            onClick={() => setSoundSource("radio")}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
              soundSource === "radio"
                ? "bg-[#DFB755] text-black shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Escuchar radio ambiental en vivo"
          >
            <Radio className="w-3 h-3" />
            <span className="hidden sm:inline">Radio</span>
          </button>

          <button
            type="button"
            onClick={() => setSoundSource("spotify")}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
              soundSource === "spotify"
                ? "bg-[#1DB954] text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Conectar a Spotify y reproducir playlists oficiales"
          >
            <SpotifyIcon className="w-3 h-3" />
            <span>Spotify</span>
          </button>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL: CONDICIONAL SEGÚN LA FUENTE ACTIVA */}
      {soundSource === "spotify" ? (
        /* VISTA SPOTIFY OFICIAL CONTROLADO */
        <div className="space-y-3">
          {/* Contenedor del Iframe Oficial Controlado de Spotify */}
          <div className="rounded-2xl overflow-hidden border border-[#1DB954]/30 shadow-md bg-black/40 min-h-[152px] flex items-center justify-center relative">
            <div ref={embedContainerRef} className="w-full">
              {/* Fallback de iframe directo mientras la API inicializa */}
              <iframe
                style={{ borderRadius: "16px" }}
                src={`https://open.spotify.com/embed/playlist/${activePlaylistId}?utm_source=generator&theme=0`}
                width="100%"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title="Spotify Barber Player"
                className="w-full"
              />
            </div>
          </div>

          {/* Barra de Estado y Botones Sincronizados de Reproducción */}
          <div className="flex items-center justify-between text-xs pt-0.5 gap-2">
            <div className="flex items-center gap-2 truncate pr-2">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span
                  className={`absolute inline-flex h-full w-full rounded-full bg-[#1DB954] ${
                    isSpotifyPlaying ? "animate-ping opacity-75" : "opacity-0"
                  }`}
                />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#1DB954]" />
              </span>
              <span className="text-[11px] font-bold text-muted-foreground truncate">
                {activePlaylistTitle}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Botón sincronizado de Reproducir / Pausar (controla el mismo reproductor) */}
              <button
                type="button"
                onClick={togglePlayback}
                className={`px-3 py-1.5 rounded-xl border text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSpotifyPlaying
                    ? "bg-[#1DB954]/20 border-[#1DB954]/50 text-[#1DB954] shadow-xs"
                    : "bg-[#1DB954] hover:bg-[#1aa34a] text-white border-transparent shadow-xs"
                }`}
                title={isSpotifyPlaying ? "Pausar música de Spotify" : "Reproducir música de Spotify"}
              >
                {isSpotifyPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Pausar</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Reproducir</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-2.5 py-1.5 rounded-xl bg-muted/80 hover:bg-muted text-foreground border border-border/80 text-[11px] font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 hover:border-[#1DB954]/50"
              >
                <SlidersHorizontal className="w-3 h-3 text-[#1DB954]" />
                <span>Cambiar</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* VISTA RADIO SALÓN (STREAM LIVIANO CON DISCO GIRATORIO) */
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-muted/40 border border-border">
            {/* Disco de vinilo giratorio */}
            <div className="relative w-12 h-12 shrink-0">
              <motion.div
                className="w-full h-full rounded-full bg-zinc-900 border border-zinc-700 shadow-md flex items-center justify-center relative overflow-hidden"
                animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
                transition={{
                  duration: 3.5,
                  repeat: isPlaying ? Infinity : 0,
                  ease: "linear"
                }}
              >
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

            {/* Botón Play/Pause de Radio */}
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

          {/* Control de Volumen en Modo Radio */}
          <div className="flex items-center justify-between text-xs gap-3">
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

            <button
              type="button"
              onClick={() => {
                setSoundSource("spotify");
                setIsModalOpen(true);
              }}
              className="text-xs font-bold text-[#1DB954] hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <SpotifyIcon className="w-3.5 h-3.5 text-[#1DB954]" />
              <span>Conectar a Spotify</span>
            </button>
          </div>
        </div>
      )}

      {/* FOOTER DEL WIDGET: ENLACE DIRECTO A SPOTIFY */}
      <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
        <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
          <Headphones className="w-3.5 h-3.5 text-[#DFB755]" />
          <span>Experiencia acústica salón VIP</span>
        </span>

        <a
          href={spotifyWebUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold text-[#1DB954] hover:underline flex items-center gap-1 shrink-0 group/spot"
        >
          <SpotifyIcon className="w-3.5 h-3.5 group-hover/spot:scale-110 transition-transform" />
          <span>Abrir en Spotify</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* MODAL DE CONFIGURACIÓN & CONEXIÓN CON SPOTIFY */}
      <AnimatePresence>
        {isModalOpen && (
          <Modal
            title="Conexión de Audio Spotify"
            onClose={() => setIsModalOpen(false)}
            maxWidthClass="max-w-xl"
          >
            <div className="p-6 space-y-6">
              {/* Encabezado del Modal con branding Spotify */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#1DB954]/10 border border-[#1DB954]/25">
                <div className="p-3 rounded-2xl bg-[#1DB954] text-white shrink-0 shadow-md">
                  <SpotifyIcon className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-foreground">
                      Tu Turno Barber Club · Sound Studio
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-[#1DB954]/20 text-[#1DB954] border border-[#1DB954]/30">
                      Oficial
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Sincroniza la música de la barbería en tiempo real. Selecciona una de nuestras playlists curadas o conecta tu propia música favorita. Al conectarte, se activará también en el botón de la barra superior.
                  </p>
                </div>
              </div>

              {/* LISTA DE PLAYLISTS CURADAS */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                    Playlists Oficiales de la Barbería
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {curatedPlaylists.length} listas disponibles
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {curatedPlaylists.map((pl) => {
                    const isSelected = activePlaylistId === pl.id;
                    return (
                      <div
                        key={pl.id}
                        onClick={() => handleSelectPlaylist(pl)}
                        className={`group p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 relative overflow-hidden ${
                          isSelected
                            ? "bg-[#1DB954]/10 border-[#1DB954] shadow-sm ring-1 ring-[#1DB954]/40"
                            : "bg-muted/30 border-border/70 hover:border-[#1DB954]/40 hover:bg-card"
                        }`}
                      >
                        {/* Carátula */}
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-border">
                          <img
                            src={pl.image}
                            alt={pl.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-5 h-5 text-white fill-white" />
                          </div>
                        </div>

                        {/* Detalles */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                              {pl.tag}
                            </span>
                            {isSelected && (
                              <span className="text-[10px] font-black text-[#1DB954] flex items-center gap-0.5">
                                <Check className="w-3 h-3" /> Activa
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-black text-foreground truncate mt-1">
                            {pl.title}
                          </h4>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {pl.genre}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECCIÓN PERSONALIZADA: PEGAR ENLACE DE SPOTIFY */}
              <div className="pt-2 border-t border-border/60 space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-[#1DB954]" />
                  ¿Prefieres tu propia música en Spotify?
                </span>

                <form onSubmit={handleSaveCustomUrl} className="flex gap-2">
                  <input
                    type="text"
                    value={customInputUrl}
                    onChange={(e) => setCustomInputUrl(e.target.value)}
                    placeholder="Pega enlace de Spotify (https://open.spotify.com/playlist/...)"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-muted/50 border border-border focus:border-[#1DB954] text-foreground text-xs outline-none transition-all placeholder:text-muted-foreground/60"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-[#1DB954] hover:bg-[#1aa34a] text-white text-xs font-black transition-all shadow-xs cursor-pointer shrink-0 flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Conectar</span>
                  </button>
                </form>
                <p className="text-[11px] text-muted-foreground">
                  Acepta enlaces web compartidos o identificadores directos de listas públicas de Spotify.
                </p>
              </div>

              {/* ACCIONES FINALES */}
              <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                <a
                  href={spotifyWebUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#1DB954] hover:underline flex items-center gap-1"
                >
                  <SpotifyIcon className="w-3.5 h-3.5" />
                  <span>Escuchar en Spotify App</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs font-black transition-colors cursor-pointer"
                >
                  Listo
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
