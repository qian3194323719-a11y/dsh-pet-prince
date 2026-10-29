import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const here = fileURLToPath(new URL(".", import.meta.url));
const tempHome = join(here, ".test-dsh-home");
await rm(tempHome, { recursive: true, force: true });
await mkdir(tempHome, { recursive: true });
process.env.DSH_HOME = tempHome;

const { apply } = await import("./index.js");

let route;
const ctx = {
  effect(fn) {
    const dispose = fn();
    if (typeof dispose === "function") dispose();
  },
  webServer: {
    register(value) {
      route = value;
      return () => {};
    },
  },
};
apply(ctx);
if (!route || route.path !== "/dsh-pet-prince") throw new Error("route not registered");

function call(path, method = "GET", body) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const req = {
      url: path,
      method,
      on(event, fn) {
        if (event === "data" && body !== undefined) fn(Buffer.from(body));
        if (event === "end") fn();
        if (event === "error") this._err = fn;
      },
      destroy() {},
    };
    const res = {
      status: 0,
      headers: {},
      body: Buffer.alloc(0),
      writeHead(status, headers) {
        this.status = status;
        this.headers = headers;
      },
      end(buffer) {
        this.body = Buffer.from(buffer || "");
        resolve({ status: this.status, headers: this.headers, body: this.body });
      },
      get writableEnded() {
        return false;
      },
    };
    Promise.resolve(route.handler(req, res)).catch(reject);
  });
}

const health = await call("/dsh-pet-prince/health");
console.log("health", health.status, health.body.toString());

const sprite = await call("/dsh-pet-prince/spritesheet.webp");
console.log("sprite", sprite.status, sprite.headers["Content-Type"], sprite.body.length);

const config = await call("/dsh-pet-prince/config");
console.log("config", config.status, config.body.toString());

const saved = await call("/dsh-pet-prince/config", "PUT", JSON.stringify({ enabled: false, scale: 1.4, corner: "top-left" }));
console.log("save", saved.status, saved.body.toString());

const reloaded = await call("/dsh-pet-prince/config");
console.log("reloaded", reloaded.status, reloaded.body.toString());

const missing = await call("/dsh-pet-prince/nope");
console.log("missing", missing.status, missing.body.toString());

await rm(tempHome, { recursive: true, force: true });
