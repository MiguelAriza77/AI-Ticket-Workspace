import { NextResponse } from "next/server";
import { classifyTicket } from "@/lib/ai";
import { applyClassification, getTicket } from "@/lib/tickets";

// Reintenta la clasificación con IA de un ticket existente. Útil cuando el
// primer intento falló (por ejemplo, faltaba la API key al crearlo).
export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const ticket = await getTicket(params.id);
  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  try {
    const result = await classifyTicket({
      customerName: ticket.customer_name,
      requestText: ticket.request_text,
    });
    const updated = await applyClassification(ticket.id, result);
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 502 }
    );
  }
}
