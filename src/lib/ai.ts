import { CATEGORIES, PRIORITIES, Category, Priority } from "./types";

export interface Classification {
  category: Category;
  priority: Priority;
  summary: string;
}

export class ClassificationError extends Error {}

const CATEGORY_GUIDE = `- Finanzas: facturas, pagos, cobros, presupuestos, contabilidad o impuestos.
- Legal: contratos, cláusulas, cumplimiento normativo o cualquier asunto jurídico.
- Compras: adquisición de bienes o servicios, proveedores, cotizaciones y pedidos.
- Operaciones: logística, envíos, sistemas, incidencias y soporte del día a día.
- Otro: úsala solo si la solicitud no encaja con claridad en ninguna anterior.`;

const PRIORITY_GUIDE = `- Alta: bloquea la operación, hay un plazo urgente o el impacto económico o legal es grave (por ejemplo, un sistema caído o un pago que vence hoy).
- Media: es importante pero no bloquea de inmediato y tiene un plazo razonable.
- Baja: es una consulta o tarea rutinaria, sin urgencia.`;

const SYSTEM_PROMPT = `Eres un analista de soporte que clasifica tickets operativos de una empresa. Tu objetivo es leer la solicitud de un cliente y devolver una clasificación coherente y consistente.

Clasifica el ticket en tres dimensiones:

1. category — elige UNA de estas opciones, la que mejor describa el tema principal:
${CATEGORY_GUIDE}

2. priority — elige UNA según la urgencia y el impacto para el negocio:
${PRIORITY_GUIDE}

3. summary — una sola frase en español, de máximo 20 palabras, que resuma la solicitud de forma neutral y objetiva.

Reglas:
- Básate únicamente en la información del ticket. No inventes datos que no aparezcan en el texto.
- Si la solicitud es ambigua, elige la opción más probable; nunca dejes un campo vacío.
- Usa exactamente los valores indicados, respetando mayúsculas y tildes.

Formato de salida: responde SOLO con un objeto JSON válido, sin texto adicional ni markdown, con exactamente estas tres claves:
{"category": "<una de: ${CATEGORIES.join(" | ")}>", "priority": "<una de: ${PRIORITIES.join(" | ")}>", "summary": "<resumen>"}

Ejemplo:
Solicitud: "El sistema de seguimiento de envíos lleva caído toda la mañana y no podemos operar."
Respuesta: {"category": "Operaciones", "priority": "Alta", "summary": "El sistema de seguimiento de envíos está caído e impide operar con normalidad."}`;

export async function classifyTicket(input: {
  customerName: string;
  requestText: string;
}): Promise<Classification> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new ClassificationError("OPENAI_API_KEY no está configurada");
  }

  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const res = await fetchWithRetry(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Clasifica este ticket.\n\nCliente: ${input.customerName}\nSolicitud: ${input.requestText}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new ClassificationError(
      `La petición al LLM falló (${res.status}): ${detail}`
    );
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new ClassificationError("El LLM devolvió una respuesta vacía");
  }

  return normalize(content);
}

// Reintenta solo ante errores de red (fetch lanza una excepción). Cubre el caso
// típico de que el DNS de Docker aún no esté listo justo tras arrancar el
// contenedor. Las respuestas HTTP de error (401, 429...) no se reintentan aquí.
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  attempts = 3
): Promise<Response> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fetch(url, options);
    } catch (err) {
      lastError = err;
      await new Promise((resolve) => setTimeout(resolve, 600 * (i + 1)));
    }
  }
  throw lastError;
}

function normalize(raw: string): Classification {
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new ClassificationError("El LLM no devolvió un JSON válido");
  }

  const category = matchOption(parsed.category, CATEGORIES) ?? "Otro";
  const priority = matchOption(parsed.priority, PRIORITIES) ?? "Media";
  const summary =
    typeof parsed.summary === "string" && parsed.summary.trim()
      ? parsed.summary.trim()
      : "Sin resumen disponible.";

  return { category, priority, summary };
}

function matchOption<T extends readonly string[]>(
  value: unknown,
  options: T
): T[number] | null {
  if (typeof value !== "string") return null;
  const found = options.find(
    (opt) => opt.toLowerCase() === value.trim().toLowerCase()
  );
  return found ?? null;
}
