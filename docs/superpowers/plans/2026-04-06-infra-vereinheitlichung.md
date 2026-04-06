# MoPilot Infrastruktur-Vereinheitlichung – Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Alle MoPilot-Subsysteme auf ein einziges Docker Compose Monorepo migrieren – eine `.env`, ein `docker-compose.yml`, shared-ui via Docker Build-Stage, kein Coolify Service-Management mehr.

**Architecture:** Ein zentrales `docker-compose.yml` in `/opt/mopilot/` verwaltet 10 Services (4x Frontend, 4x Backend, Postgres, Redis). Alle Frontends nutzen `context: .` im Build, um shared-ui direkt aus dem Repo zu kopieren. Traefik bleibt über das externe `coolify`-Netzwerk angebunden. Die Migration erfolgt in 4 Phasen: Vorbereitung, Subsysteme, Hauptsystem, Aufräumen.

**Tech Stack:** Docker Compose, Traefik v3.1, PostgreSQL 16, Redis 7, Next.js 14, FastAPI, GitHub Actions

**Wichtig:** Vor JEDER destruktiven Aktion (Container stoppen, Verzeichnisse löschen) erst DB-Backup erstellen. Der Coolify-Service wird auf "Stopped" gesetzt, NICHT gelöscht – das ist der Rollback-Plan.

**Postgres-Volume:** Das bestehende Volume heißt `ns8wok04s4sgkcggwg48okcg_postgres-data` und enthält alle 4 Datenbanken. Es wird im neuen Compose als externes Volume referenziert.

**Verzeichnis-Konvention:** Das Ideen-Verzeichnis heißt im Repo `/opt/mopilot/ideen/` (mit Tippfehler "idien" in manchen Docker-Labels – wird korrigiert).

---

## File Map

### Neue Dateien
- `docker-compose.yml` – Zentrale Compose-Datei für alle 10 Services
- `.env.example` – Template mit allen Variablen (ohne Secrets)
- `postgres/init.sql` – Erstellt alle 4 Datenbanken + Extensions

### Modifizierte Dateien
- `frontend/Dockerfile` – Build-Context auf Root anpassen, shared-ui COPY
- `ideen/frontend/Dockerfile` – Build-Context auf Root anpassen, shared-ui COPY
- `MoPilot_ZEO_Kunden/frontend/Dockerfile` – Build-Context auf Root anpassen, shared-ui COPY
- `MoPilot_ZEO_Kunden/frontend/tsconfig.json` – `@shared/*` Path-Alias hinzufügen
- `MoPilot_ZEO_Kunden/frontend/tailwind.config.js` – Shared Preset + content-Pfade
- `MoPilot_CC_Kunden/frontend/Dockerfile` – Build-Context auf Root anpassen, shared-ui COPY
- `MoPilot_CC_Kunden/frontend/tsconfig.json` – `@shared/*` Path-Alias hinzufügen
- `MoPilot_CC_Kunden/frontend/tailwind.config.js` – Shared Preset + content-Pfade
- `.github/workflows/deploy.yml` – Vereinfachte Pipeline
- `scripts/health-check-all.sh` – Container-Namen aktualisieren

### Gelöschte Dateien (Phase Aufräumen)
- `sync-shared-ui.sh` – Ersetzt durch Docker Build-Stage
- `ideen/docker-compose.yml` – Ersetzt durch zentrale Compose
- `MoPilot_ZEO_Kunden/docker-compose.yml` – Ersetzt durch zentrale Compose
- `MoPilot_CC_Kunden/docker-compose.yml` – Ersetzt durch zentrale Compose
- `docker-compose.yml.bak` – Altlast
- `deploy-zeo.sh` – Veraltet

---

## Task 1: DB-Backup + Postgres Init-Script

**Files:**
- Create: `postgres/init.sql`

- [ ] **Step 1: DB-Backup erstellen**

```bash
cd /opt/mopilot
bash /opt/backups/backup-all-dbs.sh
ls -la /opt/backups/db/
```

Expected: 4 aktuelle Backup-Dateien (mopilot, mopilot_ideen, cc_fuhrpark, vianova_verwaltung).

- [ ] **Step 2: Postgres init.sql erstellen**

Erstelle `postgres/init.sql` – wird NUR bei einem komplett neuen Postgres-Container ausgeführt (nicht bei Volume-Übernahme):

```sql
-- MoPilot Multi-Database Initialization
-- Nur bei Erstinstallation relevant (bestehende Volumes haben die DBs bereits)

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Zusätzliche Datenbanken (die Default-DB 'mopilot' wird von POSTGRES_DB erstellt)
SELECT 'CREATE DATABASE mopilot_ideen OWNER mopilot'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'mopilot_ideen')\gexec

SELECT 'CREATE DATABASE cc_fuhrpark OWNER mopilot'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'cc_fuhrpark')\gexec

SELECT 'CREATE DATABASE vianova_verwaltung OWNER mopilot'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'vianova_verwaltung')\gexec
```

- [ ] **Step 3: Commit**

```bash
git add postgres/init.sql
git commit -m "feat(infra): postgres init.sql für Multi-DB Setup"
```

---

## Task 2: Zentrale .env.example erstellen

**Files:**
- Create: `.env.example` (ersetzt die bestehende minimale Version)

- [ ] **Step 1: .env.example schreiben**

```env
# ============================================================
# MoPilot – Zentrale Umgebungsvariablen
# Kopiere diese Datei nach .env und fülle die Werte aus.
# ============================================================

# === SHARED ===
ANTHROPIC_API_KEY=sk-ant-api03-CHANGE_ME
CLAUDE_MODEL=claude-sonnet-4-6
DOMAIN=mopilot.website

# === DATABASE ===
POSTGRES_USER=mopilot
POSTGRES_PASSWORD=CHANGE_ME
POSTGRES_DB=mopilot

# === JWT ===
MAIN_SECRET_KEY=CHANGE_ME
IDEEN_JWT_SECRET=CHANGE_ME

# === SMTP (Ideenplattform) ===
SMTP_HOST=smtp.ionos.de
SMTP_PORT=587
SMTP_USER=admin@mopilot.website
SMTP_PASSWORD=CHANGE_ME
SMTP_FROM=admin@mopilot.website

# === CORS ===
ZEO_CORS_ORIGINS=https://zeo-kunden.mopilot.website
CC_CORS_ORIGINS=https://cc-kunden.mopilot.website
IDEEN_CORS_ORIGINS=https://ideen.mopilot.website,https://mopilot.website

# === FRONTEND BUILD ARGS ===
NEXT_PUBLIC_API_URL=https://mopilot.website/api
ZEO_BACKEND_URL=https://api.zeo-kunden.mopilot.website
CC_BACKEND_URL=https://api.cc-kunden.mopilot.website
CC_AUTH_API_URL=https://api.mopilot.website
```

- [ ] **Step 2: Echte .env aus bestehenden Dateien zusammenbauen**

Werte aus diesen Quellen zusammenführen (manuell, NICHT automatisiert):
- `ANTHROPIC_API_KEY` → aus `/opt/mopilot/.env`
- `POSTGRES_PASSWORD` → aus Coolify-Compose (Zeile: `mopilot_secret_2026`)
- `MAIN_SECRET_KEY` → aus Coolify-Compose (`SECRET_KEY`)
- `IDEEN_JWT_SECRET` → aus `/opt/mopilot/ideen/.env` (`JWT_SECRET`)
- `SMTP_PASSWORD` → aus `/opt/mopilot/ideen/.env`

```bash
# Werte auslesen (NICHT in .env schreiben – nur anzeigen)
echo "=== Hauptsystem ==="
grep ANTHROPIC_API_KEY /opt/mopilot/.env
echo "=== Ideen ==="
grep -E 'JWT_SECRET|SMTP_PASSWORD' /opt/mopilot/ideen/.env
```

Dann manuell `/opt/mopilot/.env` mit allen korrekten Werten erstellen.

- [ ] **Step 3: Validieren**

```bash
# Prüfen, dass alle CHANGE_ME ersetzt wurden
grep -c "CHANGE_ME" /opt/mopilot/.env
```

Expected: `0` (keine Platzhalter mehr).

- [ ] **Step 4: Commit**

```bash
git add .env.example
git commit -m "feat(infra): zentrale .env.example mit allen Variablen"
```

---

## Task 3: Frontend-Dockerfiles anpassen (Root-Context + shared-ui)

**Files:**
- Modify: `frontend/Dockerfile`
- Modify: `ideen/frontend/Dockerfile`
- Modify: `MoPilot_ZEO_Kunden/frontend/Dockerfile`
- Modify: `MoPilot_CC_Kunden/frontend/Dockerfile`

Alle 4 Frontends bekommen dasselbe Pattern: `context: .` (Root) im Compose, daher muss das Dockerfile die Pfade relativ zum Root referenzieren.

- [ ] **Step 1: Hauptsystem frontend/Dockerfile anpassen**

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app

ARG NEXT_PUBLIC_API_URL=https://api.mopilot.website
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install

COPY shared-ui/ ./shared-ui/
COPY frontend/ .

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

- [ ] **Step 2: Ideen frontend/Dockerfile anpassen**

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY ideen/frontend/package.json ideen/frontend/package-lock.json* ./
RUN npm ci || npm install

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY shared-ui/ ./shared-ui/
COPY ideen/frontend/ .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

- [ ] **Step 3: ZEO frontend/Dockerfile anpassen**

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY MoPilot_ZEO_Kunden/frontend/package.json ./
RUN npm install

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY shared-ui/ ./shared-ui/
COPY MoPilot_ZEO_Kunden/frontend/ .
ARG NEXT_PUBLIC_BACKEND_URL=https://api.zeo-kunden.mopilot.website
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

- [ ] **Step 4: CC frontend/Dockerfile anpassen**

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY MoPilot_CC_Kunden/frontend/package.json ./
RUN npm install

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY shared-ui/ ./shared-ui/
COPY MoPilot_CC_Kunden/frontend/ .
ARG NEXT_PUBLIC_BACKEND_URL=https://api.cc-kunden.mopilot.website
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_AUTH_API_URL=https://api.mopilot.website
ENV NEXT_PUBLIC_AUTH_API_URL=$NEXT_PUBLIC_AUTH_API_URL
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

- [ ] **Step 5: Commit**

```bash
git add frontend/Dockerfile ideen/frontend/Dockerfile MoPilot_ZEO_Kunden/frontend/Dockerfile MoPilot_CC_Kunden/frontend/Dockerfile
git commit -m "feat(infra): Frontend-Dockerfiles für Root-Context + shared-ui"
```

---

## Task 4: ZEO + CC Shared-UI Integration (tsconfig + tailwind)

**Files:**
- Modify: `MoPilot_ZEO_Kunden/frontend/tsconfig.json`
- Modify: `MoPilot_ZEO_Kunden/frontend/tailwind.config.js`
- Modify: `MoPilot_CC_Kunden/frontend/tsconfig.json`
- Modify: `MoPilot_CC_Kunden/frontend/tailwind.config.js`

ZEO und CC nutzen bisher KEIN shared-ui. Beide bekommen `@shared/*` Alias und Tailwind-Preset.

- [ ] **Step 1: ZEO tsconfig.json – @shared Alias hinzufügen**

In `MoPilot_ZEO_Kunden/frontend/tsconfig.json`, den `paths`-Block ersetzen:

```json
"paths": {
  "@/*": ["./src/*"],
  "@shared/*": ["./shared-ui/*"]
}
```

- [ ] **Step 2: ZEO tailwind.config.js – Preset + shared-ui Content**

`MoPilot_ZEO_Kunden/frontend/tailwind.config.js` ersetzen durch:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('./shared-ui/tailwind.preset.js')],
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './shared-ui/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        zeo: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#00a651',
          700: '#15803d',
          800: '#006b33',
          900: '#14532d',
        },
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 3: CC tsconfig.json – @shared Alias hinzufügen**

In `MoPilot_CC_Kunden/frontend/tsconfig.json`, den `paths`-Block ersetzen:

```json
"paths": {
  "@/*": ["./src/*"],
  "@shared/*": ["./shared-ui/*"]
}
```

- [ ] **Step 4: CC tailwind.config.js – Preset + shared-ui Content**

`MoPilot_CC_Kunden/frontend/tailwind.config.js` ersetzen durch:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('./shared-ui/tailwind.preset.js')],
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './shared-ui/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cc: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#00a651',
          700: '#15803d',
          800: '#006b33',
          900: '#14532d',
        },
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 5: Commit**

```bash
git add MoPilot_ZEO_Kunden/frontend/tsconfig.json MoPilot_ZEO_Kunden/frontend/tailwind.config.js MoPilot_CC_Kunden/frontend/tsconfig.json MoPilot_CC_Kunden/frontend/tailwind.config.js
git commit -m "feat(infra): ZEO + CC shared-ui Integration (tsconfig + tailwind)"
```

---

## Task 5: Zentrale docker-compose.yml erstellen

**Files:**
- Create: `docker-compose.yml`

- [ ] **Step 1: docker-compose.yml schreiben**

```yaml
# MoPilot – Zentrale Docker Compose Konfiguration
# Alle 4 Plattformen + Postgres + Redis in einem File.
# Secrets kommen aus .env (env_file ist implizit für Variablen-Substitution).

services:
  # =================================================================
  # INFRASTRUKTUR
  # =================================================================
  postgres:
    image: postgres:16-alpine
    container_name: mopilot-postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./postgres/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB:-mopilot}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-mopilot}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
    restart: unless-stopped
    networks:
      - internal

  redis:
    image: redis:7-alpine
    container_name: mopilot-redis
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - internal

  # =================================================================
  # HAUPTSYSTEM (mopilot.website)
  # =================================================================
  main-backend:
    build: ./backend
    container_name: mopilot-main-backend
    depends_on:
      postgres: { condition: service_healthy }
      redis: { condition: service_healthy }
    environment:
      DATABASE_URL: "postgresql+asyncpg://${POSTGRES_USER}:${POSTGRES_PASSWORD}@mopilot-postgres:5432/${POSTGRES_DB:-mopilot}"
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      CLAUDE_MODEL: ${CLAUDE_MODEL}
      SECRET_KEY: ${MAIN_SECRET_KEY}
      REDIS_URL: "redis://mopilot-redis:6379"
      CORS_ORIGINS: "https://${DOMAIN},https://ideen.${DOMAIN}"
      ENVIRONMENT: production
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.main-api.rule=Host(`api.${DOMAIN}`)"
      - "traefik.http.routers.main-api.entrypoints=https"
      - "traefik.http.routers.main-api.tls=true"
      - "traefik.http.routers.main-api.tls.certresolver=letsencrypt"
      - "traefik.http.services.main-api.loadbalancer.server.port=8000"
    restart: unless-stopped
    networks:
      - internal
      - coolify

  main-frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
      args:
        NEXT_PUBLIC_API_URL: "https://api.${DOMAIN}"
    container_name: mopilot-main-frontend
    depends_on:
      - main-backend
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.main-web.rule=Host(`${DOMAIN}`)"
      - "traefik.http.routers.main-web.entrypoints=https"
      - "traefik.http.routers.main-web.tls=true"
      - "traefik.http.routers.main-web.tls.certresolver=letsencrypt"
      - "traefik.http.services.main-web.loadbalancer.server.port=3000"
    restart: unless-stopped
    networks:
      - coolify

  # =================================================================
  # IDEENPLATTFORM (ideen.mopilot.website)
  # =================================================================
  ideen-backend:
    build: ./ideen/backend
    container_name: mopilot-ideen-backend
    depends_on:
      postgres: { condition: service_healthy }
    environment:
      DATABASE_URL: "postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@mopilot-postgres:5432/mopilot_ideen"
      JWT_SECRET: ${IDEEN_JWT_SECRET}
      CORS_ORIGINS: ${IDEEN_CORS_ORIGINS}
      SMTP_HOST: ${SMTP_HOST}
      SMTP_PORT: ${SMTP_PORT}
      SMTP_USER: ${SMTP_USER}
      SMTP_PASSWORD: ${SMTP_PASSWORD}
      SMTP_FROM: ${SMTP_FROM}
      FRONTEND_URL: "https://ideen.${DOMAIN}"
      BACKEND_URL: "https://api.ideen.${DOMAIN}"
      ENVIRONMENT: production
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.ideen-api.rule=Host(`ideen.${DOMAIN}`) && PathPrefix(`/api`)"
      - "traefik.http.routers.ideen-api.entrypoints=https"
      - "traefik.http.routers.ideen-api.tls=true"
      - "traefik.http.routers.ideen-api.tls.certresolver=letsencrypt"
      - "traefik.http.routers.ideen-api.priority=20"
      - "traefik.http.services.ideen-api.loadbalancer.server.port=8000"
    restart: unless-stopped
    networks:
      - internal
      - coolify

  ideen-frontend:
    build:
      context: .
      dockerfile: ideen/frontend/Dockerfile
    container_name: mopilot-ideen-frontend
    depends_on:
      - ideen-backend
    environment:
      NEXT_PUBLIC_API_URL: "https://ideen.${DOMAIN}/api"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.ideen-web.rule=Host(`ideen.${DOMAIN}`)"
      - "traefik.http.routers.ideen-web.entrypoints=https"
      - "traefik.http.routers.ideen-web.tls=true"
      - "traefik.http.routers.ideen-web.tls.certresolver=letsencrypt"
      - "traefik.http.routers.ideen-web.priority=10"
      - "traefik.http.services.ideen-web.loadbalancer.server.port=3000"
    restart: unless-stopped
    networks:
      - coolify

  # =================================================================
  # ZEO KUNDENASSISTENT (zeo-kunden.mopilot.website)
  # =================================================================
  zeo-backend:
    build: ./MoPilot_ZEO_Kunden/backend
    container_name: mopilot-zeo-backend
    environment:
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      CLAUDE_MODEL: ${CLAUDE_MODEL}
      CORS_ORIGINS: ${ZEO_CORS_ORIGINS}
      ENVIRONMENT: production
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.zeo-api.rule=Host(`api.zeo-kunden.${DOMAIN}`)"
      - "traefik.http.routers.zeo-api.entrypoints=https"
      - "traefik.http.routers.zeo-api.tls=true"
      - "traefik.http.routers.zeo-api.tls.certresolver=letsencrypt"
      - "traefik.http.services.zeo-api.loadbalancer.server.port=8000"
    restart: unless-stopped
    networks:
      - coolify

  zeo-frontend:
    build:
      context: .
      dockerfile: MoPilot_ZEO_Kunden/frontend/Dockerfile
      args:
        NEXT_PUBLIC_BACKEND_URL: "https://api.zeo-kunden.${DOMAIN}"
    container_name: mopilot-zeo-frontend
    depends_on:
      - zeo-backend
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.zeo-web.rule=Host(`zeo-kunden.${DOMAIN}`)"
      - "traefik.http.routers.zeo-web.entrypoints=https"
      - "traefik.http.routers.zeo-web.tls=true"
      - "traefik.http.routers.zeo-web.tls.certresolver=letsencrypt"
      - "traefik.http.services.zeo-web.loadbalancer.server.port=3000"
    restart: unless-stopped
    networks:
      - coolify

  # =================================================================
  # CC KUNDENASSISTENT (cc-kunden.mopilot.website)
  # =================================================================
  cc-backend:
    build: ./MoPilot_CC_Kunden/backend
    container_name: mopilot-cc-backend
    environment:
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      CLAUDE_MODEL: ${CLAUDE_MODEL}
      CORS_ORIGINS: ${CC_CORS_ORIGINS}
      ENVIRONMENT: production
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.cc-api.rule=Host(`api.cc-kunden.${DOMAIN}`)"
      - "traefik.http.routers.cc-api.entrypoints=https"
      - "traefik.http.routers.cc-api.tls=true"
      - "traefik.http.routers.cc-api.tls.certresolver=letsencrypt"
      - "traefik.http.services.cc-api.loadbalancer.server.port=8000"
    restart: unless-stopped
    networks:
      - coolify

  cc-frontend:
    build:
      context: .
      dockerfile: MoPilot_CC_Kunden/frontend/Dockerfile
      args:
        NEXT_PUBLIC_BACKEND_URL: "https://api.cc-kunden.${DOMAIN}"
        NEXT_PUBLIC_AUTH_API_URL: "https://api.${DOMAIN}"
    container_name: mopilot-cc-frontend
    depends_on:
      - cc-backend
      - main-backend
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.cc-web.rule=Host(`cc-kunden.${DOMAIN}`)"
      - "traefik.http.routers.cc-web.entrypoints=https"
      - "traefik.http.routers.cc-web.tls=true"
      - "traefik.http.routers.cc-web.tls.certresolver=letsencrypt"
      - "traefik.http.services.cc-web.loadbalancer.server.port=3000"
    restart: unless-stopped
    networks:
      - coolify

networks:
  internal:
    name: mopilot-internal
  coolify:
    external: true

volumes:
  postgres_data:
    external: true
    name: ns8wok04s4sgkcggwg48okcg_postgres-data
```

- [ ] **Step 2: Compose validieren**

```bash
cd /opt/mopilot
docker compose config --quiet
echo "Exit code: $?"
```

Expected: Exit code `0`, keine Fehler.

- [ ] **Step 3: Commit**

```bash
git add docker-compose.yml
git commit -m "feat(infra): zentrale docker-compose.yml für alle 10 Services"
```

---

## Task 6: CI/CD Pipeline vereinfachen

**Files:**
- Modify: `.github/workflows/deploy.yml`

- [ ] **Step 1: deploy.yml ersetzen**

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
            set -e
            cd /opt/mopilot

            # Code aktualisieren
            git fetch https://${{ secrets.GH_PAT }}@github.com/JamesMz05/mopilot.git master
            git merge --ff-only FETCH_HEAD

            # Alle Services bauen und starten
            docker compose build
            docker compose up -d --remove-orphans

            # Health-Check
            sleep 20
            bash scripts/health-check-all.sh
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "feat(infra): vereinfachte CI/CD Pipeline – kein rsync, kein sync-shared-ui"
```

---

## Task 7: Health-Check Script anpassen

**Files:**
- Modify: `scripts/health-check-all.sh`

- [ ] **Step 1: Postgres-Container-Name aktualisieren**

Im Script `scripts/health-check-all.sh` den Postgres-Healthcheck ändern von:

```bash
docker exec postgres-ns8wok04s4sgkcggwg48okcg pg_isready -U mopilot
```

zu:

```bash
docker exec mopilot-postgres pg_isready -U mopilot
```

Die URL-Checks bleiben unverändert (gleiche Domains).

- [ ] **Step 2: Commit**

```bash
git add scripts/health-check-all.sh
git commit -m "fix(infra): health-check auf neuen Postgres-Container-Namen anpassen"
```

---

## Task 8: Migration – Single Cutover

**Voraussetzung:** Tasks 1–7 sind committed. Alle Dateien sind vorbereitet.

**Warum Single Cutover?** Postgres kann nur von einem Container gleichzeitig gemountet werden. Eine phasenweise Migration (erst Subsysteme, dann Hauptsystem) funktioniert nicht, weil die neuen Services `mopilot-postgres` als Hostnamen erwarten, aber Coolify's Container `postgres-ns8wok04s4sgkcggwg48okcg` heißt. Stattdessen: alles vorbauen, dann in einem Schritt umschalten (~30 Sekunden Downtime).

- [ ] **Step 1: Aktuellen Zustand dokumentieren**

```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | sort
```

Ergebnis aufschreiben/speichern als Referenz.

- [ ] **Step 2: Alle neuen Images vorbauen (altes System läuft noch)**

```bash
cd /opt/mopilot
docker compose build
```

Expected: Alle 10 Images werden gebaut. Das alte System läuft währenddessen weiter – kein Downtime.

- [ ] **Step 3: Prüfen ob Postgres-Volume existiert**

```bash
docker volume inspect ns8wok04s4sgkcggwg48okcg_postgres-data --format '{{.Mountpoint}}'
```

Expected: Pfad wird angezeigt.

- [ ] **Step 4: CUTOVER – Alle alten Container stoppen**

```bash
# Subsysteme stoppen
cd /opt/zeo-kunden && docker compose down
cd /opt/cc-kunden && docker compose down
cd /opt/mopilot/ideen && docker compose down

# Coolify Hauptsystem stoppen (Frontend + Backend + Redis)
# WICHTIG: Postgres zuletzt, damit DB-Connections sauber geschlossen werden
cd /data/coolify/services/ns8wok04s4sgkcggwg48okcg
docker compose stop frontend backend redis postgres
```

Expected: Alle alten Container gestoppt. Ab hier: kurze Downtime.

- [ ] **Step 5: CUTOVER – Alle neuen Container starten**

```bash
cd /opt/mopilot
docker compose up -d
```

Expected: Alle 10 Container starten. Postgres erkennt das bestehende Volume und überspringt init.sql. Downtime endet sobald Traefik die neuen Container registriert (~10-15 Sekunden).

- [ ] **Step 6: Alle Services testen**

```bash
sleep 20
curl -sSf -o /dev/null -w "%{http_code}\n" https://mopilot.website
curl -sSf -o /dev/null -w "%{http_code}\n" https://api.mopilot.website/api/health
curl -sSf -o /dev/null -w "%{http_code}\n" https://ideen.mopilot.website/api/health
curl -sSf -o /dev/null -w "%{http_code}\n" https://zeo-kunden.mopilot.website/api/health
curl -sSf -o /dev/null -w "%{http_code}\n" https://cc-kunden.mopilot.website/api/health
```

Expected: Alle geben `200` (oder `301`/`302`) zurück.

- [ ] **Step 7: Vollständiger Health-Check**

```bash
bash /opt/mopilot/scripts/health-check-all.sh
```

Expected: Alle Services grün.

**Rollback falls Fehler:**
```bash
# Neues System komplett stoppen
cd /opt/mopilot
docker compose down

# Altes System wieder starten
cd /data/coolify/services/ns8wok04s4sgkcggwg48okcg
docker compose up -d
cd /opt/mopilot/ideen && docker compose up -d
cd /opt/zeo-kunden && docker compose up -d
cd /opt/cc-kunden && docker compose up -d
```

---

## Task 9: Aufräumen

**Voraussetzung:** Task 8 erfolgreich – ALLE Services laufen über neues Compose, Health-Check bestanden.

- [ ] **Step 1: Alte Runtime-Verzeichnisse sichern und löschen**

```bash
# Sicherung (falls nötig)
tar czf /opt/backups/pre-migration-zeo.tar.gz /opt/zeo-kunden/
tar czf /opt/backups/pre-migration-cc.tar.gz /opt/cc-kunden/

# Löschen
rm -rf /opt/zeo-kunden/
rm -rf /opt/cc-kunden/
```

- [ ] **Step 2: Veraltete Dateien im Repo löschen**

```bash
cd /opt/mopilot
rm -f sync-shared-ui.sh
rm -f deploy-zeo.sh
rm -f docker-compose.yml.bak
rm -f ideen/docker-compose.yml
rm -f MoPilot_ZEO_Kunden/docker-compose.yml
rm -f MoPilot_CC_Kunden/docker-compose.yml
```

- [ ] **Step 3: Alte .env-Dateien sichern und entfernen**

```bash
# Sicherung
cp /opt/mopilot/ideen/.env /opt/backups/ideen-env-backup.env

# Entfernen (die zentrale .env hat jetzt alle Werte)
rm -f /opt/mopilot/ideen/.env
rm -f /opt/mopilot/.env.save.1
```

- [ ] **Step 4: Backup-Script anpassen**

In `/opt/backups/backup-all-dbs.sh` den Postgres-Container-Namen ändern von `postgres-ns8wok04s4sgkcggwg48okcg` zu `mopilot-postgres`.

In `/opt/backups/backup-secrets.sh` die Pfade aktualisieren: statt 6 einzelner .env-Dateien nur noch `/opt/mopilot/.env`.

- [ ] **Step 5: Commit**

```bash
cd /opt/mopilot
git add -A
git commit -m "chore(infra): Aufräumen – alte Compose/ENV/Sync-Dateien entfernt"
```

- [ ] **Step 6: Finaler Gesamt-Test**

```bash
bash /opt/mopilot/scripts/health-check-all.sh
docker ps --format "table {{.Names}}\t{{.Status}}" | sort
```

Expected: 10 Container mit `mopilot-*` Prefix, alle "Up" + "(healthy)" bei Postgres/Redis.

---

## Task 10: CLAUDE.md und Dokumentation aktualisieren

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: CLAUDE.md aktualisieren**

Folgende Sektionen in `CLAUDE.md` anpassen:

**Docker Services:** Ersetzen durch:
```
**Alle Services (ein docker-compose.yml):**
postgres, redis, main-backend, main-frontend, ideen-backend, ideen-frontend, zeo-backend, zeo-frontend, cc-backend, cc-frontend
```

**Serverpfade:** Aktualisieren:
- `/opt/zeo-kunden/` → entfällt (jetzt in `/opt/mopilot/MoPilot_ZEO_Kunden/`)
- `/opt/cc-kunden/` → entfällt (jetzt in `/opt/mopilot/MoPilot_CC_Kunden/`)
- Coolify-Pfad bleibt als Referenz (Traefik)
- Sync-Script → entfällt

**Wichtige Hinweise:** Aktualisieren:
- `sync-shared-ui.sh vor jedem Build` → entfällt
- `docker compose restart lädt .env NICHT` → bleibt relevant
- Neuer Hinweis: `Ein einziges docker-compose.yml für alle Services in /opt/mopilot/`

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: CLAUDE.md auf neue Infra-Struktur aktualisieren"
```
