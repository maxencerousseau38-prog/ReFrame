import { aiEditStream } from "@/lib/llm";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { parseSiteSchema } from "@/lib/generation/validate";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/ai-edit/stream — like /api/ai-edit but streams the assistant's
 * explanation live (NDJSON lines: {"t":"…"} deltas, then a final
 * {"done":true,schema,message,changed}). Deterministic edits arrive instantly;
 * open-ended ones type out while Claude works.
 */
export async function POST(req: Request) {
  const limit = await rateLimit(`edit:${clientKey(req)}`, 30, 60_000);
  if (!limit.ok) return new Response(JSON.stringify({ done: true, error: "Too many requests." }) + "\n", { status: 429 });

  const { schema, instruction } = (await req.json().catch(() => ({}))) as { schema?: unknown; instruction?: string };
  if (!instruction || typeof instruction !== "string" || instruction.length > 1000) {
    return new Response(JSON.stringify({ done: true, error: "A short instruction is required." }) + "\n", { status: 400 });
  }
  const valid = parseSiteSchema(schema);
  if (!valid) return new Response(JSON.stringify({ done: true, error: "Invalid schema." }) + "\n", { status: 400 });

  const encoder = new TextEncoder();
  const body = new ReadableStream({
    async start(controller) {
      const line = (obj: unknown) => controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      try {
        const result = await aiEditStream(valid, instruction, (delta) => line({ t: delta }));
        line({ done: true, schema: result.schema, message: result.message, changed: result.changed });
      } catch (e) {
        line({ done: true, error: String(e) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(body, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}
