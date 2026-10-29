# -*- coding: utf-8 -*-
"""GitHub device-flow publisher (Python transport, Node API publisher).

Node fetch was unreliable for github.com/login/device on this machine while
Python's urllib works. This script obtains the token with urllib and then hands
it to scripts/publish-github.mjs through the environment.
"""
import json
import os
import shutil
import subprocess
import sys
import time
import urllib.parse
import urllib.request

CLIENT_ID = os.environ.get("GITHUB_CLIENT_ID", "Iv1.b507a08c87ecfe98")
SCOPE = "repo"
HERE = os.path.dirname(os.path.abspath(__file__))
PUBLISH = os.path.join(HERE, "publish-github.mjs")


def post(url, data, timeout=45):
    body = urllib.parse.urlencode(data).encode()
    req = urllib.request.Request(
        url,
        data=body,
        headers={
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "dsh-pet-prince-device-publisher",
        },
    )
    with urllib.request.urlopen(req, timeout=timeout) as res:
        return json.loads(res.read().decode("utf-8", "ignore"))


def main():
    device = post("https://github.com/login/device/code", {"client_id": CLIENT_ID, "scope": SCOPE})
    if "device_code" not in device:
        raise RuntimeError("device code failed: " + json.dumps(device))
    print(
        "DEVICE_CODE "
        + json.dumps(
            {
                "user_code": device["user_code"],
                "verification_uri": device["verification_uri"],
                "expires_in": device["expires_in"],
            }
        ),
        flush=True,
    )

    deadline = time.time() + int(device.get("expires_in", 900))
    interval = int(device.get("interval", 5))
    while time.time() < deadline:
        time.sleep(interval)
        try:
            token = post(
                "https://github.com/login/oauth/access_token",
                {
                    "client_id": CLIENT_ID,
                    "device_code": device["device_code"],
                    "grant_type": "urn:ietf:params:oauth:grant-type:device_code",
                },
            )
        except Exception as exc:  # transient network / TLS
            print("POLL_ERROR " + type(exc).__name__ + ": " + str(exc), flush=True)
            continue

        if token.get("access_token"):
            print("AUTHORIZED", flush=True)
            node = os.environ.get("NODE_BIN") or shutil.which("node")
            if not node:
                node = os.path.join(
                    os.path.expanduser("~"),
                    ".dsh",
                    "dsh-runtimes",
                    "dsh-primary-runtime",
                    "dependencies",
                    "node",
                    "bin",
                    "node.exe",
                )
            env = dict(os.environ)
            env["GITHUB_TOKEN"] = token["access_token"]
            return subprocess.call([node, PUBLISH], env=env)

        error = token.get("error")
        if error == "authorization_pending":
            continue
        if error == "slow_down":
            interval += 5
            continue
        print("TOKEN_ERROR " + json.dumps(token), flush=True)
        return 1

    print("DEVICE_CODE_EXPIRED", flush=True)
    return 1


if __name__ == "__main__":
    sys.exit(main() or 0)
