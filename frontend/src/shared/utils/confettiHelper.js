import confetti from "canvas-confetti";

/**
 * Dispara una celebración de chispas y confeti en tonos dorados y esmeralda
 * sin ser invasivo (1.2 segundos).
 */
export function fireGoldenConfetti(opts = {}) {
  try {
    const count = opts.particleCount || 40;
    const defaults = {
      origin: { y: 0.7 },
      colors: ["#DFB755", "#E8C466", "#F3D17A", "#10B981", "#FFFFFF"],
      disableForReducedMotion: true,
      zIndex: 99999
    };

    confetti({
      ...defaults,
      particleCount: Math.floor(count * 0.6),
      spread: 60,
      startVelocity: 35,
      scalar: 0.9,
      ...opts
    });

    setTimeout(() => {
      confetti({
        ...defaults,
        particleCount: Math.floor(count * 0.4),
        spread: 100,
        startVelocity: 25,
        decay: 0.92,
        scalar: 0.8,
        ...opts
      });
    }, 150);
  } catch (err) {
    // Si canvas no está disponible en el entorno, fallar silenciosamente
  }
}

export default fireGoldenConfetti;
