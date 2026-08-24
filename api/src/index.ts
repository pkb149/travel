import { Hono } from "hono";
import { cors } from "hono/cors";

type Env = {
  DB: D1Database;
  ATTACHMENTS: R2Bucket;
  FRONTEND_URL: string;
  API_SECRET: string;
};

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors({
  origin: (origin, c) => {
    const allowed = [c.env.FRONTEND_URL, "http://localhost:3000"];
    return allowed.includes(origin) ? origin : allowed[0];
  },
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

// Auth between Pages and Workers: shared secret + Google OAuth token verification
app.use("/api/*", async (c, next) => {
  if (c.req.path === "/api/health") return next();
  const auth = c.req.header("Authorization") ?? "";
  // 1. Service-to-service: X-API-Secret from Pages SSR
  const apiSecret = c.req.header("X-API-Secret");
  if (apiSecret && apiSecret === c.env.API_SECRET) return next();
  // 2. User auth: Bearer <Google ID token> — verify via next-auth / Cloudflare Access
  if (auth.startsWith("Bearer ")) {
    // TODO: verify JWT with GOOGLE_CLIENT_ID / Cloudflare Access
    return next();
  }
  // Allow unauthenticated for now (no auth yet); enforce when API_SECRET is set
  if (!c.env.API_SECRET) return next();
  return c.json({ error: "Unauthorized" }, 401);
});

app.get("/api/health", (c) => c.json({ ok: true, service: "travel-vietnam-api" }));
app.get("/api/trips/:id", async (c) => {
  const id = c.req.param("id");
  const row = await c.env.DB.prepare("SELECT * FROM trips WHERE id = ?").bind(id).first();
  return c.json(row ?? { id, error: "not found" });
});

export default app;
