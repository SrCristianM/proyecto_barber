import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { Star, Sparkles, Check, User, Scissors } from "lucide-react";
import Modal from "../../admin/shared/components/Modal";
import { saveClientReview, getClientBarbers } from "../services/clientStorageService";
import { toast } from "sonner";

const RATING_LABELS = {
  1: "1 estrella • Servicio insatisfactorio",
  2: "2 estrellas • Podría mejorar",
  3: "3 estrellas • Buen servicio",
  4: "4 estrellas • ¡Muy buen servicio!",
  5: "5 estrellas • ¡Excelente experiencia VIP!"
};

export default function ReviewModal({ appointment, onClose, onReviewSaved }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedTags, setSelectedTags] = useState(["Excelente técnica", "Muy puntual"]);
  const [barbersList, setBarbersList] = useState([]);
  const [selectedBarberId, setSelectedBarberId] = useState(
    appointment?.id_barbero || appointment?.barberoId || ""
  );

  useEffect(() => {
    const list = getClientBarbers();
    setBarbersList(list);
    if (!selectedBarberId && list.length > 0) {
      // Si la cita tiene nombre de barbero, buscarlo
      if (appointment?.barberoNombre) {
        const found = list.find((b) =>
          `${b.nombre} ${b.apellido || ""}`.toLowerCase().includes(appointment.barberoNombre.toLowerCase()) ||
          appointment.barberoNombre.toLowerCase().includes((b.nombre || "").toLowerCase())
        );
        if (found) {
          setSelectedBarberId(found.id_barbero);
          return;
        }
      }
      setSelectedBarberId(list[0].id_barbero);
    }
  }, [appointment, selectedBarberId]);

  const TAG_OPTIONS = [
    "Muy puntual",
    "Excelente técnica",
    "Atención VIP",
    "Música agradable",
    "Buena conversación",
    "Local impecable"
  ];

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const triggerGoldConfetti = () => {
    try {
      confetti({
        particleCount: 65,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#DFB755", "#E8C466", "#DDAE41", "#FFFFFF"]
      });
    } catch (_) {}
  };

  const currentBarber = barbersList.find((b) => Number(b.id_barbero) === Number(selectedBarberId));
  const barberDisplayName = currentBarber
    ? `${currentBarber.nombre} ${currentBarber.apellido || ""}`.trim()
    : (appointment?.barberoNombre || "tu barbero");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validación de estrellas (1 a 5)
    if (!rating || rating < 1 || rating > 5) {
      toast.error("Por favor selecciona una calificación de 1 a 5 estrellas.");
      return;
    }

    if (!selectedBarberId && !currentBarber) {
      toast.error("Por favor selecciona al barbero que atendió tu servicio.");
      return;
    }

    const finalComment = selectedTags.length > 0
      ? `${selectedTags.join(". ")}. ${comment}`.trim()
      : comment;

    const res = saveClientReview({
      id_cita: appointment?.id_cita || null,
      id_barbero: selectedBarberId || currentBarber?.id_barbero,
      barberoNombre: barberDisplayName,
      calificacion: rating,
      comentario: finalComment
    });

    if (res.success) {
      triggerGoldConfetti();
      toast.success(`¡Gracias! Calificaste a ${barberDisplayName} con ${rating} estrellas. Su nuevo promedio es ${res.newRating} ★ (${res.totalReviews} opiniones).`);
      if (onReviewSaved) onReviewSaved(res.review);
      onClose();
    } else {
      toast.error(res.error || "No se pudo guardar la calificación.");
    }
  };

  return (
    <Modal title="Calificar Experiencia de Barbería" onClose={onClose} maxWidthClass="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#DFB755]/15 text-[#DFB755] flex items-center justify-center mx-auto border border-[#DFB755]/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-foreground">
            ¿Cómo fue tu atención con {barberDisplayName}?
          </h3>
          <p className="text-xs text-muted-foreground">
            Tu calificación actualiza el promedio de estrellas del barbero en tiempo real.
          </p>
        </div>

        {/* Si no venía de una cita con barbero fijo, selector de barbero */}
        {(!appointment?.id_barbero && barbersList.length > 1) && (
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Selecciona el Barbero:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {barbersList.map((b) => {
                const isSelected = Number(selectedBarberId) === Number(b.id_barbero);
                return (
                  <button
                    key={b.id_barbero}
                    type="button"
                    onClick={() => setSelectedBarberId(b.id_barbero)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#DFB755]/15 border-[#DFB755] text-foreground font-bold shadow-xs"
                        : "bg-card border-border hover:border-[#DFB755]/50 text-muted-foreground"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#DFB755]/20 text-[#DFB755] flex items-center justify-center shrink-0 font-bold text-xs">
                      {b.nombre.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs truncate font-bold text-foreground">{b.nombre} {b.apellido}</p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        ★ {Number(b.rating ?? b.calificacion ?? 0).toFixed(1)} ({Number(b.reviewsCount || b.total_calificaciones || 0)})
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Selector de Estrellas Interactivo */}
        <div className="text-center py-1">
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-2 transition-transform hover:scale-125 focus:outline-hidden cursor-pointer"
                title={`${star} estrellas`}
              >
                <Star
                  className={`w-9 h-9 transition-colors ${
                    star <= (hoverRating || rating)
                      ? "fill-[#DFB755] text-[#DFB755] drop-shadow-[0_2px_8px_rgba(223,183,85,0.5)]"
                      : "text-muted-foreground/30"
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-xs font-bold text-[#DFB755] mt-2">
            {RATING_LABELS[hoverRating || rating]}
          </p>
        </div>

        {/* Etiquetas de retroalimentación rápida */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
            ¿Qué fue lo más destacado?
          </label>
          <div className="flex flex-wrap gap-2">
            {TAG_OPTIONS.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    active
                      ? "bg-[#DFB755]/20 text-[#DFB755] border border-[#DFB755]/50 shadow-xs"
                      : "bg-muted/40 text-muted-foreground border border-border hover:bg-muted"
                  }`}
                >
                  {active && <Check className="w-3 h-3 text-[#DFB755]" />}
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Comentario Adicional */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Comentario u Observaciones
          </label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Escribe un mensaje para tu barbero o detalles de tu look..."
            maxLength={500}
            className="w-full px-4 py-3 rounded-2xl bg-input-background border border-input text-foreground text-sm focus:ring-2 focus:ring-[#DFB755] transition-all resize-none"
          />
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:bg-accent cursor-pointer"
          >
            Omitir por ahora
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] hover:from-[#F0CF78] hover:to-[#E8C466] text-black font-extrabold text-xs shadow-md shadow-[#DDAE41]/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            Enviar Calificación
          </button>
        </div>
      </form>
    </Modal>
  );
}
