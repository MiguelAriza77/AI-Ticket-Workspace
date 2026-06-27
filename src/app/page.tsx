import Link from "next/link";
import { listTickets } from "@/lib/tickets";
import { formatDate } from "@/lib/format";
import { CategoryBadge, PriorityBadge, StatusBadge } from "@/components/Badges";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-1 text-3xl font-semibold tracking-tight ${accent}`}>
        {value}
      </p>
    </div>
  );
}

export default async function DashboardPage() {
  const tickets = await listTickets();

  const open = tickets.filter(
    (t) => t.status === "Abierto" || t.status === "En progreso"
  ).length;
  const highPriority = tickets.filter((t) => t.priority === "Alta").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Panel
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Vista general de todos los tickets y su clasificación.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total de tickets"
          value={tickets.length}
          accent="text-slate-900 dark:text-white"
        />
        <StatCard
          label="Abiertos"
          value={open}
          accent="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          label="Prioridad alta"
          value={highPriority}
          accent="text-red-600 dark:text-red-400"
        />
      </div>

      {tickets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-16 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="text-slate-500 dark:text-slate-400">
            Todavía no hay tickets.
          </p>
          <Link
            href="/tickets/new"
            className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Crear el primero
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-medium">Cliente</th>
                  <th className="px-5 py-3 font-medium">Resumen</th>
                  <th className="px-5 py-3 font-medium">Categoría</th>
                  <th className="px-5 py-3 font-medium">Prioridad</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3 font-medium">Creado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/tickets/${ticket.id}`}
                        className="font-medium text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
                      >
                        {ticket.customer_name}
                      </Link>
                    </td>
                    <td className="max-w-sm px-5 py-4 text-slate-600 dark:text-slate-400">
                      <span className="line-clamp-2">
                        {ticket.summary ?? ticket.request_text}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <CategoryBadge value={ticket.category} />
                    </td>
                    <td className="px-5 py-4">
                      <PriorityBadge value={ticket.priority} />
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge value={ticket.status} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-500 dark:text-slate-400">
                      {formatDate(ticket.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
