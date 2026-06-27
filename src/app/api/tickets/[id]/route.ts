import { NextResponse } from "next/server";
import { STATUSES } from "@/lib/types";
import { getTicket, updateTicket } from "@/lib/tickets";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const ticket = await getTicket(params.id);
  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }
  return NextResponse.json(ticket);
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const fields: { status?: string; owner?: string | null } = {};

  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    fields.status = body.status;
  }

  if (body.owner !== undefined) {
    fields.owner = body.owner ? String(body.owner).trim() : null;
  }

  const ticket = await updateTicket(params.id, fields);
  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }
  return NextResponse.json(ticket);
}
