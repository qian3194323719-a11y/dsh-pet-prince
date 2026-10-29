import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * dsh-pet-prince host half
 *
 * Routes:
 *   GET  /dsh-pet-prince/health
 *   GET  /dsh-pet-prince/pet.json
 *   GET  /dsh-pet-prince/config
 *   PUT  /dsh-pet-prince/config
 *   GET  /dsh-pet-prince/spritesheet.webp
 *   GET  /dsh-pet-prince/preview.gif
 *   GET  /dsh-pet-prince/logo.png
 *
 * The host only persists appearance settings and serves the 2D sprite sheet.
 * All animation/input logic lives in the browser half.
 */

const ROOT = dirname(fileURLToPath(import.meta.url));
const ASSETS = join(ROOT, "assets");
const PREFIX = "/dsh-pet-prince";
const DSH_HOME = process.env.DSH_HOME || join(homedir(), ".dsh");
const USER_DIR = join(DSH_HOME, "dsh-pet-prince");
const CONFIG_FILE = join(USER_DIR, "config.json");

const DEFAULTS = Object.freeze({
  enabled: true,
  scale: 1,
  corner: "bottom-right",
  marginX: 24,
  marginY: 16,
});

const CORNERS = new Set(["top-left", "top-right", "bottom-left", "bottom-right"]);
const MIME = {
  ".webp": "image/webp",
  ".png": "image/png",
  ".gif": "image/gif",
  ".json": "application/json; charset=utf-8",
};

export const name = "pet-prince";
export const inject = ["webServer"];

function clamp(value, min, max, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

function normalize(input, base = DEFAULTS) {
  const source = input && typeof input === "object" ? input : {};
  return {
    enabled: typeof source.enabled === "boolean" ? source.enabled : base.enabled,
    scale: Math.round(clamp(source.scale, 0.6, 2.4, base.scale) * 100) / 100,
    corner: CORNERS.has(source.corner) ? source.corner : base.corner,
    marginX: Math.round(clamp(source.marginX, -2000, 4000, base.marginX)),
    marginY: Math.round(clamp(source.marginY, -2000, 4000, base.marginY)),
  };
}

async function readConfig() {
  try {
    const raw = await readFile(CONFIG_FILE, "utf8");
    return normalize(JSON.parse(raw));
  } catch {
    return { ...DEFAULTS };
  }
}

async function writeConfig(patch) {
  const current = await readConfig();
  const next = normalize({ ...current, ...(patch || {}) }, current);
  await mkdir(USER_DIR, { recursive: true });
  await writeFile(CONFIG_FILE, JSON.stringify(next, null, 2) + "\n", "utf8");
  return next;
}

function sendJson(res, status, value, extraHeaders = {}) {
  const body = Buffer.from(JSON.stringify(value));
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": body.length,
    "Cache-Control": "no-store",
    ...extraHeaders,
  });
  res.end(body);
}

async function sendFile(res, file, cache = "public, max-age=3600") {
  try {
    const body = await readFile(file);
    res.writeHead(200, {
      "Content-Type": MIME[extname(file).toLowerCase()] || "application/octet-stream",
      "Content-Length": body.length,
      "Cache-Control": cache,
      "Access-Control-Allow-Origin": "*",
    });
    res.end(body);
  } catch {
    sendJson(res, 404, { ok: false, error: "not-found" });
  }
}

function readBody(req, limit = 64 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error("body-too-large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

export function apply(ctx) {
  const handler = async (req, res) => {
    try {
      const url = new URL(req.url || "/", "http://localhost");
      let rest = url.pathname.slice(PREFIX.length);
      if (!rest.startsWith("/")) rest = "/" + rest;
      const method = (req.method || "GET").toUpperCase();

      if (rest === "/health") {
        sendJson(res, 200, { ok: true, plugin: "dsh-pet-prince", version: "0.1.1" });
        return;
      }

      if (rest === "/pet.json") {
        await sendFile(res, join(ASSETS, "pet.json"));
        return;
      }

      if (rest === "/config") {
        if (method === "GET") {
          sendJson(res, 200, await readConfig());
          return;
        }
        if (method === "PUT") {
          let patch = {};
          try {
            patch = JSON.parse(await readBody(req));
          } catch {
            sendJson(res, 400, { ok: false, error: "invalid-json" });
            return;
          }
          sendJson(res, 200, { ok: true, config: await writeConfig(patch) });
          return;
        }
        sendJson(res, 405, { ok: false, error: "method-not-allowed" });
        return;
      }

      if (method === "GET" && (rest === "/spritesheet.webp" || rest === "/preview.gif" || rest === "/logo.png")) {
        await sendFile(res, join(ASSETS, rest.slice(1)));
        return;
      }

      if (rest === "/" || rest === "") {
        sendJson(res, 200, {
          ok: true,
          name: "dsh-pet-prince",
          displayName: "深海小王子",
          config: PREFIX + "/config",
          spritesheet: PREFIX + "/spritesheet.webp",
        });
        return;
      }

      sendJson(res, 404, { ok: false, error: "not-found", path: rest });
    } catch (error) {
      if (!res.writableEnded) {
        sendJson(res, 500, { ok: false, error: error instanceof Error ? error.message : String(error) });
      }
    }
  };

  ctx.effect(
    () => {
      const dispose = ctx.webServer.register({ kind: "prefix", path: PREFIX, handler });
      return () => {
        if (typeof dispose === "function") dispose();
      };
    },
    "dsh-pet-prince: routes",
  );

  // Create the user data directory lazily; a failure here must not block the pet.
  if (!existsSync(USER_DIR)) {
    void mkdir(USER_DIR, { recursive: true }).catch(() => {});
  }
}
