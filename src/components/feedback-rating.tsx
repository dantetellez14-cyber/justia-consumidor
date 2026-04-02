"use client";

import { useState } from "react";
import { Star, Send, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  readonly caseId: string | null;
  readonly onRestart: () => void;
}

export function FeedbackRating({ caseId, onRestart }: Props) {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          case_id: caseId,
          rating,
          comment: comment || null,
        }),
      });
    } catch {
      // Non-blocking: show success even if save fails
    }
    setSubmitted(true);
  };

  const ratingLabels = [
    "",
    "Muy insatisfecho",
    "Insatisfecho",
    "Neutral",
    "Satisfecho",
    "Muy satisfecho",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-lg"
    >
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div
            key="form"
            exit={{ opacity: 0, y: -20 }}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-6 text-center">
              <h3 className="text-xl font-bold text-slate-800">
                Gracias por usar JustIA
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Tu opinión nos ayuda a mejorar el servicio.
              </p>
            </div>

            {/* Star Rating */}
            <div className="mb-2 text-center">
              <p className="mb-3 text-sm font-medium text-slate-600">
                ¿Te resultó útil la plataforma?
              </p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onClick={() => setRating(star)}
                    className="p-1"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= (hoveredStar || rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-200"
                      }`}
                    />
                  </motion.button>
                ))}
              </div>
              {(hoveredStar > 0 || rating > 0) && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-xs text-slate-500"
                >
                  {ratingLabels[hoveredStar || rating]}
                </motion.p>
              )}
            </div>

            {/* Comment */}
            <div className="mt-4">
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Comentarios (opcional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Contanos qué podemos mejorar o qué te gustó..."
                className="h-24 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={rating === 0}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 py-3 text-sm font-medium text-white shadow-md transition-all hover:shadow-lg disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              Enviar Feedback
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="thanks"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-purple-100"
            >
              <Heart className="h-8 w-8 text-pink-500" />
            </motion.div>
            <h3 className="text-xl font-bold text-slate-800">
              ¡Gracias por tu feedback!
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Tu opinión nos ayuda a democratizar el acceso a la justicia.
            </p>
            <div className="mt-3 flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-200"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={onRestart}
              className="mt-6 rounded-lg border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              Analizar otro caso
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
