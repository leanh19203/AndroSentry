import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import apiRouter from "./server/routes/api.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Parse JSON request bodies (increased limit for large manifests/code snippets)
app.use(express.json({ limit: "10mb" }));

// Mount API routes
app.use("/api", apiRouter);

// ----------------------------------------------------
// VITE AND STATIC SERVING MIDDLEWARE
// ----------------------------------------------------
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware loaded.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Static files serving production loaded.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Android Pentest Companion] Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
