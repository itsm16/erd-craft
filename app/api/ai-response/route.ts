import { getAiResponseStream } from "@/lib/ai";

export async function POST(request: Request) {
  const body = await request.json();
  const { prompt } = body;

  const stream = getAiResponseStream(
    process.env.NEXT_PUBLIC_GEMINI_API_KEY!,
    prompt
  );

  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const data = JSON.stringify({ text: chunk, done: false });
          controller.enqueue(encoder.encode(data + "\n"));
        }
        controller.enqueue(encoder.encode(JSON.stringify({ done: true }) + "\n"));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Stream failed";
        controller.enqueue(
          encoder.encode(
            JSON.stringify({ error: message, done: true }) + "\n"
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    },
  });
}