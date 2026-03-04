#!/bin/bash
set -e
SERVER="root@142.132.232.211"
LOCAL_PATH="$(dirname "$0")/MoPilot_ZEO_Kunden"
REMOTE_PATH="/opt/zeo-kunden"

echo "📤 Dateien auf Server kopieren..."
scp -r "$LOCAL_PATH" "$SERVER:$REMOTE_PATH"

echo "🚀 Deployment starten..."
ssh "$SERVER" bash << 'EOF'
set -e
cd /opt/zeo-kunden/MoPilot_ZEO_Kunden

cat > .env << 'ENVEOF'
ANTHROPIC_API_KEY=DEIN_API_KEY_HIER
CLAUDE_MODEL=claude-sonnet-4-6
NEXT_PUBLIC_BACKEND_URL=https://api.zeo-kunden.mopilot.website
CORS_ORIGINS=https://zeo-kunden.mopilot.website,http://localhost:3000
ENVIRONMENT=production
ENVEOF

echo "🐳 Docker Compose bauen & starten (dauert 3-5 Min.)..."
docker compose down 2>/dev/null || true
docker compose up -d --build

echo "✅ Fertig! Container-Status:"
docker compose ps
EOF

echo ""
echo "✅ Deployment abgeschlossen!"
echo "   Frontend: https://zeo-kunden.mopilot.website"
echo "   Backend:  https://api.zeo-kunden.mopilot.website/api/health"
