#!/bin/bash
# Nginx + SSL Setup für zeo-kunden.mopilot.website
# Ausführen NACH dem DNS-Eintrag (DNS muss propagiert sein)
SERVER="root@142.132.232.211"

ssh "$SERVER" bash << 'EOF'
set -e

# Nginx-Config schreiben
cat > /etc/nginx/sites-available/zeo-kunden << 'NGINX'
server {
    listen 80;
    server_name zeo-kunden.mopilot.website api.zeo-kunden.mopilot.website;
    location / { return 301 https://$host$request_uri; }
}

server {
    listen 443 ssl http2;
    server_name zeo-kunden.mopilot.website;

    ssl_certificate     /etc/letsencrypt/live/zeo-kunden.mopilot.website/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/zeo-kunden.mopilot.website/privkey.pem;

    location / {
        proxy_pass         http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-Proto https;
        proxy_read_timeout 30s;
    }
}

server {
    listen 443 ssl http2;
    server_name api.zeo-kunden.mopilot.website;

    ssl_certificate     /etc/letsencrypt/live/zeo-kunden.mopilot.website/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/zeo-kunden.mopilot.website/privkey.pem;

    location / {
        proxy_pass         http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-Proto https;
        proxy_buffering    off;
        proxy_cache        off;
        proxy_read_timeout 300s;
    }
}
NGINX

# Symlink aktivieren
ln -sf /etc/nginx/sites-available/zeo-kunden /etc/nginx/sites-enabled/zeo-kunden

# Prüfen welche Ports die Container belegen
echo "--- Container Ports ---"
docker ps --format "table {{.Names}}\t{{.Ports}}" | grep -i zeo || docker -f /opt/zeo-kunden/MoPilot_ZEO_Kunden/docker-compose.yml ps 2>/dev/null || docker compose -f /opt/zeo-kunden/MoPilot_ZEO_Kunden/docker-compose.yml ps

echo "--- Nginx Test ---"
nginx -t

echo "--- SSL Zertifikat ---"
certbot certonly --nginx \
  -d zeo-kunden.mopilot.website \
  -d api.zeo-kunden.mopilot.website \
  --non-interactive --agree-tos --email service@zeo-carsharing.de

systemctl reload nginx
echo "✅ Nginx + SSL fertig!"
EOF
