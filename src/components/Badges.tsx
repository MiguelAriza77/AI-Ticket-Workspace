import { Priority, Status } from "@/lib/types";

const priorityStyles: Record<Priority, string> = {
  Alta: "bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20",
  Media:
    "bg-amber-50 text-amber-700 ring-amber-600/10 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
  Baja: "bg-emerald-50 text-emerald-700 ring-emerald-600/10 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
};

const statusStyles: Record<Status, string> = {
  Abierto:
    "bg-blue-50 text-blue-700 ring-blue-600/10 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20",
  "En progreso":
    "bg-violet-50 text-violet-700 ring-violet-600/10 dark:bg-violet-500/10 dark:text-violet-400 dark:ring-violet-500/20",
  Resuelto:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/10 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
  Cerrado:
    "bg-slate-100 text-slate-600 ring-slate-500/10 dark:bg-slate-700/40 dark:text-slate-300 dark:ring-slate-600/30",
};

function Pill({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}
    >
      {label}
    </span>
  );
}

export function PriorityBadge({ value }: { value: Priority | null }) {
  if (!value)
    return <span className="text-xs text-slate-400 dark:text-slate-600">—</span>;
  return <Pill label={value} className={priorityStyles[value]} />;
}

export function StatusBadge({ value }: { value: Status }) {
  return <Pill label={value} className={statusStyles[value]} />;
}

export function CategoryBadge({ value }: { value: string | null }) {
  if (!value)
    return (
      <span className="text-xs text-slate-400 dark:text-slate-500">
        Pendiente
      </span>
    );
  return (
    <Pill
      label={value}
      className="bg-slate-100 text-slate-700 ring-slate-500/10 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"
    />
  );
}
