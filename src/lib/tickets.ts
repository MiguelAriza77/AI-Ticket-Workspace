import { query } from "./db";
import { Comment, Ticket } from "./types";

export async function listTickets(): Promise<Ticket[]> {
  const { rows } = await query<Ticket>(
    "select * from tickets order by created_at desc"
  );
  return rows;
}

export async function getTicket(id: string): Promise<Ticket | null> {
  const { rows } = await query<Ticket>("select * from tickets where id = $1", [
    id,
  ]);
  return rows[0] ?? null;
}

export async function createTicket(input: {
  customerName: string;
  requestText: string;
  attachmentUrl?: string | null;
}): Promise<Ticket> {
  const { rows } = await query<Ticket>(
    `insert into tickets (customer_name, request_text, attachment_url)
     values ($1, $2, $3)
     returning *`,
    [input.customerName, input.requestText, input.attachmentUrl || null]
  );
  return rows[0];
}

export async function applyClassification(
  id: string,
  values: { category: string; priority: string; summary: string }
): Promise<Ticket | null> {
  const { rows } = await query<Ticket>(
    `update tickets
       set category = $2, priority = $3, summary = $4, updated_at = now()
     where id = $1
     returning *`,
    [id, values.category, values.priority, values.summary]
  );
  return rows[0] ?? null;
}

export async function updateTicket(
  id: string,
  fields: { status?: string; owner?: string | null }
): Promise<Ticket | null> {
  const sets: string[] = [];
  const params: unknown[] = [id];

  if (fields.status !== undefined) {
    params.push(fields.status);
    sets.push(`status = $${params.length}`);
  }
  if (fields.owner !== undefined) {
    params.push(fields.owner || null);
    sets.push(`owner = $${params.length}`);
  }

  if (sets.length === 0) {
    return getTicket(id);
  }

  const { rows } = await query<Ticket>(
    `update tickets set ${sets.join(", ")}, updated_at = now()
     where id = $1 returning *`,
    params
  );
  return rows[0] ?? null;
}

export async function listComments(ticketId: string): Promise<Comment[]> {
  const { rows } = await query<Comment>(
    "select * from comments where ticket_id = $1 order by created_at asc",
    [ticketId]
  );
  return rows;
}

export async function addComment(
  ticketId: string,
  input: { author?: string | null; body: string }
): Promise<Comment> {
  const { rows } = await query<Comment>(
    `insert into comments (ticket_id, author, body)
     values ($1, $2, $3)
     returning *`,
    [ticketId, input.author || null, input.body]
  );
  return rows[0];
}
