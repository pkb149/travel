import { Hono } from "hono";
import { cors } from "hono/cors";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { sign, verify } from "hono/jwt";

type Env = {
  DB: D1Database;
  ATTACHMENTS: R2Bucket;
  FRONTEND_URL: string;
  API_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Env }>();

const ALLOWED_EMAIL = "prashantkumarbharadwaj@gmail.com";

app.use("*", cors({
  origin: (origin, c) => {
    const allowed = [c.env.FRONTEND_URL, "http://localhost:3000", "http://localhost:8787", "https://travel-7l1.pages.dev"];
    if (!origin) return c.env.FRONTEND_URL;
    return allowed.includes(origin) ? origin : allowed[0];
  },
  allowHeaders: ["Content-Type", "Authorization", "X-API-Secret"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));

app.get("/auth/login", (c) => {
  const clientId = c.env.GOOGLE_CLIENT_ID;
  if (!clientId) return c.text("GOOGLE_CLIENT_ID not set", 500);
  const redirectUri = `https://travel-api.prashantkumarbharadwaj.workers.dev/auth/callback`;
  const state = crypto.randomUUID();
  setCookie(c, "oauth_state", state, { httpOnly: true, secure: true, sameSite: "Lax", path: "/", maxAge: 600 });
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "offline",
    prompt: "consent",
  });
  return c.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`, 302);
});

app.get("/auth/callback", async (c) => {
  const code = c.req.query("code");
  const state = c.req.query("state");
  const cookieState = getCookie(c, "oauth_state");
  if (!code || !state || state !== cookieState) return c.text("Invalid state or code", 400);

  const clientId = c.env.GOOGLE_CLIENT_ID;
  const clientSecret = c.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `https://travel-api.prashantkumarbharadwaj.workers.dev/auth/callback`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) {
    const t = await tokenRes.text();
    return c.text(`Token exchange failed: ${t}`, 500);
  }
  const tokens = await tokenRes.json() as { id_token: string; access_token: string };

  const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${tokens.id_token}`);
  if (!verifyRes.ok) return c.text("Failed to verify id_token", 401);
  const info = await verifyRes.json() as { email: string; email_verified: string; aud: string; name: string };
  if (info.aud !== clientId) return c.text("Invalid audience", 401);
  if (info.email !== ALLOWED_EMAIL) {
    return c.text(`Access denied: only ${ALLOWED_EMAIL} is whitelisted. Your email: ${info.email}`, 403);
  }
  if (info.email_verified !== "true" && (info.email_verified as any) !== true) return c.text("Email not verified", 403);

  const jwtSecret = c.env.JWT_SECRET || "dev-secret-change-me";
  const payload = { email: info.email, name: (info as any).name || info.email.split("@")[0], exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 };
  const jwt = await sign(payload, jwtSecret);

  // Set cookie for same-site and also pass token via URL for cross-site (pages.dev vs workers.dev are cross-site, SameSite=None still blocked as third-party in modern browsers)
  setCookie(c, "session", jwt, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  deleteCookie(c, "oauth_state", { path: "/", secure: true, sameSite: "Lax" });

  const frontend = c.env.FRONTEND_URL || "https://travel-7l1.pages.dev";
  // Pass token in URL so frontend can store in localStorage (cross-site cookie is third-party and blocked)
  return c.redirect(`${frontend}?token=${encodeURIComponent(jwt)}&auth=success`, 302);
});

function getToken(c: any): string | undefined {
  return getCookie(c, "session") || c.req.header("Authorization")?.replace("Bearer ", "") || c.req.query("token");
}

app.get("/auth/me", async (c) => {
  const token = getToken(c);
  if (!token) return c.json({ authenticated: false }, 401);
  try {
    const jwtSecret = c.env.JWT_SECRET || "dev-secret-change-me";
    const payload = await verify(token, jwtSecret) as { email: string; name?: string };
    if (payload.email !== ALLOWED_EMAIL) return c.json({ authenticated: false, error: "not whitelisted" }, 403);
    return c.json({ authenticated: true, email: payload.email, name: payload.name || payload.email.split("@")[0] });
  } catch {
    return c.json({ authenticated: false }, 401);
  }
});

app.post("/auth/logout", (c) => {
  deleteCookie(c, "session", { path: "/", secure: true, sameSite: "None" });
  return c.json({ ok: true });
});

app.get("/auth/logout", (c) => {
  deleteCookie(c, "session", { path: "/", secure: true, sameSite: "None" });
  const frontend = c.env.FRONTEND_URL || "https://travel-7l1.pages.dev";
  return c.redirect(frontend, 302);
});

app.use("/api/*", async (c, next) => {
  if (c.req.path === "/api/health") return next();
  const apiSecret = c.req.header("X-API-Secret");
  if (apiSecret && c.env.API_SECRET && apiSecret === c.env.API_SECRET) return next();
  const token = getToken(c);
  if (token) {
    try {
      const jwtSecret = c.env.JWT_SECRET || "dev-secret-change-me";
      const payload = await verify(token, jwtSecret) as { email: string };
      if (payload.email === ALLOWED_EMAIL) return next();
    } catch {}
  }
  if (!c.env.JWT_SECRET && !c.env.API_SECRET) return next();
  if (c.req.method === "GET") return next();
  return c.json({ error: "Unauthorized — only prashantkumarbharadwaj@gmail.com is whitelisted" }, 401);
});

app.get("/api/health", (c) => c.json({ ok: true, service: "travel-api", auth: "google-whitelist", whitelisted: ALLOWED_EMAIL }));
app.get("/api/trips", async (c) => {
  const { results } = await c.env.DB.prepare("SELECT * FROM trips").all();
  return c.json(results);
});
app.get("/api/trips/:id", async (c) => {
  const id = c.req.param("id");
  const row = await c.env.DB.prepare("SELECT * FROM trips WHERE id = ?").bind(id).first();
  return c.json(row ?? { id, error: "not found" });
});
app.post("/api/trips", async (c) => {
  const trip = await c.req.json();
  if (!trip.id) return c.json({ error: "id required" }, 400);
  const dataStr = JSON.stringify(trip);
  await c.env.DB.prepare("INSERT OR REPLACE INTO trips (id, title, country, start_date, end_date, data) VALUES (?, ?, ?, ?, ?, ?)").bind(trip.id, trip.title, trip.country, trip.startDate, trip.endDate, dataStr).run();
  return c.json({ ok: true, id: trip.id });
});

export default app;
