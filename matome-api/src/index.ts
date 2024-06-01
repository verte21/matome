import { Hono } from "hono";
import { LLMService } from "./llm.service";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const app = new Hono();

const questionSchema = z.object({
  question: z.string(),
});

app.post(
  "/api/ask-question",
  zValidator("json", questionSchema, (res, c) => {
    if (!res.success) {
      return c.json({ error: res.error }, 400);
    }
  }),
  async (ctx) => {
    const { question } = ctx.req.valid("json");

    const llmService = new LLMService();

    const response = await llmService.getSummary(question, `${__dirname}/documents/test.csv`);

    return ctx.json({ response }, 200);
  }
);

export default app;
