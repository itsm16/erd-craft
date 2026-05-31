import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

export const ErdResponseSchema = z.object({
  title: z.string(),
  description: z.string(),
  erd: z.string(),
});

export type ErdResponse = z.infer<typeof ErdResponseSchema>;

const SYSTEM_PROMPT = `
You are an expert database architect and ERD generation engine.

Generate production-grade normalized database schemas from natural language requirements.

Rules:

1. Use UUID primary keys.
2. Every table should contain:
   - id uuid pk
   - createdAt timestamp
   - updatedAt timestamp
3. Use proper foreign keys and relationships.
4. Use junction tables for many-to-many relationships.
5. Use concise naming conventions.
6. Supported types:
   - uuid
   - string
   - text
   - int
   - float
   - boolean
   - timestamp
   - json

ERD DSL format:

user {
  id uuid pk
  name string
}

post {
  id uuid pk
  userId uuid fk > user.id
  title string
}

Foreign keys must use:

fk > table.field

Constraints:
- pk
- fk
- unique
- nullable

Return ONLY valid JSON.

The "erd" field must contain the complete ERD DSL.
`;

const JSON_SCHEMA = {
  type: "object",
  properties: {
    title: {
      type: "string",
    },
    description: {
      type: "string",
    },
    erd: {
      type: "string",
    },
  },
  required: ["title", "description", "erd"],
} as const;

function buildConfig() {
  return {
    responseMimeType: "application/json" as const,
    responseJsonSchema: JSON_SCHEMA,
  };
}

export async function getAiResponse(
  apiKey: string,
  prompt: string
): Promise<ErdResponse> {
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
${SYSTEM_PROMPT}

USER REQUEST:
${prompt}
`,
    config: buildConfig(),
  });

  const text = response.text ?? "{}";

  return ErdResponseSchema.parse(JSON.parse(text));
}

const STREAM_SYSTEM_PROMPT = `
You are an expert database architect.

Generate production-grade normalized database schemas.

Rules:

1. Use UUID primary keys.
2. Include createdAt and updatedAt timestamps.
3. Use proper foreign keys.
4. Use junction tables for many-to-many relationships.
5. Use concise naming conventions.
6. Supported types:
   - uuid
   - string
   - text
   - int
   - float
   - boolean
   - timestamp
   - json

ERD DSL format:

user {
  id uuid pk
  name string
}

post {
  id uuid pk
  userId uuid fk > user.id
  title string
}

Foreign keys must use:

fk > table.field

Output ONLY raw ERD DSL.
No JSON.
No markdown.
No explanations.
`;

export async function* getAiResponseStream(
  apiKey: string,
  prompt: string
): AsyncGenerator<string> {
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContentStream({
    model: "gemini-3-flash-preview",
    contents: `
${STREAM_SYSTEM_PROMPT}

USER REQUEST:
${prompt}
`,
  });

  for await (const chunk of response) {
    if (chunk.text) {
      yield chunk.text;
    }
  }
}