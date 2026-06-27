"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewTicketForm() {
  const router = useRouter();
  const [customerName, setCustomerName] = useState("");
  const [requestText, setRequestText] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName, requestText, attachmentUrl }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Ha ocurrido un error");
      }

      router.push(`/tickets/${data.id}`);
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5 p-6">
      <div>
        <label className="label">Nombre del cliente</label>
        <input
          type="text"
          required
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="field mt-1.5"
          placeholder="Acme S.L."
        />
      </div>

      <div>
        <label className="label">Solicitud</label>
        <textarea
          required
          rows={6}
          value={requestText}
          onChange={(e) => setRequestText(e.target.value)}
          className="field mt-1.5 resize-y"
          placeholder="Describe la solicitud operativa..."
        />
      </div>

      <div>
        <label className="label">
          URL de adjunto{" "}
          <span className="font-normal text-slate-400 dark:text-slate-500">
            (opcional)
          </span>
        </label>
        <input
          type="url"
          value={attachmentUrl}
          onChange={(e) => setAttachmentUrl(e.target.value)}
          className="field mt-1.5"
          placeholder="https://..."
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </p>
      )}

      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting ? "Creando y clasificando..." : "Crear ticket"}
      </button>
    </form>
  );
}
