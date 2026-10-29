const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error("missing GITHUB_TOKEN");
  process.exit(1);
}
const owner = "qian3194323719-a11y";
const repo = "dsh-pet-prince";
const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases`, {
  method: "POST",
  headers: {
    Authorization: "Bearer " + token,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
    "User-Agent": "dsh-pet-prince-release",
  },
  body: JSON.stringify({
    tag_name: "v0.1.6",
    target_commitish: "main",
    name: "dsh-pet-prince v0.1.6",
    body: [
      "深海小王子 DSH 桌宠插件 v0.1.6。",
      "",
      "- 384×416 HD transparent sprite sheet",
      "- right-click only actions (wave / jump / wait / hide / reset)",
      "- smaller default display",
      "",
      "Install: download the source zip, extract, run `node scripts/install-local.mjs`, restart DSH.",
    ].join("\n"),
    draft: false,
    prerelease: false,
  }),
});
const text = await res.text();
console.log(res.status, text.slice(0, 1000));
