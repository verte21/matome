import { Hono } from "hono";
import { apiRoutes } from "./routes/api";
import { bearerAuth } from "hono/bearer-auth";

const app = new Hono();

app.use(bearerAuth({ token: process.env.SECURITY_TOKEN! }));
app.route("/api", apiRoutes);

export default app;
