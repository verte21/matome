import { Hono } from "hono";
import { ragRoutes } from "./rag";
import { fileRoutes } from "./file";

export const apiRoutes = new Hono();

apiRoutes.route("/rag", ragRoutes);
apiRoutes.route("/file", fileRoutes);
