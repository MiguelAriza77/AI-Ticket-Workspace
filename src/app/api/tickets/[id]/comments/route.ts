import { NextResponse } from "next/server";
import { addComment, getTicket, listComments } from "@/lib/tickets";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const comments = await listComments(params.id);
  return NextResponse.json(comments);
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const ticket = await getTicket(params.id);
  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const text = body ? String(body.body ?? "").trim() : "";
  if (!text) {
    return NextResponse.json({ error: "Comment body is required" }, { status: 400 });
  }

  const author = body.author ? String(body.author).trim() : null;
  const comment = await addComment(params.id, { author, body: text });
  return NextResponse.json(comment, { status: 201 });
}
