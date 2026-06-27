import Link from "next/link";
import NewTicketForm from "@/components/NewTicketForm";

export default function NewTicketPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Link
          href="/"
          className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          ← Volver al panel
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Nuevo ticket
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          La solicitud se clasifica con IA justo después de crearla.
        </p>
      </div>
      <NewTicketForm />
    </div>
  );
}
