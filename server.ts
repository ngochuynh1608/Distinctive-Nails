import { mkdir } from "node:fs/promises";
import index from "./index.html";

const ROOT = import.meta.dir;
const DATA_DIR = `${ROOT}/data`;
const SITE_JSON = `${DATA_DIR}/site.json`;
const UPLOAD_DIR = `${ROOT}/public/uploads`;

const COOKIE = "bn_session";
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;
const sessions = new Map<string, number>();

function env() {
  return {
    username: process.env.ADMIN_USERNAME ?? "admin",
    password: process.env.ADMIN_PASSWORD ?? "admin123",
  };
}

async function ensureDirs() {
  await mkdir(DATA_DIR, { recursive: true });
  await mkdir(UPLOAD_DIR, { recursive: true });
}

function parseCookie(req: Request, name: string): string | undefined {
  const raw = req.headers.get("cookie");
  if (!raw) return undefined;
  for (const part of raw.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("=").trim());
  }
  return undefined;
}

function sessionCookie(token: string, maxAgeSec: number) {
  return `${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}`;
}

function clearSessionCookie() {
  return `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

function validateSession(token: string | undefined): boolean {
  if (!token) return false;
  const exp = sessions.get(token);
  if (!exp || exp < Date.now()) {
    sessions.delete(token!);
    return false;
  }
  return true;
}

function createSession(): string {
  const token = crypto.randomUUID();
  sessions.set(token, Date.now() + SESSION_MS);
  return token;
}

async function readSite(): Promise<unknown> {
  const f = Bun.file(SITE_JSON);
  if (!(await f.exists())) {
    throw new Error("site.json missing");
  }
  return f.json();
}

async function writeSite(data: unknown) {
  await Bun.write(SITE_JSON, JSON.stringify(data, null, 2));
}

function json(data: unknown, init: ResponseInit = {}) {
  return Response.json(data, {
    ...init,
    headers: { "Content-Type": "application/json", ...init.headers },
  });
}

function requireAuth(req: Request): Response | null {
  const token = parseCookie(req, COOKIE);
  if (!validateSession(token)) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

type SiteShape = {
  instagram?: {
    enabledAutoFeed?: boolean;
    username?: string;
    profileUrl?: string;
    appId?: string;
    appSecret?: string;
    redirectUri?: string;
    accessToken?: string;
    tokenType?: string;
    userId?: string;
    expiresIn?: number;
    connectedAt?: string;
    limit?: number;
  };
  [key: string]: unknown;
};

async function readSiteObject(): Promise<SiteShape> {
  return (await readSite()) as SiteShape;
}

async function patchSite(mutator: (site: SiteShape) => SiteShape | void) {
  const site = await readSiteObject();
  const next = mutator(site) ?? site;
  await writeSite(next);
  return next;
}

function instagramAuthUrl(appId: string, redirectUri: string) {
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    scope: "user_profile,user_media",
    response_type: "code",
  });
  return `https://api.instagram.com/oauth/authorize?${params.toString()}`;
}

async function exchangeInstagramCode(args: {
  appId: string;
  appSecret: string;
  redirectUri: string;
  code: string;
}) {
  const shortRes = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    body: new URLSearchParams({
      client_id: args.appId,
      client_secret: args.appSecret,
      grant_type: "authorization_code",
      redirect_uri: args.redirectUri,
      code: args.code,
    }),
  });
  if (!shortRes.ok) {
    const txt = await shortRes.text();
    throw new Error(`Cannot exchange code: ${txt}`);
  }
  const short = (await shortRes.json()) as {
    access_token: string;
    user_id: string;
  };

  const longUrl = new URL("https://graph.instagram.com/access_token");
  longUrl.searchParams.set("grant_type", "ig_exchange_token");
  longUrl.searchParams.set("client_secret", args.appSecret);
  longUrl.searchParams.set("access_token", short.access_token);

  const longRes = await fetch(longUrl);
  if (!longRes.ok) {
    const txt = await longRes.text();
    throw new Error(`Cannot get long-lived token: ${txt}`);
  }
  const long = (await longRes.json()) as {
    access_token: string;
    token_type: string;
    expires_in: number;
  };

  const meUrl = new URL("https://graph.instagram.com/me");
  meUrl.searchParams.set("fields", "id,username");
  meUrl.searchParams.set("access_token", long.access_token);
  const meRes = await fetch(meUrl);
  let username = "";
  if (meRes.ok) {
    const me = (await meRes.json()) as { username?: string };
    username = me.username ?? "";
  }

  return {
    accessToken: long.access_token,
    tokenType: long.token_type,
    expiresIn: long.expires_in,
    userId: short.user_id,
    username,
  };
}

async function fetchInstagramFeed(token: string, limit: number) {
  const mediaUrl = new URL("https://graph.instagram.com/me/media");
  mediaUrl.searchParams.set(
    "fields",
    "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp",
  );
  mediaUrl.searchParams.set("limit", String(limit));
  mediaUrl.searchParams.set("access_token", token);
  const res = await fetch(mediaUrl);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Instagram feed error: ${txt}`);
  }
  const body = (await res.json()) as {
    data?: Array<{
      id: string;
      caption?: string;
      media_type?: string;
      media_url?: string;
      thumbnail_url?: string;
      permalink?: string;
      timestamp?: string;
    }>;
  };
  const items = (body.data ?? [])
    .filter((p) => ["IMAGE", "CAROUSEL_ALBUM", "VIDEO"].includes(p.media_type ?? ""))
    .map((p) => ({
      id: p.id,
      caption: p.caption ?? "",
      mediaType: p.media_type ?? "",
      imageUrl: p.media_type === "VIDEO" ? p.thumbnail_url || p.media_url : p.media_url,
      permalink: p.permalink ?? "",
      timestamp: p.timestamp ?? "",
    }))
    .filter((p) => !!p.imageUrl);
  return items;
}

async function handleApi(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;

  if (path === "/api/content" && req.method === "GET") {
    try {
      const data = await readSite();
      return json(data);
    } catch {
      return json({ error: "Failed to load content" }, { status: 500 });
    }
  }

  if (path === "/api/auth/login" && req.method === "POST") {
    let body: { username?: string; password?: string };
    try {
      body = (await req.json()) as { username?: string; password?: string };
    } catch {
      return json({ error: "Invalid JSON" }, { status: 400 });
    }
    const { username, password } = env();
    if (body.username === username && body.password === password) {
      const token = createSession();
      return json({ ok: true }, {
        headers: { "Set-Cookie": sessionCookie(token, Math.floor(SESSION_MS / 1000)) },
      });
    }
    return json({ error: "Sai tài khoản hoặc mật khẩu" }, { status: 401 });
  }

  if (path === "/api/auth/logout" && req.method === "POST") {
    const token = parseCookie(req, COOKIE);
    if (token) sessions.delete(token);
    return json({ ok: true }, { headers: { "Set-Cookie": clearSessionCookie() } });
  }

  if (path === "/api/auth/me" && req.method === "GET") {
    const token = parseCookie(req, COOKIE);
    return json({ authenticated: validateSession(token) });
  }

  if (path === "/api/content" && req.method === "PUT") {
    const denied = requireAuth(req);
    if (denied) return denied;
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid JSON" }, { status: 400 });
    }
    try {
      await writeSite(body);
      return json({ ok: true });
    } catch {
      return json({ error: "Failed to save" }, { status: 500 });
    }
  }

  if (path === "/api/upload" && req.method === "POST") {
    const denied = requireAuth(req);
    if (denied) return denied;
    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return json({ error: "Invalid form" }, { status: 400 });
    }
    const file = form.get("file");
    if (!file || !(file instanceof Blob) || file.size === 0) {
      return json({ error: "Thiếu file" }, { status: 400 });
    }
    const nameIn = (file as File).name || "upload.bin";
    const ext = nameIn.includes(".") ? nameIn.split(".").pop()!.slice(0, 8) : "bin";
    const safe = `${crypto.randomUUID()}.${ext}`;
    const buf = await file.arrayBuffer();
    await Bun.write(`${UPLOAD_DIR}/${safe}`, buf);
    return json({ url: `/uploads/${safe}` });
  }

  if (path === "/api/instagram/connect" && req.method === "POST") {
    const denied = requireAuth(req);
    if (denied) return denied;
    const site = await readSiteObject();
    const ig = site.instagram ?? {};
    const appId = ig.appId?.trim() ?? "";
    const redirectUri = ig.redirectUri?.trim() ?? "";
    if (!appId || !redirectUri) {
      return json(
        { error: "Thiếu appId hoặc redirectUri trong phần setting Instagram." },
        { status: 400 },
      );
    }
    return json({ authUrl: instagramAuthUrl(appId, redirectUri) });
  }

  if (path === "/api/instagram/disconnect" && req.method === "POST") {
    const denied = requireAuth(req);
    if (denied) return denied;
    await patchSite((site) => {
      const ig = site.instagram ?? {};
      site.instagram = {
        ...ig,
        accessToken: "",
        tokenType: "",
        userId: "",
        connectedAt: "",
      };
    });
    return json({ ok: true });
  }

  if (path === "/api/instagram/feed" && req.method === "GET") {
    try {
      const site = await readSiteObject();
      const ig = site.instagram ?? {};
      const token = ig.accessToken?.trim() ?? "";
      if (!ig.enabledAutoFeed || !token) return json({ items: [], username: ig.username ?? "" });
      const limit = Math.max(1, Math.min(12, Number(ig.limit) || 6));
      const items = await fetchInstagramFeed(token, limit);
      return json({ items, username: ig.username ?? "" });
    } catch (err) {
      return json(
        { items: [], error: err instanceof Error ? err.message : "Cannot load feed" },
        { status: 200 },
      );
    }
  }

  return json({ error: "Not found" }, { status: 404 });
}

async function serveUpload(pathname: string): Promise<Response | null> {
  if (!pathname.startsWith("/uploads/")) return null;
  const rel = pathname.slice("/uploads/".length);
  if (!rel || rel.includes("..") || rel.includes("/") || rel.includes("\\")) return null;
  const file = Bun.file(`${UPLOAD_DIR}/${rel}`);
  if (!(await file.exists())) return new Response("Not found", { status: 404 });
  return new Response(file);
}

await ensureDirs();

function isAddrInUse(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "EADDRINUSE"
  );
}

/**
 * HMR: chỉ bật khi dev (`bun run dev`). Tắt bằng DISABLE_BUN_HMR=1 hoặc NODE_ENV=production.
 * Trên Bun cũ, NODE_ENV=production + serve HTML đôi khi bundle sai JSX (jsxDEV is not a function).
 * Cách an toàn khi deploy: `DISABLE_BUN_HMR=1` mà không ép NODE_ENV (xem script `start`).
 */
const hmrEnabled =
  process.env.DISABLE_BUN_HMR !== "1" && process.env.NODE_ENV !== "production";
const devBundlerOpts = hmrEnabled
  ? { development: { hmr: true as const, console: true as const } }
  : {};

const serveOptions = {
  routes: {
    "/": index,
    "/admin": index,
    "/api/content": {
      GET: (req: Request) => handleApi(req),
      PUT: (req: Request) => handleApi(req),
    },
    "/api/auth/login": {
      POST: (req: Request) => handleApi(req),
    },
    "/api/auth/logout": {
      POST: (req: Request) => handleApi(req),
    },
    "/api/auth/me": {
      GET: (req: Request) => handleApi(req),
    },
    "/api/upload": {
      POST: (req: Request) => handleApi(req),
    },
    "/api/instagram/connect": {
      POST: (req: Request) => handleApi(req),
    },
    "/api/instagram/disconnect": {
      POST: (req: Request) => handleApi(req),
    },
    "/api/instagram/feed": {
      GET: (req: Request) => handleApi(req),
    },
    "/api/instagram/callback": async (req: Request) => {
      const url = new URL(req.url);
      const code = url.searchParams.get("code")?.trim();
      const errorReason = url.searchParams.get("error_description")?.trim();
      if (!code) {
        const msg = encodeURIComponent(errorReason || "Thiếu code từ Instagram");
        return Response.redirect(`/admin?ig_error=${msg}`, 302);
      }
      try {
        const site = await readSiteObject();
        const ig = site.instagram ?? {};
        const appId = ig.appId?.trim() ?? "";
        const appSecret = ig.appSecret?.trim() ?? "";
        const redirectUri = ig.redirectUri?.trim() ?? "";
        if (!appId || !appSecret || !redirectUri) {
          return Response.redirect("/admin?ig_error=Missing%20Instagram%20settings", 302);
        }
        const tokenData = await exchangeInstagramCode({ appId, appSecret, redirectUri, code });
        await patchSite((s) => {
          const cur = s.instagram ?? {};
          s.instagram = {
            ...cur,
            accessToken: tokenData.accessToken,
            tokenType: tokenData.tokenType,
            userId: tokenData.userId,
            expiresIn: tokenData.expiresIn,
            connectedAt: new Date().toISOString(),
            username: tokenData.username || cur.username || "",
            profileUrl: tokenData.username
              ? `https://instagram.com/${tokenData.username}`
              : (cur.profileUrl ?? ""),
            enabledAutoFeed: true,
          };
        });
        return Response.redirect("/admin?ig_connected=1", 302);
      } catch (err) {
        const msg = encodeURIComponent(err instanceof Error ? err.message : "Instagram error");
        return Response.redirect(`/admin?ig_error=${msg}`, 302);
      }
    },
    "/uploads/*": async (req: Request) => {
      const url = new URL(req.url);
      const up = await serveUpload(url.pathname);
      return up ?? new Response("Not found", { status: 404 });
    },
  },
  ...devBundlerOpts,
};

const portEnv = process.env.PORT?.trim();
let server: ReturnType<typeof Bun.serve>;

if (portEnv !== undefined && portEnv !== "") {
  const port = Number(portEnv);
  if (!Number.isFinite(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT: ${portEnv}`);
  }
  try {
    server = Bun.serve({ ...serveOptions, port });
  } catch (err) {
    if (isAddrInUse(err)) {
      console.error(
        `Port ${port} is already in use. Stop the other process or set PORT to a free port.`,
      );
    }
    throw err;
  }
} else {
  let lastErr: unknown;
  let bound: ReturnType<typeof Bun.serve> | undefined;
  for (let p = 3000; p < 3100; p++) {
    try {
      bound = Bun.serve({ ...serveOptions, port: p });
      if (p !== 3000) {
        console.warn(`Port 3000 was busy; using ${p} instead.`);
      }
      break;
    } catch (err) {
      lastErr = err;
      if (!isAddrInUse(err)) throw err;
    }
  }
  if (!bound) throw lastErr ?? new Error("Could not bind to a port");
  server = bound;
}

console.log(`Listening on http://localhost:${server.port}`);
