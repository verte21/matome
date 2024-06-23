import { Hono } from "hono";
import { LLMService } from "./services/llm.service";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { TiktokenModel } from "tiktoken";
import { env } from "hono/adapter";
import { randomUUID } from "node:crypto";
import { DateTime } from "luxon";
import { bearerAuth } from "hono/bearer-auth";

export const MODEL_NAME: TiktokenModel = "gpt-3.5-turbo";
export const VECTOR_STORE_PATH = "Documents.index";

const app = new Hono();

const questionSchema = z.object({
  question: z.string(),
  fileName: z.string(),
});

app.get(
  "/api/rag/ask",
  bearerAuth({ token: process.env.SECURITY_TOKEN! }),
  zValidator("json", questionSchema, (res, c) => {
    if (!res.success) {
      return c.json({ error: res.error }, 400);
    }
  }),
  async (ctx) => {
    const { OPENAI_API_KEY } = env<{ OPENAI_API_KEY: string }>(ctx);
    const { question, fileName } = ctx.req.valid("json");

    const model = new ChatOpenAI({ model: MODEL_NAME, apiKey: OPENAI_API_KEY });

    const llmService = new LLMService({
      model,
      vectorStorePath: VECTOR_STORE_PATH,
      modelName: MODEL_NAME,
    });

    const response = await llmService.getSummary(question, `${__dirname}/documents/${fileName}`);

    return ctx.json({ response }, 200);
  }
);

app.post("/api/file/upload", async (ctx) => {
  const data = await ctx.req.formData();
  const rawData = data.get("data");

  if (!rawData) {
    return ctx.json({ error: "No file uploaded" }, 400);
  }

  const fileName = `${randomUUID()}-${DateTime.DATE_SHORT}`;

  await Bun.write(`${__dirname}/documents/${fileName}`, rawData);

  return ctx.json({ fileName }, 200);
});

export default app;
