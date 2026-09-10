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

  // Estado real de reproducción de Spotify sincronizado mediante Spotify IFrame API
  const [isSpotifyPlaying, setIsSpotifyPlaying] = useState(false);

  // Referencia al controlador de Spotify iFrame API
  const spotifyControllerRef = useRef(null);

  // Registrar el controlador de Spotify desde el widget
  const registerSpotifyController = (controller) => {
    spotifyControllerRef.current = controller;
  };

  // Notificación de cambio de estado desde el iframe oficial de Spotify
  const notifySpotifyPlaybackUpdate = (isPaused) => {
    const isNowPlaying = !isPaused;
    setIsSpotifyPlaying(isNowPlaying);

    // Cuando Spotify está sonando, asegurar 100% que la radio local esté pausada
    if (isNowPlaying && audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
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

  // ¿Hay música activa en el sistema?
  const isAudioActive =
    soundSource === "spotify" ? isSpotifyPlaying : isPlaying;

  // Cambiar fuente de audio
  const setSoundSource = (newSource) => {
    setSoundSourceState(newSource);
    try {
      localStorage.setItem("barber_sound_source", newSource);
    } catch {}

    if (newSource === "spotify") {
      // Pausar audio local para que NUNCA suene radio al mismo tiempo que Spotify
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    } else if (newSource === "radio") {
      // Pausar Spotify si estuviera reproduciéndose
      if (spotifyControllerRef.current) {
        spotifyControllerRef.current.pause();
      }
      setIsSpotifyPlaying(false);
    }
  };

  // Conectar y reproducir una playlist de Spotify
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

    // Pausar audio local para evitar doble sonido
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    // Cargar la nueva URI en el controlador de Spotify
    if (spotifyControllerRef.current) {
      spotifyControllerRef.current.loadUri(`spotify:playlist:${id}`);
      spotifyControllerRef.current.play();
    }

    toast.success(`Spotify Conectado: "${title}"`, {
      description: "Música sincronizada con el botón de la barra superior."
    });
  };

  // Toggle universal de reproducción
  // En modo Spotify: controla el reproductor de Spotify oficial
  // En modo Radio: controla el audio local
  const togglePlayback = async () => {
    if (soundSource === "spotify") {
      // Asegurar que la radio esté silenciada/pausada
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }

      if (spotifyControllerRef.current) {
        spotifyControllerRef.current.togglePlay();
      } else {
        setIsSpotifyPlaying((prev) => !prev);
      }
      return;
    }

    // Modo Radio
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      toast.info("Radio del salón pausada");
    } else {
      setIsLoading(true);
      try {
        if (!audioRef.current.src || !audioRef.current.src.includes("ambience.mp3")) {
          audioRef.current.src = LOCAL_AUDIO_URL;
        }
        audioRef.current.volume = isMuted ? 0 : volume;
        await audioRef.current.play();
        setIsPlaying(true);
        toast.success("Música del salón sonando en vivo");
      } catch (err) {
        console.warn("Fallo con audio local, probando fallback...", err);
        try {
          audioRef.current.src = FALLBACK_AUDIO_URL;
          audioRef.current.volume = isMuted ? 0 : volume;
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (secondErr) {
          console.error("Error al reproducir audio:", secondErr);
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
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      }
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (spotifyControllerRef.current) {
      spotifyControllerRef.current.pause();
    }
    setIsPlaying(false);
    setIsSpotifyPlaying(false);
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
        registerSpotifyController,
        notifySpotifyPlaybackUpdate,
        togglePlayback,
        setVolume,
        toggleMute,
        pauseAudio
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
