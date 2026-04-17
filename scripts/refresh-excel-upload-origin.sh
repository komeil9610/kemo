#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="/home/bobby/Desktop/rentit"
FRONTEND_TOML="$ROOT_DIR/frontend/wrangler.toml"

systemctl --user restart rentit-excel-backend.service
systemctl --user restart rentit-excel-tunnel.service

for _ in $(seq 1 30); do
  if curl -sf http://127.0.0.1:8787/api/health >/dev/null; then
    break
  fi
  sleep 1
done

TUNNEL_URL=""
for _ in $(seq 1 30); do
  TUNNEL_URL="$(journalctl --user -u rentit-excel-tunnel.service -n 50 --no-pager | grep -o 'https://[^ ]*trycloudflare.com' | tail -1 || true)"
  if [[ -n "$TUNNEL_URL" ]]; then
    break
  fi
  sleep 1
done

if [[ -z "$TUNNEL_URL" ]]; then
  echo "Failed to detect quick tunnel URL from journalctl." >&2
  exit 1
fi

python3 - <<PY
from pathlib import Path
path = Path("$FRONTEND_TOML")
text = path.read_text()
lines = []
updated = False
for line in text.splitlines():
    if line.startswith('EXCEL_UPLOAD_ORIGIN = '):
        lines.append('EXCEL_UPLOAD_ORIGIN = "$TUNNEL_URL"')
        updated = True
    else:
        lines.append(line)
if not updated:
    raise SystemExit("EXCEL_UPLOAD_ORIGIN not found in frontend/wrangler.toml")
path.write_text("\\n".join(lines) + "\\n")
PY

cd "$ROOT_DIR/frontend"
npm run cf:deploy

echo "Excel upload origin deployed: $TUNNEL_URL"
