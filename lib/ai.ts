import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

export const ErdResponseSchema = z.object({
  title: z.string(),

  description: z.string(),

  erd: z.string(),

  tables: z.array(
    z.object({
      name: z.string(),

      fields: z.array(
        z.object({
          name: z.string(),

          type: z.string(),

          constraints: z.array(z.string()).optional(),

          relation: z
            .object({
              table: z.string(),
              field: z.string(),
            })
            .optional(),
        })
      ),
    })
  ),
});

export type ErdResponse = z.infer<
  typeof ErdResponseSchema
>;

const SYSTEM_PROMPT = `
You are an expert database architect and ERD generation engine.

Your task is to generate clean, production-grade database schemas from natural language prompts.

You MUST think like a senior backend engineer.

Rules:

1. Always generate normalized schemas.

2. Prefer UUIDs for primary keys.

3. Every table should have:
- id uuid pk
- createdAt timestamp
- updatedAt timestamp

unless explicitly unnecessary.

4. Use realistic relational modeling:
- one-to-many
- many-to-many
- foreign keys
- junction tables

5. Use concise and scalable naming conventions.

6. The ERD output MUST follow this exact DSL format:

user {
  id uuid pk
  name string
}

post {
  id uuid pk
  userId uuid fk > user.id
  title string
}

7. Foreign keys MUST use:
fk > table.field

8. Constraints allowed:
- pk
- fk
- unique
- nullable

9. Supported primitive types:
- uuid
- string
- text
- int
- float
- boolean
- timestamp
- json

10. Return ONLY valid JSON.

11. Do not explain anything.

12. Generate enough tables to properly model the system.

13. Think carefully about relationships before generating.

14. The "erd" field should contain the full ERD DSL string.

15. The "tables" field should contain structured parsed output matching the ERD.

`;

export async function getAiResponse(
  apiKey: string,
  prompt: string
) {
  const ai = new GoogleGenAI({
    apiKey,
  });

  const response =
    await ai.models.generateContent({
      model: "gemini-3-flash-preview",

      contents: `
${SYSTEM_PROMPT}

USER REQUEST:
${prompt}
`,

      config: {
        responseMimeType: "application/json",

        responseJsonSchema: {
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

            tables: {
              type: "array",

              items: {
                type: "object",

                properties: {
                  name: {
                    type: "string",
                  },

                  fields: {
                    type: "array",

                    items: {
                      type: "object",

                      properties: {
                        name: {
                          type: "string",
                        },

                        type: {
                          type: "string",
                        },

                        constraints: {
                          type: "array",

                          items: {
                            type: "string",
                          },
                        },

                        relation: {
                          type: "object",

                          properties: {
                            table: {
                              type: "string",
                            },

                            field: {
                              type: "string",
                            },
                          },
                        },
                      },

                      required: [
                        "name",
                        "type",
                      ],
                    },
                  },
                },

                required: [
                  "name",
                  "fields",
                ],
              },
            },
          },

          required: [
            "title",
            "description",
            "erd",
            "tables",
          ],
        },
      },
    });

  const text = response.text ?? "{}";

  const parsed = JSON.parse(text);

  return ErdResponseSchema.parse(parsed);
}