/**
 * Install this plugin into a local DSH profile without npm.
 *
 *   node scripts/install-local.mjs
 *   DSH_PROFILE=~/.dsh/profiles/desktop node scripts/install-local.mjs
 *
 * It copies the package to <profile>/node_modules/dsh-pet-prince and adds
 * "dsh-pet-prince" to dsh.profile.bundles. Restart Harness afterwards.
 */
import { cp, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PROFILE = process.env.DSH_PROFILE || join(homedir(), ".dsh", "profiles", "desktop");
const NAME = "dsh-pet-prince";

async function main() {
  const profilePackage = join(PROFILE, "package.json");
  const target = join(PROFILE, "node_modules", NAME);

  let pkg;
  let original;
  try {
    original = await readFile(profilePackage, "utf8");
    if (original.charCodeAt(0) === 0xfeff) original = original.slice(1);
    pkg = JSON.parse(original);
  } catch {
    throw new Error("找不到 DSH profile：" + profilePackage);
  }

  await cp(ROOT, target, {
    recursive: true,
    force: true,
    filter(source) {
      const name = source.split(/[\\/]/).pop();
      return name !== "node_modules" && name !== ".git" && name !== ".test-dsh-home";
    },
  });

  pkg.dsh = pkg.dsh || {};
  pkg.dsh.profile = pkg.dsh.profile || {};
  const bundles = Array.isArray(pkg.dsh.profile.bundles) ? pkg.dsh.profile.bundles : [];
  if (!bundles.includes(NAME)) bundles.push(NAME);
  pkg.dsh.profile.bundles = bundles;

  await writeFile(profilePackage + ".bak", original, "utf8");
  await writeFile(profilePackage, JSON.stringify(pkg, null, 2) + "\n", "utf8");

  console.log("installed to", target);
  console.log("added to dsh.profile.bundles:", NAME);
  console.log("restart DeepSeek Harness, then open Settings → Plugins → 深海小王子");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
