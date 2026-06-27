import { NextResponse } from "next/server";
import { classifyTicket } from "@/lib/ai";
import { applyClassification, createTicket, listTickets } from "@/lib/tickets";

export async function GET() {
  const tickets = await listTickets();
  return NextResponse.json(tickets);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const customerName = String(body.customerName ?? "").trim();
  const requestText = String(body.requestText ?? "").trim();
  const attachmentUrl = body.attachmentUrl
    ? String(body.attachmentUrl).trim()
    : null;

  if (!customerName || !requestText) {
    return NextResponse.json(
      { error: "customerName and requestText are required" },
      { status: 400 }
    );
  }

  const ticket = await createTicket({ customerName, requestText, attachmentUrl });

  // Clasificamos justo después de crear. Si la llamada al LLM falla, el ticket
  // queda guardado igualmente; el usuario puede reintentar desde el detalle.
  try {
    const result = await classifyTicket({ customerName, requestText });
    const classified = await applyClassification(ticket.id, result);
    return NextResponse.json(classified ?? ticket, { status: 201 });
  } catch (err) {
    console.error("Classification failed:", err);
    return NextResponse.json(
      { ...ticket, classificationError: (err as Error).message },
      { status: 201 }
    );
  }
}
