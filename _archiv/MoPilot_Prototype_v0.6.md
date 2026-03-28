# MoPilot
**KI-gestützter Mobilitätsassistent für E-Carsharing im ländlichen Raum**
**Prototyp v0.6**

Betreiber: ZEO Carsharing (Region Bruchsal) | Car&RideSharing Community eG (cc)
Datum: 5. März 2026

---

## Inhaltsverzeichnis

1. Zusammenfassung
2. IT-Umfeld
   - 2.1 Genutzte Werkzeuge und Technologien
   - 2.2 Server-Infrastruktur
   - 2.3 Admin und Deployment
   - 2.4 IT-Übersichtsgrafik
   - 2.5 IT-Detailgrafik
3. Deployment-Prozess (CI/CD)
   - 3.1 Übersicht
   - 3.2 Komponenten der Pipeline
   - 3.3 Ablauf eines Deployments
   - 3.4 GitHub Actions Workflow (v0.5 – beide Systeme)
   - 3.5 Deployment-Diagramm
4. Infrastruktur-Stabilisierung (v0.5)
   - 4.1 Analysierte Probleme
   - 4.2 Durchgeführte Maßnahmen
   - 4.3 Ergebnis
5. Bugfixes und Sicherheitsupdates (neu in v0.6)
   - 5.1 502 Bad Gateway – ZEO-Kunden Frontend
   - 5.2 Next.js Sicherheitsupdate (14.1.0 → 14.2.35)
   - 5.3 Docker Health-Checks für alle Container
   - 5.4 ZEO-Kunden Login-Credentials
   - 5.5 UI-Anpassungen Hauptsystem
   - 5.6 Ergebnis
6. Monitoring mit Uptime Kuma (neu in v0.6)
   - 6.1 Übersicht
   - 6.2 Installation
   - 6.3 Konfigurierte Monitore
   - 6.4 Status-Seite
   - 6.5 Zugang
7. Nächste Schritte
8. ZEO Kundenassistent – Entwicklung und Deployment (zeo-kunden.mopilot.website)
   - 8.1 Projektbeschreibung und Ziel
   - 8.2 Technische Architektur
   - 8.3 Entwicklungsprozess mit Claude Code
   - 8.4 Deployment-Ablauf
   - 8.5 Live-System und Ergebnis
9. Nächstes Sub-Projekt: hotline.mopilot.website
   - 9.1 Konzept und Zielgruppe
   - 9.2 Technische Anforderungen
   - 9.3 Entwicklungsschritte
   - 9.4 Deployment-Checkliste
   - 9.5 Zeitplan

---

## 1. Zusammenfassung

MoPilot ist ein KI-gestützter Mobilitätsassistent für E-Carsharing im ländlichen Raum. Der Prototyp v0.6 baut auf v0.5 auf und umfasst kritische Bugfixes (502 Bad Gateway), Sicherheitsupdates (Next.js CVEs), Docker Health-Checks für alle Container sowie die Einrichtung von Uptime Kuma als Self-Hosted-Monitoring.

### Projektkontext

E-Carsharing im ländlichen Raum steht vor besonderen Herausforderungen: geringe Bevölkerungsdichte, weite Entfernungen und heterogene Nutzergruppen. MoPilot adressiert diese Herausforderungen durch einen KI-Assistenten auf Basis von Anthropics Claude (Sonnet), der als zentrale Schnittstelle zwischen Nutzern, Betreibern und strategischen Partnern fungiert.

### Betreiber

- **ZEO Carsharing**: Region Bruchsal – primärer Betreiber
- **Car&RideSharing Community eG (cc)**: Genossenschaftliches Modell – Zweitbetreiber

### Zugangschutz

Alle MoPilot-Websites sind durch einen vorgelagerten Passwortschutz (Basic Auth via Next.js Middleware) gesichert. Die Demo-Zugangsdaten gelten für alle Sub-Projekte:

| Feld | Wert |
|------|------|
| Benutzer | `mopilot` |
| Passwort | `mopilot2027` |

| Geschützte URL | Zugangsstufe |
|----------------|-------------|
| https://mopilot.website | Basic Auth → rollenbasierter App-Login |
| https://zeo-kunden.mopilot.website | Basic Auth → direkte App-Nutzung |
| https://hotline.mopilot.website | Basic Auth (geplant, intern) |

### Rollensystem

Der Prototyp implementiert 10 verschiedene Nutzerrollen in 3 Kategorien. Jede Rolle erhält einen individuell angepassten KI-Kontext:

| Kategorie | Rolle | E-Mail | Beschreibung |
|-----------|-------|--------|--------------|
| Kundennah | Endkunde | endkunde@mopilot.website | Buchung, FAQs, Standorte |
| | Stationspate | stationspate@mopilot.website | Standortbetreuung, Meldungen |
| | Hotline | hotline@mopilot.website | Gesprächsleitfaden, Kundenhilfe |
| Betrieb | Betreiber | betreiber@mopilot.website | Dashboard, Kennzahlen, Strategie |
| | Flottenmanagement | flotte@mopilot.website | Fahrzeuge, Wartung, Zuweisung |
| | Fahrzeugbetreuer | fahrzeug@mopilot.website | Zustandsprüfung, Laden |
| | Plattform-Support | support@mopilot.website | Technik, Tickets, Systeme |
| Strategie | Projektträger | traeger@mopilot.website | KPIs, Förderung, Strategie |
| | Fahrzeugsteller | steller@mopilot.website | Fahrzeugintegration, Verträge |
| | Validierungsstelle | validierung@mopilot.website | Führerscheinprüfung, Dokumente |

### Funktionsumfang v0.6

**Neu in v0.6 (Bugfixes, Sicherheit & Monitoring)**
- 502 Bad Gateway behoben – Next.js Standalone HOSTNAME-Binding korrigiert
- Next.js Sicherheitsupdate 14.1.0 → 14.2.35 (CVE-2025-55184, CVE-2025-55183)
- Docker Health-Checks für alle 6 Container (Frontend, Backend, Postgres, Redis)
- ZEO-Kunden Login-Credentials an Dokumentation angeglichen
- Header-Logos für mopilot.website (MoPilot-Logo + BMEL-Förderlogo)
- Demo-Hinweis-Text aktualisiert (Vianova eG Referenz)
- Uptime Kuma Monitoring installiert und konfiguriert

**In v0.5 (Infrastruktur-Stabilisierung)**
- 4 GB Swap-Speicher auf Server eingerichtet – schützt vor OOM-Kills
- Docker `restart: unless-stopped` für alle Container gesetzt
- Next.js Error Boundary gegen Deployment-Versionskonflikt-Crashes
- ZEO-Kunden vollständig in CI/CD-Pipeline integriert
- Alter Container-Müll bereinigt, Serverstruktur aufgeräumt

**mopilot.website (Hauptsystem)**
- Rollenbasierter Login mit 12 Demo-Accounts (10 ZEO + 2 CC)
- KI-Chat mit Claude Sonnet – rollenspezifische Tonalität und Wissen
- REST-API mit JWT-Authentifizierung (8h Token-Gültigkeit)
- Wissensbasis mit FAQs pro Betreiber und Rolle
- Standort-, Fahrzeug- und Tarifverwaltung
- Swagger UI für API-Dokumentation
- Vollständige CI/CD-Pipeline mit GitHub Actions
- Header mit MoPilot-Logo und BMEL-Förderlogo

**zeo-kunden.mopilot.website (ZEO Kundenassistent)**
- KI-Chat mit SSE-Streaming (wortweise Ausgabe)
- Kostenrechner, ÖPNV-Karte, Reichweiten-Guide, Fahrzeugkatalog, Onboarding
- Basic Auth Passwortschutz
- Ab v0.5: automatisches Deployment via CI/CD
- Ab v0.6: Docker Health-Checks, HOSTNAME-Fix

---

## 2. IT-Umfeld

### 2.1 Genutzte Werkzeuge und Technologien

| Bereich | Technologie | Details |
|---------|-------------|---------|
| Frontend | Next.js 14.2.35 | React-basiert, App Router, SSR, Node 20 Alpine |
| | Tailwind CSS | Utility-First CSS Framework |
| | Leaflet.js | Interaktive Karte (OpenStreetMap) für ZEO-Stationen |
| Backend | FastAPI | Python 3.11, async, Uvicorn |
| | Anthropic SDK | Python-Bibliothek für Claude API-Kommunikation |
| | SQLAlchemy 2.0 | Async ORM mit asyncpg Driver |
| | Pydantic v2 | Datenvalidierung und Settings-Management |
| KI-Modell | Claude Sonnet | `claude-sonnet-4-6` via Anthropic API |
| Datenbank | PostgreSQL 16 | Alpine-Image, persistentes Volume, Health-Check |
| Cache | Redis 7 | Alpine-Image, 256MB, LRU-Eviction |
| Auth | JWT (python-jose) | 8h Token, bcrypt Passwort-Hashing |
| Zugangschutz | Basic Auth | Next.js Middleware, gilt für alle Sub-Projekte |
| Containerisierung | Docker | Multi-Stage Builds, Docker Compose, Health-Checks |
| Reverse Proxy | Traefik | Via Coolify, SSL-Terminierung, Host-basiertes Routing |
| SSL/TLS | Let's Encrypt | Automatische Zertifikate via Traefik (certresolver) |
| Deployment | Coolify | Self-hosted PaaS, verwaltet Traefik + Container |
| CI/CD | GitHub Actions | Automatisches Deployment beider Systeme bei Push auf master |
| Versionskontrolle | Git + GitHub | Private Repository, Branch-basierter Workflow |
| DNS | IONOS | Domain-Verwaltung für mopilot.website (A-Records) |
| API-Dokumentation | Swagger UI | Auto-generiert durch FastAPI unter /docs |
| KI-Entwicklung | Claude Code | KI-gestütztes Pair Programming (lokal + remote, CLI) |
| Monitoring | Uptime Kuma | Self-hosted, Docker, Port 3001, Status-Seite |

### 2.2 Server-Infrastruktur

| Eigenschaft | Wert |
|-------------|------|
| Anbieter | Hetzner Cloud |
| Server-Typ | CX33 (Shared vCPU) |
| IPv4 | 142.132.232.211 |
| IPv6 | 2a01:4f8:c17:b65c::1 |
| Standort | Falkenstein (FSN1), Deutschland |
| Betriebssystem | Ubuntu (Docker CE) |
| SSH-Zugang | root@142.132.232.211 (Passwort-Auth) |
| Swap | 4 GB (seit v0.5, /swapfile, swappiness=10) |
| Frontend-Domain (Hauptsystem) | https://mopilot.website |
| Backend-Domain (Hauptsystem) | https://api.mopilot.website |
| API-Dokumentation | https://api.mopilot.website/docs |
| Frontend-Domain (ZEO Kunden) | https://zeo-kunden.mopilot.website |
| Backend-Domain (ZEO Kunden) | https://api.zeo-kunden.mopilot.website |
| Frontend-Domain (Hotline, geplant) | https://hotline.mopilot.website |
| Coolify-Dashboard | http://localhost:8000 (via SSH-Tunnel) |
| Uptime Kuma | http://localhost:3001 (via SSH-Tunnel) |
| GitHub-Repository | github.com/JamesMz05/mopilot (privat) |

### 2.3 Admin und Deployment

Das Deployment erfolgt über Coolify für das Hauptsystem und direkt via Docker Compose für den ZEO-Kunden-Stack.

**Docker Compose Services – Hauptsystem (Coolify-managed)**

| Container | Image/Build | Restart | Health-Check | Funktion |
|-----------|-------------|---------|--------------|----------|
| frontend-ns8wok04s4sgkcggwg48okcg | Next.js (Node 20 Alpine) | unless-stopped | wget http://127.0.0.1:3000/ | Web-Oberfläche, SSR, Basic Auth |
| backend-ns8wok04s4sgkcggwg48okcg | FastAPI (Python 3.11 Slim) | unless-stopped | python3 urllib /api/health | REST-API, KI-Chat |
| postgres-ns8wok04s4sgkcggwg48okcg | postgres:16-alpine | unless-stopped | pg_isready | Relationale Datenbank |
| redis-ns8wok04s4sgkcggwg48okcg | redis:7-alpine | unless-stopped | redis-cli ping | Cache, Session-Store |

**Docker Compose Services – ZEO-Kunden (direkt)**

| Container | Image/Build | Restart | Health-Check | Funktion |
|-----------|-------------|---------|--------------|----------|
| zeo-kunden-frontend-1 | Next.js (Node 20 Alpine) | unless-stopped | wget http://127.0.0.1:3000/ | Web-Oberfläche, SSE-Chat |
| zeo-kunden-backend-1 | FastAPI (Python 3.11 Slim) | unless-stopped | python3 urllib /api/health | REST-API, SSE-Streaming |

**Docker-Sonstiges**

| Container | Image | Restart | Funktion |
|-----------|-------|---------|----------|
| uptime-kuma | louislam/uptime-kuma:1 | unless-stopped | System-Monitoring, Status-Seite |

**Serverpfade**

| System | Pfad |
|--------|------|
| Hauptsystem (Git-Repo + Build-Quelle) | `/opt/mopilot/` |
| ZEO-Kunden (laufende Instanz) | `/opt/zeo-kunden/` |
| Coolify-Konfiguration | `/data/coolify/` |
| Coolify Hauptsystem Compose | `/data/coolify/services/ns8wok04s4sgkcggwg48okcg/docker-compose.yml` |
| Uptime Kuma Daten | Docker Volume `uptime-kuma-data` |

### 2.4 IT-Übersichtsgrafik

```
+============================================================+
|                    NUTZER (Browser)                        |
|   mopilot.website / zeo-kunden.mopilot.website             |
+==================+===============+=========================+
                   |               |
              HTTPS|          HTTPS|
                   v               v
+============================================================+
|              HETZNER CX33  (142.132.232.211)               |
|  +------------------------------------------------------+  |
|  |         COOLIFY / TRAEFIK (Reverse Proxy)            |  |
|  |         SSL/TLS Termination + Routing                |  |
|  +--------+---------------+---------------+------------+  |
|           |               |               |               |
|  +--------+----+  +-------+------+  +-----+----------+   |
|  | HAUPTSYSTEM |  | ZEO-KUNDEN   |  | COOLIFY MGMT   |   |
|  | Next.js:3000|  | Next.js:3000 |  |                |   |
|  | FastAPI:8000|  | FastAPI:8000 |  |                |   |
|  | Postgres    |  | (statisch)   |  |                |   |
|  | Redis       |  |              |  |                |   |
|  +-------------+  +--------------+  +----------------+   |
|                                                           |
|  +---------------------+  +----------------------------+  |
|  | UPTIME KUMA  :3001  |  | ANTHROPIC CLOUD API (ext.) |  |
|  | Monitoring + Status |  | Claude Sonnet – KI-Modell  |  |
|  +---------------------+  +----------------------------+  |
|                                                           |
|  SWAP: 4 GB  |  RAM: 7.6 GB  |  Disk: 38 GB             |
+============================================================+
```

### 2.5 IT-Detailgrafik

```
+--[ Browser ]---------------------------------------------+
|  Aufruf mopilot.website  -->  Basic Auth Prompt          |
|  User: mopilot / PW: ****  -->  Zugang gewährt           |
|  Klick auf Rolle          -->  POST /api/auth/login       |
|  JWT gespeichert          -->  POST /api/chat/send        |
+-----+----------------------------------------------------+
      |  HTTPS (JWT Bearer Token)
      v
+--[ Coolify Reverse Proxy / Traefik ]--------------------+
|  mopilot.website            -->  frontend:3000           |
|  api.mopilot.website        -->  backend:8000            |
|  zeo-kunden.mopilot.website -->  zeo-kunden-frontend:3000|
+-----+----------------------------------------------------+
      |
      v
+--[ Next.js Frontend :3000 ]------------------------------+
|  middleware.ts: Basic Auth                               |
|  app/error.tsx: Error Boundary (Deployment-Schutz)       |
|    -> Bei Versionskonflikt: automatischer Seiten-Reload  |
|  HOSTNAME=0.0.0.0 (Docker-Binding-Fix, seit v0.6)       |
+-----+----------------------------------------------------+
      |
      v
+--[ FastAPI Backend :8000 ]-------------------------------+
|  /api/auth/login  -->  JWT Token (8h)                    |
|  /api/chat/send   -->  Claude Sonnet (non-streaming)     |
|  /api/chat/stream -->  Claude Sonnet (SSE-Streaming)     |
|  /api/health      -->  Health-Check Endpoint             |
|  /api/knowledge/  /api/stations/  /api/vehicles/         |
+------+-----------------------+---------------------------+
       |                       |
       v                       v
+--[ PostgreSQL ]---+  +--[ Anthropic Cloud ]---+
|  Users            |  |  Claude Sonnet         |
|  ChatMessages     |  |  Rollenspez. Prompt    |
|  Stations         |  +------------------------+
|  Vehicles, Tariffs|
|  FAQs             |
+-------------------+
```

---

## 3. Deployment-Prozess (CI/CD)

### 3.1 Übersicht

Ab v0.5 deckt die CI/CD-Pipeline beide Systeme ab: Das Hauptsystem wird via Coolify rebuilt, der ZEO-Kunden-Stack wird direkt per `docker compose up --build` neu gebaut. Jeder Push auf `master` deployt automatisch beide Systeme.

### 3.2 Komponenten der Pipeline

| Komponente | Technologie | Aufgabe |
|------------|-------------|---------|
| Versionskontrolle | Git + GitHub | Quellcode beider Systeme in einem Repository |
| CI/CD-Runner | GitHub Actions | Automatisierte Pipeline bei Push auf master |
| Server-Zugriff | SSH (appleboy/ssh-action) | Code-Synchronisation + ZEO-Kunden Rebuild |
| Hauptsystem Rebuild | Coolify API | Container-Rebuild via Webhook |
| ZEO-Kunden Rebuild | docker compose | Direkter Rebuild auf dem Server |
| Code-Sync ZEO-Kunden | rsync | Synchronisiert `MoPilot_ZEO_Kunden/` → `/opt/zeo-kunden/` |

**GitHub Secrets**

| Secret | Zweck |
|--------|-------|
| SERVER_SSH_PASSWORD | SSH-Passwort für root@142.132.232.211 |
| GH_PAT | GitHub Personal Access Token (repo-Scope) |
| COOLIFY_TOKEN | API-Token für Coolify Rebuild |

### 3.3 Ablauf eines Deployments

1. **Lokale Entwicklung**: Code bearbeiten in `C:\Projekte\MoPilot`
2. **Git Commit & Push** auf master
3. **GitHub Actions startet** automatisch
4. **SSH auf Server**: `git reset --hard FETCH_HEAD` – beide Systeme aktuell
5. **rsync**: ZEO-Kunden Code von `/opt/mopilot/MoPilot_ZEO_Kunden/` → `/opt/zeo-kunden/`
6. **ZEO-Kunden Rebuild**: `docker compose up -d --build`
7. **Coolify Rebuild**: Hauptsystem-Container werden neu gebaut
8. **Live**: beide Systeme aktualisiert, typisch in unter 3 Minuten

### 3.4 GitHub Actions Workflow (v0.5)

```yaml
name: Deploy to Coolify

on:
  push:
    branches: [master]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Pull code + deploy ZEO-Kunden
        uses: appleboy/ssh-action@v1
        with:
          host: 142.132.232.211
          username: root
          password: ${{ secrets.SERVER_SSH_PASSWORD }}
          script: |
            cd /opt/mopilot
            git fetch https://${{ secrets.GH_PAT }}@github.com/JamesMz05/mopilot.git master
            git reset --hard FETCH_HEAD
            echo "Hauptsystem: $(git rev-parse --short HEAD)"
            rsync -a --delete /opt/mopilot/MoPilot_ZEO_Kunden/frontend/ /opt/zeo-kunden/frontend/
            rsync -a --delete /opt/mopilot/MoPilot_ZEO_Kunden/backend/ /opt/zeo-kunden/backend/
            echo "ZEO-Kunden Code synchronisiert"
            cd /opt/zeo-kunden
            docker compose up -d --build
            echo "ZEO-Kunden deployed"

      - name: Coolify Rebuild (Hauptsystem)
        run: |
          curl -s -X GET \
            -H "Authorization: Bearer ${{ secrets.COOLIFY_TOKEN }}" \
            "https://coolify.pydna.de/api/v1/deploy?uuid=ns8wok04s4sgkcggwg48okcg&force=true"
```

### 3.5 Deployment-Diagramm

```
+--[ Entwickler-PC ]-----+
|  C:\Projekte\MoPilot   |
|  Code bearbeiten       |
|  git commit + push     |
+----------+-------------+
           |
           | git push (HTTPS)
           v
+--[ GitHub ]---------------------------------------+
|  Repository: JamesMz05/mopilot (privat)           |
|  Branch: master                                   |
|                                                   |
|  +--[ GitHub Actions ]-------------------------+  |
|  |  Trigger: push auf master                  |  |
|  |                                            |  |
|  |  Step 1: SSH auf Server                    |  |
|  |    -> git reset --hard (beide Systeme)     |  |
|  |    -> rsync ZEO-Kunden Code                |  |
|  |    -> docker compose up --build (ZEO)      |  |
|  |                                            |  |
|  |  Step 2: Coolify API                       |  |
|  |    -> Hauptsystem Rebuild                  |  |
|  +--------------------------------------------+  |
+-------+--------------------+----------------------+
        |                    |
   SSH  |          HTTPS API |
        v                    v
+--[ Hetzner Server ]-----------------------------+
|  /opt/mopilot/      <-- Hauptsystem (Git-Repo)  |
|  /opt/zeo-kunden/   <-- ZEO-Kunden (rsync)      |
|                                                 |
|  Coolify: Hauptsystem rebuild                   |
|  Docker Compose: ZEO-Kunden rebuild             |
+-------------------------------------------------+
```

---

## 4. Infrastruktur-Stabilisierung (v0.5)

### 4.1 Analysierte Probleme

Am 4. März 2026 wurde eine vollständige Systemanalyse per SSH-Direktzugriff auf den Server durchgeführt. Dabei wurden folgende Probleme identifiziert:

| # | Problem | Schwere | Auswirkung |
|---|---------|---------|------------|
| 1 | Kein `restart: unless-stopped` bei ZEO-Kunden | Kritisch | Container nach Crash dauerhaft tot |
| 2 | Kein Swap-Speicher | Kritisch | OOM-Kill bei Speicherdruck ohne Wiederherstellung |
| 3 | Alter Container-Müll (2x Exited) | Gering | Unordnung, Verwirrung |
| 4 | ZEO-Kunden nicht in CI/CD | Mittel | Manuelle Deployments fehleranfällig |
| 5 | Kein Next.js Error Boundary | Mittel | Deployment-Versionskonflikt-Crashes für aktive Nutzer |
| 6 | Viele nicht versionierte Dateien im Git | Mittel | Dateiverlust bei nächstem Deploy möglich |

**Ursache der gemeldeten Website-Abstürze:**

Der Hauptgrund für die Abstürze war ein Next.js-spezifisches Problem: Bei jedem automatischen Rebuild (CI/CD-Push) werden Server Action-IDs neu generiert. Nutzer, die die Seite vor dem Rebuild geöffnet hatten, erhielten bei der nächsten Aktion den Fehler:

```
Error: Failed to find Server Action "null"
Invariant: Missing 'next-action' header
This request might be from an older or newer deployment
```

Da kein Error Boundary existierte, führte dies zu einem vollständigen Seiten-Crash ohne Wiederherstellung.

### 4.2 Durchgeführte Maßnahmen

**Swap-Speicher eingerichtet**

```bash
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
echo 'vm.swappiness=10' >> /etc/sysctl.conf
```

Ergebnis: 4 GB Swap permanent aktiv, swappiness=10 (nur bei Bedarf genutzt).

**Restart-Policy gesetzt**

`restart: unless-stopped` in `/opt/zeo-kunden/docker-compose.yml` für beide Services eingetragen. Container neu gestartet.

**Alter Container-Müll bereinigt**

```bash
docker rm mopilot_zeo_kunden-frontend-1 mopilot_zeo_kunden-backend-1
```

**Next.js Error Boundary erstellt**

`frontend/app/error.tsx` und `frontend/app/global-error.tsx` erstellt. Bei Deployment-Versionskonflikt wird automatisch ein Seiten-Reload ausgelöst statt eines Absturzes.

**CI/CD um ZEO-Kunden erweitert**

`.github/workflows/deploy.yml` aktualisiert: rsync synchronisiert ZEO-Kunden Code nach `/opt/zeo-kunden/`, danach `docker compose up -d --build`.

**Nicht versionierte Dateien in Git aufgenommen**

19 Dateien committed und gepusht: Middleware, Login-Seiten, API-Routen, Logos, Nginx-Konfiguration, Error Boundary.

### 4.3 Ergebnis

Alle Maßnahmen erfolgreich umgesetzt. Container laufen stabil mit Restart-Policy. Swap schützt vor OOM-Kills. Detaillierter Container-Status siehe Kapitel 5.6.

---

## 5. Bugfixes und Sicherheitsupdates (neu in v0.6)

Am 5. März 2026 wurden mehrere kritische Probleme identifiziert und behoben.

### 5.1 502 Bad Gateway – ZEO-Kunden Frontend

**Problem**: `zeo-kunden.mopilot.website` lieferte 502 Bad Gateway, während das Backend (`api.zeo-kunden.mopilot.website`) und das Hauptsystem normal funktionierten.

**Ursache (Root Cause)**: Next.js Standalone-Modus (`server.js`) verwendet `process.env.HOSTNAME || '0.0.0.0'` als Bind-Adresse. Docker setzt automatisch die Umgebungsvariable `HOSTNAME` auf die Container-ID (z.B. `10.0.2.3`). Dadurch lauschte der Next.js-Server nur auf der internen Container-IP statt auf `0.0.0.0` – Traefik konnte den Container nicht erreichen.

**Container-Log vor dem Fix:**
```
Network: http://10.0.2.3:3000   ← falsch, sollte 0.0.0.0 sein
```

**Fix (zwei Ebenen):**

1. **docker-compose.yml** – Umgebungsvariable explizit setzen:
```yaml
services:
  frontend:
    environment:
      - HOSTNAME=0.0.0.0
```

2. **Dockerfile** – Als zusätzliche Absicherung im Image:
```dockerfile
FROM node:20-alpine AS runner
ENV HOSTNAME="0.0.0.0"
```

**Container-Log nach dem Fix:**
```
Network: http://0.0.0.0:3000    ← korrekt
```

**Betroffene Dateien:**
- `/opt/zeo-kunden/docker-compose.yml` (deployed)
- `/opt/mopilot/MoPilot_ZEO_Kunden/docker-compose.yml` (Git-Repo)
- `/opt/mopilot/MoPilot_ZEO_Kunden/frontend/Dockerfile` (Git-Repo)

### 5.2 Next.js Sicherheitsupdate (14.1.0 → 14.2.35)

Beide Frontends (Hauptsystem + ZEO-Kunden) wurden von Next.js 14.1.0 auf 14.2.35 aktualisiert.

**Behobene Schwachstellen:**

| CVE | Schwere | Beschreibung |
|-----|---------|--------------|
| CVE-2025-55184 | Hoch | Denial of Service – Angreifer kann Server durch speziell geformte Anfragen zum Absturz bringen |
| CVE-2025-55183 | Mittel | Source Code Leak – Quellcode kann unter bestimmten Bedingungen offengelegt werden |

**Betroffene Dateien:**
- `/opt/mopilot/frontend/package.json` (Hauptsystem)
- `/opt/mopilot/MoPilot_ZEO_Kunden/frontend/package.json` (ZEO-Kunden)

### 5.3 Docker Health-Checks für alle Container

Vor v0.6 hatte nur PostgreSQL einen Health-Check (`pg_isready`). In Coolify wurden alle anderen Container als „running unhealthy" angezeigt. Health-Checks wurden für alle 6 Container konfiguriert:

**Hauptsystem (Coolify-managed):**

| Container | Health-Check | Interval |
|-----------|-------------|----------|
| Frontend | `wget --spider http://127.0.0.1:3000/` | 10s |
| Backend | `python3 -c 'import urllib.request; urllib.request.urlopen("http://127.0.0.1:8000/api/health")'` | 10s |
| Redis | `redis-cli ping` | 10s |
| PostgreSQL | `pg_isready` (bereits vorhanden) | 10s |

**ZEO-Kunden (Docker Compose):**

| Container | Health-Check | Interval |
|-----------|-------------|----------|
| Frontend | `wget --spider http://127.0.0.1:3000/` | 10s |
| Backend | `python3 -c 'import urllib.request; urllib.request.urlopen("http://127.0.0.1:8000/api/health")'` | 10s |

**Hinweis**: Health-Checks verwenden `127.0.0.1` statt `localhost`, da Alpine-basierte Container `localhost` als IPv6 (`::1`) auflösen können, Next.js aber nur auf IPv4 lauscht.

**Betroffene Dateien:**
- `/data/coolify/services/ns8wok04s4sgkcggwg48okcg/docker-compose.yml` (Hauptsystem)
- `/opt/zeo-kunden/docker-compose.yml` (ZEO-Kunden)
- `/opt/mopilot/MoPilot_ZEO_Kunden/docker-compose.yml` (Git-Repo)

### 5.4 ZEO-Kunden Login-Credentials

Die Login-Credentials in der ZEO-Kunden-App stimmten nicht mit der Dokumentation überein.

| | Alt (im Code) | Neu (korrigiert) |
|--|---------------|------------------|
| Benutzer | `mopilot` | `mopilot` |
| Passwort | `mopilot2016` | `mopilot2027` |

**Betroffene Datei:**
- `/opt/mopilot/MoPilot_ZEO_Kunden/frontend/src/app/api/auth/login/route.ts`

### 5.5 UI-Anpassungen Hauptsystem

**Header-Logos:**
- „MoPilot"-Text durch Logo-Bild ersetzt (`/public/mopilot-logo-2.png`)
- BMEL-Förderlogo rechts im Header hinzugefügt (`/public/foerderlogo-bmleh.png`)

**Demo-Hinweis aktualisiert:**
- Alter Text: „Alle Accounts verwenden das Passwort mopilot2026..."
- Neuer Text: „Noch keine Account- und Rollenverwaltung. PW bei Vianova eG erfragen. Server: Hetzner CX33 · Domain: mopilot.website. Deployment über Coolify für das Hauptsystem und direkt via Docker Compose."
- Link zur Monitoring-Statusseite hinzugefügt

**Betroffene Dateien:**
- `/opt/mopilot/frontend/app/page.tsx`
- `/opt/mopilot/frontend/public/mopilot-logo-2.png` (neu)
- `/opt/mopilot/frontend/public/foerderlogo-bmleh.png` (neu)

### 5.6 Ergebnis

```
Container Status nach v0.6:
frontend-ns8wok04s4sgkcggwg48okcg   Up  restart: unless-stopped  ✓  (healthy)
backend-ns8wok04s4sgkcggwg48okcg    Up  restart: unless-stopped  ✓  (healthy)
postgres-ns8wok04s4sgkcggwg48okcg   Up  restart: unless-stopped  ✓  (healthy)
redis-ns8wok04s4sgkcggwg48okcg      Up  restart: unless-stopped  ✓  (healthy)
zeo-kunden-frontend-1               Up  restart: unless-stopped  ✓  (healthy)
zeo-kunden-backend-1                Up  restart: unless-stopped  ✓  (healthy)
uptime-kuma                         Up  restart: unless-stopped  ✓

Swap:  4.0 GB aktiv
Alle Endpunkte erreichbar: ✓
```

---

## 6. Monitoring mit Uptime Kuma (neu in v0.6)

### 6.1 Übersicht

Uptime Kuma ist ein Self-Hosted-Monitoring-Tool, das alle MoPilot-Endpunkte überwacht und bei Ausfällen alarmiert. Es läuft als Docker-Container auf dem gleichen Server.

### 6.2 Installation

```bash
docker run -d \
  --name uptime-kuma \
  --restart unless-stopped \
  --network coolify \
  -p 3001:3001 \
  -v uptime-kuma-data:/app/data \
  louislam/uptime-kuma:1
```

- **Container**: `uptime-kuma`
- **Port**: 3001 (nur lokal erreichbar, kein öffentlicher Zugang)
- **Netzwerk**: `coolify` (damit interne Container-URLs erreichbar sind)
- **Persistenz**: Docker Volume `uptime-kuma-data`

### 6.3 Konfigurierte Monitore

| # | Monitor | Typ | URL / Ziel | Intervall |
|---|---------|-----|------------|-----------|
| 1 | MoPilot API | HTTP(S) | https://api.mopilot.website/api/health | 60s |
| 2 | ZEO-Kunden API | HTTP(S) | https://api.zeo-kunden.mopilot.website/api/health | 60s |
| 3 | MoPilot Frontend | HTTP(S) | https://mopilot.website | 60s |
| 4 | ZEO-Kunden Frontend | HTTP(S) | https://zeo-kunden.mopilot.website | 60s |
| 5 | Server Ping | Ping | 142.132.232.211 | 60s |

**Hinweis**: Die Frontend-Monitore erhalten HTTP 401 (Basic Auth), was als „Up" gewertet wird (Server antwortet). Alternativ können akzeptierte Status-Codes in Uptime Kuma auf 200-401 konfiguriert werden.

### 6.4 Status-Seite

Eine öffentliche Status-Seite ist unter dem Slug `/status/mopilot` konfiguriert. Diese zeigt den aktuellen Status aller 5 Monitore an.

### 6.5 Zugang

Uptime Kuma ist nicht öffentlich erreichbar und nur über SSH-Tunnel zugänglich:

```bash
ssh -L 3001:localhost:3001 root@142.132.232.211
```

Danach im Browser: `http://localhost:3001`

**Geplante Erweiterungen:**
- E-Mail- oder Telegram-Alerting bei Ausfällen konfigurieren
- Uptime Kuma optional über Traefik öffentlich erreichbar machen (z.B. `status.mopilot.website`)

---

## 7. Nächste Schritte

### Schritt 2: SSE-Streaming im Hauptsystem-Chat aktivieren
**Priorität: Hoch | Aufwand: 1 Tag | Status: Offen**

Das Backend hat bereits einen `/api/chat/stream` Endpoint (SSE), aber das Frontend nutzt aktuell nur den synchronen `/api/chat/send` Endpoint. Durch SSE-Streaming erscheinen KI-Antworten wortweise – deutlich bessere UX.

- Frontend Dashboard um EventSource/fetch-Stream-Handling erweitern
- Typing-Indicator und wortweises Rendering implementieren
- Fehlerbehandlung für abgebrochene Streams einbauen
- Fallback auf synchronen Endpoint bei Stream-Fehler

### Schritt 3: hotline.mopilot.website entwickeln
**Priorität: Hoch | Aufwand: 3–4 Tage | Status: Bereit**

Internes Tool für ZEO Carsharing Hotline-Mitarbeiter (Vianova eG). Architektur und Deployment-Prozess sind vollständig geplant (siehe Kapitel 9).

### Schritt 4: Rollenspezifische System-Prompts verfeinern
**Priorität: Mittel | Aufwand: 2–3 Tage | Status: Offen**

- Workshops mit ZEO-Betreibern für rollenspezifische Anforderungen
- System-Prompts mit echten Tarifen, Standorten und Prozessen füllen
- Prompt-Evaluation mit realistischen Nutzeranfragen

### Schritt 5: Monitoring-Alerting konfigurieren
**Priorität: Mittel | Aufwand: 0,5 Tage | Status: Offen**

- Uptime Kuma Alerting einrichten (E-Mail, Telegram oder Webhook)
- Optional: Status-Seite öffentlich über `status.mopilot.website` erreichbar machen
- Alerting-Regeln definieren (Schwellenwerte, Eskalation)

### Schritt 6: SSH-Key-Auth einrichten
**Priorität: Niedrig | Aufwand: 0,5 Tage | Status: Offen**

SSH-Passwort-Authentifizierung auf dem Server durch Key-basierte Authentifizierung ersetzen. Passwort-Auth danach deaktivieren.

### Zeitplan-Übersicht

| Schritt | Aufwand | Priorität | Status |
|---------|---------|-----------|--------|
| 1. Git + CI/CD | 1–2 Tage | Hoch | Erledigt (v0.4) |
| 1b. Infrastruktur-Stabilisierung | 1 Tag | Kritisch | Erledigt (v0.5) |
| 1c. Bugfixes, Sicherheit & Monitoring | 1 Tag | Kritisch | Erledigt (v0.6) |
| 2. SSE-Streaming (Hauptsystem) | 1 Tag | Hoch | Offen |
| 3. hotline.mopilot.website | 3–4 Tage | Hoch | Bereit |
| 4. System-Prompts | 2–3 Tage | Mittel | Offen |
| 5. Monitoring-Alerting | 0,5 Tage | Mittel | Offen |
| 6. SSH-Keys | 0,5 Tage | Niedrig | Offen |

**Verbleibender Aufwand: 7–9 Arbeitstage**

---

## 8. ZEO Kundenassistent – Entwicklung und Deployment

### 8.1 Projektbeschreibung und Ziel

Der ZEO Kundenassistent richtet sich ausschließlich an Endkunden von ZEO Carsharing. Er beantwortet alle ZEO-relevanten Fragen via KI-Chat (SSE-Streaming) und bietet fünf interaktive Module:

- **KI-Chat (Hero-Element)**: SSE-Streaming-Assistent mit ZEO-Systemkontext
- **Modul 1 – Kostenrechner**: Optimaler Tarif (eco vs. eco plus)
- **Modul 2 – ÖPNV-Karte**: Leaflet/OpenStreetMap mit 12 ZEO-Stationen
- **Modul 3 – Reichweiten-Guide**: Temperaturabhängige Reichweite für 9 Fahrzeugmodelle
- **Modul 4 – Fahrzeugkatalog**: Filterbare Kacheln mit Specs
- **Modul 5 – Onboarding**: 6-Schritt-Guide und FAQ-Akkordeon

### 8.2 Technische Architektur

```
+============================================================+
|               NUTZER (Browser)                             |
|   https://zeo-kunden.mopilot.website                       |
+==========================+=================================+
                           |  HTTPS
                           v
+============================================================+
|         HETZNER CX33  (142.132.232.211)                    |
|                                                            |
|  +------------------------------------------------------+  |
|  |  COOLIFY-PROXY (Traefik) – Port 80/443               |  |
|  +-------------+----------------------------+-----------+  |
|                |                            |               |
|  +-------------+----------+  +--------------+-----------+   |
|  |  FRONTEND  :3000        |  |  BACKEND  :8000          |  |
|  |  Next.js 14.2.35        |  |  FastAPI (Python 3.11)   |  |
|  |  Basic Auth Middleware  |  |  SSE-Streaming           |  |
|  |  HOSTNAME=0.0.0.0      |  |  /api/health Endpoint    |  |
|  |  restart: unless-stopped|  |  restart: unless-stopped |  |
|  |  healthcheck: wget     |  |  healthcheck: urllib     |  |
|  +------------------------+  +--------------------------+   |
|                                                            |
|  +------------------------------------------------------+  |
|  |  ANTHROPIC CLOUD API (extern)                        |  |
|  |  Claude claude-sonnet-4-6                            |  |
|  +------------------------------------------------------+  |
+============================================================+
```

| Komponente | Technologie | Details |
|------------|-------------|---------|
| Frontend | Next.js 14.2.35, TailwindCSS | Basic Auth Middleware, Error Boundary, HOSTNAME=0.0.0.0 |
| Backend | FastAPI (Python 3.11) | SSE-Streaming nativ, /api/health Endpoint |
| KI-Modell | Claude claude-sonnet-4-6 | Anthropic API |
| Datenhaltung | Statische JSON-Dateien | vehicles, tariffs, stations, faq |
| Reverse Proxy | Traefik (via Coolify) | SSL, Routing |
| Deployment | Docker Compose | restart: unless-stopped, Health-Checks, ab v0.5 via CI/CD |

### 8.3 Entwicklungsprozess

Die Applikation wurde in einer einzigen Session mit Claude Code entwickelt (35 Dateien, 2.736 Codezeilen). Datenbasis aus vier PDF-Dateien extrahiert:

- `vehicles.json`: 9 Fahrzeugmodelle mit Specs
- `tariffs.json`: eco und eco plus Tarife
- `stations.json`: 12 Musterstationen mit Koordinaten
- `faq.json`: 18 häufige Fragen in 3 Kategorien

### 8.4 Deployment-Ablauf

Ab v0.5 automatisch via CI/CD:

```
git push master
  → rsync MoPilot_ZEO_Kunden/ → /opt/zeo-kunden/
  → docker compose up -d --build
  → Live unter zeo-kunden.mopilot.website
```

### 8.5 Live-System

| Ort | Pfad / URL |
|-----|------------|
| Lokal | C:\Projekte\MoPilot\MoPilot_ZEO_Kunden\ |
| GitHub | github.com/JamesMz05/mopilot (master) |
| Server | /opt/zeo-kunden/ |
| Frontend | https://zeo-kunden.mopilot.website |
| Backend | https://api.zeo-kunden.mopilot.website/api/health |

---

## 9. Nächstes Sub-Projekt: hotline.mopilot.website

### 9.1 Konzept und Zielgruppe

hotline.mopilot.website ist ein internes Arbeitsmittel für Hotline-Mitarbeiter der ZEO Carsharing Hotline (Vianova eG):

- **Zielgruppe**: Hotline-Mitarbeiter (kein öffentlicher Zugang)
- **Kernfunktion**: KI-Assistent bei eingehenden Anrufen in Echtzeit
- **Wissensquelle**: Vollständige ZEO-Wissensbasis
- **Zusatzfunktionen**: Gesprächsleitfaden, Eskalationspfade, Problemszenarien

### 9.2 Technische Anforderungen

| Anforderung | Beschreibung | Priorität |
|-------------|--------------|-----------|
| Zugangsschutz | Basic Auth (intern) | Hoch |
| Schnelle Antworten | < 3 Sekunden, SSE-Streaming | Hoch |
| Gesprächs-Kontext | Session-Gedächtnis | Hoch |
| Geräteoptimierung | Desktop-Browser (Headset) | Mittel |
| Datenaktualität | JSON-Dateien im Git pflegbar | Mittel |

### 9.3 Entwicklungsschritte

**Schritt 1: Inhaltsvorbereitung (0,5 Tage)**
- ZEO-Wissensbasis zusammenstellen
- Hotline-System-Prompt entwickeln
- Gesprächs-Szenarien definieren

**Schritt 2: Projektstruktur (0,5 Tage)**
```
C:\Projekte\MoPilot\MoPilot_Hotline\
  frontend/    # Next.js 14 (aus ZEO-App kopieren)
  backend/     # FastAPI (System-Prompt anpassen)
  docker-compose.yml
```

**Schritt 3: Frontend (1–2 Tage)**
- Zweispaltiges Layout: Links Chat, rechts Schnellreferenz
- Schnellzugriff-Buttons für häufigste Anrufgründe
- Gesprächs-Protokoll mit Export
- Dunkel-Modus für Headset-Arbeitsplatz

**Schritt 4: Backend (0,5 Tage)**
- System-Prompt auf Hotline-Rolle anpassen
- CORS auf hotline.mopilot.website beschränken
- Session-ID für Gesprächsgedächtnis

**Schritt 5: Deployment (0,5 Tage)**
```bash
# DNS bei IONOS
hotline.mopilot.website     A  142.132.232.211
api.hotline.mopilot.website A  142.132.232.211

# Traefik-Labels + docker compose up -d --build
# CI/CD: rsync MoPilot_Hotline/ → /opt/hotline/ (wie ZEO-Kunden)
```

### 9.4 Deployment-Checkliste

- [ ] Inhalt: ZEO-Wissensbasis vollständig
- [ ] Inhalt: System-Prompt mit Hotline-Team getestet
- [ ] Technik: DNS-Einträge gesetzt
- [ ] Technik: Traefik-Labels korrekt
- [ ] Technik: ANTHROPIC_API_KEY in .env (separater Key)
- [ ] Technik: `restart: unless-stopped` in docker-compose.yml
- [ ] Technik: HOSTNAME=0.0.0.0 in docker-compose.yml und Dockerfile
- [ ] Technik: Health-Checks für Frontend und Backend
- [ ] Technik: CORS auf hotline.mopilot.website beschränkt
- [ ] Technik: CI/CD Workflow um Hotline erweitert
- [ ] Technik: Uptime Kuma Monitore hinzufügen
- [ ] Test: Chat mit Beispiel-Anrufszenarien
- [ ] Test: SSL-Zertifikat aktiv
- [ ] Test: `/api/health` positiv
- [ ] Abnahme: Demo mit Hotline-Team

### 9.5 Zeitplan

| Phase | Aufwand | Voraussetzung |
|-------|---------|---------------|
| Inhaltsvorbereitung & Prompt | 0,5 Tage | Abstimmung mit Hotline-Team |
| Projektstruktur & Code | 0,5 Tage | ZEO-Kunden-App als Vorlage |
| Frontend-Entwicklung | 1–2 Tage | UX-Anforderungen bekannt |
| Backend-Anpassung | 0,5 Tage | System-Prompt fertig |
| Deployment & Test | 0,5 Tage | DNS & Server-Zugang |
| **GESAMT** | **3–4 Tage** | |

---

*Erstellt mit Claude Code | v0.6 – 5. März 2026*
*Änderungen gegenüber v0.5: 502-Bugfix HOSTNAME-Binding (Kap. 5.1), Next.js Sicherheitsupdate (Kap. 5.2), Docker Health-Checks (Kap. 5.3), Login-Credentials (Kap. 5.4), UI-Anpassungen (Kap. 5.5), Uptime Kuma Monitoring (Kap. 6), aktualisierte Technologie-Tabelle, aktualisierte Nächste Schritte*
