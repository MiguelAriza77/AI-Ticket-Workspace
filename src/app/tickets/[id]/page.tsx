import Link from "next/link";
import { notFound } from "next/navigation";
import { getTicket, listComments } from "@/lib/tickets";
import { formatDate } from "@/lib/format";
import { CategoryBadge, PriorityBadge, StatusBadge } from "@/components/Badges";
import TicketControls from "@/components/TicketControls";
import CommentForm from "@/components/CommentForm";

export const dynamic = "force-dynamic";

export default async function TicketDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const ticket = await getTicket(params.id);
  if (!ticket) {
    notFound();
  }

  const comments = await listComments(ticket.id);

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        ← Volver al panel
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card p-6">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="mr-1 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                {ticket.customer_name}
              </h1>
              <StatusBadge value={ticket.status} />
              <CategoryBadge value={ticket.category} />
              <PriorityBadge value={ticket.priority} />
            </div>

            {ticket.summary && (
              <div className="mt-4 rounded-lg border border-indigo-100 bg-indigo-50/60 px-4 py-3 text-sm text-slate-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-slate-200">
                <span className="font-medium text-indigo-700 dark:text-indigo-300">
                  Resumen de IA:{" "}
                </span>
                {ticket.summary}
              </div>
            )}

            <div className="mt-5">
              <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Solicitud
              </h2>
              <p className="mt-1.5 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
                {ticket.request_text}
              </p>
            </div>

            {ticket.attachment_url && (
              <div className="mt-5">
                <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Adjunto
                </h2>
                <a
                  href={ticket.attachment_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1.5 block break-all text-sm text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  {ticket.attachment_url}
                </a>
              </div>
            )}

            <p className="mt-6 border-t border-slate-100 pt-4 text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500">
              Creado {formatDate(ticket.created_at)} · Actualizado{" "}
              {formatDate(ticket.updated_at)}
            </p>
          </div>

          <div className="card p-6">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Comentarios ({comments.length})
            </h2>

            <div className="mt-5 space-y-5">
              {comments.length === 0 && (
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  Todavía no hay comentarios. Sé el primero en añadir uno.
                </p>
              )}
              {comments.map((c) => {
                const name = c.author?.trim() || "Anónimo";
                const initial = name.charAt(0).toUpperCase();
                return (
                  <div key={c.id} className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                      {initial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                          {name}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {formatDate(c.created_at)}
                        </span>
                      </div>
                      <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-slate-700 dark:text-slate-300">
                        {c.body}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 border-t border-slate-100 pt-6 dark:border-slate-800">
              <CommentForm ticketId={ticket.id} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card sticky top-20 p-6">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Gestión
            </h2>
            <div className="mt-4">
              <TicketControls ticket={ticket} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
