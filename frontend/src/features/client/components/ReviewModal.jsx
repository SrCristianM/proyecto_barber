import { useState } from "react";
import confetti from "canvas-confetti";
import { Star, ThumbsUp, Sparkles, MessageSquare, Check, X } from "lucide-react";
import Modal from "../../admin/shared/components/Modal";
import { saveClientReview } from "../services/clientStorageService";
import { toast } from "sonner";

export default function ReviewModal({ appointment, onClose, onReviewSaved }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedTags, setSelectedTags] = useState(["Excelente técnica", "Muy puntual"]);

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
    confetti({
      particleCount: 65,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#DFB755", "#E8C466", "#DDAE41", "#FFFFFF"]
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalComment = selectedTags.length > 0
      ? `${selectedTags.join(". ")}. ${comment}`.trim()
      : comment;

    const res = saveClientReview({
      id_cita: appointment?.id_cita || Date.now(),
      barberoNombre: appointment?.barberoNombre || "Carlos Rodríguez",
      calificacion: rating,
      comentario: finalComment
    });

    if (res.success) {
      triggerGoldConfetti();
      toast.success("¡Muchas gracias por tu calificación!");
      if (onReviewSaved) onReviewSaved(res.review);
      onClose();
    } else {
      toast.error("No se pudo guardar la reseña.");
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
            ¿Cómo fue tu atención con {appointment?.barberoNombre || "tu barbero"}?
          </h3>
          <p className="text-xs text-muted-foreground">
            Tu opinión nos ayuda a mantener los más altos estándares de calidad.
          </p>
        </div>

        {/* Selector de Estrellas Interactivo */}
        <div className="flex items-center justify-center gap-2 py-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="p-2 transition-transform hover:scale-125 focus:outline-hidden cursor-pointer"
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  star <= (hoverRating || rating)
                    ? "fill-[#DFB755] text-[#DFB755] drop-shadow-[0_2px_8px_rgba(223,183,85,0.5)]"
                    : "text-muted-foreground/40"
                }`}
              />
            </button>
          ))}
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
