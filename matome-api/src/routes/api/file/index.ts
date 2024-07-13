import { Hono } from "hono";
import { DateTime } from "luxon";
import { randomUUID } from "node:crypto";

export const fileRoutes = new Hono();

fileRoutes.post("/upload", async (ctx) => {
  const data = await ctx.req.formData();
  const rawData = data.get("data");

  if (!rawData) {
    return ctx.json({ error: "No file uploaded" }, 400);
  }

  const fileName = `${randomUUID()}-${DateTime.DATE_SHORT}`;

  await Bun.write(`${__dirname}/documents/${fileName}`, rawData);

  return ctx.json({ fileName }, 200);
});
