import { Hono } from "hono";
import { LLMService } from "./llm.service";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { TiktokenModel } from "tiktoken";
import { env } from "hono/adapter";

export const MODEL_NAME: TiktokenModel = "gpt-3.5-turbo";
export const VECTOR_STORE_PATH = "Documents.index";

const app = new Hono();

const questionSchema = z.object({
  question: z.string(),
});

app.get(
  "/api/rag/ask",
  zValidator("json", questionSchema, (res, c) => {
    if (!res.success) {
      return c.json({ error: res.error }, 400);
    }
  }),
  async (ctx) => {
    const { OPENAI_API_KEY } = env<{ OPENAI_API_KEY: string }>(ctx);
    const { question } = ctx.req.valid("json");

    const model = new ChatOpenAI({ model: MODEL_NAME, apiKey: OPENAI_API_KEY });

    const llmService = new LLMService({
      model,
      vectorStorePath: VECTOR_STORE_PATH,
      modelName: MODEL_NAME,
    });

    const response = await llmService.getSummary(question, `${__dirname}/documents/test.csv`);

    return ctx.json({ response }, 200);
  }
);

export default app;
