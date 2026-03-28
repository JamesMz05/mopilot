# MoPilot
**KI-gestützter Mobilitätsassistent für E-Carsharing im ländlichen Raum**
**Prototyp v0.5**

Betreiber: ZEO Carsharing (Region Bruchsal) | Car&RideSharing Community eG (cc)
Datum: 4. März 2026

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
4. Infrastruktur-Stabilisierung (neu in v0.5)
   - 4.1 Analysierte Probleme
   - 4.2 Durchgeführte Maßnahmen
   - 4.3 Ergebnis
5. Nächste Schritte
6. ZEO Kundenassistent – Entwicklung und Deployment (zeo-kunden.mopilot.website)
   - 6.1 Projektbeschreibung und Ziel
   - 6.2 Technische Architektur
   - 6.3 Entwicklungsprozess mit Claude Code
   - 6.4 Deployment-Ablauf
   - 6.5 Live-System und Ergebnis
7. Nächstes Sub-Projekt: hotline.mopilot.website
   - 7.1 Konzept und Zielgruppe
   - 7.2 Technische Anforderungen
   - 7.3 Entwicklungsschritte
   - 7.4 Deployment-Checkliste
   - 7.5 Zeitplan

---

## 1. Zusammenfassung

MoPilot ist ein KI-gestützter Mobilitätsassistent für E-Carsharing im ländlichen Raum. Der Prototyp v0.5 baut auf v0.4 auf und ergänzt eine vollständige Infrastruktur-Stabilisierung sowie eine einheitliche CI/CD-Pipeline für alle Sub-Projekte.

### Projektkontext

E-Carsharing im ländlichen Raum steht vor besonderen Herausforderungen: geringe Bevölkerungsdichte, weite Entfernungen und heterogene Nutzergruppen. MoPilot adressiert diese Herausforderungen durch einen KI-Assistenten auf Basis von Anthropics Claude (Sonnet), der als zentrale Schnittstelle zwischen Nutzern, Betreibern und strategischen Partnern fungiert.

### Betreiber

- **ZEO Carsharing**: Region Bruchsal – primärer Betreiber
- **Car&RideSharing Community eG (cc)**: Genossenschaftliches Modell – Zweitbetreiber

### Zugangschutz

Alle MoPilot-Websites sind durch einen vorgelagerten Passwortschutz (Basic Auth via Next.js Middleware) gesichert. Die Demo-Zugangsdaten gelten für alle Sub-Projekte:

| Feld | Wert |
|------|------|
| Benutzer | `MoPilot` |
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

### Funktionsumfang v0.5

**Neu in v0.5 (Infrastruktur-Stabilisierung)**
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

**zeo-kunden.mopilot.website (ZEO Kundenassistent)**
- KI-Chat mit SSE-Streaming (wortweise Ausgabe)
- Kostenrechner, ÖPNV-Karte, Reichweiten-Guide, Fahrzeugkatalog, Onboarding
- Basic Auth Passwortschutz
- Ab v0.5: automatisches Deployment via CI/CD

---

## 2. IT-Umfeld

### 2.1 Genutzte Werkzeuge und Technologien

| Bereich | Technologie | Details |
|---------|-------------|---------|
| Frontend | Next.js 14 | React-basiert, App Router, SSR, Node 20 Alpine |
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
| Containerisierung | Docker | Multi-Stage Builds, Docker Compose |
| Reverse Proxy | Traefik | Via Coolify, SSL-Terminierung, Host-basiertes Routing |
| SSL/TLS | Let's Encrypt | Automatische Zertifikate via Traefik (certresolver) |
| Deployment | Coolify | Self-hosted PaaS, verwaltet Traefik + Container |
| CI/CD | GitHub Actions | Automatisches Deployment beider Systeme bei Push auf master |
| Versionskontrolle | Git + GitHub | Private Repository, Branch-basierter Workflow |
| DNS | IONOS | Domain-Verwaltung für mopilot.website (A-Records) |
| API-Dokumentation | Swagger UI | Auto-generiert durch FastAPI unter /docs |
| KI-Entwicklung | Claude Code | KI-gestütztes Pair Programming (lokal + remote, CLI) |

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
| Swap | 4 GB (neu in v0.5, /swapfile, swappiness=10) |
| Frontend-Domain (Hauptsystem) | https://mopilot.website |
| Backend-Domain (Hauptsystem) | https://api.mopilot.website |
| API-Dokumentation | https://api.mopilot.website/docs |
| Frontend-Domain (ZEO Kunden) | https://zeo-kunden.mopilot.website |
| Backend-Domain (ZEO Kunden) | https://api.zeo-kunden.mopilot.website |
| Frontend-Domain (Hotline, geplant) | https://hotline.mopilot.website |
| Coolify-Dashboard | http://localhost:8000 (via SSH-Tunnel) |
| GitHub-Repository | github.com/JamesMz05/mopilot (privat) |

### 2.3 Admin und Deployment

Das Deployment erfolgt über Coolify für das Hauptsystem und direkt via Docker Compose für den ZEO-Kunden-Stack.

**Docker Compose Services – Hauptsystem (Coolify-managed)**

| Container | Image/Build | Restart | Funktion |
|-----------|-------------|---------|----------|
| frontend-ns8wok04s4sgkcggwg48okcg | Next.js (Node 20 Alpine) | unless-stopped | Web-Oberfläche, SSR, Basic Auth |
| backend-ns8wok04s4sgkcggwg48okcg | FastAPI (Python 3.11 Slim) | unless-stopped | REST-API, KI-Chat |
| postgres-ns8wok04s4sgkcggwg48okcg | postgres:16-alpine | unless-stopped | Relationale Datenbank |
| redis-ns8wok04s4sgkcggwg48okcg | redis:7-alpine | unless-stopped | Cache, Session-Store |

**Docker Compose Services – ZEO-Kunden (direkt)**

| Container | Image/Build | Restart | Funktion |
|-----------|-------------|---------|----------|
| zeo-kunden-frontend-1 | Next.js (Node 20 Alpine) | unless-stopped | Web-Oberfläche, SSE-Chat |
| zeo-kunden-backend-1 | FastAPI (Python 3.11 Slim) | unless-stopped | REST-API, SSE-Streaming |

**Serverpfade**

| System | Pfad |
|--------|------|
| Hauptsystem (Git-Repo + Build-Quelle) | `/opt/mopilot/` |
| ZEO-Kunden (laufende Instanz) | `/opt/zeo-kunden/` |
| Coolify-Konfiguration | `/data/coolify/` |

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
|  +------------------------------------------------------+  |
|  |         ANTHROPIC CLOUD API (extern)                 |  |
|  |         Claude Sonnet – KI-Modell                    |  |
|  +------------------------------------------------------+  |
|                                                           |
|  SWAP: 4 GB  |  RAM: 7.6 GB  |  Disk: 38 GB             |
+============================================================+
```

### 2.5 IT-Detailgrafik

```
+--[ Browser ]---------------------------------------------+
|  Aufruf mopilot.website  -->  Basic Auth Prompt          |
|  User: MoPilot / PW: ****  -->  Zugang gewährt           |
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
+-----+----------------------------------------------------+
      |
      v
+--[ FastAPI Backend :8000 ]-------------------------------+
|  /api/auth/login  -->  JWT Token (8h)                    |
|  /api/chat/send   -->  Claude Sonnet (non-streaming)     |
|  /api/chat/stream -->  Claude Sonnet (SSE-Streaming)     |
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

## 4. Infrastruktur-Stabilisierung (neu in v0.5)

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

```
Container Status nach Stabilisierung:
frontend-ns8wok04s4sgkcggwg48okcg   Up  restart: unless-stopped  ✓
backend-ns8wok04s4sgkcggwg48okcg    Up  restart: unless-stopped  ✓
postgres-ns8wok04s4sgkcggwg48okcg   Up  restart: unless-stopped  ✓  (healthy)
redis-ns8wok04s4sgkcggwg48okcg      Up  restart: unless-stopped  ✓
zeo-kunden-frontend-1               Up  restart: unless-stopped  ✓
zeo-kunden-backend-1                Up  restart: unless-stopped  ✓

Swap:  4.0 GB aktiv
Fehler im Frontend-Log: 0
```

---

## 5. Nächste Schritte

### Schritt 2: SSE-Streaming im Hauptsystem-Chat aktivieren
**Priorität: Hoch | Aufwand: 1 Tag | Status: Offen**

Das Backend hat bereits einen `/api/chat/stream` Endpoint (SSE), aber das Frontend nutzt aktuell nur den synchronen `/api/chat/send` Endpoint. Durch SSE-Streaming erscheinen KI-Antworten wortweise – deutlich bessere UX.

- Frontend Dashboard um EventSource/fetch-Stream-Handling erweitern
- Typing-Indicator und wortweises Rendering implementieren
- Fehlerbehandlung für abgebrochene Streams einbauen
- Fallback auf synchronen Endpoint bei Stream-Fehler

### Schritt 3: hotline.mopilot.website entwickeln
**Priorität: Hoch | Aufwand: 3–4 Tage | Status: Bereit**

Internes Tool für ZEO Carsharing Hotline-Mitarbeiter (Vianova eG). Architektur und Deployment-Prozess sind vollständig geplant (siehe Kapitel 7).

### Schritt 4: Rollenspezifische System-Prompts verfeinern
**Priorität: Mittel | Aufwand: 2–3 Tage | Status: Offen**

- Workshops mit ZEO-Betreibern für rollenspezifische Anforderungen
- System-Prompts mit echten Tarifen, Standorten und Prozessen füllen
- Prompt-Evaluation mit realistischen Nutzeranfragen

### Schritt 5: Monitoring einrichten
**Priorität: Mittel | Aufwand: 0,5 Tage | Status: Offen**

- Uptime Kuma auf dem Server installieren (self-hosted, Port 3001)
- Monitoring für alle 5 Endpunkte einrichten
- Alerting bei Ausfall (E-Mail oder Webhook)

### Schritt 6: SSH-Key-Auth einrichten
**Priorität: Niedrig | Aufwand: 0,5 Tage | Status: Offen**

SSH-Passwort-Authentifizierung auf dem Server durch Key-basierte Authentifizierung ersetzen. Passwort-Auth danach deaktivieren.

### Zeitplan-Übersicht

| Schritt | Aufwand | Priorität | Status |
|---------|---------|-----------|--------|
| 1. Git + CI/CD | 1–2 Tage | Hoch | Erledigt (v0.4) |
| 1b. Infrastruktur-Stabilisierung | 1 Tag | Kritisch | Erledigt (v0.5) |
| 2. SSE-Streaming (Hauptsystem) | 1 Tag | Hoch | Offen |
| 3. hotline.mopilot.website | 3–4 Tage | Hoch | Bereit |
| 4. System-Prompts | 2–3 Tage | Mittel | Offen |
| 5. Monitoring | 0,5 Tage | Mittel | Offen |
| 6. SSH-Keys | 0,5 Tage | Niedrig | Offen |

**Verbleibender Aufwand: 7–9 Arbeitstage**

---

## 6. ZEO Kundenassistent – Entwicklung und Deployment

### 6.1 Projektbeschreibung und Ziel

Der ZEO Kundenassistent richtet sich ausschließlich an Endkunden von ZEO Carsharing. Er beantwortet alle ZEO-relevanten Fragen via KI-Chat (SSE-Streaming) und bietet fünf interaktive Module:

- **KI-Chat (Hero-Element)**: SSE-Streaming-Assistent mit ZEO-Systemkontext
- **Modul 1 – Kostenrechner**: Optimaler Tarif (eco vs. eco plus)
- **Modul 2 – ÖPNV-Karte**: Leaflet/OpenStreetMap mit 12 ZEO-Stationen
- **Modul 3 – Reichweiten-Guide**: Temperaturabhängige Reichweite für 9 Fahrzeugmodelle
- **Modul 4 – Fahrzeugkatalog**: Filterbare Kacheln mit Specs
- **Modul 5 – Onboarding**: 6-Schritt-Guide und FAQ-Akkordeon

### 6.2 Technische Architektur

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
|  |  Next.js 14             |  |  FastAPI (Python 3.11)   |  |
|  |  Basic Auth Middleware  |  |  SSE-Streaming           |  |
|  |  restart: unless-stopped|  |  restart: unless-stopped |  |
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
| Frontend | Next.js 14, TailwindCSS | Basic Auth Middleware, Error Boundary |
| Backend | FastAPI (Python 3.11) | SSE-Streaming nativ |
| KI-Modell | Claude claude-sonnet-4-6 | Anthropic API |
| Datenhaltung | Statische JSON-Dateien | vehicles, tariffs, stations, faq |
| Reverse Proxy | Traefik (via Coolify) | SSL, Routing |
| Deployment | Docker Compose | restart: unless-stopped, ab v0.5 via CI/CD |

### 6.3 Entwicklungsprozess

Die Applikation wurde in einer einzigen Session mit Claude Code entwickelt (35 Dateien, 2.736 Codezeilen). Datenbasis aus vier PDF-Dateien extrahiert:

- `vehicles.json`: 9 Fahrzeugmodelle mit Specs
- `tariffs.json`: eco und eco plus Tarife
- `stations.json`: 12 Musterstationen mit Koordinaten
- `faq.json`: 18 häufige Fragen in 3 Kategorien

### 6.4 Deployment-Ablauf

Ab v0.5 automatisch via CI/CD:

```
git push master
  → rsync MoPilot_ZEO_Kunden/ → /opt/zeo-kunden/
  → docker compose up -d --build
  → Live unter zeo-kunden.mopilot.website
```

### 6.5 Live-System

| Ort | Pfad / URL |
|-----|------------|
| Lokal | C:\Projekte\MoPilot\MoPilot_ZEO_Kunden\ |
| GitHub | github.com/JamesMz05/mopilot (master) |
| Server | /opt/zeo-kunden/ |
| Frontend | https://zeo-kunden.mopilot.website |
| Backend | https://api.zeo-kunden.mopilot.website/api/health |

---

## 7. Nächstes Sub-Projekt: hotline.mopilot.website

### 7.1 Konzept und Zielgruppe

hotline.mopilot.website ist ein internes Arbeitsmittel für Hotline-Mitarbeiter der ZEO Carsharing Hotline (Vianova eG):

- **Zielgruppe**: Hotline-Mitarbeiter (kein öffentlicher Zugang)
- **Kernfunktion**: KI-Assistent bei eingehenden Anrufen in Echtzeit
- **Wissensquelle**: Vollständige ZEO-Wissensbasis
- **Zusatzfunktionen**: Gesprächsleitfaden, Eskalationspfade, Problemszenarien

### 7.2 Technische Anforderungen

| Anforderung | Beschreibung | Priorität |
|-------------|--------------|-----------|
| Zugangsschutz | Basic Auth (intern) | Hoch |
| Schnelle Antworten | < 3 Sekunden, SSE-Streaming | Hoch |
| Gesprächs-Kontext | Session-Gedächtnis | Hoch |
| Geräteoptimierung | Desktop-Browser (Headset) | Mittel |
| Datenaktualität | JSON-Dateien im Git pflegbar | Mittel |

### 7.3 Entwicklungsschritte

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

### 7.4 Deployment-Checkliste

- [ ] Inhalt: ZEO-Wissensbasis vollständig
- [ ] Inhalt: System-Prompt mit Hotline-Team getestet
- [ ] Technik: DNS-Einträge gesetzt
- [ ] Technik: Traefik-Labels korrekt
- [ ] Technik: ANTHROPIC_API_KEY in .env (separater Key)
- [ ] Technik: `restart: unless-stopped` in docker-compose.yml
- [ ] Technik: CORS auf hotline.mopilot.website beschränkt
- [ ] Technik: CI/CD Workflow um Hotline erweitert
- [ ] Test: Chat mit Beispiel-Anrufszenarien
- [ ] Test: SSL-Zertifikat aktiv
- [ ] Test: `/api/health` positiv
- [ ] Abnahme: Demo mit Hotline-Team

### 7.5 Zeitplan

| Phase | Aufwand | Voraussetzung |
|-------|---------|---------------|
| Inhaltsvorbereitung & Prompt | 0,5 Tage | Abstimmung mit Hotline-Team |
| Projektstruktur & Code | 0,5 Tage | ZEO-Kunden-App als Vorlage |
| Frontend-Entwicklung | 1–2 Tage | UX-Anforderungen bekannt |
| Backend-Anpassung | 0,5 Tage | System-Prompt fertig |
| Deployment & Test | 0,5 Tage | DNS & Server-Zugang |
| **GESAMT** | **3–4 Tage** | |

---

*Erstellt mit Claude Code | v0.5 – 4. März 2026*
*Änderungen gegenüber v0.4: Infrastruktur-Stabilisierung (Kap. 4), CI/CD für ZEO-Kunden (Kap. 3.4), aktualisierte Nächste Schritte*
