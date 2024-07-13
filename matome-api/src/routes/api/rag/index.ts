import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { ChatOpenAI } from "@langchain/openai";
import { env } from "hono/adapter";

import { questionSchema } from "./schemas/ask-question.schema";
import { LLMService } from "../../../services/llm.service";
import { TiktokenModel } from "tiktoken";

export const MODEL_NAME: TiktokenModel = "gpt-3.5-turbo";
export const VECTOR_STORE_PATH = "Documents.index";

export const ragRoutes = new Hono();

ragRoutes.get(
  "/ask",
  bearerAuth({ token: process.env.SECURITY_TOKEN! }),
  zValidator("json", questionSchema, (res, c) => {
    if (!res.success) {
      return c.json({ error: res.error }, 400);
    }
  }),
  async (ctx) => {
    const { OPENAI_API_KEY } = env<{ OPENAI_API_KEY: string }>(ctx);
    const { question, fileName, loaderType } = ctx.req.valid("json");

    const model = new ChatOpenAI({ model: MODEL_NAME, apiKey: OPENAI_API_KEY });

    const llmService = new LLMService({
      model,
      vectorStorePath: VECTOR_STORE_PATH,
      modelName: MODEL_NAME,
    });

    const response = await llmService.getSummary({
      question,
      documentPath: `${__dirname}/documents/${fileName}`,
      documentType: loaderType,
    });

    return ctx.json({ response }, 200);
  }
);
