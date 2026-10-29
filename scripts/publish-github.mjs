/**
 * Publish this folder to GitHub using the REST API (no git binary required).
 *
 * Usage:
 *   GITHUB_TOKEN=github_pat_xxx node scripts/publish-github.mjs
 *
 * The token needs "repo" (or fine-grained: Contents + Administration) access.
 * It creates a public repo named dsh-pet-prince under the authenticated user
 * if it does not exist, then creates one commit with the current files.
 */
import { readFile, readdir } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const TOKEN = process.env.GITHUB_TOKEN;
const REPO = process.env.GITHUB_REPO || "dsh-pet-prince";
const BRANCH = process.env.GITHUB_BRANCH || "main";
const API = "https://api.github.com";

if (!TOKEN) {
  console.error("Missing GITHUB_TOKEN. Create a token with repo scope and retry.");
  process.exit(1);
}

const headers = {
  Authorization: "Bearer " + TOKEN,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "dsh-pet-prince-publisher",
};

async function api(path, init = {}, attempts = 5) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const res = await fetch(API + path, { ...init, headers: { ...headers, ...(init.headers || {}) } });
      const text = await res.text();
      let body;
      try {
        body = text ? JSON.parse(text) : null;
      } catch {
        body = text;
      }
      if (!res.ok) {
        const error = new Error("GitHub API " + res.status + " " + path + ": " + text.slice(0, 500));
        error.status = res.status;
        error.body = body;
        if (res.status >= 500 && attempt < attempts - 1) {
          await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
          continue;
        }
        throw error;
      }
      return body;
    } catch (error) {
      lastError = error;
      if (error && error.status) throw error;
      if (attempt < attempts - 1) {
        await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

function shouldSkip(name) {
  return (
    name === "node_modules" ||
    name === ".git" ||
    name === ".test-dsh-home" ||
    name === ".pnpm-store" ||
    name.endsWith(".log") ||
    name.endsWith(".zip")
  );
}

async function walk(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (shouldSkip(entry.name)) continue;
    const absolute = join(dir, entry.name);
    if (entry.isDirectory()) await walk(absolute, out);
    else if (entry.isFile()) out.push(absolute);
  }
  return out;
}

async function main() {
  const me = await api("/user");
  const owner = me.login;
  let repo;
  try {
    repo = await api("/repos/" + owner + "/" + REPO);
  } catch (error) {
    if (error.status !== 404) throw error;
    repo = await api("/user/repos", {
      method: "POST",
      body: JSON.stringify({
        name: REPO,
        description: "深海小王子 · 2D card-style desktop pet plugin for DeepSeek Harness",
        private: false,
        auto_init: false,
      }),
    });
    console.log("created", repo.html_url);
  }

  const defaultBranch = repo.default_branch || BRANCH;
  // GitHub's Git Data API refuses to create blobs in a repository with zero
  // commits (409 "Git Repository is empty"). Seed one commit first.
  try {
    await api("/repos/" + owner + "/" + REPO + "/git/ref/heads/" + defaultBranch);
  } catch (error) {
    if (error.status !== 404 && error.status !== 409) throw error;
    await api("/repos/" + owner + "/" + REPO + "/contents/README.md", {
      method: "PUT",
      body: JSON.stringify({
        message: "chore: initialize repository",
        content: Buffer.from("# dsh-pet-prince\n").toString("base64"),
      }),
    });
    console.log("initialized empty repository");
  }

  const files = await walk(ROOT);
  const blobs = [];
  for (const file of files) {
    const rel = relative(ROOT, file).split(sep).join("/");
    let content = await readFile(file);
    if (rel === "package.json") {
      const pkg = JSON.parse(content.toString("utf8"));
      pkg.homepage = repo.html_url + "#readme";
      pkg.repository = { type: "git", url: "git+" + repo.html_url + ".git" };
      pkg.bugs = { url: repo.html_url + "/issues" };
      content = Buffer.from(JSON.stringify(pkg, null, 2) + "\n");
    } else if (rel === "README.md") {
      content = Buffer.from(
        content.toString("utf8").split("https://github.com/dsh-pet-prince/dsh-pet-prince").join(repo.html_url),
      );
    }
    const blob = await api("/repos/" + owner + "/" + REPO + "/git/blobs", {
      method: "POST",
      body: JSON.stringify({ content: content.toString("base64"), encoding: "base64" }),
    });
    blobs.push({
      path: rel,
      mode: "100644",
      type: "blob",
      sha: blob.sha,
    });
  }

  const tree = await api("/repos/" + owner + "/" + REPO + "/git/trees", {
    method: "POST",
    body: JSON.stringify({ tree: blobs }),
  });

  let parents = [];
  try {
    const ref = await api("/repos/" + owner + "/" + REPO + "/git/ref/heads/" + BRANCH);
    parents = [ref.object.sha];
  } catch (error) {
    if (error.status !== 404 && error.status !== 409) throw error;
  }

  const commit = await api("/repos/" + owner + "/" + REPO + "/git/commits", {
    method: "POST",
    body: JSON.stringify({
      message: "feat: dsh-pet-prince 0.1.0",
      tree: tree.sha,
      parents,
    }),
  });

  if (parents.length === 0) {
    await api("/repos/" + owner + "/" + REPO + "/git/refs", {
      method: "POST",
      body: JSON.stringify({ ref: "refs/heads/" + BRANCH, sha: commit.sha }),
    });
  } else {
    await api("/repos/" + owner + "/" + REPO + "/git/refs/heads/" + BRANCH, {
      method: "PATCH",
      body: JSON.stringify({ sha: commit.sha, force: true }),
    });
  }

  console.log("published", repo.html_url);
  console.log("commit", commit.sha);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
