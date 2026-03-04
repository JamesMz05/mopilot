#!/bin/bash
# ==========================================
# MoPilot Prototyp - Server-Deployment-Script
# Ausführen auf dem Hetzner Server als root
# ==========================================
set -e

echo "🤖 MoPilot Prototyp - Server-Setup"
echo "=================================="

# 1. System-Updates
echo "📦 System aktualisieren..."
apt-get update && apt-get upgrade -y

# 2. Docker & Docker Compose prüfen
echo "🐳 Docker prüfen..."
if ! command -v docker &> /dev/null; then
    echo "Docker installieren..."
    curl -fsSL https://get.docker.com | sh
fi

if ! command -v docker compose &> /dev/null; then
    echo "Docker Compose Plugin installieren..."
    apt-get install -y docker-compose-plugin
fi

docker --version
docker compose version

# 3. Sicherheit
echo "🔒 Sicherheit einrichten..."
apt-get install -y ufw fail2ban

# Firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
echo "y" | ufw enable

# Fail2ban
systemctl enable fail2ban
systemctl start fail2ban

# 4. Projektverzeichnis
echo "📁 Projekt einrichten..."
mkdir -p /opt/mopilot
cd /opt/mopilot

# Falls Dateien schon da sind (z.B. via scp), überspringen
if [ ! -f docker-compose.yml ]; then
    echo "⚠️  Bitte laden Sie die Projektdateien nach /opt/mopilot hoch!"
    echo "   Beispiel: scp -r mopilot/* root@142.132.232.211:/opt/mopilot/"
    exit 1
fi

# 5. .env Datei erstellen (falls nicht vorhanden)
if [ ! -f .env ]; then
    echo "📝 .env Datei erstellen..."
    cp .env.example .env
    echo ""
    echo "⚠️  WICHTIG: Bearbeiten Sie /opt/mopilot/.env und tragen Sie Ihren Anthropic API-Key ein!"
    echo "   nano /opt/mopilot/.env"
    echo ""
fi

# 6. SSL-Verzeichnisse
mkdir -p certbot/www certbot/conf

# 7. Docker Images bauen und starten
echo "🏗️  Docker Images bauen..."
docker compose build

echo "🚀 Services starten..."
docker compose up -d

# 8. Status prüfen
echo ""
echo "✅ MoPilot Prototyp läuft!"
echo "=================================="
docker compose ps
echo ""
echo "🌐 Website:  http://mopilot.website"
echo "🔧 API:      http://api.mopilot.website/api/health"
echo "📋 Logs:     docker compose logs -f"
echo ""
echo "Nächster Schritt: SSL-Zertifikat einrichten:"
echo "  docker compose run --rm certbot certonly --webroot -w /var/www/certbot -d mopilot.website -d www.mopilot.website -d api.mopilot.website -d admin.mopilot.website -d app.mopilot.website -d docs.mopilot.website"
