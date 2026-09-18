import { createContext, useContext, useState, useRef, useEffect } from "react";
import { toast } from "sonner";

// Audio local para el modo Radio
const LOCAL_AUDIO_URL = "/assets/ambience.mp3";
const FALLBACK_AUDIO_URL = "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3";

export const CURATED_PLAYLISTS = [
  {
    id: "37i9dQZF1DXc8kgYqQLMfH",
    title: "Barber Chill & Lo-Fi Beats",
    subtitle: "Sonidos relajantes y ritmos suaves para tu sesión",
    genre: "Chillhop / Lo-Fi",
    tag: "⭐ Favorita",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80",
    audioUrl: "/assets/ambience.mp3"
  },
  {
    id: "37i9dQZF1DX186v583rmzp",
    title: "90s Golden Hip-Hop & Cuts",
    subtitle: "Boom Bap clásico, rap lírico y estilo urbano de salón",
    genre: "Hip-Hop Clásico",
    tag: "🎤 Urbana",
    image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop&q=80",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3"
  },
  {
    id: "37i9dQZF1DXbITWG1ZJKYt",
    title: "Barber Jazz & Lounge Coffee",
    subtitle: "Saxofón, piano y blues para un ambiente sofisticado",
    genre: "Jazz & Blues",
    tag: "☕ Relax VIP",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80",
    audioUrl: "/assets/ambience.mp3"
  },
  {
    id: "37i9dQZF1DX10zKzsJ2jva",
    title: "Latin Urban & Flow Barbería",
    subtitle: "Reggaeton moderno, afrobeat y ritmo caribeño",
    genre: "Urbano Latino",
    tag: "🔥 Flow",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3"
  }
];

const SalonAudioContext = createContext(null);

export function SalonAudioProvider({ children }) {
  // Estado para el modo Radio
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

  // Playlist de Spotify activa
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

  // Título personalizado si fue ingresado por URL
  const [customTitle, setCustomTitle] = useState(() => {
    try {
      return localStorage.getItem("barber_spotify_custom_title") || "";
    } catch {
      return "";
    }
  });

  // Estado de reproducción sincronizado
  const [isSpotifyPlaying, setIsSpotifyPlaying] = useState(false);

  // Control de interfaz (mantenido para compatibilidad)
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);

  // Notificación de cambio de estado desde el iframe oficial de Spotify
  const notifySpotifyPlaybackUpdate = (isPaused) => {
    const isNowPlaying = !isPaused;
    setIsSpotifyPlaying(isNowPlaying);
  };

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

  // ¿Hay música activa en el sistema? Sincronizado estrictamente con la reproducción real
  const isAudioActive = isPlaying;

  // Cambiar fuente de audio
  const setSoundSource = (newSource) => {
    setSoundSourceState(newSource);
    try {
      localStorage.setItem("barber_sound_source", newSource);
    } catch {}

    if (isPlaying && audioRef.current) {
      const currentPl = CURATED_PLAYLISTS.find((p) => p.id === activePlaylistId);
      const targetUrl =
        newSource === "spotify" && currentPl?.audioUrl
          ? currentPl.audioUrl
          : LOCAL_AUDIO_URL;

      audioRef.current.src = targetUrl;
      audioRef.current.play().catch(() => {});
    }
  };

  // Conectar y seleccionar una playlist de Spotify
  const connectSpotifyPlaylist = (playlistOrId, customName = null) => {
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

    const selectedPl = CURATED_PLAYLISTS.find((p) => p.id === id);
    const targetUrl = selectedPl?.audioUrl || LOCAL_AUDIO_URL;

    // Si la música ya estaba sonando, conmutar al nuevo audio sin detener
    if (audioRef.current && isPlaying) {
      audioRef.current.src = targetUrl;
      audioRef.current.play().catch(() => {});
    }

    toast.success(`Spotify Conectado: "${title}"`, {
      description: "Música lista. Usa el atajo superior para reproducir o pausar."
    });
  };

  // Toggle universal de reproducción: funciona en cualquier módulo y persiste al navegar
  const togglePlayback = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      setIsSpotifyPlaying(false);
      toast.info("Música del salón pausada");
    } else {
      setIsLoading(true);
      try {
        const currentPl = CURATED_PLAYLISTS.find((p) => p.id === activePlaylistId);
        const targetUrl =
          soundSource === "spotify" && currentPl?.audioUrl
            ? currentPl.audioUrl
            : LOCAL_AUDIO_URL;

        if (!audioRef.current.src || !audioRef.current.src.endsWith(targetUrl.split("/").pop())) {
          audioRef.current.src = targetUrl;
        }
        audioRef.current.volume = isMuted ? 0 : volume;
        await audioRef.current.play();
        setIsPlaying(true);
        setIsSpotifyPlaying(true);
        toast.success(
          soundSource === "spotify"
            ? `Sonando: ${activePlaylistTitle}`
            : "Música del salón sonando en vivo"
        );
      } catch (err) {
        console.warn("Fallo con audio primario, probando fallback...", err);
        try {
          audioRef.current.src = FALLBACK_AUDIO_URL;
          audioRef.current.volume = isMuted ? 0 : volume;
          await audioRef.current.play();
          setIsPlaying(true);
          setIsSpotifyPlaying(true);
          toast.success("Música del salón sonando en vivo");
        } catch (secondErr) {
          console.error("Error al reproducir audio:", secondErr);
          toast.error("Haz clic de nuevo para autorizar el audio en tu navegador.");
          setIsPlaying(false);
          setIsSpotifyPlaying(false);
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
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      }
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
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
