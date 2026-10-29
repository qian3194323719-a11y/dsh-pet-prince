/**
 * GitHub device-flow publisher.
 *
 *   node scripts/github-device-publish.mjs
 *
 * Prints a one-time code, waits for you to approve it at
 * https://github.com/login/device, then creates the public repo and pushes
 * this folder with scripts/publish-github.mjs.
 *
 * Uses the public GitHub CLI OAuth client id. No client secret is needed for
 * the device flow. Scope: repo.
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const CLIENT_ID = process.env.GITHUB_CLIENT_ID || "Iv1.b507a08c87ecfe98";
const SCOPE = "repo";
const PUBLISH = fileURLToPath(new URL("./publish-github.mjs", import.meta.url));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function post(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "dsh-pet-prince-device-publisher",
    },
    body: new URLSearchParams(body),
  });
  return res.json();
}

async function main() {
  const device = await post("https://github.com/login/device/code", {
    client_id: CLIENT_ID,
    scope: SCOPE,
  });
  if (!device.device_code) throw new Error("device code failed: " + JSON.stringify(device));

  console.log("DEVICE_CODE " + JSON.stringify({
    user_code: device.user_code,
    verification_uri: device.verification_uri,
    expires_in: device.expires_in,
  }));

  const deadline = Date.now() + (device.expires_in || 900) * 1000;
  let interval = device.interval || 5;
  while (Date.now() < deadline) {
    await sleep(interval * 1000);
    const token = await post("https://github.com/login/oauth/access_token", {
      client_id: CLIENT_ID,
      device_code: device.device_code,
      grant_type: "urn:ietf:params:oauth:grant-type:device_code",
    });
    if (token.access_token) {
      console.log("AUTHORIZED");
      const child = spawn(process.execPath, [PUBLISH], {
        env: { ...process.env, GITHUB_TOKEN: token.access_token },
        stdio: "inherit",
      });
      child.on("exit", (code) => process.exit(code || 0));
      return;
    }
    if (token.error === "authorization_pending") continue;
    if (token.error === "slow_down") {
      interval += 5;
      continue;
    }
    throw new Error(token.error_description || token.error || "authorization failed");
  }
  throw new Error("device code expired");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
