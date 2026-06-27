"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CommentForm({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/tickets/${ticketId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: author.trim(), body: body.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo añadir el comentario");
      }
      // Limpiamos solo el mensaje; mantenemos el nombre para comentarios seguidos.
      setBody("");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Añadir comentario
      </h3>
      <input
        type="text"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        placeholder="Tu nombre (opcional)"
        className="field"
      />
      <textarea
        rows={3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Escribe un comentario..."
        className="field resize-y"
      />
      {error && (
        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
      )}
      <button
        type="submit"
        disabled={submitting || !body.trim()}
        className="btn-primary"
      >
        {submitting ? "Publicando..." : "Publicar comentario"}
      </button>
    </form>
  );
}
