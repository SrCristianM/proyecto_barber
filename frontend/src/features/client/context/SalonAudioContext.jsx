import { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";

// Audio local exclusivo para el modo Radio
const LOCAL_AUDIO_URL = "/assets/ambience.mp3";
const FALLBACK_AUDIO_URL = "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3";

export const CURATED_PLAYLISTS = [
  {
    id: "37i9dQZF1DXc8kgYqQLMfH",
    title: "Barber Chill & Lo-Fi Beats",
    subtitle: "Sonidos relajantes y ritmos suaves para tu sesión",
    genre: "Chillhop / Lo-Fi",
    tag: "⭐ Favorita",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: "37i9dQZF1DX186v583rmzp",
    title: "90s Golden Hip-Hop & Cuts",
    subtitle: "Boom Bap clásico, rap lírico y estilo urbano de salón",
    genre: "Hip-Hop Clásico",
    tag: "🎤 Urbana",
    image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: "37i9dQZF1DXbITWG1ZJKYt",
    title: "Barber Jazz & Lounge Coffee",
    subtitle: "Saxofón, piano y blues para un ambiente sofisticado",
    genre: "Jazz & Blues",
    tag: "☕ Relax VIP",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: "37i9dQZF1DX10zKzsJ2jva",
    title: "Latin Urban & Flow Barbería",
    subtitle: "Reggaeton moderno, afrobeat y ritmo caribeño",
    genre: "Urbano Latino",
    tag: "🔥 Flow",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80"
  }
];

const SalonAudioContext = createContext(null);

export function SalonAudioProvider({ children }) {
  // Estado para el modo Radio (HTML5 Audio local)
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(() => {
    try {
      const stored = localStorage.getItem("barber_music_vol");
      return stored !== null ? Number(stored) : 0.6;
    } catch {
      return 0.6;
    }
  });
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);

  // Fuente activa: 'radio' o 'spotify'
  const [soundSource, setSoundSourceState] = useState(() => {
    try {
      return localStorage.getItem("barber_sound_source") || "radio";
    } catch {
      return "radio";
    }
  });

  // Playlist de Spotify activa (por defecto la primera curada)
  const [activePlaylistId, setActivePlaylistId] = useState(() => {
    try {
      return (
        localStorage.getItem("barber_spotify_playlist_id") ||
        CURATED_PLAYLISTS[0].id
      );
    } catch {
      return CURATED_PLAYLISTS[0].id;
    }
  });

  // Título personalizado si fue ingresado por URL externa
  const [customTitle, setCustomTitle] = useState(() => {
    try {
      return localStorage.getItem("barber_spotify_custom_title") || "";
    } catch {
      return "";
    }
  });

  // Estado de reproducción de Spotify sincronizado
  const [isSpotifyPlaying, setIsSpotifyPlaying] = useState(false);
  const spotifyControllerRef = useRef(null);

  // Control de interfaz (mantenido para compatibilidad)
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);

  // Enviar comandos al reproductor de Spotify (iFrame API o postMessage)
  const sendSpotifyCommand = useCallback((command) => {
    if (spotifyControllerRef.current) {
      try {
        if (command === "play") spotifyControllerRef.current.play();
        else if (command === "pause") spotifyControllerRef.current.pause();
        else if (command === "toggle") spotifyControllerRef.current.togglePlay();
      } catch (err) {
        console.warn("Spotify controller command falló:", err);
      }
    }

    try {
      const iframes = document.querySelectorAll('iframe[src*="spotify.com/embed"]');
      iframes.forEach((iframe) => {
        iframe.contentWindow?.postMessage({ command }, "*");
      });
    } catch {}
  }, []);

  // Notificación de cambio de estado desde el iframe oficial de Spotify
  const notifySpotifyPlaybackUpdate = useCallback((isPaused) => {
    const isNowPlaying = !isPaused;
    setIsSpotifyPlaying(isNowPlaying);
    if (isNowPlaying) {
      // Si Spotify empieza a sonar, pausar de inmediato el audio local de radio
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, []);

  // Escuchar mensajes de estado emitidos por Spotify Embed para sincronizar Play/Pause
  useEffect(() => {
    const handleMessage = (event) => {
      if (!event.origin || !event.origin.includes("spotify.com")) return;
      try {
        const rawData = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (!rawData) return;

        // Comprobación de estado de reproducción
        if (rawData.type === "playback_update" || rawData.payload) {
          const payload = rawData.payload || rawData;
          const isPaused = payload.isPaused ?? payload.paused;
          if (typeof isPaused === "boolean") {
            notifySpotifyPlaybackUpdate(isPaused);
          }
        }
      } catch {}
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [notifySpotifyPlaybackUpdate]);

  // Sincronizar volumen en el elemento HTML5 Audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
    try {
      localStorage.setItem("barber_music_vol", String(volume));
    } catch {}
  }, [volume, isMuted]);

  // Información de la lista activa
  const currentCurated = CURATED_PLAYLISTS.find((p) => p.id === activePlaylistId);
  const activePlaylistTitle =
    customTitle || (currentCurated ? currentCurated.title : "Barber Spotify Playlist");

  // ¿Hay música activa en el sistema? Sincronizado estrictamente con la fuente activa
  const isAudioActive = soundSource === "spotify" ? isSpotifyPlaying : isPlaying;

  // Cambiar fuente de audio (Radio vs Spotify) garantizando exclusión mutua estricta
  const setSoundSource = (newSource) => {
    setSoundSourceState(newSource);
    try {
      localStorage.setItem("barber_sound_source", newSource);
    } catch {}

    if (newSource === "spotify") {
      // Pausar y silenciar radio local si estaba sonando
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      // Pausar Spotify si estaba activo
      sendSpotifyCommand("pause");
      setIsSpotifyPlaying(false);
    }
  };

  // Conectar y seleccionar UNA playlist de Spotify desde el recuadro o enlace
  const connectSpotifyPlaylist = (playlistOrId, customName = null) => {
    // 1. Pausar obligatoriamente cualquier audio local para garantizar cero solapamiento
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);

    let id = "";
    let title = "";

    if (typeof playlistOrId === "object" && playlistOrId !== null) {
      id = playlistOrId.id;
      title = playlistOrId.title;
      setCustomTitle("");
      try {
        localStorage.removeItem("barber_spotify_custom_title");
      } catch {}
    } else {
      id = playlistOrId;
      title = customName || "Mi Playlist de Spotify";
      setCustomTitle(title);
      try {
        localStorage.setItem("barber_spotify_custom_title", title);
      } catch {}
    }

    setActivePlaylistId(id);
    setSoundSourceState("spotify");

    try {
      localStorage.setItem("barber_sound_source", "spotify");
      localStorage.setItem("barber_spotify_playlist_id", id);
    } catch {}

    // Cargar la nueva entidad en el controlador si existe
    if (spotifyControllerRef.current) {
      try {
        spotifyControllerRef.current.loadUri(`spotify:playlist:${id}`);
        spotifyControllerRef.current.play();
      } catch {}
    }

    // Indicar que la lista seleccionada es la única activa
    sendSpotifyCommand("play");
    sendSpotifyCommand("toggle");
    setIsSpotifyPlaying(true);

    toast.success(`Spotify Conectado: "${title}"`, {
      description: "Playlist activa en el salón. Solo esta lista sonará."
    });
  };

  // Toggle universal de reproducción: funciona desde botón rápido o tarjeta sin reproducir dos a la vez
  const togglePlayback = async () => {
    // SI ESTAMOS EN MODO SPOTIFY
    if (soundSource === "spotify") {
      // 1. Asegurar que el elemento de audio HTML5 local esté COMPLETAMENTE pausado
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }

      // 2. Conmutar estado de Spotify
      if (isSpotifyPlaying) {
        sendSpotifyCommand("pause");
        setIsSpotifyPlaying(false);
        toast.info("Spotify pausado");
      } else {
        sendSpotifyCommand("play");
        sendSpotifyCommand("toggle");
        setIsSpotifyPlaying(true);
        toast.success(`Sonando: ${activePlaylistTitle}`);
      }
      return;
    }

    // SI ESTAMOS EN MODO RADIO (HTML5 Audio)
    // 1. Asegurar que Spotify esté pausado
    sendSpotifyCommand("pause");
    setIsSpotifyPlaying(false);

    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      toast.info("Música del salón pausada");
    } else {
      setIsLoading(true);
      try {
        if (!audioRef.current.src || !audioRef.current.src.endsWith("ambience.mp3")) {
          audioRef.current.src = LOCAL_AUDIO_URL;
        }
        audioRef.current.volume = isMuted ? 0 : volume;
        await audioRef.current.play();
        setIsPlaying(true);
        toast.success("Música del salón sonando en vivo");
      } catch (err) {
        console.warn("Fallo audio primario de radio, probando fallback...", err);
        try {
          audioRef.current.src = FALLBACK_AUDIO_URL;
          audioRef.current.volume = isMuted ? 0 : volume;
          await audioRef.current.play();
          setIsPlaying(true);
          toast.success("Música del salón sonando en vivo");
        } catch (secondErr) {
          console.error("Error al reproducir audio de radio:", secondErr);
          toast.error("Haz clic de nuevo para autorizar el audio en tu navegador.");
          setIsPlaying(false);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const setVolume = (val) => {
    setVolumeState(val);
    if (isMuted && val > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const handleAudioError = () => {
    if (audioRef.current && audioRef.current.src !== FALLBACK_AUDIO_URL) {
      audioRef.current.src = FALLBACK_AUDIO_URL;
      if (isPlaying && soundSource === "radio") {
        audioRef.current.play().catch(() => {});
      }
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    sendSpotifyCommand("pause");
    setIsPlaying(false);
    setIsSpotifyPlaying(false);
    setIsPlayerVisible(false);
    setIsPlayerExpanded(false);
  };

  return (
    <SalonAudioContext.Provider
      value={{
        isPlaying,
        isLoading,
        volume,
        isMuted,
        soundSource,
        activePlaylistId,
        activePlaylistTitle,
        isSpotifyPlaying,
        isAudioActive,
        curatedPlaylists: CURATED_PLAYLISTS,
        setSoundSource,
        connectSpotifyPlaylist,
        notifySpotifyPlaybackUpdate,
        sendSpotifyCommand,
        spotifyControllerRef,
        togglePlayback,
        setVolume,
        toggleMute,
        pauseAudio,
        isPlayerExpanded,
        setIsPlayerExpanded,
        isPlayerVisible,
        setIsPlayerVisible
      }}
    >
      {/* Elemento de audio HTML5 global EXCLUSIVO para modo Radio */}
      <audio
        ref={audioRef}
        src={LOCAL_AUDIO_URL}
        preload="auto"
        loop
        onError={handleAudioError}
        onEnded={() => setIsPlaying(false)}
      />

      {children}
    </SalonAudioContext.Provider>
  );
}

export function useSalonAudio() {
  const context = useContext(SalonAudioContext);
  if (!context) {
    throw new Error("useSalonAudio debe ser usado dentro de un SalonAudioProvider");
  }
  return context;
}
