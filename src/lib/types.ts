export const CATEGORIES = [
  "Finanzas",
  "Legal",
  "Compras",
  "Operaciones",
  "Otro",
] as const;

export const PRIORITIES = ["Alta", "Media", "Baja"] as const;

export const STATUSES = [
  "Abierto",
  "En progreso",
  "Resuelto",
  "Cerrado",
] as const;

export type Category = (typeof CATEGORIES)[number];
export type Priority = (typeof PRIORITIES)[number];
export type Status = (typeof STATUSES)[number];

export interface Ticket {
  id: string;
  customer_name: string;
  request_text: string;
  attachment_url: string | null;
  category: Category | null;
  priority: Priority | null;
  summary: string | null;
  status: Status;
  owner: string | null;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  ticket_id: string;
  author: string | null;
  body: string;
  created_at: string;
}
