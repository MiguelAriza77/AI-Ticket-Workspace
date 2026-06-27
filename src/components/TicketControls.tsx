"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { STATUSES, Ticket } from "@/lib/types";

export default function TicketControls({ ticket }: { ticket: Ticket }) {
  const router = useRouter();
  const [status, setStatus] = useState(ticket.status);
  const [owner, setOwner] = useState(ticket.owner ?? "");
  const [saving, setSaving] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ¿Hay un cambio sin guardar en el responsable respecto a lo que ya está en BD?
  const ownerDirty = owner.trim() !== (ticket.owner ?? "");

  function flash(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2500);
  }

  async function save(fields: Record<string, unknown>, message: string) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo actualizar");
      }
      router.refresh();
      flash(message);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function reclassify() {
    setClassifying(true);
    setError(null);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}/classify`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "La clasificación falló");
      }
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setClassifying(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Estado
        </label>
        <select
          value={status}
          disabled={saving}
          onChange={(e) => {
            const next = e.target.value;
            setStatus(next as Ticket["status"]);
            save({ status: next }, "Estado actualizado");
          }}
          className="field mt-1.5"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Responsable
        </label>
        <div className="mt-1.5 flex gap-2">
          <input
            type="text"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            placeholder="Sin asignar"
            className="field"
          />
          <button
            onClick={() => save({ owner: owner.trim() }, "Responsable guardado")}
            disabled={saving || !ownerDirty}
            className="btn-secondary whitespace-nowrap"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
        {ownerDirty && (
          <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
            Hay cambios sin guardar.
          </p>
        )}
      </div>

      {!ticket.category && (
        <button
          onClick={reclassify}
          disabled={classifying}
          className="btn-primary w-full"
        >
          {classifying ? "Clasificando..." : "Clasificar con IA"}
        </button>
      )}

      {notice && (
        <p className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
          {notice}
        </p>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
