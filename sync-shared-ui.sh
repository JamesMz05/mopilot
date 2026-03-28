#!/bin/bash
# Sync shared-ui to all frontend directories for Docker builds
# Run this before docker compose up -d --build

SHARED_UI="/opt/mopilot/shared-ui"
TARGETS=(
  "/opt/mopilot/frontend/shared-ui"
  "/opt/mopilot/ideen/frontend/shared-ui"
  "/opt/zeo-kunden/frontend/shared-ui"
  "/opt/cc-kunden/frontend/shared-ui"
)

for target in "${TARGETS[@]}"; do
  dir=$(dirname "$target")
  if [ -d "$dir" ]; then
    # Remove symlink if exists, then copy
    rm -rf "$target"
    cp -r "$SHARED_UI" "$target"
    echo "Synced shared-ui → $target"
  else
    echo "SKIP: $dir does not exist"
  fi
done

echo "Done. All frontends have a fresh copy of shared-ui."
