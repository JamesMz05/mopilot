# MoPilot Infrastruktur-Vereinheitlichung – Design Spec

> Datum: 2026-04-06 | Version: v1.0 | Status: Approved

## Problemstellung

Die MoPilot-Infrastruktur hat drei zentrale Risiken:

1. **ENV-Chaos:** 5+ verstreute `.env`-Dateien, doppelte API-Keys, Coolify überschreibt ENV-Variablen, Fallback auf `sk-placeholder`
2. **Design-System-Sync:** Manuelles `sync-shared-ui.sh` (vergessbar), ZEO-Kunden nutzt shared-ui nicht, keine Validierung
3. **Deployment-Fragmentierung:** 3 verschiedene Methoden (Coolify, CI/CD mit rsync, manuell), doppelte Runtime-Verzeichnisse, `rsync --delete` löscht Dateien

## Gewählter Ansatz

**Einheitliches Docker Compose Monorepo** – Ein zentrales `docker-compose.yml` und eine `.env`-Datei verwalten alle Services. Coolify wird auf Traefik-Proxy reduziert.

## Ziel-Verzeichnisstruktur

```
/opt/mopilot/
├── docker-compose.yml          # EINZIGE Compose-Datei
├── .env                        # EINZIGE Secrets-Datei
├── .env.example                # Template ohne Secrets (in Git)
├── shared-ui/                  # Source of Truth
│   ├── components/
│   ├── hooks/
│   ├── globals.css
│   └── tailwind.preset.js
├── frontend/                   # Hauptsystem Frontend
│   └── Dockerfile
├── backend/                    # Hauptsystem Backend
│   └── Dockerfile
├── ideen/
│   ├── frontend/
│   │   └── Dockerfile
│   └── backend/
│       └── Dockerfile
├── MoPilot_ZEO_Kunden/
│   ├── frontend/
│   │   └── Dockerfile
│   └── backend/
│       └── Dockerfile
├── MoPilot_CC_Kunden/
│   ├── frontend/
│   │   └── Dockerfile
│   └── backend/
│       └── Dockerfile
├── postgres/
│   └── init.sql                # Erstellt alle 4 DBs
├── scripts/
│   └── health-check-all.sh
└── .github/workflows/
    └── deploy.yml
```

**Was entfällt:**
- `/opt/zeo-kunden/` (Runtime-Kopie)
- `/opt/cc-kunden/` (Runtime-Kopie)
- `sync-shared-ui.sh`
- Coolify Service-Management (nur Traefik bleibt)
- Alle einzelnen `docker-compose.yml` in Subsystemen
- Alle einzelnen `.env`-Dateien in Subsystemen

## Zentrale `.env`-Datei

Eine einzige Datei mit klaren Prefixen:

```env
# === SHARED ===
ANTHROPIC_API_KEY=sk-ant-api03-...
CLAUDE_MODEL=claude-sonnet-4-6
DOMAIN=mopilot.website

# === DATABASE ===
POSTGRES_USER=mopilot
POSTGRES_PASSWORD=mopilot_secret_2026
DB_MAIN=mopilot
DB_IDEEN=mopilot_ideen
DB_FUHRPARK=cc_fuhrpark
DB_VIANOVA=vianova_verwaltung

# === JWT ===
MAIN_SECRET_KEY=mopilot-jwt-secret-...
IDEEN_JWT_SECRET=mopilot-ideen-jwt-secret-2026

# === SMTP (nur Ideenplattform) ===
SMTP_HOST=smtp.ionos.de
SMTP_PORT=587
SMTP_USER=admin@mopilot.website
SMTP_PASSWORD=...
SMTP_FROM=admin@mopilot.website

# === CORS ===
ZEO_CORS_ORIGINS=https://zeo-kunden.mopilot.website
CC_CORS_ORIGINS=https://cc-kunden.mopilot.website
IDEEN_CORS_ORIGINS=https://ideen.mopilot.website
```

**Regeln:**
- Keine Fallback-Werte (`${VAR:-default}`) – fehlt ein Wert, startet der Container nicht (fail fast)
- Keine Duplikate – `ANTHROPIC_API_KEY` existiert genau einmal
- `.env.example` im Git dokumentiert alle Variablen ohne Secrets

## Docker Compose Architektur

10 Services, konsistentes Pattern:

```yaml
services:
  # === INFRASTRUKTUR ===
  postgres:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
    restart: unless-stopped

  # === HAUPTSYSTEM ===
  main-backend:
    build: ./backend
    depends_on:
      postgres: { condition: service_healthy }
      redis: { condition: service_healthy }
    environment:
      DATABASE_URL: postgresql+asyncpg://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${DB_MAIN}
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      SECRET_KEY: ${MAIN_SECRET_KEY}
      REDIS_URL: redis://redis:6379
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.main-api.rule=Host(`${DOMAIN}`) && PathPrefix(`/api`)"
      - "traefik.http.routers.main-api.tls.certresolver=letsencrypt"

  main-frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
      args:
        NEXT_PUBLIC_API_URL: https://${DOMAIN}/api
    depends_on: [main-backend]
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.main-web.rule=Host(`${DOMAIN}`)"
      - "traefik.http.routers.main-web.tls.certresolver=letsencrypt"

  # === IDEENPLATTFORM ===
  ideen-backend:
    build: ./ideen/backend
    depends_on:
      postgres: { condition: service_healthy }
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${DB_IDEEN}
      JWT_SECRET: ${IDEEN_JWT_SECRET}
      CORS_ORIGINS: ${IDEEN_CORS_ORIGINS}
      SMTP_HOST: ${SMTP_HOST}
      SMTP_PORT: ${SMTP_PORT}
      SMTP_USER: ${SMTP_USER}
      SMTP_PASSWORD: ${SMTP_PASSWORD}
    labels:
      - "traefik.http.routers.ideen-api.rule=Host(`ideen.${DOMAIN}`) && PathPrefix(`/api`)"
      - "traefik.http.routers.ideen-api.tls.certresolver=letsencrypt"

  ideen-frontend:
    build:
      context: .
      dockerfile: ideen/frontend/Dockerfile
    depends_on: [ideen-backend]
    labels:
      - "traefik.http.routers.ideen-web.rule=Host(`ideen.${DOMAIN}`)"
      - "traefik.http.routers.ideen-web.tls.certresolver=letsencrypt"

  # === ZEO KUNDEN ===
  zeo-backend:
    build: ./MoPilot_ZEO_Kunden/backend
    environment:
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      CLAUDE_MODEL: ${CLAUDE_MODEL}
      CORS_ORIGINS: ${ZEO_CORS_ORIGINS}
    labels:
      - "traefik.http.routers.zeo-api.rule=Host(`zeo-kunden.${DOMAIN}`)"
      - "traefik.http.routers.zeo-api.tls.certresolver=letsencrypt"

  zeo-frontend:
    build:
      context: .
      dockerfile: MoPilot_ZEO_Kunden/frontend/Dockerfile
    labels:
      - "traefik.http.routers.zeo-web.rule=Host(`zeo-kunden.${DOMAIN}`)"
      - "traefik.http.routers.zeo-web.tls.certresolver=letsencrypt"

  # === CC KUNDEN ===
  cc-backend:
    build: ./MoPilot_CC_Kunden/backend
    environment:
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      CLAUDE_MODEL: ${CLAUDE_MODEL}
      CORS_ORIGINS: ${CC_CORS_ORIGINS}
    labels:
      - "traefik.http.routers.cc-api.rule=Host(`cc-kunden.${DOMAIN}`)"
      - "traefik.http.routers.cc-api.tls.certresolver=letsencrypt"

  cc-frontend:
    build:
      context: .
      dockerfile: MoPilot_CC_Kunden/frontend/Dockerfile
    labels:
      - "traefik.http.routers.cc-web.rule=Host(`cc-kunden.${DOMAIN}`)"
      - "traefik.http.routers.cc-web.tls.certresolver=letsencrypt"

networks:
  default:
    name: mopilot
  coolify:
    external: true

volumes:
  postgres_data:
```

**Konsistente Patterns:**
- Alle Services: `restart: unless-stopped` (explizit in jedem Service setzen)
- Alle Frontends: Build-Context = Root (für shared-ui Zugriff)
- Alle Backends: `environment:` mit Variablen aus `.env`, keine Fallbacks
- Alle Services: Traefik-Labels mit TLS + certresolver
- Healthcheck-Dependencies: Backends warten auf Postgres/Redis

## Shared-UI ohne Sync-Script

Jedes Frontend-Dockerfile kopiert shared-ui direkt aus dem Monorepo-Root:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app

# Dependencies
COPY frontend/package*.json ./
RUN npm ci

# Shared-UI aus Root-Context
COPY shared-ui/ ./shared-ui/

# App-Code
COPY frontend/ ./
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

ENV HOSTNAME=0.0.0.0
EXPOSE 3000
CMD ["node", "server.js"]
```

**Warum das funktioniert:**
- `context: .` im Compose gibt dem Dockerfile Zugriff auf das gesamte Repo
- `COPY shared-ui/ ./shared-ui/` holt die aktuelle Version
- Docker-Layer-Cache erkennt Änderungen an shared-ui und baut nur dann neu
- Kein manueller Sync, kein Vergessen, kein Driften

## CI/CD Pipeline

Vereinfachte `deploy.yml`:

```yaml
name: Deploy MoPilot
on:
  push:
    branches: [master]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: 142.132.232.211
          username: root
          password: ${{ secrets.SERVER_SSH_PASSWORD }}
          script: |
            cd /opt/mopilot
            git fetch origin master
            git merge --ff-only FETCH_HEAD
            docker compose build
            docker compose up -d --remove-orphans
            sleep 15
            bash scripts/health-check-all.sh
```

**Was entfällt:**
- `sync-shared-ui.sh` Aufruf
- `rsync -a --delete` (kein Runtime-Verzeichnis mehr)
- Separater Coolify-Frontend-Rebuild
- Zwei verschiedene Deploy-Pfade

## Coolify-Migration (Zero-Downtime)

### Schritt 1: Vorbereitung
- Neue `docker-compose.yml` + `.env` erstellen
- Alle Dockerfiles anpassen (shared-ui Build-Context)
- Validierung mit `docker compose config`

### Schritt 2: Subsysteme migrieren (risikoarm)
- ZEO-Kunden: Container stoppen in `/opt/zeo-kunden`
- CC-Kunden: Container stoppen in `/opt/cc-kunden`
- Ideen: Container stoppen in `/opt/mopilot/ideen`
- Alle drei über neues Compose starten, Traefik routet sofort

### Schritt 3: Hauptsystem migrieren (kritisch)
- Coolify-Service auf "Stopped" setzen (NICHT löschen)
- Hauptsystem über neues Compose starten
- Postgres-Volume beibehalten (kein Datenverlust)
- Traefik übernimmt neue Container

### Schritt 4: Aufräumen
- `/opt/zeo-kunden/` löschen
- `/opt/cc-kunden/` löschen
- Alte docker-compose.yml Dateien entfernen
- Einzelne .env-Dateien löschen
- CI/CD auf neue Pipeline umstellen

### Postgres-Volume-Übernahme
Das bestehende Volume von Coolify's Postgres-Container wird im neuen Compose referenziert. Alle 4 Datenbanken bleiben erhalten.

### Rollback-Plan
Coolify-Service steht auf "Stopped", nicht "Deleted". Bei Problemen:
1. Neues Compose stoppen
2. Coolify-Service wieder starten
3. Alles wie vorher

## Risiko-Eliminierung (Vorher/Nachher)

| Risiko | Vorher | Nachher |
|--------|--------|---------|
| ENV-Duplikate | 5+ .env-Dateien, doppelte API-Keys | 1 zentrale .env |
| Fallback auf sk-placeholder | Ja, silent fail | Nein, fail fast |
| sync-shared-ui vergessen | Manuell, fehleranfällig | Entfällt (Docker Build) |
| ZEO ohne shared-ui | Ja | Nein, automatisch integriert |
| rsync --delete | Löscht Dateien | Entfällt komplett |
| Coolify überschreibt ENV | Ja | Coolify verwaltet keine Services mehr |
| 3 Deploy-Methoden | Coolify + CI/CD + manuell | 1 Methode: docker compose |
| Doppelte Runtime-Verzeichnisse | /opt/zeo-kunden, /opt/cc-kunden | Entfallen |

## Geschätzter Aufwand

| Phase | Aufwand |
|-------|---------|
| Compose + ENV erstellen | 2–3 Stunden |
| Dockerfiles anpassen (4 Frontends) | 3–4 Stunden |
| CI/CD Pipeline vereinfachen | 1 Stunde |
| Migration Subsysteme (ZEO, CC, Ideen) | 2–3 Stunden |
| Migration Hauptsystem + Postgres | 2–3 Stunden |
| Testing + Aufräumen | 2–3 Stunden |
| **Gesamt** | **~2 Wochen (mit Puffer)** |
