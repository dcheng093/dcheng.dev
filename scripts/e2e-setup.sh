#!/bin/sh
# One-time setup for `npm run e2e`: Playwright's Chromium plus the system libraries it needs.
# On WSL without sudo the libs are downloaded as .debs and extracted into .cache/chromium-libs
# (picked up automatically by playwright.config.ts).
set -e
ROOT=$(cd "$(dirname "$0")/.." && pwd)
npx playwright install chromium
OUT="$ROOT/.cache/chromium-libs"
mkdir -p "$OUT"
TMP=$(mktemp -d)
cd "$TMP"
apt-get download libnss3 libnspr4 libasound2t64
for f in *.deb; do dpkg-deb -x "$f" "$OUT"; done
rm -rf "$TMP"
echo "Chromium libs extracted to $OUT"
