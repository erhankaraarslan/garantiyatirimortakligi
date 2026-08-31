#!/bin/sh
# Railway mounts the persistent volume at /data. Payload serves uploads from
# ./media and ./documents (cwd is /app). Railpack ignores railway.json
# startCommand and runs `pnpm start`, so this must run from the start script.
if [ ! -d /data ]; then
  exit 0
fi

mkdir -p /data/media /data/documents

for name in media documents; do
  if [ -L "$name" ]; then
    rm -f "$name"
  elif [ -e "$name" ]; then
    rm -rf "$name"
  fi
  ln -s "/data/$name" "$name"
done
