import { createContext, useContext, useState, useRef, useEffect } from "react";
import { toast } from "sonner";

const AMBIENCE_AUDIO_URL = "https://streams.ilovemusic.de/iloveradio17.mp3";
const FALLBACK_AUDIO_URL = "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3";

const SalonAudioContext = createContext(null);

export function SalonAudioProvider({ children }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(() => {
    try {
      const stored = localStorage.getItem("barber_music_vol");
      return stored !== null ? Number(stored) : 0.5;
    } catch {
      return 0.5;
    }
  });
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);

  // Sincronizar volumen en el elemento HTML5 Audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
    try {
      localStorage.setItem("barber_music_vol", String(volume));
    } catch {
      // Ignorar error de storage
    }
  }, [volume, isMuted]);

  const togglePlayback = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      try {
        if (!audioRef.current.src) {
          audioRef.current.src = AMBIENCE_AUDIO_URL;
        }
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn("Fallo con stream primario, probando fallback...", err);
        try {
          if (audioRef.current) {
            audioRef.current.src = FALLBACK_AUDIO_URL;
            await audioRef.current.play();
            setIsPlaying(true);
          }
        } catch (secondErr) {
          console.error("Error al reproducir música ambiental:", secondErr);
          toast.error("Haz clic de nuevo para habilitar el audio en tu navegador.");
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
    setIsPlaying(false);
  };

  return (
    <SalonAudioContext.Provider
      value={{
        isPlaying,
        isLoading,
        volume,
        isMuted,
        togglePlayback,
        setVolume,
        toggleMute,
        pauseAudio
      }}
    >
      {/* Elemento de audio HTML5 global persistente en el layout */}
      <audio
        ref={audioRef}
        preload="none"
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
